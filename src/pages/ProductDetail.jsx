import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
export default function ProductDetail({ products, onAddToCart, onAddToWishlist, wishlistItems }) {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  const sleevesColors = [
    { id: 'sleeves-matte-black', name: 'Negro Mate', hex: '#111827' },
    { id: 'sleeves-clear-gloss', name: 'Transparente Brillante', hex: '#f3f4f6' },
    { id: 'sleeves-matte-red', name: 'Rojo Mate', hex: '#dc2626' },
    { id: 'sleeves-matte-blue', name: 'Azul Mate', hex: '#2563eb' }
  ];

  const currentSleeveColor = sleevesColors.find(c => c.id === product?.id);

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsVideoOpen(false);
  }, [id]);

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
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      
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
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                src={product.gallery && product.gallery[activeImageIndex] ? product.gallery[activeImageIndex] : product.image}
                alt={product.name}
              />
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-base mt-sm">
              {product.gallery.map((imgUrl, index) => {
                const isVideo = isVideoIndex(index);
                return (
                  <div 
                    key={index}
                    onClick={() => {
                      if (isVideo) {
                        setIsVideoOpen(true);
                      } else {
                        setIsVideoOpen(false);
                        setActiveImageIndex(index);
                      }
                    }}
                    className={`rounded-lg overflow-hidden shadow-sm h-16 sm:h-24 cursor-pointer border-2 transition-all relative ${
                      !isVideoOpen && activeImageIndex === index && !isVideo
                        ? 'border-primary scale-[0.98]'
                        : isVideoOpen && isVideo 
                        ? 'border-primary scale-[0.98]'
                        : 'border-transparent hover:opacity-85'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${product.name} gallery ${index + 1}`} 
                      className={`w-full h-full object-cover ${isVideo ? 'opacity-65' : ''}`}
                    />
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
        </div>

        {/* Right: Product Details (4 columns) */}
        <div className="lg:col-span-4 flex flex-col pt-md lg:pt-0">
          <div className="flex items-center gap-2 mb-sm">
            {product.inStock ? (
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
            <span className="font-headline-lg text-headline-lg text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="font-body-md text-body-md text-outline line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Sleeves Color Dropdown Variation */}
          {product.categorySlug === 'sleeves' && currentSleeveColor && (
            <div className="mb-lg relative">
              <label className="block font-label-md text-on-surface-variant text-xs uppercase tracking-wider mb-2 ml-1 font-semibold">
                Color del Protector
              </label>
              
              {/* Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                className="w-full md:max-w-xs flex items-center justify-between bg-surface-container-low border border-outline-variant/40 hover:border-primary rounded-xl px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-primary outline-none card-shadow"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5 rounded border border-outline-variant/40 shadow-sm shrink-0" 
                    style={{ backgroundColor: currentSleeveColor.hex }}
                    {...(product.id === 'sleeves-clear-gloss' ? { className: "w-5 h-5 rounded border border-outline-variant/40 shadow-sm shrink-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:6px_6px]" } : {})}
                  ></div>
                  <span className="font-bold text-on-surface">{currentSleeveColor.name}</span>
                </div>
                <span className={`material-symbols-outlined text-outline transition-transform duration-200 ${isColorMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Click-outside backdrop */}
              {isColorMenuOpen && (
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsColorMenuOpen(false)}
                ></div>
              )}

              {/* Dropdown Options Menu */}
              {isColorMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full md:max-w-xs bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-xl shadow-lg z-30 py-1.5 flex flex-col gap-0.5 card-shadow">
                  {sleevesColors.map((color) => {
                    const isSelected = color.id === product.id;
                    const targetProduct = products.find(p => p.id === color.id);
                    const isInStock = targetProduct ? targetProduct.inStock : true;
                    
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setIsColorMenuOpen(false);
                          navigate(`/product/${color.id}`);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-primary/5 text-primary' : 'text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="w-5 h-5 rounded border border-outline-variant/30 shadow-sm shrink-0" 
                            style={{ backgroundColor: color.hex }}
                            {...(color.id === 'sleeves-clear-gloss' ? { className: "w-5 h-5 rounded border border-outline-variant/30 shadow-sm shrink-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:6px_6px]" } : {})}
                          ></div>
                          <span className="text-xs font-bold truncate">{color.name}</span>
                        </div>
                        
                        {!isInStock && (
                          <span className="text-[9px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full shrink-0">
                            Agotado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <p className="font-body-md text-body-md text-on-surface-variant mb-lg leading-relaxed">
            {product.description}
          </p>

          {/* Specifications list */}
          {product.specifications && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md mb-lg">
              <h3 className="font-label-md text-label-md text-on-surface mb-sm uppercase tracking-widest text-outline">Especificaciones</h3>
              <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                {Object.entries(product.specifications).map(([key, val], idx, arr) => (
                  <li 
                    key={key} 
                    className={`flex justify-between pb-2 ${
                      idx < arr.length - 1 ? 'border-b border-outline-variant/30' : ''
                    }`}
                  >
                    <span className="capitalize">{key}</span> 
                    <span className="font-medium text-on-surface">{val}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-sm mt-auto">
            {product.inStock ? (
              <button 
                onClick={() => onAddToCart(product)}
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
              className={`w-full border-2 py-4 rounded-xl font-headline-md text-headline-md hover:bg-primary-container/10 transition-colors duration-200 flex items-center justify-center gap-2 ${
                isFavorite 
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

          <div className="mt-md flex items-center justify-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span> Envío seguro gratis en pedidos superiores a $150
          </div>
        </div>

      </div>
    </div>
  );
}
