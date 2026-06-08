import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { GenerarPage } from './pages/GenerarPage'
import { FavoritosPage } from './pages/FavoritosPage'
import { ComunidadPage } from './pages/ComunidadPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream font-body">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-herb/5 blur-3xl" />
        </div>
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<GenerarPage />} />
            <Route path="/favoritos" element={<FavoritosPage />} />
            <Route path="/comunidad" element={<ComunidadPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
