import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Wrench, Clock, Phone } from 'lucide-react';
import SEO from '../components/SEO';

const Maintenance = () => {
    // On pourrait aussi charger ici le téléphone depuis l'API pour être 100% dynamique
    return (
        <>
            <SEO 
                title="Maintenance en cours"
                description="Notre site est actuellement en maintenance pour mise à jour. Nous serons de retour très bientôt !"
                noindex={true}
            />
            <div className="min-h-screen bg-white dark:bg-brand-gray-dark flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-2xl"
            >
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-brand-blue blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 p-6 bg-sky-50 dark:bg-zinc-900 rounded-lg border border-brand-blue/30"
                    >
                        <HardHat size={80} className="text-brand-blue" />
                    </motion.div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-sans font-black dark:text-white mb-6 uppercase tracking-tight">
                    Maintenance en Cours
                </h1>
                
                <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                    Nous mettons à jour notre catalogue et notre site pour améliorer votre expérience d'achat.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-150 dark:border-zinc-800">
                        <Clock className="text-brand-blue mx-auto mb-3" size={24} />
                        <h3 className="font-bold dark:text-white uppercase tracking-wider text-xs mb-1">Retour Prévu</h3>
                        <p className="text-sm text-gray-500">D'ici peu de temps</p>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-150 dark:border-zinc-800">
                        <Phone className="text-brand-blue mx-auto mb-3" size={24} />
                        <h3 className="font-bold dark:text-white uppercase tracking-wider text-xs mb-1">Besoin d'aide ?</h3>
                        <a href="tel:+221765662711" className="text-sm text-brand-blue hover:underline font-medium transition-colors">+221 76 566 27 11</a>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                    <span className="w-12 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
                    Al Karim Vision
                    <span className="w-12 h-[1px] bg-gray-200 dark:bg-gray-800"></span>
                </div>
            </motion.div>
        </div>
        </>
    );
};

export default Maintenance;
