function Home({ cambiarVista }) {
  return (
    <div className="home">


      <div className="cards-grid">

        <button
          className="crypto-card"
          onClick={() => cambiarVista('hash')}
        >
          <div className="card-icon hash-icon">
            #
          </div>

          <div>
            <h3>Funciones Hash</h3>

            <p>
              Genera valores hash utilizando algoritmos
              criptográficos.
            </p>
          </div>

          <span className="card-arrow">→</span>
        </button>

        <button
          className="crypto-card"
          onClick={() => cambiarVista('simetrico')}
        >
          <div className="card-icon symmetric-icon">
            🔐
          </div>

          <div>
            <h3>Cifrado Simétrico</h3>

            <p>
              Cifra y descifra información utilizando AES-256-GCM.
            </p>
          </div>

          <span className="card-arrow">→</span>
        </button>

        <button
          className="crypto-card"
          onClick={() => cambiarVista('asimetrico')}
        >
          <div className="card-icon asymmetric-icon">
            🔑
          </div>

          <div>
            <h3>Cifrado Asimétrico</h3>

            <p>
              Genera claves y trabaja con cifrado RSA-2048.
            </p>
          </div>

          <span className="card-arrow">→</span>
        </button>


        <button
          className="crypto-card"
          onClick={() => cambiarVista('comunicacion')}
        >
          <div className="card-icon history-icon">
            ⇄
          </div>

          <div>
            <h3>Comunicación Segura</h3>

            <p>
              Prueba la comunicación segura entre partes utilizando diferentes métodos criptográficos.
            </p>
          </div>

          <span className="card-arrow">→</span>
        </button>


        <button
          className="crypto-card"
          onClick={() => cambiarVista('historial')}
        >
          <div className="card-icon history-icon">
            ☷
          </div>

          <div>
            <h3>Historial</h3>

            <p>
              Consulta las operaciones criptográficas realizadas.
            </p>
          </div>

          <span className="card-arrow">→</span>
        </button>

      </div>


    </div>
  )
}

export default Home