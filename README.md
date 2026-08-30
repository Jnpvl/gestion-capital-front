# gestion-capital-front

Sitio web de **Gestiona Capital Humano** — consultoría en capital humano, capacitación laboral y cumplimiento normativo en Guaymas, Sonora.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |

## Estructura

- `src/app/` — Rutas y páginas
- `src/presentation/` — Componentes UI
- `src/shared/content/` — Contenido estático (preparado para CMS)
- `src/shared/config/` — SEO, marca y configuración
- `public/images/` — Assets estáticos

## Variables de entorno

Copia `.env.example` a `.env.local` y configura `NEXT_PUBLIC_SITE_URL`.
