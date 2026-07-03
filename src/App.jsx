import React, { Suspense, useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar';
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { useProductStore } from './store/useProductStore';
import ScrollToTop from './components/ScrollToTop';

// Le "Lazy loading" des pages améliore les performances.
const Admin = React.lazy(() => import('./pages/Admin'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Maintenance = React.lazy(() => import('./pages/Maintenance'));
const Shop = React.lazy(() => import('./pages/Shop'));
const About = React.lazy(() => import('./pages/About'));

function App() {
  const { isCartOpen, closeCart } = useCartStore();
  const { user } = useAuthStore();
  const { settings, fetchSettings } = useProductStore();
  const location = useLocation();
  
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isMaintenancePage = location.pathname === '/maintenance';

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const maintenance = settings?.maintenance_mode || false;

  // Si maintenance activée, on redirige tout le monde sauf les admins vers /maintenance
  if (maintenance && !user && !isLoginPage && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-brand-gray-dark transition-colors duration-300 overflow-x-hidden w-full md:pb-0 pb-16">
      <ScrollToTop />
      {!isAdminPage && !isMaintenancePage && <Navbar />}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <main id="main-content" className="flex-grow">
        <Suspense fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 dark:text-white">
            <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Al Karim Vision</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/about" element={<About />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && !isMaintenancePage && <Footer />}
      {!isAdminPage && !isMaintenancePage && <MobileBottomNav />}


    </div>
  );
}

export default App;