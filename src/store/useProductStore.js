import { create } from 'zustand';
import { apiFetch } from '../components/api';

// --- RICH DEMO DATA ---
const DEMO_PRODUCTS = [
  // ----------- LUNETTES (glasses) -----------
  {
    id: 'glasses-1',
    category: 'glasses',
    subcategory: 'noir_fume',
    brand: 'Ray-Ban',
    name: 'Ray-Ban Aviator Classic',
    base_price: '85000.00',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    variants: [
      { sku: 'RB-AVIATOR', attribute_value: 'Standard', price_modifier: 0, stock_quantity: 15 }
    ]
  },
  {
    id: 'glasses-2',
    category: 'glasses',
    subcategory: 'photogray',
    brand: 'Oakley',
    name: 'Oakley Holbrook',
    base_price: '95000.00',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    variants: [
      { sku: 'OK-HOLBROOK-BLK', attribute_value: 'Noir Mat', price_modifier: 0, stock_quantity: 10 },
      { sku: 'OK-HOLBROOK-BLU', attribute_value: 'Prism Saphir', price_modifier: 15000, stock_quantity: 5 }
    ]
  },
  {
    id: 'glasses-3',
    category: 'glasses',
    subcategory: 'noir_fume',
    brand: 'Tom Ford',
    name: 'Tom Ford Square Sunglasses',
    base_price: '120000.00',
    image_url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    variants: [
      { sku: 'TF-SQR-SUN', attribute_value: 'Standard', price_modifier: 0, stock_quantity: 8 }
    ]
  },

  // ----------- PARFUMERIE (perfume) -----------
  {
    id: 'perf-1',
    category: 'perfume',
    subcategory: 'avec_alcool',
    brand: 'Tom Ford',
    name: 'Oud Wood Eau de Parfum',
    base_price: '160000.00',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'TF-OUD-50', attribute_value: '50ml', price_modifier: 0, stock_quantity: 5 }]
  },
  {
    id: 'perf-2',
    category: 'perfume',
    subcategory: 'sans_alcool',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    base_price: '200000.00',
    image_url: 'https://images.unsplash.com/photo-1616422285623-14bf93f2f0c7?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'MFK-BR540-70', attribute_value: '70ml', price_modifier: 0, stock_quantity: 12 }]
  },
  {
    id: 'perf-3',
    category: 'perfume',
    subcategory: 'avec_alcool',
    brand: 'Creed',
    name: 'Aventus',
    base_price: '195000.00',
    image_url: 'https://images.unsplash.com/photo-1629858607106-9bd6d5254dfb?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'CRD-AVE-100', attribute_value: '100ml', price_modifier: 0, stock_quantity: 8 }]
  },
  {
    id: 'perf-4',
    category: 'perfume',
    subcategory: 'avec_alcool',
    brand: 'Dior',
    name: 'Sauvage Elixir',
    base_price: '120000.00',
    image_url: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&q=80&w=800',
    variants: [{ sku: 'DIOR-SAU-60', attribute_value: '60ml', price_modifier: 0, stock_quantity: 25 }]
  },

  // ----------- MONTRES (watches) -----------
  {
    id: 'watches-1',
    category: 'watches',
    brand: 'Seiko',
    name: 'Seiko 5 Sports',
    base_price: '195000.00',
    image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    variants: [
      { sku: 'SK-5SPORTS', attribute_value: 'Acier', price_modifier: 0, stock_quantity: 8 }
    ]
  },
  {
    id: 'watches-2',
    category: 'watches',
    brand: 'Tissot',
    name: 'Tissot PRX Powermatic 80',
    base_price: '450000.00',
    image_url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop',
    variants: [
      { sku: 'TS-PRX-BLU', attribute_value: 'Cadran Bleu', price_modifier: 0, stock_quantity: 5 },
      { sku: 'TS-PRX-BLK', attribute_value: 'Cadran Noir', price_modifier: 0, stock_quantity: 4 }
    ]
  },

  // ----------- DIVERS (other) -----------
  {
    id: 'other-1',
    category: 'other',
    brand: 'Oraimo',
    name: 'SpaceBuds Beyond Sound',
    base_price: '35000.00',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
    variants: [{ sku: 'OR-SPACEBUDS', attribute_value: 'Standard', price_modifier: 0, stock_quantity: 15 }]
  },
  {
    id: 'other-2',
    category: 'other',
    brand: 'Oraimo',
    name: 'SmartTrimmer Multi-fonction',
    base_price: '18000.00',
    image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=800&auto=format&fit=crop',
    variants: [{ sku: 'OR-TRIMMER', attribute_value: 'Standard', price_modifier: 0, stock_quantity: 10 }]
  }
];

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
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
      const [productsRes, categoriesRes] = await Promise.all([
        apiFetch('/products?limit=1000'),
        apiFetch('/products/categories')
      ]);
      
      let productsData = [];
      if (productsRes.ok) {
        const data = await productsRes.json();
        productsData = data.products || data;
      }
      
      let categoriesData = [];
      if (categoriesRes.ok) {
        categoriesData = await categoriesRes.json();
      }
      
      set({ 
        products: productsData, 
        categories: categoriesData,
        loading: false, 
        isFetching: false, 
        isInitialLoaded: true 
      });
    } catch (err) {
      console.error("Erreur fetchProducts:", err);
      set({ 
        products: DEMO_PRODUCTS, 
        categories: [
          { id: 1, name: 'glasses', slug: 'glasses' },
          { id: 2, name: 'perfume', slug: 'perfume' },
          { id: 3, name: 'watches', slug: 'watches' },
          { id: 4, name: 'other', slug: 'other' }
        ],
        loading: false, 
        isFetching: false, 
        isInitialLoaded: true 
      });
    }
  },

  // Fonction unifiée pour charger toutes les données de l'admin
  fetchAdminData: async (force = false, background = false) => {
    const { isInitialLoaded, isFetching } = get();
    if (!force && (isInitialLoaded || isFetching)) return;

    if (!background) set({ loading: true, error: null });
    set({ isFetching: true });

    try {
      // On lance les appels essentiels en parallèle
      const [productsRes, statsRes, ordersRes, categoriesRes] = await Promise.all([
        apiFetch('/products?limit=1000'),
        apiFetch('/products/stats'),
        apiFetch('/orders'),
        apiFetch('/products/categories')
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

      let categoriesData = [];
      if (categoriesRes.ok) {
        categoriesData = await categoriesRes.json();
      }

      set({ 
        products: productsData, 
        stats: statsData, 
        orders: ordersData,
        categories: categoriesData,
        loading: false, 
        isFetching: false, 
        isInitialLoaded: true 
      });
    } catch (err) {
      console.error("Échec du chargement Admin - Mode Démo activé:", err);
      set({ 
        products: DEMO_PRODUCTS, 
        categories: [
          { id: 1, name: 'glasses', slug: 'glasses' },
          { id: 2, name: 'perfume', slug: 'perfume' },
          { id: 3, name: 'watches', slug: 'watches' },
          { id: 4, name: 'other', slug: 'other' }
        ],
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
  },

  addCategory: async (categoryData) => {
    try {
      const response = await apiFetch('/products/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      if (!response.ok) throw new Error("Erreur lors de l'ajout de la catégorie");
      await get().fetchAdminData(true);
      return true;
    } catch (err) {
      console.error("Échec de la création de la catégorie :", err);
      return false;
    }
  }
}));
