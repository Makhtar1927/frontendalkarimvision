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
  const validVariants = product.variants?.filter(v => v && v.id) || [];
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
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white dark:bg-zinc-900/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 border border-zinc-150 dark:border-zinc-800/80 cursor-pointer"
    >
      {/* IMAGE CONTAINER (Carré parfait) */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-950/40">
        <img 
          src={imageUrl} 
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-[1.03]"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Indisponible'; }}
        />
        
        {/* BADGES */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {(product.is_on_sale || discountPercentage > 0) && (
            <span className="bg-red-500/90 dark:bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              {discountPercentage > 0 ? `-${discountPercentage}%` : 'Promo'}
            </span>
          )}
          {isNew && (
            <span className="bg-brand-blue/90 backdrop-blur-sm text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              Nouveau
            </span>
          )}
        </div>

        {/* LECTURE VIDÉO AU SURVOL */}
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

        {isGloballyOutOfStock && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="text-white font-extrabold tracking-widest text-[9px] border border-white/20 px-3 py-1 rounded-full bg-black/40">
              RUPTURE
            </span>
          </div>
        )}
      </div>

      {/* CONTENU INFO PRODUIT */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* MARQUE & ÉTOILES */}
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase gap-1">
            <span className="truncate max-w-[65%]">{product.brand || 'Al Karim'}</span>
            <div className="flex items-center gap-1 shrink-0 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 rounded-full">
              <Star 
                size={10} 
                fill={averageRating > 0 ? "#eab308" : "none"} 
                className={averageRating > 0 ? "text-yellow-500" : "text-zinc-300 dark:text-zinc-600"} 
              /> 
              <span className={averageRating === 0 ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-300 font-extrabold text-[9px]"}>
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
              </span>
            </div>
          </div>

          {/* NOM DU PRODUIT */}
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug h-8 sm:h-10 overflow-hidden transition-colors group-hover:text-brand-blue">
            {product.name}
          </h3>

          {/* DESCRIPTION CLAMPÉE */}
          {product.description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1 italic leading-normal">
              {product.description}
            </p>
          )}

          {/* BADGE DE GARANTIE/CONFIANCE */}
          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-500 font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full w-fit">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span>Garantie Al Karim Vision</span>
          </div>
        </div>

        <div>
          {/* SÉLECTEUR MULTI-VARIANTES */}
          {validVariants.length > 1 ? (
            <div className="mb-3" onClick={e => e.stopPropagation()}>
              <select
                value={selectedVariant?.sku || ''}
                onChange={(e) => {
                  const variant = validVariants.find(v => v.sku === e.target.value);
                  setSelectedVariant(variant);
                }}
                className="w-full text-[10px] p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer"
              >
                {validVariants.map((variant) => (
                  <option key={variant.id || variant.sku} value={variant.sku} disabled={Number(variant.stock_quantity) <= 0}>
                    {variant.attribute_value} {parseFloat(variant.price_modifier) > 0 ? `(+${new Intl.NumberFormat('fr-FR').format(variant.price_modifier)} F)` : ''} {Number(variant.stock_quantity) <= 0 ? '(Rup)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : validVariants.length === 1 ? (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-2 truncate italic">{validVariants[0].attribute_value}</p>
          ) : (
            <div className="h-[12px] mb-2" />
          )}

          {/* PRIX */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 mb-3.5">
            <span className="text-sm sm:text-base font-black text-brand-blue whitespace-nowrap">
              {new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA
            </span>
            {compareAtPrice > basePrice && (
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 line-through whitespace-nowrap">
                {new Intl.NumberFormat('fr-FR').format(compareAtPrice + (selectedVariant?.price_modifier ? parseFloat(selectedVariant.price_modifier) : 0))} FCFA
              </span>
            )}
          </div>

          {/* ACTION BUTTONS (Sleek shadcn style) */}
          <div className="flex gap-2">
            <button 
              disabled={isVariantOutOfStock}
              onClick={handleAddToCart}
              className={`py-2 sm:py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                isVariantOutOfStock
                  ? 'w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-transparent'
                  : 'flex-1 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 hover:shadow-sm'
              }`}
            >
              {isVariantOutOfStock ? (
                <>
                  <AlertCircle size={12} />
                  Rupture
                </>
              ) : (
                <>
                  <ShoppingCart size={12} />
                  Ajouter
                </>
              )}
            </button>

            {!isVariantOutOfStock && (
              <a
                href={`https://wa.me/221774133645?text=Bonjour%20Al%20Karim%20Vision,%20je%20souhaite%20commander%20le%20produit%20*${encodeURIComponent(product.name)}*%20${selectedVariant ? `(Variante%20:%20*${encodeURIComponent(selectedVariant.attribute_value)}*)` : ''}%20au%20prix%20de%20*${encodeURIComponent(new Intl.NumberFormat('fr-FR').format(displayPrice))}%20FCFA*.%20Voici%20le%20lien%20du%20produit%20:%20${encodeURIComponent(window.location.origin + '/product/' + product.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center transition-all duration-300 hover:shadow-sm shrink-0 active:scale-[0.98]"
                title="Commander sur WhatsApp"
              >
                <svg className="w-4.5 h-4.5 fill-current text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.121.945 11.5.944c-5.439 0-9.865 4.371-9.87 9.799-.002 1.802.48 3.562 1.396 5.12L2.03 21.8l6.088-1.597-.03.02a9.87 9.87 0 0 1-1.441.931zm10.742-7.51c-.262-.13-1.547-.757-1.785-.841-.237-.084-.41-.127-.582.13-.172.257-.667.841-.818 1.013-.15.17-.3.195-.562.066-.262-.13-1.11-.407-2.113-1.296-.782-.693-1.309-1.55-1.463-1.807-.154-.257-.016-.397.115-.526.118-.115.262-.303.393-.455.13-.152.174-.257.262-.429.088-.172.044-.323-.022-.452-.066-.13-.582-1.393-.797-1.91-.21-.508-.44-.44-.582-.448-.135-.008-.29-.01-.445-.01-.156 0-.41.058-.625.292-.215.234-.82.796-.82 1.94 0 1.144.835 2.25.952 2.408.117.156 1.643 2.493 3.98 3.498.556.24 1.002.383 1.336.488.558.177 1.066.152 1.468.093.447-.066 1.547-.627 1.767-1.233.22-.607.22-1.127.155-1.234-.066-.108-.242-.172-.504-.303z"/>
                </svg>
              </a>
            )}
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
              className="fixed bottom-6 right-6 z-[9999] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/80 p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] flex items-center gap-4 cursor-default max-w-sm"
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