import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./components/home/Home";
import Product from "./components/product/Product";
import ProductDetail from "./components/product/ProductDetail";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Cart from "./components/cart/Cart";
import Checkout from "./components/cart/checkout/Checkout";
import Contact from "./components/contact/Contact";
import ForgotPassword from "./components/forgotpassword/ForgotPassword";
import Logout from "./components/logout/Logout";
import CategoryProducts from './components/product/CategoryProducts';
import ProductList from './components/product/ProductList';
import UserProfile from './components/user/UserProfile';
import Orders from './components/order/Orders';
import PaymentSuccess from './components/payment/PaymentSuccess';
import Admin from './components/admin/Admin';
import AdminLogin from './components/admin/login/AdminLogin';
import OrderDetail from './components/order/OrderDetail';
import "./App.scss";
import { isTokenExpiringSoon, refreshToken, setupAutoRefresh } from './utils/authFetch'; // Đường dẫn tùy theo bạn đặt ở đâu



function App() {
  const [tokenStatus, setTokenStatus] = useState('initializing');
  // Check if current route is admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Initialize token refresh when App mounts
  useEffect(() => {
    console.log('[APP] Component mounted, ensuring token refresh is running');
    
    // Check if we have an access token
    const hasToken = localStorage.getItem('accessToken');
    if (hasToken) {
      setTokenStatus('active');
    } else {
      setTokenStatus('no-token');
    }
    
    // Set up token refresh
    const cleanup = setupAutoRefresh();
    
    // Setup debug helper on window
    window.checkTokenRefresh = () => {
      console.log('[APP] Manual token check triggered');
      if (window.forceTokenRefresh) {
        window.forceTokenRefresh()
          .then(() => {
            console.log('[APP] Force refresh successful');
            setTokenStatus('refreshed-' + new Date().toISOString().substring(11, 19));
          })
          .catch(err => {
            console.error('[APP] Force refresh failed', err);
            setTokenStatus('refresh-failed');
          });
      } else {
        console.log('[APP] forceTokenRefresh not available');
        setTokenStatus('refresh-unavailable');
      }
    };
    
    return () => {
      if (cleanup) cleanup();
      delete window.checkTokenRefresh;
    };
  }, []);


  return (
    <div className="app">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/google" element={<Login />} />
          <Route path="/login/facebook" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
