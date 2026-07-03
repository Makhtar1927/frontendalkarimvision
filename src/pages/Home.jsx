import Hero from '../components/Hero';
import CategoryStrip from '../components/CategoryStrip';
import ProductGrid from '../components/ProductGrid';
import ContactLocation from '../components/ContactLocation';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Glasses, Truck, MessageCircle } from 'lucide-react';

const SERVICES = [
  {
    icon: Glasses,
    title: 'Lunettes sur ordonnance',
    description: 'Apportez votre ordonnance et nous montons vos verres correcteurs dans la monture de votre choix. Verres progressifs, unifocaux, anti-reflet et anti-lumière bleue disponibles.',
    accent: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
  },
  {
    icon: Truck,
    title: 'Livraison à domicile',
    description: 'Commandez depuis chez vous et recevez votre colis partout au Sénégal. Livraison disponible à Dakar, Touba et dans les principales villes.',
    accent: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: MessageCircle,
    title: 'Conseil personnalisé',
    description: 'Notre équipe vous accompagne pour choisir la monture adaptée à votre morphologie, votre style et votre budget. Contactez-nous sur WhatsApp pour toute question.',
    accent: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
  },
];

const ServicesSection = () => (
  <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="mb-8 text-center">
      <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.25em]">Ce que nous faisons</p>
      <h2 className="text-2xl sm:text-3xl font-black dark:text-white mt-1">Nos services</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {SERVICES.map(({ icon: Icon, title, description, accent, iconBg }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className={`rounded-2xl border p-6 flex flex-col gap-4 ${accent}`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="font-black text-base dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const Home = () => {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://www.alkarimvision.com/#store",
    "name": "Al Karim Vision",
    "url": "https://www.alkarimvision.com/",
    "logo": "https://www.alkarimvision.com/logo.png",
    "image": "https://www.alkarimvision.com/logo.png",
    "description": "Al Karim Vision - Votre opticien de prestige, haute parfumerie et horlogerie d'exception à Touba.",
    "telephone": "+221784379462",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Touba Darou Khoudoss, Niary Etage",
      "addressLocality": "Touba",
      "addressCountry": "SN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.860536",
      "longitude": "-15.883519"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    },
    "sameAs": [
      "https://maps.google.com/?q=14.860536,-15.883519"
    ]
  };

  return (
    <>
      <SEO 
        title="Optique, Parfumerie & Horlogerie de Prestige à Touba"
        description="Découvrez l'excellence chez Al Karim Vision à Touba : Lunettes de vue et de soleil de marque, parfums authentiques et montres d'exception au meilleur prix."
        keywords="optique Touba, lunettes de soleil Sénégal, parfum authentique Touba, montres de marque Sénégal, Al Karim Vision Touba, lunettes de vue Sénégal"
        schema={storeSchema}
      />
      <Hero />
      <CategoryStrip />
      <ServicesSection />
      <ProductGrid />
      <ContactLocation />
    </>
  );
};

export default Home;