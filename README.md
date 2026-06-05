<div align="center">

<img src="docs/banner.png" alt="Cenzo Banner" width="100%" style="border-radius: 12px;" />

<br/>
<br/>

# Cenzo

### El café que tomás tiene una historia. Ahora podés leerla.

*Trazabilidad agrícola verificable, anclada en Stellar · Soroban.*

<br/>

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED?logo=stellar&logoColor=white&style=for-the-badge)](https://stellar.org)
[![Rust](https://img.shields.io/badge/Rust-Axum-CE422B?logo=rust&logoColor=white&style=for-the-badge)](https://www.rust-lang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white&style=for-the-badge)](https://nextjs.org)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white&style=for-the-badge)](https://railway.app)

</div>

<br/>

---

## El problema

El **70% del café del mundo** no puede probar su origen.

Los agricultores pierden valor porque no tienen cómo demostrar sus prácticas. Los compradores pagan precios premium sin garantías reales. Las certificaciones son papel — costoso, lento y falsificable.

**Cenzo lo cambia.**

---

## Qué hace

Cada lote de café recibe un **NFT en Soroban**. Desde la siembra hasta la venta, cada etapa del ciclo queda registrada con su hash criptográfico anclado en la blockchain de Stellar. Cualquier cambio en los datos rompe el hash — la manipulación se vuelve imposible de ocultar.

El agricultor muestra un QR. El comprador escanea. Ve todo — verificado por la cadena.

---

## Por qué importa

| Antes | Con Cenzo |
|:------|:----------|
| "Este café es orgánico" — declaración de fe | Certificado Diamante · 94/100 · verificado on-chain |
| El origen depende de quién lo dice | Firma de la finca anclada en Stellar Testnet |
| Auditorías manuales y costosas | Cualquier persona verifica con un QR en segundos |
| Las certificaciones duran años y cuestan miles | Score NFT calculado automáticamente desde métricas reales |

---

## El score NFT

Cada lote tiene un **score de 0 a 100** y un grado de **A a F**, calculado sobre 4 componentes reales:

| Componente | Peso | Qué mide |
|:-----------|:----:|:---------|
| Trazabilidad | **40 pts** | Etapas del ciclo completas y en orden |
| Integridad | **25 pts** | % de eventos con hash verificado on-chain |
| Sensores IoT | **20 pts** | Temperatura, humedad y pH dentro de rangos óptimos |
| Certificación | **15 pts** | Tier otorgado: Plata · Oro · Diamante |

| Grado | Score | Label |
|:-----:|:-----:|:------|
| **A** | ≥ 88 | Producto excelente |
| **B** | ≥ 72 | Producto bueno |
| **C** | ≥ 55 | Producto aceptable |
| **D** | ≥ 38 | Producto en desarrollo |
| **F** | < 38 | No verificable |

El NFT lleva la imagen del certificado generada dinámicamente — única para cada productor.

---

## Stack

| Capa | Tecnología | Versión |
|:-----|:-----------|:-------:|
| Frontend | Next.js · React · Tailwind CSS v4 · Framer Motion | 15 · 19 |
| Auth | Auth.js (Google OAuth) · Freighter Wallet · jose JWT | v5 · v6 |
| Backend | Rust · Axum · SQLx · SQLite | 1.78 · 0.7 |
| Blockchain | Stellar Testnet · Soroban · stellar-cli | SDK v22 |
| Sensores | NASA POWER API · Simulador IoT | — |
| Deploy | Railway (api + web) · Vercel compatible | — |

---

## Documentación

| Archivo | Descripción |
|:--------|:------------|
| [TECHNICAL.md](docs/TECHNICAL.md) | Arquitectura completa, diagrama de capas y estructura del repositorio |
| [WEB3.md](docs/WEB3.md) | Stellar, Soroban, Freighter, modelo hash-anchor y algoritmo NFT score |
| [API.md](docs/API.md) | Referencia completa de los 12 endpoints REST con ejemplos de request/response |
| [CONTRACT.md](docs/CONTRACT.md) | Contrato Soroban: funciones, flujo de verificación on-chain y suite de tests |
| [DATABASE.md](docs/DATABASE.md) | Esquema SQLite, 6 tablas, migraciones e invariantes del modelo |
| [SETUP.md](docs/SETUP.md) | Setup local paso a paso y deploy en Railway con variables de entorno |

---

<div align="center">

*Enviado a **Morpho Studio** · 2026*

<br/>

> *"El agricultor tiene el trabajo más honesto del mundo.*
> *La tecnología debería hacer ese honor visible."*

</div>
