# Alma Estética — Frontend

Aplicación web para la reserva y administración de turnos de un centro de estética. Incluye una experiencia para clientes y un panel de gestión, con interfaz adaptable a distintos tamaños de pantalla.

## Funcionalidades

- Inicio de sesión y formulario de registro de clientes.
- Reserva de turnos: selección de servicio, profesional, fecha y horario.
- Resumen de la reserva con precio y confirmación visual.
- Panel de administración con indicadores, agenda de ejemplo, equipo y accesos de gestión.
- Navegación entre las vistas de cliente y administración.

> **Estado:** es una demostración de frontend. Los datos son estáticos y las interacciones se mantienen en el navegador; no hay API, persistencia, autenticación real ni procesamiento de pagos.

## Tecnologías

- React 19 y TypeScript
- Vite 8
- Tailwind CSS 4
- CSS propio para los estilos de la interfaz

## Requisitos

- Node.js 22 o superior
- pnpm 10 o superior

## Instalación y ejecución

Instalá las dependencias y levantá el servidor de desarrollo:

```sh
pnpm install
pnpm dev
```

Vite muestra en la terminal la dirección local para abrir la aplicación.

## Ejecución con Docker Compose

Desde la raíz del repositorio, ejecutá:

```sh
docker compose up --build
```

El correo es opcional: para habilitar el envío, definí `EMAIL_USER` y
`EMAIL_APP_PASSWORD` en `Backend/.env`. Compose carga ese archivo si existe.
Ollama usa `qwen2.5` por defecto; podés cambiarlo definiendo `OLLAMA_MODEL`
también en `Backend/.env`.

La aplicación queda disponible en `http://localhost:5173` y consume la API del
backend en `http://localhost:4000/api`.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo con recarga en caliente. |
| `pnpm build` | Genera la versión de producción en `dist/`. |
| `pnpm preview` | Sirve localmente la compilación de producción. |
| `pnpm format` | Formatea el proyecto con oxfmt. |

## Estructura principal

```text
src/
├── App.tsx       # Vistas de acceso, reserva de turnos y administración
├── index.css     # Estilos globales y diseño adaptable
└── main.tsx      # Punto de entrada de React
index.html        # Documento HTML principal
vite.config.ts    # Configuración de Vite, React y Tailwind CSS
```