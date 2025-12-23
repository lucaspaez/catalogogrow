# Solución de Errores Detectados

## 1. Error de Autenticación (`auth/invalid-credential`)

Este error ocurre porque las credenciales ingresadas no corresponden a un usuario existente en Firebase Authentication.

**Solución:**
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto (`catalogogrow` o el ID que estés usando).
3. En el menú izquierdo, ve a **Autenticación (Authentication)**.
4. Pestaña **Usuarios (Users)** -> Click en **Agregar usuario**.
5. Crea un usuario con el email y contraseña que estás intentando usar (o usa uno nuevo).
6. Intenta loguearte nuevamente en la aplicación.

## 2. Error de CORS en Imágenes (`Access to XMLHttpRequest ... blocked by CORS policy`)

Este error impide que la aplicación web (corriendo en `localhost`) pueda subir o leer imágenes directamente desde Firebase Storage debido a restricciones de seguridad por defecto.

**Solución:**
Debes aplicar la configuración de CORS que acabamos de crear (`cors.json`) a tu bucket de almacenamiento.

1. Asegúrate de tener instaladas las herramientas de Google Cloud SDK (`gsutil`). Si no las tienes, instálalas desde [aquí](https://cloud.google.com/storage/docs/gsutil_install).
2. Abre una terminal y autentícate:
   ```bash
   gcloud auth login
   ```
3. Ejecuta el siguiente comando para aplicar la configuración (reemplaza `gs://tu-bucket-url` por la URL de tu bucket, que suele ser `gs://<project-id>.firebasestorage.app`):
   ```bash
   gsutil cors set cors.json gs://catalogogrow.firebasestorage.app
   ```
   *(Nota: Puedes encontrar la URL exacta de tu bucket en la sección Storage de la consola de Firebase).*

Una vez aplicado, el error de CORS debería desaparecer y las imágenes se cargarán correctamente.
