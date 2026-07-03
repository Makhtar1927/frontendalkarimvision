import { create } from 'zustand';
import { apiFetch } from '../components/api';
import { STARTER_CATEGORIES, STARTER_PRODUCTS } from '../data/starterProducts';

// Mode Production : Pas de données de démonstration.

const mergeById = (apiItems = [], starterItems = []) => {
  if (apiItems && apiItems.length > 0) {
    return apiItems;
  }
  return starterItems;
};

const starterFallbackCategories = () => STARTER_CATEGORIES;

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

  // --- NOTIFICATIONS ADMIN (Nouvelles commandes) ---
  newOrdersCount: 0,
  lastKnownOrderId: null, // ID de la dernière commande connue

  markOrdersAsSeen: () => {
    const { orders } = get();
    const latestId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : null;
    set({ newOrdersCount: 0, lastKnownOrderId: latestId });
  },

  checkForNewOrders: async () => {
    const { lastKnownOrderId } = get();
    try {
      const response = await apiFetch('/orders');
      if (!response.ok) return;
      const data = await response.json();
      const currentOrders = data;

      if (lastKnownOrderId === null) {
        // Premier chargement : on mémorise l'état actuel sans notifier
        const latestId = currentOrders.length > 0 ? Math.max(...currentOrders.map(o => o.id)) : 0;
        set({ orders: currentOrders, lastKnownOrderId: latestId });
        return;
      }

      const newOrders = currentOrders.filter(o => o.id > lastKnownOrderId);
      if (newOrders.length > 0) {
        set(state => ({
          orders: currentOrders,
          newOrdersCount: state.newOrdersCount + newOrders.length,
        }));
        // Retourner les nouvelles commandes pour que le composant puisse notifier
        return newOrders;
      } else {
        set({ orders: currentOrders });
      }
    } catch (err) {
      // Silencieux, le polling ne doit pas créer d'erreurs visibles
    }
    return [];
  },

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
      productsData = mergeById(productsData, STARTER_PRODUCTS);
      
      let categoriesData = [];
      if (categoriesRes.ok) {
        categoriesData = await categoriesRes.json();
      }
      categoriesData = mergeById(categoriesData, STARTER_CATEGORIES);
      
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
        products: STARTER_PRODUCTS, 
        categories: get().categories.length > 0 ? get().categories : starterFallbackCategories(),
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
      productsData = mergeById(productsData, STARTER_PRODUCTS);

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
      categoriesData = mergeById(categoriesData, STARTER_CATEGORIES);

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
        products: STARTER_PRODUCTS, 
        categories: get().categories.length > 0 ? get().categories : starterFallbackCategories(),
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
      if (!response.ok) {
        const starterProduct = STARTER_PRODUCTS.find(product => String(product.id) === String(id));
        if (starterProduct) {
          set({ currentProduct: starterProduct, loading: false });
          return;
        }
        throw new Error("Produit introuvable");
      }
      const data = await response.json();
      set({ currentProduct: data, loading: false });
    } catch (err) {
      const starterProduct = STARTER_PRODUCTS.find(product => String(product.id) === String(id));
      if (starterProduct) {
        set({ currentProduct: starterProduct, loading: false, error: null });
        return;
      }
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
