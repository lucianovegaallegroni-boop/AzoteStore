/**
 * Servicio para consultar precios de mercado de cartas en TCGPlayer
 * a través de APIs especializadas públicas y gratuitas:
 * - Yu-Gi-Oh!: YGOPRODeck API (trae todas las ediciones, sets y precios diarios de TCGPlayer)
 * - Magic: The Gathering: Scryfall API (trae todas las impresiones/ediciones y precios foil/normal)
 * - Pokémon: Pokémon TCG API (trae todas las cartas, sets y variantes con precios TCGPlayer)
 */

const normalizeText = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isSetMatch = (setA, setB) => {
  if (!setA || !setB) return false;
  const a = normalizeText(setA);
  const b = normalizeText(setB);
  return a === b || a.includes(b) || b.includes(a);
};

export async function fetchCardPriceFromTcgPlayer({ cardName, tcg, setName, rarity }) {
  if (!cardName || !cardName.trim()) {
    throw new Error('Ingresa el nombre de la carta para consultar su precio en TCGPlayer.');
  }

  const cleanName = cardName.trim();
  const cleanTcg = (tcg || '').toLowerCase();

  // 1. Yu-Gi-Oh!
  if (cleanTcg.includes('yu-gi-oh') || cleanTcg.includes('yugioh')) {
    return await fetchYugiohPrices(cleanName, setName, rarity);
  }

  // 2. Magic: The Gathering
  if (cleanTcg.includes('magic')) {
    return await fetchMagicPrices(cleanName, setName, rarity);
  }

  // 3. Pokémon
  if (cleanTcg.includes('pok') || cleanTcg.includes('pokemon')) {
    return await fetchPokemonPrices(cleanName, setName, rarity);
  }

  // 4. Búsqueda automática por descarte
  try {
    return await fetchYugiohPrices(cleanName, setName, rarity);
  } catch (e1) {
    try {
      return await fetchMagicPrices(cleanName, setName, rarity);
    } catch (e2) {
      return await fetchPokemonPrices(cleanName, setName, rarity);
    }
  }
}

