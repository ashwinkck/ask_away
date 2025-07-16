import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react' // Required for Chakra UI
    })
  ],
  resolve: {
    alias: {
      '@emotion/react': '@emotion/react',
      '@emotion/styled': '@emotion/styled',
      '@chakra-ui/react': '@chakra-ui/react',
      'react-icons': 'react-icons' // Add alias for react-icons
    }
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@chakra-ui/react',
      'framer-motion',
      'react-icons/fi' // Specify the fi submodule explicitly
    ]
  }
})