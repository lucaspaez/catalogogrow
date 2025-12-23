import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configuración de almacenamiento local para desarrollo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/products'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-image-upload',
      configureServer(server) {
        server.middlewares.use('/api/upload', (req, res) => {
          upload.single('image')(req, res, (err) => {
            if (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            if (!req.file) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'No file uploaded' }))
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              url: `/products/${req.file.filename}` 
            }))
          })
        })
      }
    }
  ],
})

