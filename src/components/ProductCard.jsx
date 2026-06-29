import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  
  // Filtrer les variantes invalides
  const validVariants = product.variants?.filter(v => v && v.id || v.sku) || [];
  const [selectedVariant, setSelectedVariant] = useState(validVariants[0] || null);
  
  // Calcul du prix
  const basePrice = parseFloat(product.base_price || 0);
  const displayPrice = selectedVariant?.price_modifier 
    ? basePrice + parseFloat(selectedVariant.price_modifier)
    : basePrice;

  // Pourcentage de réduction
  const compareAtPrice = parseFloat(product.compare_at_price || 0);
  const discountPercentage = compareAtPrice > basePrice 
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100) 
    : 0;

  // Badge nouveau
  const isNew = product.created_at 
    ? (new Date() - new Date(product.created_at)) < 7 * 24 * 60 * 60 * 1000 
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
  const imageUrl = isVideo 
    ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') 
    : (product.image_url || 'https://via.placeholder.com/400');

  return (
    <motion.article 
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.45)] transition-all duration-300 border border-zinc-150/80 dark:border-zinc-800/80 hover:border-brand-blue/35 dark:hover:border-brand-blue/50 cursor-pointer"
    >
      {/* 1. IMAGE AREA - EDGE TO EDGE FOR MAX VISIBILITY */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-950/40 rounded-t-2xl">
        <img 
          src={imageUrl} 
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-[1.04]"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Indisponible'; }}
        />
        
        {/* Floating Badges (Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {(product.is_on_sale || discountPercentage > 0) && (
            <span className="bg-red-500/90 dark:bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              {discountPercentage > 0 ? `-${discountPercentage}%` : 'Promo'}
            </span>
          )}
          {isNew && (
            <span className="bg-brand-blue/90 backdrop-blur-sm text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              Nouveau
            </span>
          )}
        </div>

        {/* Video Overlay on Hover */}
        {isVideo && isHovered && (
          <motion.video
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={product.image_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Out of Stock Overlay */}
        {isGloballyOutOfStock && (
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="text-white font-extrabold tracking-widest text-[9px] border border-white/20 px-3 py-1 rounded-full bg-black/40">
              RUPTURE
            </span>
          </div>
        )}
      </div>

      {/* 2. INFORMATION AREA */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Main Details */}
        <div className="space-y-2">
          {/* Brand & Star Rating */}
          <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            <span>{product.brand || 'Al Karim'}</span>
            <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full text-[9px] font-black shrink-0">
              <Star size={9} fill="currentColor" />
              <span>{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug h-8 sm:h-10 transition-colors duration-200 group-hover:text-brand-blue">
            {product.name}
          </h3>

          {/* Description Snippet */}
          {product.description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1 italic font-light">
              {product.description}
            </p>
          )}

          {/* Trust Element (Warranty Badge) */}
          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-500 font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Garantie Al Karim Vision</span>
          </div>
        </div>

        {/* 3. INTERACTIONS AND PRIMARY ACTION (Variant Selection + Prices + Buttons) */}
        <div>
          {/* Variant Selector (Modern Pills) */}
          {validVariants.length > 1 ? (
            <div className="flex flex-wrap gap-1 mb-3" onClick={e => e.stopPropagation()}>
              {validVariants.map((variant) => {
                const isSelected = selectedVariant?.sku === variant.sku;
                const isOutOfStock = Number(variant.stock_quantity) <= 0;
                return (
                  <button
                    key={variant.id || variant.sku}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider transition-all duration-200 ${
                      isOutOfStock
                        ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-650 line-through cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'bg-brand-blue text-white shadow-sm ring-1 ring-brand-blue font-black'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-brand-blue/30 dark:hover:border-brand-blue/40 hover:text-brand-blue'
                    }`}
                  >
                    {variant.attribute_value}
                  </button>
                );
              })}
            </div>
          ) : validVariants.length === 1 && validVariants[0].attribute_value !== 'Standard' ? (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-2 truncate italic">{validVariants[0].attribute_value}</p>
          ) : (
            <div className="h-[4px]" />
          )}

          {/* Divider and Price + Action Footer (Keurgui Store logic) */}
          <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              {compareAtPrice > basePrice && (
                <span className="text-zinc-400 dark:text-zinc-500 text-[9px] sm:text-[10px] line-through font-medium leading-none mb-0.5">
                  {new Intl.NumberFormat('fr-FR').format(compareAtPrice + (selectedVariant?.price_modifier ? parseFloat(selectedVariant.price_modifier) : 0))} FCFA
                </span>
              )}
              <span className="text-brand-blue font-black text-xs sm:text-base leading-none tracking-tight whitespace-nowrap">
                {new Intl.NumberFormat('fr-FR').format(displayPrice)}
                <span className="text-[8px] sm:text-[10px] ml-0.5 font-bold">FCFA</span>
              </span>
            </div>

            {/* Actions: Add to Cart and WhatsApp side by side */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button 
                disabled={isVariantOutOfStock}
                onClick={handleAddToCart}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.95] ${
                  isVariantOutOfStock
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-transparent'
                    : 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md shadow-brand-blue/10 hover:shadow-brand-blue/20'
                }`}
              >
                {isVariantOutOfStock ? (
                  <>
                    <AlertCircle size={11} />
                    Rupture
                  </>
                ) : (
                  <>
                    <ShoppingCart size={11} />
                    Ajouter
                  </>
                )}
              </button>

              {!isVariantOutOfStock && (
                <a
                  href={`https://wa.me/221774133645?text=Bonjour%20Al%20Karim%20Vision,%20je%20souhaite%20commander%20le%20produit%20*${encodeURIComponent(product.name)}*%20${selectedVariant ? `(Variante%20:%20*${encodeURIComponent(selectedVariant.attribute_value)}*)` : ''}%20au%20prix%20de%20*${encodeURIComponent(new Intl.NumberFormat('fr-FR').format(displayPrice))}%20FCFA*.%20Voici%20le%20lien%20du%20produit%20:%20${encodeURIComponent(window.location.origin + '/product/' + product.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-[1.03] shrink-0 active:scale-[0.95]"
                  title="Commander sur WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.949h.004c4.368 0 7.927-3.558 7.93-7.926a7.9 7.9 0 0 0-2.327-5.607M7.994 14.522a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.69-3.686c-.202-.1-1.198-.591-1.385-.658-.188-.066-.325-.1-.462.1-.137.2-.53.658-.65.79-.12.132-.241.147-.443.048-.201-.1-.85-.313-1.619-.998-.598-.533-1.002-1.192-1.12-1.392-.118-.2-.012-.307.088-.407.09-.09.201-.233.302-.349.102-.117.137-.2.203-.332.066-.133.033-.25-.017-.35-.05-.1-.462-1.114-.633-1.527-.166-.399-.333-.344-.457-.35-.12-.006-.257-.007-.394-.007-.137 0-.361.051-.55.257-.188.2-.719.702-.719 1.71 0 1.009.734 1.986.837 2.12.102.133 1.442 2.202 3.493 3.08.488.209.87.333 1.168.428.49.155.936.133 1.29.08.395-.058 1.198-.49 1.368-.962.17-.473.17-.878.12-.962-.05-.084-.188-.133-.39-.232"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              role="alert"
              aria-live="assertive"
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="fixed bottom-6 right-6 z-[9999] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-brand-blue/20 dark:border-brand-blue/35 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] flex items-center gap-4 cursor-default max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-150 dark:border-zinc-800 bg-zinc-50">
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Miniature'; }}
                />
                <div className="absolute inset-0 bg-emerald-500/5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ajouté au panier !</p>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-0.5">{product.name}</h4>
              </div>

              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <CheckCircle2 size={18} className="animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.article>
  );
};

export default ProductCard;