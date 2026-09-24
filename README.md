# Caritas Platzi Conf

Webapp móvil para capturar una selfie, convertirla en una card vertical estilo comic/pixel con paleta Platzi y descargarla como PNG. Las cards generadas pueden compartirse opcionalmente a un muro en vivo (`/muro`) que se actualiza en tiempo real durante el evento.

Construido para la comunidad de **Platzi Conf**, liberado como open source bajo licencia [MIT](./LICENSE) para que cualquier meetup, hackathon o comunidad pueda forkearlo y adaptarlo.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- TypeScript
- Tailwind CSS 4
- [Supabase](https://supabase.com) (Postgres + Storage + Realtime) — opcional, solo si quieres el muro
- Generación de retratos con IA — opcional, vía [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) o [OpenAI Images](https://platform.openai.com/docs/guides/images)

## Funcionalidades

- Captura de selfie desde la cámara del dispositivo (móvil o desktop).
- Renderizado local en `<canvas>` con paleta Platzi (estilo 16-bit).
- (Opcional) post-procesado por IA para un retrato pixel art más rico.
- Descarga del PNG final.
- (Opcional) compartir al muro público del evento, con feed en tiempo real.
- Gate por fecha de evento + cookie de bypass para desarrollo.

## Quickstart

```bash
git clone https://github.com/<tu-fork>/caritas.git
cd caritas
npm install
cp .env.example .env.local
# rellena las variables que quieras usar (todas son opcionales)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

> La cámara solo funciona en `localhost` o HTTPS. Algunos navegadores móviles **bloquean** el acceso en URLs `http://` de la LAN — para testear en celular usa un túnel (ngrok, cloudflared) o un deploy real.

## Variables de entorno

Todas viven en `.env.local`. Ver [`.env.example`](./.env.example) para la lista comentada. Resumen:

| Variable | Requerida | Para qué |
|---|---|---|
| `NEXT_PUBLIC_EVENT_UNLOCK_AT` | no | ISO-8601 de cuándo se "abre" el evento. Default `2026-08-29T00:00:00-05:00`. |
| `NEXT_PUBLIC_BRAND_PRESET` | no | Preset de marca base: `platzi` o `joropofest`. Default `platzi`. |
| `NEXT_PUBLIC_BRAND_*` | no | Overrides del tema (estilo de card, colores, textos, QR, prompt IA) cuando no hay tema en Supabase. |
| `NEXT_PUBLIC_BRAND_CARD_STYLE` | no | `pixel` o `modern`. |
| `BRAND_ADMIN_TOKEN` | no | Si se define, `PUT /api/brand` exige el header `x-brand-admin-token`. |
| `SUPABASE_URL` | solo para `/muro` | URL del proyecto Supabase. |
| `SUPABASE_PUBLISHABLE_KEY` | solo para `/muro` | Publishable / anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Solo si necesitas bypass de RLS desde el server. **No** la prefijes con `NEXT_PUBLIC_`. |
| `SUPABASE_WALL_BUCKET` | no | Bucket de imágenes. Default `wall-images`. |
| `AI_GATEWAY_API_KEY` | solo para IA | Habilita generación vía Vercel AI Gateway. |
| `AI_GATEWAY_IMAGE_MODEL` | no | Default `google/gemini-3-pro-image`. |
| `AI_GATEWAY_BASE_URL` | no | Default `https://ai-gateway.vercel.sh/v1`. |
| `OPENAI_API_KEY` | solo para IA (alternativa) | Habilita generación directa con OpenAI. | (Recomendado)
| `OPENAI_IMAGE_MODEL` | no | Default `gpt-image-1`. |
| `OPENAI_IMAGE_SIZE` | no | Default `1024x1536`. |

Sin keys de IA la app usa el render local en canvas (sin coste, sin red, pero de menor calidad).

## Setup de Supabase (opcional, solo para `/muro`)

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Copia `Project URL` y `Publishable key` (Settings → API) a tu `.env.local`.
3. Aplica el schema:

   ```bash
   # Opción A: pega el contenido en el SQL editor de Supabase
   cat supabase/schema.sql
   ```

   ```bash
   # Opción B: con la CLI de Supabase enlazada al proyecto
   supabase db execute --file supabase/schema.sql
   ```

   Esto crea la tabla `wall_images`, el bucket público `wall-images`, las policies de RLS y habilita Realtime para el muro en vivo.

4. (Opcional) Ajusta las policies en `supabase/schema.sql` si quieres cerrar el `INSERT` solo a usuarios autenticados.

## Marca del evento (`/marca`)

La app no está atada a Platzi Conf: estilo de card, colores, textos, QR, nombre del PNG y el prompt de IA viven en un `BrandTheme`.

1. Aplica el schema de marca (SQL editor de Supabase o CLI):

   ```bash
   cat supabase/brand-schema.sql
   ```

   Crea la tabla `brand_themes`, donde una sola fila queda con `is_active = true`.

2. Abre `/marca`, edita el tema con la vista previa en vivo de la card y pulsa **Publicar tema**. Queda guardado en Supabase, así que todos los dispositivos del evento ven el mismo branding al recargar.
3. Si Supabase no está configurado o la tabla no existe, la app cae al preset de `NEXT_PUBLIC_BRAND_PRESET` y a los overrides `NEXT_PUBLIC_BRAND_*` (el botón **Copiar .env** del editor los genera).

El campo `cardStyle` elige cómo se dibuja la card: `pixel` (marco 16-bit, tipografía de pixel art, retrato pixelado en el fallback local) o `modern` (marco redondeado, tipografía sans y foto sin pixelar). `aiStyle` describe el estilo que se le pide a la IA y `artStyleLabel` es el nombre del estilo que ve la gente en la interfaz.

Los colores se exponen como variables CSS (`--brand-primary`, `--brand-ink`, `--brand-light`, `--brand-muted`) y alimentan también el render del canvas.

## Generación con IA (opcional)

La app intenta primero **Vercel AI Gateway** y si no hay key, cae a **OpenAI**. Si ninguno está configurado, el endpoint devuelve `501` y el cliente sigue funcionando con la card generada localmente.

Detalles en `app/api/generate-card/route.ts`. El cooldown por IP es de 60s, en memoria del proceso (suficiente para un evento; para producción persistente usa un store externo).

## Event gate / modo desarrollo

La app está bloqueada con cuenta regresiva hasta `NEXT_PUBLIC_EVENT_UNLOCK_AT`. Para desarrollar antes de la fecha:

- Abre `/?dev=1` → setea cookie `platzi_dev_unlock=1` y desbloquea.
- Abre `/?dev_lock=1` → limpia la cookie.

## Estructura

```
app/
  api/
    generate-card/   POST: pasa la selfie por la IA o devuelve 501.
    wall/            GET/POST: lista y sube cards al muro.
    brand/           GET/PUT: tema de marca activo.
  lib/wall.ts        cliente Supabase (REST + storage).
  lib/brand.ts       tipo BrandTheme, presets y fallback por env.
  lib/brand-store.ts lectura/escritura del tema en Supabase.
  lib/card-render.ts render de la card en canvas, parametrizado por tema.
  brand-provider.tsx contexto de marca + variables CSS.
  marca/             editor de marca con preview de la card.
  muro/              página /muro y componente realtime.
  page.tsx           home: PhotoCardStudio.
  photo-card-studio.tsx  todo el flujo de captura, render, share, descarga.
public/              QR, referencia de estilo, íconos.
supabase/schema.sql        schema reproducible del muro.
supabase/brand-schema.sql  schema de brand_themes.
```

## Verificación

```bash
npm run lint
npm run build
```

## Deploy

Funciona out-of-the-box en [Vercel](https://vercel.com). Configura las mismas variables de entorno en el dashboard del proyecto. Para otros providers (Netlify, Fly, container propio), basta con un runtime de Node 20+ que pueda correr `next start`.

## Contribuir

PRs y issues bienvenidos. Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para los lineamientos.

## Licencia

[MIT](./LICENSE) © Erasmo Hernández y contribuidores.

## Créditos

Creado originalmente por [@ErasmoHernandez](https://erasmoh.dev) con amor para la comunidad de **Platzi Conf**. Si forkeas el proyecto para tu propio evento, eres libre de cambiar la atribución del footer en `app/photo-card-studio.tsx` y `app/muro/page.tsx`.
