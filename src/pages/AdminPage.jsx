import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';
import { fetchCardPriceFromTcgPlayer, searchCardSuggestions } from '../services/tcgPlayerService';

const categoryOptions = [
  { value: "Sleeve", label: "Sleeve" },
  { value: "TCG", label: "TCG" },
  { value: "Producto Sellado", label: "Producto Sellado" }
];

const defaultTcgOptions = [
  { value: "Yu-Gi-Oh!", label: "Yu-Gi-Oh!" },
  { value: "Pokémon", label: "Pokémon" },
  { value: "Magic: The Gathering", label: "Magic: The Gathering" },
  { value: "One Piece", label: "One Piece" },
  { value: "Dragon Ball Super", label: "Dragon Ball Super" },
  { value: "Lorcana", label: "Disney Lorcana" },
  { value: "Digimon", label: "Digimon Card Game" },
  { value: "Star Wars: Unlimited", label: "Star Wars: Unlimited" },
  { value: "Otro TCG", label: "Otro TCG" }
];

const defaultTcgSetsMap = {
  "Yu-Gi-Oh!": [
    { value: "Rarity Collection", label: "25th Anniversary Rarity Collection" },
    { value: "Legacy of Destruction", label: "Legacy of Destruction (LEDE)" },
    { value: "Phantom Nightmare", label: "Phantom Nightmare (PHNI)" },
    { value: "Age of Overlord", label: "Age of Overlord (AGOV)" },
    { value: "Duelist Nexus", label: "Duelist Nexus (DUNE)" },
    { value: "Cyberstorm Access", label: "Cyberstorm Access (CYAC)" },
    { value: "Battles of Legend", label: "Battles of Legend" },
    { value: "Tin of the Pharaoh's Gods", label: "Mega-Tins / Promo Sets" },
    { value: "Retro Pack / Clásico", label: "Retro Packs / Vintage" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Pokémon": [
    { value: "Prismatic Evolutions", label: "Scarlet & Violet: Prismatic Evolutions" },
    { value: "Surging Sparks", label: "Scarlet & Violet: Surging Sparks" },
    { value: "Stellar Crown", label: "Scarlet & Violet: Stellar Crown" },
    { value: "Shrouded Fable", label: "Scarlet & Violet: Shrouded Fable" },
    { value: "Twilight Masquerade", label: "Scarlet & Violet: Twilight Masquerade" },
    { value: "Temporal Forces", label: "Scarlet & Violet: Temporal Forces" },
    { value: "Paldean Fates", label: "Scarlet & Violet: Paldean Fates" },
    { value: "151", label: "Scarlet & Violet: 151" },
    { value: "Crown Zenith", label: "Sword & Shield: Crown Zenith" },
    { value: "Vintage / Clásico", label: "Vintage / Sets Clásicos" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Magic: The Gathering": [
    { value: "Aetherdrift", label: "Aetherdrift" },
    { value: "Foundations", label: "Foundations" },
    { value: "Duskmourn: House of Horror", label: "Duskmourn: House of Horror" },
    { value: "Bloomburrow", label: "Bloomburrow" },
    { value: "Modern Horizons 3", label: "Modern Horizons 3" },
    { value: "Outlaws of Thunder Junction", label: "Outlaws of Thunder Junction" },
    { value: "Murders at Karlov Manor", label: "Murders at Karlov Manor" },
    { value: "The Lost Caverns of Ixalan", label: "The Lost Caverns of Ixalan" },
    { value: "Commander Masters", label: "Commander Masters" },
    { value: "Universes Beyond", label: "Universes Beyond" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "One Piece": [
    { value: "OP-01 Romance Dawn", label: "OP-01 Romance Dawn" },
    { value: "OP-02 Paramount War", label: "OP-02 Paramount War" },
    { value: "OP-03 Pillars of Strength", label: "OP-03 Pillars of Strength" },
    { value: "OP-04 Kingdoms of Intrigue", label: "OP-04 Kingdoms of Intrigue" },
    { value: "OP-05 Awakening of the New Era", label: "OP-05 Awakening of the New Era" },
    { value: "OP-06 Wings of the Captain", label: "OP-06 Wings of the Captain" },
    { value: "OP-07 500 Years in the Future", label: "OP-07 500 Years in the Future" },
    { value: "OP-08 Two Legends", label: "OP-08 Two Legends" },
    { value: "OP-09 The Four Emperors", label: "OP-09 The Four Emperors" },
    { value: "EB-01 Memorial Collection", label: "EB-01 Memorial Collection" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Lorcana": [
    { value: "The First Chapter", label: "The First Chapter" },
    { value: "Rise of the Floodborn", label: "Rise of the Floodborn" },
    { value: "Into the Inklands", label: "Into the Inklands" },
    { value: "Ursula's Return", label: "Ursula's Return" },
    { value: "Shimmering Skies", label: "Shimmering Skies" },
    { value: "Azurite Sea", label: "Azurite Sea" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Dragon Ball Super": [
    { value: "Fusion World FB01", label: "Fusion World: Awakened Pulse (FB01)" },
    { value: "Fusion World FB02", label: "Fusion World: Blazing Aura (FB02)" },
    { value: "Fusion World FB03", label: "Fusion World: Raging Roar (FB03)" },
    { value: "Fusion World FB04", label: "Fusion World: Ultra Limit (FB04)" },
    { value: "Masters Series", label: "DBS Masters Series" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Digimon": [
    { value: "BT-16 Beginning Observer", label: "BT-16 Beginning Observer" },
    { value: "BT-17 Secret Crisis", label: "BT-17 Secret Crisis" },
    { value: "BT-18 Element Successor", label: "BT-18 Element Successor" },
    { value: "EX-07 Digimon Liberator", label: "EX-07 Digimon Liberator" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Star Wars: Unlimited": [
    { value: "Spark of Rebellion", label: "Spark of Rebellion (SOR)" },
    { value: "Shadows of the Galaxy", label: "Shadows of the Galaxy (SHD)" },
    { value: "Twilight of the Republic", label: "Twilight of the Republic (TWI)" },
    { value: "Otro Set", label: "Otro Set / Expansión" }
  ],
  "Otro TCG": [
    { value: "General", label: "General / Base Set" },
    { value: "Promocional", label: "Promocional" },
    { value: "Edición Especial", label: "Edición Especial" },
    { value: "Otro Set", label: "Otro Set" }
  ]
};

const restockCategoryOptions = [
  { value: "", label: "Todas las Categorías" },
  { value: "sleeve", label: "Sleeve" },
  { value: "tcg", label: "TCG" },
  { value: "producto-sellado", label: "Producto Sellado" }
];

const orderStatusOptions = [
  { value: "Realizado", label: "🛍️ Realizado" },
  { value: "Entregado", label: "🏪 Entregado" },
  { value: "Cancelado", label: "❌ Cancelado" }
];

export default function AdminPage({ products: initialProducts, onCreateProduct, onUpdateStock, orders = [], setOrders }) {
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Sync Supabase products on mount or reloadTrigger change
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        // Fetch products and their variants
        const { data: prods, error: pErr } = await supabase
          .from('products')
          .select('id, name, price, description, image, category, stock, featured, division, tcg, set_name, rarity, auto_sync_price, last_price_sync, product_variants(id, product_id, title, price, stock, image)');

        if (pErr) throw pErr;

        if (prods) {
          // Format them like the local items so components work seamlessly
          const formatted = prods.map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            description: p.description,
            image: p.image,
            category: p.category,
            categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
            tcg: p.tcg || null,
            setName: p.set_name || null,
            rarity: p.rarity || null,
            auto_sync_price: p.auto_sync_price !== false,
            last_price_sync: p.last_price_sync || null,
            inStock: p.stock > 0,
            featured: !!p.featured,
            division: p.division,
            specifications: {
              Stock: String(p.stock),
              Category: p.category,
              ...(p.tcg ? { TCG: p.tcg } : {}),
              ...(p.set_name ? { Set: p.set_name } : {}),
              ...(p.rarity ? { Rareza: p.rarity } : {}),
              Status: p.stock > 0 ? 'Disponible' : 'Agotado'
            },
            colors: p.product_variants && p.product_variants.length > 0 ? p.product_variants.map(v => ({
              id: v.id,
              name: v.title,
              hex: '#888888',
              image: v.image,
              stock: v.stock,
              inStock: v.stock > 0,
              price: parseFloat(v.price || p.price)
            })) : null
          }));
          setDbProducts(formatted);

          // Store initial snapshot of featured and division states
          const origMap = {};
          formatted.forEach(p => {
            origMap[p.id] = {
              featured: !!p.featured,
              division: p.division || null
            };
          });
          setOriginalFeaturedState(origMap);
        }

        // Fetch orders from Supabase
        const { data: dbOrders, error: oErr } = await supabase
          .from('orders')
          .select('*, order_items(*)');

        if (!oErr && dbOrders) {
          const formattedOrders = dbOrders.map(o => ({
            id: o.id,
            date: new Date(o.date).toLocaleString('es-ES'),
            dateRaw: o.date,
            clientName: o.client_name,
            clientEmail: o.client_email,
            clientPhone: o.client_phone,
            total: parseFloat(o.total),
            pickupLocation: o.pickup_location,
            paymentProofName: o.payment_proof_name,
            paymentProofPreview: o.payment_proof_preview,
            status: o.status,
            items: o.order_items ? o.order_items.map(oi => ({
              product: {
                id: oi.product_id,
                name: oi.product_name,
                price: parseFloat(oi.price)
              },
              quantity: oi.quantity,
              color: oi.color_id ? {
                id: oi.color_id,
                name: oi.color_name
              } : null
            })) : []
          }));
          // Sort by date descending (newest first)
          formattedOrders.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error('Error fetching from Supabase:', err);
      } finally {
        setLoadingDb(false);
      }
    })();
  }, [reloadTrigger]);

  const triggerReload = () => setReloadTrigger(prev => prev + 1);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sleeve');
  const [tcg, setTcg] = useState('Yu-Gi-Oh!');
  const [setNameVal, setSetNameVal] = useState('');
  const [rarity, setRarity] = useState('');
  const [customSetInput, setCustomSetInput] = useState('');

  // TCGPlayer price lookup states
  const [isFetchingTcgPrice, setIsFetchingTcgPrice] = useState(false);
  const [tcgPriceStatus, setTcgPriceStatus] = useState(null);
  const [priceSearchFilter, setPriceSearchFilter] = useState('');
  const [autoSyncPrice, setAutoSyncPrice] = useState(true);
  const [isSyncingAllPrices, setIsSyncingAllPrices] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState(null);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncResultModal, setSyncResultModal] = useState(null);

  // Autocomplete states for card name
  const [cardSuggestions, setCardSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsBoxRef = React.useRef(null);

  // Debounced search for card name suggestions
  useEffect(() => {
    if (!['TCG', 'Carta', 'Producto Sellado'].includes(category)) {
      setCardSuggestions([]);
      return;
    }

    if (!name || name.trim().length < 2) {
      setCardSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await searchCardSuggestions({ query: name, tcg });
        setCardSuggestions(results);
      } catch (err) {
        console.warn('Error fetching card suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [name, tcg, category]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFetchTcgPlayerPrice = async (targetCardName = null) => {
    const queryCardName = (targetCardName || name || '').trim();
    if (!queryCardName) {
      setTcgPriceStatus({
        type: 'error',
        message: 'Escribe el nombre de la carta para consultar su precio en TCGPlayer.'
      });
      return;
    }

    setIsFetchingTcgPrice(true);
    setTcgPriceStatus(null);
    setShowSuggestions(false);

    try {
      setPriceSearchFilter('');
      const result = await fetchCardPriceFromTcgPlayer({
        cardName: queryCardName,
        tcg,
        setName: setNameVal,
        rarity: rarity
      });

      if (result.price > 0 || (result.allPrices && result.allPrices.length > 0)) {
        if (result.price > 0) {
          setPrice(result.price.toFixed(2));
        }
        if (result.matchedSet && result.matchedSet !== 'Precio General' && result.matchedSet !== 'Precio Promedio / Mercado') {
          setSetNameVal(result.matchedSet);
        }
        if (result.rarity) {
          setRarity(result.rarity);
        }
        if (result.imageUrl && !imageFile) {
          setImagePreview(result.imageUrl);
        }
        setTcgPriceStatus({
          type: 'success',
          message: result.isExactSetMatch
            ? `Precio exacto para el set "${result.matchedSet}": $${result.price.toFixed(2)} USD`
            : `Precio sugerido: $${result.price.toFixed(2)} USD (${result.cardName}${result.matchedSet ? ` • ${result.matchedSet}` : ''})`,
          isExactSetMatch: result.isExactSetMatch,
          matchedSet: result.matchedSet,
          allPrices: result.allPrices || [],
          cardName: result.cardName,
          imageUrl: result.imageUrl
        });
      } else {
        setTcgPriceStatus({
          type: 'error',
          message: 'No se encontró un precio de mercado válido para esta carta.'
        });
      }
    } catch (err) {
      setTcgPriceStatus({
        type: 'error',
        message: err.message || 'Error consultando precio en TCGPlayer.'
      });
    } finally {
      setIsFetchingTcgPrice(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setName(suggestion.name);
    setShowSuggestions(false);
    if (suggestion.image && !imageFile) {
      setImagePreview(suggestion.image);
    }
    // Consultar precio y detalles automáticamente para la carta seleccionada
    handleFetchTcgPlayerPrice(suggestion.name);
  };

  // Dynamic TCGs states
  const [dbTcgs, setDbTcgs] = useState([]);
  const [isAddingNewTcg, setIsAddingNewTcg] = useState(false);
  const [newTcgNameInput, setNewTcgNameInput] = useState('');
  const [isEditingTcg, setIsEditingTcg] = useState(false);
  const [editingTcgNameInput, setEditingTcgNameInput] = useState('');
  const [isSavingTcg, setIsSavingTcg] = useState(false);
  const [isManageTcgsModalOpen, setIsManageTcgsModalOpen] = useState(false);
  const [modalEditingTcgId, setModalEditingTcgId] = useState(null);
  const [modalEditingTcgName, setModalEditingTcgName] = useState('');
  const [modalNewTcgName, setModalNewTcgName] = useState('');

  // Dynamic TCG Sets states
  const [dbTcgSets, setDbTcgSets] = useState([]);
  const [isAddingNewSet, setIsAddingNewSet] = useState(false);
  const [newSetNameInput, setNewSetNameInput] = useState('');
  const [isEditingSet, setIsEditingSet] = useState(false);
  const [editingSetNameInput, setEditingSetNameInput] = useState('');
  const [isSavingSet, setIsSavingSet] = useState(false);
  const [isManageSetsModalOpen, setIsManageSetsModalOpen] = useState(false);
  const [modalEditingSetId, setModalEditingSetId] = useState(null);
  const [modalEditingSetName, setModalEditingSetName] = useState('');
  const [modalNewSetName, setModalNewSetName] = useState('');

  // Fetch TCGs from Supabase
  const loadTcgs = async () => {
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase
        .from('tcg_games')
        .select('id, name')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        setDbTcgs(data);
      }
    } catch (err) {
      console.warn('Error cargando tcg_games:', err);
    }
  };

  // Fetch TCG sets from Supabase
  const loadTcgSets = async () => {
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase
        .from('tcg_sets')
        .select('id, tcg, name')
        .order('name', { ascending: true });

      if (!error && data) {
        setDbTcgSets(data);
      }
    } catch (err) {
      console.warn('Error cargando tcg_sets:', err);
    }
  };

  useEffect(() => {
    loadTcgs();
    loadTcgSets();
  }, [reloadTrigger]);

  const currentTcgsList = React.useMemo(() => {
    if (dbTcgs.length > 0) return dbTcgs;
    return defaultTcgOptions.map((item, idx) => ({
      id: `default-tcg-${idx}`,
      name: item.value
    }));
  }, [dbTcgs]);

  const dynamicTcgOptions = React.useMemo(() => {
    const opts = [];
    if (tcg && !currentTcgsList.some(item => item.name === tcg)) {
      opts.push({ value: tcg, label: tcg });
    }
    currentTcgsList.forEach(item => {
      if (!opts.some(o => o.value === item.name)) {
        opts.push({ value: item.name, label: item.name });
      }
    });
    return opts;
  }, [currentTcgsList, tcg]);

  const currentSetsForTcg = React.useMemo(() => {
    const fromDb = dbTcgSets.filter(s => s.tcg === tcg);
    if (fromDb.length > 0) return fromDb;
    const defaults = defaultTcgSetsMap[tcg] || [];
    return defaults.map((item, idx) => ({
      id: `default-${idx}`,
      tcg,
      name: typeof item === 'string' ? item : (item.label || item.value)
    }));
  }, [dbTcgSets, tcg]);

  // Sets disponibles: extraídos de los resultados del API de TCGPlayer si se ha consultado, sino del TCG seleccionado
  const setDropdownOptions = React.useMemo(() => {
    const opts = [];
    const seen = new Set();

    // 1. Si la API trajo ediciones/precios, los sets provienen directamente de la API
    if (tcgPriceStatus?.allPrices && tcgPriceStatus.allPrices.length > 0) {
      tcgPriceStatus.allPrices.forEach(item => {
        if (item.setName && item.setName !== 'Precio Promedio / Mercado' && !seen.has(item.setName)) {
          seen.add(item.setName);
          opts.push({
            value: item.setName,
            label: item.code ? `${item.setName} (${item.code})` : item.setName
          });
        }
      });
    }

    // 2. Si no hay resultados de la API aún, usar los sets registrados para el TCG
    if (opts.length === 0) {
      currentSetsForTcg.forEach(s => {
        if (!seen.has(s.name)) {
          seen.add(s.name);
          opts.push({ value: s.name, label: s.name });
        }
      });
    }

    // 3. Asegurar que el set actualmente seleccionado esté en las opciones
    if (setNameVal && !seen.has(setNameVal)) {
      opts.unshift({ value: setNameVal, label: setNameVal });
    }

    return opts;
  }, [tcgPriceStatus, currentSetsForTcg, setNameVal]);

  // Rarezas disponibles: extraídas de los resultados del API de TCGPlayer si se ha consultado
  const rarityDropdownOptions = React.useMemo(() => {
    const opts = [];
    const seen = new Set();

    if (tcgPriceStatus?.allPrices && tcgPriceStatus.allPrices.length > 0) {
      tcgPriceStatus.allPrices.forEach(item => {
        const r = item.rarity?.trim();
        if (r && r !== 'Promedio' && !/^\d+$/.test(r) && !seen.has(r.toLowerCase())) {
          seen.add(r.toLowerCase());
          opts.push({ value: r, label: r });
        }
      });
    }

    // Si aún no se ha consultado la API o no arrojó rarezas, proveer rarezas comunes
    if (opts.length === 0) {
      const defaultRarities = [
        'Common',
        'Rare',
        'Super Rare',
        'Ultra Rare',
        'Secret Rare',
        'Prismatic Secret Rare',
        'Quarter Century Secret Rare',
        'Starlight Rare',
        'Collector\'s Rare',
        'Ghost Rare',
        'Ultimate Rare',
        'Holofoil',
        'Reverse Holo',
        'Illustration Rare',
        'Special Illustration Rare',
        'Hyper Rare',
        'Mythic',
        'Uncommon'
      ];
      defaultRarities.forEach(r => {
        if (!seen.has(r.toLowerCase())) {
          seen.add(r.toLowerCase());
          opts.push({ value: r, label: r });
        }
      });
    }

    // Asegurar que la rareza seleccionada esté en las opciones
    if (rarity && !seen.has(rarity.toLowerCase())) {
      opts.unshift({ value: rarity, label: rarity });
    }

    return opts;
  }, [tcgPriceStatus, rarity]);

  const handleSaveNewTcg = async (customName = null) => {
    const targetName = (customName || newTcgNameInput).trim();
    if (!targetName) return;

    setIsSavingTcg(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase
        .from('tcg_games')
        .insert({ name: targetName })
        .select()
        .single();

      if (error) {
        console.warn('Insert error into tcg_games:', error);
      }

      if (data) {
        setDbTcgs(prev => [...prev.filter(item => item.id !== data.id), data]);
      } else {
        setDbTcgs(prev => [...prev, { id: `local-tcg-${Date.now()}`, name: targetName }]);
      }

      setTcg(targetName);
      setSetNameVal('');
      setNewTcgNameInput('');
      setIsAddingNewTcg(false);
    } catch (err) {
      console.error('Error guardando nuevo TCG:', err);
      setDbTcgs(prev => [...prev, { id: `local-tcg-${Date.now()}`, name: targetName }]);
      setTcg(targetName);
      setSetNameVal('');
      setNewTcgNameInput('');
      setIsAddingNewTcg(false);
    } finally {
      setIsSavingTcg(false);
    }
  };

  const handleSaveEditCurrentTcg = async () => {
    const oldName = tcg;
    const newName = editingTcgNameInput.trim();
    if (!newName || newName === oldName) {
      setIsEditingTcg(false);
      return;
    }

    setIsSavingTcg(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const matched = dbTcgs.find(t => t.name === oldName);

      if (matched && !String(matched.id).startsWith('default-') && !String(matched.id).startsWith('local-')) {
        await supabase
          .from('tcg_games')
          .update({ name: newName })
          .eq('id', matched.id);
      } else {
        await supabase
          .from('tcg_games')
          .insert({ name: newName });
      }

      // Update sets table where tcg = oldName
      await supabase
        .from('tcg_sets')
        .update({ tcg: newName })
        .eq('tcg', oldName);

      // Update products table where tcg = oldName
      await supabase
        .from('products')
        .update({ tcg: newName })
        .eq('tcg', oldName);

      // Update local state
      setDbTcgs(prev => prev.map(t => t.name === oldName ? { ...t, name: newName } : t));
      setDbTcgSets(prev => prev.map(s => s.tcg === oldName ? { ...s, tcg: newName } : s));
      setDbProducts(prev => prev.map(p => {
        if (p.tcg === oldName || p.specifications?.TCG === oldName) {
          return {
            ...p,
            tcg: newName,
            specifications: { ...p.specifications, TCG: newName }
          };
        }
        return p;
      }));

      setTcg(newName);
      setIsEditingTcg(false);
      setEditingTcgNameInput('');
    } catch (err) {
      console.error('Error editando TCG:', err);
      alert('Error al actualizar el nombre del TCG: ' + err.message);
    } finally {
      setIsSavingTcg(false);
    }
  };

  const handleSaveEditTcgFromModal = async (id, oldName, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed || trimmed === oldName) {
      setModalEditingTcgId(null);
      setModalEditingTcgName('');
      return;
    }

    try {
      const { supabase } = await import('../supabaseClient');
      if (id && !String(id).startsWith('default-') && !String(id).startsWith('local-')) {
        await supabase
          .from('tcg_games')
          .update({ name: trimmed })
          .eq('id', id);
      } else {
        await supabase
          .from('tcg_games')
          .insert({ name: trimmed });
      }

      // Update sets & products
      await supabase
        .from('tcg_sets')
        .update({ tcg: trimmed })
        .eq('tcg', oldName);

      await supabase
        .from('products')
        .update({ tcg: trimmed })
        .eq('tcg', oldName);

      setDbTcgs(prev => prev.map(t => (t.id === id || t.name === oldName) ? { ...t, name: trimmed } : t));
      setDbTcgSets(prev => prev.map(s => s.tcg === oldName ? { ...s, tcg: trimmed } : s));
      setDbProducts(prev => prev.map(p => {
        if (p.tcg === oldName || p.specifications?.TCG === oldName) {
          return {
            ...p,
            tcg: trimmed,
            specifications: { ...p.specifications, TCG: trimmed }
          };
        }
        return p;
      }));

      if (tcg === oldName) {
        setTcg(trimmed);
      }

      setModalEditingTcgId(null);
      setModalEditingTcgName('');
    } catch (err) {
      console.error('Error al editar TCG desde modal:', err);
      alert('Error al actualizar el TCG: ' + err.message);
    }
  };

  const handleDeleteTcg = async (id, tcgName) => {
    if (!confirm(`¿Estás seguro de eliminar el TCG "${tcgName}"? Se desvinculará de la lista activa.`)) return;

    try {
      const { supabase } = await import('../supabaseClient');
      if (id && !String(id).startsWith('default-') && !String(id).startsWith('local-')) {
        await supabase
          .from('tcg_games')
          .delete()
          .eq('id', id);
      }

      const remaining = dbTcgs.filter(t => t.id !== id && t.name !== tcgName);
      setDbTcgs(remaining);

      if (tcg === tcgName) {
        setTcg(remaining.length > 0 ? remaining[0].name : '');
        setSetNameVal('');
      }
    } catch (err) {
      console.error('Error al eliminar TCG:', err);
      alert('Error al eliminar el TCG: ' + err.message);
    }
  };

  const handleSaveNewSet = async (customName = null) => {
    const targetName = (customName || newSetNameInput).trim();
    if (!targetName) return;

    setIsSavingSet(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase
        .from('tcg_sets')
        .insert({ tcg, name: targetName })
        .select()
        .single();

      if (error) {
        console.warn('Insert error or table not ready, continuing:', error);
      }

      if (data) {
        setDbTcgSets(prev => [...prev.filter(s => s.id !== data.id), data]);
      } else {
        setDbTcgSets(prev => [...prev, { id: `local-${Date.now()}`, tcg, name: targetName }]);
      }

      setSetNameVal(targetName);
      setNewSetNameInput('');
      setIsAddingNewSet(false);
    } catch (err) {
      console.error('Error guardando nuevo set:', err);
      setDbTcgSets(prev => [...prev, { id: `local-${Date.now()}`, tcg, name: targetName }]);
      setSetNameVal(targetName);
      setNewSetNameInput('');
      setIsAddingNewSet(false);
    } finally {
      setIsSavingSet(false);
    }
  };

  const handleSaveEditCurrentSet = async () => {
    const oldName = setNameVal;
    const newName = editingSetNameInput.trim();
    if (!newName || newName === oldName) {
      setIsEditingSet(false);
      return;
    }

    setIsSavingSet(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const matchedSet = dbTcgSets.find(s => s.tcg === tcg && s.name === oldName);

      if (matchedSet && !String(matchedSet.id).startsWith('default-') && !String(matchedSet.id).startsWith('local-')) {
        await supabase
          .from('tcg_sets')
          .update({ name: newName })
          .eq('id', matchedSet.id);
      } else {
        await supabase
          .from('tcg_sets')
          .insert({ tcg, name: newName });
      }

      // Update products referencing this old set name
      await supabase
        .from('products')
        .update({ set_name: newName })
        .eq('tcg', tcg)
        .eq('set_name', oldName);

      // Update local sets
      setDbTcgSets(prev => prev.map(s => {
        if (s.tcg === tcg && s.name === oldName) {
          return { ...s, name: newName };
        }
        return s;
      }));

      // Update local dbProducts
      setDbProducts(prev => prev.map(p => {
        if (p.tcg === tcg && (p.setName === oldName || p.specifications?.Set === oldName)) {
          return {
            ...p,
            setName: newName,
            specifications: {
              ...p.specifications,
              Set: newName
            }
          };
        }
        return p;
      }));

      setSetNameVal(newName);
      setIsEditingSet(false);
      setEditingSetNameInput('');
    } catch (err) {
      console.error('Error editando set:', err);
      alert('Error al actualizar el nombre del set: ' + err.message);
    } finally {
      setIsSavingSet(false);
    }
  };

  const handleSaveEditSetFromModal = async (setId, oldName, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed || trimmed === oldName) {
      setModalEditingSetId(null);
      setModalEditingSetName('');
      return;
    }

    try {
      const { supabase } = await import('../supabaseClient');
      if (setId && !String(setId).startsWith('default-') && !String(setId).startsWith('local-')) {
        await supabase
          .from('tcg_sets')
          .update({ name: trimmed })
          .eq('id', setId);
      } else {
        await supabase
          .from('tcg_sets')
          .insert({ tcg, name: trimmed });
      }

      // Update products referencing this old set name
      await supabase
        .from('products')
        .update({ set_name: trimmed })
        .eq('tcg', tcg)
        .eq('set_name', oldName);

      setDbTcgSets(prev => prev.map(s => {
        if (s.id === setId || (s.tcg === tcg && s.name === oldName)) {
          return { ...s, name: trimmed };
        }
        return s;
      }));

      if (setNameVal === oldName) {
        setSetNameVal(trimmed);
      }

      setModalEditingSetId(null);
      setModalEditingSetName('');
    } catch (err) {
      console.error('Error al editar set desde modal:', err);
      alert('Error al actualizar el set: ' + err.message);
    }
  };

  const handleDeleteSet = async (setId, sName) => {
    if (!confirm(`¿Estás seguro de eliminar el set "${sName}" de ${tcg}?`)) return;

    try {
      const { supabase } = await import('../supabaseClient');
      if (setId && !String(setId).startsWith('default-') && !String(setId).startsWith('local-')) {
        await supabase
          .from('tcg_sets')
          .delete()
          .eq('id', setId);
      }

      setDbTcgSets(prev => prev.filter(s => s.id !== setId && !(s.tcg === tcg && s.name === sName)));

      if (setNameVal === sName) {
        setSetNameVal('');
      }
    } catch (err) {
      console.error('Error al eliminar set:', err);
      alert('Error al eliminar el set: ' + err.message);
    }
  };

  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  // Image Upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Variants / Multiple Types
  const [hasVariants, setHasVariants] = useState(false);
  const [samePrice, setSamePrice] = useState(true);
  const [variants, setVariants] = useState([
    { id: 1, title: '', stock: '', price: '', image: '', imagePreview: '' }
  ]);

  // Restock states
  const [restockSearch, setRestockSearch] = useState('');
  const [restockCategory, setRestockCategory] = useState('');
  const [restockAmount, setRestockAmount] = useState({});
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [variantEditForm, setVariantEditForm] = useState({ stock: '', price: '' });
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  // Featured states
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredCategory, setFeaturedCategory] = useState('');
  const [originalFeaturedState, setOriginalFeaturedState] = useState({});
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [featuredSaveSuccess, setFeaturedSaveSuccess] = useState(false);

  // Header Banners states
  const [headerBannersList, setHeaderBannersList] = useState([]);
  const [loadingHeaderBanners, setLoadingHeaderBanners] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropModalData, setCropModalData] = useState({
    id: null,
    file: null,
    previewUrl: '',
    title: '',
    link_url: '/catalog',
    position_x: 50,
    position_y: 50
  });
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const bannerDragStartRef = React.useRef({ startX: 0, startY: 0, initialPosX: 50, initialPosY: 50 });

  // Fetch header banners
  const fetchHeaderBanners = async () => {
    setLoadingHeaderBanners(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase
        .from('header_banners')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && data) {
        setHeaderBannersList(data);
      }
    } catch (err) {
      console.error('Error fetching header banners:', err);
    } finally {
      setLoadingHeaderBanners(false);
    }
  };

  useEffect(() => {
    fetchHeaderBanners();
  }, [reloadTrigger]);

  // Dynamic banner destination options based on products / categories
  const headerBannerDestinationOptions = React.useMemo(() => {
    // Base categories known
    const baseKnownCategories = [
      { name: "Yu-Gi-Oh", slug: "yu-gi-oh" },
      { name: "Pokemon", slug: "pokemon" },
      { name: "Magic", slug: "magic" },
      { name: "Sleeves", slug: "sleeves" }
    ];

    // Gather all distinct categories present in dbProducts and initialProducts
    const allProducts = [...(dbProducts || []), ...(initialProducts || [])];
    const categoryMap = new Map();

    baseKnownCategories.forEach(c => {
      categoryMap.set(c.slug, c.name);
    });

    allProducts.forEach(p => {
      if (p.category) {
        const slug = p.categorySlug || p.category.toLowerCase().replace(/\s+/g, '-');
        if (!categoryMap.has(slug)) {
          categoryMap.set(slug, p.category);
        }
      }
    });

    const dynamicFilterOptions = Array.from(categoryMap.entries()).map(([slug, name]) => ({
      value: `/catalog?category=${slug}`,
      label: `Filtrar por: ${name}`
    }));

    return [
      { value: "/catalog", label: "Catálogo Completo (Todos los productos)" },
      ...dynamicFilterOptions
    ];
  }, [dbProducts, initialProducts]);

  // Normalize string/object link_url safely
  const normalizeBannerLinkUrl = (rawLink) => {
    if (!rawLink) return '/catalog';
    if (typeof rawLink === 'string') {
      if (rawLink.startsWith('{') && rawLink.includes('value')) {
        try {
          const parsed = JSON.parse(rawLink);
          return parsed.value || parsed.target?.value || '/catalog';
        } catch {
          return rawLink;
        }
      }
      return rawLink;
    }
    if (typeof rawLink === 'object') {
      return rawLink.value || rawLink.target?.value || '/catalog';
    }
    return String(rawLink);
  };

  // Get display text for banner destination
  const getBannerDestinationLabel = (rawLink) => {
    const cleanLink = normalizeBannerLinkUrl(rawLink);
    const matched = headerBannerDestinationOptions.find(opt => opt.value === cleanLink);
    if (matched) return matched.label;
    if (cleanLink === '/catalog') return 'Catálogo Completo (Todos los productos)';
    if (cleanLink.includes('category=')) {
      const cat = cleanLink.split('category=')[1]?.split('&')[0];
      return `Filtrar por: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    }
    return cleanLink;
  };

  // Orders pagination
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [isExportingOrders, setIsExportingOrders] = useState(false);
  const [isExportingInventory, setIsExportingInventory] = useState(false);
  const ORDERS_PER_PAGE = 8;

  // Reset orders page if it exceeds total pages
  useEffect(() => {
    const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
    if (ordersCurrentPage > totalPages && totalPages > 0) {
      setOrdersCurrentPage(totalPages);
    }
  }, [orders, ordersCurrentPage]);

  // Compute pending featured/hero changes
  const pendingFeaturedChanges = dbProducts.filter(p => {
    const orig = originalFeaturedState[p.id] || { featured: false, division: null };
    const currentDiv = p.division || null;
    const origDiv = orig.division || null;
    return p.featured !== orig.featured || currentDiv !== origDiv;
  });

  const hasPendingFeaturedChanges = pendingFeaturedChanges.length > 0;

  // Tabs and Modal states
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('azote_admin_active_tab') || 'inventory';
  });
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Submit animation states
  const [btnText, setBtnText] = useState('Publicar Producto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Persist tab changes
  useEffect(() => {
    sessionStorage.setItem('azote_admin_active_tab', activeTab);
  }, [activeTab]);

  // Function to delete product from database
  const handleDeleteSubmit = async () => {
    if (!productToDelete) return;
    try {
      const { supabase } = await import('../supabaseClient');

      // Delete product (cascade will handle variants if configured, otherwise we delete them manually or by db setup)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (deleteError) throw deleteError;

      alert(`Producto "${productToDelete.name}" eliminado correctamente.`);
      setProductToDelete(null);
      triggerReload();
    } catch (err) {
      console.error('Error deleting product from Supabase:', err);
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  // Expanded states for restock accordion
  const [expandedRestock, setExpandedRestock] = useState({});
  const toggleRestockExpand = (productId) => {
    setExpandedRestock((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Filter products for restocking and sort by product name (A-Z)
  const filteredRestockProducts = [...dbProducts]
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(restockSearch.toLowerCase());
      const matchesCategory = restockCategory ? p.categorySlug === restockCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload a file, base64 data URI, or remote image URL to Supabase Storage and return the public URL
  const uploadImageToStorage = async (supabase, fileOrDataUri, folder, filename) => {
    if (!fileOrDataUri) return '';

    // If it's an external HTTP/HTTPS URL, try to download and store in Supabase Storage
    if (typeof fileOrDataUri === 'string' && (fileOrDataUri.startsWith('http://') || fileOrDataUri.startsWith('https://'))) {
      if (fileOrDataUri.includes('supabase.co')) {
        return fileOrDataUri;
      }
      try {
        const res = await fetch(fileOrDataUri);
        if (!res.ok) return fileOrDataUri;
        const blob = await res.blob();
        const detectedExt = (blob.type && blob.type.split('/')[1]) || 'png';
        const cleanExt = detectedExt.replace(/[^a-z0-9]/gi, '') || 'png';
        const remotePath = `${folder}/${filename}-${Date.now()}.${cleanExt}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(remotePath, blob, { contentType: blob.type || 'image/jpeg', upsert: true });

        if (error) {
          console.warn('Error subiendo imagen remota a Supabase Storage, usando URL original:', error);
          return fileOrDataUri;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        return urlData?.publicUrl || fileOrDataUri;
      } catch (fetchErr) {
        console.warn('No se pudo descargar imagen remota para Supabase Storage, usando URL original:', fetchErr);
        return fileOrDataUri;
      }
    }

    const ext = fileOrDataUri instanceof File
      ? fileOrDataUri.name.split('.').pop() || 'png'
      : ((fileOrDataUri.match(/^data:image\/(\w+);/) || [])[1] || 'png');
    const path = `${folder}/${filename}-${Date.now()}.${ext}`;

    let uploadBody, contentType;
    if (fileOrDataUri instanceof File) {
      uploadBody = fileOrDataUri;
      contentType = fileOrDataUri.type;
    } else if (typeof fileOrDataUri === 'string' && fileOrDataUri.startsWith('data:')) {
      // base64 data URI — decode to binary
      const match = fileOrDataUri.match(/^data:(image\/\w+);base64,(.+)$/s);
      if (!match) return fileOrDataUri; // can't decode, return as-is
      contentType = match[1];
      const binaryStr = atob(match[2]);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      uploadBody = bytes;
    } else {
      return fileOrDataUri; // already a URL, return as-is
    }

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, uploadBody, { contentType, upsert: true });

    if (error) throw new Error('Error subiendo imagen: ' + error.message);

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  // Variant helpers
  const addVariant = () => {
    setVariants(prev => [...prev, { id: Date.now(), title: '', stock: '', price: '', image: '', imagePreview: '', imageFile: null }]);
  };
  const removeVariant = (id) => {
    if (variants.length <= 1) return;
    setVariants(prev => prev.filter(v => v.id !== id));
  };
  const updateVariant = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const handleVariantImage = (id, e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setVariants(prev => prev.map(v => v.id === id ? { ...v, imageFile: file, imagePreview: URL.createObjectURL(file) } : v));
  };

  const handleRestockSubmit = (productId, amount, colorId = null) => {
    const qty = parseInt(amount, 10);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(Number(amount))) {
      alert('Por favor, ingresa una cantidad entera válida mayor a cero.');
      return;
    }

    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');

        if (colorId) {
          // It's a variant update
          // First fetch current variant stock
          const { data: currentVar, error: getErr } = await supabase
            .from('product_variants')
            .select('stock, product_id')
            .eq('id', colorId)
            .single();

          if (getErr) throw getErr;

          const newStock = Math.max(0, (parseInt(currentVar.stock, 10) || 0) + qty);
          const { error: updateErr } = await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', colorId);

          if (updateErr) throw updateErr;

          // Also update base product stock (sum of all variants or add to base)
          const { data: variantsList, error: listErr } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('product_id', currentVar.product_id);

          if (!listErr && variantsList) {
            const totalStock = variantsList.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
            await supabase
              .from('products')
              .update({ stock: totalStock })
              .eq('id', currentVar.product_id);

            // Update local dbProducts state for the variant and the product stock
            setDbProducts((prevProducts) =>
              prevProducts.map((p) => {
                if (p.id === currentVar.product_id) {
                  const updatedColors = p.colors?.map((c) =>
                    c.id === colorId ? { ...c, stock: newStock, inStock: newStock > 0 } : c
                  ) || null;
                  return {
                    ...p,
                    stock: totalStock,
                    inStock: totalStock > 0,
                    specifications: {
                      ...p.specifications,
                      Stock: String(totalStock),
                      Status: totalStock > 0 ? 'Disponible' : 'Agotado'
                    },
                    colors: updatedColors
                  };
                }
                return p;
              })
            );
          }

        } else {
          // Base product update
          const { data: currentProd, error: getErr } = await supabase
            .from('products')
            .select('stock')
            .eq('id', productId)
            .single();

          if (getErr) throw getErr;

          const newStock = Math.max(0, (parseInt(currentProd.stock, 10) || 0) + qty);
          const { error: updateErr } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId);

          if (updateErr) throw updateErr;

          // Update local dbProducts state
          setDbProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === productId
                ? {
                  ...p,
                  stock: newStock,
                  inStock: newStock > 0,
                  specifications: {
                    ...p.specifications,
                    Stock: String(newStock),
                    Status: newStock > 0 ? 'Disponible' : 'Agotado'
                  }
                }
                : p
            )
          );
        }

        onUpdateStock(productId, qty, colorId);
        const key = colorId ? `${productId}-${colorId}` : productId;
        setRestockAmount(prev => ({ ...prev, [key]: '' }));
        alert('Stock actualizado correctamente en base de datos.');

      } catch (err) {
        console.error('Error al actualizar stock en Supabase:', err);
        alert('Error al conectar con la base de datos: ' + err.message);
      }
    })();
  };

  const handleStartEditVariant = (color) => {
    setEditingVariantId(color.id);
    setVariantEditForm({
      stock: String(color.stock !== undefined ? parseInt(color.stock, 10) || 0 : (color.inStock ? 20 : 0)),
      price: String(color.price !== undefined ? color.price : '')
    });
  };

  const handleCancelEditVariant = () => {
    setEditingVariantId(null);
    setVariantEditForm({ stock: '', price: '' });
  };

  const handleSaveEditVariant = async (productId, colorId = null) => {
    const newStock = parseInt(variantEditForm.stock, 10);
    const newPrice = parseFloat(variantEditForm.price);

    if (isNaN(newStock) || newStock < 0 || !Number.isInteger(Number(variantEditForm.stock))) {
      alert('Por favor, ingresa un número entero válido para el stock (0 o superior).');
      return;
    }
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Por favor, ingresa un precio válido (0 o superior).');
      return;
    }

    setIsSavingVariant(true);
    try {
      const { supabase } = await import('../supabaseClient');

      if (colorId && colorId !== productId) {
        // Update variant stock and price in DB
        const { error: updateErr } = await supabase
          .from('product_variants')
          .update({ stock: newStock, price: newPrice })
          .eq('id', colorId);

        if (updateErr) throw updateErr;

        // Update base product total stock in DB (sum of variants)
        const { data: variantsList, error: listErr } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('product_id', productId);

        let totalStock = newStock;
        if (!listErr && variantsList) {
          totalStock = variantsList.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
          await supabase
            .from('products')
            .update({ stock: totalStock })
            .eq('id', productId);
        }

        // Update local dbProducts state
        setDbProducts((prevProducts) =>
          prevProducts.map((p) => {
            if (p.id === productId) {
              const updatedColors = p.colors?.map((c) =>
                c.id === colorId ? { ...c, stock: newStock, inStock: newStock > 0, price: newPrice } : c
              ) || null;
              return {
                ...p,
                stock: totalStock,
                inStock: totalStock > 0,
                specifications: {
                  ...p.specifications,
                  Stock: String(totalStock),
                  Status: totalStock > 0 ? 'Disponible' : 'Agotado'
                },
                colors: updatedColors
              };
            }
            return p;
          })
        );
      } else {
        // Base product update without variants
        const { error: updateErr } = await supabase
          .from('products')
          .update({ stock: newStock, price: newPrice })
          .eq('id', productId);

        if (updateErr) throw updateErr;

        // Update local dbProducts state
        setDbProducts((prevProducts) =>
          prevProducts.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                stock: newStock,
                price: newPrice,
                inStock: newStock > 0,
                specifications: {
                  ...p.specifications,
                  Stock: String(newStock),
                  Status: newStock > 0 ? 'Disponible' : 'Agotado'
                }
              };
            }
            return p;
          })
        );
      }

      setEditingVariantId(null);
      setVariantEditForm({ stock: '', price: '' });
      alert('Producto actualizado correctamente.');
    } catch (err) {
      console.error('Error al actualizar variante/producto:', err);
      alert('Error al guardar los cambios: ' + err.message);
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || 'Sleeve');
    const prodTcg = product.tcg || (product.specifications?.TCG || 'Yu-Gi-Oh!');
    setTcg(prodTcg);
    const prodSet = product.setName || product.set_name || product.specifications?.Set || '';
    setSetNameVal(prodSet);
    const prodRarity = product.rarity || product.specifications?.Rareza || '';
    setRarity(prodRarity);
    setCustomSetInput('');
    setIsAddingNewSet(false);
    setIsEditingSet(false);
    setNewSetNameInput('');
    setEditingSetNameInput('');

    // Check if product has variants
    if (product.colors && product.colors.length > 0) {
      setHasVariants(true);
      const firstPrice = product.colors[0].price;
      const allSame = product.colors.every(v => v.price === firstPrice);
      setSamePrice(allSame);
      setPrice(allSame ? String(firstPrice) : '');

      setVariants(product.colors.map((v, index) => ({
        id: v.id || index + 1,
        title: v.name,
        stock: String(v.stock !== undefined ? v.stock : 20),
        price: String(v.price || ''),
        imagePreview: v.image || '',
        image: v.image || null
      })));
      setStock('');
      setImagePreview(product.image || '');
    } else {
      setHasVariants(false);
      setPrice(String(product.price));
      const prodStock = product.specifications?.Stock || product.stock || '0';
      setStock(String(prodStock));
      setImagePreview(product.image);
      setVariants([
        { id: 1, title: '', stock: '', price: '', image: '', imagePreview: '' }
      ]);
    }

    setDescription(product.description || '');
    setAutoSyncPrice(product.auto_sync_price !== false);
    setImageFile(null);
    setBtnText('Guardar Cambios');
    setActiveTab('inventory');

    // Fetch full variants with images in the background to populate variant image previews
    if (product.colors && product.colors.length > 0) {
      (async () => {
        try {
          const { supabase } = await import('../supabaseClient');
          const { data: fullVariants, error } = await supabase
            .from('product_variants')
            .select('id, title, price, stock, image')
            .eq('product_id', product.id);

          if (!error && fullVariants) {
            setVariants(fullVariants.map((v, index) => ({
              id: v.id || index + 1,
              title: v.title,
              stock: String(v.stock !== undefined ? v.stock : 20),
              price: String(v.price || ''),
              imagePreview: v.image || '',
              image: v.image || null
            })));
          }
        } catch (err) {
          console.error("Error loading full variants for editing:", err);
        }
      })();
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Sleeve');
    setTcg('Yu-Gi-Oh!');
    setIsAddingNewTcg(false);
    setIsEditingTcg(false);
    setNewTcgNameInput('');
    setEditingTcgNameInput('');
    setSetNameVal('');
    setRarity('');
    setCustomSetInput('');
    setIsAddingNewSet(false);
    setIsEditingSet(false);
    setNewSetNameInput('');
    setEditingSetNameInput('');
    setPrice('');
    setStock('');
    setDescription('');
    setAutoSyncPrice(true);
    setImageFile(null);
    setImagePreview('');
    setHasVariants(false);
    setSamePrice(true);
    setVariants([{ id: 1, title: '', stock: '', price: '', image: '', imagePreview: '' }]);
    setTcgPriceStatus(null);
    setBtnText('Publicar Producto');
    setError('');
  };

  const handleSyncSingleProductPrice = async (prod) => {
    setSyncingProductId(prod.id);
    try {
      const { supabase } = await import('../supabaseClient');
      const { syncSingleProductPrice } = await import('../services/tcgSyncService');
      const res = await syncSingleProductPrice(supabase, prod);
      if (res.success) {
        setDbProducts(prev => prev.map(p => p.id === prod.id ? { ...p, price: res.newPrice, last_price_sync: res.lastSync } : p));
        if (res.priceChanged) {
          alert(`Precio de "${prod.name}" actualizado con TCGPlayer:\n$${res.oldPrice.toFixed(2)} -> $${res.newPrice.toFixed(2)} USD`);
        } else {
          alert(`El precio de "${prod.name}" ya está al día ($${res.newPrice.toFixed(2)} USD).`);
        }
      } else {
        alert(`No se pudo sincronizar el precio de "${prod.name}":\n${res.error}`);
      }
    } catch (err) {
      alert('Error al sincronizar precio: ' + err.message);
    } finally {
      setSyncingProductId(null);
    }
  };

  const handleSyncAllTcgPrices = async () => {
    setIsSyncingAllPrices(true);
    setSyncProgress({ current: 0, total: 0, productName: 'Iniciando...' });
    try {
      const { supabase } = await import('../supabaseClient');
      const { syncAllTcgProducts } = await import('../services/tcgSyncService');
      const summary = await syncAllTcgProducts(supabase, dbProducts, (prog) => {
        setSyncProgress(prog);
      });

      if (summary.updatedProducts && summary.updatedProducts.length > 0) {
        const updatedMap = new Map(summary.updatedProducts.map(u => [u.productId, u.newPrice]));
        setDbProducts(prev => prev.map(p => {
          if (updatedMap.has(p.id)) {
            const newP = updatedMap.get(p.id);
            return {
              ...p,
              price: newP,
              last_price_sync: new Date().toISOString()
            };
          }
          return p;
        }));
      }

      setSyncResultModal(summary);
    } catch (err) {
      alert('Error durante la sincronización de precios: ' + err.message);
    } finally {
      setIsSyncingAllPrices(false);
      setSyncProgress(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (hasVariants) {
      // Validate variants mode
      if (!name || !description) {
        setError('Por favor, completa el nombre y la descripción del producto.');
        return;
      }
      if (samePrice && (!price || parseFloat(price) <= 0)) {
        setError('Por favor, ingresa un precio válido común para todos los tipos.');
        return;
      }
      for (const v of variants) {
        if (!v.title) { setError('Cada tipo debe tener un título.'); return; }
        if (v.stock === '' || isNaN(parseFloat(v.stock)) || parseFloat(v.stock) < 0) { setError(`El tipo "${v.title}" necesita una cantidad de stock válida.`); return; }
        if (!v.imagePreview && !v.image) { setError(`El tipo "${v.title}" necesita una imagen.`); return; }
        if (!samePrice && (!v.price || parseFloat(v.price) <= 0)) { setError(`El tipo "${v.title}" necesita un precio válido.`); return; }
      }
    } else {
      // Standard single product validation
      if (!name || !price || !stock || !description) {
        setError('Por favor, rellene todos los campos para publicar el artículo.');
        return;
      }
      if (!imagePreview) {
        setError('Por favor, sube una imagen para el producto.');
        return;
      }
      if (parseFloat(price) <= 0 || parseFloat(stock) < 0) {
        setError('El precio debe ser mayor a 0 y el stock no puede ser negativo.');
        return;
      }
    }

    setIsSubmitting(true);
    setBtnText(editingProduct ? 'Guardando...' : 'Publicando...');

    // Save to Supabase using a separate async function to avoid inline complexity
    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');

        // Upload main product image to Storage if it's a new file or external URL
        let mainImageUrl = imagePreview || (hasVariants ? variants[0].imagePreview : '');
        if (imageFile) {
          const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
          mainImageUrl = await uploadImageToStorage(supabase, imageFile, 'products', `main-${safeName}`);
        } else if (mainImageUrl && (mainImageUrl.startsWith('data:') || (mainImageUrl.startsWith('http') && !mainImageUrl.includes('supabase.co')))) {
          const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
          mainImageUrl = await uploadImageToStorage(supabase, mainImageUrl, 'products', `main-${safeName}`);
        }

        // Upload variant images to Storage
        const uploadedVariants = [];
        if (hasVariants) {
          for (const v of variants) {
            let varImageUrl = v.imagePreview || v.image || null;
            if (v.imageFile) {
              const safeTitle = v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
              varImageUrl = await uploadImageToStorage(supabase, v.imageFile, 'variants', `variant-${safeTitle}`);
            } else if (varImageUrl && (varImageUrl.startsWith('data:') || (varImageUrl.startsWith('http') && !varImageUrl.includes('supabase.co')))) {
              const safeTitle = v.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
              varImageUrl = await uploadImageToStorage(supabase, varImageUrl, 'variants', `variant-${safeTitle}`);
            } else if (varImageUrl && varImageUrl.startsWith('blob:')) {
              varImageUrl = v.image || null; // blob URLs can't be saved, use existing
            }
            uploadedVariants.push({ ...v, uploadedImageUrl: varImageUrl });
          }
          // If no main image was set, use first variant's uploaded image
          if (!mainImageUrl || mainImageUrl.startsWith('blob:')) {
            mainImageUrl = uploadedVariants[0]?.uploadedImageUrl || '';
          }
        }

        // Determine resolved set_name & tcg for TCG, Carta, and Producto Sellado
        const isCardOrSealed = ['TCG', 'Carta', 'Producto Sellado'].includes(category);
        const resolvedSetName = isCardOrSealed
          ? (setNameVal === 'Otro Set' ? customSetInput.trim() : (setNameVal || null))
          : null;
        const resolvedTcg = isCardOrSealed ? tcg : null;
        const resolvedRarity = isCardOrSealed ? (rarity ? rarity.trim() : null) : null;

        // Auto-save new set to tcg_sets if not already recorded
        if (resolvedTcg && resolvedSetName) {
          const alreadyExists = dbTcgSets.some(s => s.tcg === resolvedTcg && s.name.toLowerCase() === resolvedSetName.toLowerCase());
          if (!alreadyExists) {
            try {
              const { data: newSetRow } = await supabase
                .from('tcg_sets')
                .insert({ tcg: resolvedTcg, name: resolvedSetName })
                .select()
                .single();
              if (newSetRow) {
                setDbTcgSets(prev => [...prev, newSetRow]);
              }
            } catch (ignoreErr) {
              console.warn('Could not auto-insert set into tcg_sets:', ignoreErr);
            }
          }
        }

        // 1. Prepare base product data
        const baseProduct = {
          name,
          category,
          tcg: resolvedTcg,
          set_name: resolvedSetName,
          rarity: resolvedRarity,
          auto_sync_price: isCardOrSealed ? autoSyncPrice : false,
          last_price_sync: new Date().toISOString(),
          price: hasVariants && samePrice ? parseFloat(price) : (!hasVariants ? parseFloat(price) : parseFloat(variants[0].price || 0)),
          stock: hasVariants ? Number(variants.reduce((sum, v) => sum + (parseFloat(v.stock) || 0), 0).toFixed(2)) : parseFloat(stock || 0),
          description,
          image: mainImageUrl,
          division: editingProduct ? editingProduct.division : null
        };

        if (editingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update(baseProduct)
            .eq('id', editingProduct.id);

          if (updateError) throw updateError;

          // Delete all old variants
          const { error: deleteVariantsError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', editingProduct.id);

          if (deleteVariantsError) throw deleteVariantsError;

          // Re-insert new variants if hasVariants is true
          if (hasVariants) {
            const variantsToInsert = uploadedVariants.map(v => ({
              product_id: editingProduct.id,
              title: v.title,
              stock: parseFloat(v.stock || 0),
              price: samePrice ? parseFloat(price) : parseFloat(v.price),
              image: v.uploadedImageUrl || null
            }));

            const { error: variantsError } = await supabase
              .from('product_variants')
              .insert(variantsToInsert);

            if (variantsError) throw variantsError;
          }

          triggerReload();

          setIsSubmitting(false);
          setIsPublished(true);
          setBtnText('¡Guardado!');

          setTimeout(() => {
            setIsPublished(false);
            handleCancelEdit();
          }, 2000);

        } else {
          // Insert base product
          const { data: insertedProduct, error: insertError } = await supabase
            .from('products')
            .insert([baseProduct])
            .select()
            .single();

          if (insertError) throw insertError;

          // Insert variants if product has variants
          if (hasVariants && insertedProduct) {
            const variantsToInsert = uploadedVariants.map(v => ({
              product_id: insertedProduct.id,
              title: v.title,
              stock: parseFloat(v.stock || 0),
              price: samePrice ? parseFloat(price) : parseFloat(v.price),
              image: v.uploadedImageUrl || null
            }));

            const { error: variantsError } = await supabase
              .from('product_variants')
              .insert(variantsToInsert);

            if (variantsError) throw variantsError;
          }

          // Trigger local callback for UI compatibility
          if (hasVariants) {
            onCreateProduct({
              id: insertedProduct.id,
              name,
              category,
              price: baseProduct.price,
              stock: baseProduct.stock.toString(),
              description,
              image: baseProduct.image,
              variants: uploadedVariants.map(v => ({
                id: v.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
                name: v.title,
                stock: parseFloat(v.stock),
                inStock: parseFloat(v.stock) > 0,
                price: samePrice ? parseFloat(price) : parseFloat(v.price),
                image: v.uploadedImageUrl || null,
              }))
            });
          } else {
            onCreateProduct({
              id: insertedProduct.id,
              name,
              category,
              price,
              stock,
              description,
              image: imagePreview
            });
          }

          triggerReload();

          setIsSubmitting(false);
          setIsPublished(true);
          setBtnText('¡Publicado!');

          setTimeout(() => {
            setIsPublished(false);
            setBtnText('Publicar Producto');
            setName('');
            setCategory('Sleeve');
            setTcg('Yu-Gi-Oh!');
            setIsAddingNewTcg(false);
            setIsEditingTcg(false);
            setNewTcgNameInput('');
            setEditingTcgNameInput('');
            setSetNameVal('');
            setRarity('');
            setIsAddingNewSet(false);
            setIsEditingSet(false);
            setNewSetNameInput('');
            setEditingSetNameInput('');
            setCustomSetInput('');
            setPrice('');
            setStock('');
            setDescription('');
            setImageFile(null);
            setImagePreview('');
            setHasVariants(false);
            setSamePrice(true);
            setVariants([{ id: 1, title: '', stock: '', price: '', image: '', imagePreview: '' }]);
          }, 2000);
        }

      } catch (err) {
        console.error('Error al guardar el producto en Supabase:', err);
        setError('Error al conectar con la base de datos: ' + err.message);
        setIsSubmitting(false);
        setBtnText(editingProduct ? 'Guardar Cambios' : 'Publicar Producto');
      }
    })();
  };

  const getStockBadgeClass = (qty) => {
    const quantity = parseFloat(qty);
    if (isNaN(quantity) || quantity === 0) {
      return 'bg-error/10 text-error';
    } else if (quantity < 5) {
      return 'bg-secondary-fixed text-on-secondary-fixed';
    } else {
      return 'bg-tertiary-fixed text-on-tertiary-fixed';
    }
  };

  const handleToggleFeatured = (productId, currentVal) => {
    const newVal = !currentVal;

    // Local update only - no API call until user confirms
    setDbProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, featured: newVal } : p
      )
    );
    setFeaturedSaveSuccess(false);
  };

  const handleToggleHero = (productId, currentDivision) => {
    const newDivision = currentDivision === 'hero' ? null : 'hero';

    // Local update only - no API call until user confirms
    setDbProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, division: newDivision } : p
      )
    );
    setFeaturedSaveSuccess(false);
  };

  const handleConfirmFeaturedChanges = async () => {
    if (!hasPendingFeaturedChanges) return;

    setIsSavingFeatured(true);
    setFeaturedSaveSuccess(false);

    try {
      const { supabase } = await import('../supabaseClient');

      // Update all changed products in Supabase
      const updatePromises = pendingFeaturedChanges.map(async (p) => {
        const { error } = await supabase
          .from('products')
          .update({
            featured: p.featured,
            division: p.division || null
          })
          .eq('id', p.id);

        if (error) throw error;
      });

      await Promise.all(updatePromises);

      // Update original state snapshot
      setOriginalFeaturedState((prevOrig) => {
        const updated = { ...prevOrig };
        pendingFeaturedChanges.forEach((p) => {
          updated[p.id] = {
            featured: p.featured,
            division: p.division || null
          };
        });
        return updated;
      });

      setFeaturedSaveSuccess(true);
      setTimeout(() => {
        setFeaturedSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Error guardando productos destacados:', err);
      alert('Error al confirmar los cambios: ' + err.message);
    } finally {
      setIsSavingFeatured(false);
    }
  };

  // Header banner handlers
  const handleOpenNewBannerCrop = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    const preview = URL.createObjectURL(file);
    setCropModalData({
      id: null,
      file,
      previewUrl: preview,
      title: '',
      link_url: '/catalog',
      position_x: 50,
      position_y: 50
    });
    setCropModalOpen(true);
  };

  const handleEditBannerCrop = (banner) => {
    setCropModalData({
      id: banner.id,
      file: null,
      previewUrl: banner.image_url,
      title: banner.title || '',
      link_url: normalizeBannerLinkUrl(banner.link_url),
      position_x: banner.position_x !== null && banner.position_x !== undefined ? banner.position_x : 50,
      position_y: banner.position_y !== null && banner.position_y !== undefined ? banner.position_y : 50
    });
    setCropModalOpen(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    try {
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase
        .from('header_banners')
        .delete()
        .eq('id', bannerToDelete.id);

      if (error) throw error;

      setHeaderBannersList(prev => prev.filter(b => b.id !== bannerToDelete.id));
      setBannerToDelete(null);
      window.dispatchEvent(new CustomEvent('header_banners_updated'));
    } catch (err) {
      console.error('Error al eliminar banner:', err);
      alert('Error al eliminar el banner: ' + err.message);
    }
  };

  const handleSaveBannerCrop = async () => {
    if (!cropModalData.previewUrl) return;
    setIsSavingBanner(true);
    try {
      const { supabase } = await import('../supabaseClient');
      let finalImageUrl = cropModalData.previewUrl;
      const cleanDestinationLink = normalizeBannerLinkUrl(cropModalData.link_url);

      // If a new file was uploaded, upload to Supabase Storage
      if (cropModalData.file) {
        finalImageUrl = await uploadImageToStorage(
          supabase,
          cropModalData.file,
          'header-banners',
          'banner'
        );
      }

      if (cropModalData.id) {
        // Update existing banner
        const { error } = await supabase
          .from('header_banners')
          .update({
            image_url: finalImageUrl,
            title: cropModalData.title,
            link_url: cleanDestinationLink,
            position_x: Math.round(cropModalData.position_x),
            position_y: Math.round(cropModalData.position_y)
          })
          .eq('id', cropModalData.id);

        if (error) throw error;
      } else {
        // Insert new banner
        const nextOrder = headerBannersList.length;
        const { error } = await supabase
          .from('header_banners')
          .insert({
            image_url: finalImageUrl,
            title: cropModalData.title,
            link_url: cleanDestinationLink,
            position_x: Math.round(cropModalData.position_x),
            position_y: Math.round(cropModalData.position_y),
            order_index: nextOrder
          });

        if (error) throw error;
      }

      await fetchHeaderBanners();
      window.dispatchEvent(new CustomEvent('header_banners_updated'));
      setCropModalOpen(false);
    } catch (err) {
      console.error('Error al guardar banner del header:', err);
      alert('Error al guardar el banner: ' + err.message);
    } finally {
      setIsSavingBanner(false);
    }
  };

  // Interactive drag handlers for repositioning banner
  const handleBannerDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDraggingBanner(true);
    bannerDragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialPosX: cropModalData.position_x ?? 50,
      initialPosY: cropModalData.position_y ?? 50
    };
  };

  const handleBannerDragMove = (e) => {
    if (!isDraggingBanner) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - bannerDragStartRef.current.startX;
    const deltaY = clientY - bannerDragStartRef.current.startY;

    // Moving mouse to right reveals left of image -> decrease position_x
    // Sensitivity factor: 0.25% per pixel
    const newX = Math.min(100, Math.max(0, Math.round(bannerDragStartRef.current.initialPosX - deltaX * 0.25)));
    const newY = Math.min(100, Math.max(0, Math.round(bannerDragStartRef.current.initialPosY - deltaY * 0.35)));

    setCropModalData((prev) => ({
      ...prev,
      position_x: newX,
      position_y: newY
    }));
  };

  const handleBannerDragEnd = () => {
    setIsDraggingBanner(false);
  };

  const handleDiscardFeaturedChanges = () => {
    setDbProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orig = originalFeaturedState[p.id];
        if (!orig) return p;
        return {
          ...p,
          featured: orig.featured,
          division: orig.division
        };
      })
    );
    setFeaturedSaveSuccess(false);
  };

  const getStockStatusText = (qty) => {
    const quantity = parseFloat(qty);
    if (isNaN(quantity) || quantity === 0) return 'Out of Stock';
    if (quantity < 5) return 'Low Stock';
    return 'In Stock';
  };

  const handleStatusChange = (orderId, rawStatus) => {
    const newStatus = typeof rawStatus === 'string'
      ? rawStatus
      : (rawStatus?.target?.value || rawStatus?.value || String(rawStatus));

    let prevStatus = 'Realizado';

    // 1. Optimistic Update (instant UI feedback)
    setOrders((prevOrders) => {
      const target = prevOrders.find((o) => o.id === orderId);
      if (target) prevStatus = target.status;
      return prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
    });

    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');

        if (newStatus === 'Cancelado' || newStatus === 'Entregado') {
          const action = newStatus === 'Cancelado' ? 'reject' : 'confirm';
          const { data, error } = await supabase.rpc('process_order_action', {
            p_order_id: orderId,
            p_action: action
          });

          if (error) throw error;
          if (data && !data.success) throw new Error(data.message);

          // If rejected, reload database products so stock counts refresh on admin screen
          if (newStatus === 'Cancelado') {
            triggerReload();
          }
        } else {
          const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

          if (error) throw error;
        }
      } catch (err) {
        // 2. Revert on error
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: prevStatus } : order
          )
        );
        console.error('Error al cambiar estado del pedido:', err);
        alert('Error al cambiar estado del pedido: ' + err.message);
      }
    })();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Realizado':
        return 'bg-primary/10 text-primary';
      case 'Entregado':
        return 'bg-tertiary/15 text-tertiary';
      case 'Cancelado':
        return 'bg-error/10 text-error';
      default:
        return 'bg-outline-variant/20 text-on-surface-variant';
    }
  };

  const handleExportOrdersToExcel = async () => {
    if (!orders || orders.length === 0) {
      alert('No hay pedidos disponibles para exportar.');
      return;
    }

    try {
      setIsExportingOrders(true);
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Azote Store';
      workbook.lastModifiedBy = 'Admin';
      workbook.created = new Date();
      workbook.modified = new Date();

      // ==========================================
      // Hoja 1: Resumen General de Pedidos
      // ==========================================
      const ordersSheet = workbook.addWorksheet('Resumen de Pedidos', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      // Helper to process base64 or remote URL image for ExcelJS
      const getImageData = async (rawUrl) => {
        if (!rawUrl || typeof rawUrl !== 'string') return null;
        try {
          if (rawUrl.startsWith('data:image/')) {
            const parts = rawUrl.split(';base64,');
            const mimeType = parts[0].replace('data:image/', '').toLowerCase();
            const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpeg';
            return {
              base64: parts[1],
              extension
            };
          }
          if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            const resp = await fetch(rawUrl);
            const blob = await resp.blob();
            const buffer = await blob.arrayBuffer();
            const mime = blob.type.toLowerCase();
            const extension = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpeg';
            return {
              buffer,
              extension
            };
          }
        } catch (imgErr) {
          console.warn('No se pudo procesar la imagen del comprobante:', imgErr);
        }
        return null;
      };

      ordersSheet.columns = [
        { header: 'ID Pedido', key: 'id', width: 20 },
        { header: 'Fecha', key: 'date', width: 22 },
        { header: 'Cliente', key: 'clientName', width: 26 },
        { header: 'Teléfono', key: 'clientPhone', width: 18 },
        { header: 'Correo Electrónico', key: 'clientEmail', width: 28 },
        { header: 'Punto de Retiro', key: 'pickupLocation', width: 32 },
        { header: 'Total', key: 'total', width: 16 },
        { header: 'Estado', key: 'status', width: 16 },
        { header: 'Cant. Items', key: 'itemsCount', width: 14 },
        { header: 'Resumen Productos', key: 'itemsSummary', width: 50 },
        { header: 'Comprobante', key: 'paymentProof', width: 26 },
        { header: 'Imagen Adjunta', key: 'imagePreview', width: 24 }
      ];

      // Estilo de encabezados
      const headerFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate 800
      };
      const headerFont = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };

      ordersSheet.getRow(1).eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      ordersSheet.getRow(1).height = 28;

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const rowIndex = i + 2; // Row 1 is header, 1-indexed
        const totalItemsCount = (order.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
        const summaryText = (order.items || [])
          .map(item => `${item.product?.name || 'Producto'}${item.color?.name ? ` (${item.color.name})` : ''} x${item.quantity}`)
          .join(', ');

        const hasProof = !!order.paymentProofPreview;

        const row = ordersSheet.addRow({
          id: order.id,
          date: order.date,
          clientName: order.clientName,
          clientPhone: order.clientPhone || 'N/A',
          clientEmail: order.clientEmail || 'N/A',
          pickupLocation: order.pickupLocation,
          total: Number(order.total) || 0,
          status: order.status,
          itemsCount: totalItemsCount,
          itemsSummary: summaryText,
          paymentProof: hasProof ? 'Comprobante Adjunto' : 'Sin comprobante',
          imagePreview: hasProof ? '' : 'N/A'
        });

        row.alignment = { vertical: 'middle' };
        row.getCell('total').numFmt = '"$"#,##0.00';
        row.getCell('itemsCount').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('id').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('paymentProof').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('imagePreview').alignment = { vertical: 'middle', horizontal: 'center' };

        if (hasProof) {
          const imgData = await getImageData(order.paymentProofPreview);
          if (imgData) {
            row.height = 95; // Dar altura a la fila para que la imagen se vea con claridad
            const imageId = workbook.addImage(imgData);
            ordersSheet.addImage(imageId, {
              tl: { col: 11.15, row: rowIndex - 1 + 0.08 },
              br: { col: 11.9, row: rowIndex - 0.08 },
              editAs: 'oneCell'
            });
          }
        }
      }

      // ==========================================
      // Hoja 2: Detalle Desglosado por Producto
      // ==========================================
      const itemsSheet = workbook.addWorksheet('Detalle de Productos', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      itemsSheet.columns = [
        { header: 'ID Pedido', key: 'orderId', width: 20 },
        { header: 'Fecha', key: 'date', width: 22 },
        { header: 'Cliente', key: 'clientName', width: 24 },
        { header: 'Teléfono', key: 'clientPhone', width: 18 },
        { header: 'ID Producto', key: 'productId', width: 16 },
        { header: 'Nombre del Producto', key: 'productName', width: 34 },
        { header: 'Variante / Tipo', key: 'variantName', width: 22 },
        { header: 'Cantidad', key: 'quantity', width: 14 },
        { header: 'Precio Unitario', key: 'unitPrice', width: 16 },
        { header: 'Subtotal Línea', key: 'subtotal', width: 16 },
        { header: 'Punto de Retiro', key: 'pickupLocation', width: 30 },
        { header: 'Estado Pedido', key: 'status', width: 16 }
      ];

      itemsSheet.getRow(1).eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      itemsSheet.getRow(1).height = 28;

      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const qty = Number(item.quantity) || 0;
          const unitPrice = Number(item.product?.price) || 0;
          const subtotal = qty * unitPrice;

          const row = itemsSheet.addRow({
            orderId: order.id,
            date: order.date,
            clientName: order.clientName,
            clientPhone: order.clientPhone || 'N/A',
            productId: item.product?.id || 'N/A',
            productName: item.product?.name || 'Producto desconocido',
            variantName: item.color?.name || 'Base / Único',
            quantity: qty,
            unitPrice: unitPrice,
            subtotal: subtotal,
            pickupLocation: order.pickupLocation,
            status: order.status
          });

          row.alignment = { vertical: 'middle' };
          row.getCell('orderId').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('productId').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('unitPrice').numFmt = '"$"#,##0.00';
          row.getCell('subtotal').numFmt = '"$"#,##0.00';
        });
      });

      // Generar buffer y descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const formattedDate = new Date().toISOString().slice(0, 10);
      anchor.download = `pedidos_azote_store_${formattedDate}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (err) {
      console.error('Error exportando pedidos a Excel:', err);
      alert('Hubo un error al generar el archivo Excel: ' + err.message);
    } finally {
      setIsExportingOrders(false);
    }
  };

  const handleExportInventoryToExcel = async () => {
    if (!dbProducts || dbProducts.length === 0) {
      alert('No hay productos en el inventario para exportar.');
      return;
    }

    try {
      setIsExportingInventory(true);
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Azote Store';
      workbook.lastModifiedBy = 'Admin';
      workbook.created = new Date();
      workbook.modified = new Date();

      const headerFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate 800
      };
      const headerFont = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };

      const outOfStockFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE4E6' } // Rose 100 / Rojo claro suave
      };

      const outOfStockFont = {
        name: 'Segoe UI',
        size: 10,
        color: { argb: 'FF9F1239' } // Rose 800
      };

      // ==========================================
      // Hoja 1: Inventario Desglosado por Tipos / Variantes (Hoja Principal)
      // ==========================================
      const variantsSheet = workbook.addWorksheet('Inventario por Tipos', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      variantsSheet.columns = [
        { header: 'Producto', key: 'productName', width: 34 },
        { header: 'Categoría', key: 'category', width: 18 },
        { header: 'Tipo / Variante', key: 'variantName', width: 26 },
        { header: 'Stock Tipo', key: 'stock', width: 14 },
        { header: 'Precio Unitario', key: 'price', width: 16 },
        { header: 'Valor Inventario', key: 'inventoryValue', width: 18 },
        { header: 'Disponibilidad Tipo', key: 'status', width: 20 }
      ];

      variantsSheet.getRow(1).eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      variantsSheet.getRow(1).height = 28;

      const sortedProducts = [...dbProducts].sort((a, b) => a.name.localeCompare(b.name));

      sortedProducts.forEach(p => {
        const hasTypes = Boolean(p.colors && p.colors.length > 0);
        const typesList = hasTypes
          ? p.colors
          : [{
              id: p.id,
              name: p.name,
              stock: p.stock !== undefined ? p.stock : (p.specifications?.Stock ? parseInt(p.specifications.Stock, 10) || 0 : (p.inStock ? 20 : 0)),
              price: p.price !== undefined ? parseFloat(p.price) : 0,
              inStock: p.inStock
            }];

        typesList.forEach(t => {
          const varStock = t.stock !== undefined ? (parseInt(t.stock, 10) || 0) : (t.inStock ? 20 : 0);
          const varPrice = t.price !== undefined ? parseFloat(t.price) : parseFloat(p.price || 0);
          const inventoryVal = varStock * varPrice;

          const row = variantsSheet.addRow({
            productName: p.name,
            category: p.category,
            variantName: hasTypes ? t.name : 'Único / Base',
            stock: varStock,
            price: varPrice,
            inventoryValue: inventoryVal,
            status: varStock > 0 ? 'En Stock' : 'Agotado'
          });

          row.alignment = { vertical: 'middle' };
          row.getCell('stock').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell('price').numFmt = '"$"#,##0.00';
          row.getCell('inventoryValue').numFmt = '"$"#,##0.00';

          if (varStock <= 0) {
            row.eachCell(cell => {
              cell.fill = outOfStockFill;
              cell.font = outOfStockFont;
            });
          }
        });
      });

      // ==========================================
      // Hoja 2: Resumen Consolidado por Producto
      // ==========================================
      const productsSheet = workbook.addWorksheet('Resumen por Producto', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      productsSheet.columns = [
        { header: 'Nombre del Producto', key: 'name', width: 34 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Precio Base', key: 'price', width: 16 },
        { header: 'Stock Total', key: 'stock', width: 14 },
        { header: 'Disponibilidad', key: 'status', width: 16 },
        { header: 'Cant. Tipos', key: 'typesCount', width: 16 },
        { header: 'Destacado', key: 'featured', width: 14 },
        { header: 'Carrusel Hero', key: 'division', width: 16 },
        { header: 'Descripción', key: 'description', width: 45 }
      ];

      productsSheet.getRow(1).eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      productsSheet.getRow(1).height = 28;

      sortedProducts.forEach(p => {
        const hasTypes = Boolean(p.colors && p.colors.length > 0);
        const totalStock = hasTypes
          ? p.colors.reduce((sum, c) => sum + (c.stock !== undefined ? (parseInt(c.stock, 10) || 0) : (c.inStock ? 20 : 0)), 0)
          : (p.stock !== undefined ? (parseInt(p.stock, 10) || 0) : (p.specifications?.Stock ? parseInt(p.specifications.Stock, 10) || 0 : (p.inStock ? 20 : 0)));

        const row = productsSheet.addRow({
          name: p.name,
          category: p.category,
          price: Number(p.price) || 0,
          stock: totalStock,
          status: totalStock > 0 ? 'En Stock' : 'Agotado',
          typesCount: hasTypes ? `${p.colors.length} tipos` : '1 tipo (base)',
          featured: p.featured ? 'Sí' : 'No',
          division: p.division === 'hero' ? 'En Carrusel' : 'No',
          description: p.description || ''
        });

        row.alignment = { vertical: 'middle' };
        row.getCell('price').numFmt = '"$"#,##0.00';
        row.getCell('stock').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('typesCount').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('featured').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('division').alignment = { vertical: 'middle', horizontal: 'center' };

        if (totalStock <= 0) {
          row.eachCell(cell => {
            cell.fill = outOfStockFill;
            cell.font = outOfStockFont;
          });
        }
      });

      // Generar buffer y descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const formattedDate = new Date().toISOString().slice(0, 10);
      anchor.download = `inventario_azote_store_${formattedDate}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (err) {
      console.error('Error exportando inventario a Excel:', err);
      alert('Hubo un error al generar el archivo Excel de inventario: ' + err.message);
    } finally {
      setIsExportingInventory(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 md:pt-6 md:pb-6">

      {/* Title */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Panel de Administración</h1>
        <p className="text-on-surface-variant text-body-md mt-1">Gestiona el inventario de productos y administra los pedidos y comprobantes.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-outline-variant/30 mb-6 gap-2 sm:gap-3 pb-1 scrollbar-thin w-full">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 min-w-[190px] py-3 px-4 sm:px-6 font-headline-md text-sm sm:text-base font-bold border-b-2 transition-all flex items-center justify-center gap-2.5 shrink-0 ${activeTab === 'inventory'
            ? 'border-primary text-primary bg-primary/5 rounded-t-lg shadow-xs'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg'
            }`}
        >
          <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          Gestión de Catálogo
        </button>

        <button
          onClick={() => setActiveTab('featured')}
          className={`flex-1 min-w-[190px] py-3 px-4 sm:px-6 font-headline-md text-sm sm:text-base font-bold border-b-2 transition-all flex items-center justify-center gap-2.5 shrink-0 ${activeTab === 'featured'
            ? 'border-primary text-primary bg-primary/5 rounded-t-lg shadow-xs'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg'
            }`}
        >
          <span className="material-symbols-outlined text-[22px]">star</span>
          Productos Destacados
        </button>

        <button
          onClick={() => setActiveTab('restock')}
          className={`flex-1 min-w-[190px] py-3 px-4 sm:px-6 font-headline-md text-sm sm:text-base font-bold border-b-2 transition-all flex items-center justify-center gap-2.5 shrink-0 ${activeTab === 'restock'
            ? 'border-primary text-primary bg-primary/5 rounded-t-lg shadow-xs'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg'
            }`}
        >
          <span className="material-symbols-outlined text-[22px]">published_with_changes</span>
          Reabastecimientos
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 min-w-[190px] py-3 px-4 sm:px-6 font-headline-md text-sm sm:text-base font-bold border-b-2 transition-all flex items-center justify-center gap-2.5 shrink-0 relative ${activeTab === 'orders'
            ? 'border-primary text-primary bg-primary/5 rounded-t-lg shadow-xs'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-t-lg'
            }`}
        >
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          Control de Pedidos
          {orders.length > 0 && (
            <span className="bg-primary text-on-primary text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold ml-1">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Main Content Area */}
        <section className="lg:col-span-12 space-y-6">

          {loadingDb ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg text-center card-shadow min-h-[450px]">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="font-headline-md text-sm text-on-surface-variant animate-pulse font-semibold">Cargando base de datos de Azote Store...</p>
            </div>
          ) : (
            <>
              {activeTab === 'orders' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-base animate-fade-in mb-md">
                  <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Ventas de la Sesión</span>
                    <span className="text-2xl font-black text-primary font-sans mt-2">
                      ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Total Pedidos</span>
                    <span className="text-2xl font-black text-on-surface mt-2">{orders.length}</span>
                  </div>
                  <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Pedidos Realizados / Activos</span>
                    <span className="text-2xl font-black text-secondary mt-2">
                      {orders.filter(o => o.status === 'Realizado').length}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <>
                  {/* Add New Item Section */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">

                    {/* Header info & Submit button */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-base mb-xl">
                      <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">
                          {editingProduct ? `Editar Producto` : 'Agregar Nuevo Producto'}
                        </h2>
                        {editingProduct && (
                          <div className="text-primary font-bold text-sm mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Editando: {editingProduct.name}
                          </div>
                        )}
                        <p className="text-on-surface-variant text-body-md mt-1">
                          {editingProduct ? 'Modifica los campos del artículo de colección.' : 'Completa los campos para publicar un nuevo artículo de colección.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {editingProduct && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                            className="font-headline-md text-headline-md px-xl py-4 bg-outline-variant/20 hover:bg-outline-variant/35 text-on-surface rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                            Cancelar
                          </button>
                        )}
                        <button
                          form="inventory-form"
                          type="submit"
                          disabled={isSubmitting || isPublished}
                          className={`font-headline-md text-headline-md px-xl py-4 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 ${isPublished
                            ? 'bg-tertiary-container text-on-tertiary-container'
                            : 'bg-primary text-on-primary hover:bg-primary-container'
                            } disabled:opacity-85`}
                        >
                          {isSubmitting && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isPublished && <span className="material-symbols-outlined">check_circle</span>}
                          {editingProduct ? (isPublished ? '¡Guardado!' : (isSubmitting ? 'Guardando...' : 'Guardar Cambios')) : btnText}
                        </button>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2 border border-error/20">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-gutter" id="inventory-form">
                      <div className="space-y-base relative z-35" ref={suggestionsBoxRef}>
                        <div className="flex items-center justify-between ml-1">
                          <label className="block font-label-md text-on-surface-variant font-semibold">Nombre del Producto</label>
                          {['TCG', 'Carta', 'Producto Sellado'].includes(category) && (
                            <button
                              type="button"
                              onClick={() => handleFetchTcgPlayerPrice()}
                              disabled={isFetchingTcgPrice || isSubmitting || isPublished}
                              className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-all cursor-pointer border border-primary/30"
                              title="Buscar en TCGPlayer para traer precios, sets y rarezas oficiales"
                            >
                              {isFetchingTcgPrice ? (
                                <>
                                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                  Consultando TCGPlayer...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[15px]">trending_up</span>
                                  Copiar precio de TCGPlayer
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => {
                              if (cardSuggestions.length > 0) setShowSuggestions(true);
                            }}
                            disabled={isSubmitting || isPublished}
                            placeholder="Ej. Dark Magician (o Mago Oscuro)"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                            autoComplete="off"
                          />
                          {isLoadingSuggestions && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-[18px] animate-spin pointer-events-none">
                              progress_activity
                            </span>
                          )}
                        </div>

                        {/* Menú flotante de autocompletado según el TCG */}
                        {showSuggestions && cardSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container border border-primary/30 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto animate-fade-in divide-y divide-outline-variant/20">
                            <div className="px-3 py-1.5 bg-surface-container-high/60 text-[10px] uppercase font-bold tracking-wider text-on-surface-variant flex items-center justify-between">
                              <span>Sugerencias oficiales ({tcg})</span>
                              <span className="text-[9px] font-normal lowercase opacity-75">Clic para autocompletar</span>
                            </div>
                            {cardSuggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(sug)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/10 transition-colors cursor-pointer group"
                              >
                                {sug.image ? (
                                  <img
                                    src={sug.image}
                                    alt={sug.name}
                                    className="w-8 h-11 object-contain rounded shrink-0 bg-surface-container-lowest border border-outline-variant/30 group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-8 h-11 rounded shrink-0 bg-surface-container-high flex items-center justify-center border border-outline-variant/30">
                                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">style</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="block text-body-sm font-semibold text-on-surface group-hover:text-primary truncate transition-colors">
                                    {sug.name}
                                  </span>
                                  <span className="block text-[11px] text-on-surface-variant truncate">
                                    {sug.sub}
                                  </span>
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                  arrow_forward
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-base relative z-30 focus-within:z-50">
                        <label className="block font-label-md text-on-surface-variant ml-1">Categoría</label>
                        <CustomDropdown
                          value={category}
                          onChange={(e) => {
                            const newCat = typeof e === 'string' ? e : (e?.target?.value || e?.value || String(e));
                            setCategory(newCat);
                            if (['TCG', 'Carta', 'Producto Sellado'].includes(newCat) && !tcg) {
                              setTcg('Yu-Gi-Oh!');
                            }
                          }}
                          options={categoryOptions}
                          disabled={isSubmitting || isPublished}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                          align="full"
                        />
                      </div>

                      {/* Dropdowns condicionales si la categoría es TCG, Carta o Producto Sellado */}
                      {['TCG', 'Carta', 'Producto Sellado'].includes(category) && (
                        <>
                          <div className="space-y-base animate-fade-in relative z-25 focus-within:z-50">
                            <div className="flex items-center justify-between ml-1">
                              <label className="font-label-md text-primary flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[18px]">style</span>
                                TCG (Juego de Cartas)
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsManageTcgsModalOpen(true)}
                                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 hover:bg-surface-container-high px-2 py-1 rounded-full transition-all cursor-pointer"
                                title="Ver, editar y eliminar TCGs"
                              >
                                <span className="material-symbols-outlined text-[15px]">tune</span>
                                Administrar
                              </button>
                            </div>

                            <CustomDropdown
                              value={tcg}
                              onChange={(e) => {
                                const selectedTcg = typeof e === 'string' ? e : (e?.target?.value || e?.value || String(e));
                                setTcg(selectedTcg);
                                setSetNameVal('');
                              }}
                              options={dynamicTcgOptions}
                              disabled={isSubmitting || isPublished}
                              placeholder="Selecciona el TCG"
                              className="w-full bg-surface-container-low border border-primary/40 focus:border-primary rounded-lg p-4 text-body-md transition-all outline-none shadow-xs"
                              align="full"
                            />
                          </div>

                          <div className="space-y-base animate-fade-in relative z-20 focus-within:z-50">
                            <div className="flex items-center justify-between ml-1">
                              <label className="font-label-md text-primary flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[18px]">category</span>
                                Set / Expansión (de la API)
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsManageSetsModalOpen(true)}
                                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 hover:bg-surface-container-high px-2 py-1 rounded-full transition-all cursor-pointer"
                                title="Ver y editar todos los sets de este TCG"
                              >
                                <span className="material-symbols-outlined text-[15px]">tune</span>
                                Administrar
                              </button>
                            </div>

                            {/* Dropdown de Sets según la API */}
                            <CustomDropdown
                              value={setNameVal}
                              onChange={(e) => {
                                const selectedSet = typeof e === 'string' ? e : (e?.target?.value || e?.value || String(e));
                                setSetNameVal(selectedSet);
                              }}
                              options={setDropdownOptions}
                              disabled={isSubmitting || isPublished}
                              placeholder={tcgPriceStatus?.allPrices?.length > 0 ? "Selecciona el Set traído por la API" : "Selecciona el Set / Expansión"}
                              className="w-full bg-surface-container-low border border-primary/40 focus:border-primary rounded-lg p-4 text-body-md transition-all outline-none shadow-xs"
                              align="full"
                            />
                          </div>

                          {/* Dropdown de Rareza según la API */}
                          <div className="space-y-base animate-fade-in relative z-15 focus-within:z-50">
                            <div className="flex items-center justify-between ml-1">
                              <label className="font-label-md text-primary flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                                Rareza de la Carta (de la API)
                              </label>
                              {tcgPriceStatus?.allPrices?.length > 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  Oficial TCGPlayer
                                </span>
                              )}
                            </div>
                            <CustomDropdown
                              value={rarity}
                              onChange={(e) => {
                                const selectedRarity = typeof e === 'string' ? e : (e?.target?.value || e?.value || String(e));
                                setRarity(selectedRarity);
                              }}
                              options={rarityDropdownOptions}
                              disabled={isSubmitting || isPublished}
                              placeholder={tcgPriceStatus?.allPrices?.length > 0 ? "Selecciona la Rareza traída por la API" : "Selecciona la Rareza"}
                              className="w-full bg-surface-container-low border border-primary/40 focus:border-primary rounded-lg p-4 text-body-md transition-all outline-none shadow-xs"
                              align="full"
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-base">
                        <div className="flex items-center justify-between ml-1">
                          <label className="block font-label-md text-on-surface-variant font-semibold">Precio (USD)</label>
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isSubmitting || isPublished}
                            placeholder="0.00"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 pl-8 text-body-md transition-all outline-none"
                          />
                        </div>

                        {/* Feedback de consulta TCGPlayer */}
                        {tcgPriceStatus && (
                          <div className={`text-xs p-3 rounded-lg flex flex-col gap-2 animate-fade-in ${
                            tcgPriceStatus.type === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                              : 'bg-error-container text-on-error-container'
                          }`}>
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                                {tcgPriceStatus.type === 'success' ? 'check_circle' : 'info'}
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold text-body-sm">{tcgPriceStatus.message}</div>
                                {tcgPriceStatus.isExactSetMatch && (
                                  <div className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Coincidencia exacta con el set seleccionado ({tcgPriceStatus.matchedSet}).
                                  </div>
                                )}
                                {tcgPriceStatus.imageUrl && (
                                  <div className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">image</span>
                                    Imagen oficial cargada en la vista previa del producto.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Lista completa de ediciones / precios encontrados */}
                            {tcgPriceStatus.allPrices && tcgPriceStatus.allPrices.length > 0 && (() => {
                              const filteredPrices = tcgPriceStatus.allPrices.filter(item => {
                                if (!priceSearchFilter.trim()) return true;
                                const q = priceSearchFilter.toLowerCase().trim();
                                return (
                                  (item.setName && item.setName.toLowerCase().includes(q)) ||
                                  (item.rarity && item.rarity.toLowerCase().includes(q)) ||
                                  (item.code && item.code.toLowerCase().includes(q)) ||
                                  (item.variant && item.variant.toLowerCase().includes(q))
                                );
                              });

                              return (
                                <div className="mt-1 pt-2 border-t border-emerald-500/20 text-[11px]">
                                  <div className="flex items-center justify-between mb-1.5 font-semibold text-on-surface">
                                    <span>
                                      Todas las ediciones y rarezas encontradas ({filteredPrices.length}{priceSearchFilter ? ` de ${tcgPriceStatus.allPrices.length}` : ''}):
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant font-normal">Haz clic para seleccionar</span>
                                  </div>

                                  {tcgPriceStatus.allPrices.length > 6 && (
                                    <div className="relative mb-2">
                                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-on-surface-variant/60 pointer-events-none">
                                        search
                                      </span>
                                      <input
                                        type="text"
                                        value={priceSearchFilter}
                                        onChange={(e) => setPriceSearchFilter(e.target.value)}
                                        placeholder="Filtrar por set, rareza o código (ej. Secret, Quarter, Tin)..."
                                        className="w-full bg-surface-container border border-outline-variant/30 rounded-lg pl-8 pr-7 py-1 text-[11px] text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:border-primary transition-colors"
                                      />
                                      {priceSearchFilter && (
                                        <button
                                          type="button"
                                          onClick={() => setPriceSearchFilter('')}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[12px] font-bold p-0.5"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                                    {filteredPrices.length === 0 ? (
                                      <div className="text-center py-4 text-on-surface-variant italic">
                                        No hay ediciones que coincidan con "{priceSearchFilter}".
                                      </div>
                                    ) : (
                                      filteredPrices.map((item, idx) => {
                                        const isCurrentPrice = parseFloat(price) === item.price;
                                        return (
                                          <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                              if (item.price > 0) {
                                                setPrice(item.price.toFixed(2));
                                              }
                                              if (item.setName && item.setName !== 'Precio Promedio / Mercado') {
                                                setSetNameVal(item.setName);
                                              }
                                              if (item.rarity && item.rarity !== 'Promedio') {
                                                setRarity(item.rarity);
                                              }
                                              if (item.imageUrl && !imageFile) {
                                                setImagePreview(item.imageUrl);
                                              }
                                            }}
                                            className={`flex items-center justify-between p-2 rounded-md transition-all text-left border cursor-pointer ${
                                              isCurrentPrice || item.isMatch
                                                ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                                                : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                                            }`}
                                          >
                                            <div className="flex flex-col min-w-0 pr-2">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="truncate font-semibold">{item.setName}</span>
                                                {item.isMatch && (
                                                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                                    Tu Set
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[10px] opacity-75">
                                                {[item.code, item.rarity, (item.variant && item.variant !== item.rarity && !item.variant.includes(item.rarity) ? item.variant : null)].filter(Boolean).join(' • ')}
                                              </span>
                                            </div>
                                            <div className="shrink-0 text-right ml-2">
                                              {item.price > 0 ? (
                                                <>
                                                  <span className="font-extrabold text-sm block">
                                                    ${item.price.toFixed(2)} USD
                                                  </span>
                                                  {item.isEstimate && (
                                                    <span className="text-[9px] font-normal text-on-surface-variant block">
                                                      Ref. Mercado
                                                    </span>
                                                  )}
                                                </>
                                              ) : (
                                                <span className="text-[10px] font-medium text-on-surface-variant block bg-surface-container-high px-1.5 py-0.5 rounded">
                                                  Sin precio
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Dynamic price sync toggle for TCG products */}
                        {['TCG', 'Carta', 'Producto Sellado'].includes(category) && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-primary/40 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-[20px]">
                                sync
                              </span>
                              <div>
                                <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                  <span>Actualización Dinámica de Precio</span>
                                  <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">TCGPlayer</span>
                                </div>
                                <div className="text-[11px] text-on-surface-variant leading-tight">
                                  Actualizar automáticamente el precio de mercado periódicamente
                                </div>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                              <input
                                type="checkbox"
                                checked={autoSyncPrice}
                                onChange={(e) => setAutoSyncPrice(e.target.checked)}
                                className="sr-only peer"
                                disabled={isSubmitting || isPublished}
                              />
                              <div className="w-10 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Cantidad de Stock</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          disabled={isSubmitting || isPublished}
                          placeholder="0"
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-base animate-fade-in">
                        <label className="block font-label-md text-on-surface-variant text-xs uppercase tracking-wider ml-1 font-semibold">Imagen del Producto</label>
                        <div className="relative">
                          {imagePreview ? (
                            <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-outline-variant/30 group bg-surface-container-low shadow-sm flex items-center justify-center">
                              <img
                                src={imagePreview}
                                alt="Vista previa del producto"
                                className="max-h-full max-w-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview('');
                                  setImageFile(null);
                                }}
                                className="absolute top-3 right-3 bg-error text-on-error hover:bg-error-container hover:text-on-error-container rounded-full p-2 transition-colors shadow-md flex items-center justify-center hover:scale-105 active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          ) : (
                            <label
                              className="flex flex-col items-center justify-center w-full h-[220px] rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-primary bg-surface-container-low/40 hover:bg-primary/5 transition-all cursor-pointer text-center p-md group"
                            >
                              <span className="material-symbols-outlined text-[3.5rem] text-outline group-hover:text-primary group-hover:scale-105 transition-all">
                                add_photo_alternate
                              </span>
                              <span className="font-bold text-on-surface text-sm mt-sm">Sube la foto del producto</span>
                              <span className="text-outline text-xs mt-0.5">Arrastra tu imagen aquí, o haz clic para explorar</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isSubmitting || isPublished}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Variants toggle */}
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() => setHasVariants(!hasVariants)}
                          className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${hasVariants
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/40 hover:border-primary/50 text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                          {/* Toggle pill */}
                          <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${hasVariants ? 'bg-primary' : 'bg-outline-variant/50'
                            }`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasVariants ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">Este producto tiene múltiples tipos</p>
                            <p className="text-xs opacity-70 mt-0.5">Activa esto para definir variantes con imagen, stock y precio independientes</p>
                          </div>
                          <span className="material-symbols-outlined ml-auto text-[20px] opacity-60">category</span>
                        </button>
                      </div>

                      {/* Variants panel */}
                      {hasVariants && (
                        <div className="md:col-span-2 space-y-4 animate-fade-in">
                          {/* Same price toggle */}
                          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                            <div>
                              <p className="font-bold text-sm text-on-surface">Precio</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {samePrice ? 'Mismo precio para todos los tipos (usa el campo Precio de arriba)' : 'Precio distinto por tipo'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSamePrice(!samePrice)}
                              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${samePrice ? 'bg-primary' : 'bg-secondary'
                                }`}
                            >
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${samePrice ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                            </button>
                          </div>

                          {/* Variant cards */}
                          <div className="space-y-3">
                            {variants.map((v, idx) => (
                              <div key={v.id} className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low/40 space-y-3 relative">
                                {/* Card label */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Tipo #{idx + 1}</span>
                                  {variants.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeVariant(v.id)}
                                      className="text-error hover:bg-error/10 rounded-full p-1 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* Title */}
                                  <div>
                                    <label className="block text-xs text-on-surface-variant font-semibold mb-1">Título del tipo</label>
                                    <input
                                      type="text"
                                      value={v.title}
                                      onChange={e => updateVariant(v.id, 'title', e.target.value)}
                                      placeholder="Ej. Holo Foil, Edición Limitada..."
                                      className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                  </div>
                                  {/* Stock */}
                                  <div>
                                    <label className="block text-xs text-on-surface-variant font-semibold mb-1">Cantidad en stock</label>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={v.stock}
                                      onChange={e => updateVariant(v.id, 'stock', e.target.value)}
                                      placeholder="0"
                                      className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                  </div>
                                  {/* Individual price (only when samePrice is off) */}
                                  {!samePrice && (
                                    <div>
                                      <label className="block text-xs text-on-surface-variant font-semibold mb-1">Precio (USD)</label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                                        <input
                                          type="number"
                                          step="any"
                                          min="0"
                                          value={v.price}
                                          onChange={e => updateVariant(v.id, 'price', e.target.value)}
                                          placeholder="0.00"
                                          className="w-full bg-surface border border-outline-variant/30 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-primary"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Image upload per variant */}
                                <div>
                                  <label className="block text-xs text-on-surface-variant font-semibold mb-1">Imagen del tipo</label>
                                  {v.imagePreview || v.image ? (
                                    <div className="relative h-32 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low flex items-center justify-center group">
                                      <img src={v.imagePreview || v.image} alt={v.title} className="max-h-full max-w-full object-contain" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateVariant(v.id, 'imagePreview', '');
                                          updateVariant(v.id, 'image', null);
                                        }}
                                        className="absolute top-2 right-2 bg-error text-on-error rounded-full p-1.5 transition-colors shadow opacity-0 group-hover:opacity-100"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-outline-variant/40 hover:border-primary bg-surface-container-low/30 hover:bg-primary/5 transition-all cursor-pointer text-center group">
                                      <span className="material-symbols-outlined text-[2rem] text-outline group-hover:text-primary transition-colors">add_photo_alternate</span>
                                      <span className="text-xs text-outline mt-1 group-hover:text-primary">Subir imagen</span>
                                      <input type="file" accept="image/*" onChange={e => handleVariantImage(v.id, e)} className="hidden" />
                                    </label>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add variant button */}
                          <button
                            type="button"
                            onClick={addVariant}
                            className="w-full border-2 border-dashed border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Agregar otro tipo
                          </button>
                        </div>
                      )}

                      <div className="md:col-span-2 space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Descripción del Producto</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isSubmitting || isPublished}
                          placeholder="Describe la condición, rareza, y detalles únicos del producto..."
                          rows="4"
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                        ></textarea>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {activeTab === 'featured' && (
                <div className="space-y-xl animate-fade-in relative">
                  {/* Sticky notification banner for pending changes */}
                  {hasPendingFeaturedChanges && (
                    <div className="sticky top-4 z-30 bg-primary text-on-primary p-md rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-base border border-primary-container animate-fade-in">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[26px]">pending_actions</span>
                        <div>
                          <h4 className="font-bold text-sm">Tienes {pendingFeaturedChanges.length} cambio(s) pendiente(s) por guardar</h4>
                          <p className="text-xs opacity-90">Las modificaciones no se guardarán en la tienda hasta que confirmes los cambios.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleDiscardFeaturedChanges}
                          disabled={isSavingFeatured}
                          className="px-3.5 py-2 rounded-lg bg-on-primary/10 hover:bg-on-primary/20 text-on-primary text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">undo</span>
                          Descartar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmFeaturedChanges}
                          disabled={isSavingFeatured}
                          className="px-5 py-2 rounded-lg bg-surface text-primary hover:bg-surface-container-high text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          {isSavingFeatured ? (
                            <>
                              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Confirmar Cambios ({pendingFeaturedChanges.length})
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success notification */}
                  {featuredSaveSuccess && (
                    <div className="bg-tertiary-container/30 border border-tertiary/30 text-on-tertiary-container p-md rounded-xl flex items-center gap-3 animate-fade-in">
                      <span className="material-symbols-outlined text-tertiary text-[24px]">check_circle</span>
                      <div>
                        <p className="font-bold text-sm">¡Cambios guardados con éxito!</p>
                        <p className="text-xs opacity-90">Los productos destacados y el carrusel se han actualizado en la tienda.</p>
                      </div>
                    </div>
                  )}

                  {/* Banners del Header Section */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[26px]">ad_units</span>
                          <h2 className="font-headline-lg text-headline-lg text-on-surface">Banners del Header (Cuadro Superior)</h2>
                        </div>
                        <p className="text-on-surface-variant text-body-md mt-1">
                          Sube y administra las imágenes rotativas que aparecen en el recuadro superior del menú de navegación. Puedes ajustar la posición exacta con vista previa en tiempo real.
                        </p>
                      </div>

                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                        Subir Imagen para Header
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleOpenNewBannerCrop(e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>

                    {loadingHeaderBanners ? (
                      <div className="py-12 text-center text-primary flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                        <p className="text-xs text-on-surface-variant font-semibold">Cargando banners del header...</p>
                      </div>
                    ) : headerBannersList.length === 0 ? (
                      <div className="p-8 rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low text-center">
                        <span className="material-symbols-outlined text-[40px] text-outline opacity-40 mb-1">gallery_thumbnail</span>
                        <p className="text-on-surface text-sm font-bold">No hay banners personalizados en el header</p>
                        <p className="text-outline text-xs mt-1">Se están mostrando los 3 banners por defecto. ¡Haz clic en "Subir Imagen para Header" para agregar el primero!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {headerBannersList.map((banner, index) => (
                          <div
                            key={banner.id}
                            className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col group hover:border-primary/50 transition-all shadow-sm"
                          >
                            {/* Preview Frame matching Header Banner Aspect Ratio */}
                            <div className="relative w-full h-24 sm:h-28 bg-black/40 overflow-hidden border-b border-outline-variant/20">
                              <img
                                src={banner.image_url}
                                alt={banner.title || `Banner ${index + 1}`}
                                style={{
                                  objectPosition: `${banner.position_x ?? 50}% ${banner.position_y ?? 50}%`
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                                #{index + 1}
                              </div>
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-primary/80 backdrop-blur-xs text-white text-[10px] font-bold">
                                X: {banner.position_x ?? 50}% | Y: {banner.position_y ?? 50}%
                              </div>
                            </div>

                            {/* Details & Actions */}
                            <div className="p-3 flex flex-col justify-between flex-grow gap-3">
                              <div>
                                <h4 className="font-bold text-xs text-on-surface truncate">
                                  {banner.title || 'Sin título especificado'}
                                </h4>
                                <p className="text-[11px] text-on-surface-variant truncate mt-0.5 flex items-center gap-1">
                                  <span>Destino:</span>
                                  <span className="text-primary font-semibold truncate">
                                    {getBannerDestinationLabel(banner.link_url)}
                                  </span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                                <button
                                  type="button"
                                  onClick={() => handleEditBannerCrop(banner)}
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-primary/10 text-primary border border-outline-variant/30 text-xs font-bold transition-all flex items-center justify-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">crop</span>
                                  Ajustar Posición
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBannerToDelete(banner)}
                                  className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                                  title="Eliminar banner"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Header info */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Control de Productos en la Landing Page</h2>
                        <p className="text-on-surface-variant text-body-md mt-1">
                          Desde aquí puedes decidir qué productos se muestran en el Carrusel Superior (Hero) y cuáles en la marquesina de Productos Destacados de la página de inicio.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasPendingFeaturedChanges ? (
                          <>
                            <button
                              type="button"
                              onClick={handleDiscardFeaturedChanges}
                              disabled={isSavingFeatured}
                              className="px-3.5 py-2 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">undo</span>
                              Descartar
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmFeaturedChanges}
                              disabled={isSavingFeatured}
                              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              {isSavingFeatured ? (
                                <>
                                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  Confirmar Cambios ({pendingFeaturedChanges.length})
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-xs font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                            Sin cambios pendientes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-6 border-t border-outline-variant/20 pt-6">
                      {/* Left Column: Top Carousel (Hero/Banner) */}
                      <div className="space-y-base">
                        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary font-variation-settings-'FILL'_1" style={{ fontVariationSettings: '"FILL" 1' }}>view_carousel</span>
                          Carrusel Superior (Hero / Banner) ({dbProducts.filter(p => p.division === 'hero').length})
                        </h3>
                        <p className="text-xs text-on-surface-variant mb-4">
                          Estos productos rotarán en la sección superior con banners autogenerados basados en su información.
                        </p>

                        {dbProducts.filter(p => p.division === 'hero').length === 0 ? (
                          <div className="p-md rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low text-center">
                            <span className="material-symbols-outlined text-[36px] text-outline opacity-40 mb-1">browse_gallery</span>
                            <p className="text-on-surface-variant text-xs font-semibold">Sin productos en el carrusel.</p>
                            <p className="text-outline text-[10px] mt-0.5">Se mostrarán los banners estáticos predeterminados.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-base max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                            {dbProducts.filter(p => p.division === 'hero').map(p => {
                              const isPending = (originalFeaturedState[p.id]?.division || null) !== p.division;
                              return (
                                <div key={p.id} className={`bg-surface-container-low rounded-xl overflow-hidden border flex flex-col group relative ${isPending ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-outline-variant/30'}`}>
                                  <img src={p.image} alt={p.name} className="h-28 w-full object-cover" />
                                  {isPending && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                      Pendiente
                                    </span>
                                  )}
                                  <div className="p-sm flex flex-col justify-between flex-grow gap-sm">
                                    <div>
                                      <span className="text-[9px] text-primary uppercase font-bold tracking-wider">{p.category}</span>
                                      <h4 className="font-bold text-on-surface text-xs line-clamp-1 mt-0.5">{p.name}</h4>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHero(p.id, p.division)}
                                      className="w-full py-1.5 bg-error/10 hover:bg-error text-error hover:text-on-error rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">close</span>
                                      Quitar de Carrusel
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Marquesina Destacados */}
                      <div className="space-y-base">
                        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary font-variation-settings-'FILL'_1" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          Marquesina de Destacados ({dbProducts.filter(p => p.featured).length})
                        </h3>
                        <p className="text-xs text-on-surface-variant mb-4">
                          Estos productos aparecerán en la marquesina giratoria de destacados en la landing.
                        </p>

                        {dbProducts.filter(p => p.featured).length === 0 ? (
                          <div className="p-md rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low text-center">
                            <span className="material-symbols-outlined text-[36px] text-outline opacity-40 mb-1">star_half</span>
                            <p className="text-on-surface-variant text-xs font-semibold">Sin productos en destacados.</p>
                            <p className="text-outline text-[10px] mt-0.5">Se mostrarán los primeros 4 por defecto.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-base max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                            {dbProducts.filter(p => p.featured).map(p => {
                              const isPending = (originalFeaturedState[p.id]?.featured || false) !== p.featured;
                              return (
                                <div key={p.id} className={`bg-surface-container-low rounded-xl overflow-hidden border flex flex-col group relative ${isPending ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-outline-variant/30'}`}>
                                  <img src={p.image} alt={p.name} className="h-28 w-full object-cover" />
                                  {isPending && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                      Pendiente
                                    </span>
                                  )}
                                  <div className="p-sm flex flex-col justify-between flex-grow gap-sm">
                                    <div>
                                      <span className="text-[9px] text-primary uppercase font-bold tracking-wider">{p.category}</span>
                                      <h4 className="font-bold text-on-surface text-xs line-clamp-1 mt-0.5">{p.name}</h4>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeatured(p.id, p.featured)}
                                      className="w-full py-1.5 bg-error/10 hover:bg-error text-error hover:text-on-error rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">close</span>
                                      Quitar de Destacados
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* All products list for searching and featuring */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-base mb-6">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">Catálogo de Productos</h3>
                        <p className="text-on-surface-variant text-xs mt-0.5">Busca cualquier producto de la tienda para agregarlo o removerlo de las secciones de la Landing Page.</p>
                      </div>

                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-base w-full md:w-auto items-stretch">
                        {/* Search */}
                        <div className="relative flex-grow sm:flex-grow-0 group">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                            search
                          </span>
                          <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={featuredSearch}
                            onChange={(e) => setFeaturedSearch(e.target.value)}
                            className="bg-surface border border-outline-variant/30 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-primary w-full sm:w-56 text-on-surface"
                          />
                        </div>
                        {/* Category Selector */}
                        <div className="w-full sm:w-48 shrink-0 relative z-20 focus-within:z-50">
                          <CustomDropdown
                            value={featuredCategory}
                            onChange={(val) => setFeaturedCategory(typeof val === 'string' ? val : (val?.target?.value || ''))}
                            options={restockCategoryOptions}
                            placeholder="Filtrar por Categoría"
                          />
                        </div>
                        {/* Reset Button */}
                        {(featuredSearch || featuredCategory) && (
                          <button
                            onClick={() => { setFeaturedSearch(''); setFeaturedCategory(''); }}
                            className="py-2 px-4 rounded-lg bg-surface border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                          >
                            Limpiar
                          </button>
                        )}

                        {/* Sync all TCG Prices Button */}
                        <button
                          type="button"
                          onClick={handleSyncAllTcgPrices}
                          disabled={isSyncingAllPrices}
                          title="Sincronizar precios de todas las cartas TCG con TCGPlayer"
                          className="py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isSyncingAllPrices ? 'animate-spin' : ''}`}>
                            sync
                          </span>
                          <span>{isSyncingAllPrices ? 'Sincronizando...' : 'Sincronizar Precios TCG'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Table or Grid of all products */}
                    {dbProducts.filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(featuredSearch.toLowerCase());
                      const matchesCategory = featuredCategory ? p.categorySlug === featuredCategory : true;
                      return matchesSearch && matchesCategory;
                    }).length === 0 ? (
                      <div className="p-xl text-center text-on-surface-variant text-body-md font-semibold border border-dashed border-outline-variant/30 rounded-xl">
                        No se encontraron productos coincidentes con los filtros de búsqueda.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-outline-variant/30 rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                              <th className="px-md py-4">Producto</th>
                              <th className="px-md py-4">Categoría</th>
                              <th className="px-md py-4 text-center">Precio</th>
                              <th className="px-md py-4 text-center">Carrusel Superior</th>
                              <th className="px-md py-4 text-center">Sección Destacados</th>
                              <th className="px-md py-4 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20">
                            {dbProducts
                              .filter(p => {
                                const matchesSearch = p.name.toLowerCase().includes(featuredSearch.toLowerCase());
                                const matchesCategory = featuredCategory ? p.categorySlug === featuredCategory : true;
                                return matchesSearch && matchesCategory;
                              })
                              .map(p => {
                                const orig = originalFeaturedState[p.id] || { featured: false, division: null };
                                const heroPending = (orig.division || null) !== (p.division || null);
                                const featuredPending = (orig.featured || false) !== (p.featured || false);
                                const rowHasPending = heroPending || featuredPending;
                                return (
                                  <tr key={p.id} className={`transition-colors ${rowHasPending ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-surface-container-low/50'}`}>
                                    <td className="px-md py-4">
                                      <div className="flex items-center gap-3">
                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-outline-variant/30" />
                                        <div className="flex flex-col">
                                          <span className="font-bold text-on-surface text-sm">{p.name}</span>
                                          {rowHasPending && (
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                              Cambio pendiente
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-md py-4 text-on-surface-variant text-xs font-semibold">{p.category}</td>
                                    <td className="px-md py-4 text-center">
                                      <div className="flex flex-col items-center justify-center">
                                        <span className="text-xs font-bold text-on-surface">
                                          ${Number(p.price || 0).toFixed(2)}
                                        </span>
                                        {p.auto_sync_price && (
                                          <span className="inline-flex items-center gap-0.5 text-[9px] text-primary font-semibold mt-0.5" title="Sincronización periódica activa con TCGPlayer">
                                            <span className="material-symbols-outlined text-[11px]">sync</span>
                                            Dinámico
                                          </span>
                                        )}
                                        {p.last_price_sync && (
                                          <span className="text-[9px] text-on-surface-variant/75" title={`Última sincronización: ${new Date(p.last_price_sync).toLocaleString()}`}>
                                            {new Date(p.last_price_sync).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Hero Carousel Toggle */}
                                    <td className="px-md py-4 text-center">
                                      <div className="flex flex-col items-center gap-1.5">
                                        {p.division === 'hero' ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                            En Carrusel
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-on-surface-variant/10 text-on-surface-variant">
                                            Inactivo
                                          </span>
                                        )}
                                        {heroPending && (
                                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                            ({p.division === 'hero' ? 'Pendiente agregar' : 'Pendiente quitar'})
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleHero(p.id, p.division)}
                                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5 ${p.division === 'hero'
                                            ? 'bg-outline-variant/20 hover:bg-error/15 text-on-surface-variant hover:text-error'
                                            : 'bg-primary text-on-primary hover:bg-primary/90'
                                            }`}
                                        >
                                          <span className="material-symbols-outlined text-[12px]">
                                            {p.division === 'hero' ? 'close' : 'view_carousel'}
                                          </span>
                                          {p.division === 'hero' ? 'Quitar' : 'Poner'}
                                        </button>
                                      </div>
                                    </td>

                                    {/* Featured Loop Toggle */}
                                    <td className="px-md py-4 text-center">
                                      <div className="flex flex-col items-center gap-1.5">
                                        {p.featured ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                            En Landing
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-on-surface-variant/10 text-on-surface-variant">
                                            No en Landing
                                          </span>
                                        )}
                                        {featuredPending && (
                                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                            ({p.featured ? 'Pendiente agregar' : 'Pendiente quitar'})
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleFeatured(p.id, p.featured)}
                                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5 ${p.featured
                                            ? 'bg-outline-variant/20 hover:bg-error/15 text-on-surface-variant hover:text-error'
                                            : 'bg-primary text-on-primary hover:bg-primary/90'
                                            }`}
                                        >
                                          <span className="material-symbols-outlined text-[12px]">
                                            {p.featured ? 'close' : 'star'}
                                          </span>
                                          {p.featured ? 'Quitar' : 'Poner'}
                                        </button>
                                      </div>
                                    </td>

                                    {/* Action Buttons */}
                                    <td className="px-md py-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {['TCG', 'Carta', 'Producto Sellado'].includes(p.category) && (
                                          <button
                                            type="button"
                                            onClick={() => handleSyncSingleProductPrice(p)}
                                            disabled={syncingProductId === p.id || isSyncingAllPrices}
                                            className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md font-bold transition-all disabled:opacity-50 cursor-pointer"
                                            title="Actualizar precio desde TCGPlayer ahora"
                                          >
                                            <span className={`material-symbols-outlined text-[14px] ${syncingProductId === p.id ? 'animate-spin' : ''}`}>
                                              sync
                                            </span>
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleEditClick(p)}
                                          className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5"
                                          title="Editar Producto"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">edit</span>
                                          Editar
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'restock' && (
                <div className="space-y-md animate-fade-in">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow overflow-hidden">
                    {/* Card header with inline filters */}
                    <div className="p-md border-b border-outline-variant/40 bg-surface-container-low/50 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h2 className="font-headline-md text-headline-md text-on-surface">Reabastecer Catálogo</h2>
                          <p className="text-xs text-on-surface-variant mt-0.5">Incrementa el stock de tus coleccionables y variantes.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportInventoryToExcel}
                          disabled={isExportingInventory || dbProducts.length === 0}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer shrink-0 self-start sm:self-auto"
                          title="Exportar todo el inventario de productos y variantes a Excel (.xlsx)"
                        >
                          {isExportingInventory ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Generando Excel...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">table_view</span>
                              <span>Exportar Inventario</span>
                            </>
                          )}
                        </button>
                      </div>
                      {/* Inline filters */}
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-1.5">Buscar Producto</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
                            <input
                              type="text"
                              value={restockSearch}
                              onChange={(e) => setRestockSearch(e.target.value)}
                              placeholder="Ej. Sleeves..."
                              className="w-full bg-surface border border-outline-variant/35 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-primary font-bold text-on-surface"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative z-20 focus-within:z-50">
                          <CustomDropdown
                            value={restockCategory}
                            onChange={(e) => setRestockCategory(e.target.value)}
                            options={restockCategoryOptions}
                            className="w-full bg-surface border border-outline-variant/35 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-bold text-on-surface"
                            align="full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setRestockSearch(''); setRestockCategory(''); }}
                          className="border border-outline-variant/40 hover:bg-surface-container-high text-xs font-bold px-4 py-2 rounded-lg transition-colors text-on-surface-variant flex items-center gap-1 shrink-0"
                        >
                          <span className="material-symbols-outlined text-[14px]">refresh</span>
                          Limpiar
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[11px] border-b border-outline-variant/30">
                          <tr>
                            <th className="px-md py-4">Producto</th>
                            <th className="px-md py-4">Categoría</th>
                            <th className="px-md py-4 text-center">Stock Total (Suma de Tipos)</th>
                            <th className="px-md py-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/35 align-middle">
                          {filteredRestockProducts.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-md py-8 text-center text-on-surface-variant text-xs font-semibold">
                                No se encontraron productos coincidentes con los filtros.
                              </td>
                            </tr>
                          ) : (
                            filteredRestockProducts.map((p) => {
                              const hasTypes = Boolean(p.colors && p.colors.length > 0);
                              const typesList = hasTypes
                                ? p.colors
                                : [{
                                    id: p.id,
                                    name: p.name,
                                    stock: p.stock !== undefined ? p.stock : (p.specifications?.Stock ? parseInt(p.specifications.Stock, 10) || 0 : (p.inStock ? 20 : 0)),
                                    price: p.price !== undefined ? parseFloat(p.price) : 0,
                                    image: p.image,
                                    inStock: p.inStock
                                  }];
                              const totalStock = hasTypes
                                ? p.colors.reduce((sum, c) => sum + (c.stock !== undefined ? (parseInt(c.stock, 10) || 0) : (c.inStock ? 20 : 0)), 0)
                                : (p.stock !== undefined ? (parseInt(p.stock, 10) || 0) : (p.specifications?.Stock ? parseInt(p.specifications.Stock, 10) || 0 : (p.inStock ? 20 : 0)));
                              const isExpanded = Boolean(expandedRestock[p.id]);

                              return (
                                <React.Fragment key={p.id}>
                                  {/* Main Product Row */}
                                  <tr className={`transition-colors ${isExpanded ? 'bg-primary/5' : 'hover:bg-surface-container-low/30'}`}>
                                    <td className="px-md py-4">
                                      <div className="flex items-center gap-sm">
                                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-outline-variant/30 shrink-0 bg-surface-container-low">
                                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-bold text-on-surface text-sm">{p.name}</span>
                                          <span className="text-[11px] text-on-surface-variant mt-0.5">
                                            {hasTypes ? `${p.colors.length} tipos` : '1 tipo'}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-md py-4 text-on-surface-variant text-xs font-semibold">{p.category}</td>
                                    <td className="px-md py-4 text-center">
                                      <div className="flex flex-col items-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStockBadgeClass(totalStock)}`}>
                                          {totalStock} ({getStockStatusText(totalStock)})
                                        </span>
                                        {hasTypes && (
                                          <span className="text-[10px] text-primary font-semibold mt-1 bg-primary/10 px-2 py-0.5 rounded-full">
                                            Suma de {p.colors.length} tipos
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-md py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleRestockExpand(p.id)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 border ${
                                            isExpanded
                                              ? 'bg-surface text-on-surface border-outline-variant/40'
                                              : 'bg-primary/10 text-primary border-primary/25 hover:bg-primary hover:text-on-primary'
                                          }`}
                                        >
                                          <span className="material-symbols-outlined text-[16px]">
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                          </span>
                                          {isExpanded ? 'Cerrar desplegable' : 'Desplegar tipos'}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setProductToDelete(p)}
                                          className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-error/5 rounded-full"
                                          title="Eliminar Producto"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Expanded Types Dropdown Subrow */}
                                  {isExpanded && (
                                    <tr className="bg-surface-container-low/40 border-b border-outline-variant/30">
                                      <td colSpan="4" className="p-0">
                                        <div className="py-3 px-4 sm:px-6 bg-gradient-to-r from-primary/5 via-surface-container-low/30 to-surface-container-low/10 border-l-4 border-primary">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                              <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
                                              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                                {hasTypes ? `Tipos de "${p.name}" (${p.colors.length} tipos)` : `Detalle de "${p.name}" (1 tipo)`}
                                              </span>
                                            </div>
                                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full w-fit">
                                              Suma total de tipos: {totalStock} unidades
                                            </span>
                                          </div>

                                          <div className="bg-surface rounded-lg border border-outline-variant/30 overflow-hidden shadow-xs">
                                            <table className="w-full text-left">
                                              <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[10px] border-b border-outline-variant/20">
                                                <tr>
                                                  <th className="px-4 py-2">Tipo / Variante</th>
                                                  <th className="px-4 py-2 text-center">Stock</th>
                                                  <th className="px-4 py-2 text-center">Precio</th>
                                                  <th className="px-4 py-2 text-center">Añadir Unidades</th>
                                                  <th className="px-4 py-2 text-right">Acciones</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-outline-variant/20">
                                                {typesList.map((item) => {
                                                  const isBaseItem = !hasTypes || item.id === p.id;
                                                  const variationKey = isBaseItem ? p.id : `${p.id}-${item.id}`;
                                                  const isEditingThis = editingVariantId === item.id;
                                                  const currentStock = item.stock !== undefined ? (parseInt(item.stock, 10) || 0) : (item.inStock ? 20 : 0);
                                                  const currentPrice = item.price !== undefined ? parseFloat(item.price) : parseFloat(p.price || 0);
                                                  return (
                                                    <tr key={variationKey} className={`transition-colors ${isEditingThis ? 'bg-primary/10' : 'hover:bg-primary/5'}`}>
                                                      <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                          <div className="w-8 h-8 rounded-md overflow-hidden border border-outline-variant/20 shrink-0 bg-surface-container">
                                                            <img src={item.image || item.imagePreview || p.image} alt={item.name} className="w-full h-full object-cover" />
                                                          </div>
                                                          <span className="font-semibold text-xs text-on-surface">{item.name}</span>
                                                        </div>
                                                      </td>
                                                      <td className="px-4 py-2.5 text-center">
                                                        {isEditingThis ? (
                                                          <input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            value={variantEditForm.stock}
                                                            onKeyDown={(e) => {
                                                              if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                                                                e.preventDefault();
                                                              }
                                                            }}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              if (val === '' || /^\d+$/.test(val)) {
                                                                setVariantEditForm(prev => ({ ...prev, stock: val }));
                                                              }
                                                            }}
                                                            className="w-20 bg-surface border-2 border-primary rounded-lg px-2 py-1 text-xs text-center outline-none font-bold text-on-surface focus:ring-2 focus:ring-primary/20"
                                                            autoFocus
                                                            placeholder="0"
                                                          />
                                                        ) : (
                                                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStockBadgeClass(currentStock)}`}>
                                                            {currentStock} ({getStockStatusText(currentStock)})
                                                          </span>
                                                        )}
                                                      </td>
                                                      <td className="px-4 py-2.5 text-center">
                                                        {isEditingThis ? (
                                                          <div className="inline-flex items-center gap-1">
                                                            <span className="text-xs font-bold text-on-surface-variant">$</span>
                                                            <input
                                                              type="number"
                                                              step="0.01"
                                                              min="0"
                                                              value={variantEditForm.price}
                                                              onChange={(e) => setVariantEditForm(prev => ({ ...prev, price: e.target.value }))}
                                                              className="w-20 bg-surface border-2 border-primary rounded-lg px-2 py-1 text-xs text-center outline-none font-bold text-on-surface focus:ring-2 focus:ring-primary/20"
                                                              placeholder="0.00"
                                                            />
                                                          </div>
                                                        ) : (
                                                          <span className="font-bold text-xs text-on-surface">
                                                            ${Number(currentPrice).toFixed(2)} MXN
                                                          </span>
                                                        )}
                                                      </td>
                                                      <td className="px-4 py-2.5 text-center">
                                                        {isEditingThis ? (
                                                          <span className="text-outline text-xs select-none">—</span>
                                                        ) : (
                                                          <input
                                                            type="number"
                                                            step="1"
                                                            min="1"
                                                            placeholder="Cant."
                                                            value={restockAmount[variationKey] || ''}
                                                            onKeyDown={(e) => {
                                                              if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                                                                e.preventDefault();
                                                              }
                                                            }}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              if (val === '' || /^\d+$/.test(val)) {
                                                                setRestockAmount(prev => ({ ...prev, [variationKey]: val }));
                                                              }
                                                            }}
                                                            className="w-20 bg-surface border border-outline-variant/30 rounded-lg px-2 py-1 text-xs text-center outline-none focus:border-primary font-bold text-on-surface"
                                                          />
                                                        )}
                                                      </td>
                                                      <td className="px-4 py-2.5 text-right">
                                                        {isEditingThis ? (
                                                          <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                              type="button"
                                                              disabled={isSavingVariant}
                                                              onClick={() => handleSaveEditVariant(p.id, isBaseItem ? null : item.id)}
                                                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center gap-1 disabled:opacity-50"
                                                              title="Confirmar cambios"
                                                            >
                                                              <span className="material-symbols-outlined text-[13px]">check</span> {isSavingVariant ? 'Guardando...' : 'Confirmar'}
                                                            </button>
                                                            <button
                                                              type="button"
                                                              disabled={isSavingVariant}
                                                              onClick={handleCancelEditVariant}
                                                              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold transition-all border border-outline-variant/40 flex items-center gap-1 disabled:opacity-50"
                                                              title="Cancelar edición"
                                                            >
                                                              <span className="material-symbols-outlined text-[13px]">close</span> Cancelar
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                              type="button"
                                                              onClick={() => handleRestockSubmit(p.id, restockAmount[variationKey], isBaseItem ? null : item.id)}
                                                              className="p-1.5 bg-primary text-on-primary rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center"
                                                              title="Actualizar Inventario"
                                                            >
                                                              <span className="material-symbols-outlined text-[16px]">sync</span>
                                                            </button>
                                                            <button
                                                              type="button"
                                                              onClick={() => handleStartEditVariant(item)}
                                                              className="p-1.5 bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary rounded-lg transition-all border border-outline-variant/30 flex items-center justify-center hover:scale-105 active:scale-95"
                                                              title="Editar"
                                                            >
                                                              <span className="material-symbols-outlined text-[16px]">edit</span>
                                                            </button>
                                                          </div>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (() => {
                const totalOrdersPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
                const paginatedOrders = orders.slice(
                  (ordersCurrentPage - 1) * ORDERS_PER_PAGE,
                  ordersCurrentPage * ORDERS_PER_PAGE
                );

                return (
                  <div className="space-y-md animate-fade-in">
                    {/* Header bar with Export Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-5 collector-card-shadow">
                      <div>
                        <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                          Registro de Pedidos
                        </h2>
                        <p className="text-on-surface-variant text-xs mt-0.5">
                          {orders.length === 1 ? '1 pedido registrado' : `${orders.length} pedidos registrados en total`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportOrdersToExcel}
                        disabled={isExportingOrders || orders.length === 0}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer shrink-0"
                        title="Exportar todos los pedidos a un archivo Excel (.xlsx)"
                      >
                        {isExportingOrders ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generando Excel...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">table_view</span>
                            <span>Exportar a Excel</span>
                          </>
                        )}
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 collector-card-shadow">
                        <span className="material-symbols-outlined text-[4rem] text-outline/35">receipt_long</span>
                        <h3 className="font-headline-md text-headline-md text-on-surface">No hay pedidos registrados</h3>
                        <p className="text-on-surface-variant text-xs max-w-sm">
                          Los pedidos que realicen los coleccionistas en la tienda aparecerán listados aquí para su procesamiento y validación.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[11px] border-b border-outline-variant/30">
                              <tr>
                                <th className="px-md py-4">Orden ID</th>
                                <th className="px-md py-4">Cliente</th>
                                <th className="px-md py-4">Detalle Compra</th>
                                <th className="px-md py-4">Punto Retiro</th>
                                <th className="px-md py-4 text-right">Total</th>
                                <th className="px-md py-4 text-center">Comprobante</th>
                                <th className="px-md py-4 text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/35 align-middle">
                              {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-surface-container-low/20 transition-colors">
                                  <td className="px-md py-4 align-top">
                                    <span className="font-mono font-bold text-primary block text-sm">{order.id}</span>
                                    <span className="text-[10px] text-outline block mt-0.5">{order.date}</span>
                                  </td>
                                  <td className="px-md py-4 align-top">
                                    <span className="font-bold text-on-surface block text-sm">{order.clientName}</span>
                                    {order.clientPhone && (
                                      <span className="text-xs text-primary font-semibold block">{order.clientPhone}</span>
                                    )}
                                    {order.clientEmail && order.clientEmail !== 'N/A' && (
                                      <span className="text-xs text-on-surface-variant block truncate max-w-[150px]">{order.clientEmail}</span>
                                    )}
                                  </td>
                                  <td className="px-md py-4 align-top">
                                    <div className="space-y-1">
                                      {order.items.map((item) => (
                                        <div key={`${item.product.id}-${item.color ? item.color.id : 'default'}`} className="text-xs text-on-surface-variant flex justify-between gap-4 max-w-[220px]">
                                          <span className="truncate flex flex-col">
                                            <span>{item.product.name}</span>
                                            {item.color && (
                                              <span className="text-[10px] text-outline font-semibold">Color: {item.color.name}</span>
                                            )}
                                          </span>
                                          <span className="font-semibold text-on-surface shrink-0">x{item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-md py-4 align-top">
                                    <span className="text-xs font-medium text-on-surface-variant block mt-0.5">{order.pickupLocation}</span>
                                  </td>
                                  <td className="px-md py-4 align-top text-right font-bold text-on-surface text-sm">
                                    ${order.total.toFixed(2)}
                                  </td>
                                  <td className="px-md py-4 align-top text-center">
                                    {order.paymentProofPreview ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedProofUrl(order.paymentProofPreview)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all transform active:scale-95"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                        Ver recibo
                                      </button>
                                    ) : (
                                      <span className="text-xs text-outline font-medium">Sin comprobante</span>
                                    )}
                                  </td>
                                  <td className="px-md py-4 align-top text-center">
                                    <div className="w-36 mx-auto">
                                      <CustomDropdown
                                        value={order.status}
                                        onChange={(val) => handleStatusChange(order.id, val)}
                                        options={orderStatusOptions}
                                        align="full"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination controls */}
                        {totalOrdersPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-md py-4 border-t border-outline-variant/30 bg-surface-container-low">
                            <div className="text-xs text-on-surface-variant font-medium">
                              Mostrando <span className="font-bold text-on-surface">{Math.min(orders.length, (ordersCurrentPage - 1) * ORDERS_PER_PAGE + 1)}</span> a <span className="font-bold text-on-surface">{Math.min(orders.length, ordersCurrentPage * ORDERS_PER_PAGE)}</span> de <span className="font-bold text-on-surface">{orders.length}</span> pedidos
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={ordersCurrentPage === 1}
                                onClick={() => setOrdersCurrentPage(prev => Math.max(1, prev - 1))}
                                className="p-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                              >
                                <span className="material-symbols-outlined text-[20px] block">chevron_left</span>
                              </button>
                              
                              {Array.from({ length: totalOrdersPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setOrdersCurrentPage(pageNum)}
                                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                                    ordersCurrentPage === pageNum
                                      ? 'bg-primary text-on-primary shadow-sm'
                                      : 'text-on-surface hover:bg-surface-container-high'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              ))}

                              <button
                                type="button"
                                disabled={ordersCurrentPage === totalOrdersPages}
                                onClick={() => setOrdersCurrentPage(prev => Math.min(totalOrdersPages, prev + 1))}
                                className="p-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                              >
                                <span className="material-symbols-outlined text-[20px] block">chevron_right</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

        </section>

      </div>

      {/* Lightbox Modal for Receipt Verification */}
      {selectedProofUrl && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProofUrl(null);
            }
          }}
          className="fixed inset-0 bg-on-background/70 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-surface rounded-2xl max-w-lg w-full overflow-hidden border border-outline-variant/30 shadow-2xl relative flex flex-col max-h-[90vh] cursor-default">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-headline-md font-montserrat text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-[1.2em]">receipt</span>
                Comprobante de Pago
              </h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Cerrar comprobante"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto flex items-center justify-center bg-surface-container-low">
              <img
                src={selectedProofUrl}
                alt="Comprobante de Pago Completo"
                className="max-w-full max-h-[60vh] rounded-lg object-contain shadow-md"
              />
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:scale-105 transition-transform text-xs font-bold"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setProductToDelete(null);
            }
          }}
          className="fixed inset-0 bg-on-background/70 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-surface rounded-2xl max-w-md w-full overflow-hidden border border-outline-variant/30 shadow-2xl relative p-6 flex flex-col gap-4 text-center cursor-default">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[36px]">warning</span>
            </div>

            <h3 className="text-headline-md font-bold text-on-background">
              ¿Eliminar Producto?
            </h3>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Estás a punto de eliminar permanentemente el producto <span className="font-bold text-on-surface">"{productToDelete.name}"</span> y todas sus variantes de catálogo.
            </p>

            <div className="p-3.5 bg-error-container/20 border border-error/25 rounded-xl text-left flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">info</span>
              <p className="text-xs text-error font-semibold leading-relaxed">
                Esta acción no se puede deshacer. El producto y su stock se borrarán definitivamente de la base de datos.
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-surface-container-high text-on-surface font-semibold text-xs py-3 rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="flex-1 bg-error text-on-error font-semibold text-xs py-3 rounded-xl hover:bg-error/90 hover:scale-[1.01] transition-all"
              >
                Eliminar para siempre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar Banner del Header */}
      {bannerToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setBannerToDelete(null)}
        >
          <div
            className="bg-surface rounded-2xl max-w-md w-full overflow-hidden border border-outline-variant/30 shadow-2xl relative p-6 flex flex-col gap-4 text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[36px]">delete_forever</span>
            </div>

            <h3 className="text-headline-md font-bold text-on-background">
              ¿Eliminar Banner del Header?
            </h3>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Estás a punto de eliminar este banner del header. Dejará de rotar en la barra superior.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="flex-1 bg-surface-container-high text-on-surface font-semibold text-xs py-3 rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="flex-1 bg-error text-on-error font-semibold text-xs py-3 rounded-xl hover:bg-error/90 hover:scale-[1.01] transition-all"
              >
                Eliminar Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interactivo de Posicionamiento / Enfoque del Header Banner */}
      {cropModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in select-none"
          onClick={() => !isSavingBanner && setCropModalOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl max-w-2xl w-full border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col my-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">crop</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    Ajustar Posición del Banner para el Header
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Arrastra la imagen directamente o usa los controles para calibrar el encuadre exacto.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingBanner}
                onClick={() => setCropModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">

              {/* Exact Header Aspect Ratio Showcase Box */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold text-on-surface-variant mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-teal-accent">visibility</span>
                  Vista Previa en Tiempo Real (mismo tamaño y estilo del Header)
                </div>

                {/* Box replica */}
                <div
                  onMouseDown={handleBannerDragStart}
                  onMouseMove={handleBannerDragMove}
                  onMouseUp={handleBannerDragEnd}
                  onMouseLeave={handleBannerDragEnd}
                  onTouchStart={handleBannerDragStart}
                  onTouchMove={handleBannerDragMove}
                  onTouchEnd={handleBannerDragEnd}
                  className={`w-full max-w-[560px] h-24 sm:h-28 rounded-xl sm:rounded-2xl border-2 border-teal-accent/80 bg-black/40 overflow-hidden relative shadow-lg touch-none ${
                    isDraggingBanner ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                  title="Arrastra con el mouse o dedo para reposicionar"
                >
                  <img
                    src={cropModalData.previewUrl}
                    alt="Preview"
                    draggable={false}
                    style={{
                      objectPosition: `${cropModalData.position_x}% ${cropModalData.position_y}%`
                    }}
                    className="w-full h-full object-cover pointer-events-none transition-none"
                  />

                  {/* Top-bottom gradient matching header */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                  {/* Drag indicator overlay */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
                    <span className="material-symbols-outlined text-[12px]">drag_pan</span>
                    Arrastra para posicionar
                  </div>

                  {/* Coordinates pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-teal-accent text-slate-950 text-[10px] font-bold shadow pointer-events-none">
                    X: {cropModalData.position_x}% | Y: {cropModalData.position_y}%
                  </div>
                </div>
              </div>

              {/* Quick Preset Alignments */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">filter_center_focus</span>
                  Alineaciones Rápidas:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCropModalData(prev => ({ ...prev, position_x: 50, position_y: 50 }))}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Centro (50%, 50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModalData(prev => ({ ...prev, position_x: 50, position_y: 0 }))}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Arriba
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModalData(prev => ({ ...prev, position_x: 50, position_y: 100 }))}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Abajo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModalData(prev => ({ ...prev, position_x: 0, position_y: 50 }))}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Izquierda
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModalData(prev => ({ ...prev, position_x: 100, position_y: 50 }))}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Derecha
                  </button>
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">Eje Horizontal (X)</span>
                    <span className="font-mono text-primary font-bold">{cropModalData.position_x}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropModalData.position_x}
                    onChange={(e) => setCropModalData(prev => ({ ...prev, position_x: parseInt(e.target.value, 10) }))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>Izquierda (0%)</span>
                    <span>Derecha (100%)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">Eje Vertical (Y)</span>
                    <span className="font-mono text-primary font-bold">{cropModalData.position_y}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropModalData.position_y}
                    onChange={(e) => setCropModalData(prev => ({ ...prev, position_y: parseInt(e.target.value, 10) }))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>Arriba (0%)</span>
                    <span>Abajo (100%)</span>
                  </div>
                </div>
              </div>

              {/* Title & Link Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Título / Descripción del Banner
                  </label>
                  <input
                    type="text"
                    value={cropModalData.title}
                    onChange={(e) => setCropModalData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Promoción Yu-Gi-Oh!"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Enlace de Destino (Filtro de Productos)
                  </label>
                  <CustomDropdown
                    value={normalizeBannerLinkUrl(cropModalData.link_url)}
                    onChange={(val) => {
                      const cleanVal = normalizeBannerLinkUrl(val);
                      setCropModalData(prev => ({ ...prev, link_url: cleanVal }));
                    }}
                    options={headerBannerDestinationOptions}
                    openDirection="up"
                    placeholder="Selecciona el filtro o destino"
                    align="full"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSavingBanner}
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingBanner}
                onClick={handleSaveBannerCrop}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isSavingBanner ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Guardando en Supabase...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Guardar Banner y Posición
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Administrar y Editar Sets del TCG */}
      {isManageSetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                  Administrar Sets de {tcg}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Agrega nuevos sets o edita el nombre de sets ya registrados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsManageSetsModalOpen(false);
                  setModalEditingSetId(null);
                  setModalEditingSetName('');
                }}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Add Bar */}
            <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
              <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Agregar Nuevo Set a {tcg}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modalNewSetName}
                  onChange={(e) => setModalNewSetName(e.target.value)}
                  placeholder="Nombre de la nueva expansión o set..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface border border-outline-variant/40 text-on-surface focus:outline-hidden focus:border-primary font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (modalNewSetName.trim()) {
                        handleSaveNewSet(modalNewSetName);
                        setModalNewSetName('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!modalNewSetName.trim() || isSavingSet}
                  onClick={() => {
                    if (modalNewSetName.trim()) {
                      handleSaveNewSet(modalNewSetName);
                      setModalNewSetName('');
                    }
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar
                </button>
              </div>
            </div>

            {/* Sets List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
              <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Sets Registrados ({currentSetsForTcg.length})</span>
                <span className="text-[10px] text-outline font-normal">Haz clic en el lápiz para editar el nombre</span>
              </div>

              {currentSetsForTcg.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  No hay sets registrados aún para este juego.
                </div>
              ) : (
                currentSetsForTcg.map((s) => {
                  const isEditingThis = modalEditingSetId === s.id;
                  const isSelectedInForm = setNameVal === s.name;

                  return (
                    <div
                      key={s.id || s.name}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isSelectedInForm
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low/40'
                      }`}
                    >
                      {isEditingThis ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={modalEditingSetName}
                            onChange={(e) => setModalEditingSetName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-secondary text-on-surface focus:outline-hidden font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditSetFromModal(s.id, s.name, modalEditingSetName);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditSetFromModal(s.id, s.name, modalEditingSetName)}
                            className="px-2.5 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                            title="Guardar nombre editado"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalEditingSetId(null);
                              setModalEditingSetName('');
                            }}
                            className="px-2 py-1.5 border border-outline-variant/40 text-outline hover:text-on-surface rounded-lg text-xs transition-all cursor-pointer shrink-0"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                              style
                            </span>
                            <span className="text-xs font-semibold text-on-surface truncate">
                              {s.name}
                            </span>
                            {isSelectedInForm && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                                Activo en formulario
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setModalEditingSetId(s.id);
                                setModalEditingSetName(s.name);
                              }}
                              className="p-1.5 rounded-lg hover:bg-surface-container-high text-secondary hover:text-secondary-fixed-dim transition-colors cursor-pointer"
                              title="Editar nombre de este set"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSet(s.id, s.name)}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors cursor-pointer"
                              title="Eliminar set"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManageSetsModalOpen(false);
                  setModalEditingSetId(null);
                  setModalEditingSetName('');
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Listo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal para Administrar, Editar y Eliminar TCGs */}
      {isManageTcgsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">style</span>
                  Administrar Juegos de Cartas (TCGs)
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Agrega nuevos juegos, edita sus nombres o elimínalos de la lista.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsManageTcgsModalOpen(false);
                  setModalEditingTcgId(null);
                  setModalEditingTcgName('');
                }}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Add Bar */}
            <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
              <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Agregar Nuevo TCG
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modalNewTcgName}
                  onChange={(e) => setModalNewTcgName(e.target.value)}
                  placeholder="Ej. Battle Spirits, Gundam Card Game..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface border border-outline-variant/40 text-on-surface focus:outline-hidden focus:border-primary font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (modalNewTcgName.trim()) {
                        handleSaveNewTcg(modalNewTcgName);
                        setModalNewTcgName('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!modalNewTcgName.trim() || isSavingTcg}
                  onClick={() => {
                    if (modalNewTcgName.trim()) {
                      handleSaveNewTcg(modalNewTcgName);
                      setModalNewTcgName('');
                    }
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar
                </button>
              </div>
            </div>

            {/* TCGs List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
              <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>TCGs Registrados ({currentTcgsList.length})</span>
                <span className="text-[10px] text-outline font-normal">Haz clic en el lápiz para editar</span>
              </div>

              {currentTcgsList.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  No hay juegos de cartas registrados aún.
                </div>
              ) : (
                currentTcgsList.map((t) => {
                  const isEditingThis = modalEditingTcgId === t.id;
                  const isSelectedInForm = tcg === t.name;

                  return (
                    <div
                      key={t.id || t.name}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isSelectedInForm
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low/40'
                      }`}
                    >
                      {isEditingThis ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={modalEditingTcgName}
                            onChange={(e) => setModalEditingTcgName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-secondary text-on-surface focus:outline-hidden font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditTcgFromModal(t.id, t.name, modalEditingTcgName);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditTcgFromModal(t.id, t.name, modalEditingTcgName)}
                            className="px-2.5 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                            title="Guardar nombre editado"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalEditingTcgId(null);
                              setModalEditingTcgName('');
                            }}
                            className="px-2 py-1.5 border border-outline-variant/40 text-outline hover:text-on-surface rounded-lg text-xs transition-all cursor-pointer shrink-0"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                              style
                            </span>
                            <span className="text-xs font-semibold text-on-surface truncate">
                              {t.name}
                            </span>
                            {isSelectedInForm && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                                Activo en formulario
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setModalEditingTcgId(t.id);
                                setModalEditingTcgName(t.name);
                              }}
                              className="p-1.5 rounded-lg hover:bg-surface-container-high text-secondary hover:text-secondary-fixed-dim transition-colors cursor-pointer"
                              title="Editar nombre de este TCG"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTcg(t.id, t.name)}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-outline hover:text-error transition-colors cursor-pointer"
                              title="Eliminar TCG"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManageTcgsModalOpen(false);
                  setModalEditingTcgId(null);
                  setModalEditingTcgName('');
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Listo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Syncing in Progress Floating Notification */}
      {isSyncingAllPrices && syncProgress && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-auto">
          <div className="bg-surface-container-high border border-primary/40 text-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-primary text-[26px] animate-spin shrink-0">
              sync
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>Sincronizando Precios TCG</span>
                <span className="text-[11px] font-semibold text-primary">{syncProgress.current}/{syncProgress.total}</span>
              </div>
              <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                {syncProgress.productName}
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${syncProgress.total > 0 ? (syncProgress.current / syncProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Result Summary Modal */}
      {syncResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Sincronización de Precios TCG</h3>
                  <p className="text-[11px] text-on-surface-variant">Resultado de actualización con TCGPlayer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncResultModal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Stats */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">Actualizados</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{syncResultModal.updated}</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">Sin cambios</span>
                  <span className="text-xl font-extrabold text-on-surface">{syncResultModal.unchanged}</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 text-center">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">Omitidos</span>
                  <span className="text-xl font-extrabold text-error">{syncResultModal.failed}</span>
                </div>
              </div>

              {/* Updated list details */}
              {syncResultModal.updatedProducts && syncResultModal.updatedProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-on-surface mb-2">Cartas con nuevo precio:</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {syncResultModal.updatedProducts.map((u, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs">
                        <span className="font-medium text-on-surface truncate pr-2">{u.productName}</span>
                        <div className="shrink-0 flex items-center gap-1 font-bold">
                          <span className="text-on-surface-variant/70 line-through">${u.oldPrice.toFixed(2)}</span>
                          <span className="text-on-surface-variant">→</span>
                          <span className="text-emerald-600 dark:text-emerald-400">${u.newPrice.toFixed(2)} USD</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {syncResultModal.eligible === 0 && (
                <div className="p-4 text-center text-xs text-on-surface-variant italic">
                  No hay productos con actualización dinámica activa o de categoría TCG.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end">
              <button
                type="button"
                onClick={() => setSyncResultModal(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
