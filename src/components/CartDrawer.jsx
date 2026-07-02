import React from 'react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay backdrop */}
        <div 
          className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out">
            <div className="flex h-full flex-col bg-surface shadow-2xl border-l border-outline-variant/30">
              
              {/* Header */}
              <div className="px-6 py-6 border-b border-outline-variant/30 flex items-center justify-between">
                <h2 className="text-headline-md font-montserrat text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1.2em]">shopping_cart</span>
                  Tu Carrito
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
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
                    <span className="material-symbols-outlined text-[4rem] text-outline/40">shopping_cart_off</span>
                    <p className="font-body-lg text-body-lg text-center font-medium">Tu carrito está vacío</p>
                    <button 
                      onClick={onClose}
                      className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      Explorar Tienda
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 card-shadow transition-all hover:scale-[1.01]">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-20 h-20 rounded-lg object-cover bg-surface-container-low" 
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-label-md text-on-background line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-on-surface-variant">{item.product.subtitle}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-label-md text-primary font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/30">
                              <button 
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-on-surface hover:bg-surface-container-highest transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">remove</span>
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold font-body-md text-on-surface">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-on-surface hover:bg-surface-container-highest transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-on-surface-variant hover:text-error self-start p-1 rounded-full hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-outline-variant/30 px-6 py-6 bg-surface-container-low">
                  <div className="flex justify-between font-label-md text-on-background mb-4">
                    <span>Subtotal</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-6">
                    Los impuestos y gastos de envío se calcularán al finalizar la compra. Envío gratis para compras superiores a $150.
                  </p>
                  <button 
                    onClick={() => alert('¡Gracias por tu compra! (Simulación de Checkout)')}
                    className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Proceder al Pago
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
