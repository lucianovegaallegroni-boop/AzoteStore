import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
export default function ProductCatalog({ products }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL Search Params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const qParam = searchParams.get('q') || '';
    
    setSelectedCategory(categoryParam);
    setSearchQuery(qParam);
  }, [searchParams]);

  // Categories list based on our product data
  const categories = [
    { name: "Todos", slug: "" },
    { name: "Yu-Gi-Oh", slug: "yu-gi-oh" },
    { name: "Pokemon", slug: "pokemon" },
    { name: "Magic", slug: "magic" },
    { name: "Board Games", slug: "board-games" },
    { name: "Mecha Kits", slug: "mecha-kits" },
    { name: "Sleeves", slug: "sleeves" }
  ];

  // Handler for category click
  const handleCategorySelect = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    setSearchParams({});
    setOnlyInStock(false);
    setSortBy('featured');
  };

  // Process Products: Filter & Sort
  let filteredProducts = products.filter(product => {
    // 1. Category Filter
    if (selectedCategory) {
      const matchCategory = product.categorySlug === selectedCategory || 
                            (selectedCategory === 'tcg' && ['pokemon', 'yu-gi-oh', 'magic'].includes(product.categorySlug));
      if (!matchCategory) return false;
    }

    // 2. Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchQuery = product.name.toLowerCase().includes(query) || 
                         product.subtitle.toLowerCase().includes(query) || 
                         product.description.toLowerCase().includes(query) || 
                         product.category.toLowerCase().includes(query);
      if (!matchQuery) return false;
    }

    // 3. Stock Filter
    if (onlyInStock && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sort logic
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      
      {/* Title & Stats */}
      <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background">Catálogo de Coleccionables</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Explora nuestra exclusiva bóveda.'}
            <span className="font-semibold text-primary ml-2">({filteredProducts.length} productos)</span>
          </p>
        </div>
        
        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/30">
          <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Ordenar por:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-on-surface focus:ring-0 outline-none cursor-pointer"
          >
            <option value="featured">Destacados</option>
            <option value="price-low">Precio: Bajo a Alto</option>
            <option value="price-high">Precio: Alto a Bajo</option>
            <option value="name">Nombre: A-Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Categories Filter Box */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md shadow-sm">
            <h3 className="font-label-md text-label-md text-on-background mb-4 uppercase tracking-widest text-outline">Categorías</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-full lg:rounded-lg text-left text-sm font-medium transition-all flex justify-between items-center ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.slug && (
                    <span className="material-symbols-outlined text-[16px] hidden lg:block">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter Box */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md shadow-sm">
            <h3 className="font-label-md text-label-md text-on-background mb-4 uppercase tracking-widest text-outline">Disponibilidad</h3>
            <label className="flex items-center gap-3 cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors select-none font-body-md">
              <input 
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant/50 focus:ring-offset-background"
              />
              <span className="text-sm font-medium">Solo en stock</span>
            </label>
          </div>

          {/* Reset Filters button */}
          {(selectedCategory || onlyInStock || searchQuery || sortBy !== 'featured') && (
            <button 
              onClick={handleClearFilters}
              className="w-full border border-primary text-primary font-label-md py-3 rounded-xl hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-4 bg-surface border border-outline-variant/20 rounded-xl card-shadow">
              <span className="material-symbols-outlined text-[5rem] text-outline/30">search_off</span>
              <h3 className="font-headline-md text-headline-md">Sin resultados</h3>
              <p className="font-body-md text-center max-w-md">
                No encontramos productos que coincidan con tu selección. Prueba cambiando los filtros o buscando otro término.
              </p>
              <button 
                onClick={handleClearFilters}
                className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-full hover:scale-105 transition-transform mt-2"
              >
                Restaurar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-surface rounded-xl overflow-hidden cursor-pointer group border border-outline-variant/20 card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full"
                >
                  <div className="h-[200px] overflow-hidden bg-surface-container-low relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.inStock ? 'grayscale opacity-60' : ''}`}
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 group-hover:bg-black/45">
                        <span className="border-2 border-error text-error bg-error/10 font-headline-md text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                          Sin Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-sm flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold font-body-md">{product.category}</span>
                      <h3 className="font-headline-md text-[16px] text-on-background group-hover:text-primary transition-colors line-clamp-1 mt-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                      <div className="flex items-baseline gap-2">
                        <span className="font-headline-md text-primary">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="font-body-md text-xs text-outline line-through">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
