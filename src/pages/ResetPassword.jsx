import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../components/api';
import { Loader2, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import SEO from '../components/SEO';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage("Le lien de réinitialisation est invalide ou manquant.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    
    if (newPassword.length < 6) {
      setStatus('error');
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatus('success');
      setMessage(data.message || 'Votre mot de passe a été mis à jour.');
      
      // Redirection automatique vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <>
      <SEO 
        title="Réinitialisation mot de passe"
        description="Choisissez votre nouveau mot de passe administrateur pour BoustaneTech Store."
        noindex={true}
      />
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl dark:bg-bustantech-black border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto bg-bustantech-gold/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-bustantech-gold">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold font-luxury tracking-wider text-black dark:text-white mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Veuillez saisir votre nouveau mot de passe pour sécuriser votre compte.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border border-green-200 dark:border-green-800/50 animate-in fade-in">
            <CheckCircle2 className="text-green-500 w-12 h-12" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium leading-relaxed">
              {message}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nouveau mot de passe</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-bustantech-gold focus:border-bustantech-gold dark:bg-zinc-900 dark:text-white dark:border-gray-800 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Confirmer le mot de passe</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-bustantech-gold focus:border-bustantech-gold dark:bg-zinc-900 dark:text-white dark:border-gray-800 transition-colors" />
            </div>

            {status === 'error' && <p className="text-sm text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-800/50">{message}</p>}

            <button type="submit" disabled={status === 'loading' || !newPassword || !confirmPassword} className="w-full px-4 py-3 text-sm font-bold text-white bg-bustantech-gold rounded-full shadow-md hover:bg-bustantech-gold-dark focus:outline-none transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
              {status === 'loading' ? <><Loader2 size={18} className="animate-spin mr-2" /> ENREGISTREMENT...</> : 'SAUVEGARDER'}
            </button>
          </form>
        )}
      </div>
    </div>
    </>
  );
};

export default ResetPassword;