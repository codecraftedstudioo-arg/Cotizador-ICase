# Plantilla Cotizador

Wizard de cotización de iPhone reutilizable: el visitante arma su cotización paso a paso y el negocio recibe el lead (WhatsApp y, si se activa, un webhook de CRM).

La identidad del cliente se configura en **`src/config/tenant.ts`**. Los precios viven en JSON aparte y **no** se mezclan con la marca.

## Stack
- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 4**
- **React Router 7**
- **Vitest** + **ESLint**

## Instalación y desarrollo
Requisitos: **Node.js 20+** y **npm**.

```bash
npm ci                 # o npm install
cp .env.example .env   # opcional; el JSON local alcanza para demo
npm run dev            # http://localhost:5173
```

## Scripts
| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run test` | Tests unitarios |
| `npm run lint` | Linter (ESLint) |

## Configurar un cliente (`tenant.ts`)
Editá `src/config/tenant.ts`:

- **brand** — nombre, logo, favicon, hero, sitio, catálogo
- **contact** — WhatsApp, dirección, maps
- **social** — Instagram, YouTube, etc.
- **locale** — idioma, país (`AR` por defecto), prefijo telefónico (`549`)
- **currency** — código (`USD`) y etiqueta de tipo de cambio (`Dólar blue`)
- **stats** — cifras del landing (valores DEMO actuales)
- **seo** — title, description, `siteUrl` (vacío = sin dominio; no rompe el build)
- **features** — WhatsApp, CRM, analytics, comparador, plan canje
- **analytics / crm** — desactivados por defecto; no envían datos si están en `false`
- **pricingSource** — por defecto `static` (JSON local). Si configurás `VITE_PANEL_API_URL`, el Admin tiene prioridad absoluta.

Reemplazá los archivos en `public/brand/` (`logo.svg`, `favicon.svg`, `hero.svg`). Las fotos de producto están en `public/iphones/` y se pueden cambiar más adelante **sin editar componentes**, siempre que se respeten los nombres de archivo.

## Precios (datos, no código)
La lógica de cálculo está en `src/lib/pricing-engine.ts`.

**Con Admin (`VITE_PANEL_API_URL`):**
- `GET {base}/api/v1/cotizador-prices` — modelos, precios USD, penalizaciones, canjeBonus (descuento solo venta)
- `GET {base}/api/v1/exchange-rate` — dólar blue (display)
- `GET {base}/api/v1/market-items` — catálogo Plan Canje / upgrade

**Sin Admin (demo):**
- `src/config/pricing.json` — precios de compra y penalizaciones (DEMO)
- `src/config/market-pricing.json` — catálogo para plan canje (DEMO)

No hace falta copiar precios a `tenant.ts`.

`precios-cotizador.csv` es un archivo **auxiliar**. Hoy **no lo usa** el build, los tests ni ningún script de la plantilla. No lo borres ni lo edites salvo que lo integres a propósito.

## Variables de entorno
| Variable | Para qué sirve |
|---|---|
| `VITE_PANEL_API_URL` | Base del Market Admin (ej. `https://tu-admin.ejemplo.com`). Si está seteada, es la fuente de verdad. |
| `VITE_EXCHANGE_RATE_URL` | Tipo de cambio solo si **no** hay Admin |
| `VITE_MARKET_PRICES_URL` | Catálogo remoto solo si **no** hay Admin (si vacío → JSON local) |
| `VITE_CRM_WEBHOOK_URL` | Webhook de CRM (solo si `tenant.features.crm` y `tenant.crm.enabled` son true) |

Los valores reales no se commitean: viven en `.env` local y en el dashboard de hosting.

## Deploy
La plantilla incluye `vercel.json` para un SPA en Vercel. Sirve en cualquier host estático. Configurá las variables de entorno en el panel del hosting.

Al publicar: completá `tenant.seo.siteUrl` y, si corresponde, el `Sitemap` en `public/robots.txt` y las URLs en `public/sitemap.xml`. Si `siteUrl` queda vacío, la app sigue funcionando.
