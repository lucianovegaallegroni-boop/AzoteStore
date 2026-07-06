import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage({ products, onCreateProduct, orders = [], setOrders }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Yu-Gi-Oh');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  
  // Tabs and Modal states
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders'
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

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
      <div className="flex border-b border-outline-variant/30 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          Gestión de Catálogo
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 font-headline-md text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative ${
            activeTab === 'orders'
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Side Navigation or Stats */}
        <aside className="lg:col-span-3 flex flex-col gap-base bg-surface-container-low dark:bg-surface-container-highest p-md rounded-xl collector-card-shadow hidden lg:block border border-outline-variant/30">
          {activeTab === 'inventory' ? (
            <>
              <div className="mb-base">
                <h2 className="font-headline-md text-headline-md text-on-surface">Filtros de Catálogo</h2>
                <p className="text-on-surface-variant text-label-sm">Refina tu vista de colección</p>
              </div>
              <nav className="flex flex-col gap-xs">
                <a className="flex items-center gap-sm p-sm bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container rounded-lg font-bold transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">fiber_new</span>
                  <span className="text-label-md">Novedades</span>
                </a>
                <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">update</span>
                  <span className="text-label-md">Reabastecimientos</span>
                </a>
                <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">event_available</span>
                  <span className="text-label-md">Preventas</span>
                </a>
                <a className="flex items-center gap-sm p-sm text-on-surface-variant dark:text-on-surface hover:bg-surface-variant dark:hover:bg-outline-variant rounded-lg transition-all transform active:translate-x-1" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined">stars</span>
                  <span className="text-label-md">Piezas Raras</span>
                </a>
              </nav>
            </>
          ) : (
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
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-9 space-y-xl">
          
          {activeTab === 'inventory' ? (
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

              {/* Recent Additions Table */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl collector-card-shadow overflow-hidden">
                <div className="p-md border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/50">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Agregados Recientemente</h2>
                  <button 
                    onClick={() => navigate('/catalog')}
                    className="text-primary font-bold text-label-md hover:underline"
                  >
                    Ver Catálogo Completo
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container text-on-surface-variant font-label-md uppercase tracking-wider text-[11px] border-b border-outline-variant/30">
                      <tr>
                        <th className="px-md py-4">Artículo</th>
                        <th className="px-md py-4">Categoría</th>
                        <th className="px-md py-4 text-right">Precio</th>
                        <th className="px-md py-4 text-center">Stock</th>
                        <th className="px-md py-4 text-center">Estado</th>
                        <th className="px-md py-4 text-right">Acción</th>
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
            </>
          ) : (
            /* Orders Section */
            <div className="space-y-md">
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
                                  <div key={item.product.id} className="text-xs text-on-surface-variant flex justify-between gap-4 max-w-[220px]">
                                    <span className="truncate">{item.product.name}</span>
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
