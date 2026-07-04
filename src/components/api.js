import { useAuthStore } from '../store/useAuthStore';

// SYSTEM OF MOCK DATA FOR OFFLINE/CLIENT-SIDE DEMO MODE
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

const INITIAL_PRODUCTS = [
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

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    customer_name: 'Amadou Diop',
    customer_phone: '776543210',
    customer_address: 'Dakar Plateau',
    status: 'pending',
    total_amount: 170000,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { product_name: 'Ray-Ban Aviator Classic', variant: 'Standard', quantity: 2, unit_price: 85000 }
    ]
  },
  {
    id: 'ord-1002',
    customer_name: 'Fatou Ndiaye',
    customer_phone: '781234567',
    customer_address: 'Mermoz',
    status: 'delivered',
    total_amount: 395000,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { product_name: 'Tissot PRX Powermatic 80', variant: 'Cadran Bleu', quantity: 1, unit_price: 450000 },
      { product_name: 'Sauvage Elixir', variant: '60ml', quantity: 1, unit_price: 120000 }
    ]
  }
];

const INITIAL_SETTINGS = {
  id: 1,
  store_name: "Al Karim Vision",
  maintenance_mode: false,
  contact_email: "amdydieng062@gmail.com",
  contact_phone: "221765662711",
  whatsapp_number: "221765662711",
  contact_address: "Niary Etage, Route de Ndiouga Kébé, Touba, Sénégal",
  maps_link: "https://www.google.com/maps?q=14.8605356,-15.8835194&z=17&hl=fr",
  delivery_cost_dakar: 2000,
  delivery_cost_suburbs: 3000,
  delivery_cost_regions: 5000,
  instagram_link: "https://www.instagram.com/al_karim_vision_566?igsh=MnhkcXV3emQ5MDNr",
  tiktok_link: "https://www.tiktok.com/@alkarimvision?_r=1&_t=ZS-97ekUvrRmZ2",
  snapchat_link: "https://www.snapchat.com/add/alkarimvision66"
};

const INITIAL_SLIDES = [
  {
    id: 'slide-1',
    title: "Bienvenue chez Al Karim Vision",
    subtitle: "Lunettes de marque, montres et parfums de qualité — Showroom à Touba.",
    category: "SHOWROOM",
    image_url: "/boutique-showroom.jpg",
    link_url: '/shop',
    button_text: "Explorer la boutique",
    position: 0,
    active: true
  },
  {
    id: 'slide-2',
    title: "Clarté & Style Unique",
    subtitle: "Des centaines de montures Ray-Ban, Gucci, Tom Ford, Prada et bien plus.",
    category: "LUNETTES",
    image_url: "/boutique-interieur-1.jpg",
    link_url: '/category/glasses',
    button_text: "Découvrir les lunettes",
    position: 1,
    active: true
  },
  {
    id: 'slide-3',
    title: "L'Essence du Luxe",
    subtitle: "Parfums authentiques avec et sans alcool, pour Elle & Lui.",
    category: "PARFUMERIE",
    image_url: "/boutique-interieur-2.jpg",
    link_url: '/category/perfume',
    button_text: "Voir les parfums",
    position: 2,
    active: true
  },
  {
    id: 'slide-4',
    title: "Service Personnalisé",
    subtitle: "Un accueil chaleureux et des conseils adaptés à vos besoins.",
    category: "VOTRE BOUTIQUE",
    image_url: "/boutique-owner.jpg",
    link_url: '/shop',
    button_text: "Nous contacter",
    position: 3,
    active: true
  }
];

// Version du cache mock — incrémenter ici pour forcer la réinitialisation du localStorage
const MOCK_DATA_VERSION = '2';

// LocalStorage helpers to simulate database persistence
const getMockData = (key, initial) => {
  if (typeof window === 'undefined') return initial;
  
  // Vérifier si la version du cache est à jour
  const storedVersion = localStorage.getItem('mock_data_version');
  if (storedVersion !== MOCK_DATA_VERSION) {
    // Nouvelle version détectée : on réinitialise toutes les données mock
    localStorage.clear();
    localStorage.setItem('mock_data_version', MOCK_DATA_VERSION);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...initial, ...parsed };
    }
    return parsed;
  } catch(e) {
    return initial;
  }
};

