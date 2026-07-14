import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Drawers
import Layout from './components/Layout';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';

// Pages
import LandingPage from './pages/LandingPage';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

// Initial Data
import { products as initialProducts } from './data/products';

export default function App() {
  const [productList, setProductList] = useState(initialProducts); // Dynamic products state
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('azote_user_session');
    return saved ? JSON.parse(saved) : null;
  }); // Persistent user session state
  const [orders, setOrders] = useState([]); // Mock orders state

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Revalidate stored session against Supabase on mount to keep role in sync
  useEffect(() => {
    if (!currentUser?.id) return;
    (async () => {
      try {
        const { supabase } = await import('./supabaseClient');
        const { data: freshUser, error } = await supabase
          .from('users')
          .select('id, name, email, phone, role')
          .eq('id', currentUser.id)
          .single();

        if (error || !freshUser) {
          // User no longer exists in DB – clear session
          setCurrentUser(null);
          localStorage.removeItem('azote_user_session');
          return;
        }

        // Update session with latest data from DB
        const updatedUser = {
          id: freshUser.id,
          name: freshUser.name,
          email: freshUser.email,
          phone: freshUser.phone,
          role: freshUser.role || 'cliente'
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('azote_user_session', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error revalidating user session:', err);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cart operations
  const handleAddToCart = (product, color = null) => {
    // Get max available stock
    const maxStock = color ? (color.stock !== undefined ? color.stock : 20) : (product.specifications?.Stock ? parseInt(product.specifications.Stock) : 20);

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) =>
        item.product.id === product.id && item.color?.id === color?.id
      );
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.color?.id === color?.id
            ? { ...item, quantity: Math.min(maxStock, item.quantity + 1) }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1, color }];
    });
    setIsCartOpen(true); // Open cart automatically when adding item
  };

  const handleUpdateCartQuantity = (productId, newQty, colorId = null) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId, colorId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const itemColorId = item.color?.id || null;
        const targetColorId = colorId || null;
        if (item.product.id === productId && itemColorId === targetColorId) {
          const maxStock = item.color ? (item.color.stock !== undefined ? item.color.stock : 20) : (item.product.specifications?.Stock ? parseInt(item.product.specifications.Stock) : 20);
          return { ...item, quantity: Math.min(maxStock, newQty) };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId, colorId = null) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemColorId = item.color?.id || null;
        const targetColorId = colorId || null;
        return !(item.product.id === productId && itemColorId === targetColorId);
      })
    );
  };

  const handlePlaceOrder = (orderData) => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      clientName: currentUser ? currentUser.name : 'Invitado',
      clientEmail: currentUser ? currentUser.email : 'invitado@azotestore.com',
      items: [...cartItems],
      total: totalAmount,
      pickupLocation: orderData.pickupLocation,
      paymentProofName: orderData.paymentProofName,
      paymentProofPreview: orderData.paymentProofPreview,
      status: 'Realizado'
    };

    // Save to Supabase and discount stock asynchronously
    (async () => {
      try {
        const { supabase } = await import('./supabaseClient');

        // 1. Insert order
        const { error: orderError } = await supabase
          .from('orders')
          .insert([{
            id: newOrder.id,
            user_id: currentUser ? currentUser.id : null,
            client_name: newOrder.clientName,
            client_email: newOrder.clientEmail,
            total: newOrder.total,
            pickup_location: newOrder.pickupLocation,
            payment_proof_name: newOrder.paymentProofName,
            payment_proof_preview: newOrder.paymentProofPreview,
            status: 'Realizado'
          }]);

        if (orderError) throw orderError;

        // 2. Insert order items and discount stock
        for (const item of cartItems) {
          const { error: itemError } = await supabase
            .from('order_items')
            .insert([{
              order_id: newOrder.id,
              product_id: String(item.product.id),
              product_name: item.product.name,
              color_id: item.color ? String(item.color.id) : null,
              color_name: item.color ? item.color.name : null,
              quantity: item.quantity,
              price: item.product.price
            }]);

          if (itemError) throw itemError;

          // Discount stock
          if (item.color) {
            // Discount variant stock
            const { data: variantData, error: varGetErr } = await supabase
              .from('product_variants')
              .select('stock, product_id')
              .eq('id', item.color.id)
              .single();

            if (!varGetErr && variantData) {
              const newVarStock = Math.max(0, (variantData.stock || 0) - item.quantity);
              await supabase
                .from('product_variants')
                .update({ stock: newVarStock })
                .eq('id', item.color.id);

              // Update base product total stock
              const { data: variantsList } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('product_id', variantData.product_id);

              if (variantsList) {
                const totalStock = variantsList.reduce((sum, v) => sum + (v.stock || 0), 0);
                await supabase
                  .from('products')
                  .update({ stock: totalStock })
                  .eq('id', variantData.product_id);
              }
            }
          } else {
            // Discount standard product stock
            const { data: prodData, error: prodGetErr } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product.id)
              .single();

            if (!prodGetErr && prodData) {
              const newProdStock = Math.max(0, (prodData.stock || 0) - item.quantity);
              await supabase
                .from('products')
                .update({ stock: newProdStock })
                .eq('id', item.product.id);
            }
          }
        }

      } catch (err) {
        console.error('Error saving order/discounting stock in Supabase:', err);
      }
    })();

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    return newOrder;
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist operations
  const handleAddToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) {
        return prevItems.filter((item) => item.id !== product.id);
      }
      return [...prevItems, product];
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Authentication operations
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('azote_user_session', JSON.stringify(user));
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    localStorage.setItem('azote_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('azote_user_session');
  };

  // Admin inventory operations
  const handleCreateProduct = (productData) => {
    const slug = productData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const imageMap = {
      'Yu-Gi-Oh': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAct3FZrbUkLdhtf_kIuFVe-SsAjjQF2TyHl0Z9heIFgJClU0DGBHnMVFINYeaIbb_B0JRF69Sf1JPn8BG-uHXAyrlcoB2V32G7XQIMQwGpPJoq1KYszZ43O2-ZjnU6cI4kdMetqGyPByPmC1-kXaSJiaT2O5mRMHIODP6v1AYNYIKqEUi2EMAqI4W5wOpZBtf1zrT0vVnkridLk8r2pPDmH9LgyMNCINBwKZACGdTxJeYhduMlOWoVRA',
      'Pokemon': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg74pfKIt2CvGPah78qzcEaybynQnf6wBwGQvhiMGjRdR484TlEvkm4wud7o8-87mxZkwbK_3XDik1VTKNTKqyBnuWMuQ3dS9mpm7Oj9oy8mlp0-_7kEpyrUjKbPOw6udpxFjr7W8aglp3Wu9TVU9uQVJlybu_5NElRWZbCUBmwaoSvD3igqlXvddRvkxlnwa5B7SOorhDAxf71omLV2dXus3Z2yWDtet0r9KG837jAG0RtuyA3KSSVg',
      'Magic': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnp2ZYe1od9ao4mo189r2IwJr4bdJbg123xgjyg6_WC8XxWSUItsmYjGGRRZBzCyCGLZ9MSYRidQGAYoU_9mKvyQFg1CTYvmfOsTPac31EKyl2cO2ld3pEUUGVxPbEnj8rE3yTcwTegzEFP8Z8pjWrFNS5yP5G39M1UeMCcArcEgmf07Pw21aWhOWJPpu6-XN2rDy7GWEVDCjT4RDpW3McfizB1pymdFamluA5DLA9dNgKVItFHjLMOQ',
      'Board Games': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgCcj_1Jfe_rPfvZcnrHUnMZh0YeCjAJG7aFnucCn7qZOflrh3ys9MlyBzgWe3Y4RWk6CWdLM5Q3UsZ5zoUfwu5Bd3TZroaQIJIDhNBOnIy0vfuGveg6VKZG0pfaiwE5_fKsUcJWfOpQ6n59mauilTf26koWooTSYI_eGOa_dIUGLNEQFwnEFRK-HyhXroVsKB_4gzYhS2Z6il_0ijDrpINQ3-HIQTlildJxLuO__ohjcLtYY1WnFHLg'
    };

    const newProduct = {
      id: slug,
      name: productData.name,
      subtitle: `${productData.category} Collectible Item`,
      price: parseFloat(productData.price),
      originalPrice: null,
      image: productData.image || imageMap[productData.category] || imageMap['Board Games'],
      gallery: [productData.image || imageMap[productData.category] || imageMap['Board Games']],
      category: productData.category,
      categorySlug: productData.category.toLowerCase().replace(/\s+/g, '-'),
      inStock: parseInt(productData.stock) > 0,
      // grade: 'Premium Grade',
      description: productData.description,
      specifications: {
        Stock: productData.stock,
        Category: productData.category,
        Status: parseInt(productData.stock) > 0 ? 'Disponible' : 'Agotado'
      },
      // Attach color/variant array if the product was created with multiple types
      ...(productData.variants && productData.variants.length > 0 && {
        colors: productData.variants.map(v => ({
          id: v.id,
          name: v.name,
          hex: '#888888',
          image: v.image,
          stock: v.stock,
          inStock: v.inStock,
          price: v.price,
        }))
      })
    };

    setProductList((prevList) => [newProduct, ...prevList]);
  };

  const handleUpdateStock = (productId, amountToAdd, colorId = null) => {
    setProductList((prevList) =>
      prevList.map((p) => {
        if (p.id === productId) {
          if (colorId && p.colors) {
            const updatedColors = p.colors.map((c) => {
              if (c.id === colorId) {
                const currentStock = c.stock !== undefined ? c.stock : (c.inStock ? 20 : 0);
                const newStock = Math.max(0, currentStock + amountToAdd);
                return { ...c, stock: newStock, inStock: newStock > 0 };
              }
              return c;
            });
            return {
              ...p,
              colors: updatedColors,
              inStock: updatedColors.some((c) => c.inStock)
            };
          } else {
            const currentStock = p.specifications?.Stock ? parseInt(p.specifications.Stock) : (p.inStock ? 20 : 0);
            const newStock = Math.max(0, currentStock + amountToAdd);
            return {
              ...p,
              inStock: newStock > 0,
              specifications: {
                ...p.specifications,
                Stock: String(newStock)
              }
            };
          }
        }
        return p;
      })
    );
  };

  // Calculate total items in cart
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <BrowserRouter>
      {/* Page Routing within persistent layout */}
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              cartCount={cartCount}
              wishlistCount={wishlistItems.length}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
            />
          }
        >
          <Route index element={<LandingPage products={productList} />} />
          <Route path="catalog" element={<ProductCatalog products={productList} />} />
          <Route
            path="product/:id"
            element={
              <ProductDetail
                products={productList}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                wishlistItems={wishlistItems}
              />
            }
          />
          <Route path="login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="register" element={<RegisterPage onRegister={handleRegister} />} />
          <Route path="admin" element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminPage products={productList} onCreateProduct={handleCreateProduct} onUpdateStock={handleUpdateStock} orders={orders} setOrders={setOrders} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="material-symbols-outlined text-[4rem] text-error">lock</span>
                <h2 className="text-xl font-bold text-on-background">Acceso Restringido</h2>
                <p className="text-sm text-on-surface-variant">No tienes permisos para ver esta sección.</p>
                <a href="/" className="bg-primary text-on-primary px-6 py-2 rounded-full text-xs font-bold">Volver al Inicio</a>
              </div>
            )
          } />
        </Route>
      </Routes>

      {/* Slide-over Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onPlaceOrder={handlePlaceOrder}
        onClearCart={handleClearCart}
        currentUser={currentUser}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
      />
    </BrowserRouter>
  );
}
