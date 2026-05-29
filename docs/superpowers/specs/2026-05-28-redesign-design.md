# Censo — Rediseño UI: Sharp Light

**Fecha:** 2026-05-28  
**Estado:** Aprobado  

---

## Visión general

Rediseño completo de la UI de Censo hacia una estética "Sharp Light": limpia, precisa, sin decoración innecesaria. La estructura de páginas y componentes se mantiene; cambian la tipografía, el sistema de color, el sistema de espaciado y la escala de bordes/radios.

---

## Sistema de diseño

### Tipografía
- **Antes:** Montserrat (400, 500, 600, 700)
- **Después:** Inter (400, 500, 600, 700, 800) + IBM Plex Mono para valores numéricos destacados (métricas, signal, hashes Stellar)
- Cambiar imports en `layout.tsx` y `tokens.css`

### Paleta de tokens
| Token | Valor anterior | Valor nuevo |
|---|---|---|
| `--bg` | `#f7f8f2` | `#ffffff` |
| `--surface` | `#ffffff` | `#ffffff` |
| `--surface-soft` | `#f5f8f1` | `#fafafa` |
| `--text` | `#182524` | `#111111` |
| `--text-strong` | `#071311` | `#111111` |
| `--muted` | `#63716f` | `#bbbbbb` |
| `--line` | `rgba(24,37,36,0.11)` | `#f0f0f0` |
| `--line-strong` | `rgba(24,37,36,0.2)` | `#e5e5e5` |
| `--green` | `#2c9a5f` | `#1a7a4a` |
| `--green-strong` | `#117343` | `#1a7a4a` |
| `--green-soft` | `#dff3e6` | `#edfaf3` |
| `--graphite` | `#263238` | `#0f2e1a` |
| `--font-sans` | `"Montserrat"` | `"Inter"` |
| `--font-mono` | _(no existía)_ | `"IBM Plex Mono"` |

### Border radius
| Token | Antes | Después |
|---|---|---|
| `--radius` | `18px` | `8px` |
| `--radius-card` | `24px` | `12px` |
| `--radius-panel` | `30px` | `12px` |
| `--radius-shell` | `34px` | `12px` |
| `--radius-pill` | `999px` | `999px` (sin cambio) |

### Sombras
- `--shadow`: eliminar (reemplazar por border `1px solid var(--line)`)
- `--shadow-soft`: reducir a `0 2px 8px rgba(0,0,0,.04)` solo donde aplique

### Fondo del body
- **Antes:** grid pattern + gradiente verde
- **Después:** `#ffffff` liso (sin grid, sin gradiente)

---

## Componentes modificados

### `app-sidebar`
1. Sección Stellar (`app-sidebar__story`) se mueve al fondo del sidebar, justo encima de la cuenta de usuario.
2. Se agrega sección de cuenta de usuario al fondo:
   - Avatar circular (iniciales), nombre completo, email
   - Separada por `border-top: 1px solid var(--line)`
   - Al hacer hover: `background: var(--surface-soft)`
3. Ajustar radios de nav links a `8px`
4. Indicador activo: punto verde (`5px`) en lugar de barra lateral

### `lab-shell` / header
- Eliminar el heading estático "Agro Tech Lab" — el `h1` en cada página pasa a mostrar el saludo o título contextual
- En `DashboardPage`: el `heading` prop cambia a `"Buenos días, {user}."`
- Sin `user-menu-trigger` flotante en el header — la cuenta vive en el sidebar

### `user-menu` (componente existente)
- Mover al fondo del sidebar como `sidebar-account`
- Trigger: fila con avatar + nombre + email + chevron

### Métricas (`metric-card`)
- Sin `box-shadow`, solo `border: 1px solid var(--line)`
- `border-radius`: `12px`
- Valores numéricos en IBM Plex Mono

### `command-surface`
- `background`: `#fafafa` en lugar de gradiente
- `border-radius`: `12px`
- Panel signal (`command-surface__signal`): mantiene fondo oscuro `#0f2e1a`, valor en IBM Plex Mono con `text-shadow` verde suave

### Landing (`app/page.tsx`)
- Hero card: `border-radius: 14px`, sin gradiente pesado
- Botón Google: `background: #111`, `border-radius: 10px`, sin sombra grande
- Fondo: `#fafafa` liso

---

## Archivos a tocar

| Archivo | Cambio |
|---|---|
| `app/layout.tsx` | Cambiar imports de Montserrat → Inter + IBM Plex Mono |
| `app/styles/tokens.css` | Actualizar todos los tokens según tabla |
| `app/styles/base.css` | Fondo body, radios tipográficos, eliminar grid-pattern |
| `app/styles/ui.css` | Radios, sombras, colores de todos los componentes UI |
| `app/styles/dashboard.css` | Sidebar, command surface, metrics, evidence, charts |
| `app/page.tsx` | Ajustar clases del hero card |
| `app/dashboard/page.tsx` | Cambiar `heading` prop |
| `components/dashboard/app-sidebar.tsx` | Mover Stellar al fondo, agregar sección cuenta |
| `components/dashboard/user-menu.tsx` | Adaptar para uso en sidebar |
| `components/dashboard/lab-shell.tsx` | Ajustar header, quitar user-menu-trigger flotante |

---

## Lo que NO cambia

- Estructura de rutas (`/`, `/dashboard`, `/dashboard/products`, `/dashboard/graphs`)
- Lógica de auth (NextAuth + Google)
- Componentes de datos (`TrendChart`, `VerificationMatrix`, `EvidencePanel`, `ProductGrid`, etc.)
- API Rust
- Framer Motion (`motion-fade`, indicador de sidebar)
- Variables CSS que no están en la tabla de tokens
