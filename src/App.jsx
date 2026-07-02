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

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
    setIsCartOpen(true); // Open cart automatically when adding item
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
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
              onOpenCart={() => setIsCartOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
            />
          }
        >
          <Route index element={<LandingPage />} />
          <Route path="catalog" element={<ProductCatalog />} />
          <Route 
            path="product/:id" 
            element={
              <ProductDetail 
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                wishlistItems={wishlistItems}
              />
            } 
          />
        </Route>
      </Routes>

      {/* Slide-over Drawers */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
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
