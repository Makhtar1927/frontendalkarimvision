import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { apiFetch } from '../components/api';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

// NOTE : Ceci est un formulaire de connexion basique pour la démonstration.
// Il est recommandé d'ajouter une validation plus robuste et une meilleure gestion des erreurs.

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Plus besoin de spécifier l'URL complète ni le Content-Type
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Le backend renvoie "error" (ex: Identifiants invalides), on s'assure de l'afficher proprement
        throw new Error(data.error || data.message || 'La connexion a échoué');
      }

      // En cas de succès, on utilise le store pour se connecter
      login(data.token);
      navigate('/admin');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Connexion Administration" 
        description="Espace sécurisé de connexion pour le tableau de bord d'administration Al Karim Vision."
        noindex={true}
      />
      <div className="flex items-center justify-center min-h-[90vh] bg-gray-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-brand-card-dark rounded-2xl shadow-xl shadow-brand-blue/5 border border-gray-100 dark:border-zinc-800/80 transition-all duration-300">
          <div className="flex flex-col items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Al Karim Vision" 
              className="h-16 w-auto object-contain rounded-xl"
            />
            <div className="text-center">
              <h2 className="text-xl font-black font-sans uppercase tracking-widest text-gray-900 dark:text-white">
                Al Karim Vision
              </h2>
              <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                Espace Administration
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alkarimvision.com"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue dark:bg-zinc-900 dark:text-white dark:border-zinc-800 text-sm transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="text-[10px] text-brand-blue hover:text-brand-blue-dark transition-colors font-bold uppercase tracking-wider">
                  Oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue dark:bg-zinc-900 dark:text-white dark:border-zinc-800 text-sm transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-zinc-600"
              />
            </div>

            {error && (
              <p className="text-xs text-center text-red-500 font-bold bg-red-500/5 py-2.5 rounded-lg border border-red-500/10">
                {error}
              </p>
            )}

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3.5 font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-md shadow-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/20"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Connexion en cours...</>
                ) : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;