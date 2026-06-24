import React, { Suspense, useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar';
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { apiFetch } from './components/api';

// Le "Lazy loading" des pages améliore les performances.
const Admin = React.lazy(() => import('./pages/Admin'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Maintenance = React.lazy(() => import('./pages/Maintenance'));
const Shop = React.lazy(() => import('./pages/Shop'));

function App() {
  const { isCartOpen, closeCart } = useCartStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('221774133645');
  
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isMaintenancePage = location.pathname === '/maintenance';

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await apiFetch('/settings');
        if (res.ok) {
          const data = await res.json();
          setMaintenance(data.maintenance_mode);
          if (data.whatsapp_number) {
            setWhatsappNumber(data.whatsapp_number);
          }
        }
      } catch (err) {}
    };
    checkMaintenance();
  }, [location.pathname]);

  // Si maintenance activée, on redirige tout le monde sauf les admins vers /maintenance
  if (maintenance && !user && !isLoginPage && !isMaintenancePage) {
    return <Navigate to="/maintenance" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-brand-gray-dark transition-colors duration-300 overflow-x-hidden w-full md:pb-0 pb-16">
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
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && !isMaintenancePage && <Footer />}
      {!isAdminPage && !isMaintenancePage && <MobileBottomNav />}

      {/* Bouton WhatsApp Flottant Persistant */}
      {!isAdminPage && !isMaintenancePage && (
        <a 
          href={`https://wa.me/${whatsappNumber}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 flex items-center justify-center animate-bounce"
          aria-label="Discuter sur WhatsApp"
        >
          <svg className="w-7 h-7 fill-white" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </a>
      )}
    </div>
  );
}

export default App;