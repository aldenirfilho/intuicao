import cipher from "./cipher-data.json";
import { gematria, mul, realDerivative, realUpper, scalarFrom, type Point } from "./ecc";
import { ccvScore, mean, round5, stdevPop, zScore, type CcvPaper } from "./ccv-formula";

export {
  CCV_N1_AT_MEAN,
  CCV_N2_AT_MEAN,
  CCV_NF_AT_MEAN,
  CCV_RATIO,
  CCV_SCALES,
  HAND_CANDIDATE,
  HAND_SCORES,
  SIGMA_PRESETS,
  TWO_TURMAS,
  ccvScore,
  dxpDmu,
  dxpDsigma,
  firstStageFromZ,
  formatPt,
  handCheck,
  impactAt,
  mean,
  rawPdf,
  round5,
  secondStageFromZ,
  stdevPop,
  zScore,
  type CcvPaper,
  type SigmaImpact,
  type SigmaPreset,
} from "./ccv-formula";

export type Grandeza = "gematria" | "k" | "x";
export type TurmaId = "chaves" | "dias" | "abcissas";

export const GRANDEZA: Record<Grandeza, { label: string; iezzi: string }> = {
  gematria: { label: "Gematria Σ", iezzi: "escore bruto da palavra (A=1 … Z=26)" },
  k: { label: "Escalar k", iezzi: "k = (Σ + índice) mod 20" },
  x: { label: "Abcissa x de kG", iezzi: "coordenada do ponto na curva" },
};

export function fElliptic(x: number): number {
  const v = x ** 3 + 2 * x + 3;
  return v > 0 ? Math.sqrt(v) : 0;
}

export type Trapezoid = {
  value: number;
  h: number;
  xs: number[];
  ys: number[];
};

/** Método dos trapézios — caderno clássico de integral definida (Iezzi vol. 8). */
export function trapezoid(a: number, b: number, n: number, f: (x: number) => number = fElliptic): Trapezoid {
  const steps = Math.max(1, Math.floor(n));
  const h = (b - a) / steps;
  const xs: number[] = [];
  const ys: number[] = [];
  let acc = 0;
  for (let i = 0; i <= steps; i++) {
    const x = a + i * h;
    const y = f(x);
    xs.push(x);
    ys.push(y);
    acc += i === 0 || i === steps ? y : 2 * y;
  }
  return { value: (h / 2) * acc, h, xs, ys };
}

export function gaussPhi(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

export type Cohort = {
  id: TurmaId;
  label: string;
  n: number;
  values: number[];
  mu: number;
  sigma: number;
};

const KEY_SUMS = cipher.messages.map((m) => m.sum);
const KEY_KS = cipher.messages.map((m) => m.k);
const KEY_XS = cipher.messages
  .map((m) => (m.point ? m.point[0] : null))
  .filter((x): x is number => x !== null);
const DAY_SUMS = cipher.days.map((d) => d.sum);
const CURVE_XS = (cipher.points as number[][]).map((p) => p[0]);

export function cohortFor(grandeza: Grandeza, turma: TurmaId): Cohort {
  if (grandeza === "gematria") {
    if (turma === "dias") {
      return pack("dias", "365 títulos do plano", DAY_SUMS);
    }
    return pack("chaves", "18 mensagens-núcleo", KEY_SUMS);
  }
  if (grandeza === "k") {
    return pack("chaves", "18 escalares k", KEY_KS);
  }
  if (turma === "chaves") {
    return pack("chaves", "16 abcissas das chaves presentes", KEY_XS);
  }
  return pack("abcissas", "39 pontos afins de E(F₃₇)", CURVE_XS);
}

function pack(id: TurmaId, label: string, values: number[]): Cohort {
  return { id, label, n: values.length, values, mu: mean(values), sigma: stdevPop(values) };
}

export type RankRow = {
  id: number;
  key: string;
  raw: number | null;
  z: number | null;
  xp: number | null;
  k: number;
  point: Point | null;
  faltoso: boolean;
};

export function rankMessages(grandeza: Grandeza, turma: TurmaId, paper: CcvPaper): RankRow[] {
  const c = cohortFor(grandeza, turma);
  const rows: RankRow[] = cipher.messages.map((m) => {
    const pt = (m.point as Point | null) ?? null;
    const raw =
      grandeza === "gematria" ? m.sum : grandeza === "k" ? m.k : pt ? pt[0] : null;
    if (raw === null) {
      return { id: m.id, key: m.key, raw: null, z: null, xp: null, k: m.k, point: pt, faltoso: true };
    }
    const z = zScore(raw, c.mu, c.sigma);
    return {
      id: m.id,
      key: m.key,
      raw,
      z,
      xp: round5(ccvScore(z, paper)),
      k: m.k,
      point: pt,
      faltoso: false,
    };
  });
  rows.sort((a, b) => {
    if (a.xp === null && b.xp === null) return a.id - b.id;
    if (a.xp === null) return 1;
    if (b.xp === null) return -1;
    if (b.xp !== a.xp) return b.xp - a.xp;
    return a.id - b.id;
  });
  return rows;
}

export type LiveDecode = {
  query: string;
  letters: Array<[string, number]>;
  sum: number;
  k: number;
  point: Point | null;
  raw: number | null;
  faltoso: boolean;
  mu: number;
  sigma: number;
  n: number;
  z: number | null;
  xp: number | null;
  paper: CcvPaper;
  yp: number | null;
  yReal: number | null;
};

export function decodeWord(
  query: string,
  index: number,
  grandeza: Grandeza,
  turma: TurmaId,
  paper: CcvPaper,
): LiveDecode {
  const g = gematria(query);
  const k = scalarFrom(g.sum, index);
  const point = mul(k);
  const c = cohortFor(grandeza, turma);
  const raw =
    grandeza === "gematria" ? g.sum : grandeza === "k" ? k : point ? point[0] : null;
  const faltoso = raw === null;
  const z = faltoso || raw === null ? null : zScore(raw, c.mu, c.sigma);
  const xp = z === null ? null : round5(ccvScore(z, paper));
  const yReal = point ? realUpper(point[0]) : null;
  const yp = point && yReal && yReal !== 0 ? realDerivative(point[0], yReal) : null;
  return {
    query,
    letters: g.letters,
    sum: g.sum,
    k,
    point,
    raw,
    faltoso,
    mu: c.mu,
    sigma: c.sigma,
    n: c.n,
    z,
    xp,
    paper,
    yp,
    yReal,
  };
}

export const IEZZI = {
  vol8: "Fundamentos de Matemática Elementar, vol. 8 — limites, derivadas, integral",
  vol11: "Fundamentos de Matemática Elementar, vol. 11 — média, desvio padrão, curva normal",
  edital: "Edital do Vestibular UFC 2010, item 3.5 — padronização das notas (CCV, série 2002–2010)",
  cepe: "Resolução CEPE/UFC nº 01/2004, art. 7º — mesmos coeficientes 7,2 / 4,8 / 1,2",
} as const;

export const INTEGRAL_GABARITO = cipher.stats["integral_-1_to_4"] as number;


