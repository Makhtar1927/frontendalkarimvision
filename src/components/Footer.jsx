import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from './api';
import { useProductStore } from '../store/useProductStore';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  
  const { settings: storeSettings, fetchSettings } = useProductStore();

  const settings = storeSettings || {
    store_name: 'Al Karim Vision',
    contact_phone: '221784379462',
    contact_email: 'contact@alkarimvision.com',
    contact_address: 'Touba Darou Khoudoss, Niary Etage',
    maps_link: 'https://www.google.com/maps?q=14.8605356,-15.8835194&z=17&hl=fr',
    whatsapp_number: '221784379462',
    instagram_link: 'https://www.instagram.com/al_karim_vision_566?igsh=MnhkcXV3emQ5MDNr',
    tiktok_link: 'https://www.tiktok.com/@alkarimvision?_r=1&_t=ZS-97ekUvrRmZ2',
    snapchat_link: 'https://www.snapchat.com/add/alkarimvision66'
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await apiFetch('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || "Erreur lors de l'abonnement.");
      }
    } catch (err) {
      setStatus('error');
      setMessage('Impossible de joindre le serveur.');
    }
    setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
  };

  const formatPhoneNumber = (num) => {
    if (!num) return '';
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('221')) {
      const main = cleanNum.slice(3);
      if (main.length === 9) {
        return `+221 ${main.slice(0, 2)} ${main.slice(2, 5)} ${main.slice(5, 7)} ${main.slice(7, 9)}`;
      }
    }
    return `+${cleanNum}`;
  };

  const TikTokIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  );

  const SnapchatIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
    </svg>
  );

  return (
    <footer className="bg-white dark:bg-brand-gray-dark border-t border-gray-155 dark:border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* BRANDING, RÉSEAUX SOCIAUX & NEWSLETTER */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-sans font-black text-brand-blue tracking-wider mb-4 uppercase">
              AL KARIM<span className="text-gray-900 dark:text-white"> VISION</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-5 text-sm leading-relaxed">
              L'alliance parfaite entre l'optique de prestige, la haute parfumerie et l'horlogerie d'exception à Touba.
            </p>

            {/* Icônes Réseaux Sociaux */}
            <div className="flex items-center gap-3 mb-6">
              {settings.instagram_link && (
                <a
                  href={settings.instagram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Al Karim Vision"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings.tiktok_link && (
                <a
                  href={settings.tiktok_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Al Karim Vision"
                  className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
                >
                  <TikTokIcon size={16} />
                </a>
              )}
              {settings.snapchat_link && (
                <a
                  href={settings.snapchat_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snapchat Al Karim Vision"
                  className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-black hover:scale-110 transition-transform shadow-sm"
                >
                  <SnapchatIcon size={16} />
                </a>
              )}
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">S'abonner à la Newsletter</h3>
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Votre adresse e-mail"
                  value={email}
                  aria-label="Votre adresse e-mail"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg py-2.5 pl-4 pr-12 focus:outline-none focus:border-brand-blue transition-colors text-base md:text-sm"
                />
                <button
                  type="submit"
                  aria-label="S'abonner à la newsletter"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-blue hover:text-brand-blue-dark disabled:opacity-50 transition-colors p-2"
                >
                  {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
              {status === 'success' && <p className="text-green-500 text-xs mt-2 flex items-center gap-1"><CheckCircle2 size={14} /> {message}</p>}
              {status === 'error' && <p className="text-red-500 text-xs mt-2">{message}</p>}
            </div>
          </div>

          {/* LIENS RAPIDES */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/" className="hover:text-brand-blue transition-colors">Accueil</Link></li>
              <li><Link to="/category/glasses" className="hover:text-brand-blue transition-colors">Lunettes</Link></li>
              <li><Link to="/category/perfume" className="hover:text-brand-blue transition-colors">Haute Parfumerie</Link></li>
              <li><Link to="/category/watches" className="hover:text-brand-blue transition-colors">Montres de Luxe</Link></li>
              <li><Link to="/category/other" className="hover:text-brand-blue transition-colors">Divers & Accessoires</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href={`tel:${settings.contact_phone}`} className="hover:text-brand-blue transition-colors flex items-center gap-2">
                  <Phone size={14} className="text-brand-blue" />
                  <span>{formatPhoneNumber(settings.contact_phone)}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-blue transition-colors flex items-center gap-2">
                  <Mail size={14} className="text-brand-blue" /> {settings.contact_email}
                </a>
              </li>
              <li>
                <a href={settings.maps_link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors flex items-start gap-2">
                  <MapPin size={14} className="text-brand-blue mt-1 shrink-0" />
                  <span>{settings.contact_address.split(',').map((part, i) => <React.Fragment key={i}>{part}{i === 0 && <br/>}</React.Fragment>)}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings.store_name}. Tous droits réservés.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-brand-blue transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;