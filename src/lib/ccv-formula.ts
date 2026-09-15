/** Escalas oficiais: CEPE/UFC 01/2004 art. 7º e Edital CCV 2010 item 3.5. */
export type CcvPaper = "portugues" | "matematica" | "estrangeira" | "segunda";

export const CCV_SCALES: Record<
  CcvPaper,
  { a: number; b: number; label: string; short: string; etapa: 1 | 2; hint: string }
> = {
  portugues: {
    a: 36,
    b: 7.2,
    label: "Língua Portuguesa",
    short: "Português",
    etapa: 1,
    hint: "xp = 36 + 7,2 z",
  },
  matematica: {
    a: 24,
    b: 4.8,
    label: "Matemática, Biologia, História, Geografia, Física e Química",
    short: "Matemática",
    etapa: 1,
    hint: "xp = 24 + 4,8 z",
  },
  estrangeira: {
    a: 6,
    b: 1.2,
    label: "Língua Estrangeira",
    short: "Estrangeira",
    etapa: 1,
    hint: "xp = 6 + 1,2 z",
  },
  segunda: {
    a: 80,
    b: 16,
    label: "Cada prova da 2ª etapa",
    short: "Cada prova",
    etapa: 2,
    hint: "xp = 80 + 16 z",
  },
};

/** b = 0,2 · a. A média da escala padronizada é o teto da prova bruta. */
export const CCV_RATIO = 0.2;
export const CCV_N1_AT_MEAN = 186;
export const CCV_N2_AT_MEAN = 240;
export const CCV_NF_AT_MEAN = 426;

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/** Desvio padrão da turma presente — denominador n, faltosos fora. Iezzi vol. 11 / CCV 3.5.8. */
export function stdevPop(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) {
    const d = x - m;
    s += d * d;
  }
  return Math.sqrt(s / xs.length);
}

export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (x - mu) / sigma;
}

export function ccvScore(z: number, paper: CcvPaper): number {
  const { a, b } = CCV_SCALES[paper];
  return a + b * z;
}

export function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

export function formatPt(n: number, digits = 5): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function firstStageFromZ(z: number): number {
  return ccvScore(z, "portugues") + 6 * ccvScore(z, "matematica") + ccvScore(z, "estrangeira");
}

export function secondStageFromZ(z: number, papers = 3): number {
  return papers * ccvScore(z, "segunda");
}

/** Turma de 5 notas — cabe no caderno, conferível à mão (Iezzi vol. 11). */
export const HAND_SCORES = [2, 4, 4, 6, 9] as const;
export const HAND_CANDIDATE = 9;

export function handCheck() {
  const values = [...HAND_SCORES];
  const mu = mean(values);
  const sigma = stdevPop(values);
  const z = zScore(HAND_CANDIDATE, mu, sigma);
  return {
    n: values.length,
    sum: values.reduce((s, x) => s + x, 0),
    mu,
    ss: values.reduce((s, x) => s + (x - mu) ** 2, 0),
    sigma,
    z,
    portugues: round5(ccvScore(z, "portugues")),
    matematica: round5(ccvScore(z, "matematica")),
    estrangeira: round5(ccvScore(z, "estrangeira")),
    segunda: round5(ccvScore(z, "segunda")),
    n1: round5(firstStageFromZ(z)),
    n2: round5(secondStageFromZ(z)),
    nf: round5(firstStageFromZ(z) + secondStageFromZ(z)),
  };
}

export type SigmaPreset = {
  id: string;
  label: string;
  x: number;
  mu: number;
  sigma: number;
  hint: string;
};

export const SIGMA_PRESETS: readonly SigmaPreset[] = [
  {
    id: "apertada",
    label: "Prova apertada",
    x: 18,
    mu: 12,
    sigma: 1.5,
    hint: "turma homogênea — 18 vira raro",
  },
  {
    id: "espalhada",
    label: "Prova espalhada",
    x: 18,
    mu: 12,
    sigma: 6,
    hint: "mesmo 18, z cai de 4 para 1",
  },
  {
    id: "abaixo",
    label: "Abaixo da média",
    x: 6,
    mu: 12,
    sigma: 2,
    hint: "σ pequeno afunda quem erra",
  },
  {
    id: "iezzi",
    label: "Gabarito Iezzi",
    x: HAND_CANDIDATE,
    mu: 5,
    sigma: Math.sqrt(5.6),
    hint: "turma {2,4,4,6,9}",
  },
  {
    id: "media",
    label: "Na média",
    x: 12,
    mu: 12,
    sigma: 3,
    hint: "z = 0: σ não move xp",
  },
];

/** Mesmo x=18, μ=12. σ=2 ⇒ z=3; σ=6 ⇒ z=1. Matemática: 38,4 vs 28,8. */
export const TWO_TURMAS = { x: 18, mu: 12, tight: 2, wide: 6 } as const;

export type SigmaImpact = {
  z: number;
  xp: number;
  a: number;
  b: number;
  dxpDsigma: number;
  dxpDmu: number;
  n1: number;
  n2: number;
  nf: number;
};

/** ∂xp/∂σ = −b (x−μ)/σ². Acima da média, σ maior puxa xp para baixo. */
export function dxpDsigma(x: number, mu: number, sigma: number, paper: CcvPaper): number {
  if (sigma === 0 || x === mu) return 0;
  return (-CCV_SCALES[paper].b * (x - mu)) / (sigma * sigma);
}

export function dxpDmu(_x: number, _mu: number, sigma: number, paper: CcvPaper): number {
  if (sigma === 0) return 0;
  return -CCV_SCALES[paper].b / sigma;
}

export function impactAt(x: number, mu: number, sigma: number, paper: CcvPaper): SigmaImpact {
  const z = zScore(x, mu, sigma);
  const { a, b } = CCV_SCALES[paper];
  return {
    z,
    xp: round5(ccvScore(z, paper)),
    a,
    b,
    dxpDsigma: dxpDsigma(x, mu, sigma, paper),
    dxpDmu: dxpDmu(x, mu, sigma, paper),
    n1: round5(firstStageFromZ(z)),
    n2: round5(secondStageFromZ(z)),
    nf: round5(firstStageFromZ(z) + secondStageFromZ(z)),
  };
}

export function rawPdf(t: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (t - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
