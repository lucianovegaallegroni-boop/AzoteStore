import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';

const categoryOptions = [
  { value: "Yu-Gi-Oh", label: "Yu-Gi-Oh" },
  { value: "Pokemon", label: "Pokemon" },
  { value: "Magic", label: "Magic" },
  { value: "Board Games", label: "Board Games" },
  { value: "Sleeves", label: "Sleeves" }
];

const restockCategoryOptions = [
  { value: "", label: "Todas las Categorías" },
  { value: "yu-gi-oh", label: "Yu-Gi-Oh" },
  { value: "pokemon", label: "Pokemon" },
  { value: "magic", label: "Magic" },
  { value: "board-games", label: "Board Games" },
  { value: "sleeves", label: "Sleeves" }
];

const orderStatusOptions = [
  { value: "Realizado", label: "🛍️ Realizado" },
  { value: "Entregado", label: "🏪 Entregado" },
  { value: "Cancelado", label: "❌ Cancelado" }
];

export default function AdminPage({ products: initialProducts, onCreateProduct, onUpdateStock, orders = [], setOrders }) {
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Sync Supabase products on mount or reloadTrigger change
  useEffect(() => {
    (async () => {
      setLoadingDb(true);
      try {
        const { supabase } = await import('../supabaseClient');
        // Fetch products and their variants
        const { data: prods, error: pErr } = await supabase
          .from('products')
          .select('*, product_variants(*)');
        
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
            inStock: p.stock > 0,
            featured: !!p.featured,
            division: p.division,
            specifications: {
              Stock: String(p.stock),
              Category: p.category,
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
        }

        // Fetch orders from Supabase
        const { data: dbOrders, error: oErr } = await supabase
          .from('orders')
          .select('*, order_items(*)');

        if (!oErr && dbOrders) {
          const formattedOrders = dbOrders.map(o => ({
            id: o.id,
            date: new Date(o.date).toLocaleString('es-ES'),
            clientName: o.client_name,
            clientEmail: o.client_email,
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
          // Sort by date descending
          formattedOrders.sort((a, b) => b.id.localeCompare(a.id));
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
  const [category, setCategory] = useState('Yu-Gi-Oh');
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

  // Featured states
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredCategory, setFeaturedCategory] = useState('');

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

  // Filter products for restocking (from dbProducts instead of prop products)
  const filteredRestockProducts = dbProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(restockSearch.toLowerCase());
    const matchesCategory = restockCategory ? p.categorySlug === restockCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  // Variant helpers
  const addVariant = () => {
    setVariants(prev => [...prev, { id: Date.now(), title: '', stock: '', price: '', image: '', imagePreview: '' }]);
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
    const reader = new FileReader();
    reader.onloadend = () => updateVariant(id, 'imagePreview', reader.result);
    reader.readAsDataURL(file);
  };

  const handleRestockSubmit = (productId, amount, colorId = null) => {
    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
      alert('Por favor, ingresa una cantidad válida mayor a cero.');
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

          const newStock = (currentVar.stock || 0) + qty;
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
            const totalStock = variantsList.reduce((sum, v) => sum + (v.stock || 0), 0);
            await supabase
              .from('products')
              .update({ stock: totalStock })
              .eq('id', currentVar.product_id);
          }

        } else {
          // Base product update
          const { data: currentProd, error: getErr } = await supabase
            .from('products')
            .select('stock')
            .eq('id', productId)
            .single();

          if (getErr) throw getErr;

          const newStock = (currentProd.stock || 0) + qty;
          const { error: updateErr } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId);

          if (updateErr) throw updateErr;
        }

        onUpdateStock(productId, qty, colorId);
        const key = colorId ? `${productId}-${colorId}` : productId;
        setRestockAmount(prev => ({ ...prev, [key]: '' }));
        triggerReload();
        alert('Stock actualizado correctamente en base de datos.');

      } catch (err) {
        console.error('Error al actualizar stock en Supabase:', err);
        alert('Error al conectar con la base de datos: ' + err.message);
      }
    })();
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    
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
        imagePreview: v.image,
        image: v.image
      })));
      setStock('');
      setImagePreview('');
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
    setImageFile(null);
    setBtnText('Guardar Cambios');
    setActiveTab('inventory');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Yu-Gi-Oh');
    setPrice('');
    setStock('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setHasVariants(false);
    setSamePrice(true);
    setVariants([{ id: 1, title: '', stock: '', price: '', image: '', imagePreview: '' }]);
    setBtnText('Publicar Producto');
    setError('');
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
        if (!v.stock || parseInt(v.stock) < 0) { setError(`El tipo "${v.title}" necesita una cantidad de stock válida.`); return; }
        if (!v.imagePreview) { setError(`El tipo "${v.title}" necesita una imagen.`); return; }
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
      if (parseFloat(price) <= 0 || parseInt(stock) < 0) {
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

        // 1. Prepare base product data
        const baseProduct = {
          name,
          category,
          price: hasVariants && samePrice ? parseFloat(price) : (!hasVariants ? parseFloat(price) : parseFloat(variants[0].price || 0)),
          stock: hasVariants ? variants.reduce((sum, v) => sum + parseInt(v.stock || 0), 0) : parseInt(stock),
          description,
          image: imagePreview || (hasVariants ? variants[0].imagePreview : ''),
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
            const variantsToInsert = variants.map(v => ({
              product_id: editingProduct.id,
              title: v.title,
              stock: parseInt(v.stock || 0),
              price: samePrice ? parseFloat(price) : parseFloat(v.price),
              image: v.imagePreview
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
            const variantsToInsert = variants.map(v => ({
              product_id: insertedProduct.id,
              title: v.title,
              stock: parseInt(v.stock || 0),
              price: samePrice ? parseFloat(price) : parseFloat(v.price),
              image: v.imagePreview
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
              variants: variants.map(v => ({
                id: v.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
                name: v.title,
                stock: parseInt(v.stock),
                inStock: parseInt(v.stock) > 0,
                price: samePrice ? parseFloat(price) : parseFloat(v.price),
                image: v.imagePreview,
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
            setCategory('Yu-Gi-Oh');
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
    const quantity = parseInt(qty);
    if (quantity === 0) {
      return 'bg-error/10 text-error';
    } else if (quantity < 5) {
      return 'bg-secondary-fixed text-on-secondary-fixed';
    } else {
      return 'bg-tertiary-fixed text-on-tertiary-fixed';
    }
  };

  const handleToggleFeatured = async (productId, currentVal) => {
    try {
      const { supabase } = await import('../supabaseClient');
      const newVal = !currentVal;
      const { error } = await supabase
        .from('products')
        .update({ featured: newVal })
        .eq('id', productId);

      if (error) throw error;
      triggerReload();
    } catch (err) {
      console.error('Error toggling featured status in Supabase:', err);
      alert('Error al actualizar estado destacado: ' + err.message);
    }
  };

  const handleToggleHero = async (productId, currentDivision) => {
    try {
      const { supabase } = await import('../supabaseClient');
      const newDivision = currentDivision === 'hero' ? null : 'hero';
      const { error } = await supabase
        .from('products')
        .update({ division: newDivision })
        .eq('id', productId);

      if (error) throw error;
      triggerReload();
    } catch (err) {
      console.error('Error toggling hero status in Supabase:', err);
      alert('Error al actualizar estado en carrusel: ' + err.message);
    }
  };

  const getStockStatusText = (qty) => {
    const quantity = parseInt(qty);
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 5) return 'Low Stock';
    return 'In Stock';
  };

  const handleStatusChange = (orderId, newStatus) => {
    (async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) throw error;

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } catch (err) {
        console.error('Error al cambiar estado del pedido:', err);
        alert('Error al conectar con la base de datos: ' + err.message);
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">

      {/* Title */}
      <div className="mb-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Panel de Administración</h1>
        <p className="text-on-surface-variant text-body-md mt-1">Gestiona el inventario de productos y administra los pedidos y comprobantes.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-outline-variant/30 mb-8 gap-4 pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === 'inventory'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          Gestión de Catálogo
        </button>

        <button
          onClick={() => setActiveTab('featured')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === 'featured'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">star</span>
          Productos Destacados
        </button>

        <button
          onClick={() => setActiveTab('restock')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === 'restock'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
          Reabastecimientos
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 relative ${activeTab === 'orders'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          Control de Pedidos
          {orders.length > 0 && (
            <span className="bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold absolute -top-1 -right-4">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('presale')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === 'presale'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          Preventas
        </button>

        <button
          onClick={() => setActiveTab('rare')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === 'rare'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">diamond</span>
          Piezas Raras
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

        {/* Main Content Area */}
        <section className="lg:col-span-12 space-y-xl">

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
                      <div className="space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Nombre del Producto</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSubmitting || isPublished}
                          placeholder="Ej. Mago Oscuro - Edición Especial"
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                        />
                      </div>

                      <div className="space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Categoría</label>
                        <CustomDropdown
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          options={categoryOptions}
                          disabled={isSubmitting || isPublished}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                          align="full"
                        />
                      </div>

                      <div className="space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Precio (USD)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">$</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isSubmitting || isPublished}
                            placeholder="0"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 pl-8 text-body-md transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-base">
                        <label className="block font-label-md text-on-surface-variant ml-1">Cantidad de Stock</label>
                        <input
                          type="number"
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
                          className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${
                            hasVariants
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-outline-variant/40 hover:border-primary/50 text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {/* Toggle pill */}
                          <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                            hasVariants ? 'bg-primary' : 'bg-outline-variant/50'
                          }`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              hasVariants ? 'translate-x-5' : 'translate-x-0.5'
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
                              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                                samePrice ? 'bg-primary' : 'bg-secondary'
                              }`}
                            >
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                samePrice ? 'translate-x-5' : 'translate-x-0.5'
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
                                  {v.imagePreview ? (
                                    <div className="relative h-32 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-low flex items-center justify-center group">
                                      <img src={v.imagePreview} alt={v.title} className="max-h-full max-w-full object-contain" />
                                      <button
                                        type="button"
                                        onClick={() => updateVariant(v.id, 'imagePreview', '')}
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
                <div className="space-y-xl animate-fade-in">
                  {/* Header info */}
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Control de Productos en la Landing Page</h2>
                    <p className="text-on-surface-variant text-body-md mt-1">
                      Desde aquí puedes decidir qué productos se muestran en el Carrusel Superior (Hero) y cuáles en la marquesina de Productos Destacados de la página de inicio.
                    </p>

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
                            {dbProducts.filter(p => p.division === 'hero').map(p => (
                              <div key={p.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 flex flex-col group relative">
                                <img src={p.image} alt={p.name} className="h-28 w-full object-cover" />
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
                            ))}
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
                            {dbProducts.filter(p => p.featured).map(p => (
                              <div key={p.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 flex flex-col group relative">
                                <img src={p.image} alt={p.name} className="h-28 w-full object-cover" />
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
                            ))}
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
                        <div className="w-full sm:w-48 shrink-0">
                          <CustomDropdown
                            value={featuredCategory}
                            onChange={(val) => setFeaturedCategory(val)}
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
                              .map(p => (
                                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                                  <td className="px-md py-4">
                                    <div className="flex items-center gap-3">
                                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-outline-variant/30" />
                                      <span className="font-bold text-on-surface text-sm">{p.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-md py-4 text-on-surface-variant text-xs font-semibold">{p.category}</td>
                                  <td className="px-md py-4 text-center text-xs font-bold text-on-surface-variant">${p.price.toFixed(2)}</td>
                                  
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
                                      <button
                                        type="button"
                                        onClick={() => handleToggleHero(p.id, p.division)}
                                        className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5 ${
                                          p.division === 'hero' 
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
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFeatured(p.id, p.featured)}
                                        className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5 ${
                                          p.featured 
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

                                  {/* Edit Action Button */}
                                  <td className="px-md py-4 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleEditClick(p)}
                                      className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-0.5 mx-auto"
                                      title="Editar Producto"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">edit</span>
                                      Editar
                                    </button>
                                  </td>

                                </tr>
                              ))}
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
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="font-headline-md text-headline-md text-on-surface">Reabastecer Catálogo</h2>
                          <p className="text-xs text-on-surface-variant mt-0.5">Incrementa el stock de tus coleccionables y variantes.</p>
                        </div>
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
                        <div className="flex-1 min-w-[150px]">
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
                            <th className="px-md py-4">Artículo / Variante</th>
                            <th className="px-md py-4">Categoría</th>
                            <th className="px-md py-4 text-center">Stock Actual</th>
                            <th className="px-md py-4 text-center">Añadir Unidades</th>
                            <th className="px-md py-4 text-center">Acciones</th>
                            <th className="px-md py-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/35 align-middle">
                          {filteredRestockProducts.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-md py-8 text-center text-on-surface-variant text-xs font-semibold">
                                No se encontraron productos coincidentes con los filtros.
                              </td>
                            </tr>
                          ) : (
                            filteredRestockProducts.map((p) => {
                              if (p.colors) {
                                return p.colors.map((color) => {
                                  const variationKey = `${p.id}-${color.id}`;
                                  const currentStock = color.stock !== undefined ? color.stock : (color.inStock ? 20 : 0);
                                  return (
                                    <tr key={variationKey} className="hover:bg-surface-container-low/20 transition-colors">
                                      <td className="px-md py-4">
                                        <div className="flex items-center gap-sm">
                                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant/20 shrink-0">
                                            <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-bold text-on-surface text-sm">{p.name}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <div
                                                className={`w-2.5 h-2.5 rounded border border-outline-variant/30 shrink-0 ${color.id === 'clear-gloss' ? 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:3px_3px]' : ''}`}
                                                style={color.id !== 'clear-gloss' ? { backgroundColor: color.hex } : {}}
                                              ></div>
                                              <span className="text-[10px] text-outline font-semibold">{color.name}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-md py-4 text-on-surface-variant text-xs font-semibold">{p.category}</td>
                                      <td className="px-md py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStockBadgeClass(currentStock)}`}>
                                          {currentStock} ({getStockStatusText(currentStock)})
                                        </span>
                                      </td>
                                      <td className="px-md py-4 text-center">
                                        <input
                                          type="number"
                                          min="1"
                                          placeholder="Cant."
                                          value={restockAmount[variationKey] || ''}
                                          onChange={(e) => setRestockAmount({ ...restockAmount, [variationKey]: e.target.value })}
                                          className="w-20 bg-surface border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-center outline-none focus:border-primary font-bold text-on-surface"
                                        />
                                      </td>
                                      <td className="px-md py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleEditClick(p)}
                                            className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-error/5 rounded-full"
                                            title="Editar Producto"
                                          >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
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
                                      <td className="px-md py-4 text-right">
                                        <button
                                          type="button"
                                          onClick={() => handleRestockSubmit(p.id, restockAmount[variationKey], color.id)}
                                          className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1 ml-auto"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">add</span> Reabastecer
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                });
                              }

                              const currentStock = p.specifications?.Stock ? parseInt(p.specifications.Stock) : (p.inStock ? 20 : 0);
                              return (
                                <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors">
                                  <td className="px-md py-4">
                                    <div className="flex items-center gap-sm">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant/20 shrink-0">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="font-bold text-on-surface text-sm truncate max-w-[180px]">{p.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-md py-4 text-on-surface-variant text-xs font-semibold">{p.category}</td>
                                  <td className="px-md py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStockBadgeClass(currentStock)}`}>
                                      {currentStock} ({getStockStatusText(currentStock)})
                                    </span>
                                  </td>
                                  <td className="px-md py-4 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Cant."
                                      value={restockAmount[p.id] || ''}
                                      onChange={(e) => setRestockAmount({ ...restockAmount, [p.id]: e.target.value })}
                                      className="w-20 bg-surface border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-center outline-none focus:border-primary font-bold text-on-surface"
                                    />
                                  </td>
                                  <td className="px-md py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleEditClick(p)}
                                        className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-error/5 rounded-full"
                                        title="Editar Producto"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
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
                                  <td className="px-md py-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRestockSubmit(p.id, restockAmount[p.id], null)}
                                      className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1 ml-auto"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">add</span> Reabastecer
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-md animate-fade-in">
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
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-surface-container-low/20 transition-colors">
                                <td className="px-md py-4 align-top">
                                  <span className="font-mono font-bold text-primary block text-sm">{order.id}</span>
                                  <span className="text-[10px] text-outline block mt-0.5">{order.date}</span>
                                </td>
                                <td className="px-md py-4 align-top">
                                  <span className="font-bold text-on-surface block text-sm">{order.clientName}</span>
                                  <span className="text-xs text-on-surface-variant block truncate max-w-[150px]">{order.clientEmail}</span>
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
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'presale' && (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-xl flex flex-col items-center justify-center text-center gap-6 min-h-[450px] animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/15 rounded-full blur-xl scale-125 animate-pulse"></div>
                    <div className="relative bg-primary/10 text-primary w-24 h-24 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                      <span className="material-symbols-outlined text-[3.5rem] animate-pulse">calendar_today</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
                      Módulo en Desarrollo
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestión de Preventas TCG</h2>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">
                      Este panel te permitirá configurar lanzamientos anticipados de Yu-Gi-Oh, Pokémon y Magic. Podrás definir límites de compra por usuario y calendarios de liberación de stock.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full max-w-xs space-y-2 mt-2">
                    <div className="flex justify-between text-xs font-bold text-outline">
                      <span>Estado del Módulo</span>
                      <span className="text-primary">87%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
                      <div className="w-[87%] h-full bg-primary rounded-full transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rare' && (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-xl flex flex-col items-center justify-center text-center gap-6 min-h-[450px] animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/15 rounded-full blur-xl scale-125 animate-pulse"></div>
                    <div className="relative bg-secondary/10 text-secondary w-24 h-24 rounded-full flex items-center justify-center border border-secondary/20 shadow-inner">
                      <span className="material-symbols-outlined text-[3.5rem] animate-pulse">diamond</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20">
                      Área Clasificada
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Galería de Piezas Raras</h2>
                    <p className="font-body-md text-on-surface-variant leading-relaxed">
                      La exhibición virtual de piezas únicas, autografiadas y tesoros de colección de grado de museo está siendo restaurada para soportar subastas en tiempo real y tasaciones certificadas.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full max-w-xs space-y-2 mt-2">
                    <div className="flex justify-between text-xs font-bold text-outline">
                      <span>Restauración de Vitrina</span>
                      <span className="text-secondary">64%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
                      <div className="w-[64%] h-full bg-secondary rounded-full transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              )}
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

    </div>
  );
}
