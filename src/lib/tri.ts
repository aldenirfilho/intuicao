/** ENEM / SiSU / padronização 500+100z — pós-2014. Nenhuma banca usa ECC. */

export const TRI_D = 1.7;

export type TriItem = {
  id: string;
  label: string;
  a: number;
  b: number;
  c: number;
};

/** Cinco itens pedagógicos na escala (0,1). b = dificuldade, a = discriminação, c = chute. */
export const TRI_ITEMS: readonly TriItem[] = [
  { id: "f1", label: "Fácil", a: 1.2, b: -1.4, c: 0.2 },
  { id: "f2", label: "Fácil+", a: 1.4, b: -0.6, c: 0.2 },
  { id: "m", label: "Médio", a: 1.6, b: 0.1, c: 0.2 },
  { id: "d1", label: "Difícil", a: 1.5, b: 0.9, c: 0.18 },
  { id: "d2", label: "Muito difícil", a: 1.3, b: 1.7, c: 0.15 },
];

/** 3PL Birnbaum. INEP, Entenda sua nota / Procedimentos de análise. */
export function threePl(theta: number, a: number, b: number, c: number, D = TRI_D): number {
  const x = D * a * (theta - b);
  const p = 1 / (1 + Math.exp(-x));
  return c + (1 - c) * p;
}

export function threePlDeriv(theta: number, a: number, b: number, c: number, D = TRI_D): number {
  const P = threePl(theta, a, b, c, D);
  return (D * a * (P - c) * (1 - P)) / (1 - c);
}

/** Informação de Fisher do item — a «derivada» que o ENEM maximiza. */
export function itemInfo(theta: number, a: number, b: number, c: number, D = TRI_D): number {
  const P = threePl(theta, a, b, c, D);
  const dP = threePlDeriv(theta, a, b, c, D);
  const den = P * (1 - P);
  if (den <= 1e-12) return 0;
  return (dP * dP) / den;
}

export function logLik(theta: number, u: readonly boolean[], items: readonly TriItem[] = TRI_ITEMS): number {
  let s = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const P = Math.min(1 - 1e-12, Math.max(1e-12, threePl(theta, it.a, it.b, it.c)));
    s += u[i] ? Math.log(P) : Math.log(1 - P);
  }
  return s;
}

function gaussPhi(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/**
 * EAP — esperança a posteriori. INEP: 40 pontos de quadratura + priori N(0,1).
 * Aqui: Riemann em [−4, 4] (o «integral» oficial da nota).
 */
export function eapTheta(u: readonly boolean[], items: readonly TriItem[] = TRI_ITEMS): {
  theta: number;
  se: number;
  evidence: number;
} {
  const lo = -4;
  const hi = 4;
  const n = 80;
  const h = (hi - lo) / n;
  let wSum = 0;
  let tw = 0;
  let t2w = 0;
  for (let i = 0; i <= n; i++) {
    const t = lo + i * h;
    const w = Math.exp(logLik(t, u, items)) * gaussPhi(t) * (i === 0 || i === n ? 0.5 : 1) * h;
    wSum += w;
    tw += t * w;
    t2w += t * t * w;
  }
  if (wSum <= 0) return { theta: 0, se: 1, evidence: 0 };
  const theta = tw / wSum;
  const v = t2w / wSum - theta * theta;
  return { theta, se: Math.sqrt(Math.max(v, 0)), evidence: wSum };
}

/** Escala ENEM (500, 100): θ(500,100) = 100 θ(0,1) + 500. */
export function enemScale(theta: number): number {
  return 500 + 100 * theta;
}

/** Unicamp / UFRGS 2025: T-score clássico, herdeiro da CCV. */
export function tScore500(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return 500;
  return 500 + (100 * (x - mu)) / sigma;
}

export type AreaId = "lc" | "ch" | "cn" | "mt" | "red";

export const SISU_AREAS: Record<AreaId, { label: string; short: string }> = {
  lc: { label: "Linguagens", short: "LC" },
  ch: { label: "Ciências Humanas", short: "CH" },
  cn: { label: "Ciências da Natureza", short: "CN" },
  mt: { label: "Matemática", short: "MT" },
  red: { label: "Redação", short: "RED" },
};

/** Medicina típica (UFPE/UFC-like): CN 3, CH 1, demais 2. */
export const SISU_MEDICINA: Record<AreaId, number> = {
  lc: 2,
  ch: 1,
  cn: 3,
  mt: 2,
  red: 2,
};

export function sisuMean(notes: Record<AreaId, number>, weights: Record<AreaId, number>): number {
  let num = 0;
  let den = 0;
  (Object.keys(notes) as AreaId[]).forEach((k) => {
    num += notes[k] * weights[k];
    den += weights[k];
  });
  return den === 0 ? 0 : num / den;
}

export const PATTERNS = [
  { id: "coerente", label: "Coerente 3/5", u: [true, true, true, false, false] as const },
  { id: "chute", label: "Chute 3/5", u: [false, false, true, true, true] as const },
  { id: "tudo", label: "Tudo certo", u: [true, true, true, true, true] as const },
  { id: "nada", label: "Tudo errado", u: [false, false, false, false, false] as const },
] as const;
