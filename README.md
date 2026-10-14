
# Calculadora Criptográfica

Aplicación web desarrollada como práctica académica para realizar operaciones criptográficas mediante una API en PHP y una interfaz web construida con React y Vite.

## Funcionalidades

- Cifrado y descifrado simétrico.
- Cifrado y descifrado asimétrico con RSA.
- Generación y verificación de firmas digitales.
- Operaciones hash.
- Registro e historial de operaciones en MySQL.

## Tecnologías utilizadas

- PHP
- Apache
- MySQL
- React
- Vite
- JavaScript
- OpenSSL

## Estructura del proyecto

- `html/criptografia/api/`: archivos PHP de la API.
- `criptografia/config/`: configuración de conexión a la base de datos.
- `criptografia-frontend/`: interfaz web en React y Vite.

## Configuración de la base de datos

1. Crea una base de datos MySQL llamada `criptografia`.
2. Configura las tablas que utiliza la aplicación.
3. Copia `criptografia/config/database.example.php` como `database.php`.
4. Introduce tus credenciales locales de MySQL en `database.php`.
5. No publiques el archivo `database.php` ni sus credenciales.

En el entorno Apache utilizado durante el desarrollo, la configuración privada se coloca fuera del directorio público y la API se sirve desde `/var/www/html/criptografia/api/`. Revisa las rutas de configuración de los archivos PHP si utilizas otra instalación.

## Ejecutar el frontend

Entra en la carpeta del frontend:

```bash
cd criptografia-frontend
npm install
npm run dev
```

Vite mostrará la dirección local donde puedes abrir la aplicación.

## Aviso

Proyecto académico. Antes de desplegarlo en producción, configura adecuadamente los permisos, el acceso a la API, las credenciales y la seguridad del servidor.

<img width="940" height="412" alt="Captura de pantalla 2026-10-13 212042" src="https://github.com/user-attachments/assets/7cb055b0-63ce-4184-9679-8a483c6a8e72" />
<img width="940" height="414" alt="Captura de pantalla 2026-10-13 212058" src="https://github.com/user-attachments/assets/b2c7ded7-3eb0-4f84-bab0-ba1e61ddb372" />
<img width="941" height="411" alt="Captura de pantalla 2026-10-13 212124" src="https://github.com/user-attachments/assets/280cf938-13b5-4f65-b10c-8a54f374d27c" />



