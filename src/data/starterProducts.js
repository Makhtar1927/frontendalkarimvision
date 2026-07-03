const imagePath = (filename) => `/temp_products/${filename}`;

const variant = (sku, stock = 10, label = 'Standard') => ({
  sku,
  attribute_value: label,
  price_modifier: 0,
  stock_quantity: stock
});

export const STARTER_CATEGORIES = [
  { id: 1, name: 'glasses', slug: 'glasses' },
  { id: 2, name: 'perfume', slug: 'perfume' },
  { id: 3, name: 'watches', slug: 'watches' },
  { id: 4, name: 'other', slug: 'other' }
];

export const STARTER_PRODUCTS = [
  {
    id: 'starter-watch-winder-double',
    category: 'watches',
    category_id: 3,
    brand: 'Al Karim Vision',
    name: 'Remontoir double pour montres',
    base_price: '45000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.13.59 (1).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.13.59 (1).jpeg')],
    variants: [variant('STARTER-WINDER-DOUBLE', 4)]
  },
  {
    id: 'starter-lattafa-his-confession',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'His Confession Eau de Parfum',
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.13.59 (2).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.13.59 (2).jpeg')],
    variants: [variant('STARTER-HIS-CONFESSION', 8, '100ml')]
  },
  {
    id: 'starter-black-wood-stand-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Al Karim Vision',
    name: 'Lunettes rectangulaires noires',
    base_price: '15000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.13.59.jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.13.59.jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (6).jpeg')
    ],
    variants: [variant('STARTER-BLACK-RECT-01', 12)]
  },
  {
    id: 'starter-dirham-silver',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Ard Al Zaafaran',
    name: 'Dirham Eau de Parfum',
    base_price: '18000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (2).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (2).jpeg')],
    variants: [variant('STARTER-DIRHAM', 10, '100ml')]
  },
  {
    id: 'starter-bold-black-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'noir_fume',
    brand: 'Prada Style',
    name: 'Lunettes noires bold',
    base_price: '20000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (3).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (3).jpeg')],
    variants: [variant('STARTER-BOLD-BLACK', 8)]
  },
  {
    id: 'starter-musk-tahara-vanilla',
    category: 'perfume',
    category_id: 2,
    subcategory: 'sans_alcool',
    brand: 'Musk Collection',
    name: 'Tahara Vanilla Coffret',
    base_price: '15000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (4).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (4).jpeg')],
    variants: [variant('STARTER-MUSK-TAHARA-VANILLA', 10, 'Coffret')]
  },
  {
    id: 'starter-gold-watch-jewelry-set',
    category: 'watches',
    category_id: 3,
    brand: 'Al Karim Vision',
    name: 'Coffret montre dorée avec bijoux',
    base_price: '35000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (5).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.00 (5).jpeg')],
    variants: [variant('STARTER-GOLD-WATCH-SET', 5, 'Coffret')]
  },
  {
    id: 'starter-tortoise-sunglasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'noir_fume',
    brand: 'Al Karim Vision',
    name: 'Lunettes solaires écaille',
    base_price: '15000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.00.jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.00.jpeg')],
    variants: [variant('STARTER-TORTOISE-SUN', 10)]
  },
  {
    id: 'starter-clubmaster-sunglasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'noir_fume',
    brand: 'Ray-Ban Style',
    name: 'Lunettes solaires Clubmaster',
    base_price: '20000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (1).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (1).jpeg')],
    variants: [variant('STARTER-CLUBMASTER', 8)]
  },
  {
    id: 'starter-clear-frame-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Al Karim Vision',
    name: 'Lunettes transparentes',
    base_price: '15000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (2).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (2).jpeg')],
    variants: [variant('STARTER-CLEAR-FRAME', 12)]
  },
  {
    id: 'starter-duo-watch-red-box',
    category: 'watches',
    category_id: 3,
    brand: 'Al Karim Vision',
    name: 'Coffret duo montres et bracelets',
    base_price: '50000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (3).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (3).jpeg')],
    variants: [variant('STARTER-DUO-WATCH-RED', 3, 'Coffret')]
  },
  {
    id: 'starter-lattafa-khamrah',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'Khamrah Eau de Parfum',
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (4).jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (4).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (4).jpeg')
    ],
    variants: [variant('STARTER-KHAMRAH', 12, '100ml')]
  },
  {
    id: 'starter-lattafa-khamrah-qahwa',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'Khamrah Qahwa Eau de Parfum',
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (5).jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.01 (5).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.04.jpeg')
    ],
    variants: [variant('STARTER-KHAMRAH-QAHWA', 12, '100ml')]
  },
  {
    id: 'starter-lv-style-black-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Louis Vuitton Style',
    name: 'Lunettes rectangulaires noires LV style',
    base_price: '20000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.01.jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.01.jpeg')],
    variants: [variant('STARTER-LV-BLACK-RECT', 8)]
  },
  {
    id: 'starter-gold-frame-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Al Karim Vision',
    name: 'Lunettes monture dorée',
    base_price: '18000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (1).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (1).jpeg')],
    variants: [variant('STARTER-GOLD-FRAME', 10)]
  },
  {
    id: 'starter-rolex-style-green-watch-set',
    category: 'watches',
    category_id: 3,
    brand: 'Rolex Style',
    name: 'Coffret montre verte avec accessoires',
    base_price: '45000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (2).jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (2).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (2).jpeg')
    ],
    variants: [variant('STARTER-GREEN-WATCH-SET', 4, 'Coffret')]
  },
  {
    id: 'starter-pink-yara-mayar',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'Parfum rose Yara / Mayar Blush',
    base_price: '22000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (3).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (3).jpeg')],
    variants: [variant('STARTER-PINK-YARA-MAYAR', 8, '100ml')]
  },
  {
    id: 'starter-lattafa-haya-blue',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'Haya Eau de Parfum',
    base_price: '22000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (4).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (4).jpeg')],
    variants: [variant('STARTER-HAYA-BLUE', 8, '100ml')]
  },
  {
    id: 'starter-round-gradient-sunglasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'noir_fume',
    brand: 'Al Karim Vision',
    name: 'Lunettes solaires rondes dégradées',
    base_price: '15000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (5).jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (5).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (3).jpeg')
    ],
    variants: [variant('STARTER-ROUND-GRADIENT', 10)]
  },
  {
    id: 'starter-oriental-perfume-selection',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Al Karim Vision',
    name: 'Sélection parfums orientaux',
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (6).jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.02 (6).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (3).jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (4).jpeg')
    ],
    variants: [variant('STARTER-ORIENTAL-SELECTION', 6, 'Assortiment')]
  },
  {
    id: 'starter-lattafa-eclaire',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: 'Eclaire Eau de Parfum',
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.02.jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.02.jpeg')],
    variants: [variant('STARTER-ECLAIRE', 8, '100ml')]
  },
  {
    id: 'starter-round-black-gold-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Al Karim Vision',
    name: 'Lunettes rondes noir et doré',
    base_price: '18000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (1).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (1).jpeg')],
    variants: [variant('STARTER-ROUND-BLACK-GOLD', 8)]
  },
  {
    id: 'starter-badee-al-oud-sublime',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: "Bade'e Al Oud Sublime",
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (2).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (2).jpeg')],
    variants: [variant('STARTER-BADEE-SUBLIME', 8, '100ml')]
  },
  {
    id: 'starter-oud-klassi',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Khadlaj',
    name: 'Oud Pour Klassik',
    base_price: '18000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (5).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.03 (5).jpeg')],
    variants: [variant('STARTER-OUD-KLASSI', 8, '100ml')]
  },
  {
    id: 'starter-badee-honor-glory',
    category: 'perfume',
    category_id: 2,
    subcategory: 'avec_alcool',
    brand: 'Lattafa',
    name: "Bade'e Al Oud Honor & Glory",
    base_price: '25000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.03.jpeg'),
    media_urls: [
      imagePath('WhatsApp Image 2026-07-01 at 01.14.03.jpeg'),
      imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (1).jpeg')
    ],
    variants: [variant('STARTER-BADEE-HONOR-GLORY', 10, '100ml')]
  },
  {
    id: 'starter-celine-round-glasses',
    category: 'glasses',
    category_id: 1,
    subcategory: 'photogray',
    brand: 'Celine',
    name: 'Lunettes rondes Celine',
    base_price: '20000.00',
    image_url: imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (5).jpeg'),
    media_urls: [imagePath('WhatsApp Image 2026-07-01 at 01.14.04 (5).jpeg')],
    variants: [variant('STARTER-CELINE-ROUND', 8)]
  }
];
