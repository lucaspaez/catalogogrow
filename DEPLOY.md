# Guía de Despliegue (Deployment)

Esta guía detalla cómo llevar el catálogo a producción utilizando **Vercel** (Frontend) y **Firebase** (Backend).

## 1. Configuración de Firebase

### A. Crear Proyecto
1.  Ve a [Firebase Console](https://console.firebase.google.com/).
2.  Crea un nuevo proyecto.
3.  Registra una **Web App**.
4.  Copia las credenciales (`apiKey`, `authDomain`, etc.).

### B. Habilitar Servicios
1.  **Authentication**:
    *   Habilita el proveedor **Email/Password**.
    *   Crea manualmente el usuario administrador en la pestaña "Users".
    *   (Opcional) Habilita "Anonymous" si deseas rastrear sesiones de visitantes (el código lo soporta).
2.  **Firestore Database**:
    *   Crea la base de datos en modo producción.
    *   Configura las **Reglas de Seguridad** (ver abajo).

### C. Reglas de Seguridad (Firestore Rules)
Copia estas reglas en la pestaña "Rules" de Firestore para proteger tu catálogo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar admin
    function isAdmin() {
      return request.auth != null && request.auth.token.firebase.sign_in_provider != 'anonymous';
    }

    // Reglas para el catálogo
    match /artifacts/{catalogId}/public/data {
      
      // Productos: Público lee, Solo Admin escribe
      match /products/{productId} {
        allow read: if true;
        allow write: if isAdmin();
      }
      
      // Configuración: Público lee, Solo Admin escribe
      match /settings/{docId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
  }
}
```

## 2. Despliegue en Vercel

### A. Importar Proyecto
1.  Ve a [Vercel Dashboard](https://vercel.com/).
2.  Haz clic en "Add New..." > "Project".
3.  Importa tu repositorio de GitHub.

### B. Variables de Entorno
En la configuración del proyecto en Vercel, sección **Environment Variables**, añade las claves de Firebase que obtuviste en el paso 1.A:

*   `VITE_FIREBASE_API_KEY`
*   `VITE_FIREBASE_AUTH_DOMAIN`
*   `VITE_FIREBASE_PROJECT_ID`
*   `VITE_FIREBASE_STORAGE_BUCKET`
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`
*   `VITE_FIREBASE_APP_ID`

### C. Deploy
1.  Haz clic en **Deploy**.
2.  Vercel detectará automáticamente que es un proyecto Vite y configurará el build command (`vite build`) y output directory (`dist`).

## 3. Configuración Inicial del Catálogo

Una vez desplegado:
1.  Ingresa a la URL de tu sitio.
2.  Haz clic en el icono de **Engranaje** (Settings) en el Navbar.
3.  Ingresa con el email y contraseña que creaste en Firebase Auth.
4.  Ve a "Configuración" para establecer el **Número de WhatsApp** y **Nombre de la Tienda**.
5.  Comienza a cargar productos.

---
**Nota**: Para las imágenes de productos, el sistema acepta URLs. Puedes usar servicios como Imgur, Cloudinary, o subir los archivos manualmente a Firebase Storage y copiar el link de descarga.
