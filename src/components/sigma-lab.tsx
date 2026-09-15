import { useMemo, useState } from "react";
import {
  CCV_SCALES,
  SIGMA_PRESETS,
  TWO_TURMAS,
  formatPt,
  impactAt,
  rawPdf,
  type CcvPaper,
} from "@/lib/ccv";
import { cn } from "@/lib/utils";

type Props = {
  paper: CcvPaper;
  liveX: number | null;
  liveMu: number;
  liveSigma: number;
  liveLabel: string;
};

export function SigmaLab({ paper, liveX, liveMu, liveSigma, liveLabel }: Props) {
  const [x, setX] = useState<number>(TWO_TURMAS.x);
  const [mu, setMu] = useState<number>(TWO_TURMAS.mu);
  const [sigma, setSigma] = useState<number>(TWO_TURMAS.tight);

  const scale = CCV_SCALES[paper];
  const now = useMemo(() => impactAt(x, mu, sigma, paper), [x, mu, sigma, paper]);
  const tight = useMemo(
    () => impactAt(TWO_TURMAS.x, TWO_TURMAS.mu, TWO_TURMAS.tight, paper),
    [paper],
  );
  const wide = useMemo(
    () => impactAt(TWO_TURMAS.x, TWO_TURMAS.mu, TWO_TURMAS.wide, paper),
    [paper],
  );

  const delta = x - mu;
  const story =
    Math.abs(delta) < 1e-6
      ? "Na média, z é zero qualquer que seja σ. O desvio padrão só move quem saiu do centro."
      : delta > 0
        ? sigma < 3
          ? "Turma homogênea: cada ponto acima da média vira ouro. σ pequeno infla xp."
          : "Turma espalhada: o mesmo acerto deixa de ser raro. σ grande comprime xp na direção de a."
        : sigma < 3
          ? "Turma homogênea: ficar abaixo dói. σ pequeno afunda xp."
          : "Turma espalhada: o buraco é menos fundo. σ grande puxa xp de volta para a.";

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
        Iezzi vol. 11 · impacto do σ
      </p>
      <h2 className="font-display mt-1 text-xl tracking-tight sm:text-2xl">
        Turma homogênea pune. Turma espalhada perdoa.
      </h2>
      <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
        xp = {formatPt(scale.a, 1)} + {formatPt(scale.b, 1)} · (x − μ)/σ. O eixo bruto é o que
        estica. No eixo z a campana é sempre a mesma — por isso a CCV padroniza. Derivada: ∂xp/∂σ
        = −b (x − μ)/σ².
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SIGMA_PRESETS.map((p) => {
          const on =
            p.x === x && p.mu === mu && Math.abs(p.sigma - sigma) < 0.05;
          return (
            <button
              key={p.id}
              type="button"
              title={p.hint}
              onClick={() => {
                setX(p.x);
                setMu(p.mu);
                setSigma(p.sigma);
              }}
              className={cn(
                "h-11 rounded-lg px-3 text-sm font-medium",
                on ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
              )}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={liveX === null}
          onClick={() => {
            if (liveX === null) return;
            setX(liveX);
            setMu(liveMu);
            setSigma(Math.max(0.5, liveSigma));
          }}
          className="h-11 rounded-lg bg-raised px-3 text-sm font-medium text-muted hover:text-fg disabled:opacity-40"
        >
          Usar «{liveLabel}»
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Slider
          label="escore bruto x"
          value={x}
          min={0}
          max={36}
          step={0.5}
          onChange={setX}
          display={formatPt(x, 1)}
        />
        <Slider
          label="média da turma μ"
          value={mu}
          min={0}
          max={36}
          step={0.5}
          onChange={setMu}
          display={formatPt(mu, 1)}
        />
        <Slider
          label="desvio padrão σ"
          value={sigma}
          min={0.5}
          max={10}
          step={0.1}
          onChange={setSigma}
          display={formatPt(sigma, 2)}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat k="z" v={formatPt(now.z, 3)} />
        <Stat k={`xp · ${scale.short}`} v={formatPt(now.xp, 5)} />
        <Stat k="∂xp/∂σ" v={formatPt(now.dxpDsigma, 3)} />
        <Stat k="N1" v={formatPt(now.n1, 2)} />
        <Stat k="N2" v={formatPt(now.n2, 2)} />
        <Stat k="NF" v={formatPt(now.nf, 2)} />
      </div>

      <p className="text-muted mt-3 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">{story}</p>

      <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
        <figure className="min-w-0">
          <figcaption className="text-subtle text-xs font-medium tracking-wide uppercase">
            Densidade no eixo bruto — σ estica a campana
          </figcaption>
          <DensityChart x={x} mu={mu} sigma={sigma} />
        </figure>
        <figure className="min-w-0">
          <figcaption className="text-subtle text-xs font-medium tracking-wide uppercase">
            xp(σ) → a quando σ cresce
          </figcaption>
          <XpSigmaChart x={x} mu={mu} sigma={sigma} paper={paper} a={scale.a} />
        </figure>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <TurmaCard
          title="Prova apertada · σ = 2"
          body="x = 18, μ = 12, z = 3. O 18 é três desvios acima — raro."
          z={tight.z}
          xp={tight.xp}
          n1={tight.n1}
          nf={tight.nf}
          hot
        />
        <TurmaCard
          title="Prova espalhada · σ = 6"
          body="Mesmo 18, mesmo μ. z cai para 1. A CCV devolve 20% do teto, não 60%."
          z={wide.z}
          xp={wide.xp}
          n1={wide.n1}
          nf={wide.nf}
        />
      </div>
      <p className="text-muted mt-3 font-mono text-xs leading-relaxed">
        Matemática: Δxp = {formatPt(tight.xp - wide.xp, 1)} · ΔN1 = {formatPt(tight.n1 - wide.n1, 1)}{" "}
        · ΔNF = {formatPt(tight.nf - wide.nf, 1)} · sinal de ∂xp/∂σ ={" "}
        {delta === 0 ? "0" : delta > 0 ? "−" : "+"}
      </p>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
}) {
  return (
    <label className="block min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-subtle text-xs">{label}</span>
        <span className="font-mono text-sm tabular">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-accent"
        aria-label={label}
      />
    </label>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-2 shadow-[var(--shadow-border)]">
      <p className="text-subtle text-xs">{k}</p>
      <p className="font-mono text-sm tabular">{v}</p>
    </div>
  );
}

function TurmaCard({
  title,
  body,
  z,
  xp,
  n1,
  nf,
  hot,
}: {
  title: string;
  body: string;
  z: number;
  xp: number;
  n1: number;
  nf: number;
  hot?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl px-4 py-4 shadow-[var(--shadow-border)]",
        hot ? "bg-fg text-bg" : "bg-raised",
      )}
    >
      <p className={cn("text-xs font-medium tracking-wide uppercase", hot ? "opacity-70" : "text-subtle")}>
        {title}
      </p>
      <p className={cn("mt-2 text-sm leading-relaxed", hot ? "opacity-80" : "text-muted")}>{body}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm tabular sm:grid-cols-4">
        <span>z {formatPt(z, 1)}</span>
        <span>xp {formatPt(xp, 1)}</span>
        <span>N1 {formatPt(n1, 1)}</span>
        <span>NF {formatPt(nf, 1)}</span>
      </div>
    </article>
  );
}

