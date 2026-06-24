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
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md dark:bg-brand-card-dark border border-gray-150 dark:border-zinc-800">
        <h2 className="text-xl font-black font-sans uppercase tracking-wider text-center text-gray-900 dark:text-white">
          Accès Administration
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-zinc-850 dark:text-white dark:border-zinc-700 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Mot de passe
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-blue hover:text-brand-blue-dark transition-colors font-bold uppercase tracking-wide">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-zinc-850 dark:text-white dark:border-zinc-700 text-sm"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Connexion...</>
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