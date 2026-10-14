import { useEffect, useState } from 'react'
import { obtenerHistorial } from '../services/api'

function Historial() {

  const [operaciones, setOperaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // =========================
  // CARGAR HISTORIAL
  // =========================

  const cargarHistorial = async () => {

    setCargando(true)
    setError('')

    try {

      const data = await obtenerHistorial()

      setOperaciones(data.operaciones || [])

    } catch (error) {

      setError(error.message)

    } finally {

      setCargando(false)

    }
  }

  // =========================
  // CARGAR AL ENTRAR
  // =========================

  useEffect(() => {
    cargarHistorial()
  }, [])

  // =========================
  // FORMATEAR FECHA
  // =========================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return '-'
    }

    const fechaLocal = new Date(
      fecha.replace(' ', 'T')
    )

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha
    }

    return fechaLocal.toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  // =========================
  // OBTENER TIPO
  // =========================

const obtenerTipoClase = (tipo) => {

  if (!tipo) {
    return 'type-badge'
  }

  const tipoNormalizado = tipo.toUpperCase()

  if (tipoNormalizado.includes('HASH')) {
    return 'type-badge hash-badge'
  }

  if (tipoNormalizado.includes('FIRMA')) {
    return 'type-badge signature-badge'
  }

  if (tipoNormalizado.includes('SIMETRICO')) {
    return 'type-badge symmetric-badge'
  }

  if (tipoNormalizado.includes('ASIMETRICO')) {
    return 'type-badge asymmetric-badge'
  }

  return 'type-badge'
}

  // =========================
  // TRUNCAR TEXTO
  // =========================

  const truncar = (texto, longitud = 45) => {

    if (!texto) {
      return '-'
    }

    if (texto.length <= longitud) {
      return texto
    }

    return `${texto.substring(0, longitud)}...`
  }

  return (

    <div className="history-page">

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="page-header">
        <div>
          <h1>Historial de Operaciones</h1>
          <p>
            Consulta las operaciones criptográficas
            realizadas por los servicios web.
          </p>
        </div>
      </div>

      {/* =========================
          TABLA
      ========================= */}

      <div className="history-card">

        <div className="history-card-header">

          <div>

            <h2>
              Operaciones registradas
            </h2>

            <p>
              Información almacenada en MySQL.
            </p>

          </div>

          <button
            className="secondary-button refresh-button"
            onClick={cargarHistorial}
            disabled={cargando}
          >
            {cargando ? 'Actualizando...' : '↻ Actualizar'}
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* CARGANDO */}

        {cargando && operaciones.length === 0 && (

          <div className="history-empty">
            <div className="loading-spinner"></div>

            <p>
              Cargando historial...
            </p>
          </div>

        )}


        {/* SIN OPERACIONES */}

        {!cargando &&
          !error &&
          operaciones.length === 0 && (

          <div className="history-empty">

            <div className="empty-icon">
              ☷
            </div>

            <h3>
              No hay operaciones registradas
            </h3>

            <p>
              Las operaciones realizadas aparecerán
              aquí automáticamente.
            </p>

          </div>

        )}


        {/* TABLA */}

        {operaciones.length > 0 && (

          <div className="table-container">

            <table className="history-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    OPERACIÓN
                  </th>

                  <th>
                    ALGORITMO
                  </th>

                  <th>
                    ENTRADA
                  </th>

                  <th>
                    RESULTADO
                  </th>

                  <th>
                    ESTADO
                  </th>

                  <th>
                    FECHA
                  </th>

                </tr>

              </thead>


              <tbody>

                {operaciones.map((operacion) => (

                  <tr key={operacion.id}>

                    <td>
                      <span className="operation-id">
                        #{operacion.id}
                      </span>
                    </td>


                    <td>

                      <span
                        className={obtenerTipoClase(
                          operacion.tipo_operacion
                        )}
                      >
                        {operacion.tipo_operacion}
                      </span>

                    </td>


                    <td>

                      <span className="algorithm-text">
                        {operacion.algoritmo || '-'}
                      </span>

                    </td>


                    <td>

                      <span
                        className="table-text"
                        title={operacion.mensaje_entrada}
                      >
                        {truncar(
                          operacion.mensaje_entrada
                        )}
                      </span>

                    </td>


                    <td>

                      <span
                        className="table-result"
                        title={operacion.resultado}
                      >
                        {truncar(
                          operacion.resultado
                        )}
                      </span>

                    </td>


                    <td>

                      <span className="status-badge">
                        {operacion.estado || 'OK'}
                      </span>

                    </td>


                    <td>

                      <span className="date-text">
                        {formatearFecha(
                          operacion.fecha
                        )}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  )
}

export default Historial