import React from 'react';
import { ShoppingCart, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
export const Navbar = ({ onOpenAdmin }) => {
  const { isAdmin, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">
              {settings.storeName.split(' ')[0]} 
              <span className="text-accent ml-1">{settings.storeName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Mejora tus cultivos</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase text-primary tracking-wider">
                <User className="w-3 h-3" /> Admin Mode
              </span>
              <Button variant="icon" onClick={logout} title="Cerrar Sesión">
                <LogOut className="w-5 h-5 text-red-400" />
              </Button>
            </div>
          ) : (
            <Button variant="icon" onClick={onOpenAdmin} title="Administración">
              <Settings className="w-5 h-5 text-slate-400" />
            </Button>
          )}

          <Button 
            variant="primary" 
            className="relative !p-3 !rounded-xl bg-accent hover:bg-accent/90 shadow-accent/20"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-background" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-background text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
