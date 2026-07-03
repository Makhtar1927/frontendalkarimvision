import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2, CheckCircle2, ShoppingCart, ArrowRight, ShieldCheck, Truck, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { apiFetch } from './api';
import { useProductStore } from '../store/useProductStore';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { trackInitiateCheckoutEvent, trackPurchaseEvent } from './TrackingManager';

const FREE_SHIPPING_THRESHOLD = 50000; // Seuil de livraison gratuite à 50 000 FCFA

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, getTotal, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();

  const { settings: storeSettings, fetchSettings } = useProductStore();

  // Configuration locale ou fallback
  const settings = storeSettings || {
    whatsapp_number: "221784379462",
    delivery_cost_dakar: 2000,
    delivery_cost_suburbs: 3000,
    delivery_cost_regions: 5000
  };

  // Tarifs de livraison par zone
  const DELIVERY_ZONES = {
    'dakar': { name: 'Touba', cost: Number(settings.delivery_cost_dakar) || 0 },
    'suburbs': { name: 'Autour de Touba', cost: Number(settings.delivery_cost_suburbs) || 0 },
    'regions': { name: 'Autres Régions (Sénégal)', cost: Number(settings.delivery_cost_regions) || 0 },
    'store': { name: 'Retrait en Magasin', cost: 0 }
  };

  // États pour le formulaire et le chargement
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('dakar'); // Zone par défaut
  const [waveSummaryData, setWaveSummaryData] = useState(null);
  
  // États pour les coupons / codes promo
  const [promoCodeText, setPromoCodeText] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!promoCodeText.trim()) return;
    setCouponError('');
    setIsValidatingCoupon(true);
    try {
      const response = await apiFetch(`/coupons/validate/${promoCodeText.trim()}?orderAmount=${subtotal}`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Code invalide.');
      }
      setCouponData(result);
    } catch (err) {
      setCouponError(err.message);
      setCouponData(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setPromoCodeText('');
    setCouponError('');
  };

  // Récupération des réglages
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, fetchSettings]);

  const subtotal = getTotal();

  // Calcul de la remise du coupon
  let discountAmount = 0;
  if (couponData) {
    if (couponData.type === 'percentage') {
      discountAmount = subtotal * (couponData.value / 100);
    } else if (couponData.type === 'fixed') {
      discountAmount = couponData.value;
    }
  }
  
  // Règle psychologique : Livraison offerte si panier >= Seuil
  const isFreeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = (isFreeShippingEligible && deliveryZone !== 'store') ? 0 : DELIVERY_ZONES[deliveryZone].cost;
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingCost;

  // Calculateur de barre de progression de livraison gratuite
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleOrderSubmit = async (paymentType = 'whatsapp') => {
    if (!customerName || !customerPhone) {
      setFormError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    // Déclencher le suivi du début de commande
    trackInitiateCheckoutEvent(cart, finalTotal);

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: DELIVERY_ZONES[deliveryZone].name, 
      payment_method: paymentType === 'wave' ? 'Wave' : 'WhatsApp / Paiement à la livraison',
      total_amount: finalTotal,
      promo_code: couponData ? couponData.code : null,
      items: cart.map(item => {
        let variantId = item.variant_id || item.variantId || null;
        if (typeof variantId === 'object' && variantId !== null) variantId = variantId.id;

        return {
          id: item.productId || item.product_id || item.id,
          variant_id: variantId,
          quantity: item.quantity,
          price: item.price
        };
      })
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

      if (paymentType === 'wave') {
        triggerWave(result.orderId);
      } else {
        triggerWhatsApp(result.orderId);
      }
    } catch (error) {
      console.error(error);
      if (error.message.includes("Serveur injoignable") || error.message.includes("démonstration")) {
        if (paymentType === 'wave') {
          triggerWave("HORS-LIGNE");
        } else {
          triggerWhatsApp("HORS-LIGNE");
        }
      } else {
        setFormError(error.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerWave = (orderId) => {
    setWaveSummaryData({ orderId });
  };

  const handleContinueToWave = () => {
    const amountToPay = finalTotal;
    // Déclencher le suivi d'achat publicitaire
    trackPurchaseEvent(waveSummaryData.orderId, amountToPay, cart);
    clearCart();
    handleRemoveCoupon();
    setWaveSummaryData(null);
    onClose();
    window.location.href = `https://pay.wave.com/m/M_rDVUEo3vU_Sh/c/sn/?amount=${amountToPay}`;
  };

  const triggerWhatsApp = (orderId) => {
    let message = `*NOUVELLE COMMANDE ${orderId !== "HORS-LIGNE" ? `N°${orderId}` : '(Via Site Web)'}* 🛒\n\n`;
    message += `👤 *Client :* ${customerName}\n`;
    message += `📞 *Téléphone :* ${customerPhone}\n\n`;
    message += `*DÉTAILS DE LA COMMANDE :*\n`;

    cart.forEach((item) => {
      message += `▪️ ${item.quantity}x ${item.name}`;
      if (item.variant) message += ` (${item.variant})`;
      message += ` - ${new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA\n`;
    });

    message += `\n📦 *Livraison :* ${DELIVERY_ZONES[deliveryZone].name} ${shippingCost === 0 ? '(Offerte !)' : `(+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA)`}\n`;
    message += `💰 *TOTAL À PAYER : ${new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA*\n\n`;
    message += `Bonjour, je souhaite confirmer ma commande et planifier ma livraison.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${settings.whatsapp_number}?text=${encodedMessage}`;

    // Déclencher le suivi d'achat publicitaire
    trackPurchaseEvent(orderId, finalTotal, cart);

    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      clearCart();
      handleRemoveCoupon();
      onClose();
      window.location.href = whatsappLink;
    }, 2500);
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sombre */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-brand-gray-dark z-[70] shadow-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
          >
            {/* OVERLAY DE SUCCÈS */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-[80] bg-white dark:bg-brand-gray-dark flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CheckCircle2 size={80} className="text-green-500 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-black dark:text-white mb-2 uppercase tracking-wide">Commande Enregistrée !</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Vous allez être redirigé vers WhatsApp pour finaliser la livraison...</p>
                  <div className="mt-8 flex gap-2">
                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}

              {waveSummaryData && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-[90] bg-white dark:bg-brand-gray-dark flex flex-col h-full"
                >
                  <div className="flex justify-between items-center p-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
                    <h3 className="text-base font-black uppercase tracking-wider dark:text-white">Récapitulatif</h3>
                    <button onClick={() => setWaveSummaryData(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg dark:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-xl shadow-sm border border-gray-150 dark:border-zinc-800 space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Bonjour <span className="font-black text-brand-blue">{customerName}</span>,
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                        Votre commande est prête. Veuillez vérifier les détails ci-dessous avant de procéder au paiement sur Wave.
                      </p>

                      <div className="pt-4 pb-2 border-b border-gray-150 dark:border-zinc-800">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Commande N°</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-wider">
                          {waveSummaryData.orderId !== "HORS-LIGNE" ? `#${waveSummaryData.orderId.toString().padStart(4, '0')}` : 'HORS-LIGNE'}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vos Articles</p>
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs sm:text-sm">
                            <div className="flex-1 pr-4">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{item.quantity}x {item.name}</span>
                              {item.variant && <p className="text-[10px] text-brand-blue uppercase">{item.variant}</p>}
                            </div>
                            <span className="font-black whitespace-nowrap text-gray-800 dark:text-gray-200">
                              {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-150 dark:border-zinc-800">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-400 font-medium">Sous-total</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-400 font-medium">Livraison ({DELIVERY_ZONES[deliveryZone].name})</span>
                          <span className="font-bold text-green-500">{shippingCost > 0 ? `+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA` : 'Offerte !'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-150 dark:border-zinc-800">
                        <span className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">Total à payer</span>
                        <span className="text-lg font-black text-brand-blue">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-150 dark:border-zinc-800 bg-white dark:bg-brand-gray-dark shrink-0 space-y-3">
                    <button
                      onClick={handleContinueToWave}
                      className="w-full bg-[#1cc6ff] hover:bg-[#15aee6] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-wider shadow-lg shadow-[#1cc6ff]/20 hover:scale-102"
                    >
                      Payer avec Wave
                    </button>
                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                      Sécurisé par Wave Payment Services
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-800 pb-4 shrink-0">
              <h2 id="cart-drawer-title" className="text-base sm:text-lg font-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart size={18} className="text-brand-blue" />
                <span>Panier ({cartItemsCount})</span>
              </h2>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
                        clearCart();
                      }
                    }}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest px-2"
                  >
                    Vider
                  </button>
                )}
                <button onClick={onClose} aria-label="Fermer le panier" className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full dark:text-white transition-colors"><X size={20} aria-hidden="true" /></button>
              </div>
            </div>

            {/* ZONE DÉFILANTE (Articles + Formulaire + Total) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 select-none">
              
              {cart.length > 0 && (
                <>
                  {/* BARRE DE PROGRESSION LIVRAISON GRATUITE */}
                  <div className="bg-brand-blue/5 dark:bg-zinc-900/30 p-4 rounded-2xl border border-brand-blue/10 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Truck size={16} className="text-brand-blue shrink-0" />
                      <p className="font-bold text-gray-700 dark:text-gray-300 leading-tight">
                        {isFreeShippingEligible ? (
                          <span className="text-green-500 font-extrabold">Livraison offerte sur votre commande</span>
                        ) : (
                          <>
                            Plus que <span className="text-brand-blue font-extrabold">{new Intl.NumberFormat('fr-FR').format(remainingForFreeShipping)} FCFA</span> pour bénéficier de la livraison gratuite.
                          </>
                        )}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-blue h-full transition-all duration-550 ease-out rounded-full" 
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* ALERTE STOCK */}
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 px-3.5 py-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>Articles non réservés - finalisez pour garantir la disponibilité</span>
                  </div>
                </>
              )}

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-zinc-850">
                    <ShoppingCart size={36} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold dark:text-white mb-2 uppercase tracking-wider">Votre panier est vide</h3>
                  <p className="text-gray-400 dark:text-gray-550 text-xs mb-8 max-w-[240px] mx-auto leading-relaxed">
                    Ajoutez des lunettes de luxe, des montres ou nos parfums exclusifs pour commencer vos achats.
                  </p>
                  <button 
                    onClick={() => { onClose(); navigate('/shop'); }}
                    className="flex items-center justify-center w-full gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/15 text-xs tracking-wider uppercase"
                  >
                    Explorer la Boutique
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const img = item.image_url?.match(/\.(mp4|mov|webm)$/i) ? item.image_url.replace(/\.(mp4|mov|webm)$/i, '.jpg') : item.image_url;
                    return (
                      <div key={item.id} className="flex gap-3 border-b border-gray-100 dark:border-zinc-850 pb-4 items-center">
                        <img 
                          src={img || 'https://placehold.co/60x60/png?text=?'} 
                          alt={item.name} 
                          className="w-14 h-14 object-cover rounded-xl border border-gray-150 dark:border-zinc-800 shrink-0" 
                          onError={e => { e.target.src='https://placehold.co/60x60/png?text=?'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold dark:text-white text-xs truncate leading-snug">{item.name}</h4>
                          {item.variant && <p className="text-[9px] text-brand-blue uppercase font-bold tracking-wider mt-0.5">{item.variant}</p>}
                          <div className="flex justify-between items-center mt-2.5">
                            <div className="flex items-center gap-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-zinc-900/30">
                              <button aria-label="Diminuer" onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 text-sm hover:bg-gray-200/50 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">-</button>
                              <span className="text-xs font-bold dark:text-gray-300 w-4 text-center">{item.quantity}</span>
                              <button aria-label="Augmenter" onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 text-sm hover:bg-gray-200/50 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">+</button>
                            </div>
                            <span className="font-black text-xs text-gray-805 dark:text-gray-200">{new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA</span>
                          </div>
                        </div>
                        <button aria-label={`Supprimer`} onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 border border-transparent rounded-full hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FORMULAIRE & RÉCAPITULATIF */}
              {cart.length > 0 && (
                <div className="space-y-6">
                  {/* FORMULAIRE CLIENT */}
                  <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-850">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informations de livraison</h3>
                    
                    <div>
                      <label htmlFor="customerName" className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Votre Nom Complet</label>
                      <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Pape Moussa" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    
                    <div>
                      <label htmlFor="customerPhone" className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Votre Numéro de Téléphone</label>
                      <input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ex: 77 123 45 67" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    
                    <div>
                      <label htmlFor="deliveryZone" className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Zone de Livraison</label>
                      <select id="deliveryZone" value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm dark:text-white focus:border-brand-blue outline-none transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                        {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                          <option key={key} value={key}>
                            {zone.name} {(isFreeShippingEligible && key !== 'store') ? '(Livraison Offerte !)' : zone.cost > 0 ? `(+${new Intl.NumberFormat('fr-FR').format(zone.cost)} FCFA)` : '(Gratuit)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formError && <p className="text-xs text-center text-red-500 font-bold">{formError}</p>}
                  </div>

                  {/* CODE PROMO */}
                  <div className="space-y-2.5 border-t border-gray-100 dark:border-zinc-850 pt-4">
                    <label htmlFor="promoCode" className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Code Promo</label>
                    <div className="flex gap-2">
                      <input 
                        id="promoCode"
                        type="text" 
                        value={promoCodeText} 
                        onChange={(e) => setPromoCodeText(e.target.value)} 
                        disabled={couponData !== null}
                        placeholder="Ex: BIENVENUE10" 
                        className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs uppercase dark:text-white focus:border-brand-blue outline-none transition-colors" 
                      />
                      {couponData ? (
                        <button 
                          onClick={handleRemoveCoupon}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                          Retirer
                        </button>
                      ) : (
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !promoCodeText.trim()}
                          className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {isValidatingCoupon ? '...' : 'Valider'}
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}
                    {couponData && (
                      <p className="text-[10px] text-green-500 font-bold mt-1">
                        Code promo "{couponData.code}" activé !
                      </p>
                    )}
                  </div>

                  {/* RÉCAPITULATIF DES PRIX */}
                  <div className="space-y-2.5 border-t border-gray-100 dark:border-zinc-850 pt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-zinc-400">
                      <span>Sous-total</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-xs text-green-500">
                        <span>Réduction Code Promo</span>
                        <span className="font-bold">-{new Intl.NumberFormat('fr-FR').format(discountAmount)} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-zinc-400">
                      <span>Frais de livraison</span>
                      {shippingCost === 0 ? (
                        <span className="font-bold text-green-500 uppercase text-[10px] tracking-wider">Gratuit</span>
                      ) : (
                        <span className="font-bold text-gray-800 dark:text-gray-200">+{new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold dark:text-white pt-2.5 border-t border-gray-150 dark:border-zinc-850">
                      <span className="uppercase text-xs tracking-wider">Total Commande</span>
                      <span className="text-brand-blue font-black text-base">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOUTON COMMANDER - FIXE EN BAS */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-gray-150 dark:border-zinc-800 mt-auto shrink-0 space-y-2">
                <button
                  onClick={() => handleOrderSubmit('wave')}
                  disabled={isSubmitting}
                  className="w-full bg-[#1cc6ff] hover:bg-[#15aee6] hover:scale-101 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wider uppercase shadow-md shadow-[#1cc6ff]/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <img src="/Wave.svg" alt="Wave" className="w-5 h-5 object-contain" />
                      Payer par Wave
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOrderSubmit('whatsapp')}
                  disabled={isSubmitting}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] hover:scale-101 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wider uppercase shadow-md shadow-[#25D366]/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <img src="/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 object-contain" />
                      Confirmer via WhatsApp
                    </>
                  )}
                </button>
                
                {/* TRUST SIGNALS */}
                <div className="flex justify-around items-center pt-2 text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider border-t border-gray-100 dark:border-zinc-850/50 mt-2">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-brand-blue" /> Original</span>
                  <span className="flex items-center gap-1"><Lock size={12} className="text-brand-blue" /> Sécurisé</span>
                  <span className="flex items-center gap-1"><Truck size={12} className="text-brand-blue" /> Express</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;