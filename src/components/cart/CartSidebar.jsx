import React from 'react';
import { X, Trash2, Send, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';

export const CartSidebar = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    cartTotal, 
    getEffectivePrice,
    updateQuantity
  } = useCart();
  const { settings } = useStore();

  const handleWhatsApp = () => {
    let msg = `🌱 *PEDIDO ${settings.storeName.toUpperCase()}*\n\n`;
    cart.forEach(item => {
      const price = getEffectivePrice(item, item.quantity);
      msg += `• *${item.name}* (${item.quantity}u) - ${formatCurrency(price * item.quantity)}\n`;
    });
    msg += `\n💰 *TOTAL ESTIMADO: ${formatCurrency(cartTotal)}*`;
    
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-visibility duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar Panel */}
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface/95 border-l border-white/10 shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-background/30">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <ShoppingCart className="text-accent" /> Mi Pedido
          </h2>
          <Button variant="icon" onClick={() => setIsCartOpen(false)} size="icon" className="w-8 h-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
              <Package className="w-20 h-20" />
              <p className="font-black uppercase text-sm tracking-widest">Carrito Vacío</p>
            </div>
          ) : (
            cart.map(item => {
              const unitPrice = getEffectivePrice(item, item.quantity);
              return (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-background/40 border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-background overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://placehold.co/100x100/212B38/FFF?text=IMG"}
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-2 bg-background rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                            disabled={item.quantity <= (item.minOrder || 1)}
                          >-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
                             className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                          >+</button>
                       </div>
                       <div className="text-right">
                          {unitPrice < item.price && (
                            <span className="text-[10px] text-highlight block leading-none mb-0.5">Promo Vol.</span>
                          )}
                          <span className="text-sm font-black text-white">{formatCurrency(unitPrice * item.quantity)}</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Total & Action */}
        {cart.length > 0 && (
          <div className="p-6 bg-background/80 border-t border-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-end mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Estimado</span>
              <span className="text-3xl font-black text-white tracking-tight">{formatCurrency(cartTotal)}</span>
            </div>
            <Button 
              variant="primary" 
              className="w-full py-4 text-base bg-primary hover:bg-primary/90 shadow-primary/20"
              onClick={handleWhatsApp}
            >
              <Send className="w-5 h-5 mr-2" />
              Solicitar por WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
