import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function OrdersPage({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError('');
        const { supabase } = await import('../supabaseClient');

        // Fetch products and their variants to get correct images
        const { data: dbProducts, error: pErr } = await supabase
          .from('products')
          .select('id, name, price, description, image, category, stock, featured, division, product_variants(id, product_id, title, price, stock)');

        if (pErr) throw pErr;

        // Fetch user specific orders along with their items
        const { data: dbOrders, error: oErr } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', currentUser.id);

        if (oErr) throw oErr;

        if (dbOrders && dbProducts) {
          const formattedOrders = dbOrders.map(o => ({
            id: o.id,
            date: new Date(o.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            clientName: o.client_name,
            clientEmail: o.client_email,
            total: parseFloat(o.total),
            pickupLocation: o.pickup_location,
            paymentProofName: o.payment_proof_name,
            paymentProofPreview: o.payment_proof_preview,
            status: o.status || 'Realizado',
            items: o.order_items ? o.order_items.map(oi => {
              // Find matching product in DB products
              const productObj = dbProducts.find(p => String(p.id) === String(oi.product_id));

              // Determine item image (use variant image if color_id matches, otherwise default to product image)
              let itemImage = productObj?.image;
              if (oi.color_id && productObj?.product_variants) {
                const variantObj = productObj.product_variants.find(v => String(v.id) === String(oi.color_id));
                if (variantObj?.image) {
                  itemImage = variantObj.image;
                }
              }

              return {
                productId: oi.product_id,
                productName: oi.product_name,
                price: parseFloat(oi.price),
                quantity: oi.quantity,
                colorName: oi.color_name,
                image: itemImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=150'
              };
            }) : []
          }));

          // Sort by ID/date descending (newest first)
          formattedOrders.sort((a, b) => b.id.localeCompare(a.id));
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
        setError('No pudimos cargar tus pedidos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  // Status badge style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Entregado':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 dark:text-green-400 border border-green-500/20 text-xs font-bold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Listo para retirar / Entregado
          </span>
        );
      case 'Cancelado':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-error/10 text-error border border-error/20 text-xs font-bold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Cancelado
          </span>
        );
      case 'Realizado':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary dark:text-primary-fixed border border-primary/20 text-xs font-bold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            Realizado (En Proceso)
          </span>
        );
    }
  };

  // If user is not logged in, show restricted view
  if (!currentUser) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-2xl flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg text-center shadow-xl card-shadow flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-3">Acceso Restringido</h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-8 max-w-sm">
            Debes iniciar sesión para poder ver tus pedidos y el estado de tus compras en Azote Store.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-primary text-on-primary font-headline-md py-3 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-surface-container-high text-on-surface font-headline-md py-3 rounded-xl border border-outline-variant/30 hover:scale-[1.02] active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl min-h-[75vh]">
      {/* Header section with back link */}
      <div className="flex flex-col gap-2 mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-bold text-outline hover:text-primary w-fit transition-colors group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          Volver al Inicio
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-background">Mis Pedidos</h1>
            <p className="font-body-md text-sm text-on-surface-variant">Sigue el estado de tus compras y retiros.</p>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-on-background">{currentUser.name}</p>
              <p className="text-[10px] text-outline">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2 border border-error/20">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg text-center card-shadow">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-headline-md text-sm text-on-surface-variant animate-pulse font-semibold">Cargando tus pedidos desde la bóveda...</p>
        </div>
      ) : orders.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg text-center card-shadow">
          <div className="w-20 h-20 rounded-full bg-surface-container-high text-outline flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px]">shopping_bag</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-background mb-2">Aún no tienes pedidos</h3>
          <p className="font-body-md text-sm text-on-surface-variant mb-8 max-w-sm">
            Explora nuestro catálogo de productos TCG, Sleeves y Juegos de Mesa para realizar tu primer pedido.
          </p>
          <Link
            to="/catalog"
            className="bg-primary text-on-primary font-headline-md px-8 py-3 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all text-sm font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        // Orders List
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 card-shadow"
            >
              {/* Card Header */}
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  <div>
                    <h3 className="font-bold text-sm text-on-background">{order.id}</h3>
                    <p className="text-[11px] text-outline">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="divide-y divide-outline-variant/20">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20 bg-surface-container-low shrink-0 shadow-sm"
                      />
                      <div className="flex-grow min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-bold text-sm text-on-background hover:text-primary transition-colors hover:underline block truncate"
                        >
                          {item.productName}
                        </Link>
                        {item.colorName && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-surface-container-high text-outline text-[10px] font-semibold rounded-md border border-outline-variant/20">
                            Variante: {item.colorName}
                          </span>
                        )}
                        <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                          <span>${item.price.toFixed(2)}</span>
                          <span className="text-outline">×</span>
                          <span className="font-bold text-on-background">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-on-background">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra Details (Pickup Info & Payment Status) */}
                <div className="mt-6 pt-6 border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/50 -mx-6 -mb-6 p-6">
                  {/* Left Column: Pickup location */}
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">store</span>
                    <div>
                      <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Punto de Retiro</h4>
                      <p className="text-sm font-semibold text-on-surface">{order.pickupLocation || 'No especificado'}</p>
                      <p className="text-xs text-on-surface-variant mt-1">El pedido estará listo para retiro en el local seleccionado.</p>
                    </div>
                  </div>

                  {/* Right Column: Payment Proof */}
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-outline mt-0.5">payments</span>
                    <div className="w-full">
                      <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Comprobante y Pago</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-semibold text-on-surface">Total del Pedido</span>
                        <span className="text-base font-black text-primary">${order.total.toFixed(2)}</span>
                      </div>
                      {order.paymentProofPreview ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofUrl(order.paymentProofPreview)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          Ver Comprobante
                        </button>
                      ) : (
                        <p className="text-xs text-error mt-2 font-semibold">Sin comprobante adjunto</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
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

          </div>
        </div>
      )}
    </div>
  );
}
