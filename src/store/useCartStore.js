import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  
  addToCart: (product, variant) => {
    const currentCart = get().cart;
    const safeVariant = variant || product.variants?.[0] || { id: null, sku: 'standard', attribute_value: 'Standard', price_modifier: 0 };
    const itemIdentifier = `${product.id}-${safeVariant.sku}`;
    
    const existingItem = currentCart.find(item => item.id === itemIdentifier);
    
    if (existingItem) {
      set({ 
        cart: currentCart.map(item => 
          item.id === itemIdentifier ? { ...item, quantity: item.quantity + 1 } : item
        )
      });
    } else {
      set({ 
        cart: [...currentCart, { 
          id: itemIdentifier,
          productId: product.id,
          variantId: safeVariant.id,
          name: product.name, 
          variant: safeVariant.attribute_value,
          price: parseFloat(product.base_price) + parseFloat(safeVariant.price_modifier || 0),
          quantity: 1,
          sku: safeVariant.sku
        }]
      });
    }
  },

  // Retirer du panier
  removeFromCart: (itemIdentifier) => {
    set({ cart: get().cart.filter(item => item.id !== itemIdentifier) });
  },

  // Modifier la quantité
  updateQuantity: (itemIdentifier, delta) => {
    set({
      cart: get().cart.map(item => {
        if (item.id === itemIdentifier) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    });
  },

  // Vider le panier
  clearCart: () => set({ cart: [] }),

  // Calculer le total
  getTotal: () => {
    return get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  },

  // GÉNÉRER LE LIEN WHATSAPP (L'Intelligence du projet)
  generateWhatsAppLink: (phoneNumber) => {
    const cart = get().cart;
    const total = get().getTotal();
    
    let message = `*COMMANDE BoustaneTech Store*\n`;
    message += `---------------------------\n`;
    
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} (${item.variant})\n`;
      message += `  _SKU: ${item.sku}_ | *${(item.price * item.quantity).toFixed(2)}€*\n\n`;
    });
    
    message += `---------------------------\n`;
    message += `*TOTAL À PAYER : ${total.toFixed(2)}€*\n\n`;
    message += `_Merci de confirmer ma commande pour la livraison._`;

    // Encodage pour URL
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
}));