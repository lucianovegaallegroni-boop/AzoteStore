const CATEGORY_PREFIX = '__CATEGORY__';

export const DEFAULT_PRODUCT_CATEGORIES_CONFIG = [
  { name: 'Sleeve', icon: 'layers' },
  { name: 'TCG', icon: 'playing_cards' },
  { name: 'Producto Sellado', icon: 'inventory_2' },
  { name: 'Accesorios', icon: 'extension' },
  { name: 'Binder/Folders', icon: 'menu_book' }
];

export const DEFAULT_PRODUCT_CATEGORIES = DEFAULT_PRODUCT_CATEGORIES_CONFIG.map((c) => c.name);

export const AVAILABLE_CATEGORY_ICONS = [
  { value: 'category', label: 'Categoría' },
  { value: 'playing_cards', label: 'Cartas / TCG' },
  { value: 'style', label: 'Colección / Deck' },
  { value: 'layers', label: 'Sleeves / Protectores' },
  { value: 'inventory_2', label: 'Caja / Sellado' },
  { value: 'menu_book', label: 'Binder / Álbum' },
  { value: 'extension', label: 'Accesorios / Pieza' },
  { value: 'casino', label: 'Dados / Casino' },
  { value: 'sports_esports', label: 'Juegos / Gaming' },
  { value: 'redeem', label: 'Set de Regalo / Promo' },
  { value: 'workspace_premium', label: 'Edición Especial' },
  { value: 'star', label: 'Destacado / Estrella' },
  { value: 'diamond', label: 'Joya / Rareza' },
  { value: 'auto_awesome', label: 'Brillo / Foil' },
  { value: 'shield', label: 'Protección / Toploader' },
  { value: 'folder_special', label: 'Carpeta Especial' },
  { value: 'backpack', label: 'Estuche / Mochila' },
  { value: 'shopping_bag', label: 'Bolsa / Merch' },
  { value: 'store', label: 'Tienda / Oficial' },
  { value: 'emoji_events', label: 'Torneo / Trofeo' }
];

export const getCategorySlug = (name) => {
  return (name || '').toLowerCase().trim().replace(/\s+/g, '-');
};

export const getCategoryIcon = (name, explicitIcon = null) => {
  if (explicitIcon && typeof explicitIcon === 'string' && explicitIcon.trim()) {
    return explicitIcon.trim();
  }
  const n = (name || '').toLowerCase();
  if (n.includes('tcg') || n.includes('carta')) return 'playing_cards';
  if (n.includes('sleeve') || n.includes('protector')) return 'layers';
  if (n.includes('sellado') || n.includes('box') || n.includes('caja') || n.includes('sobre')) return 'inventory_2';
  if (n.includes('binder') || n.includes('folder') || n.includes('album') || n.includes('álbum') || n.includes('carpeta')) return 'menu_book';
  if (n.includes('accesorio') || n.includes('playmat') || n.includes('dado') || n.includes('deckbox') || n.includes('deck box')) return 'extension';
  return 'category';
};

/**
 * Codifica o decodifica el campo `tcg` en la tabla de respaldo `tcg_sets`:
 * Formato: `__CATEGORY__::<icon>` (o `__CATEGORY__` por compatibilidad).
 */
const encodeCategoryTcgField = (icon) => {
  const cleanIcon = (icon || '').trim();
  return cleanIcon ? `${CATEGORY_PREFIX}::${cleanIcon}` : CATEGORY_PREFIX;
};

const extractIconFromTcgField = (tcgField, categoryName) => {
  if (typeof tcgField === 'string' && tcgField.startsWith(`${CATEGORY_PREFIX}::`)) {
    const icon = tcgField.slice(`${CATEGORY_PREFIX}::`.length).trim();
    if (icon) return icon;
  }
  return getCategoryIcon(categoryName);
};

