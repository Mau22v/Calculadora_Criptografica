import { useState } from 'react'

import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Hash from './components/Hash'
import Simetrico from './components/Simetrico'
import Asimetrico from './components/Asimetrico'
import Historial from './components/Historial'
import Comunicacion from './components/Comunicacion'
import './App.css'

function App() {

  const [vistaActual, setVistaActual] = useState('inicio')

  const renderizarVista = () => {

    switch (vistaActual) {

      case 'hash':
        return <Hash />

      case 'simetrico':
        return <Simetrico />

      case 'asimetrico':
        return <Asimetrico />

      case 'historial':
        return <Historial />

      case 'comunicacion':
        return <Comunicacion />

      default:
        return <Home cambiarVista={setVistaActual} />
    }
  }

  return (
    <div className="app">

      <Sidebar
        vistaActual={vistaActual}
        cambiarVista={setVistaActual}
      />

      <main className="main-content">

        <header className="topbar">

          <div>
            <span className="topbar-title">
              Calculadora Criptográfica
            </span>

            <span className="topbar-subtitle">
              Plataforma de servicios web
            </span>
          </div>

          <div className="status">
            <span className="status-dot"></span>
            Servicios disponibles
          </div>

        </header>

        <section className="content">
          {renderizarVista()}
        </section>

      </main>

    </div>
  )
}

export default App