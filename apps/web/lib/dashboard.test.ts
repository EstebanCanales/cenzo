import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  dashboardInsights,
  getGreetingByHour,
  getProductById,
  incidentStageData,
  qualityDistribution,
  verificationMatrix,
  verificationTrend,
} from "./dashboard";

describe("getGreetingByHour", () => {
  it("returns morning before noon", () => {
    expect(getGreetingByHour(9)).toBe("Good morning");
  });

  it("returns afternoon after midday", () => {
    expect(getGreetingByHour(14)).toBe("Good afternoon");
  });

  it("returns evening at night hours", () => {
    expect(getGreetingByHour(20)).toBe("Good evening");
  });
});

describe("getProductById", () => {
  it("returns the matching product from dashboard mocks", () => {
    const product = getProductById("cafe-tarrazu-lote-18");

    expect(product?.name).toBe("Cafe Tarrazu Lote 18");
    expect(product?.traceabilityScore).toBe(98);
  });

  it("exposes local asset and lab telemetry fields", () => {
    const product = getProductById("cacao-brunca-09");

    expect(product?.assetSrc).toBe("/agro-assets/cacao-crates.png");
    expect(product?.sensorStatus).toBe("Live");
    expect(product?.riskLevel).toBe("medium");
    expect(product?.lastVerifiedAt).toBe("Hace 7 min");
  });
});

describe("dashboard chart contracts", () => {
  it("exposes custom chart data for the lab dashboard", () => {
    expect(verificationTrend.points.length).toBeGreaterThan(4);
    expect(verificationMatrix.rows[0]?.cells[0]).toHaveProperty("status");
    expect(qualityDistribution[0]).toHaveProperty("count");
    expect(incidentStageData[0]).toHaveProperty("stage");
  });

  it("provides operational insight copy for the evidence panel", () => {
    expect(dashboardInsights.primary.title).toContain("Stellar");
    expect(dashboardInsights.qualityRisk.value).toBe("2");
  });
});

describe("Soft Connected OS style contract", () => {
  const root = resolve(__dirname, "..");
  const tokensCss = readFileSync(resolve(root, "app/styles/tokens.css"), "utf8");
  const baseCss = readFileSync(resolve(root, "app/styles/base.css"), "utf8");
  const dashboardCss = readFileSync(resolve(root, "app/styles/dashboard.css"), "utf8");
  const overviewPage = readFileSync(resolve(root, "app/dashboard/page.tsx"), "utf8");
  const graphsPage = readFileSync(resolve(root, "app/dashboard/graphs/page.tsx"), "utf8");
  const productGrid = readFileSync(resolve(root, "components/dashboard/product-grid.tsx"), "utf8");

  it("uses sharp card radii (Sharp Light design)", () => {
    expect(tokensCss).toContain("--radius-shell: 12px");
    expect(tokensCss).toContain("--radius-panel: 12px");
    expect(tokensCss).toContain("--radius-pill: 999px");
    expect(tokensCss).toContain('--font-sans: "Inter"');
    expect(tokensCss).toContain('--font-mono: "IBM Plex Mono"');
  });

  it("keeps the document scrollable and avoids locking the app shell to viewport height", () => {
    expect(baseCss).toContain("overflow-y: auto");
    expect(dashboardCss).not.toContain("height: calc(100vh - 24px)");
    expect(dashboardCss).not.toContain("min-height: calc(100vh - 24px)");
  });

  it("uses a page-level overview variant instead of wrapping the dashboard in a viewport box", () => {
    expect(overviewPage).toContain('variant="overview"');
    expect(dashboardCss).toContain(".lab-layout--overview");
    expect(dashboardCss).toContain("min-height: 100dvh");
    expect(dashboardCss).not.toContain("max-height: calc(100dvh - 72px)");
  });

  it("upgrades products and graphs with route-specific visual treatments", () => {
    expect(productGrid).toContain("products-board");
    expect(productGrid).toContain("products-hero");
    expect(graphsPage).toContain('variant="graphs"');
    expect(graphsPage).toContain("detailed");
  });
});
