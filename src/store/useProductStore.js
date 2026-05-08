import { create } from 'zustand';
import { apiFetch } from '../components/api';

// --- RICH DEMO DATA ---
const DEMO_PRODUCTS = [
  // ----------- iPHONES (tech) -----------
  {
    id: 'tech-1',
    category: 'tech',
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    base_price: '1479.00',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    variants: [
      { sku: 'IP15PM-256', attribute_value: '256 Go', price_modifier: 0, stock_quantity: 10 },
      { sku: 'IP15PM-512', attribute_value: '512 Go', price_modifier: 250, stock_quantity: 5 },
      { sku: 'IP15PM-1TB', attribute_value: '1 To', price_modifier: 500, stock_quantity: 2 }
    ]
  },
  {
    id: 'tech-2',
    category: 'tech',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    base_price: '1229.00',
    image_url: 'https://images.unsplash.com/photo-1695048132717-d2e7a3b302c3?auto=format&fit=crop&q=80&w=800',
    variants: [
      { sku: 'IP15P-128', attribute_value: '128 Go', price_modifier: 0, stock_quantity: 15 },
      { sku: 'IP15P-256', attribute_value: '256 Go', price_modifier: 130, stock_quantity: 8 }
    ]
  },
  {
    id: 'tech-3',
    category: 'tech',
    brand: 'Apple',
    name: 'iPhone 14 Pro Max',
    base_price: '1149.00',
    image_url: 'https://images.unsplash.com/photo-1663465373017-b08e70aee1ad?auto=format&fit=crop&q=80&w=800',
    variants: [
      { sku: 'IP14PM-128', attribute_value: '128 Go', price_modifier: 0, stock_quantity: 3 }
    ]
  },
  {
    id: 'tech-4',
    category: 'tech',
    brand: 'Apple',
    name: 'iPhone 13',
    base_price: '749.00',
    image_url: 'https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=800',
    variants: [
      { sku: 'IP13-128', attribute_value: '128 Go', price_modifier: 0, stock_quantity: 20 }
    ]
  },

  // ----------- PARFUMERIE (perfume) -----------
  {
    id: 'perf-1',
    category: 'perfume',
    brand: 'Tom Ford',
    name: 'Oud Wood Eau de Parfum',
    base_price: '245.00',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'TF-OUD-50', attribute_value: '50ml', price_modifier: 0, stock_quantity: 5 }]
  },
  {
    id: 'perf-2',
    category: 'perfume',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    base_price: '305.00',
    image_url: 'https://images.unsplash.com/photo-1616422285623-14bf93f2f0c7?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'MFK-BR540-70', attribute_value: '70ml', price_modifier: 0, stock_quantity: 12 }]
  },
  {
    id: 'perf-3',
    category: 'perfume',
    brand: 'Creed',
    name: 'Aventus',
    base_price: '295.00',
    image_url: 'https://images.unsplash.com/photo-1629858607106-9bd6d5254dfb?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'CRD-AVE-100', attribute_value: '100ml', price_modifier: 0, stock_quantity: 8 }]
  },
  {
    id: 'perf-4',
    category: 'perfume',
    brand: 'Dior',
    name: 'Sauvage Elixir',
    base_price: '185.00',
    image_url: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'DIOR-SAU-60', attribute_value: '60ml', price_modifier: 0, stock_quantity: 25 }]
  },
  {
    id: 'perf-5',
    category: 'perfume',
    brand: 'Byredo',
    name: 'Gypsy Water',
    base_price: '190.00',
    image_url: 'https://images.unsplash.com/photo-1595425970377-c9703bc48baf?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'BYR-GYP-100', attribute_value: '100ml', price_modifier: 0, stock_quantity: 4 }]
  },

  // ----------- CAFÉ (coffee) STRICTLY POWDER / 1KG ONLY -----------
  {
    id: 'cof-1',
    category: 'coffee',
    brand: 'BoustaneTech Roasters',
    name: 'Éthiopie Yirgacheffe (Mouture Fine)',
    base_price: '38.00',
    image_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'COF-ETH-1KG', attribute_value: '1 KG - Poudre', price_modifier: 0, stock_quantity: 40 }]
  },
  {
    id: 'cof-2',
    category: 'coffee',
    brand: 'BoustaneTech Roasters',
    name: 'Colombie Supremo (Mouture Espresso)',
    base_price: '34.00',
    image_url: 'https://images.unsplash.com/photo-1610632380989-680fe0659131?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'COF-COL-1KG', attribute_value: '1 KG - Poudre', price_modifier: 0, stock_quantity: 15 }]
  },
  {
    id: 'cof-3',
    category: 'coffee',
    brand: 'BoustaneTech Premium',
    name: 'Blue Mountain Blend (Mouture Filtre)',
    base_price: '65.00',
    image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'COF-JMB-1KG', attribute_value: '1 KG - Poudre', price_modifier: 0, stock_quantity: 2 }]
  }
];

