import { useState } from 'react'

const API = 'http://localhost/criptografia/api'

async function solicitar(archivo, datos) {
    const response = await fetch(`${API}/${archivo}.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'La operación criptográfica falló.')
    }

    return data
}

function Comunicacion() {
    const [modo, setModo] = useState('simetrico')
    const [mensajeA, setMensajeA] = useState('Buenos días, Beto')
    const [mensajeB, setMensajeB] = useState('Hola, Alicia. Recibí tu mensaje.')

    // --- Estados AES ---
    const [claveAES, setClaveAES] = useState('')
    const [paqueteA, setPaqueteA] = useState(null)
    const [paqueteB, setPaqueteB] = useState(null)
    const [paqueteParaBeto, setPaqueteParaBeto] = useState(null) // Lo que realmente le llega a Beto

    const [recibidoB, setRecibidoB] = useState('')
    const [recibidoA, setRecibidoA] = useState('')
    const [interceptado, setInterceptado] = useState('')
    const [estadoEva, setEstadoEva] = useState('Eva está a la espera de interceptar un mensaje.')

    // Estados para la intercepción y modificación de Eva
    const [mensajeDescifradoEva, setMensajeDescifradoEva] = useState('')
    const [mensajeModificadoEva, setMensajeModificadoEva] = useState('')

    // --- Estados Generales ---
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [aviso, setAviso] = useState('')

    // --- Estados RSA ---
    const [clavesA, setClavesA] = useState(null)
    const [clavesB, setClavesB] = useState(null)
    const [cifradoRSA, setCifradoRSA] = useState('')
    const [recuperadoRSA, setRecuperadoRSA] = useState('')
    const [respuestaRSA, setRespuestaRSA] = useState('')
    const [recuperadoRespuestaRSA, setRecuperadoRespuestaRSA] = useState('')
    const [estadoEvaRSA, setEstadoEvaRSA] = useState('Eva todavía no ha intentado descifrar.')

    // --- Estados de firma digital ---
    const [firmaDigital, setFirmaDigital] = useState('')
    const [mensajeFirmado, setMensajeFirmado] = useState('')
    const [mensajeParaVerificar, setMensajeParaVerificar] = useState('')
    const [resultadoFirma, setResultadoFirma] = useState(null)
    const [estadoEvaFirma, setEstadoEvaFirma] = useState(
        'Eva está a la espera de interceptar el mensaje firmado.'
    )


    const ejecutar = async (accion) => {
        setCargando(true)
        setError('')
        setAviso('')

        try {
            await accion()
        } catch (e) {
            setError(e.message || 'Ocurrió un error.')
        } finally {
            setCargando(false)
        }
    }

    // ==========================================
    // LÓGICA AES (SIMÉTRICO)
    // ==========================================
    const generarAES = () => ejecutar(async () => {
        const data = await solicitar('simetrico', { accion: 'generar_clave' })

        setClaveAES(data.clave)
        setPaqueteA(null)
        setPaqueteB(null)
        setPaqueteParaBeto(null)
        setRecibidoA('')
        setRecibidoB('')
        setInterceptado('')
        setMensajeDescifradoEva('')
        setMensajeModificadoEva('')
        setEstadoEva('Eva está a la espera de interceptar un mensaje.')
        setAviso('Clave compartida generada. Alicia y Beto la conocen, pero asumiremos que Eva también la consiguió.')
    })

    const cifrarAES = () => ejecutar(async () => {
        if (!claveAES) throw new Error('Primero genera la clave compartida.')
        if (!mensajeA.trim()) throw new Error('Escribe el mensaje de Alicia.')

        const data = await solicitar('simetrico', {
            accion: 'cifrar',
            mensaje: mensajeA,
            clave: claveAES
        })

        const paquete = { resultado: data.resultado, iv: data.iv, tag: data.tag }
        setPaqueteA(paquete)
        setPaqueteParaBeto(paquete) // Inicialmente, el mensaje va directo a Beto

        setInterceptado(data.resultado)
        setRecibidoB('')
        setMensajeDescifradoEva('')
        setMensajeModificadoEva('')
        setEstadoEva('Mensaje interceptado en la red. Eva conoce la clave y puede leerlo.')
        setAviso('Alicia cifró el mensaje y lo envió. Está en tránsito hacia Beto.')
    })

    const descifrarInterceptadoAES = () => ejecutar(async () => {
        if (!paqueteA) throw new Error('No hay mensaje interceptado.')

        const data = await solicitar('simetrico', {
            accion: 'descifrar',
            mensaje: paqueteA.resultado,
            clave: claveAES, // Eva usa la clave comprometida
            iv: paqueteA.iv,
            tag: paqueteA.tag
        })

        setMensajeDescifradoEva(data.resultado)
        setMensajeModificadoEva(data.resultado) // Se pre-carga para que Eva lo edite
        setEstadoEva('Eva descifró el mensaje exitosamente usando la clave comprometida.')
    })

    const alterarYReenviarAES = () => ejecutar(async () => {
        if (!claveAES) throw new Error('Falta la clave compartida.')
        if (!mensajeModificadoEva.trim()) throw new Error('El mensaje modificado no puede estar vacío.')

        const data = await solicitar('simetrico', {
            accion: 'cifrar',
            mensaje: mensajeModificadoEva,
            clave: claveAES
        })

        const paqueteAlterado = { resultado: data.resultado, iv: data.iv, tag: data.tag }

        // ¡Aquí ocurre el ataque MITM! Reemplazamos el paquete que le iba a llegar a Beto
        setPaqueteParaBeto(paqueteAlterado)
        setRecibidoB('') // Limpiamos si Beto ya había descifrado algo

        setEstadoEva('Mensaje modificado, cifrado nuevamente y enviado a Beto.')
        setAviso('¡Alerta! Eva alteró el mensaje en tránsito. Beto recibirá un paquete modificado.')
    })

    const descifrarB = () => ejecutar(async () => {
        if (!paqueteParaBeto) throw new Error('Beto no ha recibido ningún mensaje.')

        const data = await solicitar('simetrico', {
            accion: 'descifrar',
            mensaje: paqueteParaBeto.resultado,
            clave: claveAES,
            iv: paqueteParaBeto.iv,
            tag: paqueteParaBeto.tag
        })

        setRecibidoB(data.resultado)

        // Verificamos si Beto está leyendo el original o el de Eva
        if (paqueteParaBeto.resultado !== paqueteA.resultado) {
            setAviso('Beto descifró el mensaje modificado por Eva. El sistema lo acepta porque la clave y la etiqueta de autenticación (tag) son correctos.')
        } else {
            setAviso('Beto descifró el mensaje original de Alicia sin alteraciones.')
        }
    })

    const cifrarRespuestaAES = () => ejecutar(async () => {
        if (!claveAES) throw new Error('Primero genera la clave compartida.')
        if (!mensajeB.trim()) throw new Error('Escribe la respuesta de Beto.')

        const data = await solicitar('simetrico', {
            accion: 'cifrar',
            mensaje: mensajeB,
            clave: claveAES
        })

        setPaqueteB({ resultado: data.resultado, iv: data.iv, tag: data.tag })
        setRecibidoA('')
        setAviso('Beto cifró su respuesta con la clave compartida.')
    })

    const descifrarA = () => ejecutar(async () => {
        if (!paqueteB) throw new Error('Beto todavía no ha cifrado una respuesta.')

        const data = await solicitar('simetrico', {
            accion: 'descifrar',
            mensaje: paqueteB.resultado,
            clave: claveAES,
            iv: paqueteB.iv,
            tag: paqueteB.tag
        })

        setRecibidoA(data.resultado)
        setAviso('Alicia recuperó correctamente la respuesta de Beto.')
    })

    // ==========================================
    // LÓGICA RSA (ASIMÉTRICO)
    // ==========================================
    const generarRSA = () => ejecutar(async () => {
        const a = await solicitar('asimetrico', { accion: 'generar_claves' })
        const b = await solicitar('asimetrico', { accion: 'generar_claves' })

        setClavesA({ publica: a.clave_publica, privada: a.clave_privada })
        setClavesB({ publica: b.clave_publica, privada: b.clave_privada })

        setCifradoRSA('')
        setRecuperadoRSA('')
        setRespuestaRSA('')
        setRecuperadoRespuestaRSA('')
        setEstadoEvaRSA('Eva todavía no ha intentado descifrar.')
        setAviso('Alicia y Beto ya tienen pares de claves independientes.')
    })

    const cifrarRSA = () => ejecutar(async () => {
        if (!clavesA || !clavesB) throw new Error('Primero genera las claves de Alicia y Beto.')
        if (!mensajeA.trim()) throw new Error('Escribe el mensaje de Alicia.')

        const data = await solicitar('asimetrico', {
            accion: 'cifrar',
            mensaje: mensajeA,
            clave_publica: clavesB.publica
        })

        setCifradoRSA(data.resultado)
        setRecuperadoRSA('')
        setEstadoEvaRSA('Eva interceptó el texto cifrado. No tiene la clave privada de Beto.')
        setAviso('Alicia cifró con la clave pública de Beto.')
    })

    const descifrarRSA = () => ejecutar(async () => {
        if (!cifradoRSA || !clavesB) throw new Error('Primero cifra el mensaje de Alicia.')

        const data = await solicitar('asimetrico', {
            accion: 'descifrar',
            mensaje: cifradoRSA,
            clave_privada: clavesB.privada
        })

        setRecuperadoRSA(data.resultado)
        setAviso('Beto descifró el mensaje con su clave privada.')
    })

    const atacarRSA = () => ejecutar(async () => {
        if (!cifradoRSA || !clavesA) throw new Error('Eva todavía no tiene un mensaje interceptado.')

        try {
            await solicitar('asimetrico', {
                accion: 'descifrar',
                mensaje: cifradoRSA,
                clave_privada: clavesA.privada
            })

            setEstadoEvaRSA('El servicio aceptó la operación. Revisa si el resultado coincide con el mensaje original.')
        } catch {
            setEstadoEvaRSA('Ataque fallido: la clave privada de Alicia no puede descifrar un mensaje cifrado con la clave pública de Beto.')
        }
    })

    const cifrarRespuestaRSA = () => ejecutar(async () => {
        if (!clavesA || !clavesB) throw new Error('Primero genera ambos pares de claves.')
        if (!mensajeB.trim()) throw new Error('Escribe la respuesta de Beto.')

        const data = await solicitar('asimetrico', {
            accion: 'cifrar',
            mensaje: mensajeB,
            clave_publica: clavesA.publica
        })

        setRespuestaRSA(data.resultado)
        setRecuperadoRespuestaRSA('')
        setAviso('Beto cifró la respuesta con la clave pública de Alicia.')
    })

    const descifrarRespuestaRSA = () => ejecutar(async () => {
        if (!respuestaRSA || !clavesA) throw new Error('Beto todavía no ha cifrado su respuesta.')

        const data = await solicitar('asimetrico', {
            accion: 'descifrar',
            mensaje: respuestaRSA,
            clave_privada: clavesA.privada
        })

        setRecuperadoRespuestaRSA(data.resultado)
        setAviso('Alicia recuperó correctamente la respuesta de Beto.')
    })


    // ==========================================
    // LÓGICA DE FIRMA DIGITAL
    // ==========================================

    const firmarMensaje = () => ejecutar(async () => {
        if (!clavesA) {
            throw new Error('Primero genera las claves de Alicia y Beto.')
        }

        if (!mensajeA.trim()) {
            throw new Error('Escribe el mensaje que Alicia desea firmar.')
        }

        const data = await solicitar('asimetrico', {
            accion: 'firmar',
            mensaje: mensajeA,
            clave_privada: clavesA.privada
        })

        setFirmaDigital(data.firma)
        setMensajeFirmado(mensajeA)
        setMensajeParaVerificar(mensajeA)
        setResultadoFirma(null)
        setEstadoEvaFirma(
            'Eva ha interceptado el mensaje y su firma digital.'
        )
        setAviso('Alicia firmó el mensaje con su clave privada.')
    })

    const verificarFirma = () => ejecutar(async () => {
        if (!clavesA) {
            throw new Error('Primero genera las claves de Alicia y Beto.')
        }

        if (!firmaDigital) {
            throw new Error('Alicia todavía no ha firmado el mensaje.')
        }

        if (!mensajeParaVerificar.trim()) {
            throw new Error('El mensaje que se verificará está vacío.')
        }

        const data = await solicitar('asimetrico', {
            accion: 'verificar_firma',
            mensaje: mensajeParaVerificar,
            firma: firmaDigital,
            clave_publica: clavesA.publica
        })

        setResultadoFirma(data.valida)

        setAviso(
            data.valida
                ? 'Firma válida: el mensaje coincide con la firma.'
                : 'Firma inválida: el mensaje fue modificado o la firma no corresponde.'
        )
    })

    const modificarMensajeFirmado = () => {
        if (!firmaDigital) {
            setError('Primero Alicia debe generar una firma digital.')
            return
        }

        setError('')
        setAviso('Eva sustituyó el mensaje original por uno diferente.')
        setMensajeParaVerificar('Este es un mensaje falso enviado por Eva.')
        setResultadoFirma(null)
        setEstadoEvaFirma(
            'Eva sustituyó el mensaje original. Conservó la firma de Alicia, pero no puede generar una firma válida para el mensaje falso sin su clave privada.'
        )
    }
    return (
        <div className="communication-page">
            <header className="communication-heading">
                <span className="section-label">SIMULACIÓN INTERACTIVA</span>
                <h1>Comunicación segura</h1>
                <p>Observa cómo Alicia y Beto intercambian mensajes mientras Eva intenta interceptarlos.</p>
            </header>

            <div className="communication-tabs">
                <button
                    className={modo === 'simetrico' ? 'communication-tab selected' : 'communication-tab'}
                    onClick={() => setModo('simetrico')}
                >
                    🔐 Cifrado simétrico
                </button>

                <button
                    className={modo === 'asimetrico' ? 'communication-tab selected' : 'communication-tab'}
                    onClick={() => setModo('asimetrico')}
                >
                    🔑 Cifrado asimétrico
                </button>

                <button
                    className={modo === 'firma' ? 'communication-tab selected' : 'communication-tab'}
                    onClick={() => setModo('firma')}
                >
                    ✍️ Firma digital
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {aviso && <div className="communication-notice">{aviso}</div>}

            {/* ================= MODO: CIFRADO SIMÉTRICO ================= */}
            {modo === 'simetrico' && (
                <>
                    <div className="simulation-toolbar">
                        <div>
                            <strong>AES-256-GCM</strong>
                            <p>Si Eva roba o adivina la clave compartida, no solo podrá leer los mensajes, sino también modificarlos en tránsito sin que Beto se dé cuenta.</p>
                        </div>

                        <button
                            className="primary-button"
                            disabled={cargando}
                            onClick={generarAES}
                        >
                            {cargando ? 'Procesando...' : 'Generar clave compartida'}
                        </button>
                    </div>

                    <div className="communication-grid">
                        {/* --- ALICIA --- */}
                        <section className="person-panel alice-panel">
                            <div className="person-heading">
                                <span>👩🏻</span>
                                <div>
                                    <h2>Alicia</h2>
                                    <small>Emisor</small>
                                </div>
                            </div>

                            <label>Clave compartida</label>
                            <textarea readOnly rows="3" value={claveAES} placeholder="Genera una clave primero" />

                            <label>Mensaje original para Beto</label>
                            <textarea rows="3" value={mensajeA} onChange={e => setMensajeA(e.target.value)} />

                            <button className="primary-button" disabled={cargando || !claveAES} onClick={cifrarAES}>
                                Cifrar y enviar
                            </button>

                            <label>Mensaje recuperado de Beto</label>
                            <textarea readOnly rows="2" value={recibidoA} placeholder="La respuesta aparecerá aquí" />

                            <button className="secondary-button" disabled={cargando || !paqueteB} onClick={descifrarA}>
                                Descifrar respuesta
                            </button>
                        </section>

                        {/* --- EVA --- */}
                        <section className="person-panel eve-panel">
                            <div className="person-heading">
                                <span>🕵️</span>
                                <div>
                                    <h2>Eva</h2>
                                    <small>Interceptora</small>
                                </div>
                            </div>

                            <label>Mensaje cifrado interceptado de Alicia</label>
                            <textarea readOnly rows="3" value={interceptado} placeholder="Eva verá el texto cifrado aquí" />

                            <p className="panel-hint">
                                Asumimos que Eva <strong>conoce</strong> la clave secreta compartida.
                            </p>

                            <button className="attack-button" disabled={cargando || !paqueteA} onClick={descifrarInterceptadoAES}>
                                Descifrar con la clave comprometida
                            </button>

                            {mensajeDescifradoEva && (
                                <>
                                    <label>Modificar el mensaje interceptado</label>
                                    <textarea rows="3" value={mensajeModificadoEva} onChange={e => setMensajeModificadoEva(e.target.value)} className="hacked-input" />

                                    <button className="attack-button" disabled={cargando || !mensajeModificadoEva.trim()} onClick={alterarYReenviarAES}>
                                        Modificar, cifrar y reenviar a Beto
                                    </button>
                                </>
                            )}

                            <div className="attack-result">{estadoEva}</div>
                        </section>

                        {/* --- BETO --- */}
                        <section className="person-panel bob-panel">
                            <div className="person-heading">
                                <span>👨🏻</span>
                                <div>
                                    <h2>Beto</h2>
                                    <small>Receptor</small>
                                </div>
                            </div>

                            <label>Clave compartida</label>
                            <textarea readOnly rows="3" value={claveAES} placeholder="Genera una clave primero" />

                            <label>Datos recibidos en el canal</label>
                            <textarea readOnly rows="4" value={paqueteParaBeto ? JSON.stringify(paqueteParaBeto) : ''} placeholder="Esperando recibir paquete..." />

                            <button className="primary-button" disabled={cargando || !paqueteParaBeto} onClick={descifrarB}>
                                Descifrar mensaje recibido
                            </button>

                            <label>Mensaje final procesado</label>
                            <textarea
                                readOnly
                                rows="3"
                                value={recibidoB}
                                placeholder="El mensaje aparecerá aquí"
                                style={recibidoB && paqueteParaBeto.resultado !== paqueteA?.resultado ? { borderColor: 'red', backgroundColor: '#ffe6e6' } : {}}
                            />

                            <hr />

                            <label>Respuesta para Alicia</label>
                            <textarea rows="3" value={mensajeB} onChange={e => setMensajeB(e.target.value)} />

                            <button className="secondary-button" disabled={cargando || !claveAES} onClick={cifrarRespuestaAES}>
                                Cifrar y responder
                            </button>
                        </section>
                    </div>
                </>
            )}

            {/* ================= MODO: CIFRADO ASIMÉTRICO ================= */}
            {modo === 'asimetrico' && (
                <>
                    <div className="simulation-toolbar">
                        <div>
                            <strong>RSA-2048</strong>
                            <p>
                                Se cifra con la clave pública del destinatario y se descifra con su clave privada. Eva no puede descifrar el mensaje si no tiene la clave privada.
                            </p>
                        </div>

                        <button className="primary-button" disabled={cargando} onClick={generarRSA}>
                            {cargando ? 'Procesando...' : 'Generar claves de Alicia y Beto'}
                        </button>
                    </div>

                    <div className="communication-grid">
                        {/* --- ALICIA --- */}
                        <section className="person-panel alice-panel">
                            <div className="person-heading">
                                <span>👩🏻</span>
                                <div>
                                    <h2>Alicia</h2>
                                    <small>Emisora</small>
                                </div>
                            </div>

                            <label>Clave pública de Alicia</label>
                            <textarea readOnly rows="2" value={clavesA?.publica || ''} placeholder="Genera las claves primero" />

                            <label>Clave privada de Alicia</label>
                            <textarea readOnly rows="2" value={clavesA?.privada || ''} placeholder="Clave privada generada" />

                            <label>Mensaje para Beto</label>
                            <textarea rows="3" value={mensajeA} onChange={e => setMensajeA(e.target.value)} />

                            <button className="primary-button" disabled={cargando || !clavesB} onClick={cifrarRSA}>
                                Cifrar con la clave pública de Beto
                            </button>

                            <label>Respuesta cifrada de Beto</label>
                            <textarea readOnly rows="3" value={respuestaRSA} placeholder="La respuesta cifrada aparecerá aquí" />

                            <button className="secondary-button" disabled={cargando || !respuestaRSA} onClick={descifrarRespuestaRSA}>
                                Descifrar respuesta
                            </button>

                            <label>Respuesta recuperada</label>
                            <textarea readOnly rows="2" value={recuperadoRespuestaRSA} placeholder="Mensaje original de Beto" />
                        </section>

                        {/* --- EVA --- */}
                        <section className="person-panel eve-panel">
                            <div className="person-heading">
                                <span>🕵️</span>
                                <div>
                                    <h2>Eva</h2>
                                    <small>Interceptora</small>
                                </div>
                            </div>

                            <label>Mensaje original interceptado</label>
                            <textarea readOnly rows="4" value={cifradoRSA} placeholder="El texto cifrado de Alicia aparecerá aquí" />

                            <p className="panel-hint">
                                Eva intenta descifrar el mensaje original usando la clave privada de Alicia. Como el mensaje fue cifrado con la clave pública de Beto, el intento fallará.
                            </p>

                            <button className="attack-button" disabled={cargando || !cifradoRSA} onClick={atacarRSA}>
                                Intentar descifrar
                            </button>

                            <div className="attack-result">{estadoEvaRSA}</div>
                        </section>

                        {/* --- BETO --- */}
                        <section className="person-panel bob-panel">
                            <div className="person-heading">
                                <span>👨🏻</span>
                                <div>
                                    <h2>Beto</h2>
                                    <small>Receptor</small>
                                </div>
                            </div>

                            <label>Clave pública de Beto</label>
                            <textarea readOnly rows="2" value={clavesB?.publica || ''} placeholder="Genera las claves primero" />

                            <label>Clave privada de Beto</label>
                            <textarea readOnly rows="2" value={clavesB?.privada || ''} placeholder="Clave privada generada" />

                            <label>Mensaje cifrado de Alicia</label>
                            <textarea readOnly rows="3" value={cifradoRSA} placeholder="El mensaje de Alicia aparecerá aquí" />

                            <button className="primary-button" disabled={cargando || !cifradoRSA} onClick={descifrarRSA}>
                                Descifrar con mi clave privada
                            </button>

                            <label>Mensaje original recuperado</label>
                            <textarea readOnly rows="2" value={recuperadoRSA} placeholder="El mensaje original aparecerá aquí" />

                            <hr />

                            <label>Respuesta para Alicia</label>
                            <textarea rows="3" value={mensajeB} onChange={e => setMensajeB(e.target.value)} />

                            <button className="secondary-button" disabled={cargando || !clavesA} onClick={cifrarRespuestaRSA}>
                                Cifrar respuesta para Alicia
                            </button>
                        </section>
                    </div>
                </>
            )}

            {/* ================= MODO: FIRMA DIGITAL ================= */}
            {modo === 'firma' && (
                <>
                    <div className="simulation-toolbar">
                        <div>
                            <strong>Firma digital RSA-SHA256</strong>
                            <p>
                                Alicia firma con su clave privada. Beto verifica la autenticidad e integridad usando la clave pública de Alicia. Eva puede modificar el mensaje, pero la verificación debe detectar el cambio.
                            </p>
                        </div>

                        <button className="primary-button" disabled={cargando} onClick={generarRSA}>
                            Generar claves de Alicia y Beto
                        </button>
                    </div>

                    <div className="communication-grid">
                        {/* --- ALICIA --- */}
                        <section className="person-panel alice-panel">
                            <div className="person-heading">
                                <span>👩🏻</span>
                                <div>
                                    <h2>Alicia</h2>
                                    <small>Emisora y firmante</small>
                                </div>
                            </div>

                            <label>Clave privada de Alicia</label>
                            <textarea readOnly rows="3" value={clavesA?.privada || ''} placeholder="Genera las claves primero" />

                            <label>Mensaje que desea firmar</label>
                            <textarea rows="3" value={mensajeA} onChange={e => setMensajeA(e.target.value)} />

                            <button className="primary-button" disabled={cargando || !clavesA} onClick={firmarMensaje}>
                                Firmar mensaje
                            </button>

                            <label>Firma digital generada</label>
                            <textarea readOnly rows="4" value={firmaDigital} placeholder="La firma aparecerá aquí" />
                        </section>

                        {/* --- EVA --- */}
                        <section className="person-panel eve-panel">
                            <div className="person-heading">
                                <span>🕵️</span>
                                <div>
                                    <h2>Eva</h2>
                                    <small>Interceptora</small>
                                </div>
                            </div>

                            <label>Mensaje interceptado</label>
                            <textarea readOnly rows="3" value={mensajeFirmado} placeholder="Esperando el mensaje de Alicia" />

                            <label>Firma interceptada</label>
                            <textarea readOnly rows="4" value={firmaDigital} placeholder="Esperando la firma" />

                            <p className="panel-hint">
                                Eva puede cambiar el mensaje, pero no puede producir una firma válida de Alicia sin su clave privada.
                            </p>

                            <button className="attack-button" disabled={cargando || !firmaDigital} onClick={modificarMensajeFirmado}>
                                Alterar mensaje
                            </button>

                            <div className="attack-result">{estadoEvaFirma}</div>
                        </section>

                        {/* --- BETO --- */}
                        <section className="person-panel bob-panel">
                            <div className="person-heading">
                                <span>👨🏻</span>
                                <div>
                                    <h2>Beto</h2>
                                    <small>Receptor y verificador</small>
                                </div>
                            </div>

                            <label>Clave pública de Alicia</label>
                            <textarea readOnly rows="3" value={clavesA?.publica || ''} placeholder="Genera las claves primero" />

                            <label>Mensaje recibido para verificar</label>
                            <textarea
                                rows="3"
                                value={mensajeParaVerificar}
                                onChange={e => {
                                    setMensajeParaVerificar(e.target.value)
                                    setResultadoFirma(null)
                                }}
                                placeholder="El mensaje que Beto verificará"
                            />

                            <label>Firma recibida</label>
                            <textarea readOnly rows="4" value={firmaDigital} placeholder="La firma de Alicia aparecerá aquí" />

                            <button className="primary-button" disabled={cargando || !firmaDigital || !clavesA} onClick={verificarFirma}>
                                Verificar firma
                            </button>

                            {resultadoFirma !== null && (
                                <div className="attack-result">
                                    {resultadoFirma
                                        ? '✅ Firma válida: el mensaje coincide con la firma.'
                                        : '❌ Firma inválida: el mensaje no coincide con la firma.'}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}

            <footer className="simulation-footer">
                <strong>Nota de seguridad:</strong> esta es una simulación académica. Las claves privadas se muestran para facilitar la demostración; no deben exponerse de esta manera en una aplicación real.
            </footer>
        </div>
    )
}

export default Comunicacion