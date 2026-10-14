function Sidebar({ vistaActual, cambiarVista }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">🔐</div>
                <div>
                    <h2>Calculadora Criptográfica</h2>
                    <span>Servicios Web de Criptografía</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                <button
                    className={vistaActual === 'inicio' ? 'menu-item active' : 'menu-item'}
                    onClick={() => cambiarVista('inicio')}
                >
                    <span>⌂</span>
                    Inicio
                </button>

                <button
                    className={vistaActual === 'hash' ? 'menu-item active' : 'menu-item'}
                    onClick={() => cambiarVista('hash')}
                >
                    <span>#</span>
                    Hash
                </button>
                <button
                    className={vistaActual === 'simetrico' ? 'menu-item active' : 'menu-item'}
                    onClick={() => cambiarVista('simetrico')}
                >
                    <span>🔐</span>
                    Simétrico
                </button>

                <button
                    className={vistaActual === 'asimetrico' ? 'menu-item active' : 'menu-item'}
                    onClick={() => cambiarVista('asimetrico')}
                >
                    <span>🔑</span>
                    Asimétrico
                </button>

                <button
                    className={
                    vistaActual === 'comunicacion'
                    ? 'menu-item active'
                    : 'menu-item'
                }
                onClick={() => cambiarVista('comunicacion')}
                >
                <span>⇄</span> Comunicación segura
                </button>

                <button
                    className={vistaActual === 'historial' ? 'menu-item active' : 'menu-item'}
                    onClick={() => cambiarVista('historial')}
                >
                    <span>☷</span>
                    Historial
                </button>



            </nav>

        </aside>
    );
}

export default Sidebar
