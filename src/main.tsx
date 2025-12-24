import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, IconProvider, darkTheme } from '@engineeringlabs/frontboot'
import '@engineeringlabs/frontboot/styles'
import App from './App'
import { icons } from './icons'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <IconProvider icons={icons}>
        <App />
      </IconProvider>
    </ThemeProvider>
  </StrictMode>
)
