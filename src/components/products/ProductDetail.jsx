import React, { useState, useEffect } from 'react';
import { Minus, Plus, AlertCircle, Tag, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

export const ProductDetail = ({ product, onClose }) => {
  const { addToCart, getEffectivePrice } = useCart();
  const [quantity, setQuantity] = useState(product.minOrder || 1);
  const [currentPrice, setCurrentPrice] = useState(product.price);

  useEffect(() => {
    setCurrentPrice(getEffectivePrice(product, quantity));
  }, [quantity, product, getEffectivePrice]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const volumeDiscounts = product.volumeDiscounts?.sort((a, b) => a.threshold - b.threshold) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Image & Header */}
      <div className="flex gap-6 items-start">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-background overflow-hidden border border-white/5 flex-shrink-0">
           <img 
             src={product.image} 
             alt={product.name}
             className="w-full h-full object-cover"
             onError={(e) => e.target.src = "https://placehold.co/200x200/212B38/FFF?text=IMG"}
           />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase leading-none mb-2">{product.name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{product.description || "Sin descripción disponible."}</p>
        </div>
      </div>

      {/* Volume Discounts */}
      {volumeDiscounts.length > 0 && (
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
              <Tag className="w-3 h-3" /> Descuentos por volumen
           </div>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* Base Price Card */}
              <div className={cn(
                "flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl border transition-all",
                quantity < (volumeDiscounts[0]?.threshold || 9999) 
                  ? "bg-primary/20 border-primary text-white" 
                  : "bg-background/40 border-white/5 text-slate-500 opacity-60"
              )}>
                 <span className="text-[10px] font-black">1+ U.</span>
                 <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
              </div>

              {/* Discount Tiers */}
              {volumeDiscounts.map((tier, i) => (
                <div key={i} className={cn(
                  "flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl border transition-all",
                  quantity >= tier.threshold
                    ? "bg-highlight/20 border-highlight text-white scale-105 shadow-lg shadow-highlight/10" 
                    : "bg-background/40 border-white/5 text-slate-500 opacity-60"
                )}>
                   <span className="text-[10px] font-black">+{tier.threshold} U.</span>
                   <span className="text-sm font-bold text-highlight">{formatCurrency(tier.price)}</span>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Controls & Total */}
      <div className="bg-background/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 bg-background rounded-xl p-1 border border-white/5">
               <button 
                 onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))}
                 className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
               >
                 <Minus className="w-4 h-4" />
               </button>
               <span className="w-8 text-center font-black text-xl">{quantity}</span>
               <button 
                 onClick={() => setQuantity(quantity + 1)}
                 className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
               >
                 <Plus className="w-4 h-4" />
               </button>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Parcial</p>
              <p className="text-3xl font-black text-accent tracking-tight">
                {formatCurrency(currentPrice * quantity)}
              </p>
            </div>
         </div>

         <Button 
           variant="primary" 
           size="lg" 
           className="w-full bg-primary hover:bg-primary/80"
           onClick={handleAddToCart}
         >
           <ShoppingCart className="w-5 h-5 mr-2" /> Agregar al Pedido
         </Button>


         {product.minOrder > 1 && (
           <p className="text-center text-xs text-amber-500 font-bold uppercase flex items-center justify-center gap-2">
             <AlertCircle className="w-3 h-3" /> Mínimo de compra: {product.minOrder} unidades
           </p>
         )}
      </div>
    </div>
  );
};
