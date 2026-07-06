import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage({ products, onCreateProduct, onUpdateStock, orders = [], setOrders }) {
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

  // Tabs and Modal states
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

  // Submit animation states
  const [btnText, setBtnText] = useState('Publicar Producto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Filter products for restocking
  const filteredRestockProducts = products.filter((p) => {
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
    onUpdateStock(productId, qty, colorId);
    const key = colorId ? `${productId}-${colorId}` : productId;
    setRestockAmount(prev => ({ ...prev, [key]: '' }));
    alert('Stock actualizado correctamente.');
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
    setBtnText('Publicando...');

    setTimeout(() => {
      if (hasVariants) {
        onCreateProduct({
          name,
          category,
          price: samePrice ? price : variants[0].price,
          stock: variants.reduce((sum, v) => sum + parseInt(v.stock || 0), 0).toString(),
          description,
          image: variants[0].imagePreview,
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
        onCreateProduct({ name, category, price, stock, description, image: imagePreview });
      }

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
    }, 1200);
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

  const getStockStatusText = (qty) => {
    const quantity = parseInt(qty);
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 5) return 'Low Stock';
    return 'In Stock';
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-secondary/10 text-secondary';
      case 'Aprobado':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Listo para Recojo':
        return 'bg-primary-fixed text-on-primary-fixed-variant';
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

        {/* Side Navigation or Stats — hidden on inventory & restock tabs */}
        <aside className={`lg:col-span-3 flex flex-col gap-base bg-surface-container-low dark:bg-surface-container-highest p-md rounded-xl collector-card-shadow border border-outline-variant/30 animate-fade-in ${
          (activeTab === 'inventory' || activeTab === 'restock') ? 'hidden' : 'hidden lg:flex'
        }`}>


          {activeTab === 'orders' && (
            <>
              <div className="mb-base">
                <h2 className="font-headline-md text-headline-md text-on-surface">Resumen de Ventas</h2>
                <p className="text-on-surface-variant text-label-sm">Métricas de la sesión actual</p>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
                  <div className="text-[10px] text-outline uppercase tracking-wider font-bold">Ventas de la Sesión</div>
                  <div className="text-xl font-bold text-primary font-sans mt-0.5">
                    ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 flex justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-outline uppercase tracking-wider font-semibold">Total Pedidos</div>
                    <div className="text-sm font-bold text-on-surface mt-0.5">{orders.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-outline uppercase tracking-wider font-semibold">Pendientes</div>
                    <div className="text-sm font-bold text-secondary mt-0.5">
                      {orders.filter(o => o.status === 'Pendiente').length}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'presale' || activeTab === 'rare') && (
            <>
              <div className="mb-base">
                <h2 className="font-headline-md text-headline-md text-on-surface">Módulo Temporal</h2>
                <p className="text-on-surface-variant text-label-sm">Sección en mantenimiento</p>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed">
                Esta sección está reservada para futuras expansiones del panel. Si tienes sugerencias sobre estas herramientas, ponte en contacto con soporte.
              </div>
            </>
          )}
        </aside>

        {/* Main Content Area */}
        <section className={(activeTab === 'inventory' || activeTab === 'restock') ? 'lg:col-span-12 space-y-xl' : 'lg:col-span-9 space-y-xl'}>

          {activeTab === 'inventory' && (
            <>
              {/* Add New Item Section */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">

                {/* Header info & Submit button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-base mb-xl">
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Agregar Nuevo Producto</h2>
                    <p className="text-on-surface-variant text-body-md mt-1">Completa los campos para publicar un nuevo artículo de colección.</p>
                  </div>
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
                    {btnText}
                  </button>
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
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting || isPublished}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all appearance-none outline-none"
                    >
                      <option value="Yu-Gi-Oh">Yu-Gi-Oh</option>
                      <option value="Pokemon">Pokemon</option>
                      <option value="Magic">Magic</option>
                      <option value="Board Games">Board Games</option>
                      <option value="Mecha Kits">Mecha Kits</option>
                      <option value="Sleeves">Sleeves</option>
                    </select>
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
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-1.5">Categoría</label>
                      <select
                        value={restockCategory}
                        onChange={(e) => setRestockCategory(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/35 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary font-bold text-on-surface"
                      >
                        <option value="">Todas las Categorías</option>
                        <option value="yu-gi-oh">Yu-Gi-Oh</option>
                        <option value="pokemon">Pokemon</option>
                        <option value="magic">Magic</option>
                        <option value="board-games">Board Games</option>
                        <option value="mecha-kits">Mecha Kits</option>
                        <option value="sleeves">Sleeves</option>
                      </select>
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
                  <span className="material-symbols-outlined text-[5rem] text-outline/25">receipt_long</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">No hay pedidos registrados</h3>
                  <p className="text-sm text-on-surface-variant max-w-sm">
                    Los pedidos que realicen los clientes a través del carrito aparecerán en este panel en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow overflow-hidden">
                  <div className="p-md border-b border-outline-variant/40 bg-surface-container-low/50">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Pedidos Recibidos</h2>
                    <p className="text-on-surface-variant text-label-sm mt-0.5">Control y verificación de transacciones y estados de entrega.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[11px] border-b border-outline-variant/30">
                        <tr>
                          <th className="px-md py-4">ID / Fecha</th>
                          <th className="px-md py-4">Cliente</th>
                          <th className="px-md py-4">Detalle de Compra</th>
                          <th className="px-md py-4">Sucursal Recojo</th>
                          <th className="px-md py-4 text-right">Monto</th>
                          <th className="px-md py-4 text-center">Comprobante</th>
                          <th className="px-md py-4 text-center">Estado del Pedido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/35 align-top">
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
                            <td className="px-md py-4 align-top text-center font-bold">
                              <div className="relative inline-block w-40">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className={`w-full text-xs font-bold py-2 px-3 rounded-lg border-0 appearance-none focus:ring-2 focus:ring-primary outline-none transition-colors text-center cursor-pointer ${getStatusBadgeClass(order.status)}`}
                                >
                                  <option value="Pendiente">⏳ Pendiente</option>
                                  <option value="Aprobado">✅ Aprobado</option>
                                  <option value="Listo para Recojo">📦 Listo para Recojo</option>
                                  <option value="Entregado">🏪 Entregado</option>
                                  <option value="Cancelado">❌ Cancelado</option>
                                </select>
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
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-125 animate-pulse"></div>
                <div className="relative bg-primary/10 text-primary w-24 h-24 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                  <span className="material-symbols-outlined text-[3.5rem] animate-pulse">pending_actions</span>
                </div>
              </div>

              <div className="space-y-2 max-w-lg">
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  Próxima Conexión
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Módulo de Preventas en Desarrollo</h2>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  Estamos calibrando la bóveda de pre-lanzamientos exclusivos. Muy pronto podrás asegurar piezas limitadas, booster boxes y ediciones especiales antes de su distribución oficial.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full max-w-xs space-y-2 mt-2">
                <div className="flex justify-between text-xs font-bold text-outline">
                  <span>Ingeniería de Bóveda</span>
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

        </section>

      </div>

      {/* Lightbox Modal for Receipt Verification */}
      {selectedProofUrl && (
        <div className="fixed inset-0 bg-on-background/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full overflow-hidden border border-outline-variant/30 shadow-2xl relative flex flex-col max-h-[90vh]">
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

    </div>
  );
}
