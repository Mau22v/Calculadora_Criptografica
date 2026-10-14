const API_BASE = 'http://localhost/criptografia/api'

export async function calcularHash(mensaje, algoritmo) {

  const response = await fetch(`${API_BASE}/hash.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'calcular',
      mensaje: mensaje,
      algoritmo: algoritmo
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No fue posible calcular el hash.')
  }

  return data
}


// =========================
// CRIPTOGRAFÍA SIMÉTRICA
// =========================

export async function generarClaveSimetrica() {
  const response = await fetch(`${API_BASE}/simetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'generar_clave'
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No fue posible generar la clave.')
  }

  return data
}

export async function cifrarSimetrico(mensaje, clave) {
  const response = await fetch(`${API_BASE}/simetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'cifrar',
      mensaje: mensaje,
      clave: clave
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No fue posible cifrar el mensaje.')
  }

  return data
}

export async function descifrarSimetrico(
  mensaje,
  clave,
  iv,
  tag
) {
  const response = await fetch(`${API_BASE}/simetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'descifrar',
      mensaje: mensaje,
      clave: clave,
      iv: iv,
      tag: tag
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No fue posible descifrar el mensaje.')
  }

  return data
}


// =========================
// HISTORIAL DE OPERACIONES
// =========================

export async function obtenerHistorial() {
  const response = await fetch(`${API_BASE}/operaciones.php`, {
    method: 'GET'
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'No fue posible obtener el historial.'
    )
  }

  return data
}


// =========================
// CIFRADO ASIMÉTRICO RSA
// =========================

export async function generarClavesAsimetricas() {
  const response = await fetch(`${API_BASE}/asimetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'generar_claves'
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'No fue posible generar las claves RSA.'
    )
  }

  return data
}


export async function cifrarAsimetrico(
  mensaje,
  clavePublica
) {
  const response = await fetch(`${API_BASE}/asimetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'cifrar',
      mensaje: mensaje,
      clave_publica: clavePublica
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'No fue posible cifrar el mensaje.'
    )
  }

  return data
}


export async function descifrarAsimetrico(
  mensaje,
  clavePrivada
) {
  const response = await fetch(`${API_BASE}/asimetrico.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      accion: 'descifrar',
      mensaje: mensaje,
      clave_privada: clavePrivada
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'No fue posible descifrar el mensaje.'
    )
  }

  return data
}