function DensityChart({ x, mu, sigma }: { x: number; mu: number; sigma: number }) {
  const w = 640;
  const h = 168;
  const pad = { l: 28, r: 16, t: 12, b: 28 };
  const xMin = 0;
  const xMax = 36;
  const yMax = 0.32;
  const xOf = (t: number) => pad.l + ((t - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const yOf = (p: number) => pad.t + (1 - Math.min(p, yMax) / yMax) * (h - pad.t - pad.b);

  const d: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const t = xMin + (i / 160) * (xMax - xMin);
    d.push(`${i === 0 ? "M" : "L"}${xOf(t).toFixed(1)},${yOf(rawPdf(t, mu, sigma)).toFixed(1)}`);
  }

  const band = (a: number, b: number) => {
    const lo = Math.max(xMin, a);
    const hi = Math.min(xMax, b);
    if (hi <= lo) return "";
    const pts: string[] = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const t = lo + (i / n) * (hi - lo);
      pts.push(`${xOf(t).toFixed(1)},${yOf(rawPdf(t, mu, sigma)).toFixed(1)}`);
    }
    return `${xOf(lo).toFixed(1)},${yOf(0).toFixed(1)} ${pts.join(" ")} ${xOf(hi).toFixed(1)},${yOf(0).toFixed(1)}`;
  };

  const xc = Math.max(xMin, Math.min(xMax, x));
  const mc = Math.max(xMin, Math.min(xMax, mu));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-40 w-full" role="img" aria-label="densidade no eixo bruto">
      <polygon points={band(mu - 2 * sigma, mu + 2 * sigma)} className="fill-accent/15" />
      <polygon points={band(mu - sigma, mu + sigma)} className="fill-accent/25" />
      <path d={d.join(" ")} fill="none" className="stroke-fg" strokeWidth="1.8" />
      <line
        x1={xOf(mc)}
        x2={xOf(mc)}
        y1={yOf(0)}
        y2={yOf(rawPdf(mu, mu, sigma))}
        className="stroke-fg"
        strokeOpacity="0.3"
      />
      <line
        x1={xOf(xc)}
        x2={xOf(xc)}
        y1={yOf(0)}
        y2={yOf(rawPdf(x, mu, sigma))}
        className="stroke-accent"
        strokeWidth="2"
      />
      <text x={xOf(mc)} y={h - 8} textAnchor="middle" className="fill-subtle" fontSize="11">
        μ
      </text>
      <text x={xOf(xc)} y={h - 8} textAnchor={xc > 30 ? "end" : "middle"} className="fill-accent" fontSize="11">
        x
      </text>
    </svg>
  );
}

