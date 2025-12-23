import React, { useState, useMemo, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Search, Filter } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const CATEGORIES = ["Todos", "Estructuras", "Cultivo", "Ventilación", "Accesorios"];

export const ProductGrid = ({ onEditProduct, onDeleteProduct, onToggleActiveProduct }) => {
  const { settings, loading: storeLoading } = useStore();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selection State
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (storeLoading) return;
    
    const productsRef = collection(db, 'artifacts', settings.catalogId, 'public', 'data', 'products');
    
    const unsubscribe = onSnapshot(query(productsRef), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [settings.catalogId, storeLoading]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Admin sees all, User sees only active
      if (!isAdmin && !p.active) return false;
      
      const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm, isAdmin]);

  if (loading || storeLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold animate-pulse">CARGANDO CATÁLOGO...</div>;
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-24 z-30 bg-background/90 p-4 -mx-4 md:mx-0 md:p-0 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-2xl border border-white/5 md:border-none">
        <div className="relative flex-grow group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-highlight transition-colors" />
           <Input 
             placeholder="Buscar productos..." 
             className="pl-10 bg-surface/50 border-transparent focus:bg-surface"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'primary' : 'secondary'}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl whitespace-nowrap ${activeCategory === cat ? 'bg-accent text-background shadow-accent/20' : ''}`}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
           <Filter className="w-12 h-12 mb-4" />
           <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onSelect={setSelectedProduct}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleActive={onToggleActiveProduct}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </Modal>
    </div>
  );
};