export const isTcgOrSealedCategory = (name) => {
  const n = (name || '').toLowerCase().trim();
  return n === 'tcg' || n === 'carta' || n === 'cartas' || n === 'producto sellado' || n === 'producto-sellado';
};

let seedingPromise = null;

/**
 * Carga la lista de tipos de producto (categorías) desde Supabase.
 * Intenta usar `product_categories` si existe, y si no está creada usa `tcg_sets` con tcg LIKE '__CATEGORY__%'.
 */
export async function fetchProductCategories(supabase) {
  try {
    // 1. Intentar consultar tabla dedicada `product_categories` si el usuario la creó en Supabase
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('product_categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (!dedicatedError && Array.isArray(dedicatedData)) {
      if (dedicatedData.length === 0) {
        if (!seedingPromise) {
          seedingPromise = (async () => {
            const toInsert = DEFAULT_PRODUCT_CATEGORIES_CONFIG.map((item) => ({
              name: item.name,
              icon: item.icon
            }));
            const { data: inserted, error: insErr } = await supabase
              .from('product_categories')
              .insert(toInsert)
              .select('*');
            if (insErr) {
              // Fallback if icon column doesn't exist in product_categories
              const { data: insertedSimple } = await supabase
                .from('product_categories')
                .insert(DEFAULT_PRODUCT_CATEGORIES_CONFIG.map((item) => ({ name: item.name })))
                .select('*');
              return insertedSimple || [];
            }
            return inserted || [];
          })().finally(() => {
            seedingPromise = null;
          });
        }
        const seeded = await seedingPromise;
        if (seeded.length > 0) {
          return seeded.map((row) => ({
            id: row.id,
            name: row.name,
            icon: getCategoryIcon(row.name, row.icon),
            slug: getCategorySlug(row.name),
            source: 'product_categories'
          }));
        }
      } else {
        return dedicatedData.map((row) => ({
          id: row.id,
          name: row.name,
          icon: getCategoryIcon(row.name, row.icon),
          slug: getCategorySlug(row.name),
          source: 'product_categories'
        }));
      }
    }

    // 2. Respaldo automático en la tabla existente de Supabase `tcg_sets` bajo `tcg LIKE '__CATEGORY__%'`
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('tcg_sets')
      .select('id, tcg, name, created_at')
      .like('tcg', `${CATEGORY_PREFIX}%`)
      .order('created_at', { ascending: true });

    if (!fallbackError && Array.isArray(fallbackData)) {
      if (fallbackData.length === 0) {
        if (!seedingPromise) {
          seedingPromise = (async () => {
            const { data: prodCats } = await supabase.from('products').select('category');
            const namesMap = new Map();
            DEFAULT_PRODUCT_CATEGORIES_CONFIG.forEach((c) => {
              namesMap.set(c.name, c.icon);
            });
            if (Array.isArray(prodCats)) {
              prodCats.forEach((p) => {
                if (p.category && p.category.trim() && !namesMap.has(p.category.trim())) {
                  namesMap.set(p.category.trim(), getCategoryIcon(p.category.trim()));
                }
              });
            }
            const toInsert = Array.from(namesMap.entries()).map(([name, icon]) => ({
              tcg: encodeCategoryTcgField(icon),
              name
            }));
            const { data: inserted } = await supabase
              .from('tcg_sets')
              .insert(toInsert)
              .select('id, tcg, name, created_at');
            return inserted || [];
          })().finally(() => {
            seedingPromise = null;
          });
        }
        const seeded = await seedingPromise;
        if (seeded.length > 0) {
          return seeded.map((row) => ({
            id: row.id,
            name: row.name,
            icon: extractIconFromTcgField(row.tcg, row.name),
            slug: getCategorySlug(row.name),
            source: 'tcg_sets'
          }));
        }
      } else {
        return fallbackData.map((row) => ({
          id: row.id,
          name: row.name,
          icon: extractIconFromTcgField(row.tcg, row.name),
          slug: getCategorySlug(row.name),
          source: 'tcg_sets'
        }));
      }
    }
  } catch (err) {
    console.warn('Error cargando categorías desde Supabase:', err);
  }

  return DEFAULT_PRODUCT_CATEGORIES_CONFIG.map((item, idx) => ({
    id: `default-cat-${idx}`,
    name: item.name,
    icon: item.icon,
    slug: getCategorySlug(item.name),
    source: 'default'
  }));
}

