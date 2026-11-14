import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import GoogleCallback from './pages/GoogleCallback';   // ADDED: Google login
import ManageProducts from './pages/ManageProducts';

import './styles/App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />

                  <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
                  <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                  <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

                  <Route path="/manage" element={<RequireAdmin><ManageProducts /></RequireAdmin>} />

                  <Route path="*" element={<div className="container-fluid px-4 py-5 text-center"><h2>404 — Page not found</h2></div>} />
                </Routes>
              </main>
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

