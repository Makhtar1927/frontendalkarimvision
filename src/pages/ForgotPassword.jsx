import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../components/api';
import { Loader2, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setMessage('');

    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatus('success');
      setMessage(data.message || 'Lien de réinitialisation envoyé avec succès.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <>
      <SEO 
        title="Mot de passe oublié"
        description="Espace de récupération de mot de passe administrateur pour Al Karim Vision."
        noindex={true}
      />
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl dark:bg-brand-gray-dark border border-gray-150 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto bg-brand-blue/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-brand-blue">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black font-sans uppercase tracking-wider text-black dark:text-white mb-2">
            Récupération
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Entrez votre adresse e-mail d'administration pour recevoir un lien de réinitialisation sécurisé.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4 border border-green-250 dark:border-green-800/50 animate-in fade-in">
            <CheckCircle2 className="text-green-500 w-12 h-12" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium leading-relaxed">
              {message}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">Pensez à vérifier vos courriers indésirables (Spams).</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                Adresse E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alkarimvision.com"
                className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue dark:bg-zinc-900 dark:text-white dark:border-zinc-800 transition-colors"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                {message}
              </p>
            )}

            <button type="submit" disabled={status === 'loading' || !email} className="w-full px-4 py-3 text-xs font-bold text-white bg-brand-blue rounded-lg shadow-md hover:bg-brand-blue-dark focus:outline-none transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
              {status === 'loading' ? <><Loader2 size={18} className="animate-spin mr-2" /> ENVOI...</> : 'ENVOYER LE LIEN'}
            </button>
          </form>
        )}
        <div className="text-center mt-8 border-t border-gray-150 dark:border-zinc-800 pt-6">
          <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-brand-blue dark:text-gray-400 dark:hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default ForgotPassword;