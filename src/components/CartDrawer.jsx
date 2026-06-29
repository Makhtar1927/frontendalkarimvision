import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MessageCircle, Loader2, CheckCircle2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { apiFetch } from './api';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, getTotal, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();

  // États pour les réglages dynamiques
  const [settings, setSettings] = useState({
    whatsapp_number: "221784379462",
    delivery_cost_dakar: 2000,
    delivery_cost_suburbs: 3000,
    delivery_cost_regions: 5000
  });

  // 1. Tarifs de livraison par zone (Mapés sur les réglages)
  const DELIVERY_ZONES = {
    'dakar': { name: 'Dakar', cost: Number(settings.delivery_cost_dakar) || 0 },
    'suburbs': { name: 'Banlieue / Hors Dakar', cost: Number(settings.delivery_cost_suburbs) || 0 },
    'regions': { name: 'Régions (Sénégal)', cost: Number(settings.delivery_cost_regions) || 0 },
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

  const subtotal = getTotal();
  const shippingCost = DELIVERY_ZONES[deliveryZone].cost;
  const finalTotal = subtotal + shippingCost;

  const handleOrderSubmit = async (paymentType = 'whatsapp') => {
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
      payment_method: paymentType === 'wave' ? 'Wave' : 'WhatsApp / Paiement à la livraison',
      total_amount: finalTotal, // On envoie le montant TTC (avec livraison)
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

      if (paymentType === 'wave') {
        triggerWave(result.orderId);
      } else {
        triggerWhatsApp(result.orderId);
      }
    } catch (error) {
      console.error(error);
      // MODE HORS-LIGNE : Si le serveur est injoignable ou s'il s'agit d'une démo, on sécurise la vente en envoyant quand même le WhatsApp/Wave !
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
    clearCart();
    setWaveSummaryData(null);
    onClose();
    window.location.href = `https://pay.wave.com/m/M_VdELf5tD6Zki/c/sn/?amount=${amountToPay}`;
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-brand-gray-dark z-[70] shadow-2xl p-4 sm:p-6 flex flex-col overflow-hidden"
          >
            {/* OVERLAY DE SUCCÈS */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[80] bg-white dark:bg-brand-gray-dark flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <CheckCircle2 size={100} className="text-green-500 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-sans font-black dark:text-white mb-2">Commande Transmise !</h3>
                  <p className="text-gray-500 dark:text-gray-400">Confirmation en cours sur WhatsApp...</p>
                  <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                    <h3 className="text-xl font-bold dark:text-white">Récapitulatif</h3>
                    <button onClick={() => setWaveSummaryData(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg dark:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="bg-white dark:bg-zinc-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        Bonjour <span className="font-bold">{customerName}</span>,
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Votre commande a été préparée avec succès. Veuillez vérifier les détails ci-dessous avant de procéder au paiement.
                      </p>

                      <div className="pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Numéro de commande</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-wider">
                          {waveSummaryData.orderId !== "HORS-LIGNE" ? `N°${waveSummaryData.orderId}` : 'HORS-LIGNE'}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Articles commandés</p>
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <div className="flex-1 pr-4">
                              <span className="font-medium text-gray-800 dark:text-gray-200">{item.quantity}x {item.name}</span>
                              {item.variant && <p className="text-xs text-gray-500 dark:text-gray-400">{item.variant}</p>}
                            </div>
                            <span className="font-bold whitespace-nowrap text-gray-800 dark:text-gray-200">
                              {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sous-total</span>
                          <span className="dark:text-gray-300">{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Livraison ({DELIVERY_ZONES[deliveryZone].name})</span>
                          <span className="dark:text-gray-300">{shippingCost > 0 ? `+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA` : 'Gratuit'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Total à payer</span>
                        <span className="text-xl font-black text-brand-blue">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-150 dark:border-zinc-800 bg-white dark:bg-brand-gray-dark shrink-0 space-y-3">
                    <button
                      onClick={handleContinueToWave}
                      className="w-full bg-[#1cc6ff] hover:bg-[#15aee6] text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-3 transition-all text-base shadow-lg shadow-[#1cc6ff]/20"
                    >
                      CONTINUER VERS WAVE
                    </button>
                    <p className="text-xs text-center text-gray-400">
                      Vous serez redirigé vers l'application Wave de manière sécurisée
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-800 pb-4 shrink-0">
              <h2 id="cart-drawer-title" className="text-xl font-sans font-black dark:text-white uppercase tracking-wider">Votre Panier</h2>
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
                <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-12">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600">
                    <ShoppingCart size={48} strokeWidth={1} />
                  </div>
                  <h3 className="text-lg font-sans font-bold dark:text-white mb-2">Votre panier est vide</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-8 max-w-[250px] mx-auto leading-relaxed">
                    Découvrez nos collections d'iPhones, de parfums de luxe et notre sélection de café.
                  </p>
                  <button 
                    onClick={() => { onClose(); navigate('/shop'); }}
                    className="flex items-center justify-center w-full gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-50 text-white dark:text-gray-900 px-8 py-3.5 rounded-lg font-bold transition-all shadow-sm text-xs tracking-wider uppercase"
                  >
                    Explorer la Boutique
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-150 dark:border-zinc-800 pb-4">
                      <div className="flex-1">
                        <h4 className="font-bold dark:text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-brand-blue uppercase tracking-tighter">{item.variant}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-800 rounded-lg">
                            <button aria-label="Diminuer la quantité" onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 md:px-3 md:py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">-</button>
                            <span className="text-sm font-medium dark:text-gray-300 w-4 text-center">{item.quantity}</span>
                            <button aria-label="Augmenter la quantité" onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 md:px-3 md:py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300 transition-colors">+</button>
                          </div>
                          <span className="font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA</span>
                        </div>
                      </div>
                      <button aria-label={`Supprimer ${item.name} du panier`} onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 self-start border border-transparent rounded-full">
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
                      <label htmlFor="customerName" className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom Complet</label>
                      <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Pape Moussa" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-base md:text-sm dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Numéro de Téléphone</label>
                      <input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ex: 77 123 45 67" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-base md:text-sm dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="deliveryZone" className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Zone de Livraison</label>
                      <select id="deliveryZone" value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-base md:text-sm dark:text-white focus:border-brand-blue outline-none transition-colors cursor-pointer text-gray-700 dark:text-gray-300">
                        {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                          <option key={key} value={key}>
                            {zone.name} {zone.cost > 0 ? `(+${new Intl.NumberFormat('fr-FR').format(zone.cost)} FCFA)` : '(Gratuit)'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formError && <p className="text-xs text-center text-red-500">{formError}</p>}
                  </div>

                  {/* RÉCAPITULATIF DES PRIX */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 pb-2">
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Sous-total</span>
                      <span>{new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Frais de livraison</span>
                      <span>{shippingCost > 0 ? `+${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA` : 'Offerts'}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold dark:text-white pt-2 border-t border-gray-150 dark:border-zinc-800">
                      <span>Total TTC</span>
                      <span className="text-brand-blue">{new Intl.NumberFormat('fr-FR').format(finalTotal)} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOUTON COMMANDER - FIXE EN BAS */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-gray-150 dark:border-zinc-800 mt-auto shrink-0 space-y-3">
                <button
                  onClick={() => handleOrderSubmit('wave')}
                  disabled={isSubmitting}
                  className="w-full bg-[#1cc6ff] hover:bg-[#15aee6] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wider uppercase"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      ENREGISTREMENT...
                    </>
                  ) : (
                    <>
                      <img src="/Wave.svg" alt="Wave" className="w-5 h-5 object-contain" />
                      PAYER AVEC WAVE
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOrderSubmit('whatsapp')}
                  disabled={isSubmitting}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wider uppercase"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      ENREGISTREMENT...
                    </>
                  ) : (
                    <>
                      <img src="/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 object-contain" />
                      COMMANDER SUR WHATSAPP
                    </>
                  )}
                </button>
                <p className="text-[9px] text-center text-gray-400 uppercase tracking-widest pb-1">Paiement 100% sécurisé</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;