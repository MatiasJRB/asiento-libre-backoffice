# Asiento Libre - Backoffice

Backoffice para la gestión del sistema Asiento Libre.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase
- **Autenticación**: Supabase Auth

## Requisitos Previos

- Node.js 18.x o superior
- npm
- Cuenta de Supabase

## Configuración

1. Instala las dependencias:
```bash
npm install
```

2. Copia el archivo de variables de entorno:
```bash
cp .env.example .env.local
```

3. Configura las variables de entorno en `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key de tu proyecto Supabase

## Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/              # App Router de Next.js
├── components/       # Componentes React
├── lib/
│   ├── supabase/    # Clientes de Supabase
│   └── utils.ts     # Utilidades
└── middleware.ts    # Middleware de Next.js
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Supabase

El proyecto está configurado con Supabase para:
- Autenticación de usuarios
- Base de datos PostgreSQL
- Storage de archivos

Los clientes de Supabase están disponibles en:
- `src/lib/supabase/client.ts` - Cliente para componentes del cliente
- `src/lib/supabase/server.ts` - Cliente para Server Components
- `src/lib/supabase/middleware.ts` - Cliente para middleware

## shadcn/ui

Para agregar nuevos componentes de shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

## Despliegue en Vercel

La forma más fácil de desplegar tu aplicación Next.js es usar la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

