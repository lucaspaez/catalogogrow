import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signInWithCustomToken, // Importación corregida
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  ShoppingCart, Send, Search, Info, Package, Wind, 
  Hammer, Leaf, Plus, Minus, X, Trash2, CheckCircle2,
  Settings, Save, Edit3, PlusCircle, Image as ImageIcon,
  TrendingDown, LogIn, LogOut, Key, AlertCircle, Tag
} from 'lucide-react';

/**
 * CONFIGURACIÓN DE FIREBASE
 * Lógica robusta para detectar el entorno (Local Vite vs Entorno Cloud)
 */
const getFirebaseConfig = () => {
  // 1. Intentamos obtener la configuración desde el entorno de ejecución global (Cloud)
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return JSON.parse(__firebase_config);
    } catch (e) {
      console.error("Error al parsear __firebase_config:", e);
    }
  }

  // 2. Fallback para entorno local con Vite (.env)
  // Usamos un bloque try-catch para manejar entornos que no soportan import.meta
  let localEnv = {};
  try {
    // @ts-ignore
    localEnv = (import.meta && import.meta.env) ? import.meta.env : {};
  } catch (e) {
    localEnv = {};
  }

  return {
    apiKey: localEnv.VITE_FIREBASE_API_KEY || "",
    authDomain: localEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: localEnv.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: localEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: localEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: localEnv.VITE_FIREBASE_APP_ID || ""
  };
};

