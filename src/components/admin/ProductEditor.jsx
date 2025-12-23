import React, { useState } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';

const CATEGORIES = ["Estructuras", "Cultivo", "Ventilación", "Accesorios"];

const timeoutPromise = (ms) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase operation timed out")), ms));
};

export const ProductEditor = ({ productToEdit, onClose }) => {
  const { settings } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  const [formData, setFormData] = useState(() => {
    if (productToEdit && Object.keys(productToEdit).length > 0) {
      return productToEdit;
    }
    return {
      name: '',
      description: '',
      price: 0,
      category: 'Accesorios',
      image: '',
      minOrder: 1,
      active: true,
      volumeDiscounts: []
    };
  });

  const validate = () => {
    const newErrors = [];
    if (!formData.name.trim()) newErrors.push("El nombre es obligatorio.");
    
    const price = Number(formData.price);
    if (isNaN(price) || price < 0) newErrors.push("El precio debe ser un número mayor o igual a 0.");
    
    const minOrder = Number(formData.minOrder);
    if (isNaN(minOrder) || !Number.isInteger(minOrder) || minOrder < 1) newErrors.push("El pedido mínimo debe ser un entero mayor o igual a 1.");
    
    const urlPattern = /^(http|https|\/).+/;
    if (formData.image && !urlPattern.test(formData.image)) {
       newErrors.push("La URL de la imagen debe comenzar con http, https o /.");
    }

    if (formData.volumeDiscounts) {
        formData.volumeDiscounts.forEach((d, index) => {
            const threshold = Number(d.threshold);
            const discountPrice = Number(d.price);

            if (isNaN(threshold) || threshold <= minOrder) {
                newErrors.push(`Descuento #${index + 1}: La cantidad debe ser mayor al pedido mínimo (${minOrder}).`);
            }
            if (isNaN(discountPrice) || discountPrice < 0) {
                newErrors.push(`Descuento #${index + 1}: El precio no puede ser negativo.`);
            }
            if (!isNaN(discountPrice) && !isNaN(price) && discountPrice >= price) {
                newErrors.push(`Descuento #${index + 1}: El precio debe ser menor al precio base.`);
            }
        });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const id = productToEdit?.id || Date.now().toString();
      const docRef = doc(db, 'artifacts', settings.catalogId, 'public', 'data', 'products', id);
      
      // Ensure number types
      const payload = {
        ...formData,
        price: Number(formData.price),
        minOrder: Number(formData.minOrder),
        volumeDiscounts: formData.volumeDiscounts.map(d => ({
          threshold: Number(d.threshold),
          price: Number(d.price)
        }))
      };

      await Promise.race([
        setDoc(docRef, payload, { merge: true }),
        timeoutPromise(10000)
      ]);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar. Ver consola.");
      setIsLoading(false);
    }
  };

  const addDiscount = () => {
    setFormData(prev => ({
      ...prev,
      volumeDiscounts: [...(prev.volumeDiscounts || []), { threshold: 10, price: 0 }]
    }));
  };

  const updateDiscount = (index, field, value) => {
    const newDiscounts = [...formData.volumeDiscounts];
    newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    setFormData(prev => ({ ...prev, volumeDiscounts: newDiscounts }));
  };

  const removeDiscount = (index) => {
    setFormData(prev => ({
      ...prev,
      volumeDiscounts: prev.volumeDiscounts.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Nombre</label>
          <Input 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required
            placeholder="Ej: Maceta Hidropónica"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Categoría</label>
          <select 
            className="glass-input w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-background">{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-slate-500">Descripción</label>
        <TextArea 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Breve descripción del producto..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Precio Base</label>
          <Input 
            type="number"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
            required
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Mínimo</label>
          <Input 
            type="number"
            value={formData.minOrder}
            onChange={e => setFormData({...formData, minOrder: e.target.value})}
            min="1"
          />
        </div>
        <div className="space-y-2">
           <label className="text-xs font-bold uppercase text-slate-500">Imagen (URL)</label>
           <div className="relative">
             <Input 
               value={formData.image}
               onChange={e => setFormData({...formData, image: e.target.value})}
               placeholder="/products/..."
               className="pl-9"
             />
             <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
           </div>
        </div>
      </div>

      {/* Volume Discounts Section */}
      <div className="bg-background/40 p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
           <label className="text-xs font-bold uppercase text-highlight">Descuentos por Volumen</label>
           <Button type="button" variant="ghost" size="sm" onClick={addDiscount} className="text-xs bg-white/5">
             <Plus className="w-3 h-3 mr-1" /> Agregar Escala
           </Button>
        </div>
        
        {formData.volumeDiscounts?.length === 0 && (
          <p className="text-xs text-slate-600 italic text-center py-2">Sin descuentos configurados</p>
        )}

        <div className="space-y-2">
          {formData.volumeDiscounts?.map((discount, idx) => (
            <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2">
              <div className="relative flex-1">
                 <span className="absolute left-3 top-2.5 text-[10px] text-slate-500">CANT &ge;</span>
                 <input 
                   type="number" 
                   className="w-full bg-background rounded-lg pl-12 pr-2 py-2 text-sm border border-white/10 focus:border-highlight/50 outline-none"
                   value={discount.threshold}
                   onChange={e => updateDiscount(idx, 'threshold', e.target.value)}
                 />
              </div>
              <div className="relative flex-1">
                 <span className="absolute left-3 top-2.5 text-[10px] text-slate-500">$</span>
                 <input 
                   type="number"
                   className="w-full bg-background rounded-lg pl-6 pr-2 py-2 text-sm border border-white/10 focus:border-highlight/50 outline-none"
                   value={discount.price}
                   onChange={e => updateDiscount(idx, 'price', e.target.value)}
                 />
              </div>
              <button 
                type="button" 
                onClick={() => removeDiscount(idx)}
                className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 space-y-1">
          <p className="text-red-400 font-bold text-sm">Por favor corrige los siguientes errores:</p>
          <ul className="list-disc list-inside text-xs text-red-300">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        <Save className="w-4 h-4 mr-2" />
        {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
      </Button>
    </form>
  );
};
