import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import ErrorBoundary from './components/Common/ErrorBoundary.jsx'
import './index.css'

const STORAGE_KEY = 'mappy_theme'

function Root() {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light')
  const toggleMode = () =>
    setMode(m => (m === 'light' ? 'dark' : 'light'))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])
  const theme = useMemo(
    () =>
      createTheme({
        palette: { 
          mode, 
          primary: { main: '#5e35b1' },
          action: {
            selected: mode === 'light' ? '#d4c5e8' : '#4a3a6b', // More visible soft purple for light mode
            selectedOpacity: 0.08,
          }
        },
        typography: { fontFamily: 'Inter, sans-serif' },
        transitions: {
          duration: { shortest: 100, shorter: 150, enteringScreen: 150, leavingScreen: 100 },
        },
      }),
    [mode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App mode={mode} toggleMode={toggleMode} />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

export default Root