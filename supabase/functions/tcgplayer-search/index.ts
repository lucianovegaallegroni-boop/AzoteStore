import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// In-memory caches to minimize latency and respect TCGCSV rate limits
const groupsCache = new Map<number, { data: any[]; expiry: number }>();
const groupDataCache = new Map<string, { products: any[]; prices: Map<number, any>; expiry: number }>();

const GROUPS_TTL_MS = 60 * 60 * 1000; // 1 hour
const GROUP_DATA_TTL_MS = 30 * 60 * 1000; // 30 minutes

function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getCategoryGroups(categoryId: number): Promise<any[]> {
  const cached = groupsCache.get(categoryId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://tcgcsv.com/tcgplayer/${categoryId}/groups`, {
      headers: {
        "User-Agent": "AzoteStore/1.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`Failed to fetch groups for category ${categoryId}: ${res.status}`);
      return cached ? cached.data : [];
    }

    const json = await res.json();
    const groups = json.results || [];
    groupsCache.set(categoryId, {
      data: groups,
      expiry: Date.now() + GROUPS_TTL_MS
    });
    return groups;
  } catch (err) {
    console.error(`Error fetching category ${categoryId} groups:`, err);
    return cached ? cached.data : [];
  }
}

async function getGroupProductsAndPrices(categoryId: number, groupId: number): Promise<{ products: any[]; prices: Map<number, any> }> {
  const cacheKey = `${categoryId}_${groupId}`;
  const cached = groupDataCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached;
  }

  try {
    const [prodsRes, pricesRes] = await Promise.all([
      fetch(`https://tcgcsv.com/tcgplayer/${categoryId}/${groupId}/products`, {
        headers: { "User-Agent": "AzoteStore/1.0", "Accept": "application/json" }
      }),
      fetch(`https://tcgcsv.com/tcgplayer/${categoryId}/${groupId}/prices`, {
        headers: { "User-Agent": "AzoteStore/1.0", "Accept": "application/json" }
      })
    ]);

    let products: any[] = [];
    const prices = new Map<number, any>();

    if (prodsRes.ok) {
      const pJson = await prodsRes.json();
      products = pJson.results || [];
    }

    if (pricesRes.ok) {
      const prJson = await pricesRes.json();
      const prList = prJson.results || [];
      for (const pr of prList) {
        prices.set(pr.productId, pr);
      }
    }

    const result = { products, prices, expiry: Date.now() + GROUP_DATA_TTL_MS };
    groupDataCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Error fetching group ${groupId} data:`, err);
    return { products: [], prices: new Map() };
  }
}

function matchGroup(groups: any[], setName?: string, setCode?: string): any | null {
  if (setCode) {
    const prefix = setCode.split(/[-_\s]/)[0].trim().toUpperCase();
    if (prefix.length >= 2) {
      const byAbbr = groups.find((g: any) => (g.abbreviation || "").trim().toUpperCase() === prefix);
      if (byAbbr) return byAbbr;
    }
  }

  if (setName) {
    const targetNorm = normalizeText(setName);
    // Exact or direct inclusion match
    let match = groups.find((g: any) => normalizeText(g.name) === targetNorm);
    if (match) return match;

    match = groups.find((g: any) => {
      const gNorm = normalizeText(g.name);
      return gNorm.includes(targetNorm) || targetNorm.includes(gNorm);
    });
    if (match) return match;
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { cardName, tcg = "yugioh", targetSetName, targetSetCode, targetRarity, cardSets = [] } = body;

    if (!cardName && !targetSetCode) {
      return new Response(JSON.stringify({ error: "cardName or targetSetCode is required", results: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Map TCG to TCGCSV Category ID
    // 1 = Magic, 2 = YuGiOh, 3 = Pokemon
    let categoryId = 2;
    const cleanTcg = (tcg || "").toLowerCase();
    if (cleanTcg.includes("magic") || cleanTcg.includes("mtg")) {
      categoryId = 1;
    } else if (cleanTcg.includes("pok")) {
      categoryId = 3;
    }

    const groups = await getCategoryGroups(categoryId);
    const matchedGroupIds = new Set<number>();
    const groupMap = new Map<number, any>();

    // 1. Check if user specified a target set / code
    if (targetSetName || targetSetCode) {
      const g = matchGroup(groups, targetSetName, targetSetCode);
      if (g) {
        matchedGroupIds.add(g.groupId);
        groupMap.set(g.groupId, g);
      }
    }

    // 2. Check sets provided from card metadata (e.g. YGOPRODeck card_sets)
    if (Array.isArray(cardSets) && cardSets.length > 0) {
      // Prioritize: if we have targetSetName/targetSetCode, we already added it.
      // Match other sets (limit to top 8 to stay fast)
      for (const s of cardSets) {
        if (matchedGroupIds.size >= 8) break;
        const g = matchGroup(groups, s.setName || s.name, s.setCode || s.code);
        if (g && !matchedGroupIds.has(g.groupId)) {
          matchedGroupIds.add(g.groupId);
          groupMap.set(g.groupId, g);
        }
      }
    }

    // 3. If no groups found yet, try finding groups whose name contains clean cardName (for sealed products/decks)
    if (matchedGroupIds.size === 0 && cardName) {
      const cleanName = normalizeText(cardName);
      for (const g of groups) {
        if (matchedGroupIds.size >= 5) break;
        const gNorm = normalizeText(g.name);
        if (gNorm.includes(cleanName) || cleanName.includes(gNorm)) {
          matchedGroupIds.add(g.groupId);
          groupMap.set(g.groupId, g);
        }
      }
    }

    const results: any[] = [];
    const normCardName = normalizeText(cardName || "");
    const cleanCode = targetSetCode ? targetSetCode.toLowerCase().replace(/[^a-z0-9]/g, "") : null;

    // Fetch data for matched groups in parallel
    const groupFetchPromises = Array.from(matchedGroupIds).map(async (groupId) => {
      const groupInfo = groupMap.get(groupId);
      const { products, prices } = await getGroupProductsAndPrices(categoryId, groupId);

      for (const prod of products) {
        const prodNameNorm = normalizeText(prod.name || prod.cleanName || "");
        
        // Find card number (code) and rarity in extendedData
        let cardCode = "";
        let cardRarity = "";
        if (Array.isArray(prod.extendedData)) {
          for (const ext of prod.extendedData) {
            if (ext.name === "Number") cardCode = ext.value || "";
            if (ext.name === "Rarity") cardRarity = ext.value || "";
          }
        }

        const normProdCode = cardCode.toLowerCase().replace(/[^a-z0-9]/g, "");

        // Check if card matches
        const matchesCode = cleanCode && normProdCode && normProdCode === cleanCode;
        const matchesName = normCardName && (
          prodNameNorm === normCardName ||
          prodNameNorm.startsWith(normCardName) ||
          prodNameNorm.includes(normCardName)
        );

        if (matchesCode || matchesName) {
          const pr = prices.get(prod.productId);
          const marketPrice = typeof pr?.marketPrice === "number" ? pr.marketPrice : 0;
          const lowPrice = typeof pr?.lowPrice === "number" ? pr.lowPrice : 0;
          const midPrice = typeof pr?.midPrice === "number" ? pr.midPrice : 0;
          const directLow = typeof pr?.directLowPrice === "number" ? pr.directLowPrice : 0;

          // Priority: marketPrice > lowPrice > midPrice > directLow
          const effectivePrice = marketPrice > 0 ? marketPrice : (lowPrice > 0 ? lowPrice : (midPrice > 0 ? midPrice : directLow));

          const cleanRarity = cardRarity || (prod.name?.match(/\(([^)]+)\)$/)?.[1] || "Normal");

          results.push({
            productId: prod.productId,
            name: prod.name,
            cleanName: prod.cleanName || prod.name,
            setName: groupInfo?.name || "",
            groupId: groupId,
            code: cardCode || groupInfo?.abbreviation || "",
            rarity: cleanRarity,
            subTypeName: pr?.subTypeName || "Normal",
            marketPrice: effectivePrice,
            rawMarketPrice: marketPrice,
            lowPrice: lowPrice,
            midPrice: midPrice,
            imageUrl: prod.imageUrl || (prod.productId ? `https://tcgplayer-cdn.tcgplayer.com/product/${prod.productId}_200w.jpg` : null),
            source: "TCGCSV (TCGPlayer)"
          });
        }
      }
    });

    await Promise.all(groupFetchPromises);

    // Sort results: prioritize items with valid price > 0, then by exact code or rarity match
    results.sort((a, b) => {
      if (a.marketPrice > 0 && b.marketPrice <= 0) return -1;
      if (b.marketPrice > 0 && a.marketPrice <= 0) return 1;
      return 0;
    });

    return new Response(JSON.stringify({ results, total: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error in tcgplayer-search edge function:", err);
    return new Response(JSON.stringify({ error: err.message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
