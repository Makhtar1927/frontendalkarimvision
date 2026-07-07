import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share } from 'lucide-react';

/* ─── Constantes ─────────────────────────────────────────── */
const STORAGE_KEY = 'pwa_install_dismissed';
const DELAY_MS    = 3000; // délai avant l'affichage (ms)

/* ─── Helpers ────────────────────────────────────────────── */
const isIOSDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

/* ─────────────────────────────────────────────────────────── */
/*  Composant principal                                        */
/* ─────────────────────────────────────────────────────────── */
const PWAInstallPrompt = () => {
  const [show, setShow]                 = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS]               = useState(false);
  const [installing, setInstalling]     = useState(false);

  // Référence pour croiser l'événement beforeinstallprompt
  // et le délai d'affichage
  const deferredRef  = useRef(null);
  const delayPassedRef = useRef(false);

  useEffect(() => {
    // Ne jamais afficher si déjà ignoré ou si app déjà installée
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isStandaloneMode()) return;

    const ios = isIOSDevice();
    setIsIOS(ios);

    /* ── iOS : pas de beforeinstallprompt disponible ─────── */
    if (ios) {
      const timer = setTimeout(() => setShow(true), DELAY_MS);
      return () => clearTimeout(timer);
    }

    /* ── Android / Chrome / Edge ─────────────────────────── */
    const tryShow = () => {
      if (deferredRef.current && delayPassedRef.current) setShow(true);
    };

    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredRef.current = e;
      setDeferredPrompt(e);
      tryShow();
    };

    const onInstalled = () => {
      setShow(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    const timer = setTimeout(() => {
      delayPassedRef.current = true;
      tryShow();
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  /* ── Actions ─────────────────────────────────────────────── */
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } finally {
      setDeferredPrompt(null);
      deferredRef.current = null;
      setInstalling(false);
      setShow(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay sombre — mobile uniquement */}
          <motion.div
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[98]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* ── Carte principale ─────────────────────────── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Installer Al Karim Vision"
            className={[
              // Base
              'fixed z-[99]',
              // Mobile : bottom sheet au-dessus de la nav (h-16 = 64px)
              'bottom-16 left-3 right-3 rounded-2xl',
              // Desktop : carte flottante coin inférieur droit
              'md:bottom-8 md:left-auto md:right-8 md:w-[390px]',
              // Fond glassmorphism
              'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl',
              // Bordure subtile
              'border border-white/60 dark:border-zinc-700/50',
              // Ombre portée
              'shadow-[0_8px_48px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_48px_rgba(0,0,0,0.5)]',
            ].join(' ')}
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1    }}
            exit={{    y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="p-5">

              {/* ── En-tête ───────────────────────────────── */}
              <div className="flex items-start gap-4 mb-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-black/5">
                  <img
                    src="/logo.png"
                    alt="Logo Al Karim Vision"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-blue mb-0.5">
                    Application Mobile
                  </p>
                  <h2 className="font-black text-gray-900 dark:text-white text-[15px] leading-tight">
                    Al Karim Vision
                  </h2>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 tracking-wide">
                    Lunettes · Parfums · Montres
                  </p>
                </div>

                {/* Fermer */}
                <button
                  onClick={handleDismiss}
                  aria-label="Fermer"
                  className="p-1.5 -mt-0.5 -mr-0.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>

              {/* ── Message central ───────────────────────── */}
              <div className="bg-brand-blue/[0.06] dark:bg-brand-blue/10 rounded-xl px-4 py-3 mb-4">
                <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                  {isIOS ? (
                    <>
                      Ajoutez l'app à votre écran d'accueil pour un{' '}
                      <strong className="font-bold text-gray-900 dark:text-white">
                        accès instantané
                      </strong>{' '}
                      à notre catalogue.
                    </>
                  ) : (
                    <>
                      Installez{' '}
                      <strong className="font-bold text-gray-900 dark:text-white">
                        Al Karim Vision
                      </strong>{' '}
                      pour un accès rapide, même{' '}
                      <strong className="font-bold text-gray-900 dark:text-white">
                        sans connexion
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>

              {/* ── Instructions iOS spécifiques ─────────── */}
              {isIOS && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl px-4 py-3 mb-4">
                  <Share size={15} className="text-brand-blue flex-shrink-0" />
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug">
                    Appuyez sur{' '}
                    <strong className="text-gray-800 dark:text-gray-200">Partager</strong>
                    {' '}puis{' '}
                    <strong className="text-gray-800 dark:text-gray-200">
                      "Sur l'écran d'accueil"
                    </strong>
                  </p>
                </div>
              )}

              {/* ── Boutons ───────────────────────────────── */}
              <div className="flex gap-2.5">
                {/* Ignorer */}
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-3 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
                >
                  Pas maintenant
                </button>

                {/* Installer — uniquement Android/Chrome */}
                {!isIOS && (
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className={[
                      'flex-1 py-3 px-3 rounded-xl',
                      'bg-brand-blue text-white text-[13px] font-bold',
                      'flex items-center justify-center gap-2',
                      'shadow-lg shadow-brand-blue/25',
                      'hover:brightness-110 active:scale-[0.98]',
                      'transition-all duration-150',
                      installing ? 'opacity-70 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {installing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download size={15} strokeWidth={2.5} />
                    )}
                    {installing ? 'Installation…' : 'Installer'}
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