export async function searchCardSuggestions({ query, tcg }) {
  if (!query || query.trim().length < 2) return [];
  const cleanQ = query.trim();
  const cleanTcg = (tcg || '').toLowerCase();

  // 1. Yu-Gi-Oh!
  if (cleanTcg.includes('yu-gi-oh') || cleanTcg.includes('yugioh')) {
    // Verificar si coincide con diccionario español
    const lowerNorm = cleanQ.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const translated = spanishToEnglishYugioh[lowerNorm];
    const searchTerm = translated || cleanQ;

    try {
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(searchTerm)}&num=8&offset=0`);
      if (res.ok) {
        const data = await res.json();
        return (data.data || []).slice(0, 8).map(c => ({
          name: c.name,
          sub: c.type || 'Yu-Gi-Oh!',
          image: c.card_images?.[0]?.image_url_small || null
        }));
      }
    } catch (e) {
      // Ignorar error de red en autocompletado
    }
    return [];
  }

  // 2. Magic: The Gathering
  if (cleanTcg.includes('magic')) {
    try {
      const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(cleanQ)}`, {
        headers: { 'User-Agent': 'AzoteStore/1.0', Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return (data.data || []).slice(0, 8).map(name => ({
          name,
          sub: 'Magic: The Gathering',
          image: null
        }));
      }
    } catch (e) {}
    return [];
  }

  // 3. Pokémon
  if (cleanTcg.includes('pok') || cleanTcg.includes('pokemon')) {
    try {
      const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(cleanQ)}`);
      if (res.ok) {
        const data = await res.json();
        const seen = new Set();
        const results = [];
        for (const c of (data || [])) {
          if (c.name && !seen.has(c.name)) {
            seen.add(c.name);
            results.push({
              name: c.name,
              sub: 'Pokémon TCG',
              image: c.image ? `${c.image}/low.webp` : null
            });
            if (results.length >= 8) break;
          }
        }
        return results;
      }
    } catch (e) {}
    return [];
  }

  return [];
}

const spanishToEnglishYugioh = {
  'mago oscuro': 'Dark Magician',
  'maga oscura': 'Dark Magician Girl',
  'chica maga oscura': 'Dark Magician Girl',
  'dragon blanco de ojos azules': 'Blue-Eyes White Dragon',
  'dragon de ojos azules': 'Blue-Eyes White Dragon',
  'dragon negro de ojos rojos': 'Red-Eyes Black Dragon',
  'dragon de ojos rojos': 'Red-Eyes Black Dragon',
  'mago del tiempo': 'Time Wizard',
  'kuriboh': 'Kuriboh',
  'exodia': 'Exodia the Forbidden One',
  'exodia el prohibido': 'Exodia the Forbidden One',
  'slifer el dragon del cielo': 'Slifer the Sky Dragon',
  'obelisco el atormentador': 'Obelisk the Tormentor',
  'dragon alado de ra': 'The Winged Dragon of Ra',
  'monstruo renacido': 'Monster Reborn',
  'fuerza de espejo': 'Mirror Force',
  'fuerza del espejo': 'Mirror Force',
  'olla de la codicia': 'Pot of Greed',
  'polimerizacion': 'Polymerization'
};

/**
 * Consulta Yu-Gi-Oh! vía YGOPRODeck con sanitización inteligente
 */
async function fetchYugiohPrices(cardName, targetSetName, targetRarity) {
  const trimmed = (cardName || '').trim();
  // Limpiar sufijos como " - Edición Especial", " (Holo)", etc.
  const clean = trimmed
    .replace(/\s+[-–—/]\s+.*$/, '')
    .replace(/\s*\(.*?\)/g, '')
    .trim();

  const lowerNorm = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const translated = spanishToEnglishYugioh[lowerNorm];

  const queriesToTry = [];
  if (translated) queriesToTry.push(translated);
  queriesToTry.push(clean);
  if (trimmed !== clean) queriesToTry.push(trimmed);

  const uniqueQueries = [...new Set(queriesToTry.filter(Boolean))];

  let foundCards = null;
  for (const q of uniqueQueries) {
    try {
      const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          foundCards = json.data;
          break;
        }
      }
    } catch (e) {
      // Intentar con siguiente query
    }
  }

  if (!foundCards || foundCards.length === 0) {
    throw new Error(`No se encontró "${cardName}" en Yu-Gi-Oh!. Intenta con el nombre oficial en inglés.`);
  }

  // Priorizar cartas que coincidan exactamente con el nombre (incluyendo variantes de arte)
  const matchingCards = foundCards.filter((c) => {
    const cn = c.name.toLowerCase();
    return (
      cn === clean.toLowerCase() ||
      (translated && cn === translated.toLowerCase()) ||
      cn === trimmed.toLowerCase()
    );
  });
  const cardsToProcess = matchingCards.length > 0 ? matchingCards : [foundCards[0]];
  const primaryCard = cardsToProcess[0];

  const generalMarketPrice = parseFloat(primaryCard.card_prices?.[0]?.tcgplayer_price) || 0;
  const allPrices = [];
  let resolvedPrice = null;
  let resolvedSet = null;
  let resolvedRarity = null;
  let isExactSetMatch = false;
  const seenSetEntries = new Set();

  // 1. Procesar todas las ediciones/sets de la carta (incluyendo todas sus rarezas y sets con precio 0)
  cardsToProcess.forEach((card) => {
    if (card.card_sets && card.card_sets.length > 0) {
      card.card_sets.forEach((s) => {
        const setKey = `${(s.set_code || '').trim()}-${(s.set_rarity || '').trim()}-${(s.set_name || '').trim()}`;
        if (seenSetEntries.has(setKey)) return;
        seenSetEntries.add(setKey);

        const p = parseFloat(s.set_price) || 0;
        const priceVal = p > 0 ? p : (generalMarketPrice > 0 ? generalMarketPrice : 0);
        const matchesTargetSet = targetSetName && isSetMatch(s.set_name, targetSetName);
        const matchesTargetRarity = targetRarity && s.set_rarity && isSetMatch(s.set_rarity, targetRarity);
        const itemImageUrl = card.card_images?.[0]?.image_url || card.card_images?.[0]?.image_url_small || null;

        const item = {
          setName: s.set_name,
          code: s.set_code || '',
          rarity: s.set_rarity || '',
          variant: s.set_rarity ? `Rareza: ${s.set_rarity}` : 'Normal',
          price: priceVal,
          rawPrice: p,
          isEstimate: p <= 0 && generalMarketPrice > 0,
          isMatch: !!matchesTargetSet,
          imageUrl: itemImageUrl
        };
        allPrices.push(item);

        if (matchesTargetSet) {
          if (!resolvedPrice || !isExactSetMatch || matchesTargetRarity) {
            resolvedPrice = priceVal;
            resolvedSet = s.set_name;
            resolvedRarity = s.set_rarity || null;
            isExactSetMatch = true;
          }
        }
      });
    }
  });

  // 2. Si no hubo coincidencia con el set seleccionado o no se especificó set, usar fallback
  if (generalMarketPrice > 0) {
    allPrices.unshift({
      setName: 'Precio Promedio / Mercado',
      code: 'TCGPlayer General',
      rarity: 'Promedio',
      variant: 'General',
      price: generalMarketPrice,
      rawPrice: generalMarketPrice,
      isEstimate: false,
      isMatch: !isExactSetMatch && !targetSetName,
      imageUrl: primaryCard.card_images?.[0]?.image_url || primaryCard.card_images?.[0]?.image_url_small || null
    });

    if (!resolvedPrice) {
      resolvedPrice = generalMarketPrice;
      const firstRealSet = allPrices.find(p => p.setName !== 'Precio Promedio / Mercado');
      resolvedSet = firstRealSet ? firstRealSet.setName : 'Precio General';
      resolvedRarity = firstRealSet ? firstRealSet.rarity : null;
    }
  } else if (!resolvedPrice && allPrices.length > 0) {
    resolvedPrice = allPrices[0].price;
    resolvedSet = allPrices[0].setName;
    resolvedRarity = allPrices[0].rarity || null;
  }

  if (!resolvedPrice && allPrices.length === 0) {
    throw new Error(`Se encontró "${primaryCard.name}" pero TCGPlayer no tiene precios registrados.`);
  }

  return {
    price: resolvedPrice || 0,
    cardName: primaryCard.name,
    matchedSet: resolvedSet,
    rarity: resolvedRarity,
    imageUrl: primaryCard.card_images?.[0]?.image_url || primaryCard.card_images?.[0]?.image_url_small || null,
    isExactSetMatch,
    tcg: 'Yu-Gi-Oh!',
    source: 'TCGPlayer (YGOPRODeck)',
    allPrices
  };
}

/**
 * Consulta Magic: The Gathering vía Scryfall
 */
async function fetchMagicPrices(cardName, targetSetName, targetRarity) {
  // Buscar todas las impresiones/ediciones de esta carta
  const searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`!"${cardName}"`)}&unique=prints&order=released`;
  let res = await fetch(searchUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AzoteStore/1.0'
    }
  });

  if (!res.ok) {
    // Reintento con búsqueda difusa simple
    res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AzoteStore/1.0'
      }
    });
  }

  if (!res.ok) {
    throw new Error(`No se encontró "${cardName}" en Magic: The Gathering. Intenta con el nombre en inglés.`);
  }

  const data = await res.json();
  const prints = data.data && data.data.length > 0 ? data.data : [data];

  const allPrices = [];
  let resolvedPrice = null;
  let resolvedSet = null;
  let resolvedRarity = null;
  let isExactSetMatch = false;

  // Encontrar primer precio general válido como fallback
  let firstValidPrice = 0;
  for (const c of prints) {
    const usd = parseFloat(c.prices?.usd) || 0;
    const usdFoil = parseFloat(c.prices?.usd_foil) || 0;
    const usdEtched = parseFloat(c.prices?.usd_etched) || 0;
    if (usd > 0) { firstValidPrice = usd; break; }
    if (usdFoil > 0) { firstValidPrice = usdFoil; break; }
    if (usdEtched > 0) { firstValidPrice = usdEtched; break; }
  }

  prints.forEach((card) => {
    const usd = parseFloat(card.prices?.usd) || 0;
    const usdFoil = parseFloat(card.prices?.usd_foil) || 0;
    const usdEtched = parseFloat(card.prices?.usd_etched) || 0;
    const eur = parseFloat(card.prices?.eur) || 0;
    const matchesTargetSet = targetSetName && isSetMatch(card.set_name, targetSetName);
    const rawRarity = card.rarity || '';
    const formattedRarity = rawRarity ? (rawRarity.charAt(0).toUpperCase() + rawRarity.slice(1).toLowerCase()) : '';
    const matchesTargetRarity = targetRarity && isSetMatch(formattedRarity, targetRarity);

    const cardImageUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.small || null;
    const fallbackPrice = firstValidPrice > 0 ? firstValidPrice : (eur > 0 ? parseFloat((eur * 1.08).toFixed(2)) : 0);

    // Normal
    const normalPrice = usd > 0 ? usd : (usdFoil > 0 ? usdFoil : fallbackPrice);
    allPrices.push({
      setName: card.set_name,
      code: (card.set || '').toUpperCase(),
      rarity: formattedRarity,
      variant: 'Normal',
      price: normalPrice,
      rawPrice: usd,
      isEstimate: usd <= 0 && normalPrice > 0,
      isMatch: !!matchesTargetSet,
      imageUrl: cardImageUrl
    });

    if (matchesTargetSet && (!resolvedPrice || !isExactSetMatch || matchesTargetRarity)) {
      resolvedPrice = normalPrice;
      resolvedSet = card.set_name;
      resolvedRarity = formattedRarity;
      isExactSetMatch = true;
    }

    // Foil si existe precio foil o el print es foil
    if (usdFoil > 0 || card.foil) {
      const foilPrice = usdFoil > 0 ? usdFoil : (usd > 0 ? usd : fallbackPrice);
      allPrices.push({
        setName: card.set_name,
        code: (card.set || '').toUpperCase(),
        rarity: formattedRarity,
        variant: 'Foil',
        price: foilPrice,
        rawPrice: usdFoil,
        isEstimate: usdFoil <= 0 && foilPrice > 0,
        isMatch: !!matchesTargetSet,
        imageUrl: cardImageUrl
      });

      if (matchesTargetSet && (!resolvedPrice || !isExactSetMatch || matchesTargetRarity)) {
        resolvedPrice = foilPrice;
        resolvedSet = `${card.set_name} (Foil)`;
        resolvedRarity = formattedRarity;
        isExactSetMatch = true;
      }
    }

    // Etched Foil
    if (usdEtched > 0) {
      allPrices.push({
        setName: card.set_name,
        code: (card.set || '').toUpperCase(),
        rarity: formattedRarity,
        variant: 'Etched Foil',
        price: usdEtched,
        rawPrice: usdEtched,
        isEstimate: false,
        isMatch: !!matchesTargetSet,
        imageUrl: cardImageUrl
      });
    }
  });

  if (!resolvedPrice && allPrices.length > 0) {
    resolvedPrice = allPrices[0].price;
    resolvedSet = allPrices[0].setName;
    resolvedRarity = allPrices[0].rarity || null;
  }

  return {
    price: resolvedPrice || 0,
    cardName: prints[0].name,
    matchedSet: resolvedSet,
    rarity: resolvedRarity,
    imageUrl: prints[0].image_uris?.normal || prints[0].image_uris?.large || prints[0].image_uris?.small || null,
    isExactSetMatch,
    tcg: 'Magic: The Gathering',
    source: 'TCGPlayer (Scryfall)',
    allPrices
  };
}

