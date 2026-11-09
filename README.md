# Gestor de Tareas - MateCode

SPA de gestión de tareas con React + TypeScript, Firebase (Auth + Firestore), AWS SES vía Vercel Functions y deploy en Vercel.

> Estado actual: autenticación con email/Google, rutas protegidas y página de tareas vacía. Sin CRUD de tareas ni envío de emails todavía.

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
- `AWS_*`, `SES_FROM_EMAIL`: credenciales solo servidor para Vercel Functions en `/api`.
- `RESEND_API_KEY`, `EMAIL_FROM`, `FIREBASE_WEB_API_KEY`: solo servidor, usadas por `/api/send-summary`. Sin prefijo `VITE_` para no exponerlas al cliente.

## URL de producción

## Flujo de envío de emails

## Uso de IA en el proceso
