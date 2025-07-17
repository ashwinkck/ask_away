import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    brand: {
      50: '#ebf8ff',
      100: '#bee3f8',
      200: '#90cdf4',
      300: '#63b3ed',
      400: '#4299e1',
      500: '#3182ce',
      600: '#2b77cb',
      700: '#2c5aa0',
      800: '#2a4365',
      900: '#1a365d',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#000000' : '#ffffff',
        color: props.colorMode === 'dark' ? '#ffffff' : '#000000',
      },
    }),
  },
  components: {
    Box: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? '#000000' : undefined,
      }),
    },
    Container: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? '#000000' : undefined,
      }),
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? '#000000' : undefined,
        },
      }),
    },
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': {
        _light: '#ffffff',
        _dark: '#000000',
      },
      'chakra-body-text': {
        _light: '#000000',
        _dark: '#ffffff',
      },
      'chakra-subtle-bg': {
        _light: '#f7fafc',
        _dark: '#000000',
      },
      'chakra-subtle-text': {
        _light: '#4a5568',
        _dark: '#e2e8f0',
      },
      'chakra-placeholder-color': {
        _light: '#a0aec0',
        _dark: '#718096',
      },
    },
  },
})

export default theme