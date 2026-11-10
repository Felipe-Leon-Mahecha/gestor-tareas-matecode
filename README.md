# Gestor de Tareas - MateCode

## Descripción del proyecto

Aplicación web de una sola página (SPA) para el cliente ficticio **MateCode**. Permite a los empleados gestionar sus tareas de forma organizada, persistente y accesible desde cualquier dispositivo: cada persona inicia sesión, crea sus tareas, las actualiza o elimina, y puede recibir un resumen por correo.

El frontend está hecho con React + TypeScript y se apoya en Firebase para autenticación y base de datos. El envío de correos corre en una función serverless de Vercel que usa Resend. Todo se despliega en Vercel.

## Funcionalidades

- Registro e inicio de sesión con email y contraseña.
- Inicio de sesión con Google.
- Rutas protegidas: sin sesión no se puede entrar a `/tasks`, y con sesión no tiene sentido volver a `/login` o `/register`.
- CRUD de tareas por usuario: crear, listar, editar, marcar como hecha o pendiente y borrar.
- Actualización en tiempo real: la lista se refresca sola gracias a `onSnapshot` de Firestore.
- Cada usuario ve únicamente sus tareas; el `userId` sale de la sesión, nunca del formulario.
- Envío del resumen de tareas al email de la cuenta.
- Mensajes de error traducidos a lenguaje entendible (credenciales inválidas, sin conexión, permisos, etc.).
- Interfaz responsive, pensada primero para móvil.

## Stack tecnológico

- **React 19 + TypeScript**: interfaz y tipado estricto, sin `any`.
- **Vite**: servidor de desarrollo y build.
- **React Router 7**: navegación y rutas protegidas.
- **Firebase Authentication**: email/contraseña y Google.
- **Cloud Firestore**: persistencia de tareas por usuario.
- **Vercel Functions** (`api/`): endpoint serverless para el envío de correos.
- **Resend**: proveedor de email.
- **Vitest + Testing Library + jsdom**: pruebas automatizadas.
- **oxlint**: linting.
- **Vercel**: despliegue de frontend y funciones; `vercel.json` resuelve el fallback de rutas del SPA.

## URL de producción

https://gestor-tareas-matecode-eight.vercel.app

Las rutas del router (`/tasks`, `/login`, `/register`) funcionan también al recargar o entrar directo, porque `vercel.json` redirige las rutas del cliente a `index.html`.

## Arquitectura y decisiones arquitectónicas

La estructura está separada por capas. Cada carpeta tiene una responsabilidad concreta y evita que la lógica de Firebase se mezcle con la interfaz.

```text
gestor-tareas-matecode/
├── api/
│   ├── _lib/
│   │   ├── email.ts
│   │   └── validation.ts
│   ├── send-summary.ts
│   └── tsconfig.json
├── public/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   └── TextField.tsx
│   ├── features/
│   │   └── auth/
│   │       └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Tasks.tsx
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── services/
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   ├── firebase.ts
│   │   └── tasks.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── forms.ts
│   │   └── task.ts
│   ├── utils/
│   │   ├── authErrors.ts
│   │   ├── summary.ts
│   │   ├── taskErrors.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tests/
│   ├── setup.ts
│   ├── App.test.tsx
│   ├── authErrors.test.ts
│   ├── login.test.tsx
│   ├── routeGuards.test.tsx
│   ├── summary.test.ts
│   ├── taskForm.test.tsx
│   ├── taskItem.test.tsx
│   ├── taskList.test.tsx
│   ├── tasksSummary.test.tsx
│   ├── useTasks.test.tsx
│   └── validators.test.ts
├── firestore.rules
├── vercel.json
├── vite.config.ts
└── package.json
```

**Responsabilidad de cada capa**

- `components/`: componentes de presentación. Reciben datos y callbacks por props, y solo guardan estado propio de la UI (campos del formulario, modo edición). No conocen Firebase.
- `pages/`: conectan la UI con los hooks y servicios. Manejan los estados de carga, éxito y error de cada pantalla.
- `hooks/`: `useAuth` lee la sesión desde el contexto y `useTasks` se suscribe a Firestore, expone las acciones del CRUD y traduce los errores a mensajes para el usuario.
- `features/auth/AuthContext.tsx`: un único `AuthProvider` escucha los cambios de sesión con `onAuthStateChanged` y comparte el usuario con toda la app.
- `routes/`: `AppRoutes` define las rutas; `ProtectedRoute` y `PublicRoute` deciden si se muestra la pantalla o se redirige.
- `services/`: única capa que habla con Firebase. `firebase.ts` inicializa la app, `auth.ts` encapsula el login/registro/logout y `tasks.ts` el CRUD de Firestore. `email.ts` obtiene el token y llama al endpoint.
- `types/`: contratos compartidos (`Task`, `NewTaskInput`, `AuthUser`, formularios). Evitan duplicar formas de datos entre capas.
- `utils/`: funciones puras y fáciles de testear: validadores de formularios, construcción del resumen y traducción de errores.
- `api/`: funciones serverless. Se mantienen autocontenidas y con imports `.js` porque Vercel las ejecuta como ESM; `api/tsconfig.json` define `nodenext` y los tipos de Node para que el typecheck del deploy sea correcto.

