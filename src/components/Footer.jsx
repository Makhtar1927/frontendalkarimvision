import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, Compass, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from './api';
import { useProductStore } from '../store/useProductStore';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  
  const { settings: storeSettings, fetchSettings } = useProductStore();

  const settings = storeSettings || {
    store_name: 'Al Karim Vision',
    contact_phone: '221784379462',
    contact_email: 'contact@alkarimvision.com',
    contact_address: 'Touba Darou Khoudoss, Niary Etage',
    maps_link: 'https://www.google.com/maps?q=14.8605356,-15.8835194&z=17&hl=fr',
    whatsapp_number: '221784379462'
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
        setMessage(data.error || 'Erreur lors de l\'abonnement.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Impossible de joindre le serveur.');
    }
    
    // Réinitialiser le message après 5 secondes
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  // Helper formatting for contact number
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

  return (
    <footer className="bg-white dark:bg-brand-gray-dark border-t border-gray-155 dark:border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* BRANDING & NEWSLETTER */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-sans font-black text-brand-blue tracking-wider mb-4 uppercase">
              AL KARIM<span className="text-gray-900 dark:text-white"> VISION</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
              L'alliance parfaite entre l'optique de prestige, la haute parfumerie et l'horlogerie d'exception à Touba.
            </p>
            
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
                <div className="flex flex-col gap-2">
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-brand-blue transition-colors flex items-center gap-2">
                    <Phone size={14} className="text-brand-blue" />
                    <span>{formatPhoneNumber(settings.contact_phone)}</span>
                  </a>
                  {/* Si c'est le numéro par défaut 221784379462, on affiche aussi le second numéro */}
                  {settings.contact_phone?.includes('784379462') && (
                    <a href="tel:+221765662711" className="hover:text-brand-blue transition-colors flex items-center gap-2 pl-5">
                      <span>+221 76 566 27 11</span>
                    </a>
                  )}
                </div>
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