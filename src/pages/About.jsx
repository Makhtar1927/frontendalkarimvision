import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Star, Shield, Award, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import SEO from '../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
  }),
};

const VALEURS = [
  {
    icon: Shield,
    titre: 'Authenticité Garantie',
    texte: 'Chaque produit vendu chez Al Karim Vision est rigoureusement contrôlé et garanti authentique. Nous ne faisons aucun compromis sur la qualité.',
    badge: '01'
  },
  {
    icon: Star,
    titre: 'Excellence du Service',
    texte: 'Nous accompagnons chaque client avec une attention personnalisée pour lui proposer des montures et fragrances adaptées à son style.',
    badge: '02'
  },
  {
    icon: Award,
    titre: 'Produits de Prestige',
    texte: 'Nous sélectionnons des marques renommées mondialement dans l\'optique, la haute parfumerie et l\'horlogerie haut de gamme.',
    badge: '03'
  },
  {
    icon: Heart,
    titre: 'Satisfaction Client',
    texte: 'Votre satisfaction est notre priorité. Nous offrons une expérience d\'achat chaleureuse, honnête et mémorable à Touba.',
    badge: '04'
  },
];

const HORAIRES = [
  { jour: 'Tous les jours', heure: '08h30 – 23h00' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-gray-dark text-gray-800 dark:text-gray-200 overflow-x-hidden">
      <SEO 
        title="À Propos" 
        description="Découvrez l'histoire d'Al Karim Vision à Touba, notre engagement pour l'authenticité et notre sélection de lunettes, parfums et montres de prestige." 
      />

      {/* ── HERO FONDATEUR ── */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-zinc-800">
        
        {/* FOND : image boutique pleine largeur + blur + overlay */}
        <img
          src={getOptimizedImageUrl('/boutique-showroom.jpg')}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[3px]"
        />
        {/* Overlay pour préserver la lisibilité */}
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85" />

        {/* CONTENU HERO */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-0 md:min-h-[80vh] flex items-center">
          <div className="w-full grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-center">

            {/* Colonne gauche : texte */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1 md:col-span-7 text-left"
            >
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/25 text-brand-blue text-[10px] font-black uppercase tracking-[0.3em] px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                Fondateur
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-4 uppercase">
                Al Karim<br />
                <span className="text-brand-blue">Vision</span>
              </h1>
              
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-6">
                Touba, Sénégal — Optique · Parfums · Montres
              </p>

              <div className="w-12 h-1 bg-brand-blue rounded mb-6" />

              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
                Rendre l'élégance accessible à tous. Depuis Touba, Al Karim Vision sélectionne et propose des produits authentiques — lunettes de prestige, parfums rares et montres de qualité — pour chaque style et chaque budget.
              </p>

              {/* Stats Section - fully grid responsive */}
              <div className="grid grid-cols-3 divide-x divide-gray-250 dark:divide-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden w-full max-w-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-sm">
                {[
                  { val: '100%', label: 'Authentique' },
                  { val: '+3',   label: 'Catégories' },
                  { val: '∞',    label: 'Satisfaction' },
                ].map(({ val, label }) => (
                  <div key={label} className="px-3 sm:px-5 py-3 sm:py-4 text-center">
                    <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-none">{val}</p>
                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Colonne droite : portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 md:order-2 md:col-span-5 flex justify-center"
            >
              <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white dark:border-zinc-700 shadow-2xl shadow-brand-blue/15 flex-shrink-0 relative">
                <img
                  src={getOptimizedImageUrl('/alkarim-portrait.png')}
                  alt="Al Karim — Fondateur de Al Karim Vision"
                  className="w-full h-full object-cover object-top select-none"
                  draggable={false}
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── QUI SOMMES-NOUS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Notre mission</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-4 dark:text-white">Qualité, Élégance &amp; Satisfaction</h2>
            <p className="text-gray-650 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
              Al Karim Vision est une boutique spécialisée dans la vente de <strong className="text-gray-800 dark:text-white">lunettes de vue</strong>, <strong className="text-gray-800 dark:text-white">lunettes de soleil</strong>, <strong className="text-gray-800 dark:text-white">montres</strong> et <strong className="text-gray-800 dark:text-white">parfums</strong> de qualité.
            </p>
            <p className="text-gray-650 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
              Nous proposons un large choix de marques reconnues ainsi que des accessoires adaptés à tous les styles et budgets. Notre priorité est d'offrir à chaque client des produits authentiques, un accueil chaleureux et un service personnalisé.
            </p>
            <p className="text-gray-650 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              Fondée avec la vision de rendre l'élégance accessible, Al Karim Vision s'est imposée comme une référence de confiance dans la région de Touba et au-delà.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800">
              <img
                src={getOptimizedImageUrl('/boutique-showroom.jpg')}
                alt="Showroom Al Karim Vision"
                className="w-full h-60 sm:h-72 md:h-80 object-cover hover:scale-102 transition-transform duration-500"
                onError={e => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── NOS VALEURS ── */}
      <section className="bg-gray-50 dark:bg-zinc-900/30 py-16 sm:py-24 border-y border-gray-100 dark:border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Ce qui nous guide</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 dark:text-white">Nos Valeurs</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALEURS.map(({ icon: Icon, titre, texte, badge }, i) => (
              <motion.div
                key={titre}
                variants={fadeUp} 
                custom={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }}
                className="group relative bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-zinc-850 hover:border-brand-blue/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-300 dark:text-zinc-700 tracking-wider uppercase">{badge}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">{titre}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{texte}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS PRODUITS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Ce que nous vendons</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 dark:text-white">Nos Spécialités</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { img: getOptimizedImageUrl('/boutique-interieur-1.jpg'), label: 'Optique', desc: 'Lunettes de vue & soleil · Grandes marques · Verres premium' },
            { img: getOptimizedImageUrl('/boutique-interieur-2.jpg'), label: 'Parfumerie', desc: 'Parfums authentiques · Oud de prestige · Fragrances de niche' },
            { img: getOptimizedImageUrl('/boutique-extra-1.jpg'),     label: 'Horlogerie', desc: 'Montres de prestige · Modèles élégants homme & femme' },
          ].map(({ img, label, desc }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} 
              custom={i} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl shadow-sm h-60 border border-gray-100 dark:border-zinc-800"
            >
              <img 
                src={img} 
                alt={label} 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                onError={e => { e.target.parentElement.style.display='none'; }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                <span className="text-white font-black text-lg sm:text-xl uppercase tracking-wider">{label}</span>
                <span className="text-white/80 text-[11px] sm:text-xs mt-1 leading-relaxed">{desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INFOS DE CONTACT ── */}
      <section className="bg-gray-50 dark:bg-zinc-900/30 py-16 sm:py-24 border-t border-gray-100 dark:border-zinc-900" id="contact">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Venez nous rendre visite</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 dark:text-white">Nous Trouver</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Adresse */}
            <motion.div 
              variants={fadeUp} 
              custom={0} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-150 dark:border-zinc-850 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4 border border-brand-blue/10 text-brand-blue">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-base mb-2 dark:text-white">Adresse</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Niari, Route de Ndiouga Kébé<br />
                  <strong className="text-gray-800 dark:text-gray-200">Touba, Sénégal</strong>
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=14.860536,-15.883519"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-6 text-xs font-bold text-brand-blue hover:underline"
              >
                <MapPin size={13} /> Voir sur Google Maps
              </a>
            </motion.div>

            {/* Téléphone & WhatsApp */}
            <motion.div 
              variants={fadeUp} 
              custom={1} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-150 dark:border-zinc-850 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4 border border-brand-blue/10 text-brand-blue">
                  <Phone size={20} />
                </div>
                <h3 className="font-bold text-base mb-2 dark:text-white">Téléphone</h3>
                <div className="space-y-2 mt-2">
                  <a href="tel:+221765662711" className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-brand-blue transition-colors">
                    <Phone size={13} /> +221 76 566 27 11
                  </a>
                  <a href="tel:+221784379462" className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-brand-blue transition-colors">
                    <Phone size={13} /> +221 78 437 94 62
                  </a>
                </div>
              </div>
              <a
                href="https://wa.me/221765662711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full transition-colors w-fit shadow-sm shadow-green-500/20"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </motion.div>

            {/* Email & Horaires */}
            <motion.div 
              variants={fadeUp} 
              custom={2} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-150 dark:border-zinc-850 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4 border border-brand-blue/10 text-brand-blue">
                  <Clock size={20} />
                </div>
                <h3 className="font-bold text-base mb-2 dark:text-white">Horaires</h3>
                <div className="space-y-2 mt-2">
                  {HORAIRES.map(({ jour, heure }) => (
                    <div key={jour} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-zinc-400">{jour}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{heure}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="mailto:amdydieng062@gmail.com" className="inline-flex items-center gap-1.5 mt-6 text-xs text-gray-500 dark:text-zinc-450 hover:text-brand-blue transition-colors">
                <Mail size={13} /> amdydieng062@gmail.com
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 dark:text-white uppercase tracking-wider">Découvrez notre collection</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-450 mb-8 leading-relaxed">
            Parcourez notre boutique en ligne et trouvez la pièce d'exception qui vous correspond, ou venez nous rendre visite directement à Touba.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full transition-all shadow-lg shadow-brand-blue/25 text-sm uppercase tracking-wider flex items-center justify-center gap-2 group">
              Visiter la boutique
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="https://wa.me/221765662711" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 border-2 border-gray-200 dark:border-zinc-700 text-gray-850 dark:text-white hover:border-brand-blue hover:text-brand-blue font-bold rounded-full transition-all text-sm uppercase tracking-wider">
              Nous contacter
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
