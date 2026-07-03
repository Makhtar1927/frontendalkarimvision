import React, { useState, useEffect } from 'react';
import { ShoppingCart, Moon, Sun, Search, X, HardHat, LogOut, PackageSearch, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { cart, toggleCart } = useCartStore();
  const { isAuthenticated, logout } = useAuthStore();
  const { products, fetchProducts, settings: storeSettings, fetchSettings } = useProductStore();
  const navigate = useNavigate();
  const location = useLocation();

  const settings = storeSettings || { store_name: 'Al Karim Vision', maintenance_mode: false };
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
    fetchSettings();
  }, [fetchProducts, fetchSettings]);

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
      const res = await apiFetch(`/orders/${trackingId}/status`);
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
            <div className="flex justify-between items-center h-20 gap-2 sm:gap-4">

              {/* LOGO */}
              <Link to="/" className="shrink-0 flex items-center">
                <img 
                  src={getOptimizedImageUrl(isDarkMode ? '/Al Karim Logo Nuit.png' : '/Al Karim Logo Jour.png')} 
                  alt={settings.store_name} 
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded-lg" 
                />
                {settings.maintenance_mode && isAuthenticated && (
                  <div className="hidden sm:flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200 ml-2">
                     <HardHat size={12} /> MAINTENANCE
                  </div>
                )}
              </Link>

              {/* ZONE DE RECHERCHE MOBILE (ALIGNÉE À CÔTÉ DU LOGO) */}
              <div className="lg:hidden flex-1 max-w-[150px] xs:max-w-[200px] sm:max-w-md mx-1 sm:mx-4 relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white" 
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-650"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Dropdown de résultats rapides sur mobile */}
                <AnimatePresence>
                  {searchQuery.trim() !== '' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 bg-white dark:bg-brand-gray-dark border border-gray-150 dark:border-zinc-800 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-50 w-[180px] xs:w-[220px] sm:w-[320px]"
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map(product => {
                          const img = product.image_url?.match(/\.(mp4|mov|webm)$/i) ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') : product.image_url;
                          return (
                            <div 
                              key={product.id} 
                              onClick={() => { navigate(`/product/${product.id}`); setSearchQuery(''); }}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer border-b border-gray-100 dark:border-zinc-800 last:border-b-0 transition-colors"
                            >
                              <img src={img || 'https://placehold.co/35x35/png?text=?'} alt={product.name} className="w-8 h-8 object-cover rounded-lg border border-gray-150 dark:border-zinc-850" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold dark:text-white text-[10px] sm:text-xs truncate">{product.name}</h4>
                                <p className="text-[8px] text-brand-blue font-bold uppercase tracking-wider">{product.brand}</p>
                              </div>
                              <span className="font-bold text-brand-blue text-[10px] sm:text-xs whitespace-nowrap">{new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                          Aucun résultat pour "{searchQuery}"
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
              <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
                {/* Suivi commande */}
                <button onClick={() => setIsTrackingOpen(true)} aria-label="Suivre ma commande" className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  <PackageSearch size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                {/* Recherche (Uniquement Desktop car zone de texte mobile) */}
                <button onClick={() => setIsSearchOpen(true)} aria-label="Rechercher" className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  <Search size={18} />
                </button>
                {/* Mode sombre */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Changer le thème" className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-blue/10 dark:bg-zinc-800 text-brand-blue transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                  {isDarkMode ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
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
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* MODALE SUIVI COMMANDE */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeTracking}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            onClick={e => e.stopPropagation()} 
            className="bg-white dark:bg-brand-gray-dark w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider dark:text-white flex items-center gap-2">
                <PackageSearch className="text-brand-blue shrink-0" size={20} /> 
                <span className="truncate">Suivre ma commande</span>
              </h3>
              <button onClick={closeTracking} className="text-gray-400 hover:text-gray-750 dark:hover:text-white transition-colors ml-2"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-5">
              <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input 
                  type="number" 
                  placeholder="N° de commande (ex: 142)" 
                  value={trackingId} 
                  onChange={e => setTrackingId(e.target.value)} 
                  className="w-full sm:flex-1 px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white text-sm" 
                />
                <button 
                  type="submit" 
                  disabled={trackingLoading || !trackingId} 
                  className="w-full sm:w-auto px-5 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-brand-blue-dark disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider justify-center shrink-0"
                >
                  {trackingLoading ? <Loader2 size={14} className="animate-spin" /> : 'Chercher'}
                </button>
              </form>
              
              {trackingError && (
                <p className="text-red-500 text-xs sm:text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {trackingError}
                </p>
              )}
              
              {trackingResult && (
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 sm:p-4 rounded-lg border border-gray-205 dark:border-zinc-800">
                  <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px] sm:text-xs">Commande N°</span>
                    <span className="font-bold dark:text-white">#{trackingResult.id.toString().padStart(4,'0')}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px] sm:text-xs">Total</span>
                    <span className="font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(trackingResult.total_amount)} FCFA</span>
                  </div>
                  <div className="flex justify-center mt-4">
                    <span className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] sm:text-xs ${
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

      {/* MODALE RECHERCHE (DESKTOP) */}
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