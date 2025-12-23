# Santa Montaña - Catálogo Interactivo

Catálogo de productos online con diseño "Glassmorphism" moderno, carrito de compras integrado con WhatsApp y panel de administración completo.

## 🚀 Tecnologías

*   **Frontend**: React 19 + Vite
*   **Estilos**: Tailwind CSS v4 (Variables CSS nativas)
*   **Backend**: Firebase (Auth, Firestore, Storage)
*   **Iconos**: Lucide React

## 🎨 Características

*   **Diseño Moderno**: Interfaz oscura con efectos de vidrio esmerilado (Glassmorphism) y acentos neón.
*   **Gestión de Productos**:
    *   CRUD completo (Crear, Leer, Editar, Eliminar).
    *   Activación/Desactivación de productos.
    *   Soporte para descuentos por volumen (escalas de precios).
*   **Carrito de Compras**:
    *   Cálculo automático de precios según cantidad.
    *   Persistencia local.
    *   **Pedido por WhatsApp**: Genera un mensaje detallado automáticamente.
*   **Configuración Dinámica**:
    *   Cambio de número de teléfono y nombre de tienda desde el panel admin.

## 🛠️ Instalación y Desarrollo

1.  **Clonar repositorio**:
    ```bash
    git clone <repo-url>
    cd catalogogrow
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz con tus credenciales de Firebase:
    ```env
    VITE_FIREBASE_API_KEY=tus_credenciales
    VITE_FIREBASE_AUTH_DOMAIN=tus_credenciales
    VITE_FIREBASE_PROJECT_ID=tus_credenciales
    VITE_FIREBASE_STORAGE_BUCKET=tus_credenciales
    VITE_FIREBASE_MESSAGING_SENDER_ID=tus_credenciales
    VITE_FIREBASE_APP_ID=tus_credenciales
    ```

4.  **Iniciar Servidor de Desarrollo**:
    ```bash
    npm run dev
    ```

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── admin/       # Panel de control, Login, Editor de Productos
│   ├── cart/        # Sidebar del carrito
│   ├── layout/      # Navbar y elementos estructurales
│   ├── products/    # Grid, Tarjetas y Modales de detalle
│   └── ui/          # Componentes base (Button, Input, GlassCard)
├── context/
│   ├── AuthContext  # Manejo de sesión (Admin vs Visitante)
│   ├── CartContext  # Lógica del carrito
│   └── StoreContext # Configuración global (WhatsApp, Nombre)
└── lib/             # Configuración de Firebase y utilidades
```

## 🔐 Autenticación Admin

El sistema utiliza Firebase Auth. Para crear el primer administrador, puedes hacerlo desde la consola de Firebase o habilitar temporalmente el registro en el código si es necesario. Por defecto, solo permite Login.

## 📄 Licencia

Propiedad de Santa Montaña.
