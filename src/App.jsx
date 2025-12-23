import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { ErrorProvider, useError } from './context/ErrorContext';
import { Navbar } from './components/layout/Navbar';
import { CartSidebar } from './components/cart/CartSidebar';
import { ProductGrid } from './components/products/ProductGrid';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { AdminLogin } from './components/admin/AdminLogin';
import { ProductEditor } from './components/admin/ProductEditor';
import { SettingsEditor } from './components/admin/SettingsEditor';
import { PlusCircle, Settings } from 'lucide-react';
import { ProductService } from './services/firebaseService';
import { useStore } from './context/StoreContext';

function AppContent() {
  const { isAdmin } = useAuth();
  const { settings } = useStore();
  const { showError } = useError();

  // Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = create, {id...} = edit

  // Inicializar servicio
  const productService = useMemo(
    () => new ProductService(settings.catalogId),
    [settings.catalogId]
  );

  // Handlers
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Eliminar definitivamente "${product.name}"?`)) return;

    try {
      await productService.deleteProduct(product.id);
    } catch (error) {
      showError(error);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productService.updateProduct(product.id, { active: !product.active });
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-highlight/30">
      <Navbar onOpenAdmin={() => isAdmin ? setIsSettingsOpen(true) : setIsLoginOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Admin Dashboard Header */}
        {isAdmin && (
          <div className="mb-8 p-6 rounded-[2rem] bg-surface/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">Panel de Control</h2>
              <p className="text-sm text-slate-400">Gestiona tu catálogo y configuración</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="secondary"
                className="flex-1 md:flex-none"
              >
                <Settings className="w-4 h-4 mr-2" /> Configuración
              </Button>
              <Button
                onClick={() => setEditingProduct({})}
                variant="primary"
                className="flex-1 md:flex-none bg-accent text-background hover:bg-accent/90"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Nuevo Producto
              </Button>
            </div>
          </div>
        )}

        <ProductGrid
          onEditProduct={setEditingProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleActiveProduct={handleToggleActive}
        />
      </main>

      <CartSidebar />

      {/* Modals */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Acceso Administrativo">
        <AdminLogin onClose={() => setIsLoginOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title={editingProduct?.id ? "Editar Producto" : "Nuevo Producto"}>
        <ProductEditor productToEdit={editingProduct} onClose={() => setEditingProduct(null)} />
      </Modal>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configuración de Tienda">
        <SettingsEditor onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ErrorProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ErrorProvider>
  );
}
