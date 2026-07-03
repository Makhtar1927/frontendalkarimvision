import React, { useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';

// Déclarations globales pour empêcher les erreurs de compilation/linter JS
/* global fbq, gtag, ttq */

// Helper générique pour vérifier si un script est déjà injecté
const isScriptLoaded = (id) => !!document.getElementById(id);

/**
 * Gestionnaire automatique de Pixel publicitaire et Google Analytics.
 * Initialise dynamiquement les tags et écoute les événements d'achat, d'ajout au panier.
 */
export const TrackingManager = () => {
  const { settings } = useProductStore();

  useEffect(() => {
    if (!settings) return;

    // 1. VÉRIFICATION DE DOMAINE FACEBOOK (Meta Tag)
    if (settings.facebook_domain_verification) {
      let meta = document.querySelector('meta[name="facebook-domain-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'facebook-domain-verification';
        document.head.appendChild(meta);
      }
      meta.content = settings.facebook_domain_verification;
    }

    // 2. INITIALISATION FACEBOOK PIXEL
    if (settings.facebook_pixel_id && !isScriptLoaded('fb-pixel-script')) {
      // Script d'installation
      const script = document.createElement('script');
      script.id = 'fb-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Noscript fallback
      const noscript = document.createElement('noscript');
      noscript.id = 'fb-pixel-noscript';
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none" 
        src="https://www.facebook.com/tr?id=${settings.facebook_pixel_id}&ev=PageView&noscript=1" />
      `;
      document.body.appendChild(noscript);
      console.log(`[Tracking] Facebook Pixel initialisé (${settings.facebook_pixel_id})`);
    }

    // 3. INITIALISATION TIKTOK PIXEL
    if (settings.tiktok_pixel_id && !isScriptLoaded('tt-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'tt-pixel-script';
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var e=0;e<ttq.methods.length;e++)ttq.setAndDefer(ttq,ttq.methods[e]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.mixpool;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||[],ttq._t.push(e),ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=d.createElement("script");a.type="text/javascript",a.async=!0,a.src=r;var c=d.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
          ttq.load('${settings.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
      console.log(`[Tracking] TikTok Pixel initialisé (${settings.tiktok_pixel_id})`);
    }

    // 4. INITIALISATION GOOGLE ANALYTICS (GA4)
    if (settings.google_analytics_id && !isScriptLoaded('ga-script')) {
      // Tag principal
      const scriptTag = document.createElement('script');
      scriptTag.id = 'ga-script';
      scriptTag.async = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      document.head.appendChild(scriptTag);

      // Script de config
      const scriptConfig = document.createElement('script');
      scriptConfig.id = 'ga-config-script';
      scriptConfig.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `;
      document.head.appendChild(scriptConfig);
      console.log(`[Tracking] Google Analytics initialisé (${settings.google_analytics_id})`);
    }
  }, [settings]);

  return null; // Composant invisible servant uniquement d'injecteur de scripts
};

/**
 * Déclenchement d'un événement personnalisé (Ajout au Panier)
 */
export const trackAddToCartEvent = (item) => {
  try {
    // Facebook
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
        content_name: item.name || item.title,
        content_ids: [item.id.toString()],
        content_type: 'product',
        value: Number(item.price),
        currency: 'XOF'
      });
    }
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', {
        currency: 'XOF',
        value: Number(item.price) * (item.quantity || 1),
        items: [{
          item_id: item.id.toString(),
          item_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity || 1
        }]
      });
    }
    // TikTok
    if (typeof ttq === 'function') {
      ttq.track('AddToCart', {
        contents: [{
          content_id: item.id.toString(),
          content_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity || 1
        }],
        value: Number(item.price) * (item.quantity || 1),
        currency: 'XOF'
      });
    }
  } catch (err) {
    console.warn("[Tracking] Échec trackAddToCartEvent:", err);
  }
};

/**
 * Déclenchement d'un événement personnalisé (Début de commande)
 */
export const trackInitiateCheckoutEvent = (cart, total) => {
  try {
    // Facebook
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(item => item.id.toString()),
        content_type: 'product',
        value: Number(total),
        currency: 'XOF',
        num_items: cart.length
      });
    }
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'begin_checkout', {
        currency: 'XOF',
        value: Number(total),
        items: cart.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity
        }))
      });
    }
    // TikTok
    if (typeof ttq === 'function') {
      ttq.track('InitiateCheckout', {
        contents: cart.map(item => ({
          content_id: item.id.toString(),
          content_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity
        })),
        value: Number(total),
        currency: 'XOF'
      });
    }
  } catch (err) {
    console.warn("[Tracking] Échec trackInitiateCheckoutEvent:", err);
  }
};

/**
 * Déclenchement d'un événement personnalisé (Achat réussi)
 */
export const trackPurchaseEvent = (orderId, total, cart = []) => {
  try {
    // Facebook
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        content_ids: cart.map(item => item.id.toString()),
        content_type: 'product',
        value: Number(total),
        currency: 'XOF',
        order_id: orderId.toString()
      });
    }
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'purchase', {
        transaction_id: orderId.toString(),
        value: Number(total),
        currency: 'XOF',
        items: cart.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity
        }))
      });
    }
    // TikTok
    if (typeof ttq === 'function') {
      ttq.track('CompletePayment', {
        contents: cart.map(item => ({
          content_id: item.id.toString(),
          content_name: item.name || item.title,
          price: Number(item.price),
          quantity: item.quantity
        })),
        value: Number(total),
        currency: 'XOF'
      });
    }
  } catch (err) {
    console.warn("[Tracking] Échec trackPurchaseEvent:", err);
  }
};
