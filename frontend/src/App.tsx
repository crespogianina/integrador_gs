import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { MobileNav } from './components/MobileNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GenerarPage } from './pages/GenerarPage'
import { FavoritosPage } from './pages/FavoritosPage'
import { ComunidadPage } from './pages/ComunidadPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PerfilPage } from './pages/PerfilPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-cream dark:bg-[#1a1008] font-body pb-16 md:pb-0">
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/8 dark:bg-gold/5 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-herb/8 dark:bg-herb/5 blur-3xl" />
              </div>
              <Navbar />
              <main className="relative z-10">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<ProtectedRoute><GenerarPage /></ProtectedRoute>} />
                  <Route path="/favoritos" element={<ProtectedRoute><FavoritosPage /></ProtectedRoute>} />
                  <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
                  <Route path="/comunidad" element={<ComunidadPage />} />
                </Routes>
              </main>
              <MobileNav />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
