import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    outDir: 'dist',
  },
   
  server: process.env.NODE_ENV === 'development' ? {
    proxy:{
      '/api':{
        target:"http://localhost:5000",
        changeOrigin:true,
        secure:false,
        //rewrite:path=>path.replace(/^\/api/,'')
      }
    }
    
  } :undefined
 
  
})
