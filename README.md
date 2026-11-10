# Gestor de Tareas - MateCode

SPA de gestión de tareas con React + TypeScript, Firebase (Auth + Firestore), Resend vía Vercel Functions y deploy en Vercel.

> Estado actual: autenticación con email/Google, rutas protegidas, CRUD de tareas y envío del resumen por email funcionando en producción.

## Descripción

## Decisiones arquitectónicas

## Instalación

```bash
cd gestor-tareas-matecode
npm install
npm run dev
```

Las rutas `/api/*` (Vercel Functions) **no existen** con `npm run dev` (Vite solo sirve el frontend). Para probar el envío de email en local usa Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

`vercel dev` levanta el frontend y las functions en el mismo puerto, leyendo `.env`.

## Variables de entorno

Copiar `.env.example` a `.env` y completar valores (no commitear `.env`):

- `VITE_FIREBASE_*`: configuración pública de Firebase para el cliente.
- `RESEND_API_KEY`, `EMAIL_FROM`, `FIREBASE_WEB_API_KEY`: solo servidor, usadas por `/api/send-summary`. Sin prefijo `VITE_` para no exponerlas al cliente.

En Vercel las variables deben estar cargadas en el entorno **Production**; después de agregarlas o editarlas hay que hacer **Redeploy** para que el nuevo deployment las tome.

## URL de producción

https://gestor-tareas-matecode-eight.vercel.app

`vercel.json` incluye un rewrite hacia `index.html` para que las rutas del router (`/tasks`, `/login`, etc.) funcionen al recargar o entrar directo.

## Flujo de envío de emails

1. El cliente (`src/services/email.ts`) obtiene el ID token de Firebase y hace `POST /api/send-summary`.
2. La función verifica el token contra `identitytoolkit` con `FIREBASE_WEB_API_KEY` y usa el email del token como destinatario.
3. Valida el payload, escapa el HTML y envía con Resend (`api/_lib/email.ts`).
4. Responde `200` si se envió, `401` si el token no es válido y `502` (con un `reason` seguro para diagnóstico) si el proveedor falla.

## Uso de IA en el proceso
