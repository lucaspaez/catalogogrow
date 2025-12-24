# 🚀 Guía de Deploy - Santa Montaña Catálogo

Esta guía documenta el proceso completo de deploy para desarrolladores futuros.

---

## 📋 Resumen

- **Hosting**: Vercel (auto-deploy desde GitHub)
- **Storage de Imágenes**: Vercel Blob (500 MB gratis)
- **Base de Datos**: Firebase Firestore
- **Auth**: Firebase Authentication

---

## 🔧 Configuración Inicial (Una vez)

### 1. Conectar con Vercel

#### Opción A: Desde Vercel Dashboard

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio de GitHub
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy inicial
vercel
```

---

### 2. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agregar las siguientes variables:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**Importante**: Configura para **Production**, **Preview** y **Development**

---

### 3. Habilitar Vercel Blob

1. En tu proyecto de Vercel
2. **Storage** → **Create Database**
3. Selecciona **Blob**
4. Click **Continue** y acepta términos (500 MB gratis)
5. Vercel automáticamente crea `BLOB_READ_WRITE_TOKEN`

**Verificar**: Ve a Settings → Environment Variables y confirma que existe `BLOB_READ_WRITE_TOKEN`

---

### 4. Configurar Firebase (si es nuevo proyecto)

#### Firestore Database

```javascript
// Reglas de seguridad
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{catalogId}/public/data/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.firebase.sign_in_provider != 'anonymous';
    }
  }
}
```

#### Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Habilitar **Email/Password**
3. Crear primer usuario admin manualmente

---

## 🔄 Deploy de Cambios (Uso Diario)

### Workflow Estándar

```bash
# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "feat: descripción del cambio"

# 3. Push a main
git push origin main

# 4. Vercel despliega automáticamente
# Ver progreso en: https://vercel.com/dashboard
```

### Deploy Automático

**Qué sucede automáticamente:**
1. Vercel detecta el push
2. Instala dependencias (`npm install`)
3. Ejecuta build (`npm run build`)
4. Optimiza assets
5. Despliega a producción
6. Te notifica por email

**Tiempo promedio**: 1-2 minutos

---

## 🔍 Preview Deployments

Vercel crea previews automáticos para:
- Pull Requests
- Branches que no sean `main`

**Uso:**
```bash
# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y push
git push origin feature/nueva-funcionalidad

# Vercel crea URL de preview automáticamente
# Ejemplo: https://catalogogrow-git-feature-usuario.vercel.app
```

**Beneficios:**
- Testear antes de mergear a main
- Compartir con cliente para revisión
- Sin afectar producción

---

## 🐛 Troubleshooting

### Error: "Build failed"

**Causa**: Error de linting o build

**Solución**:
```bash
# Local
npm run build

# Si hay errores, arreglarlos y volver a deployar
```

---

### Error: "Function failed to load"

**Causa**: Error en `/api/upload.js`

**Solución**:
1. Verificar que `@vercel/blob` esté en `dependencies` (no devDependencies)
2. Verificar que `BLOB_READ_WRITE_TOKEN` exista en variables de entorno
3. Check logs en Vercel Dashboard → Functions → upload

---

### Error: Imágenes no se suben

**Diagnóstico**:
```bash
# Verificar en local
npm run dev
# Intentar subir imagen
# Ver console del navegador
```

**Posibles causas**:
1. `BLOB_READ_WRITE_TOKEN` no configurado → Habilitar Vercel Blob
2. Tamaño de imagen > 5MB → Reducir tamaño
3. Tipo de archivo no permitido → Usar JPG/PNG/WEBP/GIF

---

### Error: Firebase "Permission denied"

**Causa**: Reglas de Firestore incorrectas

**Solución**:
1. Firebase Console → Firestore → Reglas
2. Verificar que coincidan con las reglas de arriba
3. Publicar reglas

---

## 📊 Monitoreo

### Analytics de Vercel

1. Vercel Dashboard → Analytics
2. Ver:
   - Requests por minuto
   - Response times
   - Error rates
   - Geographic distribution

### Logs en Tiempo Real

```bash
# Con Vercel CLI
vercel logs catalogogrow --follow

# O en dashboard
# Functions → Logs
```

---

## 🔄 Rollback (Volver a Versión Anterior)

### Método 1: Desde Vercel Dashboard

1. Deployments → Seleccionar deploy anterior
2. Click **⋮** → **Promote to Production**

### Método 2: Desde Git

```bash
# Revertir último commit
git revert HEAD
git push origin main

# O volver a commit específico
git reset --hard <commit-hash>
git push origin main --force
```

---

## 🔐 Seguridad del Deploy

### Variables de Entorno

- ✅ Nunca commitear `.env` al repositorio
- ✅ Usar diferentes valores para dev/prod
- ✅ Rotar tokens periódicamente
- ✅ Limitar acceso al proyecto Vercel

### Firebase

- ✅ Reglas de Firestore restrictivas
- ✅ Auth con email/password fuerte
- ✅ Monitorear uso en Firebase Console

### Vercel Blob

- ✅ Token solo en variables de entorno
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño (5MB)

---

## 📈 Optimizaciones de Producción

### Build Automático

Vercel optimiza automáticamente:
- Code splitting
- Tree shaking
- Minificación
- Compresión gzip/brotli
- Edge caching

### Mejoras Manuales (Futuro)

```javascript
// Lazy loading de componentes
const ProductEditor = lazy(() => import('./components/admin/ProductEditor'));

// Image optimization
import Image from 'next/image'; // Si migramos a Next.js
```

---

## 🧪 Testing Antes de Deploy

### Checklist

```bash
# 1. Build local
npm run build

# 2. Preview local del build
npm run preview

# 3. Verificar funcionalidades
- [ ] Login admin funciona
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] WhatsApp abre correctamente
- [ ] Subida de imágenes (requiere Vercel Blob local)

# 4. Deploy a preview branch (opcional)
git checkout -b preview/test
git push origin preview/test
# Testear en URL de preview
```

---

## 📞 Contacto para Dudas

- **Documentación Técnica**: Ver `/Reglas/REGLAS_DESARROLLO_IA.md`
- **Logs de Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)

---

## 🎯 Checklist de Deploy Completo

### Primera Vez
- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Vercel Blob habilitado
- [ ] Reglas de Firebase publicadas
- [ ] Usuario admin creado
- [ ] Deploy exitoso

### Cada Deploy
- [ ] Código lintea sin errores (`npm run lint`)
- [ ] Build exitoso localmente (`npm run build`)
- [ ] Cambios commiteados con mensaje descriptivo
- [ ] Push a GitHub
- [ ] Deploy de Vercel exitoso
- [ ] Funcionalidad verificada en producción

---

**Última actualización**: Diciembre 2024  
**Mantenedores**: Lucas Paez
