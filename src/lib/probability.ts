export type LabMode = "coin" | "die";
export type SpeedId = 1 | 2 | 3 | 4;

export const DIE_FACES = [4, 6, 8, 10, 12, 20] as const;
export const TRIAL_PRESETS = [10, 50, 100, 500, 1000, 5000, 10000] as const;

export const SPEED: Record<
  SpeedId,
  { label: string; hint: string; delayMs: number; batch: number }
> = {
  1: { label: "Lenta", hint: "um a um, com animação", delayMs: 420, batch: 1 },
  2: { label: "Média", hint: "dá para acompanhar", delayMs: 120, batch: 1 },
  3: { label: "Rápida", hint: "o histograma vive", delayMs: 16, batch: 8 },
  4: { label: "Instantânea", hint: "lei dos grandes números", delayMs: 0, batch: 400 },
};

export function labelsFor(mode: LabMode, faces: number): string[] {
  if (mode === "coin") return ["Cara", "Coroa"];
  return Array.from({ length: faces }, (_, i) => String(i + 1));
}

export function theoreticalFor(mode: LabMode, faces: number, pHeads: number): number[] {
  if (mode === "coin") return [pHeads, 1 - pHeads];
  const p = 1 / faces;
  return Array.from({ length: faces }, () => p);
}

export function rollOnce(
  mode: LabMode,
  faces: number,
  pHeads: number,
  rng: () => number = Math.random,
): number {
  if (mode === "coin") return rng() < pHeads ? 0 : 1;
  return Math.floor(rng() * faces);
}

export function chiSquare(observed: number[], expected: number[], n: number): number {
  if (n === 0) return 0;
  let s = 0;
  for (let i = 0; i < observed.length; i++) {
    const e = expected[i] * n;
    if (e <= 0) continue;
    const d = observed[i] - e;
    s += (d * d) / e;
  }
  return s;
}

export function insightFor(n: number, maxErr: number, biased: boolean): string {
  if (n === 0) {
    return biased
      ? "A moeda não é honesta. O alvo teórico já não é metade."
      : "Lance pouco para ver o acaso. Lance muito para ver a lei.";
  }
  if (n < 30) {
    return "Com poucos lançamentos o acaso desenha qualquer coisa. Ainda não decida.";
  }
  if (n < 200) {
    return maxErr > 0.12
      ? "O histograma ainda treme. Isso é normal — a amostra é pequena."
      : "Já se parece com o modelo, mas uma sequência teimosa ainda pode enganar.";
  }
  if (n < 1500) {
    return "A frequência relativa começa a abraçar a probabilidade teórica.";
  }
  return maxErr < 0.03
    ? "Lei dos grandes números: o ruído não desaparece — ele fica proporcionalmente menor."
    : "Mesmo com N grande, um viés ou uma sequência extrema ainda aparece. Compare as barras.";
}
