import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { apiFetch } from './api';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, getTotal, removeFromCart, updateQuantity, clearCart } = useCartStore();

  // États pour les réglages dynamiques
  const [settings, setSettings] = useState({
    whatsapp_number: "221774133645",
    delivery_cost_dakar: 2000,
    delivery_cost_suburbs: 3000,
    delivery_cost_regions: 5000
  });

  // 1. Tarifs de livraison par zone (Mapés sur les réglages)
  const DELIVERY_ZONES = {
    'dakar': { name: 'Dakar', cost: settings.delivery_cost_dakar },
    'suburbs': { name: 'Banlieue / Hors Dakar', cost: settings.delivery_cost_suburbs },
    'regions': { name: 'Régions (Sénégal)', cost: settings.delivery_cost_regions },
    'store': { name: 'Retrait en Magasin', cost: 0 }
  };

  // États pour le formulaire et le chargement
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('dakar'); // Zone par défaut

  // --- RÉCUPÉRATION DES RÉGLAGES ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Erreur settings cart:", err);
      }
    };
    if (isOpen) loadSettings();
  }, [isOpen]);

  // --- GESTION DES CODES PROMO ---
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState({ type: '', text: '' });

  const VALID_PROMOS = {
    'VIP10': { type: 'percent', value: 10, description: '10% de remise' },
    'WELCOME5': { type: 'fixed', value: 5000, description: '-5 000 FCFA' }
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setAppliedPromo({ code, ...VALID_PROMOS[code] });
      setPromoMessage({ type: 'success', text: `Code appliqué : ${VALID_PROMOS[code].description}` });
    } else {
      setAppliedPromo(null);
      setPromoMessage({ type: 'error', text: 'Code promo invalide ou expiré.' });
    }
  };

  const subtotal = getTotal();
  const shippingCost = DELIVERY_ZONES[deliveryZone].cost;
  
  // Calcul de la remise
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount = appliedPromo.type === 'percent' ? (subtotal * appliedPromo.value) / 100 : appliedPromo.value;
  }
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleOrderSubmit = async () => {
    if (!customerName || !customerPhone) {
      setFormError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: DELIVERY_ZONES[deliveryZone].name, // Sauvegardé en base de données
      payment_method: 'WhatsApp / Paiement à la livraison',
      total_amount: finalTotal, // On envoie le montant TTC (avec livraison)
      promo_code: appliedPromo ? appliedPromo.code : null, // On transmet le code au backend
      items: cart.map(item => {
        // Détection robuste au cas où la variante est stockée comme un objet complet
        let variantId = item.variant_id || item.variantId || null;
        if (typeof variantId === 'object' && variantId !== null) variantId = variantId.id;
        
        return {
          id: item.productId || item.product_id || item.id, // Extraction garantie de l'ID produit
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

      triggerWhatsApp(result.orderId);
    } catch (error) {
      console.error(error);
      // MODE HORS-LIGNE : Si le serveur est injoignable ou s'il s'agit d'une démo, on sécurise la vente en envoyant quand même le WhatsApp !
      if (error.message.includes("Serveur injoignable") || error.message.includes("démonstration")) {
        triggerWhatsApp("HORS-LIGNE");
      } else {
        setFormError(error.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
      
      if (appliedPromo) {
        message += `\n🎟️ *Code Promo (${appliedPromo.code}) :* -${new Intl.NumberFormat('fr-FR').format(discountAmount)} FCFA`;
      }
      message += `\n📦 *Livraison :* ${DELIVERY_ZONES[deliveryZone].name} (+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA)\n`;
      message += `💰 *TOTAL À PAYER : ${new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA*\n\n`;
      message += `Bonjour BoustaneTech Store, je souhaite confirmer ma commande.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${settings.whatsapp_number}?text=${encodedMessage}`;
      
      // Afficher le succès pendant 2 secondes avant de fermer
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        clearCart();
        onClose();
        window.location.href = whatsappLink;
      }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sombre */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm cursor-pointer"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-bustantech-black z-[70] shadow-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
          >
            {/* OVERLAY DE SUCCÈS */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[80] bg-white dark:bg-bustantech-black flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <CheckCircle2 size={100} className="text-green-500 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-luxury font-bold dark:text-white mb-2">Commande Transmise !</h3>
                  <p className="text-gray-500 dark:text-gray-400">Confirmation en cours sur WhatsApp...</p>
                  <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-bustantech-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-bustantech-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-bustantech-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between items-center border-b border-bustantech-gold/20 pb-4 shrink-0">
              <h2 id="cart-drawer-title" className="text-2xl font-luxury font-bold dark:text-white">Votre Panier</h2>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button 
                    onClick={() => {
                      if (window.confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
                        clearCart();
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest px-2"
                  >
                    Vider
                  </button>
                )}
                <button onClick={onClose} aria-label="Fermer le panier" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-white transition-colors"><X aria-hidden="true" /></button>
              </div>
            </div>

            {/* ZONE DÉFILANTE (Articles + Formulaire + Total) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Votre panier est vide.</p>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-50 dark:border-gray-800 pb-4">
                      <div className="flex-1">
                        <h4 className="font-bold dark:text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-bustantech-gold uppercase tracking-tighter">{item.variant}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-sm">
                            <button aria-label="Diminuer la quantité" onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 md:px-3 md:py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">-</button>
                            <span className="text-sm font-medium dark:text-gray-300 w-4 text-center">{item.quantity}</span>
                            <button aria-label="Augmenter la quantité" onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 md:px-3 md:py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">+</button>
                          </div>
                          <span className="font-bold text-bustantech-gold">{new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA</span>
                        </div>
                      </div>
                      <button aria-label={`Supprimer ${item.name} du panier`} onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 self-start border border-transparent rounded-md">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULAIRE & RÉCAPITULATIF */}
              {cart.length > 0 && (
                <div className="space-y-6">
                  {/* FORMULAIRE CLIENT */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label htmlFor="customerName" className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom Complet</label>
                      <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Pape Moussa" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm px-4 py-3 text-base md:text-sm dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Numéro de Téléphone</label>
                      <input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ex: 77 123 45 67" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm px-4 py-3 text-base md:text-sm dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="deliveryZone" className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Zone de Livraison</label>
                      <select id="deliveryZone" value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm px-4 py-3 text-base md:text-sm dark:text-white focus:border-bustantech-gold outline-none transition-colors cursor-pointer">
                        {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                          <option key={key} value={key}>
                            {zone.name} {zone.cost > 0 ? `(+${new Intl.NumberFormat('fr-FR').format(zone.cost)} FCFA)` : '(Gratuit)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formError && <p className="text-xs text-center text-red-500">{formError}</p>}
                  </div>

                  {/* CHAMP CODE PROMO */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput} 
                        onChange={(e) => setPromoCodeInput(e.target.value)} 
                        placeholder="Code promo (Optionnel)" 
                        className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm px-4 py-3 text-base md:text-sm dark:text-white focus:border-bustantech-gold outline-none transition-colors uppercase" 
                      />
                      <button type="button" onClick={handleApplyPromo} disabled={!promoCodeInput.trim()} className="px-4 py-2 bg-bustantech-black dark:bg-zinc-800 text-white rounded-sm font-bold text-xs hover:bg-bustantech-gold transition-colors disabled:opacity-50">
                        APPLIQUER
                      </button>
                    </div>
                    {promoMessage.text && (
                      <p className={`text-xs mt-2 font-bold ${promoMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{promoMessage.text}</p>
                    )}
                  </div>

                  {/* RÉCAPITULATIF DES PRIX */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 pb-2">
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Sous-total</span>
                      <span>{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm font-bold text-green-600 dark:text-green-500">
                        <span>Remise ({appliedPromo.code})</span>
                        <span>-{new Intl.NumberFormat('fr-FR').format(discountAmount)} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Frais de livraison</span>
                      <span>{shippingCost > 0 ? `+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA` : 'Offerts'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span>Total TTC</span>
                      <span className="text-bustantech-gold">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOUTON COMMANDER - FIXE EN BAS */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto shrink-0 space-y-3">
              <button 
                onClick={handleOrderSubmit}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-sm font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    ENREGISTREMENT...
                  </>
                ) : (
                  <>
                    <MessageCircle size={22} />
                    COMMANDER SUR WHATSAPP
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest pb-1">Paiement à la livraison ou via Wave/Orange Money</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;