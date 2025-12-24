# 📦 Santa Montaña - Catálogo Interactivo

Catálogo de productos online con carrito de compras integrado con WhatsApp y panel de administración completo.

![Status](https://img.shields.io/badge/status-production-success)
![Framework](https://img.shields.io/badge/React-19-blue)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

## 🚀 Tecnologías

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS v4 (Glassmorphism)
- **Backend**: Firebase (Auth, Firestore)
- **Storage**: Vercel Blob (imágenes)
- **Hosting**: Vercel
- **Validación**: Zod
- **Seguridad**: DOMPurify (XSS prevention)

---

## ✨ Características

### Para Usuarios
- 📱 Catálogo responsive con diseño moderno
- 🔍 Búsqueda y filtros por categoría
- 🛒 Carrito de compras con descuentos por volumen
- 💬 Envío de pedidos vía WhatsApp
- 💬 Botón flotante de consultas por WhatsApp
- 🌙 Diseño Glassmorphism elegante

### Para Administradores
- 🔐 Login seguro con Firebase Auth
- ➕ CRUD completo de productos
- 📸 Subida de imágenes a Vercel Blob
- 💰 Configuración de descuentos por cantidad
- ⚙️ Gestión de configuración de tienda
- 🔄 Activación/desactivación de productos

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
catalogogrow/
├── api/
│   └── upload.js              # API serverless para upload de imágenes
├── public/
│   └── products/              # Imágenes antiguas (legacy)
├── src/
│   ├── components/
│   │   ├── admin/             # Panel de administración
│   │   ├── cart/              # Carrito de compras
│   │   ├── layout/            # Navbar y layout
│   │   ├── products/          # Grid y cards de productos
│   │   └── ui/                # Componentes reutilizables
│   ├── context/
│   │   ├── AuthContext.jsx    # Autenticación
│   │   ├── CartContext.jsx    # Estado del carrito
│   │   ├── ErrorContext.jsx   # Manejo de errores
│   │   └── StoreContext.jsx   # Configuración global
│   ├── lib/
│   │   ├── errors.js          # Clases de error personalizadas
│   │   ├── firebase.js        # Configuración Firebase
│   │   ├── imageUpload.js     # Cliente Vercel Blob
│   │   ├── sanitize.js        # Prevención XSS
│   │   ├── utils.js           # Utilidades
│   │   └── validation.js      # Esquemas Zod
│   └── services/
│       └── firebaseService.js # Capa de servicios
└── Reglas/
    └── REGLAS_DESARROLLO_IA.md # Estándares de código
```

### Capa de Servicios

El proyecto implementa una capa de servicios que abstrae Firebase:

- **ProductService**: CRUD de productos
- **SettingsService**: Configuración de tienda
- Rutas centralizadas
- Manejo de errores robusto

---

## 🛠️ Desarrollo Local

### Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta Firebase
- Cuenta Vercel (para Blob Storage)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd catalogogrow

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

### Variables de Entorno

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Vercel Blob (automático en producción)
BLOB_READ_WRITE_TOKEN=
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## 🚢 Deploy a Producción

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

### Quick Start

```bash
# 1. Commit cambios
git add .
git commit -m "feat: descripción del cambio"

# 2. Push a main (auto-deploy en Vercel)
git push origin main

# 3. Vercel despliega automáticamente
```

---

## 📋 Configuración Inicial

### 1. Firebase Setup

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Copiar credenciales al `.env`

**Estructura Firestore:**
```
artifacts/
  └── grow-3d-main/
      └── public/
          └── data/
              ├── products/
              │   └── {productId}
              └── settings/
                  └── general
```

### 2. Vercel Blob Setup

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar proyecto
3. **Storage** → **Create Database** → **Blob**
4. Aceptar (500 MB gratis)
5. Token se configura automáticamente

### 3. Primer Admin

Crear manualmente en Firebase Authentication un usuario con email/password.

---

## 🔐 Seguridad

### Implementaciones

- ✅ Validación con Zod en todos los inputs
- ✅ Sanitización XSS con DOMPurify
- ✅ Manejo de errores centralizado
- ✅ Clases de error personalizadas
- ✅ Authentication con Firebase
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño de imágenes (5MB)

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{catalogId}/public/data/{document=**} {
      // Lectura pública
      allow read: if true;
      
      // Escritura solo para autenticados no anónimos
      allow write: if request.auth != null && 
                      request.auth.token.firebase.sign_in_provider != 'anonymous';
    }
  }
}
```

---

## 🧪 Testing

**Estado actual**: 0% cobertura (pendiente)

**Próximos pasos**:
- Configurar Vitest
- Tests para validation schemas
- Tests para servicios
- Tests de componentes críticos

---

## 📚 Recursos

- [Documentación React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Zod Documentation](https://zod.dev)

---

## 🤝 Contribución

Por favor lee [REGLAS_DESARROLLO_IA.md](./Reglas/REGLAS_DESARROLLO_IA.md) antes de contribuir.

### Estándares

- Principios SOLID
- Clean Code (DRY, nombres descriptivos)
- Manejo de errores con throw (nunca return null/false)
- Validación con Zod
- TypeScript estricto (futuro)

---

## 📝 License

Proyecto privado - Todos los derechos reservados

---

## 👥 Autores

- **Desarrollador**: Lucas Paez
- **Asistente IA**: Claude (Anthropic)

---

## 📞 Soporte

Para consultas técnicas, revisar la documentación en `/Reglas/REGLAS_DESARROLLO_IA.md`