function XpSigmaChart({
  x,
  mu,
  sigma,
  paper,
  a,
}: {
  x: number;
  mu: number;
  sigma: number;
  paper: CcvPaper;
  a: number;
}) {
  const w = 640;
  const h = 168;
  const pad = { l: 40, r: 16, t: 14, b: 28 };
  const sMin = 0.5;
  const sMax = 10;
  const samples: Array<[number, number]> = [];
  for (let i = 0; i <= 80; i++) {
    const s = sMin + (i / 80) * (sMax - sMin);
    samples.push([s, impactAt(x, mu, s, paper).xp]);
  }
  const ys = samples.map((p) => p[1]);
  const yLo = Math.min(a - 8, ...ys);
  const yHi = Math.max(a + 8, ...ys);
  const xOf = (s: number) => pad.l + ((s - sMin) / (sMax - sMin)) * (w - pad.l - pad.r);
  const yOf = (v: number) => pad.t + ((yHi - v) / (yHi - yLo)) * (h - pad.t - pad.b);

  const d = samples
    .map(([s, v], i) => `${i === 0 ? "M" : "L"}${xOf(s).toFixed(1)},${yOf(v).toFixed(1)}`)
    .join(" ");

  const sc = Math.max(sMin, Math.min(sMax, sigma));
  const yp = impactAt(x, mu, sigma, paper).xp;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-40 w-full" role="img" aria-label="xp em função de sigma">
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={yOf(a)}
        y2={yOf(a)}
        className="stroke-fg"
        strokeOpacity="0.25"
        strokeDasharray="4 4"
      />
      <path d={d} fill="none" className="stroke-accent" strokeWidth="2" />
      <circle cx={xOf(sc)} cy={yOf(yp)} r="4.5" className="fill-fg stroke-accent" strokeWidth="1.5" />
      <text x={pad.l} y={yOf(a) - 6} className="fill-subtle" fontSize="11">
        a = {formatPt(a, 0)}
      </text>
      <text x={xOf(sMin)} y={h - 8} className="fill-subtle" fontSize="11">
        0,5
      </text>
      <text x={xOf(sMax) - 8} y={h - 8} textAnchor="end" className="fill-subtle" fontSize="11">
        σ
      </text>
    </svg>
  );
}
