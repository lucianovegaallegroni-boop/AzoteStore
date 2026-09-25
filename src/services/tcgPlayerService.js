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

export async function fetchCardPriceFromTcgPlayer({ cardName, tcg, setName }) {
  if (!cardName || !cardName.trim()) {
    throw new Error('Ingresa el nombre de la carta para consultar su precio en TCGPlayer.');
  }

  const cleanName = cardName.trim();
  const cleanTcg = (tcg || '').toLowerCase();

  // 1. Yu-Gi-Oh!
  if (cleanTcg.includes('yu-gi-oh') || cleanTcg.includes('yugioh')) {
    return await fetchYugiohPrices(cleanName, setName);
  }

  // 2. Magic: The Gathering
  if (cleanTcg.includes('magic')) {
    return await fetchMagicPrices(cleanName, setName);
  }

  // 3. Pokémon
  if (cleanTcg.includes('pok') || cleanTcg.includes('pokemon')) {
    return await fetchPokemonPrices(cleanName, setName);
  }

  // 4. Búsqueda automática por descarte
  try {
    return await fetchYugiohPrices(cleanName, setName);
  } catch (e1) {
    try {
      return await fetchMagicPrices(cleanName, setName);
    } catch (e2) {
      return await fetchPokemonPrices(cleanName, setName);
    }
  }
}

/**
 * Consulta Yu-Gi-Oh! vía YGOPRODeck
 */
