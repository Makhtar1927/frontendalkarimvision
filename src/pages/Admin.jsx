import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { PackageSearch, Plus, LayoutDashboard, Settings, Trash2, Edit, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Users, DollarSign, ShoppingBag, X, MessageSquare, Star, UserPlus, Shield, Download, Printer, Activity, LogOut, Menu, Link, Loader2, Filter, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiFetch } from '../components/api';
import SEO from '../components/SEO';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'catalog', label: 'Catalogue', icon: PackageSearch },
  { id: 'orders', label: 'Commandes', icon: ShoppingBag },
  { id: 'reviews', label: 'Avis Clients', icon: MessageSquare },
  { id: 'team', label: 'Équipe', icon: Users, adminOnly: true },
  { id: 'audit', label: 'Journal', icon: Activity, adminOnly: true },
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const PIE_COLORS = ['#d4af37', '#18181b', '#3b82f6', '#9ca3af', '#f59e0b']; // Or, Noir, Bleu, Gris, Ambre

const Admin = () => {
  // --- ÉTAT DU STORE (Sélecteurs optimisés pour éviter les re-renders infinis) ---
  const products = useProductStore(state => state.products);
  const stats = useProductStore(state => state.stats);
  const orders = useProductStore(state => state.orders);
  const fetchAdminData = useProductStore(state => state.fetchAdminData);
  const addProduct = useProductStore(state => state.addProduct);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const updateOrderStatus = useProductStore(state => state.updateOrderStatus);
  const loading = useProductStore(state => state.loading);
  const isFetching = useProductStore(state => state.isFetching);
  const isInitialLoaded = useProductStore(state => state.isInitialLoaded);
  const isFetchingStats = useProductStore(state => state.isFetchingStats);
  const isFetchingOrders = useProductStore(state => state.isFetchingOrders);
  const fetchOrders = useProductStore(state => state.fetchOrders);
  const fetchStats = useProductStore(state => state.fetchStats);
  
  const hasCalledInitialFetch = React.useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Fonction pour ouvrir la modale en mode "Ajout"
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', category: 'glasses', base_price: '', compare_at_price: '', existing_media: [], subcategory: '', variants: [] });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  // Fonction pour ouvrir la modale en mode "Modification"
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
    setIsModalOpen(true);
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
      setIsModalOpen(false);
      setFormData({ name: '', brand: '', category: 'glasses', base_price: '', compare_at_price: '', existing_media: [], subcategory: '', variants: [] });
      setSelectedFiles([]); // On reset les fichiers
      setEditingId(null);
    } else {
      alert("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
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
    const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' });

    let itemsHtml = '';
    order.items?.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">
            <strong>${item.product_name || 'Produit supprimé'}</strong><br/>
            ${item.variant && String(item.variant).trim().toLowerCase() !== 'null' ? `<small style="color: #888; text-transform: uppercase; letter-spacing: 1px; font-size: 10px;">${item.variant}</small>` : ''}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">${new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #d4af37;">${new Intl.NumberFormat('fr-FR').format(item.unit_price * item.quantity)} FCFA</td>
        </tr>
      `;
    });

    const html = `
      <html>
        <head>
          <title>Facture _ N°${order.id.toString().padStart(4, '0')}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #18181b; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #d4af37; letter-spacing: 2px; }
            .logo span { color: #18181b; }
            .invoice-details { text-align: right; }
            .customer-info { margin-bottom: 40px; line-height: 1.6; }
            table { border-collapse: collapse; margin-bottom: 40px; width: 100%; }
            th { text-align: left; padding: 12px 10px; background: #f4f4f5; border-bottom: 2px solid #e4e4e7; color: #71717a; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .total-section { text-align: right; font-size: 18px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f4f4f5; }
            .total-section strong { color: #d4af37; font-size: 28px; display: block; margin-top: 5px; }
            @media print { body { padding: 0; } @page { size: A4 portrait; margin: 1.5cm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <div style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
                 <div>AL KARIM<span> VISION</span></div>
                 <img src="${window.location.origin}/logo.jpg" alt="Al Karim Vision Logo" style="height: 50px; width: auto; border-radius: 6px;" />
              </div>
            </div>
            <div class="invoice-details">
              <h1 style="margin:0 0 5px 0; color: #18181b; letter-spacing: 2px;">FACTURE</h1>
              <strong>N° :</strong> #${order.id.toString().padStart(4, '0')}<br/>
              <strong>Date :</strong> ${date}
            </div>
          </div>
          
          <div class="customer-info">
            <h3 style="color: #d4af37; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Adressée à :</h3>
            <strong>${order.customer_name}</strong><br/>
            Téléphone : ${order.customer_phone}<br/>
            Adresse : ${order.customer_address || 'Sénégal'}
          </div>

          <table>
            <thead><tr><th>Description de l'article</th><th style="text-align: center;">Qté</th><th style="text-align: right;">Prix Unitaire</th><th style="text-align: right;">Montant</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div class="total-section">
            <span style="color: #71717a; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1px;">Total TTC</span>
            <strong>${new Intl.NumberFormat('fr-FR').format(order.total_amount)} FCFA</strong>
          </div>
          
          <script>window.onload = () => { window.print(); window.close(); }</script>
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
        className="hidden md:flex flex-col bg-white dark:bg-bustantech-black border-r border-gray-200 dark:border-gray-800 z-50 transition-colors duration-300 relative"
      >
        {/* LOGO SECTION */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bustantech-gold rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
              <Shield className="text-white" size={20} />
            </div>
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                <h2 className="text-sm font-bold text-bustantech-gold tracking-widest leading-none">AL KARIM</h2>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin Panel</span>
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
                onClick={() => setActiveTab(tab.id)}
                title={isSidebarCollapsed ? tab.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${
                  isActive 
                    ? 'bg-bustantech-gold text-white font-bold shadow-lg shadow-gold/20' 
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
            className="w-full hidden lg:flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-bustantech-gold transition-colors text-xs font-bold uppercase tracking-widest"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Réduire</>}
          </button>
          
          <div className={`flex items-center gap-3 p-2 rounded-2xl ${!isSidebarCollapsed ? 'bg-gray-50 dark:bg-zinc-900/50' : ''}`}>
            <div className="w-10 h-10 rounded-2xl bg-bustantech-gold/10 text-bustantech-gold flex items-center justify-center font-bold text-sm shrink-0 border border-bustantech-gold/20">
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-bustantech-black border-b border-gray-200 dark:border-gray-800 z-[60] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="text-bustantech-gold" size={20} />
          <h2 className="text-sm font-bold text-bustantech-gold tracking-widest">AL KARIM</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            className="md:hidden fixed inset-0 bg-white dark:bg-bustantech-black z-[55] pt-20 px-6 flex flex-col"
          >
            <nav className="flex-1 space-y-2 mt-4">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-medium transition-colors ${
                      isActive ? 'bg-bustantech-gold/10 text-bustantech-gold border-l-4 border-bustantech-gold' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Icon size={24} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="py-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-bustantech-gold text-white flex items-center justify-center font-bold">{userName.charAt(0)}</div>
                <div>
                  <p className="font-bold dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 uppercase">{userRole}</p>
                </div>
              </div>
              <button 
                onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}
                className="p-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-full"
              >
                <LogOut size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-hidden">
        
        {/* TOPBAR (Desktop & Mobile) */}
        <header className="h-20 bg-white dark:bg-bustantech-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sm:px-10 shrink-0 z-40 transition-colors duration-300">
           <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold dark:text-white capitalize tracking-wide flex items-center gap-3">
               {ADMIN_TABS.find(t => t.id === activeTab)?.label || 'Administration'}
               {loading && <Loader2 size={18} className="animate-spin text-bustantech-gold" />}
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
                  className="p-2.5 text-gray-400 hover:text-bustantech-gold dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all"
                >
                  <Link size={20} />
                </button>
                <div className="relative">
                  <button className="p-2.5 text-gray-400 hover:text-bustantech-gold dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all relative">
                    <Activity size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-bustantech-black"></span>
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
              <div className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full"><ShoppingBag size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Commandes (Mois)</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.kpi?.commandesMois || 0}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full"><DollarSign size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Revenus (Mois)</p>
                  <p className="text-xl font-bold text-bustantech-gold">{new Intl.NumberFormat('fr-FR').format(stats?.kpi?.revenusMois || 0)} FCFA</p>
                </div>
              </div>
              <div className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="p-4 bg-bustantech-gold/10 text-bustantech-gold rounded-full"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Produits Actifs</p>
                  <p className="text-2xl font-bold dark:text-white">{products.length}</p>
                </div>
              </div>
            </div>

            {/* GRAPHIQUES ANALYTIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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
                    <YAxis yAxisId="left" stroke="#d4af37" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
                    
                    {/* Axe Y Droit pour les Commandes (Petites valeurs) */}
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '4px' }} 
                      itemStyle={{ color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      formatter={(value, name) => [name === 'Revenus' ? `${new Intl.NumberFormat('fr-FR').format(value)} FCFA` : value, name]}
                    />
                    <Bar yAxisId="left" dataKey="ventes" fill="#d4af37" radius={[4, 4, 0, 0]} name="Revenus" />
                    <Bar yAxisId="right" dataKey="commandes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Commandes" />
                  </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Gestion du Catalogue</h1>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Gérez vos iPhones, Parfums et Cafés d'exception.</p>
              </div>
              <button 
                onClick={handleOpenAdd}
                className="w-full sm:w-auto justify-center bg-bustantech-gold hover:bg-bustantech-gold-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-bustantech-gold/20"
              >
                <Plus size={20} />
                Ajouter un produit
              </button>
            </div>

        {/* BARRE DE RECHERCHE */}
        <div className="mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* TABLE MODERNE LUXURY */}
        <div className="bg-white dark:bg-bustantech-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900 text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 font-medium whitespace-nowrap">Produit</th>
                <th className="p-4 font-medium whitespace-nowrap">Catégorie</th>
                <th 
                  className="p-4 font-medium cursor-pointer hover:text-bustantech-gold transition-colors select-none whitespace-nowrap"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  <div className="flex items-center gap-1">
                    Prix
                    {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </th>
                <th className="p-4 text-right font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Chargement sécurisé de la base de données...</td></tr>
              ) : paginatedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <img src={product.image_url} alt={product.name} className="w-14 h-14 object-cover rounded-2xl border border-gray-100 dark:border-gray-800" />
                    <div>
                      <p className="font-bold dark:text-white">{product.name || 'Produit sans nom'}</p>
                      <p className="text-xs text-bustantech-gold font-medium uppercase tracking-widest">{product.brand || 'Sans Marque'}</p>
                    </div>
                  </td>
                  <td className="p-4 dark:text-gray-300 uppercase text-xs tracking-widest">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
                      {product.category === 'glasses' 
                        ? 'Lunettes' 
                        : product.category === 'perfume' 
                        ? 'Parfum' 
                        : product.category === 'watches' 
                        ? 'Montre' 
                        : product.category === 'other' 
                        ? 'Divers' 
                        : product.category}
                    </span>
                    {product.subcategory && (
                      <span className="text-[10px] text-gray-400 block lowercase mt-1 font-semibold tracking-wider bg-gray-50 dark:bg-zinc-900 px-2 py-0.5 rounded-full w-fit">
                        {product.subcategory === 'noir_fume' 
                          ? 'noir fumé' 
                          : product.subcategory === 'photogray' 
                          ? 'photogray' 
                          : product.subcategory === 'avec_alcool' 
                          ? 'avec alcool' 
                          : product.subcategory === 'sans_alcool' 
                          ? 'sans alcool' 
                          : product.subcategory}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold dark:text-white">{new Intl.NumberFormat('fr-FR').format(product.base_price)} FCFA</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button 
                        title="Modifier" 
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 text-gray-400 hover:text-bustantech-gold transition-colors"
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
              ))}
              {paginatedProducts.length === 0 && !loading && (
                 <tr><td colSpan="4" className="text-center py-10 text-gray-500">Aucun produit trouvé.</td></tr>
              )}
            </tbody>
          </table>
          
          {/* CONTRÔLES DE PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900/30">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                Page <span className="text-bustantech-gold">{currentPage}</span> sur {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-bustantech-black rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <ChevronLeft size={18} className="dark:text-white" />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-bustantech-black rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <ChevronRight size={18} className="dark:text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
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
                    className="w-full px-4 py-3 bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors shadow-sm cursor-pointer text-sm"
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
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors shadow-sm cursor-pointer"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="shipped">Livré</option>
                  </select>
                </div>
                <button 
                  onClick={exportOrdersToCSV}
                  className="w-full sm:w-auto justify-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 hover:border-bustantech-gold dark:hover:border-bustantech-gold text-gray-700 dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Download size={20} />
                  Exporter CSV
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-bustantech-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
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
                  {/* Filtrer les commandes par statut et par mois */}
                  {orders?.filter(order => {
                    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
                    const orderMonth = MONTHS[new Date(order.created_at).getMonth()];
                    const matchMonth = monthFilter === 'all' || orderMonth === monthFilter;
                    return matchStatus && matchMonth;
                  }).length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">Aucune commande trouvée.</td></tr>
                  ) : orders?.map(order => (
                    <React.Fragment key={order.id}>
                    <tr onClick={() => toggleOrderDetails(order.id)} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                      <td className="p-4 font-bold dark:text-white flex items-center gap-3">
                        {expandedOrderId === order.id ? <ChevronUp size={16} className="text-bustantech-gold" /> : <ChevronDown size={16} className="text-gray-400 group-hover:text-bustantech-gold transition-colors" />}
                        # {order.id.toString().padStart(4, '0')}
                      </td>
                      <td className="p-4">
                        <p className="font-bold dark:text-white">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </td>
                      <td className="p-4 dark:text-gray-300">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-bustantech-gold">
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
                    {/* SOUS-LIGNE DES DÉTAILS DE LA COMMANDE */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50/50 dark:bg-zinc-900/30">
                        <td colSpan="5" className="p-6 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm dark:text-white uppercase tracking-widest text-bustantech-gold flex items-center gap-2">
                              <ShoppingBag size={16} /> Détails de la commande
                            </h4>
                            <button 
                              onClick={() => printInvoice(order)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
                            >
                              <Printer size={14} /> Imprimer Facture
                            </button>
                          </div>
                          <div className="bg-white dark:bg-bustantech-black border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
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
                                      {item.variant && String(item.variant).trim().toLowerCase() !== 'null' && <p className="text-[10px] text-bustantech-gold uppercase tracking-widest mt-0.5">{item.variant}</p>}
                                    </td>
                                    <td className="p-3 text-center font-medium dark:text-gray-300">{item.quantity}</td>
                                    <td className="p-3 text-right dark:text-gray-400">{new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</td>
                                    <td className="p-3 text-right font-bold text-bustantech-gold">{new Intl.NumberFormat('fr-FR').format(item.unit_price * item.quantity)} FCFA</td>
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
          </div>
        )}

        {/* SECTION : AVIS CLIENTS (Modération) */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold dark:text-white">Modération des Avis</h1>
              <p className="text-gray-500 mt-2">Gérez les avis et notes laissés par vos clients.</p>
            </div>

            <div className="bg-white dark:bg-bustantech-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
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
                            <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-bustantech-gold' : 'text-gray-300 dark:text-gray-700'} />
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
          </div>
        )}

        {/* SECTION : JOURNAL D'AUDIT */}
        {activeTab === 'audit' && userRole === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Journal d'activité</h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Historique des actions effectuées par votre équipe sur le système.</p>
            </div>

            <div className="bg-white dark:bg-bustantech-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
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
                <form onSubmit={handleUpdateSettings} className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex items-center justify-between mb-2">
                       <h3 className="font-bold dark:text-white uppercase tracking-widest text-sm text-bustantech-gold">Information de la Boutique</h3>
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
                      <input value={siteSettings.store_name} onChange={e => setSiteSettings({...siteSettings, store_name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email de Contact</label>
                      <input value={siteSettings.contact_email} onChange={e => setSiteSettings({...siteSettings, contact_email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Téléphone WhatsApp (International)</label>
                      <input value={siteSettings.whatsapp_number} onChange={e => setSiteSettings({...siteSettings, whatsapp_number: e.target.value})} placeholder="22177..." className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Lien Google Maps</label>
                      <input value={siteSettings.maps_link} onChange={e => setSiteSettings({...siteSettings, maps_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Adresse Physique</label>
                       <input value={siteSettings.contact_address} onChange={e => setSiteSettings({...siteSettings, contact_address: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <h3 className="md:col-span-3 font-bold dark:text-white uppercase tracking-widest text-sm text-bustantech-gold">Tarifs de Livraison (FCFA)</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Dakar</label>
                      <input type="number" value={siteSettings.delivery_cost_dakar} onChange={e => setSiteSettings({...siteSettings, delivery_cost_dakar: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Autour de Dakar / Banlieue</label>
                      <input type="number" value={siteSettings.delivery_cost_suburbs} onChange={e => setSiteSettings({...siteSettings, delivery_cost_suburbs: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Régions</label>
                      <input type="number" value={siteSettings.delivery_cost_regions} onChange={e => setSiteSettings({...siteSettings, delivery_cost_regions: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h3 className="md:col-span-2 font-bold dark:text-white uppercase tracking-widest text-sm text-bustantech-gold">Réseaux Sociaux</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Instagram</label>
                      <input value={siteSettings.instagram_link} onChange={e => setSiteSettings({...siteSettings, instagram_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">TikTok</label>
                      <input value={siteSettings.tiktok_link} onChange={e => setSiteSettings({...siteSettings, tiktok_link: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isUpdatingSettings}
                      className="bg-bustantech-gold text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isUpdatingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      SAUVEGARDER LES RÉGLAGES
                    </button>
                  </div>
                </form>
              </div>

              {/* Sécurité Compte */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-bustantech-black p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-bustantech-gold" size={24} />
                    <h3 className="font-bold dark:text-white uppercase tracking-widest text-sm">Sécurité du Compte</h3>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe actuel</label>
                      <input required type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nouveau mot de passe</label>
                      <input required type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Confirmer</label>
                      <input required type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 dark:text-white focus:border-bustantech-gold outline-none transition-colors" />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-bustantech-black dark:bg-zinc-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
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

        </div>
      </main>

      {/* MODAL AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-bustantech-black w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 shrink-0">
              <h3 className="text-lg md:text-xl font-bold dark:text-white tracking-widest uppercase">{editingId ? 'Modifier le Produit' : 'Nouveau Produit Exclusif'}</h3>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom du Produit</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Ex: iPhone 16 Pro Max" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Marque</label>
                  <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} type="text" placeholder="Ex: Apple" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Prix Actuel</label>
                  <input required value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Ancien Prix</label>
                  <input value={formData.compare_at_price} onChange={e => setFormData({...formData, compare_at_price: e.target.value})} type="number" step="0.01" placeholder="Ex: 120000" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Catégorie</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subcategory: ''})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors">
                  <option value="glasses">Lunettes de Soleil & Vue</option>
                  <option value="perfume">Parfumerie de Niche</option>
                  <option value="watches">Montres de Prestige</option>
                  <option value="other">Divers & Accessoires</option>
                </select>
              </div>
              
              {/* NOUVEAU : SOUS-CATÉGORIES POUR LUNETTES ET PARFUMS */}
              {(formData.category === 'glasses' || formData.category === 'perfume') && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Sous-Catégorie</label>
                  <select 
                    value={formData.subcategory || ''} 
                    onChange={e => setFormData({...formData, subcategory: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors"
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
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Images & Vidéos (Glissez ou Cliquez)</label>
                <div className="flex flex-col gap-3">
                    <input multiple onChange={e => setSelectedFiles(Array.from(e.target.files))} type="file" accept="image/*,video/mp4,video/quicktime" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-bustantech-gold file:text-white hover:file:bg-bustantech-gold-dark cursor-pointer" />
                    
                    {/* PREVIEW DES MÉDIAS */}
                    {(formData.existing_media.length > 0 || selectedFiles.length > 0) && (
                        <div className="flex gap-2 flex-wrap mt-2 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {/* Médias Existants (Edit) */}
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
                            {/* Nouveaux Médias (Files) */}
                            {selectedFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="relative w-16 h-16 group rounded-2xl overflow-hidden border border-bustantech-gold/50 shadow-sm">
                                    <div className="absolute top-0 left-0 bg-bustantech-gold text-white text-[8px] font-bold px-1 rounded-br-sm z-10">NOUVEAU</div>
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

              {/* SECTION VARIANTES */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Variantes (Options, Tailles, etc.)</label>
                  <button type="button" onClick={handleAddVariant} className="text-xs bg-gray-100 dark:bg-zinc-800 text-bustantech-gold px-3 py-1 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">+ Ajouter Option</button>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {formData.variants?.map((variant, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 bg-gray-50 dark:bg-zinc-900/50 p-3 sm:p-2 rounded-2xl border border-gray-200 dark:border-gray-800 relative">
                      <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:flex-1">
                        <input placeholder="SKU" value={variant.sku} onChange={e => handleVariantChange(idx, 'sku', e.target.value)} className="w-full sm:w-1/4 text-sm sm:text-xs bg-transparent border-b border-gray-300 dark:border-gray-700 pb-1 dark:text-white outline-none focus:border-bustantech-gold" />
                        <input placeholder="Nom/Taille" value={variant.attribute_value} onChange={e => handleVariantChange(idx, 'attribute_value', e.target.value)} className="w-full sm:w-1/4 text-sm sm:text-xs bg-transparent border-b border-gray-300 dark:border-gray-700 pb-1 dark:text-white outline-none focus:border-bustantech-gold" />
                        <input type="number" placeholder="Stock" value={variant.stock_quantity} onChange={e => handleVariantChange(idx, 'stock_quantity', e.target.value)} className="w-full sm:w-1/4 text-sm sm:text-xs bg-transparent border-b border-gray-300 dark:border-gray-700 pb-1 dark:text-white outline-none focus:border-bustantech-gold" />
                        <input type="number" placeholder="+ Prix" value={variant.price_modifier} onChange={e => handleVariantChange(idx, 'price_modifier', e.target.value)} className="w-full sm:w-1/4 text-sm sm:text-xs bg-transparent border-b border-gray-300 dark:border-gray-700 pb-1 dark:text-white outline-none focus:border-bustantech-gold" />
                      </div>
                      <button type="button" onClick={() => handleRemoveVariant(idx)} className="absolute top-1 right-1 sm:static text-gray-400 hover:text-red-500 p-1 bg-white dark:bg-zinc-800 sm:bg-transparent rounded-full shadow-sm sm:shadow-none"><X size={14} /></button>
                    </div>
                  ))}
                  {(!formData.variants || formData.variants.length === 0) && (
                    <p className="text-xs text-gray-500 italic">Aucune variante. Le produit sera vendu sans option de choix.</p>
                  )}
                </div>
              </div>
            </form>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" disabled={isUploading} onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">Annuler</button>
              <button form="productForm" type="submit" disabled={isUploading} className="px-6 sm:px-8 py-3 text-sm bg-bustantech-gold text-white font-bold rounded-full shadow-md hover:bg-bustantech-gold-dark transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ENVOI...
                    </>
                  ) : (
                    editingId ? 'MODIFIER' : 'AJOUTER'
                  )}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT EMPLOYÉ */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => setIsEmployeeModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-bustantech-black w-full max-w-md max-h-[95vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 shrink-0 flex items-center gap-3">
              <Shield className="text-bustantech-gold" size={24} />
              <h3 className="text-lg md:text-xl font-bold dark:text-white tracking-widest uppercase">Nouvel Accès Collaborateur</h3>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <form id="employeeForm" onSubmit={handleEmployeeSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nom Complet</label>
                <input required value={employeeForm.full_name} onChange={e => setEmployeeForm({...employeeForm, full_name: e.target.value})} type="text" placeholder="Ex: Jean Dupont" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email Professionnel</label>
                <input required value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} type="email" placeholder="jean@bustantech.com" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mot de passe temporaire</label>
                <input required value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Niveau d'accès (Rôle)</label>
                <select value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-3 dark:text-white focus:border-bustantech-gold outline-none transition-colors cursor-pointer text-sm md:text-base">
                  <option value="moderator">Modérateur (Peut gérer les produits et commandes)</option>
                  <option value="admin">Administrateur (Accès total)</option>
                </select>
              </div>
            </form>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" disabled={isUploading} onClick={() => setIsEmployeeModalOpen(false)} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider disabled:opacity-50">Annuler</button>
              <button form="employeeForm" type="submit" disabled={isUploading} className="px-6 sm:px-8 py-3 text-sm bg-bustantech-gold text-white font-bold rounded-full shadow-md hover:bg-bustantech-gold-dark transition-colors uppercase tracking-wider disabled:opacity-50">CRÉER LE COMPTE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-2 sm:p-4 cursor-pointer" onClick={() => setProductToDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-bustantech-black w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 border border-red-500/30 cursor-default">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-red-50 dark:bg-red-950/20 shrink-0">
              <h3 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-500 tracking-widest uppercase">Confirmation de suppression</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer définitivement le produit <span className="font-bold text-black dark:text-white">"{productToDelete.name}"</span> ? Cette action est irréversible.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button type="button" onClick={() => setProductToDelete(null)} className="px-4 sm:px-6 py-3 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider">Annuler</button>
              <button type="button" onClick={handleDelete} className="px-6 sm:px-8 py-3 text-sm bg-red-500 text-white font-bold rounded-full shadow-md hover:bg-red-600 transition-colors uppercase tracking-wider flex items-center gap-2">
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