export const useProductStore = create((set, get) => ({
  products: [],
  stats: { graph: [], categorySales: [], kpi: { revenusMois: 0, commandesMois: 0 } },
  currentProduct: null,
  orders: [],
  loading: false,
  isFetching: false,
  isFetchingStats: false,
  isFetchingOrders: false,
  isInitialLoaded: false,
  error: null,

  // Récupérer uniquement les produits (utilisé par la Navbar pour la recherche)
  fetchProducts: async () => {
    const { isInitialLoaded, isFetching } = get();
    if (isInitialLoaded || isFetching) return;
    
    set({ loading: true, isFetching: true, error: null });
    
    try {
      const response = await apiFetch('/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        set({ 
          products: data.products || data, 
          loading: false, 
          isFetching: false, 
          isInitialLoaded: true 
        });
      }
    } catch (err) {
      console.error("Erreur fetchProducts:", err);
      set({ products: DEMO_PRODUCTS, loading: false, isFetching: false, isInitialLoaded: true });
    }
  },

  // Fonction unifiée pour charger toutes les données de l'admin
  fetchAdminData: async (force = false) => {
    const { isInitialLoaded, isFetching } = get();
    if (!force && (isInitialLoaded || isFetching)) return;

    set({ loading: true, isFetching: true, error: null });

    try {
      // On lance les appels essentiels en parallèle
      const [productsRes, statsRes, ordersRes] = await Promise.all([
        apiFetch('/products?limit=1000'),
        apiFetch('/products/stats'),
        apiFetch('/orders')
      ]);

      let productsData = DEMO_PRODUCTS;
      if (productsRes.ok) {
        const data = await productsRes.json();
        productsData = data.products || data;
      }

      let statsData = get().stats;
      if (statsRes.ok) {
        statsData = await statsRes.json();
      }

      let ordersData = get().orders;
      if (ordersRes.ok) {
        ordersData = await ordersRes.json();
      }

      set({ 
        products: productsData, 
        stats: statsData, 
        orders: ordersData,
        loading: false, 
        isFetching: false, 
        isInitialLoaded: true 
      });
    } catch (err) {
      console.error("Échec du chargement Admin - Mode Démo activé:", err);
      set({ 
        products: DEMO_PRODUCTS, 
        loading: false, 
        isFetching: false, 
        isInitialLoaded: true 
      });
    }
  },
  
  fetchStats: async () => {
    if (get().isFetchingStats) return;
    set({ isFetchingStats: true });
    try {
      const response = await apiFetch('/products/stats');
      if (response.ok) {
        const data = await response.json();
        set({ stats: data, isFetchingStats: false });
      } else {
        set({ isFetchingStats: false });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err);
      set({ isFetchingStats: false });
    }
  },

  fetchOrders: async () => {
    if (get().isFetchingOrders) return;
    set({ isFetchingOrders: true });
    try {
      const response = await apiFetch('/orders');
      if (response.ok) {
        const data = await response.json();
        set({ orders: data, isFetchingOrders: false });
      } else {
        set({ isFetchingOrders: false });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
      set({ isFetchingOrders: false });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null, currentProduct: null });
    try {
      const response = await apiFetch(`/products/${id}`);
      if (!response.ok) throw new Error("Produit introuvable");
      const data = await response.json();
      set({ currentProduct: data, loading: false });
    } catch (err) {
      console.error("Erreur lors de la récupération du produit:", err);
      set({ error: err.message, loading: false });
    }
  },

  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  getProductsByCategory: (categoryId) => {
    return get().products.filter(p => p.category === categoryId);
  },
  
  // Fonction d'Admin Réelle (Envoi du FormData vers le Backend)
  addProduct: async (formData) => {
    try {
      const response = await apiFetch('/products', {
        method: 'POST',
        body: formData // Le Content-Type multipart/form-data sera géré automatiquement
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'ajout du produit");
      
      // Recharge les données pour s'assurer de l'intégrité (statistiques, db relationships)
      await get().fetchAdminData(true);
      return true;
    } catch (err) {
      console.error("Échec de la création du produit :", err);
      return false;
    }
  },
  
  updateProduct: async (id, formData) => {
    try {
      const response = await apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: formData // Le Content-Type multipart/form-data sera géré automatiquement
      });
      
      if (!response.ok) throw new Error("Erreur lors de la modification du produit");
      
      // Recharge les données et statistiques (au cas où le prix/catégorie change la stat)
      await get().fetchAdminData(true);
      return true;
    } catch (err) {
      console.error("Échec de la modification :", err);
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await apiFetch(`/products/${id}`, {
        method: 'DELETE',
      });
      
      // Recharge depuis la base de données
      await get().fetchAdminData(true);
      return true;
    } catch (err) {
      console.error("Échec de la suppression :", err);
      return false;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");
      const data = await response.json();
      set(state => ({ orders: state.orders.map(o => o.id === id ? data.order : o) }));
      return true;
    } catch (err) {
      console.error("Échec de la mise à jour du statut :", err);
      return false;
    }
  }
}));
