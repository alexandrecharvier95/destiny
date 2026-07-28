import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The Engine of the Canvas.
// We use Vite because it is silent and invisible. It does not get in the way.
// It bundles our sensory interface with minimal configuration, allowing us 
// to focus entirely on the space we are creating, rather than the machinery beneath it.
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
})
