# ReNova

WebApp construida con Next.js, React y Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel
- Firebase
- Gamma API

## Rutas

- `/` - Market
- `/pedidos` - Pedidos e historial
- `/helpy` - Asistente IA
- `/informacion` - Reglas e informacion
- `/configuracion` - Tema, historial, repartidores, recomendaciones y notificaciones

## Variables de entorno

Crear `.env.local` usando `.env.example` como base.

Las variables `NEXT_PUBLIC_FIREBASE_*` se usan en el cliente para Firebase.
`GEMMA_API_KEY` se usa solo en rutas API de Next.js y no debe exponerse en el navegador.