async function fetchYugiohPrices(cardName, targetSetName) {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se encontró "${cardName}" en Yu-Gi-Oh!. Intenta con el nombre oficial en inglés.`);
  }
  const data = await res.json();
  const card = data.data?.[0];
  if (!card) {
    throw new Error(`Sin resultados para "${cardName}" en Yu-Gi-Oh!.`);
  }

  const allPrices = [];
  let resolvedPrice = null;
  let resolvedSet = null;
  let isExactSetMatch = false;

  // 1. Procesar todas las ediciones/sets de la carta
  if (card.card_sets && card.card_sets.length > 0) {
    card.card_sets.forEach((s) => {
      const p = parseFloat(s.set_price) || 0;
      if (p > 0) {
        const matchesTarget = targetSetName && isSetMatch(s.set_name, targetSetName);
        const item = {
          setName: s.set_name,
          code: s.set_code || '',
          rarity: s.set_rarity || '',
          variant: s.set_rarity ? `Rareza: ${s.set_rarity}` : 'Normal',
          price: p,
          isMatch: !!matchesTarget
        };
        allPrices.push(item);

        if (matchesTarget && !isExactSetMatch) {
          resolvedPrice = p;
          resolvedSet = s.set_name;
          isExactSetMatch = true;
        }
      }
    });
  }

  // 2. Si no hubo coincidencia con el set seleccionado o no se especificó set, usar fallback
  const generalMarketPrice = parseFloat(card.card_prices?.[0]?.tcgplayer_price) || 0;
  if (generalMarketPrice > 0) {
    allPrices.unshift({
      setName: 'Precio Promedio / Mercado',
      code: 'TCGPlayer General',
      rarity: 'Promedio',
      variant: 'General',
      price: generalMarketPrice,
      isMatch: !isExactSetMatch && !targetSetName
    });

    if (!resolvedPrice) {
      resolvedPrice = generalMarketPrice;
      resolvedSet = card.card_sets?.[0]?.set_name || 'Precio General';
    }
  } else if (!resolvedPrice && allPrices.length > 0) {
    resolvedPrice = allPrices[0].price;
    resolvedSet = allPrices[0].setName;
  }

  if (!resolvedPrice || resolvedPrice <= 0) {
    throw new Error(`Se encontró "${card.name}" pero TCGPlayer no tiene precios registrados.`);
  }

  return {
    price: resolvedPrice,
    cardName: card.name,
    matchedSet: resolvedSet,
    isExactSetMatch,
    tcg: 'Yu-Gi-Oh!',
    source: 'TCGPlayer (YGOPRODeck)',
    allPrices
  };
}

/**
 * Consulta Magic: The Gathering vía Scryfall
 */
async function fetchMagicPrices(cardName, targetSetName) {
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
  let isExactSetMatch = false;

  prints.forEach((card) => {
    const usd = parseFloat(card.prices?.usd) || 0;
    const usdFoil = parseFloat(card.prices?.usd_foil) || 0;
    const usdEtched = parseFloat(card.prices?.usd_etched) || 0;
    const matchesTarget = targetSetName && isSetMatch(card.set_name, targetSetName);

    if (usd > 0) {
      allPrices.push({
        setName: card.set_name,
        code: (card.set || '').toUpperCase(),
        rarity: card.rarity || '',
        variant: 'Normal',
        price: usd,
        isMatch: !!matchesTarget
      });
      if (matchesTarget && !resolvedPrice) {
        resolvedPrice = usd;
        resolvedSet = card.set_name;
        isExactSetMatch = true;
      }
    }

    if (usdFoil > 0) {
      allPrices.push({
        setName: card.set_name,
        code: (card.set || '').toUpperCase(),
        rarity: card.rarity || '',
        variant: 'Foil',
        price: usdFoil,
        isMatch: !!matchesTarget && !resolvedPrice
      });
      if (matchesTarget && !resolvedPrice) {
        resolvedPrice = usdFoil;
        resolvedSet = `${card.set_name} (Foil)`;
        isExactSetMatch = true;
      }
    }

    if (usdEtched > 0) {
      allPrices.push({
        setName: card.set_name,
        code: (card.set || '').toUpperCase(),
        rarity: card.rarity || '',
        variant: 'Etched Foil',
        price: usdEtched,
        isMatch: !!matchesTarget && !resolvedPrice
      });
    }
  });

  if (!resolvedPrice && allPrices.length > 0) {
    resolvedPrice = allPrices[0].price;
    resolvedSet = allPrices[0].setName;
  }

  if (!resolvedPrice || resolvedPrice <= 0) {
    throw new Error(`"${prints[0].name}" no tiene precio registrado en TCGPlayer.`);
  }

  return {
    price: resolvedPrice,
    cardName: prints[0].name,
    matchedSet: resolvedSet,
    isExactSetMatch,
    tcg: 'Magic: The Gathering',
    source: 'TCGPlayer (Scryfall)',
    allPrices
  };
}

/**
 * Consulta Pokémon vía Pokémon TCG API
 */
async function fetchPokemonPrices(cardName, targetSetName) {
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:${cardName}`)}&pageSize=50`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AzoteStore/1.0'
    }
  });

  if (!res.ok) {
    throw new Error(`Error consultando Pokémon TCG API para "${cardName}".`);
  }

  const data = await res.json();
  const cards = data.data || [];
  if (cards.length === 0) {
    throw new Error(`No se encontró "${cardName}" en Pokémon TCG. Intenta con el nombre en inglés.`);
  }

  const allPrices = [];
  let resolvedPrice = null;
  let resolvedSet = null;
  let isExactSetMatch = false;

  cards.forEach((card) => {
    const p = card.tcgplayer?.prices;
    if (!p) return;

    const setName = card.set?.name || 'Desconocido';
    const matchesTarget = targetSetName && isSetMatch(setName, targetSetName);
    const cardNum = card.number ? `#${card.number}` : '';

    const variants = [
      { key: 'normal', label: 'Normal' },
      { key: 'holofoil', label: 'Holofoil' },
      { key: 'reverseHolofoil', label: 'Reverse Holo' },
      { key: 'unlimitedHolofoil', label: 'Unlimited Holo' },
      { key: '1stEditionHolofoil', label: '1st Edition Holo' }
    ];

    variants.forEach((v) => {
      const priceVal = parseFloat(p[v.key]?.market || p[v.key]?.mid || 0);
      if (priceVal > 0) {
        allPrices.push({
          setName: `${setName} ${cardNum}`.trim(),
          code: card.set?.series || '',
          rarity: card.rarity || '',
          variant: v.label,
          price: priceVal,
          isMatch: !!matchesTarget
        });

        if (matchesTarget && !resolvedPrice) {
          resolvedPrice = priceVal;
          resolvedSet = `${setName} (${v.label})`;
          isExactSetMatch = true;
        }
      }
    });
  });

  if (!resolvedPrice && allPrices.length > 0) {
    resolvedPrice = allPrices[0].price;
    resolvedSet = allPrices[0].setName;
  }

  if (!resolvedPrice || resolvedPrice <= 0) {
    throw new Error(`No se encontraron precios en TCGPlayer para "${cards[0].name}".`);
  }

  return {
    price: resolvedPrice,
    cardName: cards[0].name,
    matchedSet: resolvedSet,
    isExactSetMatch,
    tcg: 'Pokémon',
    source: 'TCGPlayer (Pokémon TCG)',
    allPrices
  };
}
