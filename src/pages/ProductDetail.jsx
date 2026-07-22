import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ProductDetail({ products, onAddToCart, onAddToWishlist, wishlistItems }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dbProduct, setDbProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch product from Supabase
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { supabase } = await import('../supabaseClient');
        const { data: p, error } = await supabase
          .from('products')
          .select('id, name, price, description, image, category, stock, featured, division, product_variants(id, product_id, title, price, stock, image)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (p) {
          const formatted = {
            id: p.id,
            name: p.name,
            subtitle: `${p.category} Collectible Item`,
            price: parseFloat(p.price),
            originalPrice: null,
            image: p.image,
            category: p.category,
            categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
            inStock: p.stock > 0,
            // grade: 'Premium Grade',
            description: p.description,
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
          };
          setDbProduct(formatted);
          if (formatted.colors && formatted.colors.length > 0) {
            setSelectedColor(formatted.colors[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching product details from Supabase:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const product = dbProduct || products.find(p => p.id === id);

  const [selectedColor, setSelectedColor] = useState(null);
  const isCurrentColorInStock = selectedColor ? selectedColor.inStock : (product ? product.inStock : false);

  const [variantImages, setVariantImages] = useState({});

  // Fetch variant image on-demand for selected variant
  useEffect(() => {
    if (selectedColor && selectedColor.id) {
      const colorId = selectedColor.id;
      if (variantImages[colorId]) return;

      (async () => {
        try {
          const { supabase } = await import('../supabaseClient');
          const { data, error } = await supabase
            .from('product_variants')
            .select('image')
            .eq('id', colorId)
            .single();
          if (!error && data?.image) {
            setVariantImages(prev => ({ ...prev, [colorId]: data.image }));
          }
        } catch (err) {
          console.error('Error fetching variant image on-demand:', err);
        }
      })();
    }
  }, [selectedColor, variantImages]);

  // Eagerly pre-fetch all variant images when product loads
  useEffect(() => {
    if (product && product.colors) {
      (async () => {
        try {
          const { supabase } = await import('../supabaseClient');
          const missingIds = product.colors
            .map(c => c.id)
            .filter(id => !variantImages[id]);
          
          if (missingIds.length === 0) return;

          const { data, error } = await supabase
            .from('product_variants')
            .select('id, image')
            .in('id', missingIds);
          
          if (!error && data) {
            const newImages = {};
            data.forEach(item => {
              if (item.image) {
                newImages[item.id] = item.image;
              }
            });
            setVariantImages(prev => ({ ...prev, ...newImages }));
          }
        } catch (err) {
          console.error('Error pre-fetching variant images:', err);
        }
      })();
    }
  }, [product]);

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Drag-to-scroll for variant strip
  const variantStripRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const wasDragged = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    const el = variantStripRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    wasDragged.current = false;
    dragStartX.current = e.pageX;
    scrollStartX.current = el.scrollLeft;
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const el = variantStripRef.current;
    if (!el) return;
    const dx = e.pageX - dragStartX.current;
    if (Math.abs(dx) > 5) wasDragged.current = true;
    el.scrollLeft = scrollStartX.current - dx;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Reset states when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsVideoOpen(false);
    if (product && product.colors) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor(null);
    }
  }, [id, product]);

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl text-center flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-headline-md text-sm text-on-surface-variant animate-pulse font-semibold">Cargando detalles del coleccionable...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl text-center">
        <span className="material-symbols-outlined text-[6rem] text-error/30 mb-4">warning</span>
        <h2 className="font-headline-lg text-headline-lg text-on-background">Producto no encontrado</h2>
        <p className="font-body-md text-on-surface-variant my-4">El coleccionable que buscas no existe o ha sido retirado de la bóveda.</p>
        <Link to="/catalog" className="inline-block bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:scale-105 transition-transform mt-2">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isFavorite = wishlistItems.some(item => item.id === product.id);

  // Check if image is video (last item in RX-78-2 mockup is video)
  const isVideoIndex = (index) => {
    return product.id === 'rx-78-2-titanium-finish' && index === 4;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg animate-fade-in">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-lg font-body-md">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link to="/catalog" className="hover:text-primary transition-colors">Catálogo</Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link to={`/catalog?category=${product.categorySlug}`} className="hover:text-primary transition-colors uppercase">{product.category}</Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-on-background font-semibold line-clamp-1">{product.name}</span>
      </div>

      {/* Product Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-xl">

        {/* Left: Image Gallery (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-base">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] relative h-[400px] md:h-[600px] group border border-outline-variant/20">
            {isVideoOpen ? (
              <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white relative">
                <span className="material-symbols-outlined text-[5rem] text-primary animate-pulse">play_circle</span>
                <p className="font-headline-md mt-4">Video de Exhibición de Gunpla</p>
                <p className="font-body-md text-white/75 mt-1 text-center max-w-sm px-4">Esta es una reproducción simulada del RX-78-2 en su base de exhibición dinámica.</p>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <img
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-102"
                src={
                  (selectedColor ? variantImages[selectedColor.id] : null) ||
                  selectedColor?.image ||
                  (product.gallery && product.gallery[activeImageIndex]) ||
                  product.image
                }
                alt={product.name}
              />
            )}
          </div>

          {/* Gallery Thumbnails — only for non-variant products with multi-image galleries */}
          {!product.colors && product.gallery && product.gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-base mt-sm">
              {product.gallery.map((imgUrl, index) => {
                const isVideo = isVideoIndex(index);
                const isActive = !isVideoOpen && activeImageIndex === index && !isVideo;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isVideo) { setIsVideoOpen(true); }
                      else { setIsVideoOpen(false); setActiveImageIndex(index); }
                    }}
                    className={`rounded-lg overflow-hidden shadow-sm h-16 sm:h-24 cursor-pointer border-2 transition-all relative ${isActive ? 'border-primary scale-[0.98]'
                      : (isVideoOpen && isVideo ? 'border-primary scale-[0.98]' : 'border-transparent hover:opacity-85')
                      }`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${index + 1}`} className={`w-full h-full object-cover ${isVideo ? 'opacity-65' : ''}`} />
                    {isVideo && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-3xl md:text-4xl">play_circle</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Variant image strip — below the main image */}
          {product.colors && selectedColor && (
            <div className="mt-3">
              <label className="block font-label-md text-on-surface-variant text-xs uppercase tracking-wider mb-2.5 ml-1 font-semibold">
                {product.categorySlug === 'sleeves' ? 'Color del Protector' : 'Seleccionar Tipo'}
                <span className="text-primary ml-1.5 normal-case tracking-normal">— {selectedColor.name}</span>
              </label>

              <div
                ref={variantStripRef}
                className={`flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--md-sys-color-outline-variant) transparent' }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {product.colors.map((color, idx) => {
                  const isSelected = color.id === selectedColor.id;
                  const isInStock = color.inStock;
                  const imgSrc = variantImages[color.id] || color.image || product.image;

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        if (wasDragged.current) return;
                        setSelectedColor(color);
                        setActiveImageIndex(idx);
                      }}
                      className={`relative shrink-0 w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-xl overflow-hidden border-2 transition-all duration-200 group focus:outline-none
                        ${isSelected
                          ? 'border-primary shadow-[0_0_0_2px_var(--md-sys-color-primary)] scale-[1.02]'
                          : 'border-outline-variant/30 hover:border-primary/50 hover:shadow-md'
                        }
                        ${!isInStock ? 'opacity-60' : ''}
                      `}
                      title={color.name}
                    >
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={color.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px] text-outline">inventory_2</span>
                        </div>
                      )}

                      {/* Dark gradient overlay at bottom for name */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-4 pb-1 px-1.5">
                        <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight block truncate text-center">
                          {color.name}
                        </span>
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[14px] text-on-primary font-bold">check</span>
                        </div>
                      )}

                      {/* Out of stock badge */}
                      {!isInStock && (
                        <div className="absolute top-1 left-1 bg-error/90 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                          Agotado
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details (4 columns) */}
        <div className="lg:col-span-4 flex flex-col pt-md lg:pt-0">
          <div className="flex items-center gap-2 mb-sm">
            {isCurrentColorInStock ? (
              <span className="bg-primary-container/20 text-primary-container px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> En Stock
              </span>
            ) : (
              <span className="bg-error-container/20 text-error px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">cancel</span> Agotado
              </span>
            )}
            {product.grade && (
              <span className="bg-secondary-container/20 text-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                {product.grade}
              </span>
            )}
          </div>

          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-xs leading-tight">
            {product.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">{product.subtitle}</p>

          <div className="flex items-baseline gap-sm mb-lg">
            <span className="font-headline-lg text-headline-lg text-primary">
              ${(selectedColor?.price ?? product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="font-body-md text-body-md text-outline line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>


          <p className="font-body-md text-body-md text-on-surface-variant mb-lg leading-relaxed">
            {product.description}
          </p>

          {/* Specifications list */}
          {product.specifications && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md mb-lg">
              <h3 className="font-label-md text-label-md text-on-surface mb-sm uppercase tracking-widest text-outline">Especificaciones</h3>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                {Object.entries(product.specifications).map(([key, val], idx, arr) => {
                  // For the Stock row, show the live per-variant count when a color is selected
                  const displayVal = (key === 'Stock' && selectedColor?.stock !== undefined)
                    ? selectedColor.stock
                    : val;
                  return (
                    <li
                      key={key}
                      className={`flex justify-between pb-2 ${idx < arr.length - 1 ? 'border-b border-outline-variant/30' : ''
                        }`}
                    >
                      <span className="capitalize">{key}</span>
                      <span className="font-medium text-on-surface">{displayVal}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-sm mt-auto">
            {isCurrentColorInStock ? (
              <button
                onClick={() => onAddToCart(product, selectedColor)}
                className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart_checkout</span>
                Añadir al Carrito
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-outline-variant/50 text-outline font-headline-md text-headline-md py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_cart_off</span>
                Producto Agotado
              </button>
            )}

            <button
              onClick={() => onAddToWishlist(product)}
              className={`w-full border-2 py-4 rounded-xl font-headline-md text-headline-md hover:bg-primary-container/10 transition-colors duration-200 flex items-center justify-center gap-2 ${isFavorite
                ? 'border-secondary text-secondary hover:bg-secondary/10'
                : 'border-primary text-primary'
                }`}
            >
              <span className="material-symbols-outlined">
                {isFavorite ? 'favorite' : 'favorite_border'}
              </span>
              {isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
            </button>
          </div>

          {/* <div className="mt-md flex items-center justify-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span> Envío seguro gratis en pedidos superiores a $150
          </div> */}
        </div>

      </div>
    </div>
  );
}
