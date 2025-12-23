import React, { useState } from 'react';
import { Key, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const AdminLogin = ({ onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onClose(); // Close modal on success
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary/20 p-4 rounded-full mb-6 ring-4 ring-primary/10">
        <Key className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">Acceso Admin</h2>
      <p className="text-slate-400 text-sm mb-8 text-center">Panel de Control de Santa Montaña</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email</label>
          <div className="relative">
            <Input 
              type="email" 
              placeholder="admin@3dprint.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="pl-10"
            />
            <div className="absolute left-3 top-3 text-slate-500">@</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500 ml-1">Contraseña</label>
          <div className="relative">
             <Input 
               type="password" 
               placeholder="••••••••" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
               className="pl-10"
             />
             <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full py-4 mt-4 bg-primary hover:bg-primary/90"
          isLoading={loading}
        >
          Ingresar
        </Button>
      </form>
    </div>
  );
};
