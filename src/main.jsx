import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

const Fallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
    color: '#4f46e5'
  }}>
    Chargement…
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<Fallback />}>
      <App />
    </Suspense>
  </StrictMode>,
)