**Decisiones que vale la pena resaltar**

- **UI y lógica separadas**: los componentes no importan servicios; las páginas orquestan y los hooks concentran el estado. Así los componentes se prueban con props y los hooks se prueban mockeando servicios.
- **`loading` en `AuthContext`**: la sesión de Firebase se resuelve de forma asíncrona. Sin ese estado inicial en `true`, la primera renderización creería que no hay usuario y mandaría a `/login` aunque la sesión exista. Además evita el parpadeo entre pantallas.
- **`ProtectedRoute` / `PublicRoute`**: las reglas de acceso viven en un solo lugar. Protegido redirige a `/login`; público redirige a `/tasks` si ya hay sesión.
- **Tipos compartidos**: un cambio en `Task` obliga a revisar formulario, lista y servicio, en lugar de descubrir diferencias en tiempo de ejecución.
- **Validadores**: los formularios usan `src/utils/validators.ts`. El endpoint no importa ese archivo: `api/_lib/validation.ts` replica el contrato del resumen y valida el cuerpo de la petición. Esto es intencional, porque importar código de `src/` desde `api/` rompía el runtime ESM de Vercel.
- **Email aislado**: todo lo específico del proveedor vive en `api/_lib/email.ts`. Cambiar de Resend a otro proveedor solo requiere reescribir esa función.

## Seguridad

- **Variables de entorno**: `.env` está en `.gitignore` y no se sube al repositorio. `.env.example` documenta las variables necesarias; las credenciales de servidor van vacías en ese archivo.
- **Credenciales fuera del frontend**: solo las variables `VITE_FIREBASE_*` llegan al navegador, porque Vite expone las que llevan ese prefijo. `RESEND_API_KEY`, `EMAIL_FROM` y `FIREBASE_WEB_API_KEY` son de servidor y nunca se incluyen en el bundle.
- **Reglas de Firestore** (`firestore.rules`):
  - `read`: exige sesión y que `userId` del documento sea el `uid` del usuario autenticado.
  - `create`: exige sesión, que el `userId` nuevo sea el del usuario y que el documento tenga la estructura esperada (`title` string no vacío, `description` string, `done` bool, `createdAt` number).
  - `update`: exige sesión, que la tarea ya sea del usuario y que el `userId` no cambie.
  - `delete`: exige sesión y que la tarea pertenezca al usuario.
- **`userId` desde la sesión**: al crear una tarea, el servicio toma `auth.currentUser.uid`, no un valor del formulario. El destinatario del correo también sale del token verificado, nunca del cuerpo de la petición.
- **Prueba con dos usuarios**: se verificó manualmente con dos cuentas distintas que cada una ve solo sus propias tareas y que las reglas rechazan el acceso a documentos de otro usuario.

## Instalación y ejecución local

Requisitos: Node.js y npm.

```bash
git clone https://github.com/Felipe-Leon-Mahecha/gestor-tareas-matecode.git
cd gestor-tareas-matecode
npm install
```

Crear el archivo de variables a partir del ejemplo:

```bash
cp .env.example .env
```

En PowerShell el equivalente es:

```powershell
Copy-Item .env.example .env
```

Completar en `.env` los valores de Firebase y, si se va a probar el envío de correo, los de Resend. No subir ese archivo.

Levantar el frontend:

```bash
npm run dev
```

Abrir la URL que muestra Vite (por defecto `http://localhost:5173`). Con `npm run dev` las rutas `/api/*` no existen, porque Vite solo sirve el frontend.

Para probar también la función serverless:

```bash
npm i -g vercel
vercel dev
```

`vercel dev` levanta frontend y funciones en el mismo puerto leyendo `.env`. En Windows puede fallar al crear enlaces simbólicos en la caché de Vercel (`EPERM: operation not permitted, symlink`); en ese caso hay que abrir la terminal con permisos de administrador, o probar el endpoint directamente en el despliegue de Vercel.

En la consola de Firebase hay que tener habilitados los proveedores de Authentication (email/contraseña y Google) y creada la base de Firestore con las reglas de `firestore.rules` publicadas.

## Variables de entorno

Ninguna de estas variables se muestra con valores en este documento.

