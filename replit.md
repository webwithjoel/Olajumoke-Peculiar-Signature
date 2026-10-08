# Olajumoke Peculiar Signature

Premium showroom homepage for a Nigerian fashion atelier in Ile-Ife, focused on editorial storytelling and WhatsApp-led bespoke enquiries.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the imported workspace dependencies
- Start the managed workflow `artifacts/olajumoke-peculiar-signature: web` in Replit to run the website at `/`. It supplies `PORT` and `BASE_PATH` automatically.
- Outside Replit: `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/olajumoke-peculiar-signature run dev`
- `pnpm --filter @workspace/olajumoke-peculiar-signature run typecheck` — check the website
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/olajumoke-peculiar-signature run build` — build the website to `artifacts/olajumoke-peculiar-signature/dist/public`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The website needs no secrets, database, or API server. The imported API and canvas packages are retained but are not started for the showroom.
- `DATABASE_URL` is only needed if you separately enable the unused API/database packages.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/olajumoke-peculiar-signature/src/App.tsx` — homepage content, navigation, lookbook lightbox, and WhatsApp actions
- `artifacts/olajumoke-peculiar-signature/src/index.css` — atelier visual system, responsive layout, and motion states
- `attached_assets/` — supplied logo, flyer, portraits, featured looks, and lookbook imagery

## Architecture decisions

- This is a frontend-only showroom experience with ready-to-wear browsing and a local browser cart; checkout enquiries go to WhatsApp rather than a backend or payment processor.
- WhatsApp is the primary conversion path for both bespoke enquiries and lookbook conversations.
- Lookbook imagery opens in an accessible keyboard- and swipe-friendly lightbox; featured look selection is intentionally reserved for a later prompt.

## Product

- Responsive editorial homepage for Olajumoke Peculiar Signature
- Collections discovery across bridal, celebration, corporate, and headpiece moments
- Featured looks and a full-screen Peculiar Lookbook
- WhatsApp-led custom request and look-specific enquiry CTAs
- Atelier story, client testimonials, contact location, and phone details

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
