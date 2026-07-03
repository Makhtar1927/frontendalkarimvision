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
      <path d="M12.166 2c.93 0 3.966.257 5.38 3.558.406.946.308 2.548.232 3.786l-.012.193c0 .078.06.168.145.207.33.153.9.08 1.374-.045a.58.58 0 01.148-.02c.235 0 .44.136.44.344 0 .268-.344.542-.66.655-.087.03-.19.06-.303.09-.38.098-.901.232-.9.594.001.176.136.374.375.534.83.555 2.41 1.476 2.41 2.835 0 .13-.017.252-.05.364-.26.886-1.7 1.374-3.36 1.374a6.12 6.12 0 01-.81-.052l-.035-.005c-.286-.04-.511.064-.605.245-.394.754-.796 1.52-1.14 1.838-.603.558-1.31.826-2.148.826-.44 0-.87-.08-1.274-.237a3.5 3.5 0 00-1.313-.258c-.46 0-.9.087-1.306.258a3.386 3.386 0 01-1.277.237c-.836 0-1.543-.268-2.146-.826-.345-.318-.747-1.084-1.14-1.838-.094-.18-.32-.285-.606-.245l-.035.005a6.12 6.12 0 01-.81.052c-1.66 0-3.1-.488-3.36-1.374a1.252 1.252 0 01-.05-.364c0-1.359 1.58-2.28 2.41-2.835.239-.16.374-.358.375-.534.001-.362-.52-.496-.9-.594a3.156 3.156 0 01-.303-.09c-.316-.113-.66-.387-.66-.655 0-.208.205-.344.44-.344a.58.58 0 01.148.02c.474.125 1.044.198 1.374.045.085-.039.145-.13.145-.207l-.012-.193c-.076-1.238-.174-2.84.232-3.786C8.2 2.257 11.237 2 12.167 2z"/>
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