| Variable | Ámbito | Para qué sirve |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Cliente | API key de la app web de Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Cliente | Dominio de Authentication. |
| `VITE_FIREBASE_PROJECT_ID` | Cliente | ID del proyecto de Firebase. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cliente | Bucket de Storage del proyecto. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cliente | Sender ID de Firebase. |
| `VITE_FIREBASE_APP_ID` | Cliente | ID de la app web. |
| `FIREBASE_WEB_API_KEY` | Servidor | Verificar el ID token del usuario contra `identitytoolkit`. Debe ser la misma API key web de Firebase. |
| `RESEND_API_KEY` | Servidor | Autenticar las llamadas a la API de Resend. |
| `EMAIL_FROM` | Servidor | Remitente del correo. Si no se define, el código usa `onboarding@resend.dev`. |
| `AWS_ACCESS_KEY_ID` | Servidor | Reservada para una posible migración a AWS SES; el código actual no la usa. |
| `AWS_SECRET_ACCESS_KEY` | Servidor | Reservada para una posible migración a AWS SES; el código actual no la usa. |
| `AWS_REGION` | Servidor | Reservada para una posible migración a AWS SES; el código actual no la usa. |
| `SES_FROM_EMAIL` | Servidor | Reservada para una posible migración a AWS SES; el código actual no la usa. |

Las variables de servidor se cargan en Vercel en el entorno **Production**. Si se agregan o editan después de un despliegue, hay que hacer **Redeploy** para que el nuevo deployment las tome.

## Scripts disponibles

Los scripts reales de `package.json` son:

| Script | Qué hace |
|---|---|
| `npm run dev` | Levanta el frontend con Vite. |
| `npm run build` | Ejecuta `tsc -b` y luego `vite build`. |
| `npm run lint` | Analiza el código con oxlint. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm test` | Ejecuta los tests una vez con Vitest. |

**Tests**

Hay 54 pruebas automatizadas. Corren con Vitest sobre jsdom y Testing Library.

- `tests/setup.ts` mockea `src/services/firebase` y `src/services/auth` para que ningún test inicialice Firebase ni haga llamadas reales.
- Cada prueba mockea lo que necesita: `useAuth`, `useTasks`, `src/services/tasks` o `src/services/email` según el caso. El envío de correo se reemplaza por un mock, así que tampoco se llama a Resend.
- Se cubren validadores y mensajes de error, guardas de rutas y redirecciones, formulario de login, componentes de tareas (`TaskForm`, `TaskItem`, `TaskList`), el hook `useTasks` (suscripción, acciones y limpieza), `buildSummary`, la validación del payload y los estados del botón de resumen.

## Flujo de envío de emails

1. El usuario pulsa **"Enviarme resumen por email"** en `/tasks`.
2. La página construye el resumen con `buildSummary(tasks)` (`total`, `completed`, `pending`, `titles`).
3. `src/services/email.ts` obtiene el ID token de Firebase con `user.getIdToken()`.
4. Hace `POST /api/send-summary` con `Authorization: Bearer <token>` y el resumen en JSON.
5. `api/send-summary.ts` rechaza cualquier método distinto de POST con `405`.
6. Extrae el token del header; si falta, responde `401`.
7. Verifica el token contra `identitytoolkit` usando `FIREBASE_WEB_API_KEY`. Si no es válido, registra el detalle solo en el servidor y responde `401` al cliente.
8. Valida el payload (`api/_lib/validation.ts`): enteros no negativos con límite, hasta 200 títulos y 200 caracteres por título. Si algo falla, responde `400`.
9. Usa como destinatario el email que viene del token verificado, nunca uno enviado por el navegador.
10. Construye el HTML escapando los títulos de las tareas y llama a `sendEmail` (`api/_lib/email.ts`).
11. `sendEmail` hace la petición a Resend con `RESEND_API_KEY` y `EMAIL_FROM`.
12. Responde `200` si se envió. Si el proveedor falla, responde `502` con un `reason` corto y seguro para diagnosticar (`provider_401`, `provider_403`, etc.) sin exponer detalles internos.

Las credenciales nunca llegan al navegador porque viven únicamente en el entorno del servidor: no llevan prefijo `VITE_`, no están en el bundle y la función las lee con `process.env`. El cliente solo maneja su ID token de Firebase, que es temporal y sirve para identificarlo.

## Decisión sobre el proveedor de email

El plan inicial era usar **AWS SES**, pero no fue posible verificar la tarjeta para crear la cuenta de AWS, así que se optó por **Resend**.

El envío está aislado en `api/_lib/email.ts`: esa función recibe `to`, `subject` y `html`, arma la petición al proveedor y lanza un error si la respuesta no es correcta. Migrar a SES solo requiere cambiar ese archivo; el endpoint, la validación y el cliente no se tocan.

## Limitaciones conocidas

- Con el remitente de pruebas de Resend (`onboarding@resend.dev`) solo se puede enviar al correo con el que se creó la cuenta de Resend. Con un dominio verificado en Resend se podría enviar a cualquier usuario.

## Uso de IA en el proceso de trabajo

(sección en redacción)
