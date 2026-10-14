import { useState } from 'react'

import {
  generarClavesAsimetricas,
  cifrarAsimetrico,
  descifrarAsimetrico
} from '../services/api'

function Asimetrico() {

  // =========================
  // CLAVES RSA
  // =========================

  const [clavePublica, setClavePublica] = useState('')
  const [clavePrivada, setClavePrivada] = useState('')

  // =========================
  // CIFRADO
  // =========================

  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState('')

  // =========================
  // DESCIFRADO
  // =========================

  const [clavePrivadaDescifrado, setClavePrivadaDescifrado] = useState('')
  const [mensajeDescifrado, setMensajeDescifrado] = useState('')

  // =========================
  // ESTADOS
  // =========================

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // GENERAR CLAVES
  // =========================

  const generarClaves = async () => {

    setCargando(true)
    setError('')

    try {

      const data = await generarClavesAsimetricas()

      setClavePublica(data.clave_publica)
      setClavePrivada(data.clave_privada)

      // Limpiar operaciones anteriores

      setMensaje('')
      setResultado('')
      setClavePrivadaDescifrado('')
      setMensajeDescifrado('')

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  // =========================
  // CIFRAR
  // =========================

  const cifrar = async () => {

    if (!clavePublica) {
      setError('Primero genera el par de claves RSA.')
      return
    }

    if (!mensaje.trim()) {
      setError('Escribe un mensaje antes de cifrar.')
      return
    }

    setCargando(true)
    setError('')

    try {

      const data = await cifrarAsimetrico(
        mensaje,
        clavePublica
      )

      setResultado(data.resultado)

      setMensajeDescifrado('')

      setClavePrivadaDescifrado('')

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  // =========================
  // DESCIFRAR
  // =========================

  const descifrar = async () => {

    if (!resultado) {
      setError('Primero debes cifrar un mensaje.')
      return
    }

    if (!clavePrivadaDescifrado.trim()) {
      setError('Introduce la clave privada para descifrar.')
      return
    }

    setCargando(true)
    setError('')
    setMensajeDescifrado('')

    try {

      const data = await descifrarAsimetrico(
        resultado,
        clavePrivadaDescifrado
      )

      setMensajeDescifrado(data.resultado)

    } catch (error) {

      setError(
        'No fue posible descifrar el mensaje. Verifica que la clave privada sea correcta.'
      )

    } finally {

      setCargando(false)

    }
  }

  // =========================
  // LIMPIAR
  // =========================

  const limpiar = () => {

    setClavePublica('')
    setClavePrivada('')

    setMensaje('')
    setResultado('')

    setClavePrivadaDescifrado('')
    setMensajeDescifrado('')

    setError('')
  }

  // =========================
  // COPIAR
  // =========================

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
            CRIPTOGRAFÍA ASIMÉTRICA
          </span>

          <h1>RSA-2048</h1>

          <p>
            Genera un par de claves y cifra mensajes
            utilizando criptografía asimétrica.
          </p>

        </div>

      </div>


      {/* =========================
          GENERACIÓN DE CLAVES
      ========================= */}

      <div className="crypto-form-card">

        <div className="crypto-section-title">
          <div>

            <h2>Par de claves RSA</h2>

            <p>
              El servidor genera automáticamente una
              clave pública y una clave privada de 2048 bits.
            </p>

          </div>

        </div>


        <div className="button-row">

          <button
            className="primary-button"
            onClick={generarClaves}
            disabled={cargando}
          >
            {cargando
              ? 'Generando...'
              : 'Generar par de claves'}
          </button>

        </div>


        {/* =========================
            CLAVE PÚBLICA
        ========================= */}

        {clavePublica && (

          <div className="key-section">

            <div className="key-header">

              <div>

                <span>
                  CLAVE PÚBLICA
                </span>

                <strong>
                  Utilizada para cifrar
                </strong>

              </div>

              <button
                className="copy-button"
                onClick={() => copiar(clavePublica)}
              >
                Copiar
              </button>

            </div>

            <textarea
              className="key-box"
              value={clavePublica}
              readOnly
              rows="8"
            />

          </div>

        )}


        {/* =========================
            CLAVE PRIVADA
        ========================= */}

        {clavePrivada && (

          <div className="key-section">

            <div className="key-header">

              <div>

                <span>
                  CLAVE PRIVADA
                </span>

                <strong>
                  Utilizada para descifrar
                </strong>

              </div>

              <button
                className="copy-button"
                onClick={() => copiar(clavePrivada)}
              >
                Copiar
              </button>

            </div>

            <textarea
              className="key-box private-key-box"
              value={clavePrivada}
              readOnly
              rows="9"
            />

            <small className="form-help">
              Esta clave debe mantenerse privada y solo debe
              utilizarse para descifrar los mensajes.
            </small>

          </div>

        )}

      </div>


      {/* =========================
          CIFRAR
      ========================= */}

      <div className="crypto-form-card">

        <div className="crypto-section-title">


          <div>

            <h2>Cifrar mensaje</h2>

            <p>
              El mensaje será cifrado utilizando la
              clave pública.
            </p>

          </div>

        </div>


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


        <div className="button-row">

          <button
            className="primary-button"
            onClick={cifrar}
            disabled={cargando || !clavePublica}
          >
            {cargando
              ? 'Cifrando...'
              : 'Cifrar mensaje'}
          </button>

        </div>


        {resultado && (

          <div className="result-section">

            <div className="result-header">

              <div>

                <span>
                  RESULTADO DEL CIFRADO
                </span>

                <strong>
                  RSA-2048 · OAEP
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


      {/* =========================
          DESCIFRAR
      ========================= */}

      <div className="crypto-form-card decrypt-card">

        <div className="crypto-section-title">
          <div>

            <h2>Descifrar mensaje</h2>

            <p>
              Introduce la clave privada correspondiente
              al par de claves utilizado.
            </p>

          </div>

        </div>


        <div className="form-group">

          <label>
            Clave privada
          </label>

          <textarea
            value={clavePrivadaDescifrado}
            onChange={(e) =>
              setClavePrivadaDescifrado(e.target.value)
            }
            placeholder="Pega aquí la clave privada..."
            rows="9"
          />

          <small className="form-help">
            Debe corresponder a la clave pública utilizada
            para cifrar el mensaje.
          </small>

        </div>


        {resultado && (

          <div className="encryption-info">

            <div>

              <span>
                MENSAJE CIFRADO
              </span>

              <strong>
                Disponible
              </strong>

            </div>

            <div>

              <span>
                ALGORITMO
              </span>

              <strong>
                RSA-2048
              </strong>

            </div>

          </div>

        )}


        <div className="button-row">

          <button
            className="primary-button"
            onClick={descifrar}
            disabled={cargando || !resultado}
          >
            {cargando
              ? 'Descifrando...'
              : 'Descifrar mensaje'}
          </button>

          <button
            className="secondary-button"
            onClick={limpiar}
          >
            Limpiar todo
          </button>

        </div>


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

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}

      </div>

    </div>

  )
}

export default Asimetrico