import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, Compass, Phone, Mail, MapPin } from 'lucide-react';
import { apiFetch } from './api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    store_name: 'BoustaneTech Store',
    contact_phone: '221774133645',
    contact_email: 'contact@boustantech.com',
    contact_address: 'Pikine Saf Bar, Dakar',
    maps_link: 'https://maps.app.goo.gl/tUo6M6r6uXyS1JbZ8',
    whatsapp_number: '221774133645'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Erreur chargement settings footer:", err);
      }
    };
    loadSettings();
  }, []);

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

  return (
    <footer className="bg-white dark:bg-bustantech-black border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* BRANDING & NEWSLETTER */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-luxury font-bold text-bustantech-gold tracking-widest mb-4">
              BOUSTANETECH<span className="text-black dark:text-white">STORE</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm">
              L'alliance parfaite entre l'innovation technologique, le luxe de la haute parfumerie et l'art du café de spécialité.
            </p>
            
            <div>
              <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-3">S'abonner à la Newsletter</h3>
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Votre adresse e-mail"
                  value={email}
                  aria-label="Votre adresse e-mail"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-bustantech-gold transition-colors text-base md:text-sm"
                />
                <button
                  type="submit"
                  aria-label="S'abonner à la newsletter"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-bustantech-gold hover:text-yellow-600 disabled:opacity-50 transition-colors p-2"
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
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="/" className="hover:text-bustantech-gold transition-colors">Accueil</a></li>
              <li><a href="/category/tech" className="hover:text-bustantech-gold transition-colors">Téléphones</a></li>
              <li><a href="/category/computers" className="hover:text-bustantech-gold transition-colors">Ordinateurs</a></li>
              <li><a href="/category/accessories" className="hover:text-bustantech-gold transition-colors">Accessoires</a></li>
              <li><a href="/category/perfume" className="hover:text-bustantech-gold transition-colors">Haute Parfumerie</a></li>
              <li><a href="/category/coffee" className="hover:text-bustantech-gold transition-colors">Le Coin Café</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href={`tel:${settings.contact_phone}`} className="hover:text-bustantech-gold transition-colors flex items-center gap-2">
                  <Phone size={14} className="text-bustantech-gold" /> {settings.contact_phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.contact_email}`} className="hover:text-bustantech-gold transition-colors flex items-center gap-2">
                  <Mail size={14} className="text-bustantech-gold" /> {settings.contact_email}
                </a>
              </li>
              <li>
                <a href={settings.maps_link} target="_blank" rel="noopener noreferrer" className="hover:text-bustantech-gold transition-colors flex items-start gap-2">
                  <MapPin size={14} className="text-bustantech-gold mt-1 shrink-0" />
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
            <a href="#" className="hover:text-bustantech-gold transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-bustantech-gold transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;