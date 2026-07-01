import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const validVariants = product.variants?.filter(v => v && (v.id || v.sku)) || [];
  const [selectedVariant, setSelectedVariant] = useState(validVariants[0] || null);
  
  const basePrice = parseFloat(product.base_price || 0);
  const displayPrice = selectedVariant?.price_modifier 
    ? basePrice + parseFloat(selectedVariant.price_modifier)
    : basePrice;

  const compareAtPrice = parseFloat(product.compare_at_price || 0);
  const discountPercentage = compareAtPrice > basePrice 
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100) 
    : 0;

  const isNew = product.created_at 
    ? (new Date() - new Date(product.created_at)) < 14 * 24 * 60 * 60 * 1000 
    : false;

  const averageRating = parseFloat(product.average_rating || 0);
  const isGloballyOutOfStock = validVariants.length > 0 && validVariants.every(v => Number(v.stock_quantity) <= 0);
  const isVariantOutOfStock = selectedVariant ? Number(selectedVariant.stock_quantity) <= 0 : isGloballyOutOfStock;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isVariantOutOfStock) return;
    addToCart(product, selectedVariant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isVideo = product.image_url?.match(/\.(mp4|mov|webm)$/i);
  const rawImageUrl = isVideo 
    ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') 
    : (product.image_url || 'https://via.placeholder.com/400');
  const imageUrl = getOptimizedImageUrl(rawImageUrl, { width: 500 });

  return (
    <motion.article 
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-brand-blue/40 transition-all duration-300 h-full cursor-pointer"
    >
      {/* 1. IMAGE AREA — EDGE TO EDGE */}
      <div className="relative aspect-square bg-slate-50 dark:bg-zinc-950 w-full flex items-center justify-center overflow-hidden group-hover:bg-slate-100/50 dark:group-hover:bg-zinc-900 transition-colors">
        
        {/* Clickable image */}
        <div className={`block w-full h-full ${isGloballyOutOfStock ? 'opacity-50 grayscale' : ''}`}>
          {isVideo && isHovered ? (
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={product.image_url}
              autoPlay loop muted playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <img 
              src={imageUrl} 
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Indisponible'; }}
            />
          )}
        </div>

        {/* Badges — Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isGloballyOutOfStock ? (
            <div className="bg-slate-900 dark:bg-zinc-700 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Épuisé
            </div>
          ) : (
            <>
              {discountPercentage > 0 && (
                <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  -{discountPercentage}%
                </div>
              )}
              {product.is_on_sale && discountPercentage === 0 && (
                <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Promo
                </div>
              )}
              {isNew && (
                <div className="bg-brand-blue text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  New
                </div>
              )}
            </>
          )}
        </div>


      </div>

      {/* 2. INFORMATION AREA */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 text-center">
        {/* Brand & Rating */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {product.brand || product.category || 'Al Karim Vision'}
          </p>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-zinc-400">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-slate-900 dark:text-zinc-50 font-bold text-[11px] sm:text-sm line-clamp-2 leading-snug group-hover:text-brand-blue dark:group-hover:text-brand-blue-accent transition-colors mb-2 flex-1 text-center">
          {product.name}
        </h3>

        {/* Variant Pills */}
        {validVariants.length > 1 && (
          <div className="flex flex-wrap justify-center gap-1 mb-2.5" onClick={e => e.stopPropagation()}>
            {validVariants.map((variant) => {
              const isSelected = selectedVariant?.sku === variant.sku;
              const isOutOfStock = Number(variant.stock_quantity) <= 0;
              return (
                <button
                  key={variant.id || variant.sku}
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-1.5 py-0.5 text-[8px] font-bold rounded-md uppercase tracking-tight border transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-slate-50 dark:bg-zinc-800/50 text-slate-300 dark:text-zinc-600 border-slate-100 dark:border-zinc-800 line-through cursor-not-allowed opacity-50'
                      : isSelected
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-250 dark:border-zinc-800 hover:border-brand-blue/45'
                  }`}
                >
                  {variant.attribute_value}
                </button>
              );
            })}
          </div>
        )}

        {/* Price & Action Container */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex flex-col items-center gap-2.5 w-full">
          {/* Price */}
          <div className="flex flex-col items-center text-center">
            {compareAtPrice > basePrice && (
              <span className="text-slate-400 dark:text-zinc-500 text-[9px] sm:text-[10px] line-through font-medium leading-none mb-1">
                {compareAtPrice.toLocaleString('fr-SN')} FCFA
              </span>
            )}
            <span className="text-brand-blue font-black text-xs sm:text-base leading-none tracking-tight">
              {displayPrice.toLocaleString('fr-SN')}{' '}
              <span className="text-[8px] sm:text-[10px] text-brand-blue/70 font-bold">FCFA</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
            {!isVariantOutOfStock ? (
              <>
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-brand-blue/20 flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={10} strokeWidth={2.5} />
                  Ajouter
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/221765662711?text=Bonjour%20Al%20Karim%20Vision,%20je%20souhaite%20commander%20le%20produit%20*${encodeURIComponent(product.name)}*%20${selectedVariant ? `(Variante%20:%20*${encodeURIComponent(selectedVariant.attribute_value)}*)` : ''}%20au%20prix%20de%20*${encodeURIComponent(new Intl.NumberFormat('fr-FR').format(displayPrice))}%20FCFA*.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-md shadow-emerald-500/20"
                  title="Commander sur WhatsApp"
                >
                  <img src="/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain" />
                  WhatsApp
                </a>
              </>
            ) : (
              <span className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider py-1.5">
                <AlertCircle size={11} />
                Épuisé
              </span>
            )}
          </div>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              role="alert"
              aria-live="assertive"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-[9999] bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageUrl}
                alt={product.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-zinc-800 shrink-0"
                onError={(e) => { e.target.src = 'https://placehold.co/80x80/png?text=?'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ajouté !</p>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">{product.name}</h4>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.article>
  );
};

export default ProductCard;