const saveMockData = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const handleMockRequest = async (endpoint, options) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const products = getMockData('mock_products', INITIAL_PRODUCTS);
  const orders = getMockData('mock_orders', INITIAL_ORDERS);
  const settings = getMockData('mock_settings', INITIAL_SETTINGS);
  const slides = getMockData('mock_slides', INITIAL_SLIDES);

  const getCleanJson = (data) => {
    return {
      ok: true,
      status: 200,
      json: async () => data
    };
  };

  // 1. GET /products/stats
  if (endpoint.startsWith('/products/stats') && (options.method === 'GET' || !options.method)) {
    const stats = {
      graph: [
        { date: '06/15', total: 185000 },
        { date: '06/16', total: 240000 },
        { date: '06/17', total: 150000 },
        { date: '06/18', total: 320000 },
        { date: '06/19', total: 280000 },
        { date: '06/20', total: 420000 },
        { date: '06/21', total: 390000 }
      ],
      categorySales: [
        { name: 'Lunettes', value: 45 },
        { name: 'Parfums', value: 30 },
        { name: 'Montres', value: 20 },
        { name: 'Divers', value: 5 }
      ],
      kpi: {
        revenusMois: 1985000,
        commandesMois: orders.length
      }
    };
    return getCleanJson(stats);
  }

  // GET /products/:id/reviews
  const reviewsMatch = endpoint.match(/\/products\/([^\/\?]+)\/reviews$/);
  if (reviewsMatch && (options.method === 'GET' || !options.method)) {
    return getCleanJson([]);
  }

  // POST /products/:id/reviews
  if (reviewsMatch && options.method === 'POST') {
    const body = JSON.parse(options.body);
    const newReview = {
      id: Date.now(),
      product_id: reviewsMatch[1],
      customer_name: body.customer_name,
      rating: body.rating,
      comment: body.comment,
      created_at: new Date().toISOString()
    };
    return getCleanJson(newReview);
  }

  // GET /products/:id
  const idMatch = endpoint.match(/\/products\/([^\/\?]+)$/);
  if (idMatch && (options.method === 'GET' || !options.method)) {
    const id = idMatch[1];
    const prod = products.find(p => p.id === id);
    if (!prod) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: "Produit introuvable" })
      };
    }
    return getCleanJson(prod);
  }

  // GET /products
  if ((endpoint === '/products' || endpoint.startsWith('/products?')) && (options.method === 'GET' || !options.method)) {
    return getCleanJson({ products });
  }

  // 2. POST /auth/login
  if (endpoint === '/auth/login' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    if ((body.email === 'amdydieng062@gmail.com' || body.email === 'alkarimvision@gmail.com') && body.password === 'alkarim') {
      const payloadObj = {
        id: 1,
        role: 'admin',
        full_name: 'Admin Al Karim',
        exp: Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000)
      };
      const token = 'mock.' + btoa(JSON.stringify(payloadObj)) + '.signature';
      return getCleanJson({
        message: "Connexion réussie",
        token: token,
        admin: { name: 'Admin Al Karim', email: body.email }
      });
    } else {
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: "Identifiants invalides" })
      };
    }
  }

  // 3. GET /orders
  if (endpoint === '/orders' && (options.method === 'GET' || !options.method)) {
    return getCleanJson(orders);
  }

  // 4. POST /orders
  if (endpoint === '/orders' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    const newOrder = {
      id: 'ord-' + (1000 + orders.length + 1).toString(),
      customer_name: body.customer_name || 'Client',
      customer_phone: body.customer_phone || '',
      customer_address: body.customer_address || '',
      status: 'pending',
      total_amount: body.total_amount || 0,
      created_at: new Date().toISOString(),
      items: body.items || []
    };
    orders.unshift(newOrder);
    saveMockData('mock_orders', orders);
    return getCleanJson({ message: "Commande créée avec succès", order: newOrder });
  }

  // 5. PUT /orders/:id/status
  if (endpoint.startsWith('/orders/') && endpoint.endsWith('/status') && options.method === 'PUT') {
    const id = endpoint.split('/')[2];
    const body = JSON.parse(options.body);
    const updatedOrders = orders.map(o => {
      if (o.id === id) {
        return { ...o, status: body.status };
      }
      return o;
    });
    saveMockData('mock_orders', updatedOrders);
    const updatedOrder = updatedOrders.find(o => o.id === id);
    return getCleanJson({ message: "Statut mis à jour", order: updatedOrder });
  }

  // 6. GET /orders/:id/status
  if (endpoint.startsWith('/orders/') && endpoint.endsWith('/status') && (options.method === 'GET' || !options.method)) {
    const id = endpoint.split('/')[2];
    const order = orders.find(o => o.id === id);
    if (!order) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: "Commande introuvable" })
      };
    }
    return getCleanJson({ id: order.id, total_amount: order.total_amount, status: order.status });
  }

  // 7. GET /settings
  if (endpoint === '/settings' && (options.method === 'GET' || !options.method)) {
    return getCleanJson(settings);
  }

  // 8. PATCH /settings
  if (endpoint === '/settings' && options.method === 'PATCH') {
    const body = JSON.parse(options.body);
    const updatedSettings = { ...settings, ...body };
    saveMockData('mock_settings', updatedSettings);
    return getCleanJson(updatedSettings);
  }

  // 9. POST /products
  if (endpoint === '/products' && options.method === 'POST') {
    const formData = options.body;
    const name = formData.get('name');
    const brand = formData.get('brand');
    const category = formData.get('category') || 'glasses';
    const subcategory = formData.get('subcategory') || '';
    const base_price = formData.get('base_price') || '0';
    const compare_at_price = formData.get('compare_at_price') || '';
    const description = formData.get('description') || '';
    const mediaFiles = formData.getAll('media');
    const imageFile = mediaFiles.length > 0 ? mediaFiles[0] : null;
    
    let image_url = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop';
    if (imageFile && imageFile.name) {
      image_url = URL.createObjectURL(imageFile);
    }

    const mediaUrls = mediaFiles.map(file => file.name ? URL.createObjectURL(file) : '');

    const variantsStr = formData.get('variants');
    let variants = [];
    if (variantsStr) {
      try {
        variants = JSON.parse(variantsStr);
      } catch(e) {}
    }

    const newProd = {
      id: 'mock-' + Date.now().toString(),
      name,
      brand,
      category,
      subcategory,
      base_price,
      compare_at_price: compare_at_price || null,
      description,
      image_url,
      media_urls: mediaUrls,
      variants
    };

    products.unshift(newProd);
    saveMockData('mock_products', products);
    return getCleanJson({ message: "Produit créé avec succès", product: newProd });
  }

  // 10. PUT /products/:id
  if (endpoint.startsWith('/products/') && options.method === 'PUT') {
    const id = endpoint.split('/')[2];
    const formData = options.body;
    const name = formData.get('name');
    const brand = formData.get('brand');
    const category = formData.get('category') || 'glasses';
    const subcategory = formData.get('subcategory') || '';
    const base_price = formData.get('base_price') || '0';
    const compare_at_price = formData.get('compare_at_price') || '';
    const description = formData.get('description') || '';
    const mediaFiles = formData.getAll('media');
    const imageFile = mediaFiles.length > 0 ? mediaFiles[0] : null;
    
    let image_url = null;
    if (imageFile && imageFile.name) {
      image_url = URL.createObjectURL(imageFile);
    }

    const existingMediaStr = formData.get('existing_media');
    let parsedExistingMedia = [];
    if (existingMediaStr) {
      try {
        parsedExistingMedia = JSON.parse(existingMediaStr);
      } catch (e) {}
    }
    const newMediaUrls = mediaFiles.map(file => file.name ? URL.createObjectURL(file) : '');
    const finalMediaUrls = [...parsedExistingMedia, ...newMediaUrls];
    const finalImageUrl = finalMediaUrls.length > 0 ? finalMediaUrls[0] : (image_url || null);

    const variantsStr = formData.get('variants');
    let variants = null;
    if (variantsStr) {
      try {
        variants = JSON.parse(variantsStr);
      } catch(e) {}
    }

    const updatedProducts = products.map(p => {
      if (p.id === id) {
        const u = {
          ...p,
          name,
          brand,
          category,
          subcategory,
          base_price,
          compare_at_price: compare_at_price || null,
          description,
          media_urls: finalMediaUrls
        };
        if (finalImageUrl) u.image_url = finalImageUrl;
        if (variants) u.variants = variants;
        return u;
      }
      return p;
    });

    saveMockData('mock_products', updatedProducts);
    return getCleanJson({ message: "Produit modifié avec succès" });
  }

  // 11. DELETE /products/:id
  if (endpoint.startsWith('/products/') && options.method === 'DELETE') {
    const id = endpoint.split('/')[2];
    const updatedProducts = products.filter(p => p.id !== id);
    saveMockData('mock_products', updatedProducts);
    return getCleanJson({ message: "Produit supprimé avec succès" });
  }

  // 12. GET /slides
  if (endpoint === '/slides' && (options.method === 'GET' || !options.method)) {
    const activeSlides = slides.filter(s => s.active).sort((a, b) => a.position - b.position);
    return getCleanJson(activeSlides);
  }

  // 13. GET /slides/all
  if (endpoint === '/slides/all' && (options.method === 'GET' || !options.method)) {
    return getCleanJson(slides.sort((a, b) => a.position - b.position));
  }

  // 14. POST /slides
  if (endpoint === '/slides' && options.method === 'POST') {
    const formData = options.body;
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const category = formData.get('category');
    const button_text = formData.get('button_text');
    const link_url = formData.get('link_url');
    const active = formData.get('active') === 'true';
    const imageFile = formData.get('image');
    
    let image_url = 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1200&auto=format&fit=crop';
    if (imageFile && imageFile.name) {
      image_url = URL.createObjectURL(imageFile);
    } else if (formData.get('image_url')) {
      image_url = formData.get('image_url');
    }

    const newSlide = {
      id: 'mock-slide-' + Date.now().toString(),
      title,
      subtitle,
      category,
      button_text,
      link_url,
      active,
      image_url,
      position: slides.length
    };

    slides.push(newSlide);
    saveMockData('mock_slides', slides);
    return getCleanJson(newSlide);
  }

  // 15. PUT /slides/:id
  if (endpoint.startsWith('/slides/') && options.method === 'PUT') {
    const id = endpoint.split('/')[2];
    const formData = options.body;
    
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const category = formData.get('category');
    const button_text = formData.get('button_text');
    const link_url = formData.get('link_url');
    const active = formData.get('active') === 'true';
    const position = formData.get('position');
    const imageFile = formData.get('image');
    const existingImageUrl = formData.get('image_url');

    let image_url = null;
    if (imageFile && imageFile.name) {
      image_url = URL.createObjectURL(imageFile);
    } else if (existingImageUrl) {
      image_url = existingImageUrl;
    }

    const updatedSlides = slides.map(s => {
      if (String(s.id) === String(id)) {
        const u = {
          ...s,
          title: title !== null ? title : s.title,
          subtitle: subtitle !== null ? subtitle : s.subtitle,
          category: category !== null ? category : s.category,
          button_text: button_text !== null ? button_text : s.button_text,
          link_url: link_url !== null ? link_url : s.link_url,
          active: active !== undefined ? active : s.active,
        };
        if (position !== null && position !== undefined) u.position = parseInt(position);
        if (image_url) u.image_url = image_url;
        return u;
      }
      return s;
    });

    saveMockData('mock_slides', updatedSlides);
    const updatedSlide = updatedSlides.find(s => String(s.id) === String(id));
    return getCleanJson(updatedSlide);
  }

  // 16. DELETE /slides/:id
  if (endpoint.startsWith('/slides/') && options.method === 'DELETE') {
    const id = endpoint.split('/')[2];
    const updatedSlides = slides.filter(s => String(s.id) !== String(id));
    saveMockData('mock_slides', updatedSlides);
    return getCleanJson({ message: "Slide supprimé avec succès" });
  }

  // 17. PATCH /slides/positions
  if (endpoint === '/slides/positions' && options.method === 'PATCH') {
    const body = JSON.parse(options.body);
    const updatedSlides = slides.map(s => {
      const match = body.positions.find(p => String(p.id) === String(s.id));
      if (match) {
        return { ...s, position: parseInt(match.position) };
      }
      return s;
    });
    saveMockData('mock_slides', updatedSlides);
    return getCleanJson({ message: "Positions triées avec succès" });
  }

  return {
    ok: false,
    status: 404,
    json: async () => ({ error: "Route non trouvée en mode mock" })
  };
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (endpoint, options = {}) => {
  if (MOCK_MODE) {
    return handleMockRequest(endpoint, options);
  }

  const token = useAuthStore.getState().token;
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Erreur réseau API :", error);
    throw new Error("Serveur injoignable. Vérifiez que le backend est bien lancé sur le port 5000.");
  }

  if (response.status === 401 && !endpoint.includes('/login')) {
    useAuthStore.getState().logout();
  }

  return response;
};

export const apiUploadWithProgress = (endpoint, formData, onProgress, method = 'POST') => {
  if (MOCK_MODE) {
    return new Promise((resolve, reject) => {
      // Simulate file upload progress
      let pct = 0;
      const interval = setInterval(() => {
        pct += 25;
        onProgress(pct);
        if (pct >= 100) {
          clearInterval(interval);
          handleMockRequest(endpoint, { method, body: formData })
            .then(res => res.json())
            .then(resolve)
            .catch(reject);
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    const token = useAuthStore.getState().token;
    const xhr = new XMLHttpRequest();

    xhr.open(method, `${BASE_URL}${endpoint}`, true);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        if (xhr.status === 401) {
          useAuthStore.getState().logout();
        }
        reject(new Error(xhr.responseText || "Erreur d'upload"));
      }
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l'upload"));
    xhr.send(formData);
  });
};