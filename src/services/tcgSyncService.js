import { fetchCardPriceFromTcgPlayer } from './tcgPlayerService';

/**
 * Servicio para sincronizar precios de productos TCG con TCGPlayer en Supabase
 */

export async function syncSingleProductPrice(supabase, product) {
  if (!product || !product.id || !product.name) {
    throw new Error('Producto no válido para sincronización');
  }

  const tcgName = product.tcg || (product.specifications?.TCG) || null;
  const setName = product.set_name || (product.specifications?.Set) || null;
  const rarity = product.rarity || (product.specifications?.Rareza) || null;

  try {
    const result = await fetchCardPriceFromTcgPlayer({
      cardName: product.name,
      tcg: tcgName,
      setName: setName,
      rarity: rarity
    });

    if (!result || typeof result.price !== 'number' || result.price <= 0) {
      return {
        success: false,
        productId: product.id,
        productName: product.name,
        error: 'No se encontró un precio válido de mercado en TCGPlayer.'
      };
    }

    const currentPrice = parseFloat(product.price) || 0;
    const newPrice = parseFloat(result.price.toFixed(2));
    const priceChanged = Math.abs(currentPrice - newPrice) > 0.009;
    const nowIso = new Date().toISOString();

    // Actualizar producto en la tabla 'products' de Supabase
    const { error: updateErr } = await supabase
      .from('products')
      .update({
        price: newPrice,
        last_price_sync: nowIso
      })
      .eq('id', product.id);

    if (updateErr) throw updateErr;

    // Si tiene variantes y todas comparten precio, actualizar las variantes
    if (product.product_variants && product.product_variants.length > 0) {
      await supabase
        .from('product_variants')
        .update({ price: newPrice })
        .eq('product_id', product.id);
    }

    return {
      success: true,
      productId: product.id,
      productName: product.name,
      oldPrice: currentPrice,
      newPrice: newPrice,
      priceChanged,
      matchedSet: result.matchedSet || setName,
      lastSync: nowIso
    };
  } catch (err) {
    return {
      success: false,
      productId: product.id,
      productName: product.name,
      error: err.message || 'Error consultando API'
    };
  }
}

export async function syncAllTcgProducts(supabase, products, onProgress = () => {}) {
  // Filtrar solo productos TCG que tengan auto_sync_price activo (o no explícitamente false)
  const tcgProducts = (products || []).filter(p => {
    const isTcgCategory = ['TCG', 'Carta', 'Producto Sellado'].includes(p.category) || !!p.tcg;
    const isAutoSyncEnabled = p.auto_sync_price !== false;
    return isTcgCategory && isAutoSyncEnabled;
  });

  const total = tcgProducts.length;
  if (total === 0) {
    return {
      totalSynced: 0,
      updatedCount: 0,
      unchangedCount: 0,
      errors: [],
      updatedProducts: []
    };
  }

  const results = [];
  const errors = [];
  const updatedProducts = [];

  for (let i = 0; i < total; i++) {
    const p = tcgProducts[i];
    onProgress({
      current: i + 1,
      total,
      product: p,
      status: 'syncing'
    });

    const res = await syncSingleProductPrice(supabase, p);

    if (res.success) {
      results.push(res);
      if (res.priceChanged) {
        updatedProducts.push(res);
      }
    } else {
      errors.push(res);
    }

    onProgress({
      current: i + 1,
      total,
      product: p,
      result: res,
      status: 'done'
    });

    // Pequeño retardo de 250ms para no saturar las APIs de TCG
    if (i < total - 1) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  return {
    totalSynced: results.length,
    updatedCount: updatedProducts.length,
    unchangedCount: results.length - updatedProducts.length,
    errors,
    updatedProducts
  };
}
