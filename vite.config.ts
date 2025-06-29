import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ruletaMedica/', // nombre de tu repo
  plugins: [react()],
})