import React from 'react';
import { Home, Store, ShoppingBasket } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

const MobileBottomNav = () => {
  const { cart, toggleCart } = useCartStore();
  const location = useLocation();

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Accueil', path: '/', icon: <Home size={22} /> },
    { name: 'Boutique', path: '/shop', icon: <Store size={22} /> }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-brand-gray-dark/90 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 pb-safe">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-brand-blue' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {item.icon}
              <span className="text-[10px] font-bold tracking-widest uppercase">{item.name}</span>
            </Link>
          );
        })}

        {/* Bouton Panier */}
        <button 
          onClick={toggleCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
        >
          <div className="relative">
            <ShoppingBasket size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-brand-gray-dark">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase">Panier</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
