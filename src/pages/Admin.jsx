import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { PackageSearch, Plus, LayoutDashboard, Settings, Trash2, Edit, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Users, DollarSign, ShoppingBag, X, MessageSquare, Star, UserPlus, Shield, Download, Printer, Activity, LogOut, Menu, Link, Loader2, Filter, Save, Image, ArrowLeft, PlusCircle, FolderPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiFetch } from '../components/api';
import SEO from '../components/SEO';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'catalog', label: 'Catalogue', icon: PackageSearch },
  { id: 'add-product', label: 'Ajouter Produit', icon: PlusCircle },
  { id: 'add-category', label: 'Créer Catalogue', icon: FolderPlus },
  { id: 'orders', label: 'Commandes', icon: ShoppingBag },
  { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
  { id: 'team', label: 'Équipe', icon: Users, adminOnly: true },
  { id: 'audit', label: 'Journal', icon: Activity, adminOnly: true },
  { id: 'slides', label: 'Carrousel Accueil', icon: Image, adminOnly: true },
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const PIE_COLORS = ['#0284c7', '#1e293b', '#0369a1', '#64748b', '#0ea5e9']; // Bleu de la marque, Slate, Bleu foncé, Gris, Accent

const Admin = () => {
  // --- ÉTAT DU STORE (Sélecteurs optimisés pour éviter les re-renders infinis) ---
  const products = useProductStore(state => state.products);
  const categories = useProductStore(state => state.categories);
  const stats = useProductStore(state => state.stats);
  const orders = useProductStore(state => state.orders);
  const fetchAdminData = useProductStore(state => state.fetchAdminData);
  const addProduct = useProductStore(state => state.addProduct);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const addCategory = useProductStore(state => state.addCategory);
  const updateOrderStatus = useProductStore(state => state.updateOrderStatus);
  const loading = useProductStore(state => state.loading);
  const isFetching = useProductStore(state => state.isFetching);
  const isInitialLoaded = useProductStore(state => state.isInitialLoaded);
  const isFetchingStats = useProductStore(state => state.isFetchingStats);
  const isFetchingOrders = useProductStore(state => state.isFetchingOrders);
  const fetchOrders = useProductStore(state => state.fetchOrders);
  const fetchStats = useProductStore(state => state.fetchStats);
  
  const hasCalledInitialFetch = React.useRef(false);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-product', 'edit-product', 'add-category'
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [isCategoryUploading, setIsCategoryUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'glasses', base_price: '', compare_at_price: '', existing_media: [], subcategory: '', variants: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // Nouvel état pour les fichiers multiples
  const [isUploading, setIsUploading] = useState(false); // État pour le chargement
  const [searchQuery, setSearchQuery] = useState(''); // État pour la barre de recherche
  
  const [editingId, setEditingId] = useState(null); // Suit l'ID du produit en cours de modification
  const [productToDelete, setProductToDelete] = useState(null); // Produit ciblé pour la suppression
  const [notification, setNotification] = useState(null); // Message de notification (Toast)
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Commande dépliée

  // Nouveaux états pour la gestion des Avis
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Nouveaux états pour la gestion de l'équipe
  const [employees, setEmployees] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ full_name: '', email: '', password: '', role: 'moderator' });

  // Nouveaux états pour le Tri et la Pagination
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Nombre de produits par page
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'shipped'
  const [monthFilter, setMonthFilter] = useState('all'); // Filtre par mois

  // Nouveaux états pour le journal d'audit
  const [auditLogs, setAuditLogs] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Nouveaux états pour les paramètres du site
  const [siteSettings, setSiteSettings] = useState({
    store_name: '', contact_phone: '', contact_email: '', contact_address: '',
    maps_link: '', whatsapp_number: '', facebook_link: '', instagram_link: '',
    tiktok_link: '', maintenance_mode: false, delivery_cost_dakar: 2000,
    delivery_cost_suburbs: 3000, delivery_cost_regions: 5000
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ÉTATS POUR LE CARROUSEL ACCUEIL (SLIDES) ---
  const [slides, setSlides] = useState([]);
  const [isSlidesLoading, setIsSlidesLoading] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [slideForm, setSlideForm] = useState({
    id: null, title: '', subtitle: '', category: '', button_text: 'Découvrir la collection', link_url: '', active: true, image_url: ''
  });
  const [selectedSlideFile, setSelectedSlideFile] = useState(null);
  const [isSavingSlide, setIsSavingSlide] = useState(false);

  const fetchAdminSlides = async () => {
    setIsSlidesLoading(true);
    try {
      const res = await apiFetch('/slides/all');
      if (res.ok) {
        setSlides(await res.json());
      }
    } catch (err) {
      console.error("Erreur récupération slides admin:", err);
    } finally {
      setIsSlidesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'slides') {
      fetchAdminSlides();
    }
  }, [activeTab]);

  const handleOpenAddSlide = () => {
    setSlideForm({
      id: null, title: '', subtitle: '', category: '', button_text: 'Découvrir la collection', link_url: '', active: true, image_url: ''
    });
    setSelectedSlideFile(null);
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide) => {
    setSlideForm({
      id: slide.id,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      category: slide.category || '',
      button_text: slide.button_text || 'Découvrir la collection',
      link_url: slide.link_url || '',
      active: slide.active,
      image_url: slide.image_url || ''
    });
    setSelectedSlideFile(null);
    setIsSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    setIsSavingSlide(true);

    const data = new FormData();
    data.append('title', slideForm.title);
    data.append('subtitle', slideForm.subtitle);
    data.append('category', slideForm.category);
    data.append('button_text', slideForm.button_text);
    data.append('link_url', slideForm.link_url);
    data.append('active', String(slideForm.active));

    if (selectedSlideFile) {
      data.append('image', selectedSlideFile);
    } else if (slideForm.image_url) {
      data.append('image_url', slideForm.image_url);
    }

    try {
      let res;
      if (slideForm.id) {
        res = await apiFetch(`/slides/${slideForm.id}`, {
          method: 'PUT',
          body: data
        });
      } else {
        res = await apiFetch('/slides', {
          method: 'POST',
          body: data
        });
      }

      if (res.ok) {
        showNotification(slideForm.id ? "Slide modifié avec succès !" : "Slide ajouté avec succès !");
        setIsSlideModalOpen(false);
        fetchAdminSlides();
      } else {
        const error = await res.json();
        alert(error.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de communication avec le serveur.");
    } finally {
      setIsSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce slide ? Cette action supprimera définitivement l'image de Cloudinary.")) return;
    try {
      const res = await apiFetch(`/slides/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification("Slide supprimé !");
        fetchAdminSlides();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur de suppression.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSlide = async (index, direction) => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    const updatedPositions = newSlides.map((s, idx) => ({
      id: s.id,
      position: idx
    }));

    setSlides(newSlides);

    try {
      const res = await apiFetch('/slides/positions', {
        method: 'PATCH',
        body: JSON.stringify({ positions: updatedPositions })
      });
      if (!res.ok) {
        fetchAdminSlides();
        showNotification("Erreur lors du réordonnancement.");
      } else {
        showNotification("Ordre mis à jour !");
      }
    } catch (err) {
      console.error(err);
      fetchAdminSlides();
    }
  };

  const handleToggleSlideActive = async (slide) => {
    try {
      const data = new FormData();
      data.append('active', String(!slide.active));

      setSlides(slides.map(s => s.id === slide.id ? { ...s, active: !s.active } : s));

      const res = await apiFetch(`/slides/${slide.id}`, {
        method: 'PUT',
        body: data
      });
      if (!res.ok) {
        fetchAdminSlides();
        showNotification("Erreur lors de la modification du statut.");
      } else {
        showNotification(!slide.active ? "Slide activé !" : "Slide désactivé !");
      }
    } catch (err) {
      console.error(err);
      fetchAdminSlides();
    }
  };

  // Récupération de l'utilisateur depuis le state du store (Référence stable)
  const user = useAuthStore(state => state.user);
  const userName = user?.full_name || 'Utilisateur';
  const userRole = user?.role || 'moderator';
  const visibleTabs = ADMIN_TABS.filter(tab => !tab.adminOnly || userRole === 'admin');

  useEffect(() => {
    // Force la récupération des données à chaque visite (lors de la connexion ou navigation)
    fetchAdminData(true, false);
    window.scrollTo(0, 0);

    // Rafraîchissement automatique en arrière-plan toutes les 15 secondes
    const interval = setInterval(() => {
      fetchAdminData(true, true);
    }, 15000);

    // Rafraîchir les données quand l'administrateur revient sur l'onglet
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAdminData(true, true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Dépendances vides : fetchAdminData est stable et interne au store.

  // --- NOTIFICATIONS TEMPS RÉEL (SSE) ---
  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const controller = new AbortController();
    const connectSSE = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${BASE_URL}/notifications/stream`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
        
        if (!response.ok) {
          if (!controller.signal.aborted) setTimeout(connectSSE, 3000);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Reconnexion automatique si le serveur coupe la connexion
            if (!controller.signal.aborted) setTimeout(connectSSE, 3000);
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // Garde le dernier bloc incomplet dans le buffer

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                showNotification(data.message);
                
                // Si c'est une nouvelle commande, on met à jour les stats en temps réel et on joue un son !
                if (data.type === 'NEW_ORDER') {
                  fetchOrders();
                  fetchStats();
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                  audio.play().catch(e => {}); // On ignore l'erreur si le navigateur bloque l'autoplay
                }
              } catch(e) {}
            }
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) setTimeout(connectSSE, 3000);
      }
    };

    connectSSE();
    return () => controller.abort(); // Coupe proprement la connexion si l'Admin quitte la page
  }, []); // Dépendance vide : stable au montage.

  // Fonction utilitaire pour afficher la notification pendant 3 secondes
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // On réinitialise la page à 1 si l'admin fait une nouvelle recherche ou trie le tableau
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortOrder]);

  // Charger l'équipe
  useEffect(() => {
    if (activeTab === 'team') {
      const loadEmployees = async () => {
        try {
          const res = await apiFetch('/auth/employees');
          if (res.ok) setEmployees(await res.json());
        } catch (err) { console.error("Erreur équipe:", err); }
      };
      loadEmployees();
    }
  }, [activeTab]);

  // Charger les avis lorsque l'administrateur clique sur l'onglet "reviews"
  useEffect(() => {
    if (activeTab === 'reviews') {
      const loadReviews = async () => {
        setIsLoadingReviews(true);
        try {
          const res = await apiFetch('/products/all-reviews');
          if (res.ok) setReviews(await res.json());
        } catch (err) {
          console.error("Erreur de récupération des avis:", err);
        } finally {
          setIsLoadingReviews(false);
        }
      };
      loadReviews();
    }
  }, [activeTab]);

  // Charger les logs d'audit
  useEffect(() => {
    if (activeTab === 'audit' && userRole === 'admin') {
      const loadAudit = async () => {
        try {
          const res = await apiFetch('/audit');
          if (res.ok) setAuditLogs(await res.json());
        } catch (err) { console.error("Erreur audit:", err); }
      };
      loadAudit();
    }
  }, [activeTab, userRole]);

  // Charger les paramètres du site
  useEffect(() => {
    if (activeTab === 'settings') {
      const loadSettings = async () => {
        try {
          const res = await apiFetch('/settings');
          if (res.ok) setSiteSettings(await res.json());
        } catch (err) { console.error("Erreur settings:", err); }
      };
      loadSettings();
    }
  }, [activeTab]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const res = await apiFetch('/settings', {
        method: 'PATCH',
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) {
        showNotification("Paramètres mis à jour avec succès !");
      } else {
        const error = await res.json();
        showNotification(error.error || "Une erreur est survenue.");
      }
    } catch (err) {
      showNotification("Erreur de connexion au serveur.");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showNotification("Les nouveaux mots de passe ne correspondent pas.");
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      if (res.ok) {
        showNotification("Mot de passe modifié avec succès !");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await res.json();
        showNotification(error.error || "Erreur de changement de mot de passe.");
      }
    } catch (err) {
      showNotification("Erreur de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour ouvrir la page en mode "Ajout"
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: categories && categories.length > 0 ? categories[0].name : 'glasses', brand: '', category: categories && categories.length > 0 ? categories[0].name : 'glasses', base_price: '', compare_at_price: '', existing_media: [], subcategory: '', variants: [] });
    setSelectedFiles([]);
    setCurrentView('add-product');
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'catalog') {
      setCurrentView('list');
    } else if (tabId === 'add-product') {
      handleOpenAdd();
    } else if (tabId === 'add-category') {
      setCategoryFormData({ name: '', description: '' });
      setCurrentView('add-category');
    }
  };

  // Fonction pour ouvrir la page en mode "Modification"
  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    let existingMedia = [];
    if (product.media_urls) {
        existingMedia = typeof product.media_urls === 'string' ? JSON.parse(product.media_urls) : product.media_urls;
    } else if (product.image_url) {
        existingMedia = [product.image_url];
    }
    
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price || '',
      existing_media: existingMedia || [],
      subcategory: product.subcategory || '',
      variants: product.variants || []
    });
    setSelectedFiles([]);
    setCurrentView('edit-product');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.base_price) return;
    
    // On utilise FormData car on envoie un fichier physique
    const data = new FormData();
    data.append('name', formData.name);
    data.append('brand', formData.brand);
    data.append('category_id', formData.category);
    data.append('base_price', formData.base_price);
    data.append('compare_at_price', formData.compare_at_price);
    data.append('is_on_sale', formData.compare_at_price && parseFloat(formData.compare_at_price) > parseFloat(formData.base_price) ? 'true' : 'false');
    data.append('subcategory', formData.subcategory || '');
    
    // Ajout des fichiers multiples
    selectedFiles.forEach(file => {
      data.append('media', file);
    });
    
    // Si c'est une modification, on envoie aussi les médias existants conservés
    if (editingId) {
        data.append('existing_media', JSON.stringify(formData.existing_media));
    }

    // Ajout des variantes
    data.append('variants', JSON.stringify(formData.variants || []));

    // On active le spinner, on attend l'upload complet, puis on désactive
    setIsUploading(true);
    let success = false;
    if (editingId) {
      success = await updateProduct(editingId, data);
      if (success) showNotification("Produit modifié avec succès !");
    } else {
      success = await addProduct(data);
      if (success) showNotification("Produit ajouté avec succès !");
    }
    setIsUploading(false);

    if (success) {
      setActiveTab('catalog');
      setCurrentView('list');
      setFormData({ name: '', brand: '', category: 'glasses', base_price: '', compare_at_price: '', existing_media: [], subcategory: '', variants: [] });
      setSelectedFiles([]); // On reset les fichiers
      setEditingId(null);
    } else {
      alert("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name) return;

    setIsCategoryUploading(true);
    const success = await addCategory({
      name: categoryFormData.name,
      description: categoryFormData.description
    });
    setIsCategoryUploading(false);

    if (success) {
      showNotification("Catalogue / Catégorie créé avec succès !");
      setActiveTab('catalog');
      setCurrentView('list');
      setCategoryFormData({ name: '', description: '' });
    } else {
      alert("Une erreur est survenue lors de la création du catalogue.");
    }
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { sku: '', attribute_value: '', price_modifier: 0, stock_quantity: 0 }]
    });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleRemoveVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };
  
  // --- GESTION DES COMMANDES ---
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) showNotification("Statut de la commande mis à jour !");
  };

  // --- GESTION DES SUPPRESSIONS (PRODUITS & AVIS) ---
  const handleDelete = async () => {
    if (!productToDelete) return;
    const success = await deleteProduct(productToDelete.id);
    if (success) showNotification("Produit supprimé avec succès !");
    setProductToDelete(null);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    try {
      const res = await apiFetch(`/products/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        showNotification("Avis supprimé avec succès !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- GESTION DE L'ÉQUIPE ---
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const res = await apiFetch('/auth/employees', {
        method: 'POST',
        body: JSON.stringify(employeeForm)
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees([data.user, ...employees]);
        showNotification("Employé ajouté avec succès !");
        setIsEmployeeModalOpen(false);
        setEmployeeForm({ full_name: '', email: '', password: '', role: 'moderator' });
      } else {
        alert(data.error || "Erreur lors de l'ajout de l'employé.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir révoquer l'accès de cet employé ?")) return;
    try {
      const res = await apiFetch(`/auth/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees(employees.filter(emp => emp.id !== id));
        showNotification("Accès révoqué avec succès.");
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la révocation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- EXPORTATION DES COMMANDES (CSV) ---
  const exportOrdersToCSV = () => {
    if (!orders || orders.length === 0) {
      showNotification("Aucune commande à exporter.");
      return;
    }

    const headers = ["N° Commande", "Client", "Téléphone", "Date", "Montant Total (FCFA)", "Statut"];
    
    const csvRows = orders.map(order => {
      const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }).replace(',', ' -');
      // Protéger les valeurs contenant des virgules (ex: les noms composés)
      const escapeCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;
      
      return [order.id, escapeCSV(order.customer_name), escapeCSV(order.customer_phone), escapeCSV(date), order.total_amount, order.status].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const bom = '\uFEFF'; // Permet à Excel d'interpréter correctement l'UTF-8 (les accents)
    
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_alkarimvision_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- GÉNÉRATION ET IMPRESSION DE FACTURE (PDF) ---
  const printInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    const date = new Date(order.created_at).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let itemsHtml = '';
    let calculatedSubtotal = 0;
    
    order.items?.forEach(item => {
      const lineTotal = item.unit_price * item.quantity;
      calculatedSubtotal += lineTotal;
      itemsHtml += `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600; color: #0f172a;">${item.product_name || 'Produit'}</div>
            ${item.variant && String(item.variant).trim().toLowerCase() !== 'null' ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Variante : ${item.variant}</div>` : ''}
          </td>
          <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #334155;">${item.quantity}</td>
          <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #334155;">${new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</td>
          <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0284c7;">${new Intl.NumberFormat('fr-FR').format(lineTotal)} FCFA</td>
        </tr>
      `;
    });

    // Estimation intelligente des frais de livraison et de la remise
    const totalAmount = parseFloat(order.total_amount) || 0;
    const safeAddress = order.customer_address || '';
    let shippingCost = 0;
    
    if (safeAddress.includes('Touba') && !safeAddress.includes('Autour')) {
      shippingCost = 2000;
    } else if (safeAddress.includes('Autour')) {
      shippingCost = 3000;
    } else if (safeAddress.includes('Régions') || safeAddress.includes('Autres')) {
      shippingCost = 5000;
    } else if (totalAmount > calculatedSubtotal) {
      shippingCost = totalAmount - calculatedSubtotal;
    }

    const discountAmount = Math.max(0, (calculatedSubtotal + shippingCost) - totalAmount);

    const logoUrl = 'https://res.cloudinary.com/davjg4chq/image/upload/v1782856716/alkarim-vision/assets/al-karim-logo-jour.png';

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Facture N°${order.id.toString().padStart(4, '0')}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              padding: 40px;
              line-height: 1.5;
            }
            .invoice-card {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
            }
            .header-table {
              width: 100%;
              margin-bottom: 40px;
              border-collapse: collapse;
            }
            .header-table td {
              vertical-align: top;
              border: none;
            }
            .logo-container {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .logo-img {
              height: 64px;
              width: auto;
              object-fit: contain;
              align-self: flex-start;
            }
            .brand-title {
              font-family: 'Outfit', sans-serif;
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 3px;
              color: #0f172a;
            }
            .invoice-title-block {
              text-align: right;
            }
            .invoice-label {
              font-family: 'Outfit', sans-serif;
              font-size: 32px;
              font-weight: 600;
              color: #0284c7;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .invoice-meta {
              font-size: 13px;
              color: #64748b;
              line-height: 1.6;
            }
            .meta-value {
              font-weight: 600;
              color: #0f172a;
            }
            .details-table {
              width: 100%;
              margin-bottom: 40px;
              border-collapse: collapse;
            }
            .details-table td {
              width: 50%;
              vertical-align: top;
              border: none;
              padding: 0 10px;
            }
            .details-table td:first-child {
              padding-left: 0;
            }
            .details-table td:last-child {
              padding-right: 0;
            }
            .info-card {
              padding: 24px;
              background: #f8fafc;
              border-radius: 16px;
              border: 1px solid #f1f5f9;
              height: 100%;
            }
            .info-card-title {
              font-family: 'Outfit', sans-serif;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              margin-bottom: 12px;
            }
            .info-card-text {
              font-size: 14px;
              color: #334155;
              line-height: 1.6;
            }
            .info-card-text strong {
              color: #0f172a;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th {
              font-family: 'Outfit', sans-serif;
              text-transform: uppercase;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.5px;
              color: #475569;
              background: #f1f5f9;
              padding: 14px 16px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }
            .items-table th:nth-child(2) { text-align: center; }
            .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
            .summary-table {
              width: 320px;
              margin-left: auto;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .summary-table td {
              padding: 8px 16px;
              font-size: 14px;
              color: #475569;
            }
            .summary-table tr.total-row td {
              border-top: 2px solid #e2e8f0;
              padding-top: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            .total-amount {
              font-family: 'Outfit', sans-serif;
              font-size: 22px;
              color: #0284c7;
              font-weight: 700;
            }
            .footer {
              border-top: 1px dashed #cbd5e1;
              padding-top: 30px;
              text-align: center;
              margin-top: 50px;
            }
            .footer-thankyou {
              font-family: 'Outfit', sans-serif;
              font-size: 15px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 8px;
            }
            .footer-terms {
              font-size: 11px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
              .info-card { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .items-table th { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { size: A4; margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <table class="header-table">
              <tr>
                <td>
                  <div class="logo-container">
                    <img src="${logoUrl}" alt="Al Karim Vision Logo" class="logo-img" />
                    <div class="brand-title">AL KARIM VISION</div>
                  </div>
                </td>
                <td class="invoice-title-block">
                  <div class="invoice-label">FACTURE</div>
                  <div class="invoice-meta">
                    N° de facture : <span class="meta-value">#${order.id.toString().padStart(4, '0')}</span><br/>
                    Date de commande : <span class="meta-value">${date}</span><br/>
                    Mode de paiement : <span class="meta-value">${order.payment_method || 'WhatsApp / Livraison'}</span>
                  </div>
                </td>
              </tr>
            </table>

            <table class="details-table">
              <tr>
                <td>
                  <div class="info-card">
                    <div class="info-card-title">Émetteur</div>
                    <div class="info-card-text">
                      <strong>Al Karim Vision</strong><br/>
                      Showroom Lunetterie & Parfumerie de Luxe<br/>
                      Touba, Sénégal<br/>
                      Contact : +221 77 826 31 31
                    </div>
                  </div>
                </td>
                <td>
                  <div class="info-card">
                    <div class="info-card-title">Destinataire</div>
                    <div class="info-card-text">
                      <strong>${order.customer_name}</strong><br/>
                      Téléphone : ${order.customer_phone}<br/>
                      Adresse : ${order.customer_address || 'Sénégal'}
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description de l'article</th>
                  <th style="text-align: center;">Quantité</th>
                  <th style="text-align: right;">Prix Unitaire</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table class="summary-table">
              <tr>
                <td style="text-align: left;">Sous-total</td>
                <td style="text-align: right; font-weight: 500; color: #0f172a;">${new Intl.NumberFormat('fr-FR').format(calculatedSubtotal)} FCFA</td>
              </tr>
              ${shippingCost > 0 ? `
                <tr>
                  <td style="text-align: left;">Frais de livraison</td>
                  <td style="text-align: right; font-weight: 500; color: #0f172a;">+ ${new Intl.NumberFormat('fr-FR').format(shippingCost)} FCFA</td>
                </tr>
              ` : ''}
              ${discountAmount > 0 ? `
                <tr>
                  <td style="text-align: left; color: #dc2626;">Remise appliquée</td>
                  <td style="text-align: right; font-weight: 600; color: #dc2626;">- ${new Intl.NumberFormat('fr-FR').format(discountAmount)} FCFA</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td style="text-align: left;">Total Net à Payer</td>
                <td style="text-align: right;" class="total-amount">${new Intl.NumberFormat('fr-FR').format(totalAmount)} FCFA</td>
              </tr>
            </table>

            <div class="footer">
              <div class="footer-thankyou">Merci pour votre confiance !</div>
              <div class="footer-terms">Al Karim Vision - L'excellence à votre regard. Si vous avez des questions concernant cette facture, n'hésitez pas à nous contacter.</div>
            </div>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

  // 1. Filtrage (Sécurisé pour éviter les crashs si product.name est null)
  let processedProducts = products.filter(product => 
    product && product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Tri par Prix
  if (sortOrder === 'asc') {
    processedProducts.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
  } else if (sortOrder === 'desc') {
    processedProducts.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
  }

  // 3. Pagination
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderCategoryForm = () => {
    return (
      <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => handleTabClick('catalog')}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Retour au catalogue"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              Créer un nouveau Catalogue (Catégorie)
            </h2>
            <p className="text-xs text-gray-500 mt-1">Créez une nouvelle catégorie pour organiser vos produits.</p>
          </div>
        </div>

        <form onSubmit={handleCategorySubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nom du Catalogue</label>
            <input 
              required 
              value={categoryFormData.name} 
              onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} 
              type="text" 
              placeholder="Ex: Maroquinerie, Bijoux..." 
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
            <textarea 
              value={categoryFormData.description} 
              onChange={e => setCategoryFormData({...categoryFormData, description: e.target.value})} 
              placeholder="Description succincte de ce catalogue d'articles..." 
              rows="4" 
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" 
            />
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => handleTabClick('catalog')}
              className="px-6 py-3 border border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 font-bold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isCategoryUploading}
              className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isCategoryUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le catalogue'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderProductForm = (isEditing = false) => {
    return (
      <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => handleTabClick('catalog')}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Retour au catalogue"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              {isEditing ? 'Modifier le Produit' : 'Ajouter un nouveau Produit'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Remplissez les informations ci-dessous pour publier un article dans votre vitrine.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nom du Produit</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Ex: Ray-Ban Aviator Classic" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Marque</label>
              <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} type="text" placeholder="Ex: Ray-Ban" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Prix de Vente (FCFA)</label>
              <input required value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Ancien Prix / Prix de comparaison (Optionnel)</label>
              <input value={formData.compare_at_price} onChange={e => setFormData({...formData, compare_at_price: e.target.value})} type="number" step="0.01" placeholder="Ex: 120000" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Catégorie</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subcategory: ''})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm cursor-pointer">
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name === 'glasses' ? 'Lunettes de Soleil & Vue' :
                       cat.name === 'perfume' ? 'Parfumerie de Niche' :
                       cat.name === 'watches' ? 'Montres de Prestige' :
                       cat.name === 'other' ? 'Divers & Accessoires' : cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="glasses">Lunettes de Soleil & Vue</option>
                    <option value="perfume">Parfumerie de Niche</option>
                    <option value="watches">Montres de Prestige</option>
                    <option value="other">Divers & Accessoires</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* SOUS-CATÉGORIES POUR LUNETTES ET PARFUMS */}
          {(formData.category === 'glasses' || formData.category === 'perfume') && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Sous-Catégorie</label>
              <select 
                value={formData.subcategory || ''} 
                onChange={e => setFormData({...formData, subcategory: e.target.value})} 
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm cursor-pointer"
              >
                <option value="">Aucune sous-catégorie</option>
                {formData.category === 'glasses' ? (
                  <>
                    <option value="noir_fume">Noir Fumé</option>
                    <option value="photogray">Photogray</option>
                  </>
                ) : (
                  <>
                    <option value="avec_alcool">Avec Alcool</option>
                    <option value="sans_alcool">Sans Alcool</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Images & Vidéos (Glissez ou Cliquez)</label>
            <div className="flex flex-col gap-3">
              <input multiple onChange={e => setSelectedFiles(Array.from(e.target.files))} type="file" accept="image/*,video/mp4,video/quicktime" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-blue file:text-white hover:file:bg-brand-blue-dark cursor-pointer" />
              
              {(formData.existing_media.length > 0 || selectedFiles.length > 0) && (
                <div className="flex gap-2 flex-wrap mt-2 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {formData.existing_media.map((url, idx) => (
                    <div key={`old-${idx}`} className="relative w-16 h-16 group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {url.match(/\.(mp4|webm)$/i) ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => setFormData({...formData, existing_media: formData.existing_media.filter(u => u !== url)})} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {selectedFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative w-16 h-16 group rounded-2xl overflow-hidden border border-brand-blue/50 shadow-sm">
                      <div className="absolute top-0 left-0 bg-brand-blue text-white text-[8px] font-bold px-1 rounded-br-sm z-10">NOUVEAU</div>
                      {file.type.includes('video') ? (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))} className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* VARIANTES */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider">Variantes du Produit (Optionnel)</h4>
                <p className="text-xs text-gray-500">Ajoutez des couleurs, tailles, contenances ou types de verres avec leur propre stock.</p>
              </div>
              <button 
                type="button" 
                onClick={handleAddVariant}
                className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl dark:text-white transition-colors"
              >
                + Ajouter une Variante
              </button>
            </div>

            <div className="space-y-3">
              {(formData.variants || []).map((v, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Valeur (ex: Cadran Bleu, 50ml)</label>
                    <input required value={v.attribute_value} onChange={e => handleVariantChange(idx, 'attribute_value', e.target.value)} type="text" placeholder="Cadran Noir" className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">SKU (Optionnel)</label>
                    <input value={v.sku || ''} onChange={e => handleVariantChange(idx, 'sku', e.target.value)} type="text" placeholder="SKU-AUTO" className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Modificateur de prix</label>
                    <input value={v.price_modifier || 0} onChange={e => handleVariantChange(idx, 'price_modifier', parseFloat(e.target.value))} type="number" placeholder="0" className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white" />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Stock</label>
                      <input value={v.stock_quantity || 0} onChange={e => handleVariantChange(idx, 'stock_quantity', parseInt(e.target.value))} type="number" placeholder="0" className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white" />
                    </div>
                    <button type="button" onClick={() => handleRemoveVariant(idx)} className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-650 hover:bg-red-100 transition-colors mb-0.5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => handleTabClick('catalog')}
              className="px-6 py-3 border border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 font-bold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                isEditing ? 'Mettre à jour le Produit' : 'Publier le Produit'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
      <SEO 
        title="Dashboard Administration"
        noindex={true}
      />
      <div className="h-screen w-full flex bg-gray-50 dark:bg-zinc-950 overflow-hidden font-sans transition-colors duration-300">
      
      {/* SIDEBAR DYNAMIQUE (Desktop) */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col bg-white dark:bg-brand-gray-dark border-r border-gray-200 dark:border-gray-800 z-50 transition-colors duration-300 relative"
      >
        {/* LOGO SECTION */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Al Karim Vision" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                <h2 className="text-sm font-bold text-brand-blue tracking-widest leading-none">AL KARIM</h2>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Administration</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={isSidebarCollapsed ? tab.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${
                  isActive 
                    ? 'bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/15' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="text-sm">{tab.label}</span>}
                {isActive && !isSidebarCollapsed && <motion.div layoutId="activeTab" className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT SECTION */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2 shrink-0">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full hidden lg:flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-brand-blue transition-colors text-xs font-bold uppercase tracking-widest"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Réduire</>}
          </button>
          
          <div className={`flex items-center gap-3 p-2 rounded-2xl ${!isSidebarCollapsed ? 'bg-gray-50 dark:bg-zinc-900/50' : ''}`}>
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0 border border-brand-blue/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-bold dark:text-white truncate">{userName}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{userRole === 'admin' ? 'Administrateur' : 'Modérateur'}</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Se déconnecter"
          >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-brand-gray-dark border-b border-gray-200 dark:border-gray-800 z-[60] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Al Karim Vision" 
            className="w-8 h-8 object-contain rounded-lg shadow-sm"
          />
          <h2 className="text-sm font-bold text-brand-blue tracking-widest">AL KARIM</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-zinc-900 border-r border-gray-150 dark:border-zinc-800 z-55 flex flex-col shadow-2xl pt-5"
            >
              {/* Header inside drawer */}
              <div className="px-5 pb-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="Al Karim Vision" 
                    className="w-8 h-8 object-contain rounded-lg shadow-sm"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-brand-blue tracking-wider leading-none">AL KARIM</h2>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Administration</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {visibleTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { handleTabClick(tab.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive 
                          ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Profile & Logout inside drawer */}
              <div className="p-4 border-t border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm border border-brand-blue/15">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold dark:text-white truncate">{userName}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider truncate">{userRole === 'admin' ? 'Admin' : 'Modérateur'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/20 text-red-650 dark:text-red-450 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <LogOut size={14} />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-hidden">
        
        {/* TOPBAR (Desktop & Mobile) */}
        <header className="h-20 bg-white dark:bg-brand-gray-dark border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sm:px-10 shrink-0 z-40 transition-colors duration-300">
           <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold dark:text-white capitalize tracking-wide flex items-center gap-3">
               {ADMIN_TABS.find(t => t.id === activeTab)?.label || 'Administration'}
               {loading && <Loader2 size={18} className="animate-spin text-brand-blue" />}
             </h1>
           </div>

           <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden sm:flex flex-col text-right">
               <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-bold">Aujourd'hui</span>
               <span className="text-sm font-medium dark:text-gray-300">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
             </div>
             
             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.location.href = '/'}
                  title="Retour au site"
                  className="p-2.5 text-gray-400 hover:text-brand-blue dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all"
                >
                  <Link size={20} />
                </button>
                <div className="relative">
                  <button className="p-2.5 text-gray-400 hover:text-brand-blue dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all relative">
                    <Activity size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-gray-dark"></span>
                  </button>
                </div>
             </div>
           </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 scroll-smooth">
          {/* Les sections de contenu (Dashboard, Catalog, etc.) vont ici */}
        
        {/* SECTION : TABLEAU DE BORD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">Tableau de bord</h1>
              <p className="text-gray-500 mt-2">Aperçu des performances de votre boutique.</p>
            </div>
            
            {/* KPI CARDS (Indicateurs clés) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full"><ShoppingBag size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Commandes (Mois)</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.kpi?.commandesMois || 0}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full"><DollarSign size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Revenus (Mois)</p>
                  <p className="text-xl font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(stats?.kpi?.revenusMois || 0)} FCFA</p>
                </div>
              </div>
              <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-full"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Produits Actifs</p>
                  <p className="text-2xl font-bold dark:text-white">{products.length}</p>
                </div>
              </div>
            </div>

            {/* GRAPHIQUES ANALYTIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold dark:text-white mb-6">Évolution des Commandes et Revenus</h3>
                <div className="h-80 w-full min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                  <BarChart 
                    data={stats?.graph || []}
                    className="cursor-pointer"
                    onClick={(state) => {
                      if (state && state.activeLabel) {
                        setMonthFilter(state.activeLabel);
                        setActiveTab('orders');
                        showNotification(`Commandes filtrées pour le mois de ${state.activeLabel}`);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    
                    {/* Axe Y Gauche pour les Revenus (Valeurs élevées en FCFA) */}
                    <YAxis yAxisId="left" stroke="#0284c7" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                    
                    {/* Axe Y Droit pour les Commandes (Petites valeurs) */}
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '4px' }} 
                      itemStyle={{ color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      formatter={(value, name) => [name === 'Revenus' ? `${new Intl.NumberFormat('fr-FR').format(value)} FCFA` : value, name]}
                    />
                    <Bar yAxisId="left" dataKey="ventes" fill="#0284c7" radius={[4, 4, 0, 0]} name="Revenus" />
                    <Bar yAxisId="right" dataKey="commandes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Commandes" />
                  </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold dark:text-white mb-6">Ventes par Catégorie</h3>
                <div className="h-80 w-full flex items-center justify-center min-h-[320px]">
                  {stats.categorySales?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={stats?.categorySales || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {(stats?.categorySales || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '4px' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value, name) => [`${value} article(s) vendu(s)`, name]}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm">Pas assez de données pour l'analyse.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION : CATALOGUE */}
        {activeTab === 'catalog' && (
          <div className="animate-in fade-in duration-300">
            {currentView === 'edit-product' ? (
              renderProductForm(true)
            ) : (
              <>
                {/* 1. ANCHOR: STATS OVERVIEW CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {/* Total models card */}
                  <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Nombre de Modèles</span>
                      <h3 className="text-3xl font-black dark:text-white">{processedProducts.length} <span className="text-sm font-medium text-gray-400">sur {products.length}</span></h3>
                    </div>
                    <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                      <PackageSearch size={24} />
                    </div>
                  </div>

                  {/* Stock Total Card */}
                  <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Articles en Stock</span>
                      <h3 className="text-3xl font-black dark:text-white">
                        {products.reduce((acc, p) => acc + (p.variants ? p.variants.reduce((vAcc, v) => vAcc + (v.stock_quantity || 0), 0) : 0), 0)}
                      </h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 rounded-2xl">
                      <TrendingUp size={24} />
                    </div>
                  </div>

                  {/* Stock Alert Card */}
                  <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                    <div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Alertes de Stock</span>
                      <h3 className="text-3xl font-black dark:text-white">
                        {products.filter(p => p.variants && p.variants.some(v => v.stock_quantity <= 3)).length}
                      </h3>
                    </div>
                    <div className="p-3 bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl">
                      <AlertTriangle size={24} />
                    </div>
                  </div>
                </div>

                {/* 2. HEADER: TITLE & NEW BUTTONS */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Gestion du Catalogue</h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">Gérez vos lunettes de luxe, parfums de niche et montres de prestige.</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleTabClick('add-category')}
                      className="flex-1 sm:flex-none justify-center bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm border border-gray-200/50 dark:border-gray-800"
                    >
                      <Plus size={20} />
                      Créer un Catalogue
                    </button>
                    <button 
                      onClick={() => handleTabClick('add-product')}
                      className="flex-1 sm:flex-none justify-center bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-blue/20"
                    >
                      <Plus size={20} />
                      Ajouter un produit
                    </button>
                  </div>
                </div>

                {/* 3. CONTROL BAR: CATEGORY PILLS + SEARCH + VIEW SWITCHER */}
                <div className="bg-white dark:bg-brand-gray-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col gap-4">
                  {/* Category Filter pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
                    {[
                      { id: 'all', label: 'Tous' },
                      ...(categories || []).map(cat => ({
                        id: cat.name,
                        label: cat.name === 'glasses' ? 'Lunettes de Soleil & Vue' :
                               cat.name === 'perfume' ? 'Parfumerie' :
                               cat.name === 'watches' ? 'Montres' :
                               cat.name === 'other' ? 'Divers' : cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
                      }))
                    ].map(tab => {
                      const isActive = selectedCategoryFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setSelectedCategoryFilter(tab.id); setCurrentPage(1); }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            isActive
                              ? 'bg-brand-blue text-white shadow-sm'
                              : 'bg-gray-55 dark:bg-zinc-900 text-gray-550 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search input + view toggles */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2 border-t border-gray-50 dark:border-zinc-800/50">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher un produit par nom ou marque..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-brand-blue dark:text-white transition-colors text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 justify-end">
                      {/* Sort Order Toggle */}
                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-855 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-650 dark:text-gray-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Trier par Prix"
                      >
                        <span>Prix</span>
                        {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Grid vs List Toggles */}
                      <div className="flex bg-gray-50 dark:bg-zinc-905 p-1 rounded-xl border border-gray-200 dark:border-gray-855">
                        <button
                          onClick={() => setCatalogViewMode('grid')}
                          className={`p-2 rounded-lg transition-all ${
                            catalogViewMode === 'grid'
                              ? 'bg-white dark:bg-brand-gray-dark text-brand-blue shadow-sm'
                              : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Mode Grille"
                        >
                          <LayoutGrid size={16} />
                        </button>
                        <button
                          onClick={() => setCatalogViewMode('list')}
                          className={`p-2 rounded-lg transition-all ${
                            catalogViewMode === 'list'
                              ? 'bg-white dark:bg-brand-gray-dark text-brand-blue shadow-sm'
                              : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Mode Table/Liste"
                        >
                          <List size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. PRODUCT LIST: GRID MODE */}
                {catalogViewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {loading ? (
                      <div className="col-span-full text-center py-16 text-gray-500">
                        <Loader2 className="animate-spin mx-auto mb-4 text-brand-blue" size={32} />
                        Chargement du catalogue de luxe...
                      </div>
                    ) : paginatedProducts.map(product => {
                      const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) : 0;
                      let stockLabel = 'Rupture';
                      let stockColor = 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
                      if (totalStock > 3) {
                        stockLabel = `En Stock (${totalStock})`;
                        stockColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
                      } else if (totalStock > 0) {
                        stockLabel = `Stock Bas (${totalStock})`;
                        stockColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
                      }

                      return (
                        <motion.div
                          layout
                          key={product.id}
                          className="bg-white dark:bg-brand-gray-dark rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group flex flex-col"
                        >
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-gray-800">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Stock Badge */}
                            <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase shadow-sm ${stockColor}`}>
                              {stockLabel}
                            </span>
                            {/* Category Badge */}
                            <span className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-wider uppercase">
                              {product.category === 'glasses' ? 'Lunettes' :
                               product.category === 'perfume' ? 'Parfum' :
                               product.category === 'watches' ? 'Montre' : 'Divers'}
                            </span>
                          </div>

                          {/* Info section */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest block mb-1">
                                {product.brand || 'Sans Marque'}
                              </span>
                              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              {product.subcategory && (
                                <span className="text-[10px] text-gray-405 dark:text-gray-500 mt-1 inline-block bg-gray-55 dark:bg-zinc-900 px-2 py-0.5 rounded-md lowercase font-bold tracking-wide">
                                  {product.subcategory === 'noir_fume' ? 'Noir Fumé' :
                                   product.subcategory === 'photogray' ? 'Photogray' :
                                   product.subcategory === 'avec_alcool' ? 'Avec Alcool' :
                                   product.subcategory === 'sans_alcool' ? 'Sans Alcool' : product.subcategory}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/50">
                              <div className="flex flex-col">
                                {product.compare_at_price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {new Intl.NumberFormat('fr-FR').format(product.compare_at_price)} FCFA
                                  </span>
                                )}
                                <span className="font-black text-brand-blue dark:text-white text-lg leading-none">
                                  {new Intl.NumberFormat('fr-FR').format(product.base_price)} <span className="text-xs font-semibold text-gray-400">FCFA</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-2.5 bg-gray-50 dark:bg-zinc-900 hover:bg-brand-blue/10 hover:text-brand-blue text-gray-500 dark:text-gray-400 rounded-xl transition-all"
                                  title="Modifier le produit"
                                >
                                  <Edit size={16} />
                                </button>
                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => setProductToDelete(product)}
                                    className="p-2.5 bg-gray-50 dark:bg-zinc-900 hover:bg-red-500/10 hover:text-red-500 text-gray-500 dark:text-gray-400 rounded-xl transition-all"
                                    title="Supprimer le produit"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {!loading && paginatedProducts.length === 0 && (
                      <div className="col-span-full text-center py-16 bg-white dark:bg-brand-gray-dark rounded-3xl border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-400 font-medium">Aucun modèle ne correspond à votre recherche.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. PRODUCT LIST: TABLE MODE (DESKTOP) & LIST MODE (MOBILE) */}
                {catalogViewMode === 'list' && (
                  <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                            <th className="p-4 font-medium whitespace-nowrap">Produit</th>
                            <th className="p-4 font-medium whitespace-nowrap">Catégorie</th>
                            <th className="p-4 font-medium whitespace-nowrap">Stock</th>
                            <th className="p-4 font-medium whitespace-nowrap">Prix</th>
                            <th className="p-4 text-right font-medium whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {loading ? (
                            <tr><td colSpan="5" className="text-center py-12 text-gray-500">Chargement...</td></tr>
                          ) : paginatedProducts.map(product => {
                            const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) : 0;
                            let stockColor = 'text-red-500 font-bold';
                            if (totalStock > 3) stockColor = 'text-emerald-500 font-bold';
                            else if (totalStock > 0) stockColor = 'text-amber-500 font-bold';

                            return (
                              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="p-4 flex items-center gap-4">
                                  <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 dark:border-gray-855 shrink-0" />
                                  <div>
                                    <p className='font-bold dark:text-white line-clamp-1'>{product.name || 'Sans nom'}</p>
                                    <p className='text-xs text-brand-blue font-bold uppercase tracking-widest'>{product.brand || 'Sans Marque'}</p>
                                  </div>
                                </td>
                                <td className="p-4 dark:text-gray-300 uppercase text-xs tracking-widest">
                                  <span className="px-2.5 py-1 bg-gray-55 dark:bg-zinc-900 border border-gray-100 dark:border-gray-800 rounded-lg">
                                    {product.category === 'glasses' ? 'Lunettes' :
                                     product.category === 'perfume' ? 'Parfum' :
                                     product.category === 'watches' ? 'Montre' : 'Divers'}
                                  </span>
                                </td>
                                <td className={`p-4 text-xs ${stockColor}`}>
                                  {totalStock === 0 ? 'Rupture' : `${totalStock} en stock`}
                                </td>
                                <td className='p-4 font-bold dark:text-white'>{new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA</td>
                                <td className="p-4">
                                  <div className="flex justify-end gap-1">
                                    <button 
                                      title="Modifier" 
                                      onClick={() => handleOpenEdit(product)}
                                      className="p-2 text-gray-400 hover:text-brand-blue transition-colors"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    {userRole === 'admin' && (
                                      <button 
                                        title="Supprimer" 
                                        onClick={() => setProductToDelete(product)} 
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {paginatedProducts.length === 0 && !loading && (
                            <tr><td colSpan="5" className="text-center py-12 text-gray-500">Aucun produit trouvé.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List (< md) */}
                    <div className="block md:hidden divide-y divide-gray-150 dark:divide-zinc-800">
                      {loading ? (
                        <div className="text-center py-12 text-gray-500 text-sm">Chargement...</div>
                      ) : paginatedProducts.map(product => {
                        const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) : 0;
                        let stockLabel = 'Rupture';
                        let stockBadgeClass = 'bg-red-50 text-red-655 dark:bg-red-950/20 dark:text-red-450';
                        if (totalStock > 3) {
                          stockLabel = 'En Stock';
                          stockBadgeClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-455';
                        } else if (totalStock > 0) {
                          stockLabel = `${totalStock} restants`;
                          stockBadgeClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-455';
                        }

                        return (
                          <div key={product.id} className="p-4 flex gap-4 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-2xl border border-gray-100 dark:border-zinc-800 shrink-0" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className='font-bold text-sm dark:text-white truncate'>{product.name || 'Produit sans nom'}</h4>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button 
                                      title="Modifier" 
                                      onClick={() => handleOpenEdit(product)}
                                      className="p-1 text-gray-400 hover:text-brand-blue"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    {userRole === 'admin' && (
                                      <button 
                                        title="Supprimer" 
                                        onClick={() => setProductToDelete(product)} 
                                        className="p-1 text-gray-400 hover:text-red-500"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className='text-[10px] text-brand-blue font-bold uppercase tracking-wider mt-0.5'>{product.brand || 'Sans Marque'}</p>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="font-black text-xs text-gray-900 dark:text-gray-150">
                                  {new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${stockBadgeClass}`}>
                                  {stockLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {paginatedProducts.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500 text-sm">Aucun produit trouvé.</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SECTION : AJOUTER PRODUIT */}
        {activeTab === 'add-product' && (
          <div className="animate-in fade-in duration-300">
            {renderProductForm(false)}
          </div>
        )}

        {/* SECTION : CREER CATALOGUE */}
        {activeTab === 'add-category' && (
          <div className="animate-in fade-in duration-300">
            {renderCategoryForm()}
          </div>
        )}

        {/* SECTION : COMMANDES */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Historique des Commandes</h1>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Suivez et gérez les commandes passées par vos clients.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Filtre par Mois */}
                <div className="relative flex-1">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-brand-gray-dark border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-brand-blue dark:text-white transition-colors shadow-sm cursor-pointer text-sm"
                  >
                    <option value="all">Tous les mois</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {/* Filtre par Statut */}
                <div className="relative flex-1">
                  <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-brand-gray-dark border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-brand-blue dark:text-white transition-colors shadow-sm cursor-pointer"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="shipped">Livré</option>
                  </select>
                </div>
                <button 
                  onClick={exportOrdersToCSV}
                  className="w-full sm:w-auto justify-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 hover:border-brand-blue dark:hover:border-brand-blue text-gray-700 dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Download size={20} />
                  Exporter CSV
                </button>
              </div>
            </div>

            {/* ORDERS TABLE & CARD LIST RESPONSIVE */}
            <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 font-medium whitespace-nowrap">N° Commande</th>
                      <th className="p-4 font-medium whitespace-nowrap">Client</th>
                      <th className="p-4 font-medium whitespace-nowrap">Date</th>
                      <th className="p-4 font-medium whitespace-nowrap">Montant Total</th>
                      <th className="p-4 font-medium text-right whitespace-nowrap">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders?.filter(order => {
                      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
                      const orderMonth = MONTHS[new Date(order.created_at).getMonth()];
                      const matchMonth = monthFilter === 'all' || orderMonth === monthFilter;
                      return matchStatus && matchMonth;
                    }).length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-10 text-gray-500">Aucune commande trouvée.</td></tr>
                    ) : orders?.filter(order => {
                      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
                      const orderMonth = MONTHS[new Date(order.created_at).getMonth()];
                      const matchMonth = monthFilter === 'all' || orderMonth === monthFilter;
                      return matchStatus && matchMonth;
                    }).map(order => (
                      <React.Fragment key={order.id}>
                      <tr onClick={() => toggleOrderDetails(order.id)} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                        <td className="p-4 font-bold dark:text-white flex items-center gap-3">
                          {expandedOrderId === order.id ? <ChevronUp size={16} className="text-brand-blue" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-blue transition-colors" />}
                          # {order.id.toString().padStart(4, '0')}
                        </td>
                        <td className="p-4">
                          <p className="font-bold dark:text-white">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        </td>
                        <td className="p-4 dark:text-gray-300">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </td>
                        <td className="p-4 font-bold text-brand-blue">
                          {new Intl.NumberFormat('fr-FR').format(order.total_amount)} FCFA
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest outline-none cursor-pointer border-none text-center text-right text-right-align appearance-none ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 
                              order.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800'
                            }`}
                          >
                            <option value="pending" className="bg-white text-black dark:bg-zinc-900 dark:text-white">EN ATTENTE</option>
                            <option value="paid" className="bg-white text-black dark:bg-zinc-900 dark:text-white">PAYÉ</option>
                            <option value="shipped" className="bg-white text-black dark:bg-zinc-900 dark:text-white">LIVRÉ</option>
                          </select>
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr className="bg-gray-50/50 dark:bg-zinc-900/30">
                          <td colSpan="5" className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-sm dark:text-white uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                <ShoppingBag size={16} /> Détails de la commande
                              </h4>
                              <button 
                                onClick={() => printInvoice(order)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
                              >
                                <Printer size={14} /> Imprimer Facture
                              </button>
                            </div>
                            <div className="bg-white dark:bg-brand-gray-dark border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                                  <tr>
                                    <th className="p-3 font-medium">Article</th>
                                    <th className="p-3 font-medium text-center">Quantité</th>
                                    <th className="p-3 font-medium text-right">Prix Unitaire</th>
                                    <th className="p-3 font-medium text-right">Sous-total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                  {order.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                                      <td className="p-3">
                                        <p className="font-bold dark:text-white">{item.product_name || <span className="text-gray-400 italic">Produit supprimé</span>}</p>
                                        {item.variant && String(item.variant).trim().toLowerCase() !== 'null' && <p className="text-[10px] text-brand-blue uppercase tracking-widest mt-0.5">{item.variant}</p>}
                                      </td>
                                      <td className="p-3 text-center font-medium dark:text-gray-300">{item.quantity}</td>
                                      <td className="p-3 text-right dark:text-gray-400">{new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</td>
                                      <td className="p-3 text-right font-bold text-brand-blue">{new Intl.NumberFormat('fr-FR').format(item.unit_price * item.quantity)} FCFA</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List (< md) */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {orders?.filter(order => {
                  const matchStatus = statusFilter === 'all' || order.status === statusFilter;
                  const orderMonth = MONTHS[new Date(order.created_at).getMonth()];
                  const matchMonth = monthFilter === 'all' || orderMonth === monthFilter;
                  return matchStatus && matchMonth;
                }).length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Aucune commande trouvée.</div>
                ) : orders?.filter(order => {
                  const matchStatus = statusFilter === 'all' || order.status === statusFilter;
                  const orderMonth = MONTHS[new Date(order.created_at).getMonth()];
                  const matchMonth = monthFilter === 'all' || orderMonth === monthFilter;
                  return matchStatus && matchMonth;
                }).map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-sm dark:text-white">Commande #{order.id.toString().padStart(4, '0')}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none text-center appearance-none ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 
                            order.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800'
                          }`}
                        >
                          <option value="pending">EN ATTENTE</option>
                          <option value="paid">PAYÉ</option>
                          <option value="shipped">LIVRÉ</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="font-bold text-xs text-gray-800 dark:text-gray-200">{order.customer_name}</p>
                          <p className="text-[11px] text-gray-500">{order.customer_phone}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-brand-blue">
                            {new Intl.NumberFormat('fr-FR').format(order.total_amount)} FCFA
                          </span>
                          <button 
                            onClick={() => toggleOrderDetails(order.id)}
                            className="p-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-brand-blue"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Mobile Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Articles commandés</span>
                            <button 
                              onClick={() => printInvoice(order)}
                              className="text-[10px] bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Printer size={12} /> Facture
                            </button>
                          </div>
                          
                          <div className="space-y-2 bg-gray-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-gray-150 dark:border-zinc-800/50">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="font-bold dark:text-white truncate">{item.product_name || 'Produit supprimé'}</p>
                                  {item.variant && String(item.variant).trim().toLowerCase() !== 'null' && (
                                    <span className="text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded uppercase font-bold tracking-tight mt-0.5 inline-block">
                                      {item.variant}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-400 font-medium whitespace-nowrap shrink-0">x{item.quantity}</span>
                                <span className="font-bold text-gray-755 dark:text-gray-300 ml-3 whitespace-nowrap shrink-0">
                                  {new Intl.NumberFormat('fr-FR').format(item.unit_price * item.quantity)} FCFA
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.customer_address && (
                            <div className="text-[11px] text-gray-500 bg-gray-50/50 dark:bg-zinc-950/25 p-3 rounded-xl border border-gray-150 dark:border-zinc-800/40">
                              <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Adresse de livraison :</span>
                              {order.customer_address}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION : AVIS CLIENTS (Modération) */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold dark:text-white">Modération des Avis</h1>
              <p className="text-gray-500 mt-2">Gérez les avis et notes laissés par vos clients.</p>
            </div>

            {/* REVIEWS TABLE & CARD LIST RESPONSIVE */}
            <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 font-medium whitespace-nowrap">Produit</th>
                      <th className="p-4 font-medium whitespace-nowrap">Client</th>
                      <th className="p-4 font-medium text-center whitespace-nowrap">Note</th>
                      <th className="p-4 font-medium w-1/3 whitespace-nowrap">Commentaire</th>
                      <th className="p-4 font-medium text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {isLoadingReviews ? (
                      <tr><td colSpan="5" className="text-center py-10 text-gray-500">Chargement des avis en cours...</td></tr>
                    ) : reviews.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-10 text-gray-500">Aucun avis à modérer pour le moment.</td></tr>
                    ) : reviews.map(review => (
                      <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4 font-bold dark:text-white text-sm">{review.product_name}</td>
                        <td className="p-4">
                          <p className="font-bold dark:text-white text-sm">{review.customer_name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-brand-blue' : 'text-gray-300 dark:text-gray-700'} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 italic">"{review.comment}"</td>
                        <td className="p-4 text-right">
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Supprimer cet avis"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List (< md) */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {isLoadingReviews ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Chargement des avis...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Aucun avis à modérer.</div>
                ) : reviews.map(review => (
                  <div key={review.id} className="p-4 hover:bg-gray-55/30 dark:hover:bg-zinc-900/30 transition-colors space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-brand-blue uppercase tracking-wider">{review.product_name}</h4>
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-150 mt-1">{review.customer_name}</p>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer cet avis"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-brand-blue' : 'text-gray-300 dark:text-gray-700'} />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-405 italic bg-gray-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-gray-150 dark:border-zinc-800/40">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION : JOURNAL D'AUDIT */}
        {activeTab === 'audit' && userRole === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Journal d'activité</h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Historique des actions effectuées par votre équipe sur le système.</p>
            </div>

            <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4 font-medium whitespace-nowrap">Date</th>
                    <th className="p-4 font-medium whitespace-nowrap">Collaborateur</th>
                    <th className="p-4 font-medium whitespace-nowrap">Action</th>
                    <th className="p-4 font-medium whitespace-nowrap">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">Aucune activité enregistrée.</td></tr>
                  ) : auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-4 font-bold dark:text-white text-sm">
                        {log.user_name || 'Utilisateur inconnu'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-xs font-bold rounded-2xl text-gray-600 dark:text-gray-300 tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION : PARAMÈTRES */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">Paramètres Généraux</h1>
              <p className="text-gray-500 mt-2">Configurez l'identité visuelle et les coordonnées de la boutique.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Branding & Contact */}
              <div className="xl:col-span-2 space-y-6">
                <form onSubmit={handleUpdateSettings} className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex items-center justify-between mb-2">
                       <h3 className="font-bold dark:text-white uppercase tracking-widest text-sm text-brand-blue">Information de la Boutique</h3>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-400">Mode Maintenance</span>
                         <button 
                           type="button"
                           onClick={() => setSiteSettings({...siteSettings, maintenance_mode: !siteSettings.maintenance_mode})}
                           className={`w-12 h-6 rounded-full transition-colors relative ${siteSettings.maintenance_mode ? 'bg-red-500' : 'bg-gray-200 dark:bg-zinc-800'}`}
                         >
                           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.maintenance_mode ? 'translate-x-6' : ''}`}></div>
                         </button>
                       </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom de la Boutique</label>
                      <input value={siteSettings.store_name} onChange={e => setSiteSettings({...siteSettings, store_name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email de Contact</label>
                      <input value={siteSettings.contact_email} onChange={e => setSiteSettings({...siteSettings, contact_email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Téléphone WhatsApp (International)</label>
                      <input value={siteSettings.whatsapp_number} onChange={e => setSiteSettings({...siteSettings, whatsapp_number: e.target.value})} placeholder="22177..." className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Lien Google Maps</label>
                      <input value={siteSettings.maps_link} onChange={e => setSiteSettings({...siteSettings, maps_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Adresse Physique</label>
                       <input value={siteSettings.contact_address} onChange={e => setSiteSettings({...siteSettings, contact_address: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <h3 className="md:col-span-3 font-bold dark:text-white uppercase tracking-widest text-sm text-brand-blue">Tarifs de Livraison (FCFA)</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Touba</label>
                      <input type="number" value={siteSettings.delivery_cost_dakar} onChange={e => setSiteSettings({...siteSettings, delivery_cost_dakar: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Autour de Touba</label>
                      <input type="number" value={siteSettings.delivery_cost_suburbs} onChange={e => setSiteSettings({...siteSettings, delivery_cost_suburbs: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Autres Régions</label>
                      <input type="number" value={siteSettings.delivery_cost_regions} onChange={e => setSiteSettings({...siteSettings, delivery_cost_regions: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h3 className="md:col-span-2 font-bold dark:text-white uppercase tracking-widest text-sm text-brand-blue">Réseaux Sociaux</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Instagram</label>
                      <input value={siteSettings.instagram_link} onChange={e => setSiteSettings({...siteSettings, instagram_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">TikTok</label>
                      <input value={siteSettings.tiktok_link} onChange={e => setSiteSettings({...siteSettings, tiktok_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isUpdatingSettings}
                      className="bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isUpdatingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      SAUVEGARDER LES RÉGLAGES
                    </button>
                  </div>
                </form>
              </div>

              {/* Sécurité Compte */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-brand-blue" size={24} />
                    <h3 className="font-bold dark:text-white uppercase tracking-widest text-sm">Sécurité du Compte</h3>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe actuel</label>
                      <input required type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nouveau mot de passe</label>
                      <input required type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Confirmer</label>
                      <input required type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-gray-dark dark:bg-zinc-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Changer le mot de passe"}
                    </button>
                  </form>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-500/20">
                  <h3 className="font-bold text-red-600 dark:text-red-500 uppercase tracking-widest text-xs mb-2">Zone de Danger</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">La suppression du compte administrateur est réservée au propriétaire principal.</p>
                  <button className="text-xs font-bold text-red-500 border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all w-full">DEMANDER FERMETURE DU COMPTE</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION : CARROUSEL ACCUEIL */}
        {activeTab === 'slides' && userRole === 'admin' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold dark:text-white">Carrousel de la Page d'Accueil</h1>
                <p className="text-gray-500 mt-2">Gérez les visuels, titres et redirections affichés à l'ouverture du site.</p>
              </div>
              <button 
                onClick={handleOpenAddSlide}
                className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue/20"
              >
                <Plus size={20} />
                Ajouter une Diapo
              </button>
            </div>

            {/* LISTE DES SLIDES */}
            {/* LISTE DES SLIDES RESPONSIVE */}
            <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 font-medium whitespace-nowrap w-24">Vignette</th>
                      <th className="p-4 font-medium whitespace-nowrap">Textes (Titre / Sous-titre)</th>
                      <th className="p-4 font-medium whitespace-nowrap">Catégorie</th>
                      <th className="p-4 font-medium whitespace-nowrap">Lien / Bouton</th>
                      <th className="p-4 font-medium whitespace-nowrap text-center w-24">Ordre</th>
                      <th className="p-4 font-medium whitespace-nowrap text-center w-28">Statut</th>
                      <th className="p-4 font-medium whitespace-nowrap text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {isSlidesLoading ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500">Chargement des diapositives...</td></tr>
                    ) : slides.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500">Aucune diapositive configurée. Cliquez sur "Ajouter une Diapo" pour commencer.</td></tr>
                    ) : slides.map((slide, index) => (
                      <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4">
                          <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                            <img src={slide.image_url || slide.image} alt={slide.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold dark:text-white text-sm">{slide.title || 'Sans titre'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{slide.subtitle || 'Sans description'}</p>
                        </td>
                        <td className="p-4">
                          {slide.category ? (
                            <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full tracking-wider uppercase">
                              {slide.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm">
                          <p className="font-semibold text-gray-700 dark:text-gray-300">{slide.button_text || 'Découvrir'}</p>
                          <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{slide.link_url || slide.route || '/'}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleMoveSlide(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-brand-blue disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                              title="Monter"
                            >
                              <ChevronUp size={18} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center dark:text-white">{index + 1}</span>
                            <button
                              onClick={() => handleMoveSlide(index, 'down')}
                              disabled={index === slides.length - 1}
                              className="p-1 text-gray-400 hover:text-brand-blue disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                              title="Descendre"
                            >
                              <ChevronDown size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleSlideActive(slide)}
                              className={`w-12 h-6 rounded-full transition-colors relative ${slide.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-800'}`}
                              title={slide.active ? 'Désactiver le slide' : 'Activer le slide'}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${slide.active ? 'translate-x-6' : ''}`}></div>
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenEditSlide(slide)}
                              className="p-2 text-gray-400 hover:text-brand-blue hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List (< md) */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {isSlidesLoading ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Chargement des diapositives...</div>
                ) : slides.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Aucune diapositive configurée.</div>
                ) : slides.map((slide, index) => (
                  <div key={slide.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="flex gap-3">
                      <img src={slide.image_url || slide.image} alt={slide.title} className="w-20 h-12 object-cover rounded-lg border border-gray-205 dark:border-zinc-850 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm dark:text-white truncate">{slide.title || 'Sans titre'}</h4>
                        <p className="text-xs text-gray-400 truncate">{slide.subtitle || 'Sans description'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Catégorie :</span>
                        {slide.category ? (
                          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded uppercase">
                            {slide.category}
                          </span>
                        ) : '-'}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Bouton / Lien :</span>
                        <span className="font-bold">{slide.button_text || 'Découvrir'}</span>
                        <span className="text-[9px] text-gray-400 block truncate max-w-[120px] font-mono mt-0.5">{slide.link_url || '/'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveSlide(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-gray-400 hover:text-brand-blue disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <span className="text-xs font-bold text-gray-700 dark:text-white w-4 text-center">{index + 1}</span>
                        <button
                          onClick={() => handleMoveSlide(index, 'down')}
                          disabled={index === slides.length - 1}
                          className="p-1.5 text-gray-400 hover:text-brand-blue disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Switch */}
                        <button
                          onClick={() => handleToggleSlideActive(slide)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative ${slide.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-850'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${slide.active ? 'translate-x-4.5' : ''}`}></div>
                        </button>
                        
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOpenEditSlide(slide)}
                            className="p-1.5 text-gray-400 hover:text-brand-blue"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        </div>
      </main>



      {/* MODAL AJOUT EMPLOYÉ */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => setIsEmployeeModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-brand-gray-dark w-full max-w-md max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-brand-blue" size={24} />
                <h3 className="text-lg md:text-xl font-bold dark:text-white tracking-widest uppercase">Nouvel Accès Collaborateur</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <form id="employeeForm" onSubmit={handleEmployeeSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom Complet</label>
                <input required value={employeeForm.full_name} onChange={e => setEmployeeForm({...employeeForm, full_name: e.target.value})} type="text" placeholder="Ex: Jean Dupont" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email Professionnel</label>
                <input required value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} type="email" placeholder="jean@alkarimvision.com" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe temporaire</label>
                <input required value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Niveau d'accès (Rôle)</label>
                <select value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors cursor-pointer text-sm md:text-base">
                  <option value="moderator">Modérateur (Peut gérer les produits et commandes)</option>
                  <option value="admin">Administrateur (Accès total)</option>
                </select>
              </div>
            </form>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" disabled={isUploading} onClick={() => setIsEmployeeModalOpen(false)} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider disabled:opacity-50">Annuler</button>
              <button form="employeeForm" type="submit" disabled={isUploading} className="px-6 sm:px-8 py-3 text-sm bg-brand-blue text-white font-bold rounded-xl shadow-md hover:bg-brand-blue-dark transition-colors uppercase tracking-wider disabled:opacity-50">CRÉER LE COMPTE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT / MODIFICATION SLIDE */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => setIsSlideModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-brand-gray-dark w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 shrink-0 flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold dark:text-white tracking-widest uppercase">{slideForm.id ? 'Modifier la Diapositive' : 'Nouvelle Diapositive Accueil'}</h3>
              <button 
                type="button" 
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <form id="slideForm" onSubmit={handleSlideSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Titre du Slide</label>
                    <input required value={slideForm.title} onChange={e => setSlideForm({...slideForm, title: e.target.value})} type="text" placeholder="Ex: Clarté & Style Unique" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Catégorie / Tag (Mini-entête)</label>
                    <input value={slideForm.category} onChange={e => setSlideForm({...slideForm, category: e.target.value})} type="text" placeholder="Ex: LUNETTES" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Sous-titre / Description</label>
                  <textarea value={slideForm.subtitle} onChange={e => setSlideForm({...slideForm, subtitle: e.target.value})} placeholder="Ex: Découvrez notre collection de lunettes de vue et de soleil." rows="2" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Texte du Bouton</label>
                    <input value={slideForm.button_text} onChange={e => setSlideForm({...slideForm, button_text: e.target.value})} type="text" placeholder="Ex: Découvrir la collection" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Lien de Redirection (Route/URL)</label>
                    <select value={slideForm.link_url} onChange={e => setSlideForm({...slideForm, link_url: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors text-sm cursor-pointer">
                      <option value="">Sélectionner une destination...</option>
                      <option value="/category/glasses">Lunettes (/category/glasses)</option>
                      <option value="/category/perfume">Parfums (/category/perfume)</option>
                      <option value="/category/watches">Montres (/category/watches)</option>
                      <option value="/category/other">Divers (/category/other)</option>
                      <option value="/shop">Boutique (/shop)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Image du Carrousel</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedSlideFile(e.target.files[0]);
                        }
                      }}
                      required={!slideForm.id && !slideForm.image_url}
                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-brand-blue outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-blue file:text-white hover:file:bg-brand-blue-dark cursor-pointer text-sm" 
                    />
                    
                    {/* Visualisation de l'image sélectionnée ou existante */}
                    {(selectedSlideFile || slideForm.image_url) && (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        <img 
                          src={selectedSlideFile ? URL.createObjectURL(selectedSlideFile) : slideForm.image_url} 
                          alt="Prévisualisation" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diapositive Active</span>
                  <button 
                    type="button"
                    onClick={() => setSlideForm({...slideForm, active: !slideForm.active})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${slideForm.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${slideForm.active ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
              </form>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" disabled={isSavingSlide} onClick={() => setIsSlideModalOpen(false)} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider disabled:opacity-50">Annuler</button>
              <button form="slideForm" type="submit" disabled={isSavingSlide} className="px-6 sm:px-8 py-3 text-sm bg-brand-blue text-white font-bold rounded-full shadow-md hover:bg-brand-blue-dark transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
                {isSavingSlide ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    SAUVEGARDE...
                  </>
                ) : (
                  slideForm.id ? 'MODIFIER' : 'AJOUTER'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => setProductToDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-brand-gray-dark w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-red-500/30 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-red-50 dark:bg-red-950/20 shrink-0 flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-500 tracking-widest uppercase">Confirmation de suppression</h3>
              <button 
                type="button" 
                onClick={() => setProductToDelete(null)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer définitivement le produit <span className="font-bold text-black dark:text-white">"{productToDelete.name}"</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" onClick={() => setProductToDelete(null)} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider">Annuler</button>
              <button type="button" onClick={handleDelete} className="px-6 sm:px-8 py-3 text-sm bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 transition-colors uppercase tracking-wider flex items-center gap-2">
                  <Trash2 size={16} />
                  SUPPRIMER
                </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE NOTIFICATION (Succès) */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[110]">
          <CheckCircle2 size={20} />
          <span className="font-bold tracking-wide text-sm">{notification}</span>
        </div>
      )}
    </div>
    </>
  );
};

export default Admin;
