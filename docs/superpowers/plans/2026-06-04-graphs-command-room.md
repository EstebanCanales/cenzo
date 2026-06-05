# Graphs Command Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/dashboard/graphs` into a sharper, more premium command-room view with stronger hierarchy, richer chart presentation, and visuals aligned with the rest of the dashboard shell.

**Architecture:** Keep the existing route and data contracts, but restructure the page into a hero plus multi-zone chart layout. Extend the chart components with route-specific presentation hooks instead of replacing their underlying data logic, and scope most styling changes to the graphs variant in `dashboard.css` to avoid regressions in overview.

**Tech Stack:** Next.js App Router, React 19, TypeScript, existing dashboard component set, CSS modules via global dashboard stylesheet, Vitest string-contract tests.

---

### Task 1: Lock the graphs route contract before UI changes

**Files:**
- Modify: `apps/web/lib/dashboard.test.ts`
- Test: `apps/web/lib/dashboard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
  it("gives the graphs route a command-room structure", () => {
    expect(graphsPage).toContain("graphs-command");
    expect(graphsPage).toContain("graphs-command__hero");
    expect(graphsPage).toContain("graphs-command__hero-metrics");
    expect(graphsPage).toContain("graphs-command__grid");
    expect(graphsPage).toContain("graphs-command__rail");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --workspace apps/web run test -- dashboard.test.ts`
Expected: FAIL because the new `graphs-command*` markers are not present in `app/dashboard/graphs/page.tsx`.

- [ ] **Step 3: Keep the existing route-level visual contract assertion**

```ts
  it("upgrades products and graphs with route-specific visual treatments", () => {
    expect(productGrid).toContain("products-board");
    expect(productGrid).toContain("products-hero");
    expect(graphsPage).toContain('variant="graphs"');
    expect(graphsPage).toContain("detailed");
  });
```

- [ ] **Step 4: Run the focused test again**

Run: `npm --workspace apps/web run test -- dashboard.test.ts`
Expected: FAIL only on the new command-room route structure assertion.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/dashboard.test.ts
git commit -m "test: lock graphs command room structure"
```

### Task 2: Restructure the graphs page into a command-room composition

**Files:**
- Modify: `apps/web/app/dashboard/graphs/page.tsx`
- Test: `apps/web/lib/dashboard.test.ts`

- [ ] **Step 1: Replace the flat chart stack with the new page composition**

```tsx
import { Activity, ShieldCheck, Siren, Waves } from "lucide-react";

import { IncidentStageChart } from "@/components/dashboard/incident-stage-chart";
import { LabShell } from "@/components/dashboard/lab-shell";
import { QualityDistribution } from "@/components/dashboard/quality-distribution";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { VerificationMatrix } from "@/components/dashboard/verification-matrix";

const heroMetrics = [
  { label: "Verified flow", value: "94%", icon: ShieldCheck },
  { label: "Open alerts", value: "12", icon: Siren },
  { label: "Sensor cadence", value: "4.2m", icon: Waves },
];

