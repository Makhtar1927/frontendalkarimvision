import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import SEO from '../components/SEO';
import { ChevronRight, ChevronLeft, ShoppingCart, Star, Loader2, CheckCircle2, Truck, CreditCard, ShieldCheck, Clock, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { apiFetch } from '../components/api';

const ProductPage = () => {
  const { productId } = useParams();
  const { currentProduct, fetchProductById, clearCurrentProduct, loading, error, settings: storeSettings, fetchSettings } = useProductStore();
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

  // RÉGLAGES DYNAMIQUES ET STICKY BAR
  const settings = storeSettings || {
    whatsapp_number: "221784379462",
    store_name: "Al Karim Vision",
    delivery_cost_dakar: 2000,
    delivery_cost_suburbs: 3000,
    delivery_cost_regions: 5000
  };
  const [showStickyBar, setShowStickyBar] = useState(false);

  // ÉTATS ACHAT RAPIDE WAVE
  const [isWaveModalOpen, setIsWaveModalOpen] = useState(false);
  const [waveName, setWaveName] = useState('');
  const [wavePhone, setWavePhone] = useState('');
  const [waveDeliveryZone, setWaveDeliveryZone] = useState('dakar');
  const [isWaveSubmitting, setIsWaveSubmitting] = useState(false);
  const [waveError, setWaveError] = useState('');

  const DELIVERY_ZONES = {
    'dakar': { name: 'Touba', cost: Number(settings.delivery_cost_dakar) || 2000 },
    'suburbs': { name: 'Autour de Touba', cost: Number(settings.delivery_cost_suburbs) || 3000 },
    'regions': { name: 'Autres Régions (Sénégal)', cost: Number(settings.delivery_cost_regions) || 5000 },
    'store': { name: 'Retrait en Magasin', cost: 0 }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        const storedViews = localStorage.getItem('alkarimvision_recent_views');
        let viewedProducts = storedViews ? JSON.parse(storedViews) : [];

        // 1. On met à jour l'affichage avec les anciens produits (en excluant l'actuel)
        setRecentlyViewed(viewedProducts.filter(p => p.id !== currentProduct.id).slice(0, 4));

        // 2. On met à jour la liste pour le localStorage (on place le produit actuel en premier)
        viewedProducts = viewedProducts.filter(p => p.id !== currentProduct.id);
        viewedProducts.unshift(currentProduct);
        
        // 3. On conserve uniquement les 4 derniers produits en mémoire pour ne pas saturer le navigateur
        if (viewedProducts.length > 4) viewedProducts = viewedProducts.slice(0, 4);
        localStorage.setItem('alkarimvision_recent_views', JSON.stringify(viewedProducts));
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
        if (typeof currentProduct.media_urls === 'string') {
            try {
                const parsed = JSON.parse(currentProduct.media_urls);
                if (Array.isArray(parsed)) return parsed;
                return [currentProduct.media_urls];
            } catch (e) {
                return [currentProduct.media_urls];
            }
        }
        return currentProduct.media_urls;
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
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
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

  // Achat rapide WhatsApp direct
  const handleQuickWhatsAppBuy = () => {
    let message = `*ACHAT RAPIDE* 🛒\n\n`;
    message += `Je souhaite commander le produit suivant :\n`;
    message += `▪️ *Produit :* ${currentProduct.name}\n`;
    if (selectedVariant) {
      message += `▪️ *Option :* ${selectedVariant.attribute_value}\n`;
    }
    message += `💰 *Prix :* ${new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA\n\n`;
    message += `Pouvez-vous me confirmer la disponibilité et planifier la livraison ?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${settings.whatsapp_number || '221774133645'}?text=${encoded}`, '_blank');
  };

  // Soumission achat rapide Wave
  const handleQuickWaveBuySubmit = async (e) => {
    e.preventDefault();
    if (!waveName || !wavePhone) {
      setWaveError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }
    setWaveError('');
    setIsWaveSubmitting(true);

    const shippingCost = DELIVERY_ZONES[waveDeliveryZone].cost;
    const finalTotal = displayPrice + shippingCost;

    let variantId = selectedVariant?.id || selectedVariant?.sku || null;

    const orderData = {
      customer_name: waveName,
      customer_phone: wavePhone,
      customer_address: DELIVERY_ZONES[waveDeliveryZone].name,
      payment_method: 'Wave',
      total_amount: finalTotal,
      items: [
        {
          id: currentProduct.id,
          variant_id: variantId,
          quantity: 1,
          price: displayPrice
        }
      ]
    };

    try {
      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || 'La création de la commande a échoué.');
      }

      setIsWaveModalOpen(false);
      // Clean fields
      setWaveName('');
      setWavePhone('');
      window.location.href = `https://pay.wave.com/m/M_VdELf5tD6Zki/c/sn/?amount=${finalTotal}`;
    } catch (error) {
      console.error(error);
      if (error.message.includes("Serveur injoignable") || error.message.includes("démonstration")) {
        setIsWaveModalOpen(false);
        setWaveName('');
        setWavePhone('');
        window.location.href = `https://pay.wave.com/m/M_VdELf5tD6Zki/c/sn/?amount=${finalTotal}`;
      } else {
        setWaveError(error.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsWaveSubmitting(false);
    }
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://boustanetech-store.vercel.app/product/${currentProduct.id}`;
  const imageGallery = mediaUrls.filter(url => typeof url === 'string' && !url.match(/\.(mp4|mov|webm)$/i));
  const productImages = imageGallery.length > 0 ? imageGallery : [currentProduct.image_url || 'https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778875919/Boustanetech3_gstihc.png'];

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": currentProduct.name,
    "image": productImages,
    "description": currentProduct.description?.substring(0, 160) || `Découvrez ${currentProduct.name} chez Al Karim Vision`,
    "sku": currentProduct.id ? currentProduct.id.toString() : 'SKU-UNKNOWN',
    "brand": {
      "@type": "Brand",
      "name": currentProduct.brand || "Al Karim Vision"
    },
    "offers": {
      "@type": "Offer",
      "url": currentUrl,
      "priceCurrency": "XOF",
      "price": displayPrice.toString(),
      "availability": isVariantOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "priceValidUntil": new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0]
    }
  };

  if (reviews && reviews.length > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toString(),
      "reviewCount": reviews.length.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
    productSchema.review = reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.customer_name || 'Anonyme'
      },
      "datePublished": r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      "reviewBody": r.comment || '',
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": (r.rating || 5).toString(),
        "bestRating": "5",
        "worstRating": "1"
      }
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={currentProduct.name}
        description={currentProduct.description?.substring(0, 160)}
        image={currentProduct.image_url}
        schema={productSchema}
      />
      {/* Breadcrumbs */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-blue">Accueil</Link>
        <ChevronRight size={14} />
        <Link to={`/category/${currentProduct.category}`} className="hover:text-brand-blue capitalize">{currentProduct.category}</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{currentProduct.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colonne Image / Vidéo avec Carousel Professionnel */}
        <div className="relative aspect-square bg-gray-50 dark:bg-brand-gray-dark rounded-xl overflow-hidden shadow-sm border border-gray-150 dark:border-zinc-800 group">
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
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <img 
                    src={mediaUrls[currentMediaIndex]} 
                    alt={`${currentProduct.name} - Vue ${currentMediaIndex + 1}`} 
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-105" 
                    onClick={() => setIsFullscreen(true)}
                    onError={(e) => { e.target.src = 'https://placehold.co/800x800/png?text=Image+Indisponible'; }}
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center rounded-lg text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-blue hover:text-white shadow-sm z-20"
                  >
                      <ChevronLeft size={24} />
                  </button>
                  <button 
                      onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center rounded-lg text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-blue hover:text-white shadow-sm z-20"
                  >
                      <ChevronRight size={24} />
                  </button>
                  
                  {/* Indicateurs (Dots) */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                      {mediaUrls.map((_, idx) => (
                          <button 
                              key={idx}
                              onClick={() => setCurrentMediaIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-brand-blue w-6' : 'bg-white/50 hover:bg-white/80'}`}
                          />
                      ))}
                  </div>
              </>
          )}
          
          {/* CONTENEUR DES BADGES */}
          <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5 z-10">
            {/* BADGE PROMO OU POURCENTAGE */}
            {(currentProduct.is_on_sale || discountPercentage > 0) && (
              <div className="bg-red-500 text-white text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded uppercase">
                {discountPercentage > 0 ? `-${discountPercentage}%` : 'Promo'}
              </div>
            )}
            {/* BADGE NOUVEAU */}
            {isNew && (
              <div className="bg-brand-blue text-white text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded uppercase">
                Nouveau
              </div>
            )}
          </div>
        </div>

        {/* Colonne Infos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
          <span className="font-bold text-brand-blue uppercase tracking-widest text-xs">{currentProduct.brand}</span>
          <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-gray-900 dark:text-white my-2">{currentProduct.name}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star size={14} fill={averageRating > 0 ? "#0284c7" : "none"} className={averageRating > 0 ? "text-brand-blue" : "text-gray-300 dark:text-zinc-650"} /> {averageRating > 0 ? `${averageRating} (${reviews.length} avis)` : 'Aucun avis'}
          </div>

          <div className="my-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <p>{currentProduct.description || "Aucune description disponible pour ce produit d'exception."}</p>
          </div>

          {/* Sélecteur de variantes */}
          {currentProduct.variants && currentProduct.variants.length > 0 && (
            <div className="my-6 py-4 border-t border-b border-gray-100 dark:border-zinc-800/80">
              <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                Option : <span className="text-brand-blue normal-case font-black ml-1">{selectedVariant?.attribute_value || 'Aucune'}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {currentProduct.variants.map(variant => {
                  const isSelected = selectedVariant?.sku === variant.sku;
                  const isOutOfStock = variant.stock_quantity === 0;
                  return (
                    <button
                      key={variant.sku}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={isOutOfStock}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg uppercase tracking-wide border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                        isSelected
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-750 dark:text-gray-300 hover:border-brand-blue/50'
                      }`}
                    >
                      {variant.attribute_value}
                      {isOutOfStock && <span className="text-[10px] opacity-75 font-normal ml-1.5">(Rupture)</span>}
                    </button>
                  );
                })}
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
                <span className="text-3xl font-black text-brand-blue">
                  {new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {/* Bouton Payer avec Wave */}
              <button
                onClick={() => setIsWaveModalOpen(true)}
                disabled={isVariantOutOfStock}
                className="w-full bg-[#1da1f2] hover:bg-[#1a90da] text-white py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                <img src="/Wave.svg" alt="Wave" className="h-5 w-auto object-contain" />
                {isVariantOutOfStock ? 'Indisponible' : 'Payer avec Wave'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Ajouter au panier */}
                <button
                  onClick={handleAddToCart}
                  disabled={isVariantOutOfStock}
                  className="bg-white dark:bg-zinc-900 hover:bg-gray-50 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-white py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                >
                  <ShoppingCart size={16} className="text-brand-blue" />
                  Panier
                </button>

                {/* Commander via WhatsApp */}
                <button
                  onClick={handleQuickWhatsAppBuy}
                  disabled={isVariantOutOfStock}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                >
                  <img src="/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4 object-contain" />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Modes de paiement acceptés */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">
                Payer avec
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWaveModalOpen(true)}
                  disabled={isVariantOutOfStock}
                  className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-brand-blue dark:hover:border-brand-blue rounded-lg px-2.5 py-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  <img src="/Wave.svg" alt="Wave" className="h-4 w-auto object-contain" />
                </button>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">Cash livraison</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-300 dark:text-zinc-600 hidden sm:block">·</span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 hidden sm:flex items-center gap-1 shrink-0">
                Finaliser via
                <img src="/WhatsApp.svg" alt="WhatsApp" className="h-3.5 w-3.5 object-contain inline ml-0.5" />
              </span>
            </div>

            {/* Éléments de réassurance */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-150 dark:border-zinc-800 text-[11px]">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/40 rounded-lg border border-gray-100 dark:border-zinc-800">
                <Truck className="text-brand-blue" size={16} />
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Livraison Rapide</h4>
                  <p className="text-gray-500">24h Touba, 48h Régions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/40 rounded-lg border border-gray-100 dark:border-zinc-800">
                <CreditCard className="text-brand-blue" size={16} />
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Paiement sur place</h4>
                  <p className="text-gray-500">À la livraison ou Wave</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/40 rounded-lg border border-gray-100 dark:border-zinc-800">
                <ShieldCheck className="text-brand-blue" size={16} />
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Produits Originaux</h4>
                  <p className="text-gray-500">100% Authentiques</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/40 rounded-lg border border-gray-100 dark:border-zinc-800">
                <Clock className="text-brand-blue" size={16} />
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Service Client</h4>
                  <p className="text-gray-500">Sam - Jeu : 9h - 21h</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SECTION AVIS ET NOTES */}
      <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-luxury font-bold dark:text-white mb-8">Avis Clients</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Formulaire d'avis */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-zinc-900/40 p-6 rounded-xl border border-gray-150 dark:border-zinc-800 h-fit">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Laisser un avis</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Votre nom</label>
                <input required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} type="text" className="w-full p-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg dark:text-white focus:outline-none focus:border-brand-blue transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Note sur 5</label>
                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full p-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg dark:text-white focus:outline-none focus:border-brand-blue transition-colors cursor-pointer">
                  {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Étoile{num > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Votre commentaire</label>
                <textarea required value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg dark:text-white focus:outline-none focus:border-brand-blue transition-colors"></textarea>
              </div>
              <button disabled={isSubmittingReview} type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 uppercase tracking-widest text-[11px]">
                {isSubmittingReview ? 'Envoi...' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des avis */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">Aucun avis pour le moment. Soyez le premier à donner votre avis sur ce produit d'exception.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-brand-card-dark p-6 border border-gray-150 dark:border-zinc-800 rounded-xl shadow-sm transition-hover hover:border-brand-blue/30">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div>
                      <p className="font-bold text-sm dark:text-white">{review.customer_name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? '#0284c7' : 'none'} className={i < review.rating ? 'text-brand-blue' : 'text-gray-300 dark:text-zinc-700'} />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {recentlyViewed.map(p => (
              <ProductCard key={`recent-${p.id}`} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* TOAST DE NOTIFICATION (Haut sur mobile, Bas-Droit sur Desktop - Portal) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              role="alert"
              aria-live="assertive"
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="fixed top-4 left-4 right-4 md:top-auto md:bottom-6 md:right-6 md:left-auto z-[9999] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/40 p-4 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4 cursor-default max-w-sm mx-auto md:mx-0"
              onClick={(e) => e.stopPropagation()} // Empêche de cliquer à travers le toast
            >
              {/* Image miniature du produit */}
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50">
                <img 
                  src={mediaUrls[0]?.match(/\.(mp4|mov|webm)$/i) ? mediaUrls[0].replace(/\.(mp4|mov|webm)$/i, '.jpg') : (mediaUrls[0] || 'https://via.placeholder.com/100')} 
                  alt={currentProduct.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Miniature'; }}
                />
                <div className="absolute inset-0 bg-emerald-500/10" />
              </div>
              
              {/* Contenu texte */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ajouté au panier !</p>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{currentProduct.name}</h4>
              </div>

              {/* Icône de confirmation */}
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <CheckCircle2 size={18} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL ACHAT RAPIDE WAVE */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isWaveModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWaveModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 z-10 overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsWaveModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#1da1f2]/10 flex items-center justify-center">
                    <img src="/Wave.svg" alt="Wave Logo" className="h-5 w-auto" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Payer avec Wave</h3>
                    <p className="text-xs text-gray-500">Paiement sécurisé instantané via Wave</p>
                  </div>
                </div>

                <form onSubmit={handleQuickWaveBuySubmit} className="space-y-4">
                  {waveError && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 p-2.5 rounded-lg">
                      {waveError}
                    </p>
                  )}

                  {/* Product Summary inside Modal */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <img
                      src={mediaUrls[0]?.match(/\.(mp4|mov|webm)$/i) ? mediaUrls[0].replace(/\.(mp4|mov|webm)$/i, '.jpg') : (mediaUrls[0] || 'https://via.placeholder.com/100')}
                      alt={currentProduct.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-205 dark:border-zinc-800 bg-white"
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Image'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{currentProduct.name}</h4>
                      {selectedVariant && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{selectedVariant.attribute_value}</p>
                      )}
                      <p className="text-xs font-black text-brand-blue">{new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wider">Votre nom complet</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Moussa Ndiaye"
                      value={waveName}
                      onChange={e => setWaveName(e.target.value)}
                      className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wider">Numéro de téléphone</label>
                    <input
                      required
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={wavePhone}
                      onChange={e => setWavePhone(e.target.value)}
                      className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wider">Zone de livraison</label>
                    <select
                      value={waveDeliveryZone}
                      onChange={e => setWaveDeliveryZone(e.target.value)}
                      className="w-full p-3 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-800 rounded-xl dark:text-white focus:outline-none focus:border-brand-blue cursor-pointer"
                    >
                      {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                        <option key={key} value={key}>
                          {zone.name} ({zone.cost === 0 ? 'Gratuit' : `+${new Intl.NumberFormat('fr-FR').format(zone.cost)} FCFA`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs space-y-1.5 text-gray-500 font-sans">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison ({DELIVERY_ZONES[waveDeliveryZone].name})</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('fr-FR').format(DELIVERY_ZONES[waveDeliveryZone].cost)} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1.5 border-t border-dashed border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-black">
                      <span>Total à payer</span>
                      <span className="text-brand-blue">{new Intl.NumberFormat('fr-FR').format(displayPrice + DELIVERY_ZONES[waveDeliveryZone].cost)} FCFA</span>
                    </div>
                  </div>

                  <button
                    disabled={isWaveSubmitting}
                    type="submit"
                    className="w-full bg-[#1da1f2] hover:bg-[#1a90da] text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] mt-2"
                  >
                    {isWaveSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <img src="/Wave.svg" alt="Wave" className="h-4 w-auto object-contain" />
                        Payer avec Wave
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
              className="absolute top-6 right-6 text-white hover:text-brand-blue transition-colors z-50 bg-black/50 p-2 rounded-lg"
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
                      className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <img 
                      src={mediaUrls[currentMediaIndex]} 
                      alt="Aperçu HD" 
                      className="max-w-full max-h-full rounded-xl object-contain shadow-2xl cursor-zoom-out"
                      onClick={() => setIsFullscreen(false)}
                      onError={(e) => { e.target.src = 'https://placehold.co/800x800/png?text=Image+Indisponible'; }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Flèches de navigation de la Lightbox */}
              {mediaUrls.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length); }}
                    className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-brand-blue text-white flex items-center justify-center rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length); }}
                    className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-brand-blue text-white flex items-center justify-center rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
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
                    className={`h-1.5 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-brand-blue w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BARRE D'ACHAT COLLANTE MOBILE (Uniquement sur mobile) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed bottom-16 left-0 right-0 z-45 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 p-3 flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={mediaUrls[0]?.match(/\.(mp4|mov|webm)$/i) ? mediaUrls[0].replace(/\.(mp4|mov|webm)$/i, '.jpg') : (mediaUrls[0] || 'https://via.placeholder.com/100')} 
                alt={currentProduct.name} 
                className="w-10 h-10 object-cover rounded-lg border border-gray-205 dark:border-zinc-800" 
                onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Mini'; }}
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold dark:text-white truncate">{currentProduct.name}</h4>
                <p className="text-xs font-black text-brand-blue">{new Intl.NumberFormat('fr-FR').format(displayPrice)} FCFA</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleAddToCart}
                disabled={isVariantOutOfStock}
                className="p-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold disabled:opacity-50 transition-colors"
                aria-label="Ajouter au Panier"
              >
                <ShoppingCart size={18} />
              </button>

              <button 
                onClick={() => setIsWaveModalOpen(true)}
                disabled={isVariantOutOfStock}
                className="p-3 bg-[#1da1f2] hover:bg-[#1a90da] text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center transition-colors"
                aria-label="Achat Wave"
              >
                <img src="/Wave.svg" alt="Wave" className="w-[18px] h-[18px] object-contain" />
              </button>
              
              <button 
                onClick={handleQuickWhatsAppBuy}
                disabled={isVariantOutOfStock}
                className="p-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center transition-colors"
                aria-label="Achat WhatsApp"
              >
                <img src="/WhatsApp.svg" alt="WhatsApp" className="w-[18px] h-[18px] object-contain" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;