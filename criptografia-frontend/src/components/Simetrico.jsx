import { useState } from 'react'

import {
  generarClaveSimetrica,
  cifrarSimetrico,
  descifrarSimetrico
} from '../services/api'

function Simetrico() {
  
  // DATOS DEL CIFRADO
  const [clave, setClave] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [resultado, setResultado] = useState('')
  const [iv, setIv] = useState('')
  const [tag, setTag] = useState('')

  // DATOS DEL DESCIFRADO
  const [claveDescifrado, setClaveDescifrado] = useState('')
  const [mensajeDescifrado, setMensajeDescifrado] = useState('')

  // ESTADOS GENERALES
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // GENERAR CLAVE
  const generarClave = async () => {

    setCargando(true)
    setError('')

    try {

      const data = await generarClaveSimetrica()

      setClave(data.clave)

      // Limpiamos resultados anteriores
      setResultado('')
      setIv('')
      setTag('')
      setMensajeDescifrado('')
      setClaveDescifrado('')

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  // CIFRAR MENSAJE

  const cifrar = async () => {

    if (!clave) {
      setError('Primero genera una clave secreta.')
      return
    }

    if (!mensaje.trim()) {
      setError('Escribe un mensaje antes de cifrar.')
      return
    }

    setCargando(true)
    setError('')

    try {

      const data = await cifrarSimetrico(
        mensaje,
        clave
      )

      setResultado(data.resultado)
      setIv(data.iv)
      setTag(data.tag)

      // Limpiamos resultado de descifrado anterior
      setMensajeDescifrado('')
      setClaveDescifrado('')

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  // DESCIFRAR MENSAJE
  const descifrar = async () => {

    if (!resultado) {
      setError('Primero debes cifrar un mensaje.')
      return
    }

    if (!claveDescifrado.trim()) {
      setError('Introduce la clave secreta para descifrar.')
      return
    }

    setCargando(true)
    setError('')
    setMensajeDescifrado('')

    try {

      const data = await descifrarSimetrico(
        resultado,
        claveDescifrado,
        iv,
        tag
      )

      setMensajeDescifrado(data.resultado)

    } catch (error) {

      setError(
        'No fue posible descifrar el mensaje. Verifica que la clave sea correcta.'
      )

    } finally {

      setCargando(false)

    }
  }

  // LIMPIAR

  const limpiar = () => {

    setClave('')
    setMensaje('')

    setResultado('')
    setIv('')
    setTag('')

    setClaveDescifrado('')
    setMensajeDescifrado('')

    setError('')
  }

  // COPIAR
  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      setError('No fue posible copiar el contenido.')
    }
  }

  return (

    <div className="crypto-page">

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="page-header">
        <div>
          <span className="section-label">
            CRIPTOGRAFÍA SIMÉTRICA
          </span>
          <h1>AES-256-GCM</h1>
          <p>
            Cifra y descifra mensajes utilizando una
            clave secreta generada automáticamente.
          </p>
        </div>
      </div>


      {/* =========================
          SECCIÓN CIFRADO
      ========================= */}

      <div className="crypto-form-card">
        <div className="crypto-section-title">
          <div>
            <h2>Cifrar mensaje</h2>
            <p>
              Genera una clave y utiliza AES-256-GCM
              para proteger tu mensaje.
            </p>
          </div>
        </div>

        {/* CLAVE */}
        <div className="form-group">
          <label>
            Clave secreta
          </label>
          <div className="input-with-button">
            <input
              type="text"
              value={clave}
              readOnly
              placeholder="Genera una clave secreta"
            />
            <button
              className="secondary-button"
              onClick={generarClave}
              disabled={cargando}
            >
              {clave ? 'Generar nueva' : 'Generar clave'}
            </button>
          </div>
          <small className="form-help">
            La clave de 256 bits es generada automáticamente
            por el servidor.
          </small>
        </div>

        {/* MENSAJE */}

        <div className="form-group">

          <label>
            Mensaje
          </label>

          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe el mensaje que deseas cifrar..."
            rows="5"
          />

        </div>


        {/* BOTONES */}

        <div className="button-row">

          <button
            className="primary-button"
            onClick={cifrar}
            disabled={cargando}
          >
            {cargando ? 'Cifrando...' : 'Cifrar mensaje'}
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* =========================
            RESULTADO DEL CIFRADO
        ========================= */}

        {resultado && (
          <div className="result-section">
            <div className="result-header">
              <div>
                <span>
                  RESULTADO DEL CIFRADO
                </span>
                <strong>
                  AES-256-GCM
                </strong>
              </div>
              <button
                className="copy-button"
                onClick={() => copiar(resultado)}
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


      {/* =======================
          SECCIÓN DESCIFRADO
      ========================= */}

      <div className="crypto-form-card decrypt-card">
        <div className="crypto-section-title">
          <div>

            <h2>Descifrar mensaje</h2>

            <p>
              Introduce la clave secreta utilizada durante
              el cifrado para recuperar el mensaje original.
            </p>

          </div>

        </div>


        {/* CLAVE PARA DESCIFRAR */}

        <div className="form-group">

          <label>
            Clave secreta
          </label>

          <input
            type="text"
            value={claveDescifrado}
            onChange={(e) =>
              setClaveDescifrado(e.target.value)
            }
            placeholder="Introduce la clave secreta"
          />

          <small className="form-help">
            Debe ser exactamente la misma clave utilizada
            para cifrar el mensaje.
          </small>

        </div>


        {/* INFORMACIÓN DEL CIFRADO */}

        {resultado && (

          <div className="encryption-info">

            <div>
              <span>MENSAJE CIFRADO DISPONIBLE</span>
              <strong>
                Sí
              </strong>
            </div>

            <div>
              <span>ALGORITMO</span>
              <strong>
                AES-256-GCM
              </strong>
            </div>

          </div>

        )}


        {/* BOTÓN */}

        <div className="button-row">

          <button
            className="primary-button"
            onClick={descifrar}
            disabled={cargando || !resultado}
          >
            {cargando ? 'Descifrando...' : 'Descifrar mensaje'}
          </button>

          <button
            className="secondary-button"
            onClick={limpiar}
          >
            Limpiar todo
          </button>

        </div>


        {/* MENSAJE DESCIFRADO */}

        {mensajeDescifrado && (

          <div className="result-section decrypted-result">

            <div className="result-header">

              <div>

                <span>
                  MENSAJE RECUPERADO
                </span>

                <strong>
                  Texto original
                </strong>

              </div>

              <button
                className="copy-button"
                onClick={() =>
                  copiar(mensajeDescifrado)
                }
              >
                Copiar
              </button>

            </div>

            <div className="result-box">
              {mensajeDescifrado}
            </div>

          </div>

        )}

      </div>

    </div>

  )
}

export default Simetrico