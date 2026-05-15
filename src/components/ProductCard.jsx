import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showToast, setShowToast] = useState(false); // État pour la notification
  const navigate = useNavigate();
  
  // Filtrer les variantes invalides (nulles) retournées par json_agg() en cas de LEFT JOIN sans résultat
  const validVariants = product.variants?.filter(v => v && v.id) || [];
  const [selectedVariant, setSelectedVariant] = useState(validVariants[0] || null);
  
  // Calcul du prix avec le modificateur de la variante sélectionnée
  const basePrice = parseFloat(product.base_price || 0);
  const displayPrice = selectedVariant?.price_modifier 
    ? basePrice + parseFloat(selectedVariant.price_modifier)
    : basePrice;

  // Calcul du pourcentage de réduction si un ancien prix (compare_at_price) existe
  const compareAtPrice = parseFloat(product.compare_at_price || 0);
  const discountPercentage = compareAtPrice > basePrice 
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100) 
    : 0;

  // Calcul du badge NOUVEAU (moins de 7 jours = 7 * 24h * 60m * 60s * 1000ms)
  const isNew = product.created_at 
    ? (new Date() - new Date(product.created_at)) < 7 * 24 * 60 * 60 * 1000 
    : false;

  // Formatage des données de notes (récupérées depuis le nouveau backend)
  const averageRating = parseFloat(product.average_rating || 0);
  const reviewCount = parseInt(product.review_count || 0, 10);

  // Fonction pour ajouter au panier et déclencher la notification
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Évite un potentiel conflit de clic sur la carte entière
    addToCart(product, selectedVariant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Masque le toast après 3 secondes
  };

  const isGloballyOutOfStock = validVariants.length > 0 && validVariants.every(v => Number(v.stock_quantity) <= 0);
  const isVariantOutOfStock = selectedVariant ? Number(selectedVariant.stock_quantity) <= 0 : isGloballyOutOfStock;
  
  // Détection Cloudinary : Si l'URL est une vidéo, on génère l'URL de sa miniature (.jpg)
  const isVideo = product.image_url?.match(/\.(mp4|mov|webm)$/i);
  const imageUrl = isVideo 
    ? product.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') 
    : (product.image_url || 'https://via.placeholder.com/400');

  return (
    <motion.div 
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white dark:bg-bustantech-gray rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/5 cursor-pointer"
    >
      {/* IMAGE & BADGE */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Indisponible'; }}
        />
        
        {/* CONTENEUR DES BADGES */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-2 z-10">
          {/* BADGE PROMO OU POURCENTAGE */}
          {(product.is_on_sale || discountPercentage > 0) && (
            <div className="bg-red-600 dark:bg-red-500 text-white text-[10px] font-bold tracking-widest px-3 py-1 shadow-md rounded-full animate-pulse">
              {discountPercentage > 0 ? `-${discountPercentage}%` : 'PROMO'}
            </div>
          )}
          {/* BADGE NOUVEAU */}
          {isNew && (
            <div className="bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold tracking-widest px-3 py-1 shadow-md rounded-full">
              NOUVEAU
            </div>
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
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest text-xs border border-white px-4 py-2">RUPTURE</span>
          </div>
        )}

        <button 
          disabled={isVariantOutOfStock}
          onClick={handleAddToCart}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={`Ajouter ${product.name} au panier`}
          className="absolute bottom-4 right-4 p-3 bg-white dark:bg-bustantech-black text-bustantech-gold rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-bustantech-gold hover:text-white"
        >
          <ShoppingBag size={20} />
        </button>
      </div>

      {/* INFOS PRODUIT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-bustantech-gold uppercase gap-2">
          <span className="truncate">{product.brand}</span>
          <div className="flex items-center gap-1 shrink-0" title={reviewCount > 0 ? `${reviewCount} avis client(s)` : "Aucun avis"}>
            <Star 
              size={10} 
              fill={averageRating > 0 ? "currentColor" : "none"} 
              className={averageRating > 0 ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} 
            /> 
            <span className={averageRating === 0 ? "text-gray-400 capitalize" : ""}>
              {averageRating > 0 ? averageRating : 'Nouveau'}
            </span>
          </div>
        </div>

        <h3 className="font-luxury text-base sm:text-lg font-bold dark:text-white line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto pt-2">
          {/* SÉLECTEUR DE VARIANTE */}
          {validVariants.length > 1 ? (
            <div className="mb-2 relative z-20">
              <select
                value={selectedVariant?.sku || ''}
                onChange={(e) => {
                  const variant = validVariants.find(v => v.sku === e.target.value);
                  setSelectedVariant(variant);
                }}
                onClick={(e) => e.stopPropagation()} // Pour ne pas déclencher d'éventuels liens sur la carte
                onKeyDown={(e) => e.stopPropagation()}
                aria-label={`Sélectionner une variante pour ${product.name}`}
                className="w-full text-xs p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl dark:text-white focus:outline-none focus:border-bustantech-gold transition-colors cursor-pointer"
              >
                {validVariants.map((variant) => (
                  <option key={variant.id || variant.sku} value={variant.sku} disabled={Number(variant.stock_quantity) <= 0}>
                    {variant.attribute_value} {parseFloat(variant.price_modifier) > 0 ? `(+ ${new Intl.NumberFormat('fr-FR').format(variant.price_modifier)} FCFA)` : ''} {Number(variant.stock_quantity) <= 0 ? '(Rupture)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : validVariants.length === 1 ? (
            <p className="text-xs text-gray-500 mb-2 truncate">{validVariants[0].attribute_value}</p>
          ) : null}

          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-bustantech-gold">
              {new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA
            </span>
            {compareAtPrice > basePrice && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-400 line-through decoration-gray-400/70">
                {new Intl.NumberFormat('fr-FR').format(compareAtPrice + (selectedVariant?.price_modifier ? parseFloat(selectedVariant.price_modifier) : 0))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOAST DE NOTIFICATION (Fixé en bas à droite de l'écran) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            role="alert"
            aria-live="assertive"
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 z-[110] bg-green-500 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-center md:justify-start gap-3 cursor-default"
            onClick={(e) => e.stopPropagation()} // Empêche de cliquer à travers le toast
          >
            <CheckCircle2 size={24} />
            <span className="font-bold tracking-wide text-sm">{product.name} a été ajouté au panier.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;