import React from 'react';
import { Home, Store, ShoppingCart, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

const MobileBottomNav = () => {
  const { cart, toggleCart } = useCartStore();
  const location = useLocation();

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Accueil', path: '/', icon: <Home size={20} /> },
    { name: 'Boutique', path: '/shop', icon: <Store size={20} /> },
    { name: 'À propos', path: '/about', icon: <Info size={20} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-brand-gray-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800/80 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive 
                  ? 'text-brand-blue font-bold' 
                  : 'text-gray-400 dark:text-zinc-550 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase">{item.name}</span>
            </Link>
          );
        })}

        {/* Bouton Panier */}
        <button 
          onClick={toggleCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 dark:text-zinc-550 hover:text-gray-800 dark:hover:text-zinc-200 transition-all relative"
        >
          <div className="relative p-1">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-brand-gray-dark min-w-[16px] h-[16px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase">Panier</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
