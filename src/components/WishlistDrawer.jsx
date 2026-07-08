import React from 'react';

export default function WishlistDrawer({ isOpen, onClose, wishlistItems, onAddToCart, onRemoveFromWishlist }) {
  const [animateClose, setAnimateClose] = React.useState(true);
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setAnimateClose(false);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      setAnimateClose(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${!animateClose ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer Body */}
      <div className={`absolute inset-y-0 right-0 w-full sm:w-[448px] sm:max-w-[448px] bg-surface border-l border-outline-variant/30 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out ${!animateClose ? 'translate-x-0' : 'translate-x-full'}`}>
              
              {/* Header */}
              <div className="px-6 py-6 border-b border-outline-variant/30 flex items-center justify-between">
                <h2 className="text-headline-md font-montserrat text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1.2em] text-secondary">favorite</span>
                  Tus Favoritos
                </h2>
                <button 
                  onClick={onClose}
                  className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {wishlistItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
                    <span className="material-symbols-outlined text-[4rem] text-outline/40">favorite_border</span>
                    <p className="font-body-lg text-body-lg text-center font-medium">No tienes productos favoritos</p>
                    <button 
                      onClick={onClose}
                      className="bg-secondary text-on-secondary font-label-md px-6 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      Buscar Coleccionables
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistItems.map((product) => (
                      <div key={product.id} className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 card-shadow transition-all hover:scale-[1.01]">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-20 h-20 rounded-lg object-cover bg-surface-container-low" 
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-label-md text-on-background line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-on-surface-variant">{product.subtitle}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-label-md text-primary font-semibold">${product.price.toFixed(2)}</span>
                            
                            {/* Add to Cart button */}
                            <button
                              onClick={() => {
                                onAddToCart(product);
                                onRemoveFromWishlist(product.id);
                              }}
                              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                              Mover al carro
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-on-surface-variant hover:text-error self-start p-1 rounded-full hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

      </div>
    </div>
  );
}
