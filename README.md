# Censo

Monorepo base con:

- `apps/web`: Next.js con landing simple y login Google
- `apps/api`: backend Rust listo para conectar Stellar despues

## Google OAuth

Valores usados en Google Cloud para local:

- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

## Variables locales

El archivo `.env.local` en `apps/web` contiene la configuracion local de Auth.js.

