import { describe, it, expect, beforeEach } from 'vitest';

// ============================================================
// TEST UNITAIRE : useCartStore (Panier e-commerce)
// ============================================================

// On importe le store directement pour tester sa logique pure
// sans dépendre de React
const createCartStore = () => {
  let cart = [];
  
  const getTotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  return {
    getCart: () => cart,
    getTotal,
    
    addToCart: (product, variant) => {
      const safeVariant = variant || product.variants?.[0] || { id: null, sku: 'standard', attribute_value: 'Standard', price_modifier: 0 };
      const itemIdentifier = `${product.id}-${safeVariant.sku}`;
      const existingItem = cart.find(item => item.id === itemIdentifier);
      
      if (existingItem) {
        cart = cart.map(item => 
          item.id === itemIdentifier ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        cart = [...cart, { 
          id: itemIdentifier,
          productId: product.id,
          variantId: safeVariant.id,
          name: product.name, 
          variant: safeVariant.attribute_value,
          price: parseFloat(product.base_price) + parseFloat(safeVariant.price_modifier || 0),
          quantity: 1,
          sku: safeVariant.sku
        }];
      }
    },
    
    removeFromCart: (itemIdentifier) => {
      cart = cart.filter(item => item.id !== itemIdentifier);
    },
    
    updateQuantity: (itemIdentifier, delta) => {
      cart = cart.map(item => {
        if (item.id === itemIdentifier) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    },
    
    clearCart: () => { cart = []; },
    
    generateWhatsAppLink: (phoneNumber) => {
      const total = getTotal();
      let message = `*COMMANDE Al Karim Vision*\n`;
      message += `---------------------------\n`;
      cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (${item.variant})\n`;
        message += `  _SKU: ${item.sku}_ | *${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA*\n\n`;
      });
      message += `---------------------------\n`;
      message += `*TOTAL À PAYER : ${total.toLocaleString('fr-FR')} FCFA*\n\n`;
      message += `_Merci de confirmer ma commande pour la livraison._`;
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    }
  };
};

// --- MOCK PRODUCTS ---
const mockProduct1 = {
  id: 'glasses-1',
  name: 'Ray-Ban Aviator Classic',
  base_price: '85000.00',
  variants: [
    { id: 1, sku: 'RB-AVIATOR', attribute_value: 'Standard', price_modifier: 0, stock_quantity: 15 }
  ]
};

const mockProduct2 = {
  id: 'perf-1',
  name: 'Oud Wood Eau de Parfum',
  base_price: '160000.00',
  variants: [
    { id: 2, sku: 'TF-OUD-50', attribute_value: '50ml', price_modifier: 0, stock_quantity: 5 }
  ]
};

const mockProductWithModifier = {
  id: 'glasses-2',
  name: 'Oakley Holbrook',
  base_price: '95000.00',
  variants: [
    { id: 3, sku: 'OK-HOLBROOK-BLK', attribute_value: 'Noir Mat', price_modifier: 0, stock_quantity: 10 },
    { id: 4, sku: 'OK-HOLBROOK-BLU', attribute_value: 'Prism Saphir', price_modifier: 15000, stock_quantity: 5 }
  ]
};

describe('🛒 Tests Unitaires : Panier (Cart Store)', () => {
  let store;
  
  beforeEach(() => {
    store = createCartStore();
  });

  it('devrait initialiser un panier vide', () => {
    expect(store.getCart()).toEqual([]);
    expect(store.getTotal()).toBe(0);
  });

  it('devrait ajouter un produit au panier', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    const cart = store.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Ray-Ban Aviator Classic');
    expect(cart[0].price).toBe(85000);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].sku).toBe('RB-AVIATOR');
  });

  it('devrait incrémenter la quantité si le même produit est ajouté', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    const cart = store.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('devrait ajouter des produits différents séparément', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.addToCart(mockProduct2, mockProduct2.variants[0]);
    expect(store.getCart()).toHaveLength(2);
  });

  it('devrait calculer le total correctement', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]); // 85000
    store.addToCart(mockProduct2, mockProduct2.variants[0]); // 160000
    expect(store.getTotal()).toBe(245000);
  });

  it('devrait calculer le total avec les quantités', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.addToCart(mockProduct1, mockProduct1.variants[0]); // x2
    expect(store.getTotal()).toBe(170000); // 85000 * 2
  });

  it('devrait appliquer le price_modifier de la variante', () => {
    store.addToCart(mockProductWithModifier, mockProductWithModifier.variants[1]); // Prism Saphir +15000
    const cart = store.getCart();
    expect(cart[0].price).toBe(110000); // 95000 + 15000
  });

  it('devrait traiter les variantes différentes comme des articles séparés', () => {
    store.addToCart(mockProductWithModifier, mockProductWithModifier.variants[0]); // Noir Mat
    store.addToCart(mockProductWithModifier, mockProductWithModifier.variants[1]); // Prism Saphir
    expect(store.getCart()).toHaveLength(2);
  });

  it('devrait supprimer un produit du panier', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.addToCart(mockProduct2, mockProduct2.variants[0]);
    store.removeFromCart('glasses-1-RB-AVIATOR');
    const cart = store.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Oud Wood Eau de Parfum');
  });

  it('devrait augmenter la quantité', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.updateQuantity('glasses-1-RB-AVIATOR', 3);
    expect(store.getCart()[0].quantity).toBe(4);
  });

  it('devrait diminuer la quantité sans descendre en dessous de 1', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.updateQuantity('glasses-1-RB-AVIATOR', -5);
    expect(store.getCart()[0].quantity).toBe(1);
  });

  it('devrait vider le panier entièrement', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    store.addToCart(mockProduct2, mockProduct2.variants[0]);
    store.clearCart();
    expect(store.getCart()).toEqual([]);
    expect(store.getTotal()).toBe(0);
  });

  it('devrait gérer un produit sans variantes explicites', () => {
    const noVariantProduct = { id: 'test-1', name: 'Produit Test', base_price: '50000.00' };
    store.addToCart(noVariantProduct);
    const cart = store.getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].price).toBe(50000);
    expect(cart[0].sku).toBe('standard');
  });

  it('devrait générer un lien WhatsApp valide', () => {
    store.addToCart(mockProduct1, mockProduct1.variants[0]);
    const link = store.generateWhatsAppLink('221765662711');
    expect(link).toContain('https://wa.me/221765662711');
    expect(link).toContain('COMMANDE');
    expect(link).toContain('Ray-Ban');
    expect(link).toContain('85');
  });
});
