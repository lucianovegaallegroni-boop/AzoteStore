import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const sortOptions = [
  { value: "featured", label: "Mejor Coincidencia" },
  { value: "price-low", label: "Precio: Menor a Mayor" },
  { value: "price-high", label: "Precio: Mayor a Menor" },
  { value: "name", label: "Nombre: A-Z" }
];

export default function ProductCatalog({ products }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // View mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const [dbProducts, setDbProducts] = useState(products || []);
  const [loading, setLoading] = useState(!products || products.length === 0);

  // Sync with products prop when updated
  useEffect(() => {
    if (products && products.length > 0) {
      setDbProducts(products);
      setLoading(false);
    }
  }, [products]);

  // Sync state with URL Search Params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const qParam = searchParams.get('q') || '';

    setSelectedCategory(categoryParam);
    setSearchQuery(qParam);
  }, [searchParams]);

  // Load products from Supabase on mount
  useEffect(() => {
    (async () => {
      if (!products || products.length === 0) {
        setLoading(true);
      }
      try {
        const { supabase } = await import('../supabaseClient');
        const { data: prods, error } = await supabase
          .from('products')
          .select('id, name, price, description, image, category, stock, featured, division, product_variants(id, product_id, title, price, stock, image)');

        if (error) throw error;

        if (prods) {
          const formatted = prods.map(p => {
            const hasVariants = p.product_variants && p.product_variants.length > 0;
            const inStockVariants = hasVariants ? p.product_variants.filter(v => (v.stock || 0) > 0) : [];
            const hasStock = hasVariants ? inStockVariants.length > 0 : (p.stock > 0);

            return {
              id: p.id,
              name: p.name,
              subtitle: `${p.category} Collectible Item`,
              price: parseFloat(p.price),
              originalPrice: null,
              image: p.image,
              category: p.category,
              categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
              stock: p.stock,
              inStock: hasStock,
              description: p.description,
              colors: hasVariants && inStockVariants.length > 0 ? inStockVariants.map(v => ({
                id: v.id,
                name: v.title,
                hex: '#888888',
                image: v.image,
                stock: v.stock,
                inStock: true,
                price: parseFloat(v.price || p.price)
              })) : null
            };
          });
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error('Error cargando catálogo desde Supabase:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Use DB products if available, fallback to props
  const activeProducts = dbProducts.length > 0 ? dbProducts : products;

  // Categories list dynamically derived from products
  const categories = React.useMemo(() => {
    const baseCats = [
      { name: "Todos", slug: "" },
      { name: "Yu-Gi-Oh!", slug: "yu-gi-oh" },
      { name: "Pokémon", slug: "pokemon" },
      { name: "Magic", slug: "magic" },
      { name: "Sleeves", slug: "sleeves" }
    ];
    const catMap = new Map();
    baseCats.forEach(c => catMap.set(c.slug, c.name));

    activeProducts.forEach(p => {
      if (p.category) {
        const slug = p.categorySlug || p.category.toLowerCase().replace(/\s+/g, '-');
        if (!catMap.has(slug)) {
          catMap.set(slug, p.category);
        }
      }
    });

    return Array.from(catMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [activeProducts]);

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
    setSortBy('featured');
  };

  // Process Products: Filter & Sort
  let filteredProducts = activeProducts.filter(product => {
    // 0. Stock Filter (Strict rule: out-of-stock products are never shown)
    const hasVariantStock = product.colors && product.colors.length > 0
      ? product.colors.some(c => (c.stock !== undefined ? c.stock > 0 : c.inStock))
      : true;
    const hasBaseStock = product.stock !== undefined ? product.stock > 0 : product.inStock;
    if (!hasBaseStock || !hasVariantStock) {
      return false;
    }

    // 1. Category Filter
    if (selectedCategory) {
      const targetCategory = selectedCategory.toLowerCase().trim();
      const productSlug = (product.categorySlug || product.category || '').toLowerCase().replace(/\s+/g, '-').trim();
      const matchCategory = productSlug === targetCategory ||
        product.category?.toLowerCase() === targetCategory ||
        (targetCategory === 'tcg' && ['pokemon', 'yu-gi-oh', 'magic'].includes(productSlug));
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

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const hasActiveFilters = selectedCategory || searchQuery || sortBy !== 'featured';

  const currentCategoryName = categories.find(c => c.slug === selectedCategory)?.name || (selectedCategory ? selectedCategory : 'Coleccionables');

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

      {/* Main Layout */}
      <main className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-start">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 sticky top-24 shadow-sm">
            <h2 className="font-headline-md text-base font-bold text-on-surface mb-4 flex items-center justify-between">
              Filtros
              {hasActiveFilters && (
                <span
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-primary cursor-pointer hover:underline"
                >
                  Limpiar
                </span>
              )}
            </h2>

            <div className="space-y-5">
              {/* Set / Category Filter */}
              <div>
                <h3 className="text-xs font-bold text-on-surface-variant mb-2.5 uppercase tracking-wider">
                  Colección (Set)
                </h3>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
                    return (
                      <label
                        key={cat.slug}
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors group ${
                          isSelected ? 'bg-primary text-on-primary font-semibold' : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="category-filter"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded-full border-outline-variant/50 text-primary focus:ring-primary w-3.5 h-3.5"
                          />
                          <span className="text-xs">{cat.name}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Reset button inside sidebar if active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full mt-2 py-2 px-3 border border-primary text-primary font-semibold text-xs rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 w-full flex flex-col gap-4">

          {/* Banner / Promo */}
          <div className="w-full h-28 sm:h-32 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center relative overflow-hidden border border-outline-variant/20 shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjLD6TIcEZBcXndWh2yEMKwmGiO4XyX1_0KhpisOH_b9gE2U_Qsj7wwHZUVss_3J7JjYbsHo6dwVklL2eqVzDGz1ufwsBfezxhOqQnyV1fPm-CUUvUvTm0_0dw4fAvNZMJ4ShKTZEGq4-x1p3K6TEJLhyI9GoU_NrdyM-NFbxkjBZJ3isQ91BN8lRFDIevHUmgVsVMzQqEX0N-MtjgWfl0XzUEZd3qbtCnEfGJTs0XGJfby4XUQRmFng')`
              }}
            ></div>
            <div className="relative z-10 text-center px-4">
              <h2 className="font-headline-md text-base sm:text-xl font-bold text-white tracking-tight">
                Colecciones &amp; Accesorios Oficiales
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1">
                Cartas TCG, sleeves de alta gama y material coleccionable en Azote Store.
              </p>
            </div>
          </div>

          {/* Sorting & Tools */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2.5 border-b border-outline-variant/30 gap-3">
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
              <strong className="text-on-surface font-bold">{filteredProducts.length}</strong> resultados en <span className="font-semibold">{currentCategoryName}</span>
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                  Ordenar por:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-outline-variant/40 bg-surface text-xs font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary py-1 px-2.5"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View toggle (Grid / List) */}
              <div className="flex border border-outline-variant/40 rounded-md overflow-hidden bg-surface shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title="Vista Cuadrícula"
                >
                  <span className="material-symbols-outlined text-[18px] block">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title="Vista Lista"
                >
                  <span className="material-symbols-outlined text-[18px] block">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary gap-3">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs text-on-surface-variant animate-pulse font-semibold">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3 bg-surface border border-outline-variant/30 rounded-xl shadow-xs px-4 text-center">
              <span className="material-symbols-outlined text-[4rem] text-outline/40">search_off</span>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Sin resultados</h3>
              <p className="text-xs max-w-sm text-on-surface-variant">
                No encontramos productos que coincidan con tu selección actual.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary text-on-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-container transition-colors mt-2"
              >
                Limpiar filtros
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Product Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedProducts.map((product) => (
                <article
                  key={product.id}
                  className="bg-surface rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-200 p-3 hover:shadow-md flex flex-col h-full shadow-xs group"
                >
                  {/* Card Image 3/4 Aspect */}
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="aspect-[3/4] rounded-lg bg-surface-container-low border border-outline-variant/20 mb-3 overflow-hidden relative flex items-center justify-center cursor-pointer p-2"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                        !product.inStock ? 'grayscale opacity-60' : ''
                      }`}
                    />

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="border border-error text-error bg-surface/90 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 flex flex-col">
                    <h3
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="font-headline-md text-sm font-bold text-on-surface line-clamp-2 leading-tight mb-1 cursor-pointer group-hover:text-primary transition-colors"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-1 font-medium">
                      {product.category}
                    </p>
                    <p className="text-xs font-semibold text-primary mb-auto">
                      {product.subtitle || 'Ultra Rare'}
                    </p>

                    {/* Price & Stock Section */}
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/20">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Precio</p>
                      <p className="font-headline-md text-base sm:text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </p>
                      <p
                        className={`text-[11px] mt-1 flex items-center gap-1 font-medium ${
                          product.inStock ? 'text-emerald-600' : 'text-error'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {product.inStock ? 'check_circle' : 'cancel'}
                        </span>
                        {product.inStock ? 'En Stock' : 'Agotado'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Product List View */
            <div className="flex flex-col gap-3">
              {paginatedProducts.map((product) => (
                <article
                  key={product.id}
                  className="bg-surface rounded-xl border border-outline-variant/30 hover:border-primary transition-all duration-200 p-3 hover:shadow-md flex flex-col sm:flex-row gap-4 shadow-xs group items-center"
                >
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-24 sm:w-28 aspect-[3/4] shrink-0 rounded-lg bg-surface-container-low border border-outline-variant/20 overflow-hidden relative flex items-center justify-center cursor-pointer p-1.5"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                        !product.inStock ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="border border-error text-error bg-surface/90 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-headline-md text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors cursor-pointer mt-0.5"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                        {product.description || product.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs flex items-center gap-1 font-medium ${
                          product.inStock ? 'text-emerald-600' : 'text-error'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {product.inStock ? 'check_circle' : 'cancel'}
                        </span>
                        {product.inStock ? 'Disponible' : 'Sin Stock'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/20 gap-1 cursor-pointer group-hover:text-primary transition-colors"
                  >
                    <p className="font-headline-md text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </p>
                    <span className="material-symbols-outlined text-primary text-[20px] group-hover:translate-x-1 transition-transform hidden sm:block">
                      arrow_forward
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 pt-5 border-t border-outline-variant/20">
              <nav className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-1.5 rounded-md border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Página anterior"
                >
                  <span className="material-symbols-outlined text-[16px] block">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-1.5 rounded-md border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Página siguiente"
                >
                  <span className="material-symbols-outlined text-[16px] block">chevron_right</span>
                </button>
              </nav>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
