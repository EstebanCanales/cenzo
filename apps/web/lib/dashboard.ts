export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: "green" | "gold" | "slate";
};

export type VerificationRecord = {
  id: string;
  label: string;
  value: string;
  status: "verified" | "pending";
  note: string;
};

export type ProductTraceEvent = {
  id: string;
  stage: string;
  actor: string;
  timestamp: string;
  location: string;
  status: "verified" | "pending";
  detail: string;
  stellarRef: string;
};

export type ProductCard = {
  id: string;
  name: string;
  category: string;
  origin: string;
  status: "Verified" | "In transit" | "Needs review";
  image: string;
  assetSrc: string;
  sensorStatus: "Live" | "Syncing" | "Review";
  riskLevel: "low" | "medium" | "high";
  lastVerifiedAt: string;
  summary: string;
  traceabilityScore: number;
  stellarStatus: "Verified" | "Pending";
  verificationNote: string;
  metrics: {
    movements: number;
    lastCheck: string;
    contracts: number;
  };
  events: ProductTraceEvent[];
};

export type ChartDatum = {
  label: string;
  value: number;
  tone?: "green" | "gold" | "slate";
};

export type ChartSeries = {
  id: string;
  title: string;
  description: string;
  data: ChartDatum[];
};

export type TrendPoint = {
  label: string;
  verified: number;
  pending: number;
};

export type VerificationMatrixCell = {
  stage: string;
  status: "verified" | "pending" | "review";
  count: number;
};

export type VerificationMatrix = {
  rows: Array<{
    label: string;
    cells: VerificationMatrixCell[];
  }>;
};

export type QualitySlice = {
  label: string;
  count: number;
  tone: "green" | "gold" | "steel";
};

export type IncidentStage = {
  stage: string;
  count: number;
  severity: "low" | "medium" | "high";
};

export const dashboardMetrics: DashboardMetric[] = [
  { id: "active", label: "Lotes activos", value: "128", change: "+12 esta semana", tone: "green" },
  { id: "moves", label: "Movimientos verificados", value: "1,284", change: "96% validados", tone: "slate" },
  { id: "alerts", label: "Alertas de calidad", value: "07", change: "2 requieren accion", tone: "gold" },
  { id: "contracts", label: "Contratos automatizados", value: "41", change: "8 liberaciones hoy", tone: "green" },
];

export const overviewCharts: ChartSeries[] = [
  {
    id: "stages",
    title: "Movimientos por etapa",
    description: "Cuanto se esta moviendo cada fase de la cadena en este momento.",
    data: [
      { label: "Agricultor", value: 86, tone: "green" },
      { label: "Transporte", value: 62, tone: "slate" },
      { label: "Recepcion", value: 48, tone: "green" },
      { label: "Calidad", value: 36, tone: "gold" },
      { label: "Venta", value: 52, tone: "green" },
    ],
  },
  {
    id: "quality",
    title: "Estado de calidad",
    description: "Lotes revisados por control y su resultado mas reciente.",
    data: [
      { label: "Aprobados", value: 82, tone: "green" },
      { label: "En revision", value: 14, tone: "slate" },
      { label: "Observados", value: 4, tone: "gold" },
    ],
  },
];

export const graphSeries: ChartSeries[] = [
  {
    id: "verified-period",
    title: "Movimientos verificados por periodo",
    description: "Seguimiento semanal de registros confirmados en la cadena agricola.",
    data: [
      { label: "Lun", value: 42, tone: "green" },
      { label: "Mar", value: 55, tone: "green" },
      { label: "Mie", value: 61, tone: "slate" },
      { label: "Jue", value: 48, tone: "green" },
      { label: "Vie", value: 74, tone: "green" },
      { label: "Sab", value: 39, tone: "gold" },
    ],
  },
  {
    id: "quality-pass",
    title: "Control de calidad aprobado",
    description: "Porcentaje de lotes que si cumplieron condiciones antes de avanzar.",
    data: [
      { label: "Cafe", value: 93, tone: "green" },
      { label: "Cacao", value: 88, tone: "green" },
      { label: "Banano", value: 84, tone: "slate" },
      { label: "Pina", value: 79, tone: "gold" },
    ],
  },
  {
    id: "incidents",
    title: "Incidencias por etapa",
    description: "Donde se concentran fricciones o revisiones en la operacion.",
    data: [
      { label: "Origen", value: 3, tone: "slate" },
      { label: "Transporte", value: 8, tone: "gold" },
      { label: "Recepcion", value: 2, tone: "green" },
      { label: "Calidad", value: 5, tone: "gold" },
    ],
  },
  {
    id: "stellar",
    title: "Verificaciones registradas en Stellar",
    description: "Eventos que ya cuentan con evidencia verificable para auditoria.",
    data: [
      { label: "Hash emitido", value: 94, tone: "green" },
      { label: "Pendiente", value: 6, tone: "gold" },
    ],
  },
];

