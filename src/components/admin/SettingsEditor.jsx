import React, { useState } from 'react';
import { Save, Smartphone, Store } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const timeoutPromise = (ms) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase operation timed out")), ms));
};

export const SettingsEditor = ({ onClose }) => {
  const { settings } = useStore();
  const [formData, setFormData] = useState({
    whatsappNumber: settings.whatsappNumber,
    storeName: settings.storeName
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!formData.storeName.trim()) {
      setError('El nombre de la tienda es requerido.');
      return false;
    }
    const whatsappRegex = /^\d+$/;
    if (!whatsappRegex.test(formData.whatsappNumber) || formData.whatsappNumber.length < 10 || formData.whatsappNumber.length > 15) {
      setError('El número de WhatsApp debe contener solo dígitos y tener entre 10 y 15 caracteres.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'artifacts', settings.catalogId, 'public', 'data', 'settings', 'general');
      await Promise.race([
        setDoc(docRef, formData, { merge: true }),
        timeoutPromise(10000)
      ]);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar configuración");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="space-y-2">
         <label className="text-xs font-bold uppercase text-slate-500">Nombre de la Tienda</label>
         <div className="relative">
           <Input 
             value={formData.storeName}
             onChange={e => setFormData({...formData, storeName: e.target.value})}
             className="pl-10"
           />
           <Store className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
         </div>
       </div>

       <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Número de WhatsApp (con código país)</label>
          <div className="relative">
            <Input 
              value={formData.whatsappNumber}
              onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
              placeholder="5491112345678"
              className="pl-10"
            />
            <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[10px] text-slate-500">Formato internacional sin '+' ni espacios. Ej: 549...</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full bg-accent text-background hover:bg-accent/90" isLoading={isLoading}>
          <Save className="w-4 h-4 mr-2" /> Guardar Configuración
        </Button>
    </form>
  );
};
