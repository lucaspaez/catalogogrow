import React from 'react';
import { Plus, Edit3, Trash2, EyeOff, Eye } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product, onSelect, onEdit, onDelete, onToggleActive }) => {
  const { isAdmin } = useAuth();

  return (
    <GlassCard 
      className={`group relative flex flex-col overflow-hidden !p-0 ${!product.active && isAdmin ? 'opacity-75 border-red-500/30 border-dashed' : ''}`} 
      hoverEffect={true}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-square overflow-hidden bg-background cursor-pointer" 
        onClick={() => onSelect(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          loading="lazy"
          onError={(e) => { e.target.src = "https://placehold.co/400x400/212B38/FFF?text=IMG"; }} 
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />

        {/* Admin Controls Overlay */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10" onClick={(e) => e.stopPropagation()}>
             <Button variant="icon" size="sm" onClick={() => onEdit(product)} className="bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500 hover:text-white">
                <Edit3 className="w-4 h-4" />
             </Button>
             <Button variant="icon" size="sm" onClick={() => onDelete(product)} className="bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white">
                <Trash2 className="w-4 h-4" />
             </Button>
             <Button variant="icon" size="sm" onClick={() => onToggleActive(product)} className={`${product.active ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-500'}`}>
                {product.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
             </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 
          className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight min-h-[2.5em] cursor-pointer hover:text-highlight transition-colors"
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h3>
        
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {product.description || "Consultar detalles..."}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Precio</span>
            <span className="text-lg font-black text-accent tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>
          <Button 
            variant="icon" 
            className="rounded-full w-10 h-10 bg-primary text-white border-none shadow-lg shadow-primary/30 hover:bg-highlight hover:text-background hover:scale-110"
            onClick={() => onSelect(product)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
