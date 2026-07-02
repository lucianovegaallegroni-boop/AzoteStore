import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage({ products, onCreateProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Yu-Gi-Oh');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  
  // Submit animation states
  const [btnText, setBtnText] = useState('Publish Item');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Show only 4 recent products in the table to match aesthetics
  const recentAdditions = products.slice(0, 4);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name || !price || !stock || !description) {
      setError('Por favor, rellene todos los campos para publicar el artículo.');
      return;
    }

    if (parseFloat(price) <= 0 || parseInt(stock) < 0) {
      setError('El precio debe ser mayor a 0 y el stock no puede ser negativo.');
      return;
    }

    setIsSubmitting(true);
    setBtnText('Publishing...');

    setTimeout(() => {
      // Trigger global state update
      onCreateProduct({
        name,
        category,
        price,
        stock,
        description
      });

      setIsSubmitting(false);
      setIsPublished(true);
      setBtnText('Item Published!');

      setTimeout(() => {
        // Reset states
        setIsPublished(false);
        setBtnText('Publish Item');
        
        // Reset form inputs
        setName('');
        setCategory('Yu-Gi-Oh');
        setPrice('');
        setStock('');
        setDescription('');
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Side Navigation (Filters/Admin Tools) - Desktop only */}
        <aside className="lg:col-span-3 flex flex-col gap-base bg-surface-container-low dark:bg-surface-container-highest p-md rounded-xl collector-card-shadow hidden lg:block border border-outline-variant/30">
          <div className="mb-base">
            <h2 className="font-headline-md text-headline-md text-on-surface">Catalog Filters</h2>
            <p className="text-on-surface-variant text-label-sm">Refine your collection view</p>
          </div>
          <nav className="flex flex-col gap-xs">
            <a className="flex items-center gap-sm p-sm bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container rounded-lg font-bold transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">fiber_new</span>
              <span className="text-label-md">New Arrivals</span>
            </a>
            <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">update</span>
              <span className="text-label-md">Restocks</span>
            </a>
            <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">event_available</span>
              <span className="text-label-md">Pre-orders</span>
            </a>
            <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">stars</span>
              <span className="text-label-md">Rare Finds</span>
            </a>
            <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">sell</span>
              <span className="text-label-md">Clearance</span>
            </a>
          </nav>
          <button className="mt-base text-primary font-bold text-label-md hover:underline transition-all text-left">
            Clear All Filters
          </button>
        </aside>

        {/* Main Form Canvas */}
        <section className="lg:col-span-9 space-y-xl">
          
          {/* Add New Item Section */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow p-md md:p-lg">
            
            {/* Header info & Submit button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-base mb-xl">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Add New Item</h1>
                <p className="text-on-surface-variant text-body-md mt-1">Populate your catalog with premium collectibles.</p>
              </div>
              <button 
                form="inventory-form" 
                type="submit"
                disabled={isSubmitting || isPublished}
                className={`font-headline-md text-headline-md px-xl py-4 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 ${
                  isPublished 
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
                <label className="block font-label-md text-on-surface-variant ml-1">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting || isPublished}
                  placeholder="e.g. Black Luster Soldier - Envoy of the Beginning"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                />
              </div>

              <div className="space-y-base">
                <label className="block font-label-md text-on-surface-variant ml-1">Category</label>
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
                </select>
              </div>

              <div className="space-y-base">
                <label className="block font-label-md text-on-surface-variant ml-1">Price (USD)</label>
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
                <label className="block font-label-md text-on-surface-variant ml-1">Stock Quantity</label>
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isSubmitting || isPublished}
                  placeholder="0" 
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-base">
                <label className="block font-label-md text-on-surface-variant ml-1">Product Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting || isPublished}
                  placeholder="Describe the item's condition, rarity, and unique features..." 
                  rows="4"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-body-md transition-all outline-none"
                ></textarea>
              </div>

              {/* Image Upload Area */}
              <div className="md:col-span-2 space-y-base">
                <label className="block font-label-md text-on-surface-variant ml-1">Product Photos</label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl text-center bg-surface-container transition-colors hover:bg-surface-container-high group cursor-pointer">
                  <div className="flex flex-col items-center gap-sm">
                    <span className="material-symbols-outlined text-primary scale-150 mb-base group-hover:scale-125 transition-transform">
                      cloud_upload
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Drag and drop or click to upload</h3>
                    <p className="text-on-surface-variant text-label-sm max-w-sm mx-auto">
                      Support for JPG, PNG and WebP. Minimum recommended size: 1200x1200px.
                    </p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Recent Additions Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow overflow-hidden">
            <div className="p-md border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/50">
              <h2 className="font-headline-md text-headline-md text-on-surface">Recent Additions</h2>
              <button 
                onClick={() => navigate('/catalog')}
                className="text-primary font-bold text-label-md hover:underline"
              >
                View All Catalog
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[11px] border-b border-outline-variant/30">
                  <tr>
                    <th className="px-md py-4">Item</th>
                    <th className="px-md py-4">Category</th>
                    <th className="px-md py-4 text-right">Price</th>
                    <th className="px-md py-4 text-center">Stock</th>
                    <th className="px-md py-4 text-center">Status</th>
                    <th className="px-md py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/35">
                  {recentAdditions.map((product) => (
                    <tr 
                      key={product.id} 
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-md py-4">
                        <div className="flex items-center gap-sm">
                          <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant/20 flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                            />
                          </div>
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors truncate max-w-[180px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-md py-4 text-on-surface-variant text-sm font-medium">{product.category}</td>
                      <td className="px-md py-4 text-right font-bold text-on-surface">${product.price.toFixed(2)}</td>
                      <td className="px-md py-4 text-center text-sm font-semibold">
                        {product.specifications?.Stock || (product.inStock ? '20' : '0')}
                      </td>
                      <td className="px-md py-4 text-center">
                        <span className={`chip text-[10px] font-bold ${getStockBadgeClass(product.specifications?.Stock || (product.inStock ? 20 : 0))}`}>
                          {getStockStatusText(product.specifications?.Stock || (product.inStock ? 20 : 0))}
                        </span>
                      </td>
                      <td className="px-md py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Editar artículo: ${product.name} (Simulación)`);
                          }}
                          className="p-1 rounded-full text-outline hover:text-primary hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
