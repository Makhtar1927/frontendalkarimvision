import { create } from 'zustand';
import { apiFetch } from '../components/api';

// Mode Production : Pas de données de démonstration.


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
  settings: null,
  isFetchingSettings: false,

  // Récupérer la configuration globale (cachable au niveau client)
  fetchSettings: async (force = false) => {
    const { settings, isFetchingSettings } = get();
    if (!force && (settings || isFetchingSettings)) return settings;
    
    set({ isFetchingSettings: true });
    try {
      const response = await apiFetch('/settings');
      if (response.ok) {
        const data = await response.json();
        set({ settings: data, isFetchingSettings: false });
        return data;
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des paramètres:", err);
    }
    set({ isFetchingSettings: false });
    return get().settings;
  },

  // Récupérer uniquement les produits (utilisé par la Navbar pour la recherche)
  fetchProducts: async (force = false) => {
    const { isInitialLoaded, isFetching } = get();
    if (!force && (isInitialLoaded || isFetching)) return;
    
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
        products: [], 
        categories: get().categories.length > 0 ? get().categories : [
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

      let productsData = [];
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
      console.error("Échec du chargement Admin :", err);
      set({ 
        products: [], 
        categories: get().categories.length > 0 ? get().categories : [
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