export default function GraphsPage() {
  return (
    <LabShell
      description="Lecturas operativas sobre calidad, alertas y registros verificables a lo largo de la cadena."
      eyebrow="Graphs"
      heading="Traceability command room"
      variant="graphs"
    >
      <section className="graphs-command">
        <div className="graphs-command__hero">
          <div className="graphs-command__hero-copy">
            <p className="lab-kicker">Live signal orchestration</p>
            <h2>Visibility across verification, pressure points and lot quality.</h2>
            <p>
              Un solo tablero para leer que se mueve con confianza, que lote acumula friccion y
              donde conviene intervenir antes de romper la cadena de evidencia.
            </p>
          </div>
          <div className="graphs-command__hero-status">
            <span>
              <Activity size={16} />
              Monitoring chain health
            </span>
            <strong>Stable with active review zones</strong>
            <p>Transport y packing concentran la mayor presion; calidad sigue arriba del umbral operativo.</p>
          </div>
        </div>

        <div className="graphs-command__hero-metrics">
          {heroMetrics.map(({ label, value, icon: Icon }) => (
            <article key={label} className="graphs-command__metric">
              <span>
                <Icon size={16} />
                {label}
              </span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="graphs-command__grid">
          <TrendChart detailed />
          <div className="graphs-command__rail">
            <VerificationMatrix detailed />
            <QualityDistribution detailed />
          </div>
          <IncidentStageChart detailed />
        </div>
      </section>
    </LabShell>
  );
}
```

- [ ] **Step 2: Run the focused test to verify the new structure passes**

Run: `npm --workspace apps/web run test -- dashboard.test.ts`
Expected: PASS for the new route structure assertion.

- [ ] **Step 3: Check that the route still preserves the variant and `detailed` props**

```tsx
      variant="graphs"
...
          <TrendChart detailed />
...
            <VerificationMatrix detailed />
            <QualityDistribution detailed />
...
          <IncidentStageChart detailed />
```

- [ ] **Step 4: Run the full web test suite**

Run: `npm --workspace apps/web run test`
Expected: PASS with no regressions in the existing dashboard contract tests.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/dashboard/graphs/page.tsx apps/web/lib/dashboard.test.ts
git commit -m "feat: redesign graphs page composition"
```

### Task 3: Enrich chart components for premium panel headers and internal hierarchy

**Files:**
- Modify: `apps/web/components/dashboard/trend-chart.tsx`
- Modify: `apps/web/components/dashboard/verification-matrix.tsx`
- Modify: `apps/web/components/dashboard/quality-distribution.tsx`
- Modify: `apps/web/components/dashboard/incident-stage-chart.tsx`
- Test: `apps/web/lib/dashboard.test.ts`

- [ ] **Step 1: Upgrade `TrendChart` header and detail zone**

```tsx
      <div className="lab-chart__header trend-panel__header">
        <div>
          <p className="lab-kicker">Velocity</p>
          <h2>{verificationTrend.title}</h2>
          {detailed ? <p className="lab-chart__lede">Verified flow stays ahead while pending proofs remain contained.</p> : null}
        </div>
        <span>{proofRate}% proof rate</span>
      </div>
```

- [ ] **Step 2: Upgrade `VerificationMatrix` header copy and legend framing**

```tsx
      <div className="lab-chart__header matrix-panel__header">
        <div>
          <p className="lab-kicker">Matrix</p>
          <h2>Stage verification</h2>
          {detailed ? <p className="lab-chart__lede">Cross-check crop readiness against each operational stage.</p> : null}
        </div>
        <span>By crop</span>
      </div>
```

- [ ] **Step 3: Turn `QualityDistribution` into a stronger summary panel**

```tsx
      <div className="lab-chart__header quality-panel__header">
        <div>
          <p className="lab-kicker">Quality</p>
          <h2>Lot distribution</h2>
          {detailed ? <p className="lab-chart__lede">Approval confidence, watch-list share and recovery capacity at a glance.</p> : null}
        </div>
        <span>{total} lots</span>
      </div>
```

- [ ] **Step 4: Make `IncidentStageChart` read like an alert rail**

```tsx
      <div className="lab-chart__header incident-panel__header">
        <div>
          <p className="lab-kicker">Incidents</p>
          <h2>Review pressure</h2>
          {detailed ? <p className="lab-chart__lede">Stage-level friction ranked by operational pressure.</p> : null}
        </div>
        <span>{total} open signals</span>
      </div>
```

- [ ] **Step 5: Run the targeted tests**

Run: `npm --workspace apps/web run test -- dashboard.test.ts`
Expected: PASS because the route-level contract remains stable while component internals evolve.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/dashboard/trend-chart.tsx apps/web/components/dashboard/verification-matrix.tsx apps/web/components/dashboard/quality-distribution.tsx apps/web/components/dashboard/incident-stage-chart.tsx
git commit -m "feat: elevate graphs chart presentation"
```

### Task 4: Add graphs-specific command-room styling without regressing overview

**Files:**
- Modify: `apps/web/app/styles/dashboard.css`
- Test: `apps/web/lib/dashboard.test.ts`

- [ ] **Step 1: Add the new graphs page layout classes**

```css
.graphs-command {
  display: grid;
  gap: 24px;
}

.graphs-command__hero,
.graphs-command__hero-metrics,
.graphs-command__grid,
.graphs-command__rail {
  display: grid;
  gap: 20px;
}
```

- [ ] **Step 2: Style the hero and KPI strip to match the app shell**

```css
.graphs-command__hero {
  grid-template-columns: minmax(0, 1.35fr) 320px;
  border: 1px solid var(--line);
  border-radius: var(--radius-shell);
  background:
    radial-gradient(circle at top left, rgba(26, 122, 74, 0.1), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 250, 0.94));
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.graphs-command__hero-status {
  display: grid;
  align-content: center;
  gap: 10px;
  border-left: 1px solid var(--line);
  background: var(--graphite);
  color: white;
  padding: 28px;
}
```

- [ ] **Step 3: Add differentiated panel treatments for the graphs route**

```css
.lab-layout--graphs .trend-panel {
  min-height: 100%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 250, 246, 0.96));
}

.lab-layout--graphs .matrix-panel,
.lab-layout--graphs .quality-panel,
.lab-layout--graphs .incident-panel {
  background: rgba(255, 255, 255, 0.94);
}

.lab-layout--graphs .lab-chart__lede {
  max-width: 42ch;
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
}
```

- [ ] **Step 4: Add responsive rules so the composition collapses cleanly**

```css
@media (max-width: 1180px) {
  .graphs-command__hero,
  .lab-layout--graphs .graphs-command__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 840px) {
  .graphs-command__hero-metrics,
  .lab-layout--graphs .graphs-command__rail {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run the full web test suite**

Run: `npm --workspace apps/web run test`
Expected: PASS with the Sharp Light contract still intact and the graphs route test passing.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/styles/dashboard.css
git commit -m "style: add graphs command room treatments"
```

### Task 5: Final verification and diff review

**Files:**
- Modify: none
- Test: `apps/web/lib/dashboard.test.ts`

- [ ] **Step 1: Run the full web test suite one last time**

Run: `npm --workspace apps/web run test`
Expected: PASS.

- [ ] **Step 2: Review the changed files**

Run: `git diff -- apps/web/app/dashboard/graphs/page.tsx apps/web/components/dashboard/trend-chart.tsx apps/web/components/dashboard/verification-matrix.tsx apps/web/components/dashboard/quality-distribution.tsx apps/web/components/dashboard/incident-stage-chart.tsx apps/web/app/styles/dashboard.css apps/web/lib/dashboard.test.ts`
Expected: A focused diff limited to the graphs route, its chart components, route-scoped styling, and test coverage.

- [ ] **Step 3: Confirm worktree status**

Run: `git status --short`
Expected: Only the intended graphs redesign files are modified or committed on `feature/redesign-sharp-light`.

- [ ] **Step 4: Commit the final verification checkpoint**

```bash
git add apps/web/app/dashboard/graphs/page.tsx apps/web/components/dashboard/trend-chart.tsx apps/web/components/dashboard/verification-matrix.tsx apps/web/components/dashboard/quality-distribution.tsx apps/web/components/dashboard/incident-stage-chart.tsx apps/web/app/styles/dashboard.css apps/web/lib/dashboard.test.ts
git commit -m "chore: verify graphs redesign"
```
