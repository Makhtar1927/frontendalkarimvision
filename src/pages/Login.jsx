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
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-bustantech-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-zinc-900">
        <h2 className="text-2xl font-bold text-center text-bustantech-black dark:text-white">
          Accès Administration
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-bustantech-gold focus:border-bustantech-gold dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <Link to="/forgot-password" className="text-xs text-bustantech-gold hover:text-bustantech-gold-dark transition-colors font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-bustantech-gold focus:border-bustantech-gold dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 font-bold text-white bg-bustantech-gold rounded-2xl hover:bg-bustantech-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bustantech-gold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Connexion...</>
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