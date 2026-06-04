---
name: stellar-nextjs-rust-auth
description: Use when building or planning an application with a Next.js frontend and a Rust backend that integrates Stellar wallets, RPC, Soroban contracts, assets, or authentication flows.
---

# Stellar Next.js Rust Auth

## Overview

Use this skill when the user wants a web app split into a `Next.js` frontend and a `Rust` backend around Stellar. Prefer simple architectures first: landing page, Google auth, wallet connection, backend API, and optional Soroban or asset operations.

Keep the split explicit:

- `apps/web`: Next.js app router frontend
- `apps/api`: Rust backend
- shared contract with JSON over HTTP unless the user explicitly asks for gRPC

Read [references/stellar-docs.md](references/stellar-docs.md) when you need the right Stellar doc area, tool, or concept. Do not load the whole reference unless needed; search for the section that matches the task.

## When To Use

Use this skill for requests like:

- "create a Stellar app with Next.js and Rust"
- "add Google login before wallet flow"
- "connect a Rust backend to Stellar RPC"
- "build a simple landing page for a Stellar product"
- "prepare Soroban-ready architecture"
- "issue assets or handle Stellar transactions from backend services"

Do not use this skill for:

- a frontend-only marketing page with no Stellar integration
- non-Rust backends unless the user accepts adapting the architecture
- validator operations; use Stellar validator docs directly for that

## Default Architecture

Start with the smallest production-shaped layout:

```text
repo/
  apps/
    web/    -> Next.js frontend, landing, auth UI, dashboard shell
    api/    -> Rust HTTP API, auth verification, Stellar integration
  packages/
    types/  -> shared request/response types if needed
```

Core responsibilities:

- Frontend: landing page, sign-in button, session state, wallet UX
- Backend: verify auth tokens, manage protected routes, call Stellar RPC/Horizon, sign or prepare transactions only if the product requires it
- Stellar boundary: isolate wallet, RPC, contract, and asset logic behind backend modules

## Recommended Build Order

1. Define whether the first milestone is `landing + Google auth`, `wallet flow`, `asset flow`, or `Soroban flow`.
2. Scaffold the split repo with `apps/web` and `apps/api`.
3. Implement Google auth first if the app has user accounts.
4. Add a protected backend endpoint that validates frontend identity.
5. Add Stellar integration only after auth and basic API health are clear.
6. Add contracts, assets, or transaction orchestration as isolated modules.

## Frontend Guidance

- Keep the first landing page simple, fast, and readable.
- For the aesthetic direction, follow the user's palette and tone exactly.
- If the user asks for "simple", avoid dashboards, card grids, or heavy shell chrome on the first pass.
- Prefer App Router and server components where they reduce complexity, but keep auth and wallet UI client-safe.
- For Google auth, keep frontend concerns limited to sign-in initiation, session display, and protected navigation.

## Backend Guidance

- Prefer a small Rust HTTP service with clearly separated modules:
  - `routes`
  - `auth`
  - `stellar`
  - `config`
  - `models`
- Keep auth verification separate from Stellar logic.
- Keep secrets, signing, and privileged Stellar actions on the backend.
- If Soroban is involved, isolate contract clients from generic account or payments code.

## Auth Rules

- Google auth is the identity layer, not the wallet layer.
- Do not mix wallet presence with app authentication.
- The frontend should send a verified session or backend-issued token to protected API routes.
- The backend should enforce auth before any user-scoped Stellar operation.

## Stellar Rules

- Choose RPC-first integrations for modern app flows; use Horizon only when the task specifically depends on it or legacy patterns make it necessary.
- Treat network selection as explicit config: `testnet`, `mainnet`, or `futurenet`.
- For contract work, prefer Soroban docs and examples before improvising payload shapes.
- For assets, distinguish clearly between classic Stellar assets and smart contract tokens.
- For wallet UX, prefer established Stellar wallet guidance and Freighter-specific docs when relevant.

## Delivery Pattern

When implementing, prefer this sequence:

1. landing page
2. Google sign-in
3. authenticated frontend state
4. protected Rust endpoint
5. Stellar read operations
6. transaction or contract write flows

This keeps product risk lower and makes debugging easier.

## Reference Navigation

Use [references/stellar-docs.md](references/stellar-docs.md) as the index for:

- smart contracts and Soroban
- app architecture
- RPC vs Horizon
- tokens and asset issuance
- Freighter and wallet flows
- fees, transactions, and auth
- Stellar CLI and tooling

If the user asks for a concrete implementation, inspect only the relevant reference section and avoid loading unrelated Stellar material into context.