/**
 * Consulta Pokémon vía Pokémon TCG API y TCGdex
 */
async function fetchPokemonPrices(cardName, targetSetName, targetRarity) {
  const cleanQ = (cardName || '').replace(/["*]/g, '').trim();
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:"${cleanQ}"`)}&pageSize=250`;
  let cards = [];

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AzoteStore/1.0'
      }
    });

    if (res.ok) {
      const data = await res.json();
      cards = data.data || [];
    }
  } catch (e) {
    console.warn('Error consultando pokemontcg.io, probando alternativas:', e);
  }

  // Fallback con búsqueda difusa si no trajo cartas con comillas exactas
  if (cards.length === 0) {
    try {
      const fuzzyUrl = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:${cleanQ}*`)}&pageSize=250`;
      const res = await fetch(fuzzyUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'AzoteStore/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        cards = data.data || [];
      }
    } catch (e) {}
  }

  if (cards.length === 0) {
    throw new Error(`No se encontró "${cardName}" en Pokémon TCG. Intenta con el nombre oficial en inglés.`);
  }

  const allPrices = [];
  let resolvedPrice = null;
  let resolvedSet = null;
  let resolvedRarity = null;
  let isExactSetMatch = false;

  const variants = [
    { key: 'normal', label: 'Normal' },
    { key: 'holofoil', label: 'Holofoil' },
    { key: 'reverseHolofoil', label: 'Reverse Holo' },
    { key: 'unlimitedHolofoil', label: 'Unlimited Holo' },
    { key: '1stEditionHolofoil', label: '1st Edition Holo' }
  ];

  cards.forEach((card) => {
    const p = card.tcgplayer?.prices;
    const setName = card.set?.name || 'Desconocido';
    const matchesTargetSet = targetSetName && isSetMatch(setName, targetSetName);
    const cardNum = card.number ? `#${card.number}` : '';
    const formattedRarity = card.rarity || 'Common';
    const matchesTargetRarity = targetRarity && isSetMatch(formattedRarity, targetRarity);
    const cardImageUrl = card.images?.large || card.images?.small || null;

    let addedForCard = false;
    if (p) {
      variants.forEach((v) => {
        const priceVal = parseFloat(p[v.key]?.market || p[v.key]?.mid || 0);
        if (priceVal > 0) {
          addedForCard = true;
          allPrices.push({
            setName: `${setName} ${cardNum}`.trim(),
            code: card.set?.series || '',
            rarity: formattedRarity,
            variant: v.label,
            price: priceVal,
            rawPrice: priceVal,
            isEstimate: false,
            isMatch: !!matchesTargetSet,
            imageUrl: cardImageUrl
          });

          if (matchesTargetSet && (!resolvedPrice || !isExactSetMatch || matchesTargetRarity)) {
            resolvedPrice = priceVal;
            resolvedSet = `${setName} (${v.label})`;
            resolvedRarity = formattedRarity;
            isExactSetMatch = true;
          }
        }
      });
    }

    // Si la carta no tenía precios en variantes, agregarla para conservar el set y la rareza
    if (!addedForCard) {
      allPrices.push({
        setName: `${setName} ${cardNum}`.trim(),
        code: card.set?.series || '',
        rarity: formattedRarity,
        variant: 'Normal',
        price: 0,
        rawPrice: 0,
        isEstimate: true,
        isMatch: !!matchesTargetSet,
        imageUrl: cardImageUrl
      });

      if (matchesTargetSet && (!resolvedPrice || !isExactSetMatch)) {
        resolvedPrice = 0;
        resolvedSet = setName;
        resolvedRarity = formattedRarity;
        isExactSetMatch = true;
      }
    }
  });

  if (!resolvedPrice && allPrices.length > 0) {
    const firstWithPrice = allPrices.find(p => p.price > 0);
    resolvedPrice = firstWithPrice ? firstWithPrice.price : allPrices[0].price;
    resolvedSet = firstWithPrice ? firstWithPrice.setName : allPrices[0].setName;
    resolvedRarity = firstWithPrice ? firstWithPrice.rarity : allPrices[0].rarity;
  }

  return {
    price: resolvedPrice || 0,
    cardName: cards[0].name,
    matchedSet: resolvedSet,
    rarity: resolvedRarity,
    imageUrl: cards[0].images?.large || cards[0].images?.small || null,
    isExactSetMatch,
    tcg: 'Pokémon',
    source: 'TCGPlayer (Pokémon TCG)',
    allPrices
  };
}
