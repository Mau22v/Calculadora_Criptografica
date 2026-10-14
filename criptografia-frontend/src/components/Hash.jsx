import { useState } from 'react'
import { calcularHash } from '../services/api'

function Hash() {

  const [algoritmo, setAlgoritmo] = useState('SHA-256')
  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const ejecutarHash = async () => {

    if (!mensaje.trim()) {
      setError('Escribe un mensaje antes de calcular el hash.')
      setResultado('')
      return
    }

    setCargando(true)
    setError('')
    setResultado('')

    try {

      const data = await calcularHash(
        mensaje,
        algoritmo
      )

      setResultado(data.resultado)

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  const limpiar = () => {
    setMensaje('')
    setResultado('')
    setError('')
  }

  return (
    <div className="crypto-page">
      <div className="page-header">
        <div>
          <h1>Funciones Hash</h1>
          <p>
            Genera el resumen criptográfico de un mensaje
            utilizando diferentes algoritmos.
          </p>
        </div>
      </div>


      <div className="crypto-form-card">
        <div className="form-group">
          <label>
            Algoritmo
          </label>
          <select
            value={algoritmo}
            onChange={(e) => setAlgoritmo(e.target.value)}
          >
            <option value="MD5">MD5</option>
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
          </select>
        </div>


        <div className="form-group">
          <label>
            Mensaje
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe el mensaje que deseas procesar..."
            rows="6"
          />
        </div>

        <div className="button-row">
          <button
            className="primary-button"
            onClick={ejecutarHash}
            disabled={cargando}
          >
            {cargando ? 'Calculando...' : 'Calcular Hash'}
          </button>

          <button
            className="secondary-button"
            onClick={limpiar}
          >
            Limpiar
          </button>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {resultado && (
          <div className="result-section">
            <div className="result-header">
              <div>
                <span>
                  RESULTADO
                </span>
                <strong>
                  {algoritmo}
                </strong>
              </div>

              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(resultado)}
              >
                Copiar
              </button>
            </div>
            <div className="result-box">
              {resultado}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hash