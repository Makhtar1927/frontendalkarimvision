import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail, Camera, MessageCircle } from 'lucide-react';

const ContactLocation = () => {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-20 bg-sky-50/50 dark:bg-zinc-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* GAUCHE : INFOS TEXTUELLES */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-brand-blue font-bold tracking-widest text-xs">NOUS RENDRE VISITE</h3>
              <h2 className="text-2xl md:text-3xl font-sans font-black dark:text-white uppercase tracking-tight">Al Karim Vision Experience Center</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Retrouvez tous nos univers Tech, Parfumerie et Café dans notre showroom. 
                Essais de produits et dégustations de café offertes sur place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg text-brand-blue shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Adresse</h4>
                  <p className="text-gray-500 text-xs">Touba Darou Khoudoss, Niary Tally, Dakar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg text-brand-blue shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Horaires</h4>
                  <p className="text-gray-500 text-xs">Lun - Sam : 09h - 19h<br/>Dimanche : Fermé</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg text-brand-blue shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Contact Direct</h4>
                  <p className="text-gray-500 text-xs">+221 77 413 36 45</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg text-brand-blue shadow-sm">
                  <Camera size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Réseaux Sociaux</h4>
                  <p className="text-gray-500 text-xs">@alkarimvision</p>
                </div>
              </div>
            </div>

            <a 
              href="https://wa.me/221774133645" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full sm:w-auto gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 md:px-8 rounded-lg font-bold transition-all shadow-md text-xs tracking-wider uppercase"
            >
              <img src="/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 object-contain" />
              DISCUTER SUR WHATSAPP
            </a>
          </motion.div>

          {/* DROITE : CARTE INTERACTIVE (Embed Google Maps avec filtre de couleur) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[300px] md:h-[450px] w-full rounded-xl overflow-hidden border-4 border-white dark:border-brand-gray-dark shadow-2xl"
          >
            <iframe 
              src="https://maps.google.com/maps?q=14.765917,-17.394389&hl=fr&z=16&output=embed" 
              width="100%" 
              height="100%" 
              title="Carte Google Maps indiquant l'emplacement du Al Karim Vision Experience Center"
              style={{ border: 0, filter: 'grayscale(0.5) contrast(1.1)' }} 
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
            {/* Overlay décoratif bleu */}
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactLocation;