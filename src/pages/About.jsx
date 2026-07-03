import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Star, Shield, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const VALEURS = [
  {
    icon: Shield,
    titre: 'Authenticité garantie',
    texte: 'Chaque produit vendu chez Al Karim Vision est soigneusement sélectionné et garanti authentique. Nous ne compromettrons jamais sur la qualité.',
  },
  {
    icon: Star,
    titre: 'Excellence du service',
    texte: 'Nous accompagnons chaque client avec attention, en prenant le temps de comprendre ses besoins pour lui proposer la meilleure solution.',
  },
  {
    icon: Award,
    titre: 'Produits de prestige',
    texte: 'Nous référençons des marques reconnues mondialement dans l\'optique, la haute parfumerie et l\'horlogerie de prestige.',
  },
  {
    icon: Heart,
    titre: 'Satisfaction client',
    texte: 'Votre satisfaction est notre priorité absolue. Nous mettons tout en œuvre pour que chaque achat soit une expérience mémorable.',
  },
];

const HORAIRES = [
  { jour: 'Tous les jours', heure: '08h30 – 23h00' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-gray-dark text-gray-800 dark:text-gray-200">

      {/* ── HERO FONDATEUR ── */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-zinc-800">

        {/* ── FOND : image boutique pleine largeur + blur + overlay ── */}
        <img
          src={getOptimizedImageUrl('/boutique-showroom.jpg')}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[3px]"
        />
        {/* Overlay blanc pour préserver la lisibilité du texte */}
        <div className="absolute inset-0 bg-white/75 dark:bg-zinc-950/80" />

        {/* ── CONTENU ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-0 md:min-h-[85vh] flex items-center">
          <div className="w-full grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Colonne gauche : texte */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/25 text-brand-blue text-[10px] font-black uppercase tracking-[0.3em] px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                Fondateur
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.08] tracking-tight mb-3">
                Al Karim<br />
                <span className="text-brand-blue">Vision</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-6">
                Touba, Sénégal — Optique · Parfums · Montres
              </p>

              <div className="w-10 h-0.5 bg-brand-blue mb-6" />

              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed max-w-md mb-10">
                Rendre l'élégance accessible à tous. Depuis Touba, Al Karim Vision sélectionne et propose des produits authentiques — lunettes de prestige, parfums rares et montres de qualité — pour chaque style et chaque budget.
              </p>

              <div className="flex items-stretch gap-0 divide-x divide-gray-300 dark:divide-zinc-700 border border-gray-300 dark:border-zinc-700 rounded-2xl overflow-hidden w-fit bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
                {[
                  { val: '100%', label: 'Authenticité' },
                  { val: '+3',   label: 'Catégories' },
                  { val: '∞',    label: 'Satisfaction' },
                ].map(({ val, label }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <p className="text-xl font-black text-gray-900 dark:text-white">{val}</p>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Colonne droite : portrait seul, sans cadre */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 md:order-2 flex justify-center md:justify-end"
            >
              <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-4 border-white dark:border-zinc-700 shadow-2xl shadow-brand-blue/20 flex-shrink-0">
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
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Notre mission</span>
            <h2 className="text-3xl font-black mt-3 mb-5 dark:text-white">Qualité, Élégance &amp; Satisfaction</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Al Karim Vision est une boutique spécialisée dans la vente de <strong className="text-gray-800 dark:text-white">lunettes de vue</strong>, <strong className="text-gray-800 dark:text-white">lunettes de soleil</strong>, <strong className="text-gray-800 dark:text-white">montres</strong> et <strong className="text-gray-800 dark:text-white">parfums</strong> de qualité.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Nous proposons un large choix de marques reconnues ainsi que des accessoires adaptés à tous les styles et budgets. Notre priorité est d'offrir à chaque client des produits authentiques, un accueil chaleureux et un service personnalisé.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Fondée avec la vision de rendre l'élégance accessible, Al Karim Vision s'est imposée comme une référence de confiance dans la région de Touba et au-delà.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <img
              src={getOptimizedImageUrl('/boutique-showroom.jpg')}
              alt="Showroom Al Karim Vision"
              className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-xl"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── NOS VALEURS ── */}
      <section className="bg-gray-50 dark:bg-zinc-900/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Ce qui nous guide</span>
            <h2 className="text-3xl font-black mt-3 dark:text-white">Nos Valeurs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALEURS.map(({ icon: Icon, titre, texte }, i) => (
              <motion.div
                key={titre}
                variants={fadeUp} custom={i * 0.5} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white dark:bg-brand-gray-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="text-brand-blue" size={22} />
                </div>
                <h3 className="font-bold text-base mb-2 dark:text-white">{titre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{texte}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOS PRODUITS ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Ce que nous vendons</span>
          <h2 className="text-3xl font-black mt-3 dark:text-white">Nos Spécialités</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { img: getOptimizedImageUrl('/boutique-interieur-1.jpg'), label: 'Optique', desc: 'Lunettes de vue & soleil · Grandes marques · Montures premium' },
            { img: getOptimizedImageUrl('/boutique-interieur-2.jpg'), label: 'Parfumerie', desc: 'Parfums authentiques · Oud de prestige · Fragrances de niche' },
            { img: getOptimizedImageUrl('/boutique-extra-1.jpg'),     label: 'Horlogerie', desc: 'Montres de prestige · Collections homme & femme' },
          ].map(({ img, label, desc }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} custom={i * 0.5} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              <img src={img} alt={label} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.parentElement.style.display='none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                <span className="text-white font-black text-lg">{label}</span>
                <span className="text-white/70 text-xs mt-1">{desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INFOS DE CONTACT ── */}
      <section className="bg-gray-50 dark:bg-zinc-900/50 py-20" id="contact">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-brand-blue">Venez nous rendre visite</span>
            <h2 className="text-3xl font-black mt-3 dark:text-white">Nous trouver</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Adresse */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800"
            >
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="text-brand-blue" size={22} />
              </div>
              <h3 className="font-bold text-base mb-3 dark:text-white">Adresse</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Niari, Route de Ndiouga Kébé<br />
                <strong className="text-gray-700 dark:text-gray-300">Touba, Sénégal</strong>
              </p>
              <a
                href="https://maps.google.com/?q=Touba+Senegal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-brand-blue hover:underline"
              >
                <MapPin size={13} /> Voir sur Google Maps
              </a>
            </motion.div>

            {/* Téléphone & WhatsApp */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800"
            >
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                <Phone className="text-brand-blue" size={22} />
              </div>
              <h3 className="font-bold text-base mb-3 dark:text-white">Téléphone</h3>
              <div className="space-y-2">
                <a href="tel:+221765662711" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors">
                  <Phone size={14} /> +221 76 566 27 11
                </a>
                <a href="tel:+221784379462" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors">
                  <Phone size={14} /> +221 78 437 94 62
                </a>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <a
                  href="https://wa.me/221765662711"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/al_karim_vision_566?igsh=MnhkcXV3emQ5MDNr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-bold rounded-full transition-colors hover:opacity-90"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@alkarimvision?_r=1&_t=ZS-97ekUvrRmZ2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-full transition-colors hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>
                  TikTok
                </a>
                <a
                  href="https://www.snapchat.com/add/alkarimvision66"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black text-xs font-bold rounded-full transition-colors hover:bg-yellow-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>
                  Snapchat
                </a>
              </div>
            </motion.div>

            {/* Email & Horaires */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white dark:bg-brand-gray-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800"
            >
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-brand-blue" size={22} />
              </div>
              <h3 className="font-bold text-base mb-3 dark:text-white">Horaires d'ouverture</h3>
              <div className="space-y-2">
                {HORAIRES.map(({ jour, heure }) => (
                  <div key={jour} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{jour}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{heure}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:amdydieng062@gmail.com" className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-blue transition-colors">
                <Mail size={13} /> amdydieng062@gmail.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4 dark:text-white">Découvrez notre collection</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Parcourez notre boutique en ligne et trouvez la pièce qui vous correspond, ou venez directement nous rendre visite à Touba.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full transition-all shadow-lg shadow-brand-blue/25">
              Visiter la boutique
            </Link>
            <a href="https://wa.me/221765662711" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 border-2 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white hover:border-brand-blue hover:text-brand-blue font-bold rounded-full transition-all">
              Nous contacter
            </a>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
