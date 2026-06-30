import React, { useState, useEffect } from 'react';
import { ShoppingCart, Moon, Sun, Search, Menu, X, HardHat, ShieldAlert, LogOut, PackageSearch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProductStore } from '../store/useProductStore';
import { apiFetch } from './api';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const NAV_LINKS = [
  { label: 'Accueil',  to: '/' },
  { label: 'Boutique', to: '/shop' },
  { label: 'À propos', to: '/about' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, toggleCart } = useCartStore();
  const { isAuthenticated, logout } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [settings, setSettings] = useState({ store_name: 'Al Karim Vision', maintenance_mode: false });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    fetchProducts();
    apiFetch('/settings').then(r => r.ok && r.json()).then(d => d && setSettings(d)).catch(() => {});
  }, [fetchProducts]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Écouteur global pour ouvrir la recherche depuis le bas
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, []);

  const searchResults = searchQuery.trim() === ''
    ? []
    : products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);
    try {
      const res = await apiFetch(`/orders/track?id=${trackingId}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingResult(data);
      } else {
        setTrackingError('Commande introuvable ou mauvais numéro.');
      }
    } catch (err) {
      setTrackingError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const closeTracking = () => {
    setIsTrackingOpen(false);
    setTrackingId('');
    setTrackingResult(null);
    setTrackingError('');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="h-20 w-full">
        <nav className="fixed top-0 z-50 w-full bg-white/90 dark:bg-brand-gray-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* LOGO */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                <img 
                  src={getOptimizedImageUrl(isDarkMode ? '/Al Karim Logo Nuit.png' : '/Al Karim Logo Jour.png')} 
                  alt={settings.store_name} 
                  className="h-10 md:h-12 w-auto object-contain rounded-lg" 
                />
                {settings.maintenance_mode && isAuthenticated && (
                  <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
                     <HardHat size={12} /> MAINTENANCE
                  </div>
                )}
              </Link>

              {/* NAV DESKTOP */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
                {NAV_LINKS.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-xs font-bold tracking-widest uppercase transition-colors ${
                      isActive(to)
                        ? 'text-brand-blue border-b-2 border-brand-blue pb-0.5'
                        : 'text-gray-800 dark:text-gray-200 hover:text-brand-blue dark:hover:text-brand-blue'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Link to="/admin" className="text-xs font-bold tracking-widest text-brand-blue hover:text-brand-blue-dark transition-colors uppercase border-l border-gray-200 dark:border-gray-800 pl-4">
                      Admin
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-xs font-bold tracking-widest text-red-500 hover:text-red-600 transition-colors uppercase">
                      Déconnexion
                    </button>
                  </>
                )}
              </div>

              {/* ICÔNES DROITE */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Suivi commande */}
                <button onClick={() => setIsTrackingOpen(true)} aria-label="Suivre ma commande" className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  <PackageSearch size={18} />
                </button>
                {/* Recherche */}
                <button onClick={() => setIsSearchOpen(true)} aria-label="Rechercher" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  <Search size={18} />
                </button>
                {/* Mode sombre */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Changer le thème" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue/10 dark:bg-zinc-800 text-brand-blue transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {/* Panier (Masqué sur mobile car présent en BottomNav) */}
                <div className="relative cursor-pointer group hidden md:block" onClick={toggleCart}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                    <ShoppingCart size={18} />
                  </div>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border-2 border-white dark:border-brand-gray-dark">
                      {itemCount}
                    </span>
                  )}
                </div>
                {/* Hamburger mobile */}
                <button className="lg:hidden flex items-center justify-center w-10 h-10 ml-1 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all" onClick={() => setIsMenuOpen(p => !p)} aria-label="Menu">
                  {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* OVERLAY MOBILE */}
      {isMenuOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)} />}

      {/* MENU MOBILE (Uniquement Suivi Commande et Mode Sombre/Clair) */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed top-[80px] left-0 right-0 w-full bg-white/95 dark:bg-brand-gray-dark/95 backdrop-blur-xl border-b border-brand-blue/20 px-6 py-6 shadow-2xl z-40"
        >
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setIsTrackingOpen(true); setIsMenuOpen(false); }} 
              className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 rounded-xl hover:text-brand-blue transition-colors border border-gray-100 dark:border-zinc-850 shadow-sm"
            >
              <PackageSearch size={20} className="text-brand-blue" />
              <span className="text-xs font-bold uppercase tracking-wider">Suivi Commande</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 rounded-xl hover:text-brand-blue transition-colors border border-gray-100 dark:border-zinc-850 shadow-sm"
            >
              {isDarkMode ? <Sun size={20} className="text-brand-blue" /> : <Moon size={20} className="text-brand-blue" />}
              <span className="text-xs font-bold uppercase tracking-wider">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* MODALE SUIVI COMMANDE */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm" onClick={closeTracking}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-brand-gray-dark w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-base uppercase tracking-wider dark:text-white flex items-center gap-2">
                <PackageSearch className="text-brand-blue" size={20} /> Suivre ma commande
              </h3>
              <button onClick={closeTracking} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"><X size={22} /></button>
            </div>
            <div className="p-5">
              <form onSubmit={handleTrackOrder} className="flex gap-2 mb-4">
                <input type="number" placeholder="Numéro de commande (ex: 142)" value={trackingId} onChange={e => setTrackingId(e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white text-sm" />
                <button type="submit" disabled={trackingLoading || !trackingId} className="px-5 py-2.5 bg-brand-blue text-white font-bold rounded-lg hover:bg-brand-blue-dark disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider min-w-[90px] justify-center">
                  {trackingLoading ? <Loader2 size={16} className="animate-spin" /> : 'Chercher'}
                </button>
              </form>
              {trackingError && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{trackingError}</p>}
              {trackingResult && (
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <div className="flex justify-between mb-3"><span className="text-gray-400 text-xs font-bold uppercase">Commande N°</span><span className="font-bold dark:text-white">#{trackingResult.id.toString().padStart(4,'0')}</span></div>
                  <div className="flex justify-between mb-3"><span className="text-gray-400 text-xs font-bold uppercase">Total</span><span className="font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(trackingResult.total_amount)} FCFA</span></div>
                  <div className="flex justify-center mt-4">
                    <span className={`px-5 py-2 rounded-lg font-bold uppercase tracking-widest text-xs ${
                      trackingResult.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      trackingResult.status === 'paid' ? 'bg-green-100 text-green-700' :
                      trackingResult.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      trackingResult.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      trackingResult.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trackingResult.status === 'pending' ? '⏳ EN ATTENTE' : trackingResult.status === 'paid' ? '💳 PAYÉE' : trackingResult.status === 'shipped' ? '📦 EXPÉDIÉE' : trackingResult.status === 'delivered' ? '✅ LIVRÉE' : trackingResult.status === 'cancelled' ? '❌ ANNULÉE' : trackingResult.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* MODALE RECHERCHE */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-brand-gray-dark w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800">
            <div className="flex items-center p-4 border-b border-gray-100 dark:border-zinc-800">
              <Search className="text-gray-400 mr-3" size={22} />
              <input autoFocus type="text" placeholder="Rechercher des lunettes, des parfums, des montres..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none focus:outline-none dark:text-white text-base font-medium" />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-gray-400 hover:text-brand-blue transition-colors ml-3 p-1.5 bg-gray-50 dark:bg-zinc-900 rounded-lg"><X size={18} /></button>
            </div>
            {searchQuery.trim() !== '' && (
              <div className="max-h-[55vh] overflow-y-auto">
                {searchResults.length > 0 ? searchResults.map(product => {
                  const img = product.image_url?.match(/\.(mp4|mov|webm)$/i) ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') : product.image_url;
                  return (
                    <div key={product.id} onClick={() => { navigate(`/product/${product.id}`); setIsSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer border-b border-gray-100 dark:border-zinc-800/50 transition-colors">
                      <img src={img || 'https://placehold.co/80x80/png?text=?'} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-150 dark:border-zinc-800" onError={e => { e.target.src='https://placehold.co/80x80/png?text=?'; }} />
                      <div className="flex-1">
                        <h4 className="font-bold dark:text-white text-sm">{product.name}</h4>
                        <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">{product.brand}</p>
                      </div>
                      <span className="font-bold text-brand-blue text-sm">{new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA</span>
                    </div>
                  );
                }) : (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                    Aucun résultat pour <span className="font-bold dark:text-white">"{searchQuery}"</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;