import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import ErrorBoundary from './components/Common/ErrorBoundary.jsx'
import './index.css'

function Root() {
  const [mode, setMode] = useState('light')
  const toggleMode = () => setMode(m => (m === 'light' ? 'dark' : 'light'))
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode, primary: { main: '#5e35b1' } },
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
