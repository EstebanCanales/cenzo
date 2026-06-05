<div align="center">

<!-- BANNER — reemplazar con imagen final -->
<img src="docs/banner.png" alt="Cenzo Banner" width="100%" style="border-radius: 12px; margin-bottom: 24px" />

# Cenzo

**El café que tomás tiene una historia. Ahora podés leerla.**

*Trazabilidad agrícola verificable, anclada en Stellar · Soroban.*

<br/>

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED?logo=stellar&logoColor=white&style=for-the-badge)](https://stellar.org)
[![Morpho Studio](https://img.shields.io/badge/Morpho_Studio-Competencia-F59E0B?style=for-the-badge)](https://www.techrebel.world)

</div>

<br/>

---

## El problema

El 70% del café del mundo no puede probar su origen.

Los agricultores pierden valor porque no tienen cómo demostrar sus prácticas. Los compradores pagan precios premium sin garantías reales. Las certificaciones son papel — costoso, lento y falsificable.

**Cenzo lo cambia.**

---

## Qué hace

Cada lote de café recibe un **NFT en Soroban**. Desde la siembra hasta la venta, cada etapa del ciclo queda registrada con su hash criptográfico anclado en la blockchain de Stellar. Cualquier cambio en los datos rompe el hash — la manipulación se vuelve imposible de ocultar.

```
Finca → Cosecha → Recepción → Tueste → Empaque → Calidad → Venta
  ↓         ↓           ↓          ↓          ↓         ↓        ↓
              SHA-256 anclado en Soroban en cada paso
```

El agricultor muestra un QR. El comprador escanea. Ve todo — verificado por la cadena.

---

## Por qué importa

| Antes | Con Cenzo |
|-------|-----------|
| "Este café es orgánico" — declaración de fe | Certificado Diamante · 94/100 · verificado on-chain |
| El origen depende de quién lo dice | Firma de la finca anclada en Stellar Testnet |
| Auditorías manuales y costosas | Cualquier persona verifica con un QR en segundos |
| Las certificaciones duran años y cuestan miles | Score NFT calculado automáticamente desde métricas reales |

---

## El score NFT

Cada lote tiene un **score de 0 a 100** y un grado de **A a F**, calculado sobre 4 componentes reales:

| Componente | Peso | Qué mide |
|-----------|------|---------|
| Trazabilidad | 40 pts | Etapas del ciclo completas y en orden |
| Integridad | 25 pts | % de eventos con hash verificado on-chain |
| Sensores IoT | 20 pts | Temperatura, humedad, pH dentro de rangos óptimos |
| Certificación | 15 pts | Tier otorgado: Plata · Oro · Diamante |

El NFT del lote lleva la imagen del certificado generada dinámicamente — única para cada productor.

---

## Stack

`Next.js 15` · `Rust + Axum` · `Soroban Smart Contract` · `Stellar Testnet` · `SQLite` · `NASA POWER API` · `Freighter Wallet`

---

---

<div align="center">

*Enviado a **Morpho Studio** · Esteban Canales · 2026*

> *"El agricultor tiene el trabajo más honesto del mundo. La tecnología debería hacer ese honor visible."*

</div>
