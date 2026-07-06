import React, { useState } from 'react';
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
  const [currentUser, setCurrentUser] = useState(null); // Mock user session state
  const [orders, setOrders] = useState([]); // Mock orders state
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product, color = null) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => 
        item.product.id === product.id && item.color?.id === color?.id
      );
      if (existing) {
        return prevItems.map((item) => 
          item.product.id === product.id && item.color?.id === color?.id
            ? { ...item, quantity: item.quantity + 1 } 
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
      prevItems.map((item) =>
        item.product.id === productId && item.color?.id === colorId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId, colorId = null) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => !(item.product.id === productId && item.color?.id === colorId))
    );
  };

  const handlePlaceOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      clientName: currentUser ? currentUser.name : 'Invitado',
      clientEmail: currentUser ? currentUser.email : 'invitado@azotestore.com',
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      pickupLocation: orderData.pickupLocation,
      paymentProofName: orderData.paymentProofName,
      paymentProofPreview: orderData.paymentProofPreview,
      status: 'Pendiente'
    };
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
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
      grade: 'Premium Grade',
      description: productData.description,
      specifications: {
        Stock: productData.stock,
        Category: productData.category,
        Status: parseInt(productData.stock) > 0 ? 'Disponible' : 'Agotado'
      }
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
          <Route path="admin" element={<AdminPage products={productList} onCreateProduct={handleCreateProduct} onUpdateStock={handleUpdateStock} orders={orders} setOrders={setOrders} />} />
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