export const verificationTrend = {
  title: "Verification velocity",
  points: [
    { label: "Mon", verified: 42, pending: 5 },
    { label: "Tue", verified: 55, pending: 4 },
    { label: "Wed", verified: 61, pending: 7 },
    { label: "Thu", verified: 48, pending: 6 },
    { label: "Fri", verified: 74, pending: 3 },
    { label: "Sat", verified: 39, pending: 6 },
  ] satisfies TrendPoint[],
};

export const verificationMatrix: VerificationMatrix = {
  rows: [
    {
      label: "Coffee",
      cells: [
        { stage: "Origin", status: "verified", count: 18 },
        { stage: "Transport", status: "verified", count: 16 },
        { stage: "Quality", status: "verified", count: 14 },
        { stage: "Sale", status: "pending", count: 4 },
      ],
    },
    {
      label: "Cacao",
      cells: [
        { stage: "Origin", status: "verified", count: 12 },
        { stage: "Transport", status: "verified", count: 11 },
        { stage: "Quality", status: "pending", count: 3 },
        { stage: "Sale", status: "pending", count: 2 },
      ],
    },
    {
      label: "Banano",
      cells: [
        { stage: "Origin", status: "verified", count: 16 },
        { stage: "Transport", status: "review", count: 5 },
        { stage: "Quality", status: "review", count: 4 },
        { stage: "Sale", status: "pending", count: 1 },
      ],
    },
  ],
};

export const qualityDistribution: QualitySlice[] = [
  { label: "Approved", count: 82, tone: "green" },
  { label: "In review", count: 14, tone: "steel" },
  { label: "Flagged", count: 4, tone: "gold" },
];

export const incidentStageData: IncidentStage[] = [
  { stage: "Origin", count: 3, severity: "low" },
  { stage: "Transport", count: 8, severity: "high" },
  { stage: "Reception", count: 2, severity: "low" },
  { stage: "Quality", count: 5, severity: "medium" },
];

export const dashboardInsights = {
  primary: {
    title: "Stellar proof layer active",
    body: "Critical movements are packaged as verifiable evidence for audits, payment release, and quality reviews.",
    value: "94%",
    label: "registered events",
  },
  qualityRisk: {
    title: "Quality risk",
    value: "2",
    label: "lots need review",
  },
  sensorSignal: {
    title: "Sensor signal",
    value: "Live",
    label: "field station AS01",
  },
};

export const stellarVerificationRecords: VerificationRecord[] = [
  {
    id: "hash",
    label: "Hash de evidencia",
    value: "0xA91F...4D20",
    status: "verified",
    note: "Cada movimiento critico genera una referencia verificable y dificil de alterar.",
  },
  {
    id: "contract",
    label: "Contrato de validacion",
    value: "Contrato QA-17",
    status: "verified",
    note: "El contrato valida hitos y desbloquea acciones cuando se cumplen condiciones.",
  },
  {
    id: "next",
    label: "Siguiente sincronizacion",
    value: "12 min",
    status: "pending",
    note: "Los eventos nuevos esperan su siguiente ventana de registro para consolidarse.",
  },
];

