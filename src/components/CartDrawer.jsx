import React, { useState } from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onClearCart,
  currentUser
}) {
  const [animateClose, setAnimateClose] = useState(true);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Sync rendering with isOpen state and close animations
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Wait for React layout paint
      const timer = setTimeout(() => {
        setAnimateClose(false);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      setAnimateClose(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [step, setStep] = useState('cart'); // 'cart', 'payment', 'success'
  const [pickupLocation, setPickupLocation] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofName, setPaymentProofName] = useState('');
  const [paymentProofPreview, setPaymentProofPreview] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCloseDrawer = () => {
    if (step === 'success') {
      onClearCart();
      setStep('cart');
      setPickupLocation('');
      setPaymentProof(null);
      setPaymentProofName('');
      setPaymentProofPreview('');
      setCreatedOrder(null);
    }
    onClose();
  };

  const handleSubmitPayment = () => {
    if (!paymentProofPreview) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const order = onPlaceOrder({
        pickupLocation: pickupLocation === 'centro'
          ? 'Sucursal Centro (Av. Principal 123)'
          : pickupLocation === 'norte'
            ? 'Sucursal Norte (C.C. Plaza Norte, Local 45)'
            : pickupLocation === 'sur'
              ? 'Sucursal Sur (Av. de los Álamos 789)'
              : 'Recojo en Tienda General',
        paymentProofName,
        paymentProofPreview
      });

      setCreatedOrder(order);
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 'payment':
        return 'Detalles de Pago';
      case 'success':
        return '¡Pedido Recibido!';
      default:
        return 'Tu Carrito';
    }
  };

  const isFormValid = !!paymentProofPreview;

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${!animateClose ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"
        onClick={handleCloseDrawer}
      ></div>

      {/* Drawer Body */}
      <div className={`absolute inset-y-0 right-0 w-full sm:w-[448px] sm:max-w-[448px] bg-surface border-l border-outline-variant/30 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out ${!animateClose ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-6 py-6 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="text-headline-md font-montserrat text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.2em]">
              {step === 'cart' ? 'shopping_cart' : step === 'payment' ? 'payments' : 'check_circle'}
            </span>
            {getHeaderTitle()}
          </h2>
          <button
            onClick={handleCloseDrawer}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Step 1: Cart Items */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
                  <span className="material-symbols-outlined text-[4rem] text-outline/40">shopping_cart_off</span>
                  <p className="font-body-lg text-body-lg text-center font-medium">Tu carrito está vacío</p>
                  <button
                    onClick={handleCloseDrawer}
                    className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-full hover:scale-105 transition-transform"
                  >
                    Explorar Tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.color ? item.color.id : 'default'}`} className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 card-shadow transition-all hover:scale-[1.01]">
                      <img
                        src={item.color ? item.color.image : item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover bg-surface-container-low"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-label-md text-on-background line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-on-surface-variant">{item.product.subtitle}</p>
                          {item.color && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div
                                className={`w-3 h-3 rounded border border-outline-variant/40 shrink-0 ${item.color.id === 'clear-gloss' ? 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:4px_4px]' : ''}`}
                                style={item.color.id !== 'clear-gloss' ? { backgroundColor: item.color.hex } : {}}
                              ></div>
                              <span className="text-[10px] font-bold text-on-surface-variant">Color: {item.color.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-label-md text-primary font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>

                          {/* Quantity Controls */}
                          <div className="flex items-center bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/30">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.color ? item.color.id : null)}
                              className="px-2.5 py-1 text-on-surface hover:bg-surface-container-highest transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">remove</span>
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                onUpdateQuantity(item.product.id, val, item.color ? item.color.id : null);
                              }}
                              className="w-10 bg-transparent border-none text-center text-sm font-semibold font-body-md text-on-surface outline-none focus:ring-0"
                            />
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.color ? item.color.id : null)}
                              className="px-2.5 py-1 text-on-surface hover:bg-surface-container-highest transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.color ? item.color.id : null)}
                        className="text-on-surface-variant hover:text-error self-start p-1 rounded-full hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-outline-variant/30 px-6 py-6 bg-surface-container-low">
                <div className="flex justify-between font-label-md text-on-background mb-4">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
                {/* <p className="text-xs text-on-surface-variant mb-6">
                        El costo total incluye los impuestos correspondientes. El recojo en cualquiera de nuestras sucursales es completamente gratuito.
                      </p> */}
                {currentUser ? (
                  <button
                    onClick={() => setStep('payment')}
                    className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Proceder al Pago
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-center">
                      <p className="text-xs text-error font-semibold">Debes iniciar sesión para realizar pedidos.</p>
                    </div>
                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        // Delay navigate slightly so transition completes
                        setTimeout(() => {
                          window.location.href = '/login';
                        }, 300);
                      }}
                      className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      Iniciar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 2: Payment and Pick Up */}
        {step === 'payment' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Bank Transfer Instructions */}
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-1.5 text-xs uppercase tracking-wider font-montserrat">
                  <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
                  Transferencia Bancaria
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Realiza el depósito/transferencia a nuestra cuenta comercial e ingresa el comprobante abajo:
                </p>
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 space-y-1.5 font-mono text-[11px] text-on-surface-variant">
                  <div className="flex justify-between"><span>Yappy:</span> <span className="font-bold text-on-surface">6860-7905</span></div>
                  {/* <div className="flex justify-between"><span>Cuenta corriente:</span> <span className="font-bold text-on-surface">98765432101234567</span></div>
                  <div className="flex justify-between"><span>Beneficiario:</span> <span className="font-bold text-on-surface">Azote Store S.A.</span></div> */}
                  <div className="flex justify-between"><span>Monto a Transferir:</span> <span className="font-bold text-primary font-sans text-xs">${total.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Pickup Locations */}
              {/* <div className="space-y-3">
                <label className="block font-label-md text-on-surface-variant text-xs uppercase tracking-wider ml-1 font-semibold">
                  Punto de Recojo
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'centro', name: 'Sucursal Centro', address: 'Av. Principal 123, Centro', hours: 'Lun-Sáb 9:00 - 19:00' },
                    { id: 'norte', name: 'Sucursal Norte', address: 'C.C. Plaza Norte, Local 45', hours: 'Lun-Dom 10:00 - 21:00' },
                    { id: 'sur', name: 'Sucursal Sur', address: 'Av. de los Álamos 789, Sur', hours: 'Lun-Vie 10:00 - 18:00' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setPickupLocation(loc.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 ${pickupLocation === loc.id
                        ? 'border-primary bg-primary/5 shadow-[0_2px_8px_rgba(0,74,198,0.1)] -translate-y-0.5'
                        : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                        }`}
                    >
                      <span className={`material-symbols-outlined mt-0.5 ${pickupLocation === loc.id ? 'text-primary' : 'text-outline'}`} style={{ fontVariationSettings: pickupLocation === loc.id ? '"FILL" 1' : '' }}>
                        {pickupLocation === loc.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-on-surface">{loc.name}</div>
                        <div className="text-xs text-on-surface-variant truncate">{loc.address}</div>
                        <div className="text-[10px] text-outline mt-0.5">{loc.hours}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Payment Proof File Upload */}
              <div className="space-y-3">
                <label className="block font-label-md text-on-surface-variant text-xs uppercase tracking-wider ml-1 font-semibold">
                  Comprobante de Pago
                </label>

                {!paymentProofPreview ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-outline-variant/60 hover:border-primary rounded-xl p-5 text-center bg-surface-container-low hover:bg-surface-container transition-all duration-300 cursor-pointer relative group flex flex-col items-center justify-center min-h-[110px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setPaymentProof(file);
                            setPaymentProofName(file.name);
                            setPaymentProofPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <span className="material-symbols-outlined text-primary scale-125 mb-2 group-hover:scale-110 transition-transform">
                        cloud_upload
                      </span>
                      <span className="font-bold text-xs text-on-surface">Subir Comprobante de Pago</span>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Soporta PNG, JPG, WebP (Máx. 5MB)</p>
                    </div>

                    {/* <button
                      type="button"
                      onClick={() => {
                        setPaymentProof(new File([], "comprobante_demo.png"));
                        setPaymentProofName("comprobante_demo.png");
                        setPaymentProofPreview("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop");
                      }}
                      className="w-full text-center text-[11px] text-primary hover:underline font-bold py-2 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors"
                    >
                      ✨ Autocompletar comprobante para demostración
                    </button> */}
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 flex gap-3 items-center relative card-shadow border-primary/20">
                    <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/20 flex-shrink-0 flex items-center justify-center">
                      <img src={paymentProofPreview} alt="Vista previa del comprobante" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-bold text-on-surface truncate">{paymentProofName}</div>
                      <div className="text-[10px] text-primary flex items-center gap-1 font-medium mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Listo para enviar
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProof(null);
                        setPaymentProofName('');
                        setPaymentProofPreview('');
                      }}
                      className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                      aria-label="Remover comprobante"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Summary & Buttons */}
            <div className="border-t border-outline-variant/30 px-6 py-5 bg-surface-container-low flex flex-col gap-3">
              <div className="flex justify-between font-label-md text-on-surface-variant text-xs font-semibold">
                <span>Total ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                <span className="text-on-surface font-bold text-sm">${total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="col-span-1 border border-outline-variant text-on-surface font-headline-md py-3.5 rounded-xl hover:bg-surface-container-high transition-colors text-xs font-bold flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Atrás
                </button>

                <button
                  type="button"
                  disabled={!isFormValid || isSubmitting}
                  onClick={handleSubmitPayment}
                  className={`col-span-2 py-3.5 rounded-xl font-headline-md text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${isFormValid
                    ? 'bg-primary text-on-primary shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-outline-variant/40 text-on-surface-variant/40 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Success View */}
        {step === 'success' && createdOrder && (
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center animate-bounce shadow-md">
              <span className="material-symbols-outlined text-[48px] font-variation-settings-'FILL' 1" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified_user
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-montserrat font-bold text-headline-md text-on-background">¡Pedido Confirmado!</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Hemos recibido tu comprobante de pago. Tu orden está siendo procesada y verificada.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-surface-container-low border border-outline-variant/35 rounded-2xl p-5 w-full text-left space-y-3.5 card-shadow">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Código de Pedido</span>
                <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full">{createdOrder.id}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="text-[10px] text-outline uppercase tracking-wider font-semibold">Punto de Retiro</div>
                  <div className="font-bold text-on-surface mt-0.5">{createdOrder.pickupLocation}</div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                  <div>
                    <div className="text-[10px] text-outline uppercase tracking-wider font-semibold">Total Pagado</div>
                    <div className="font-bold text-primary font-sans text-sm mt-0.5">${createdOrder.total.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-outline uppercase tracking-wider font-semibold">Comprobante</div>
                    <div className="text-on-surface-variant font-medium truncate max-w-[120px] mt-0.5">{createdOrder.paymentProofName}</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-outline leading-relaxed max-w-xs">
              Te notificaremos o podrás revisar en tienda cuando tu estado sea actualizado a "Listo para Recojo". ¡Gracias por confiar en Azote Store!
            </p>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-full bg-primary text-on-primary font-headline-md py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.99] transition-all font-bold text-xs"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