const finalConfig = getFirebaseConfig();
const app = initializeApp(finalConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const CATALOG_ID = typeof __app_id !== 'undefined' ? __app_id : 'grow-3d-main'; 

const categories = ["Todos", "Estructuras", "Cultivo", "Ventilación"];

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Manejo de Autenticación con corrección de signInWithCustomToken
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u && !u.isAnonymous);
    });
    
    const initAuth = async () => {
      if (!auth.currentUser) {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (e) { 
          console.error("Error en la autenticación inicial:", e); 
        }
      }
    };
    initAuth();
    
    return () => unsubscribe();
  }, []);

  // 2. Carga de Datos desde Firestore
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', CATALOG_ID, 'public', 'data', 'products');
    const unsubscribe = onSnapshot(query(colRef), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(data);
    }, (err) => {
      console.error("Error en Firestore:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Lógica de Precios
  const getEffectivePrice = (product, quantity) => {
    if (!product.volumeDiscounts || product.volumeDiscounts.length === 0) return product.price;
    const sorted = [...product.volumeDiscounts].sort((a, b) => b.threshold - a.threshold);
    const discount = sorted.find(d => quantity >= d.threshold);
    return discount ? discount.price : product.price;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, products]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      setShowLogin(false);
      showFeedback("Sesión de administrador activa");
    } catch (error) {
      showFeedback("Error: Email o contraseña incorrectos");
    }
  };

  const saveProduct = async (productData) => {
    if (!isAdmin) return;
    const id = productData.id || Date.now().toString();
    const docRef = doc(db, 'artifacts', CATALOG_ID, 'public', 'data', 'products', id);
    await setDoc(docRef, { ...productData, id });
    setEditingProduct(null);
    showFeedback("Producto actualizado");
  };

  const deleteProduct = async (id) => {
    if (!isAdmin || !window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    await deleteDoc(doc(db, 'artifacts', CATALOG_ID, 'public', 'data', 'products', id));
    showFeedback("Eliminado");
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const addToCart = (product, qty) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setModalProduct(null);
    showFeedback("Agregado al pedido");
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = getEffectivePrice(item, item.quantity);
    return sum + (price * item.quantity);
  }, 0);

  const sendWhatsApp = () => {
    const phoneNumber = "5491112345678"; 
    let msg = "🌱 *PEDIDO GROW 3D*\n\n";
    cart.forEach(item => {
      const p = getEffectivePrice(item, item.quantity);
      msg += `• *${item.name}* (${item.quantity}u) - $${(p * item.quantity).toLocaleString()}\n`;
    });
    msg += `\n💰 *TOTAL ESTIMADO: $${cartTotal.toLocaleString()}*`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{feedback}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Grow 3D <span className="text-emerald-500">Master</span></h1>
          </div>
          <div className="flex items-center gap-2">
             {isAdmin ? (
               <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-xs font-bold uppercase transition-colors hover:bg-red-500 hover:text-white">Salir</button>
             ) : (
               <button onClick={() => setShowLogin(true)} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all shadow-lg"><Settings className="w-5 h-5" /></button>
             )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-emerald-600 rounded-xl hover:bg-emerald-500 shadow-xl shadow-emerald-900/30 transition-all active:scale-95">
              <ShoppingCart className="w-5 h-5 text-white" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-950">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Buscador y Categorías */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" placeholder="Buscar productos..."
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 transition-all text-sm font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button onClick={() => setEditingProduct({ name: '', price: 0, minOrder: 1, category: 'Cultivo', image: '', description: '', volumeDiscounts: [] })} className="w-full mb-10 py-8 border-2 border-dashed border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center gap-2 text-emerald-500 font-black text-sm uppercase hover:bg-emerald-500/5 transition-all group">
            <PlusCircle className="w-8 h-8 group-hover:rotate-90 transition-transform" /> CARGAR NUEVO PRODUCTO
          </button>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-emerald-500/40 transition-all duration-300 shadow-xl">
              <div className="relative aspect-square cursor-pointer overflow-hidden bg-slate-800" onClick={() => { setModalProduct(product); setModalQuantity(product.minOrder); }}>
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = "https://placehold.co/400x400/1e293b/white?text=3D+Solution"; }} />
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }} className="bg-amber-500 p-2.5 rounded-xl text-slate-950 shadow-xl hover:scale-110 transition-transform"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }} className="bg-red-500 p-2.5 rounded-xl text-white shadow-xl hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 h-10 leading-snug">{product.name}</h3>
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">P. Mayorista</span>
                    <span className="text-lg font-black text-emerald-400 tracking-tight">${product.price.toLocaleString()}</span>
                  </div>
                  <button onClick={() => { setModalProduct(product); setModalQuantity(product.minOrder); }} className="bg-slate-800 p-3 rounded-2xl text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setShowLogin(false)}></div>
          <form onSubmit={handleLogin} className="relative bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl animate-in zoom-in">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-emerald-600/20 p-4 rounded-3xl mb-4">
                <Key className="text-emerald-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-center uppercase tracking-widest leading-none">Admin Login</h2>
            </div>
            <div className="space-y-4 mb-8">
              <input type="email" placeholder="Email" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none focus:border-emerald-500" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none focus:border-emerald-500" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all">ENTRAR AL PANEL</button>
          </form>
        </div>
      )}

      {/* MODAL DETALLE CLIENTE */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setModalProduct(null)}></div>
          <div className="relative bg-slate-900 border border-white/5 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{modalProduct.name}</h2>
              <button onClick={() => setModalProduct(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            {modalProduct.volumeDiscounts?.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-2"><Tag className="w-3 h-3" /> Escalas de descuento:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <div className={`p-4 rounded-2xl border flex flex-col items-center min-w-[90px] ${modalQuantity < Math.min(...modalProduct.volumeDiscounts.map(d => d.threshold)) ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-950 border-white/5 opacity-50'}`}>
                    <span className="text-[8px] font-black uppercase">BASE</span>
                    <span className="text-base font-black">${modalProduct.price}</span>
                  </div>
                  {modalProduct.volumeDiscounts.sort((a,b)=>a.threshold-b.threshold).map((d, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center min-w-[90px] transition-all ${modalQuantity >= d.threshold ? 'bg-amber-500 border-amber-400 text-slate-950 scale-105' : 'bg-slate-950 border-white/5 opacity-50'}`}>
                      <span className="text-[8px] font-black">+{d.threshold} U.</span>
                      <span className="text-sm font-black">${d.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setModalQuantity(Math.max(modalProduct.minOrder, modalQuantity - 1))} className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center hover:text-emerald-500"><Minus className="w-4 h-4" /></button>
                <span className="text-3xl font-black text-white w-12 text-center">{modalQuantity}</span>
                <button onClick={() => setModalQuantity(modalQuantity + 1)} className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center hover:text-emerald-500"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-600 font-black uppercase">Subtotal</span>
                <div className="text-3xl font-black text-emerald-400">${(getEffectivePrice(modalProduct, modalQuantity) * modalQuantity).toLocaleString()}</div>
              </div>
            </div>

            <button onClick={() => addToCart(modalProduct, modalQuantity)} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3">
              <Plus className="w-5 h-5" /> AGREGAR AL PEDIDO
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-4 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
               <AlertCircle className="w-3 h-3 text-amber-500" /> Pedido mínimo: {modalProduct.minOrder} unidades
            </p>
          </div>
        </div>
      )}

      {/* MODAL EDITOR ADMIN */}
      {editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
             <h2 className="text-xl font-black uppercase mb-6 text-emerald-400 flex items-center gap-2"><Edit3 className="w-5 h-5" /> Editar Producto</h2>
             <div className="space-y-4">
                <input placeholder="Nombre" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none focus:border-emerald-500 transition-all" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Precio Base" type="number" className="bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})} />
                  <input placeholder="Min. Pedido" type="number" className="bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none" value={editingProduct.minOrder} onChange={(e) => setEditingProduct({...editingProduct, minOrder: parseInt(e.target.value) || 1})} />
                </div>
                <input placeholder="Ruta Imagen (ej: /products/archivo.png)" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none" value={editingProduct.image} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} />
                
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Descuentos x Volumen</span>
                    <button onClick={() => setEditingProduct({...editingProduct, volumeDiscounts: [...(editingProduct.volumeDiscounts || []), {threshold: 0, price: 0}]})} className="text-[9px] bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-black uppercase">+ Añadir</button>
                  </div>
                  <div className="space-y-3">
                    {editingProduct.volumeDiscounts?.map((d, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input placeholder="Cant." type="number" className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500" value={d.threshold} onChange={(e) => { const n = [...editingProduct.volumeDiscounts]; n[i].threshold = parseInt(e.target.value) || 0; setEditingProduct({...editingProduct, volumeDiscounts: n}); }} />
                        <input placeholder="Precio" type="number" className="w-full bg-slate-900 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-emerald-500" value={d.price} onChange={(e) => { const n = [...editingProduct.volumeDiscounts]; n[i].price = parseInt(e.target.value) || 0; setEditingProduct({...editingProduct, volumeDiscounts: n}); }} />
                        <button onClick={() => setEditingProduct({...editingProduct, volumeDiscounts: editingProduct.volumeDiscounts.filter((_, idx)=>idx!==i)})} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => saveProduct(editingProduct)} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 mt-4">
                  <Save className="w-5 h-5" /> GUARDAR PRODUCTO
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CARRITO LATERAL */}
      <div className={`fixed inset-0 z-[100] transition-visibility ${isCartOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-white/10 transition-transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><ShoppingCart className="text-emerald-500" /> Mi Pedido</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-950 rounded-xl hover:text-emerald-400 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-grow overflow-y-auto p-8 space-y-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20"><Package className="w-16 h-16 mb-4" /><p className="font-black uppercase text-xs">Sin artículos</p></div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-white/5 pb-4">
                  <img src={item.image} className="w-14 h-14 rounded-xl object-cover bg-slate-950" />
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1 items-start">
                      <h4 className="text-xs font-bold text-white uppercase">{item.name}</h4>
                      <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500">{item.quantity}u × ${getEffectivePrice(item, item.quantity).toLocaleString()}</span>
                      <span className="text-sm font-black text-emerald-400">${(getEffectivePrice(item, item.quantity) * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-8 bg-slate-950 border-t border-white/5 rounded-t-[3rem]">
              <div className="flex justify-between items-end mb-8">
                <span className="text-xs font-black text-slate-600 uppercase">Inversión Total</span>
                <span className="text-3xl font-black text-white">${cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={sendWhatsApp} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-emerald-500 transition-all">
                <Send className="w-5 h-5" /> PEDIR POR WHATSAPP
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}