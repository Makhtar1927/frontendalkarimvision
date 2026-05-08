import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, ShoppingBag, Star, Loader2, CheckCircle2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../components/api';

const ProductPage = () => {
  const { productId } = useParams();
  const { currentProduct, fetchProductById, clearCurrentProduct, loading, error } = useProductStore();
  const { addToCart } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // NOUVEAU : Index du carousel et Fullscreen
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chargement des produits similaires
  useEffect(() => {
    if (currentProduct?.category_id) {
      const fetchSimilar = async () => {
        try {
          const res = await apiFetch(`/products?categoryId=${currentProduct.category_id}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            const productsList = data.products || data; // Gère les deux formats (paginé ou tableau)
            setSimilarProducts(productsList.filter(p => p.id !== currentProduct.id).slice(0, 4));
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des produits similaires:", err);
        }
      };
      fetchSimilar();
    }
  }, [currentProduct?.category_id, currentProduct?.id]);

  // Gestion des produits "Récemment consultés" via localStorage
  useEffect(() => {
    if (currentProduct && currentProduct.id) {
      try {
        const storedViews = localStorage.getItem('bustantech_recent_views');
        let viewedProducts = storedViews ? JSON.parse(storedViews) : [];

        // 1. On met à jour l'affichage avec les anciens produits (en excluant l'actuel)
        setRecentlyViewed(viewedProducts.filter(p => p.id !== currentProduct.id).slice(0, 4));

        // 2. On met à jour la liste pour le localStorage (on place le produit actuel en premier)
        viewedProducts = viewedProducts.filter(p => p.id !== currentProduct.id);
        viewedProducts.unshift(currentProduct);
        
        // 3. On conserve uniquement les 4 derniers produits en mémoire pour ne pas saturer le navigateur
        if (viewedProducts.length > 4) viewedProducts = viewedProducts.slice(0, 4);
        localStorage.setItem('bustantech_recent_views', JSON.stringify(viewedProducts));
      } catch (err) {
        console.error("Erreur d'accès au localStorage pour les vues récentes", err);
      }
    }
  }, [currentProduct]);

  // Chargement des avis du produit
  useEffect(() => {
    fetchProductById(productId);
    
    const fetchReviews = async () => {
      try {
        const res = await apiFetch(`/products/${productId}/reviews`);
        if (res.ok) {
          setReviews(await res.json());
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des avis:", err);
      }
    };
    fetchReviews();
    
    window.scrollTo(0, 0);
    return () => clearCurrentProduct();
  }, [productId, fetchProductById, clearCurrentProduct]);

  useEffect(() => {
    if (currentProduct && currentProduct.variants?.length > 0) {
      setSelectedVariant(currentProduct.variants[0]);
    }
    setCurrentMediaIndex(0); // Reset index when product changes
  }, [currentProduct]);
  
  // Utilitaire pour récupérer toutes les images/vidéos
  const getMediaUrls = () => {
    if (!currentProduct) return [];
    if (currentProduct.media_urls && currentProduct.media_urls.length > 0) {
        return typeof currentProduct.media_urls === 'string' 
            ? JSON.parse(currentProduct.media_urls) 
            : currentProduct.media_urls;
    }
    if (currentProduct.image_url) {
        return [currentProduct.image_url];
    }
    return [];
  };
  
  const mediaUrls = getMediaUrls();

  // NOUVEAU : Auto-scroll du carousel (Désactivé si en plein écran)
  useEffect(() => {
    if (mediaUrls.length <= 1 || isFullscreen) return;
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
    }, 5000); // Défilement auto toutes les 5 secondes
    return () => clearInterval(interval);
  }, [mediaUrls.length, isFullscreen]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 dark:text-white">
        <Loader2 className="w-8 h-8 animate-spin text-bustantech-gold" />
        Chargement du produit...
      </div>
    );
  }

  if (error || !currentProduct) {
    return <div className="min-h-[80vh] flex items-center justify-center text-red-500">Produit introuvable.</div>;
  }

  const basePrice = parseFloat(currentProduct.base_price || 0);
  const displayPrice = selectedVariant?.price_modifier
    ? basePrice + parseFloat(selectedVariant.price_modifier)
    : basePrice;

  const compareAtPrice = parseFloat(currentProduct.compare_at_price || 0);
  const discountPercentage = compareAtPrice > basePrice 
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100) 
    : 0;

  // Fonction pour ajouter au panier et déclencher la notification
  const handleAddToCart = () => {
    addToCart(currentProduct, selectedVariant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Soumission d'un nouvel avis
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setIsSubmittingReview(true);
    try {
      const res = await apiFetch(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          customer_name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        const addedReview = await res.json();
        setReviews([addedReview, ...reviews]); // Ajoute le nouvel avis en haut de la liste
        setNewReview({ name: '', rating: 5, comment: '' }); // Réinitialise le formulaire
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'avis:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  // Calcul du badge NOUVEAU (moins de 7 jours)
  const isNew = currentProduct.created_at 
    ? (new Date() - new Date(currentProduct.created_at)) < 7 * 24 * 60 * 60 * 1000 
    : false;

  const isVariantOutOfStock = selectedVariant ? selectedVariant.stock_quantity === 0 : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{currentProduct.name} | BoustaneTech Store</title>
        <meta name="description" content={currentProduct.description?.substring(0, 160) || `Découvrez ${currentProduct.name} chez BoustaneTech Store`} />
      </Helmet>
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link to="/" className="hover:text-bustantech-gold">Accueil</Link>
        <ChevronRight size={16} />
        <Link to={`/category/${currentProduct.category}`} className="hover:text-bustantech-gold capitalize">{currentProduct.category}</Link>
        <ChevronRight size={16} />
        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{currentProduct.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colonne Image / Vidéo avec Carousel Professionnel */}
        <div className="relative aspect-square bg-gray-100 dark:bg-bustantech-gray rounded-sm overflow-hidden shadow-lg group">
          <AnimatePresence mode="wait">
            <motion.div 
                key={currentMediaIndex}
                initial={{ opacity: 0, scale: 1.05 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
            >
              {mediaUrls.length > 0 ? (
                mediaUrls[currentMediaIndex].match(/\.(mp4|mov|webm)$/i) ? (
                  <video 
                    src={mediaUrls[currentMediaIndex]} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    controls
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                  />
                ) : (
                  <img 
                    src={mediaUrls[currentMediaIndex]} 
                    alt={`${currentProduct.name} - Vue ${currentMediaIndex + 1}`} 
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-105" 
                    onClick={() => setIsFullscreen(true)}
                  />
                )
              ) : (
                <img src="https://via.placeholder.com/800" alt="Placeholder" className="w-full h-full object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Flèches de navigation du Carousel */}
          {mediaUrls.length > 1 && (
              <>
                  <button 
                      onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-bustantech-gold hover:text-white shadow-md z-20"
                  >
                      <ChevronLeft size={24} />
                  </button>
                  <button 
                      onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-bustantech-gold hover:text-white shadow-md z-20"
                  >
                      <ChevronRight size={24} />
                  </button>
                  
                  {/* Indicateurs (Dots) */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                      {mediaUrls.map((_, idx) => (
                          <button 
                              key={idx}
                              onClick={() => setCurrentMediaIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-bustantech-gold w-6' : 'bg-white/50 hover:bg-white/80'}`}
                          />
                      ))}
                  </div>
              </>
          )}
          
          {/* CONTENEUR DES BADGES */}
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
            {/* BADGE PROMO OU POURCENTAGE */}
            {(currentProduct.is_on_sale || discountPercentage > 0) && (
              <div className="bg-red-600 dark:bg-red-500 text-white text-xs font-bold tracking-widest px-3 py-1.5 shadow-md">
                {discountPercentage > 0 ? `-${discountPercentage}%` : 'PROMO'}
              </div>
            )}
            {/* BADGE NOUVEAU */}
            {isNew && (
              <div className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold tracking-widest px-3 py-1.5 shadow-md">
                NOUVEAU
              </div>
            )}
          </div>
        </div>

        {/* Colonne Infos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
          <span className="font-bold text-bustantech-gold uppercase tracking-widest text-xs">{currentProduct.brand}</span>
          <h1 className="text-3xl md:text-4xl font-luxury font-bold dark:text-white my-2">{currentProduct.name}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star size={14} fill="currentColor" className={averageRating > 0 ? "text-yellow-400" : "text-gray-300"} /> {averageRating > 0 ? `${averageRating} (${reviews.length} avis)` : 'Aucun avis'}
          </div>

          <div className="my-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <p>{currentProduct.description || "Aucune description disponible pour ce produit d'exception."}</p>
          </div>

          {/* Sélecteur de variantes */}
          {currentProduct.variants && currentProduct.variants.length > 0 && (
            <div className="my-4">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {currentProduct.variants.length > 1 ? 'Choisissez une option' : 'Option disponible'}
              </label>
              <div className="flex flex-wrap gap-3">
                {currentProduct.variants.map(variant => (
                  <button
                    key={variant.sku}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock_quantity === 0}
                    className={`px-4 py-2 text-sm font-bold border rounded-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedVariant?.sku === variant.sku
                        ? 'bg-bustantech-gold text-white border-bustantech-gold'
                        : 'bg-white dark:bg-bustantech-gray border-gray-200 dark:border-gray-700 hover:border-bustantech-gold dark:text-white'
                    }`}
                  >
                    {variant.attribute_value}
                    {variant.stock_quantity === 0 && <span className="text-xs ml-2">(Rupture)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8">
            <div className="flex items-end justify-between mb-4">
              <span className="text-sm text-gray-500">Prix</span>
              <div className="flex items-baseline flex-wrap justify-end gap-3">
                {compareAtPrice > basePrice && (
                  <span className="text-2xl font-medium text-gray-400 line-through decoration-gray-400/70">
                    {new Intl.NumberFormat('fr-FR').format(compareAtPrice + (selectedVariant?.price_modifier ? parseFloat(selectedVariant.price_modifier) : 0))}
                  </span>
                )}
                <span className="text-4xl font-bold text-bustantech-gold">
                  {new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA
                </span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isVariantOutOfStock}
              className="w-full bg-bustantech-black dark:bg-bustantech-gold text-white dark:text-black py-4 rounded-sm font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              <ShoppingBag size={20} />
              {isVariantOutOfStock ? 'Indisponible' : 'Ajouter au Panier'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* SECTION AVIS ET NOTES */}
      <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-luxury font-bold dark:text-white mb-8">Avis Clients</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Formulaire d'avis */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-sm border border-gray-100 dark:border-gray-800 h-fit">
            <h3 className="font-bold dark:text-white mb-4">Laisser un avis</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Votre nom</label>
                <input required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} type="text" className="w-full p-3 text-sm bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-700 rounded-sm dark:text-white focus:outline-none focus:border-bustantech-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Note sur 5</label>
                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full p-3 text-sm bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-700 rounded-sm dark:text-white focus:outline-none focus:border-bustantech-gold transition-colors cursor-pointer">
                  {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Étoile{num > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Votre commentaire</label>
                <textarea required value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-3 text-sm bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-700 rounded-sm dark:text-white focus:outline-none focus:border-bustantech-gold transition-colors"></textarea>
              </div>
              <button disabled={isSubmittingReview} type="submit" className="w-full bg-bustantech-gold text-white font-bold py-3 rounded-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 uppercase tracking-widest text-xs">
                {isSubmittingReview ? 'Envoi...' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des avis */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-sm border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">Aucun avis pour le moment. Soyez le premier à donner votre avis sur ce produit d'exception.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-bustantech-black p-6 border border-gray-100 dark:border-gray-800 rounded-sm shadow-sm transition-hover hover:border-bustantech-gold/30">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div>
                      <p className="font-bold text-sm dark:text-white">{review.customer_name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-bustantech-gold' : 'text-gray-300 dark:text-gray-700'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PRODUITS SIMILAIRES */}
      {similarProducts.length > 0 && (
        <div className="mt-24 pt-10 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-luxury font-bold dark:text-white mb-8">
            Vous aimerez aussi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* PRODUITS RÉCEMMENT CONSULTÉS */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-luxury font-bold dark:text-white mb-8">
            Récemment consultés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map(p => (
              <ProductCard key={`recent-${p.id}`} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* TOAST DE NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[110] bg-green-500 text-white px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={24} />
            <span className="font-bold tracking-wide text-sm">{currentProduct.name} a été ajouté au panier.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FULLSCREEN (LIGHTBOX) POUR LES IMAGES/VIDEOS */}
      <AnimatePresence>
        {isFullscreen && mediaUrls.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsFullscreen(false)} // Ferme si on clique à côté
          >
            {/* Bouton Fermer */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="absolute top-6 right-6 text-white hover:text-bustantech-gold transition-colors z-50 bg-black/50 p-2 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Contenu (Image ou Vidéo) avec flexibilité absolue */}
            <div 
              className="relative w-full max-w-7xl h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Empêche la fermeture quand on clique sur l'image
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {mediaUrls[currentMediaIndex].match(/\.(mp4|mov|webm)$/i) ? (
                    <video 
                      src={mediaUrls[currentMediaIndex]} 
                      controls
                      autoPlay
                      className="max-w-full max-h-full rounded-sm object-contain shadow-2xl"
                    />
                  ) : (
                    <img 
                      src={mediaUrls[currentMediaIndex]} 
                      alt="Aperçu HD" 
                      className="max-w-full max-h-full rounded-sm object-contain shadow-2xl cursor-zoom-out"
                      onClick={() => setIsFullscreen(false)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Flèches de navigation de la Lightbox */}
              {mediaUrls.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length); }}
                    className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-bustantech-gold text-white flex items-center justify-center rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length); }}
                    className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-bustantech-gold text-white flex items-center justify-center rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>

            {/* Indicateurs en bas */}
            {mediaUrls.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20" onClick={(e) => e.stopPropagation()}>
                {mediaUrls.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-bustantech-gold w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;