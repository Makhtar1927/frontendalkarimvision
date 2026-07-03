import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProductStore } from '../store/useProductStore';

const POLL_INTERVAL_MS = 30000; // 30 secondes

const AdminNotificationManager = () => {
  const { isAuthenticated } = useAuthStore();
  const checkForNewOrders = useProductStore(state => state.checkForNewOrders);
  const permissionAsked = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Demander la permission une seule fois
    if (!permissionAsked.current && 'Notification' in window && Notification.permission === 'default') {
      permissionAsked.current = true;
      Notification.requestPermission();
    }

    // Initialiser avec le premier chargement (sans notifier)
    checkForNewOrders();

    // Démarrer le polling
    intervalRef.current = setInterval(async () => {
      const newOrders = await checkForNewOrders();
      if (!newOrders || newOrders.length === 0) return;

      // Notification navigateur si la permission est accordée
      if ('Notification' in window && Notification.permission === 'granted') {
        newOrders.forEach(order => {
          const montant = new Intl.NumberFormat('fr-FR').format(order.total_amount);
          new Notification('Nouvelle commande — Al Karim Vision', {
            body: `${order.customer_name} — ${montant} FCFA (Paiement : ${order.payment_method || 'Livraison'})`,
            icon: '/Al Karim Logo Jour.png',
            badge: '/Al Karim Logo Jour.png',
            tag: `order-${order.id}`,
          });
        });
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkForNewOrders]);

  return null;
};

export default AdminNotificationManager;
