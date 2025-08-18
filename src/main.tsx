import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx';

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
            <App />
      </AuthProvider>
  </StrictMode>,
)