/**
 * Crea un nuevo tipo de producto / categoría con su icono en la base de datos.
 */
export async function createProductCategory(supabase, rawName, rawIcon = null) {
  const name = (rawName || '').trim();
  if (!name) throw new Error('El nombre del tipo de producto no puede estar vacío.');
  const icon = getCategoryIcon(name, rawIcon);

  // Intentar primero en product_categories
  const { data: dedicatedData, error: dedicatedError } = await supabase
    .from('product_categories')
    .insert({ name, icon })
    .select('*')
    .single();

  if (!dedicatedError && dedicatedData) {
    window.dispatchEvent(new Event('product_categories_updated'));
    return {
      id: dedicatedData.id,
      name: dedicatedData.name,
      icon: getCategoryIcon(dedicatedData.name, dedicatedData.icon || icon),
      slug: getCategorySlug(dedicatedData.name),
      source: 'product_categories'
    };
  }

  // Respaldo en tcg_sets con tcg = '__CATEGORY__::<icon>'
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('tcg_sets')
    .insert({ tcg: encodeCategoryTcgField(icon), name })
    .select('id, tcg, name, created_at')
    .single();

  if (fallbackError) throw fallbackError;

  window.dispatchEvent(new Event('product_categories_updated'));
  return {
    id: fallbackData.id,
    name: fallbackData.name,
    icon: extractIconFromTcgField(fallbackData.tcg, fallbackData.name),
    slug: getCategorySlug(fallbackData.name),
    source: 'tcg_sets'
  };
}

/**
 * Actualiza el nombre y/o el icono de un tipo de producto existente y sincroniza los productos asociados.
 */
export async function updateProductCategory(supabase, id, oldName, rawNewName, rawNewIcon = null) {
  const newName = (rawNewName || '').trim();
  if (!newName) throw new Error('El nombre no puede estar vacío.');
  const newIcon = getCategoryIcon(newName, rawNewIcon);

  if (id && !String(id).startsWith('default-') && !String(id).startsWith('local-')) {
    const { error: dedErr } = await supabase
      .from('product_categories')
      .update({ name: newName, icon: newIcon })
      .eq('id', id);

    if (dedErr) {
      await supabase
        .from('tcg_sets')
        .update({ name: newName, tcg: encodeCategoryTcgField(newIcon) })
        .eq('id', id);
    }
  } else {
    await createProductCategory(supabase, newName, newIcon);
  }

  // Actualizar los productos que tenían la categoría anterior
  if (oldName && oldName !== newName) {
    await supabase
      .from('products')
      .update({ category: newName })
      .eq('category', oldName);
  }

  window.dispatchEvent(new Event('product_categories_updated'));
  return {
    id,
    name: newName,
    icon: newIcon,
    slug: getCategorySlug(newName)
  };
}

/**
 * Elimina un tipo de producto de la tabla.
 */
export async function deleteProductCategory(supabase, id, categoryName) {
  if (id && !String(id).startsWith('default-') && !String(id).startsWith('local-')) {
    const { error: dedErr } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (dedErr) {
      await supabase
        .from('tcg_sets')
        .delete()
        .eq('id', id);
    }
  } else if (categoryName) {
    await supabase
      .from('tcg_sets')
      .delete()
      .like('tcg', `${CATEGORY_PREFIX}%`)
      .eq('name', categoryName);
  }

  window.dispatchEvent(new Event('product_categories_updated'));
}