export const products: ProductCard[] = [
  {
    id: "cafe-tarrazu-lote-18",
    name: "Cafe Tarrazu Lote 18",
    category: "Cafe regenerativo",
    origin: "Tarrazu, Costa Rica",
    status: "Verified",
    image: "grain",
    assetSrc: "/agro-assets/coffee-lot.png",
    sensorStatus: "Live",
    riskLevel: "low",
    lastVerifiedAt: "Hace 18 min",
    summary: "Lote premium con trazabilidad completa y control de humedad verificado.",
    traceabilityScore: 98,
    stellarStatus: "Verified",
    verificationNote: "5 hitos firmados y validados durante el recorrido completo.",
    metrics: {
      movements: 5,
      lastCheck: "Hace 18 min",
      contracts: 2,
    },
    events: [
      {
        id: "farm",
        stage: "Agricultor",
        actor: "Finca Don Mateo",
        timestamp: "27 May 2026 · 06:15",
        location: "Santa Maria de Dota",
        status: "verified",
        detail: "Se recolecto, peso y sello el lote con lectura ambiental inicial.",
        stellarRef: "STLR-8FA1",
      },
      {
        id: "transport",
        stage: "Transporte",
        actor: "Ruta Verde Logistics",
        timestamp: "27 May 2026 · 09:40",
        location: "Intercambio Los Santos",
        status: "verified",
        detail: "Temperatura y humedad se mantuvieron dentro del rango definido.",
        stellarRef: "STLR-8FB2",
      },
      {
        id: "warehouse",
        stage: "Recepcion",
        actor: "Centro Cooperativo Tarrazu",
        timestamp: "27 May 2026 · 12:10",
        location: "Bodega principal",
        status: "verified",
        detail: "Recepcion firmada con comparacion de peso y lote esperado.",
        stellarRef: "STLR-8FC3",
      },
      {
        id: "quality",
        stage: "Control de calidad",
        actor: "Laboratorio Aroma Claro",
        timestamp: "27 May 2026 · 13:45",
        location: "Mesa QA",
        status: "verified",
        detail: "Aprobado por humedad, coloracion y consistencia del grano.",
        stellarRef: "STLR-8FD4",
      },
      {
        id: "sale",
        stage: "Venta",
        actor: "Comprador Export Select",
        timestamp: "27 May 2026 · 15:20",
        location: "Salida comercial",
        status: "pending",
        detail: "Esperando confirmacion final de entrega para liberar el pago.",
        stellarRef: "STLR-8FE5",
      },
    ],
  },
  {
    id: "cacao-brunca-09",
    name: "Cacao Brunca 09",
    category: "Cacao fino",
    origin: "Buenos Aires, Puntarenas",
    status: "In transit",
    image: "pod",
    assetSrc: "/agro-assets/cacao-crates.png",
    sensorStatus: "Live",
    riskLevel: "medium",
    lastVerifiedAt: "Hace 7 min",
    summary: "Cadena activa con transporte monitoreado y siguiente revision en recibo.",
    traceabilityScore: 91,
    stellarStatus: "Pending",
    verificationNote: "Ultimo tramo en camino hacia recepcion central.",
    metrics: {
      movements: 3,
      lastCheck: "Hace 7 min",
      contracts: 1,
    },
    events: [
      {
        id: "farm",
        stage: "Agricultor",
        actor: "Asociacion Brunca",
        timestamp: "27 May 2026 · 07:05",
        location: "Parcela sur",
        status: "verified",
        detail: "Lote inspeccionado y preparado para salida.",
        stellarRef: "STLR-5AA1",
      },
      {
        id: "transport",
        stage: "Transporte",
        actor: "Pacifica Cargo",
        timestamp: "27 May 2026 · 10:30",
        location: "Ruta 2",
        status: "verified",
        detail: "Se mantiene control de humedad dentro de parametros.",
        stellarRef: "STLR-5AB2",
      },
      {
        id: "warehouse",
        stage: "Recepcion",
        actor: "Centro Sur",
        timestamp: "27 May 2026 · 17:00",
        location: "Muelle de descarga",
        status: "pending",
        detail: "Pendiente firma de recepcion y validacion del lote.",
        stellarRef: "STLR-5AC3",
      },
    ],
  },
  {
    id: "banano-caribe-22",
    name: "Banano Caribe 22",
    category: "Banano premium",
    origin: "Guacimo, Limon",
    status: "Needs review",
    image: "leaf",
    assetSrc: "/agro-assets/banana-cold-chain.png",
    sensorStatus: "Review",
    riskLevel: "high",
    lastVerifiedAt: "Hace 3 min",
    summary: "Lote con desviacion de temperatura durante transporte y revision abierta.",
    traceabilityScore: 76,
    stellarStatus: "Pending",
    verificationNote: "Hay una alerta activa antes de liberar la venta.",
    metrics: {
      movements: 4,
      lastCheck: "Hace 3 min",
      contracts: 1,
    },
    events: [
      {
        id: "farm",
        stage: "Agricultor",
        actor: "Finca Caribe Vivo",
        timestamp: "26 May 2026 · 05:50",
        location: "Sector norte",
        status: "verified",
        detail: "Salida aprobada desde origen.",
        stellarRef: "STLR-3CA1",
      },
      {
        id: "transport",
        stage: "Transporte",
        actor: "Transit Fresh",
        timestamp: "26 May 2026 · 08:25",
        location: "Ruta Caribe",
        status: "pending",
        detail: "Sensor reporto aumento de temperatura sobre el umbral.",
        stellarRef: "STLR-3CB2",
      },
      {
        id: "warehouse",
        stage: "Recepcion",
        actor: "Planta Atlantico",
        timestamp: "26 May 2026 · 11:10",
        location: "Anden 4",
        status: "verified",
        detail: "Recepcion completada con bandera preventiva.",
        stellarRef: "STLR-3CC3",
      },
      {
        id: "quality",
        stage: "Control de calidad",
        actor: "Equipo QA Atlantico",
        timestamp: "26 May 2026 · 13:00",
        location: "Camara 2",
        status: "pending",
        detail: "Pendiente dictamen final para continuar a venta.",
        stellarRef: "STLR-3CD4",
      },
    ],
  },
];

export function getGreetingByHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getGreetingByDate(date: Date) {
  return getGreetingByHour(date.getHours());
}

export function getProductById(productId: string) {
  return products.find((product) => product.id === productId);
}
