# Gestor de Tareas - MateCode

SPA de gestión de tareas con React + TypeScript, Firebase (Auth + Firestore), AWS SES vía Vercel Functions y deploy en Vercel.

> Estado actual: solo setup inicial. Sin login, sin CRUD y sin envío de emails todavía.

## Descripción

## Decisiones arquitectónicas

## Instalación

```bash
cd gestor-tareas-matecode
npm install
npm run dev
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar valores (no commitear `.env`):

- `VITE_FIREBASE_*`: configuración pública de Firebase para el cliente.
- `AWS_*`, `SES_FROM_EMAIL`: credenciales solo servidor para Vercel Functions en `/api`.

## URL de producción

## Flujo de envío de emails

## Uso de IA en el proceso
