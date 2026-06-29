import React, { useState, useEffect } from 'react';
import { ShoppingCart, Moon, Sun, Search, Menu, X, Smartphone, Wind, Coffee, ShieldAlert, LogOut, PackageSearch, Loader2, Laptop, Headphones, HardHat, Store, Glasses, Watch } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProductStore } from '../store/useProductStore';
import { apiFetch } from './api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, toggleCart } = useCartStore();
  const { isAuthenticated, logout, user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const navigate = useNavigate();
  
  // États pour les réglages dynamiques
  const [settings, setSettings] = useState({
    store_name: 'Al Karim Vision',
    maintenance_mode: false
  });

  // Nouveaux états pour le suivi de commande
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  
  // Nouveaux états pour la recherche globale
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // S'assure que les produits et réglages sont disponibles
  useEffect(() => {
    fetchProducts();
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {}
    };
    loadSettings();
  }, [fetchProducts]);

  const searchResults = searchQuery.trim() === ''
    ? []
    : products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fonction d'appel à l'API pour rechercher la commande
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);
    
    try {
      const res = await apiFetch(`/orders/${trackingId}/status`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTrackingResult(data);
      } else {
        setTrackingError(data.message || "Commande introuvable. Veuillez vérifier le numéro.");
      }
    } catch (err) {
      setTrackingError("Une erreur est survenue lors de la recherche.");
    } finally {
      setTrackingLoading(false);
    }
  };

  // Fonction propre pour fermer la modale et réinitialiser son état
  const closeTrackingModal = () => {
    setIsTrackingOpen(false);
    setTrackingResult(null);
    setTrackingId('');
    setTrackingError('');
  };

  // Découpage du nom du site pour le logo
  const storeParts = (settings.store_name || 'Al Karim Vision').toUpperCase().split(' ');
  const mainName = storeParts[0] || 'AL KARIM';
  const subName = storeParts.slice(1).join(' ') || 'VISION';

  // Le clic à l'extérieur est géré par un overlay invisible (voir plus bas)

  return (
    <>
    <div className="h-20 w-full">
      <nav className="fixed top-0 z-50 w-full bg-white/90 dark:bg-brand-gray-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img src="/logo.jpg" alt={settings.store_name} className="h-10 md:h-12 w-auto object-contain rounded-lg" />
            {settings.maintenance_mode && isAuthenticated && (
              <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
                <HardHat size={12} /> MAINTENANCE
              </div>
            )}
          </Link>

          {/* NAVIGATION DESKTOP (Textes Épurés et Professionnels de Grande Entreprise) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
            <Link to="/shop" className="text-xs font-bold tracking-widest text-gray-800 hover:text-brand-blue dark:text-gray-200 dark:hover:text-brand-blue transition-colors uppercase">
              Boutique
            </Link>
            <Link to="/category/glasses" className="text-xs font-bold tracking-widest text-gray-800 hover:text-brand-blue dark:text-gray-200 dark:hover:text-brand-blue transition-colors uppercase">
              Lunettes
            </Link>
            <Link to="/category/perfume" className="text-xs font-bold tracking-widest text-gray-800 hover:text-brand-blue dark:text-gray-200 dark:hover:text-brand-blue transition-colors uppercase">
              Parfums
            </Link>
            <Link to="/category/watches" className="text-xs font-bold tracking-widest text-gray-800 hover:text-brand-blue dark:text-gray-200 dark:hover:text-brand-blue transition-colors uppercase">
              Montres
            </Link>
            <Link to="/category/other" className="text-xs font-bold tracking-widest text-gray-800 hover:text-brand-blue dark:text-gray-200 dark:hover:text-brand-blue transition-colors uppercase">
              Divers
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/admin" className="text-xs font-bold tracking-widest text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue transition-colors uppercase border-l border-gray-200 dark:border-gray-800 pl-4">
                  Admin
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-xs font-bold tracking-widest text-red-500 hover:text-red-600 transition-colors uppercase"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>

          {/* OUTILS ET MENU */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <button onClick={() => setIsTrackingOpen(true)} aria-label="Suivre ma commande" title="Suivre ma commande" className="hidden lg:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
              <PackageSearch aria-hidden="true" size={18} className="sm:w-5 sm:h-5" />
            </button>

            <button onClick={() => setIsSearchOpen(true)} aria-label="Rechercher des produits" className="hidden lg:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
              <Search aria-hidden="true" size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={toggleDarkMode} aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"} className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#1cc6ff]/10 dark:bg-zinc-800 text-brand-blue transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
              {isDarkMode ? <Sun aria-hidden="true" size={20} /> : <Moon aria-hidden="true" size={20} />}
            </button>

            <div className="hidden md:block relative cursor-pointer group" role="button" tabIndex={0} aria-label="Ouvrir le panier" onClick={toggleCart} onKeyDown={(e) => e.key === 'Enter' && toggleCart()}>
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-300 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm border border-transparent dark:border-zinc-700/50">
                <ShoppingCart aria-hidden="true" size={18} className="sm:w-5 sm:h-5" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border-2 border-white dark:border-brand-gray-dark">
                  {itemCount}
                </span>
              )}
            </div>

            {/* Menu Mobile Button */}
            <button id="hamburger-button" className="lg:hidden flex items-center justify-center w-10 h-10 ml-1 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all" aria-expanded={isMenuOpen} aria-label="Menu principal" onClick={(e) => { e.stopPropagation(); setIsMenuOpen((prev) => !prev); }}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
    </div>

      {/* OVERLAY FERMETURE MENU MOBILE (Clic à l'extérieur) */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE MENU (Animé) */}
      {isMenuOpen && (
        <motion.div 
          id="mobile-menu-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed top-[80px] left-0 right-0 w-full bg-white/95 dark:bg-brand-gray-dark/95 backdrop-blur-xl border-b border-brand-blue/20 px-6 py-8 shadow-2xl z-40 max-h-[calc(100vh-80px)] overflow-y-auto"
        >
          {/* OUTILS MOBILES */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8 pb-8 border-b border-gray-150 dark:border-zinc-800">
            <button onClick={() => { setIsTrackingOpen(true); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 hover:text-brand-blue dark:text-gray-400 transition-all">
              <PackageSearch size={22} className="mb-2" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Suivi</span>
            </button>
            <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 hover:text-brand-blue dark:text-gray-400 transition-all">
              <Search size={22} className="mb-2" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Chercher</span>
            </button>
            <button onClick={() => { toggleCart(); setIsMenuOpen(false); }} className="hidden md:flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 hover:text-brand-blue dark:text-gray-400 transition-all relative">
              <ShoppingCart size={22} className="mb-2" />
              {itemCount > 0 && <span className="absolute top-2 right-2 bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>}
              <span className="text-[10px] font-bold tracking-widest uppercase">Panier</span>
            </button>
            <button onClick={toggleDarkMode} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 hover:text-brand-blue dark:text-gray-400 transition-all">
              {isDarkMode ? <Sun size={22} className="mb-2" /> : <Moon size={22} className="mb-2" />}
              <span className="text-[10px] font-bold tracking-widest uppercase">Thème</span>
            </button>
          </div>

          <div className="space-y-2">
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="hidden md:flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-lg font-medium dark:text-white hover:text-brand-blue transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 group-hover:bg-brand-blue/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                <Store size={22} />
              </div>
              <span className="flex-1">Boutique</span>
            </Link>
            <Link to="/category/glasses" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-lg font-medium dark:text-white hover:text-brand-blue transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 group-hover:bg-brand-blue/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                <Glasses size={22} />
              </div>
              <span className="flex-1">Lunettes</span>
            </Link>
            <Link to="/category/perfume" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-lg font-medium dark:text-white hover:text-brand-blue transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 group-hover:bg-brand-blue/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                <Wind size={22} />
              </div>
              <span className="flex-1">Parfums de Luxe</span>
            </Link>
            <Link to="/category/watches" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-lg font-medium dark:text-white hover:text-brand-blue transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 group-hover:bg-brand-blue/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                <Watch size={22} />
              </div>
              <span className="flex-1">Montres de Prestige</span>
            </Link>
            <Link to="/category/other" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-lg font-medium dark:text-white hover:text-brand-blue transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 group-hover:bg-brand-blue/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                <PackageSearch size={22} />
              </div>
              <span className="flex-1">Divers & Accessoires</span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-bold tracking-wide">
                <ShieldAlert size={20} /> Espace Admin
              </Link>
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold tracking-wide"
              >
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* MODALE DE SUIVI DE COMMANDE */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto cursor-pointer" onClick={closeTrackingModal}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()} // Empêche le clic à l'intérieur de la modale de la fermer
            className="bg-white dark:bg-brand-gray-dark w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 cursor-default"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-150 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-sans uppercase tracking-wider dark:text-white flex items-center gap-2">
                <PackageSearch aria-hidden="true" className="text-brand-blue" size={24} />
                Suivre ma commande
              </h3>
              <button onClick={closeTrackingModal} aria-label="Fermer la modale" className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                <X aria-hidden="true" size={24} />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <form onSubmit={handleTrackOrder} className="flex gap-2 mb-6">
                <input 
                  aria-label="Numéro de commande"
                  type="number" 
                  placeholder="Numéro (ex: 142)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 text-base md:text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-colors"
                />
                <button type="submit" disabled={trackingLoading || !trackingId} className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center min-w-[110px] text-xs uppercase tracking-wider">
                  {trackingLoading ? <Loader2 size={18} className="animate-spin" /> : "Chercher"}
                </button>
              </form>

              {trackingError && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50">{trackingError}</p>}

              {trackingResult && (
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-150 dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Commande N°</span>
                    <span className="font-bold dark:text-white text-base">#{trackingResult.id.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Montant Total</span>
                    <span className="font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(trackingResult.total_amount)} FCFA</span>
                  </div>
                  <div className="flex flex-col items-center justify-center mt-6 pt-4 border-t border-gray-150 dark:border-zinc-800">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Statut actuel</span>
                    <span className={`px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-xs shadow-sm ${
                        trackingResult.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-250' : 
                        trackingResult.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-250' : 
                        trackingResult.status === 'shipped' ? 'bg-blue-100 text-blue-700 border border-blue-250' : 
                        trackingResult.status === 'delivered' ? 'bg-green-100 text-green-700 border border-green-250' : 
                        trackingResult.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-250' : 'bg-gray-100 text-gray-700 border border-gray-200'
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

      {/* MODALE DE RECHERCHE GLOBALE */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto cursor-pointer" onClick={() => setIsSearchOpen(false)}>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-brand-gray-dark w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 cursor-default"
          >
            <div className="flex items-center p-4 border-b border-gray-150 dark:border-zinc-800">
              <Search className="text-gray-400 mr-4" size={24} />
              <input
                aria-label="Champ de recherche globale"
                autoFocus
                type="text"
                placeholder="Rechercher un iPhone, un Parfum, un Café..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none dark:text-white text-base md:text-lg font-medium"
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} aria-label="Fermer la recherche" className="text-gray-400 hover:text-brand-blue transition-colors ml-4 p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            {searchQuery.trim() !== '' && (
              <div className="max-h-[60vh] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map(product => {
                      // Si l'URL est une vidéo, on affiche sa miniature (.jpg généré par Cloudinary)
                      const imageUrl = product.image_url?.match(/\.(mp4|mov|webm)$/i) ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') : product.image_url;
                      return (
                        <div
                          key={product.id}
                          onClick={() => { navigate(`/product/${product.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer border-b border-gray-150 dark:border-zinc-800/50 transition-colors"
                        >
                          <img 
                            src={imageUrl || 'https://via.placeholder.com/100'} 
                            alt={product.name} 
                            className="w-14 h-14 object-cover rounded-lg border border-gray-150 dark:border-zinc-800" 
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Indispo'; }}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold dark:text-white text-sm">{product.name}</h4>
                            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">{product.brand}</p>
                          </div>
                          <span className="font-bold text-brand-blue text-sm">
                            {new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                    Aucun produit ne correspond à <span className="font-bold dark:text-white">"{searchQuery}"</span>.
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