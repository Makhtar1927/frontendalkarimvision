import React, { useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProductStore } from '../store/useProductStore';

const ProductGrid = () => {
  const { products, fetchProducts, loading } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <div className="text-center py-20 dark:text-white">Chargement du catalogue de luxe...</div>;

  const promoProducts = products.filter(p => p.is_on_sale || parseFloat(p.compare_at_price) > parseFloat(p.base_price));
  const secondLot = promoProducts.length >= 4 ? promoProducts.slice(0, 8) : products.length > 8 ? products.slice(8, 16) : [];
  const secondTitle = promoProducts.length >= 4 ? "Nos Offres Exclusives" : "La Sélection Premium";

  return (
    <section id="products" className="py-16 px-4 md:px-20 bg-gray-50 dark:bg-bustantech-black scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* PREMIER LOT : Nouveautés & Best-Sellers */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-luxury font-bold dark:text-white mb-4">Nouveautés & Best-Sellers</h2>
            <div className="w-20 h-1 bg-bustantech-gold mx-auto"></div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible no-scrollbar">
            {products.slice(0, 8).map(product => (
              <div key={product.id} className="w-[45vw] sm:w-[35vw] snap-start shrink-0 md:w-auto md:shrink">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* DEUXIÈME LOT : Offres Exclusives ou Sélection Premium */}
        {secondLot.length > 0 && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-luxury font-bold dark:text-white mb-4">{secondTitle}</h2>
              <div className="w-20 h-1 bg-bustantech-gold mx-auto"></div>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:overflow-visible no-scrollbar">
              {secondLot.map(product => (
                <div key={product.id} className="w-[45vw] sm:w-[35vw] snap-start shrink-0 md:w-auto md:shrink">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductGrid;