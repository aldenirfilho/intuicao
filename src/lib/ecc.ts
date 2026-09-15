export type Point = readonly [number, number];

export const CURVE = {
  p: 37,
  a: 2,
  b: 3,
  G: [4, 1] as Point,
  order: 20,
} as const;

function mod(n: number, m: number = CURVE.p): number {
  return ((n % m) + m) % m;
}

function inv(a: number, m: number = CURVE.p): number {
  let t = 0;
  let newT = 1;
  let r = m;
  let newR = mod(a, m);
  while (newR !== 0) {
    const q = Math.floor(r / newR);
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  if (r > 1) throw new Error("sem inverso");
  return mod(t, m);
}

export function add(p: Point | null, q: Point | null): Point | null {
  if (!p) return q;
  if (!q) return p;
  const [x1, y1] = p;
  const [x2, y2] = q;
  if (x1 === x2 && mod(y1 + y2) === 0) return null;
  let lambda: number;
  if (x1 === x2 && y1 === y2) {
    if (y1 === 0) return null;
    lambda = mod((3 * x1 * x1 + CURVE.a) * inv(2 * y1));
  } else {
    lambda = mod((y2 - y1) * inv(mod(x2 - x1)));
  }
  const x3 = mod(lambda * lambda - x1 - x2);
  const y3 = mod(lambda * (x1 - x3) - y1);
  return [x3, y3];
}

export function mul(k: number, pt: Point | null = CURVE.G): Point | null {
  let kk = ((k % CURVE.order) + CURVE.order) % CURVE.order;
  if (kk === 0) return null;
  let r: Point | null = null;
  let base = pt;
  while (kk > 0) {
    if (kk & 1) r = add(r, base);
    base = add(base, base);
    kk >>= 1;
  }
  return r;
}

export function gematria(raw: string): { sum: number; letters: Array<[string, number]> } {
  const s = raw.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
  const letters: Array<[string, number]> = [];
  let sum = 0;
  for (const ch of s) {
    if (ch >= "A" && ch <= "Z") {
      const v = ch.charCodeAt(0) - 64;
      letters.push([ch, v]);
      sum += v;
    }
  }
  return { sum, letters };
}

export function scalarFrom(sum: number, index: number): number {
  const k = (sum + index) % CURVE.order;
  return k === 0 ? CURVE.order : k;
}

export function formatPoint(pt: Point | null): string {
  return pt ? `(${pt[0]}, ${pt[1]})` : "O (infinito)";
}

export function realUpper(x: number): number {
  const v = x ** 3 + 2 * x + 3;
  return v >= 0 ? Math.sqrt(v) : 0;
}

export function realDerivative(x: number, y: number): number {
  return (3 * x * x + 2) / (2 * y);
}
