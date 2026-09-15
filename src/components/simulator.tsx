import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DIE_FACES,
  SPEED,
  TRIAL_PRESETS,
  chiSquare,
  insightFor,
  labelsFor,
  rollOnce,
  theoreticalFor,
  type LabMode,
  type SpeedId,
} from "@/lib/probability";
import { cn, formatNum, formatPct } from "@/lib/utils";

type HistPt = { n: number; p: number };

export function Simulator() {
  const [mode, setMode] = useState<LabMode>("coin");
  const [faces, setFaces] = useState(6);
  const [pHeads, setPHeads] = useState(0.5);
  const [nTarget, setNTarget] = useState(100);
  const [speed, setSpeed] = useState<SpeedId>(2);
  const [running, setRunning] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0]);
  const [done, setDone] = useState(0);
  const [lastFace, setLastFace] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<HistPt[]>([]);
  const [coinTurns, setCoinTurns] = useState(0);

  const abort = useRef(false);
  const runningRef = useRef(false);

  const nFaces = mode === "coin" ? 2 : faces;
  const labels = useMemo(() => labelsFor(mode, nFaces), [mode, nFaces]);
  const theoretical = useMemo(
    () => theoreticalFor(mode, nFaces, pHeads),
    [mode, nFaces, pHeads],
  );

  function resetCounts(nextFaces = nFaces) {
    abort.current = true;
    runningRef.current = false;
    setRunning(false);
    setCounts(Array.from({ length: nextFaces }, () => 0));
    setDone(0);
    setLastFace(null);
    setSpinning(false);
    setHistory([]);
  }

  function changeMode(next: LabMode) {
    setMode(next);
    resetCounts(next === "coin" ? 2 : faces);
  }

  function changeFaces(next: number) {
    setFaces(next);
    if (mode === "die") resetCounts(next);
  }

  useEffect(() => {
    abort.current = false;
    return () => {
      abort.current = true;
    };
  }, []);

  async function run(total: number) {
    if (runningRef.current) return;
    abort.current = false;
    runningRef.current = true;
    setRunning(true);

    const cfg = SPEED[speed];
    let localCounts = counts.slice();
    if (localCounts.length !== nFaces) {
      localCounts = Array.from({ length: nFaces }, () => 0);
    }
    let localDone = done;
    const remaining = Math.max(0, total - localDone);
    const hist: HistPt[] = history.slice();
    let last = lastFace;
    let turns = coinTurns;

    const start = localDone;
    const end = start + remaining;
    let i = 0;

    while (i < remaining && !abort.current) {
      const batch = Math.min(cfg.batch, remaining - i);
      for (let b = 0; b < batch; b++) {
        const face = rollOnce(mode, nFaces, pHeads);
        localCounts[face] += 1;
        localDone += 1;
        last = face;
        if (mode === "coin" && cfg.batch === 1) turns += 1;
      }
      i += batch;

      const sampleEvery = Math.max(1, Math.floor(end / 160));
      if (localDone === end || localDone % sampleEvery === 0 || cfg.batch === 1) {
        hist.push({ n: localDone, p: localCounts[0] / localDone });
      }

      const shouldPaint = cfg.delayMs > 0 || i % Math.max(batch, 80) === 0 || i >= remaining;
      if (shouldPaint) {
        if (cfg.delayMs >= 100) {
          setSpinning(true);
          setCoinTurns(turns);
          await wait(Math.min(cfg.delayMs * 0.55, 240));
          if (abort.current) break;
        }
        setCounts(localCounts.slice());
        setDone(localDone);
        setLastFace(last);
        setSpinning(false);
        setHistory(hist.slice());
        setCoinTurns(turns);
        if (cfg.delayMs > 0) await wait(cfg.delayMs);
        else await frame();
      }
    }

    setCounts(localCounts.slice());
    setDone(localDone);
    setLastFace(last);
    setHistory(hist.slice());
    setSpinning(false);
    setRunning(false);
    runningRef.current = false;
  }

  function stepOnce() {
    if (runningRef.current) return;
    const face = rollOnce(mode, nFaces, pHeads);
    const next = counts.length === nFaces ? counts.slice() : Array.from({ length: nFaces }, () => 0);
    next[face] += 1;
    const n = done + 1;
    setCounts(next);
    setDone(n);
    setLastFace(face);
    setCoinTurns((t) => t + 1);
    setHistory((h) => [...h, { n, p: next[0] / n }]);
  }

  const observed = counts.map((c) => (done ? c / done : 0));
  const maxP = Math.max(0.5, ...theoretical, ...observed, 0.05);
  const maxErr = observed.reduce((m, p, i) => Math.max(m, Math.abs(p - theoretical[i])), 0);
  const chi = chiSquare(counts, theoretical, done);
  const insight = insightFor(done, maxErr, mode === "coin" && Math.abs(pHeads - 0.5) > 0.001);

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,22.5rem)_minmax(0,1fr)] lg:items-start">
      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Experimento</p>
        <h1 className="font-display mt-1 text-3xl leading-tight tracking-tight">Ver para crer</h1>
        <p className="text-muted mt-2 text-sm">
          Lance uma moeda ou um dado. O histograma cresce ao vivo. A linha clara é a probabilidade teórica.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ModeChip current={mode === "coin"} onClick={() => changeMode("coin")}>
            Moeda
          </ModeChip>
          <ModeChip current={mode === "die"} onClick={() => changeMode("die")}>
            Dado
          </ModeChip>
        </div>

        {mode === "die" && (
          <div className="mt-4">
            <p className="text-subtle mb-2 text-xs font-medium tracking-wide uppercase">Faces</p>
            <div className="flex flex-wrap gap-1.5">
              {DIE_FACES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => changeFaces(n)}
                  className={cn(
                    "h-10 min-w-10 rounded-lg px-3 text-sm font-medium tabular",
                    faces === n ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  d{n}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "coin" && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-subtle text-xs font-medium tracking-wide uppercase">P(cara)</p>
              <span className="text-accent font-mono text-sm tabular">{formatPct(pHeads, 0)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={pHeads}
              onChange={(e) => {
                setPHeads(Number(e.target.value));
                resetCounts(2);
              }}
              className="h-11 w-full accent-accent"
              aria-label="Probabilidade de cara"
            />
            <p className="text-subtle mt-1 text-xs">
              {Math.abs(pHeads - 0.5) < 0.001
                ? "Moeda honesta. Cada face deveria aparecer metade das vezes."
                : "Moeda enviesada. Use isso para treinar o olho contra o “parece justo”."}
            </p>
          </div>
        )}

        <div className="mt-5">
          <p className="text-subtle mb-2 text-xs font-medium tracking-wide uppercase">Tentativas</p>
          <div className="flex flex-wrap gap-1.5">
            {TRIAL_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNTarget(n)}
                className={cn(
                  "h-10 rounded-lg px-3 text-sm font-medium tabular",
                  nTarget === n ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {formatNum(n)}
              </button>
            ))}
          </div>
          <label className="mt-3 flex h-11 items-center gap-3 rounded-lg bg-raised px-3 shadow-[var(--shadow-border)]">
            <span className="text-subtle text-xs">N</span>
            <input
              type="number"
              min={1}
              max={50000}
              value={nTarget}
              onChange={(e) => setNTarget(Math.min(50000, Math.max(1, Number(e.target.value) || 1)))}
              className="h-11 w-full bg-transparent font-mono text-sm tabular outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-subtle mb-2 text-xs font-medium tracking-wide uppercase">Velocidade</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {([1, 2, 3, 4] as SpeedId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSpeed(id)}
                className={cn(
                  "h-11 rounded-lg px-2 text-xs font-medium",
                  speed === id ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {SPEED[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!running ? (
            <Button onClick={() => void run(nTarget)} className="min-w-32">
              <Play className="size-4" />
              Executar
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                abort.current = true;
              }}
              className="min-w-32"
            >
              <Pause className="size-4" />
              Pausar
            </Button>
          )}
          <Button variant="ghost" onClick={stepOnce} disabled={running}>
            <StepForward className="size-4" />
            Um a um
          </Button>
          <Button variant="quiet" onClick={() => resetCounts()} aria-label="Reiniciar">
            <RotateCcw className="size-4" />
            Reiniciar
          </Button>
        </div>

        <div className="mt-6 grid place-items-center py-4">
          {mode === "coin" ? (
            <CoinView
              face={lastFace}
              spinning={spinning || running}
              turns={coinTurns}
            />
          ) : (
            <DieView
              face={lastFace}
              faces={nFaces}
              rolling={spinning || (running && SPEED[speed].delayMs >= 80)}
            />
          )}
          <p className="text-muted mt-3 font-mono text-xs tabular">
            {done === 0 ? "aguardando o primeiro lançamento" : `${formatNum(done)} / ${formatNum(nTarget)}`}
          </p>
        </div>

        <p className="text-muted mt-2 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">{insight}</p>
      </section>

      <section className="min-w-0 space-y-4">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Histograma ao vivo</p>
              <h2 className="font-display mt-1 text-xl tracking-tight">Observado × teórico</h2>
            </div>
            <p className="text-muted text-xs">
              barra = frequência · traço = {mode === "coin" ? "P" : "1/" + nFaces}
            </p>
          </div>
          <div className="mt-4 flex h-56 items-end gap-1.5 overflow-x-auto sm:gap-2">
            {labels.map((label, i) => {
              const obs = observed[i] ?? 0;
              const theo = theoretical[i] ?? 0;
              return (
                <div key={label} className="flex h-full min-w-8 flex-1 flex-col justify-end">
                  <div className="relative min-h-0 flex-1">
                    <div
                      className="bar-fill absolute bottom-0 left-0.5 right-0.5 rounded-t-sm bg-accent"
                      style={{ height: `${(obs / maxP) * 100}%` }}
                    />
                    <div
                      className="theo-mark absolute left-0 right-0 h-0.5 bg-theo"
                      style={{ bottom: `${(theo / maxP) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-muted font-mono text-[11px] tabular">{counts[i] ?? 0}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Frequência relativa</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">
            {mode === "coin" ? "Cara ao longo de N" : "Face 1 ao longo de N"}
          </h2>
          <FrequencyChart
            history={history}
            theoretical={theoretical[0]}
            label={labels[0]}
          />
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Comparação</p>
          <div className="mt-3 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-subtle text-xs tracking-wide uppercase">
                <tr>
                  <th className="pb-2 font-medium">Face</th>
                  <th className="pb-2 font-medium">Contagem</th>
                  <th className="pb-2 font-medium">Observado</th>
                  <th className="pb-2 font-medium">Teórico</th>
                  <th className="pb-2 font-medium">Erro</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((label, i) => {
                  const err = Math.abs((observed[i] ?? 0) - theoretical[i]);
                  return (
                    <tr key={label} className="border-t border-border">
                      <td className="py-2.5 font-medium">{label}</td>
                      <td className="py-2.5 font-mono tabular">{counts[i] ?? 0}</td>
                      <td className="py-2.5 font-mono tabular">{formatPct(observed[i] ?? 0)}</td>
                      <td className="text-theo py-2.5 font-mono tabular">{formatPct(theoretical[i])}</td>
                      <td className="py-2.5 font-mono tabular">{formatPct(err)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-muted mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Stat k="N" v={formatNum(done)} />
            <Stat k="erro máx." v={formatPct(maxErr)} />
            <Stat k={"χ² (ajuste)"} v={done ? chi.toFixed(2) : "—"} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-2">
      <p className="text-subtle text-xs">{k}</p>
      <p className="font-mono text-base tabular">{v}</p>
    </div>
  );
}

function ModeChip({
  current,
  onClick,
  children,
}: {
  current: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-lg text-sm font-medium",
        current ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function CoinView({
  face,
  spinning,
  turns,
}: {
  face: number | null;
  spinning: boolean;
  turns: number;
}) {
  const landed = face === 1 ? 180 : 0;
  const extra = turns * 360;
  const rot = extra + landed + (spinning ? 180 : 0);
  return (
    <div className="coin-scene" aria-label={face === 1 ? "coroa" : face === 0 ? "cara" : "moeda"}>
      <div className="coin" style={{ transform: `rotateY(${rot}deg)` }}>
        <div className="coin-face">
          <ProfileMark />
        </div>
        <div className="coin-face back">
          <CrownMark />
        </div>
      </div>
    </div>
  );
}

function ProfileMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-16 text-[#0c0e10]" aria-hidden>
      <circle cx="32" cy="24" r="10" fill="currentColor" />
      <path d="M16 50c4-12 28-12 32 0" fill="currentColor" />
    </svg>
  );
}

function CrownMark() {
  return (
    <svg viewBox="0 0 64 64" className="size-16 text-[#0c0e10]" aria-hidden>
      <path d="M10 44 L14 20 L26 32 L32 14 L38 32 L50 20 L54 44 Z" fill="currentColor" />
      <rect x="12" y="44" width="40" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function DieView({
  face,
  faces,
  rolling,
}: {
  face: number | null;
  faces: number;
  rolling: boolean;
}) {
  const shown = face === null ? 1 : face + 1;
  return (
    <div className={cn("die-face", rolling && "rolling")} aria-label={`dado ${shown}`}>
      {faces === 6 ? (
        <Pips n={shown} />
      ) : (
        <span className="font-display text-6xl tabular leading-none">{shown}</span>
      )}
    </div>
  );
}

function Pips({ n }: { n: number }) {
  const map: Record<number, Array<[number, number]>> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 26], [28, 50], [28, 74], [72, 26], [72, 50], [72, 74]],
  };
  const pts = map[n] ?? map[1];
  return (
    <svg viewBox="0 0 100 100" className="size-24" aria-hidden>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="currentColor" />
      ))}
    </svg>
  );
}

function FrequencyChart({
  history,
  theoretical,
  label,
}: {
  history: HistPt[];
  theoretical: number;
  label: string;
}) {
  const w = 640;
  const h = 180;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const nMax = Math.max(1, history.at(-1)?.n ?? 1);
  const yOf = (p: number) => pad.t + (1 - p) * innerH;
  const xOf = (n: number) => pad.l + (n / nMax) * innerW;
  const d =
    history.length > 1
      ? history.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.n).toFixed(1)},${yOf(pt.p).toFixed(1)}`).join(" ")
      : "";
  const theoY = yOf(theoretical);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-44 w-full" role="img" aria-label={`frequência de ${label}`}>
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="currentColor" strokeOpacity="0.16" />
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="currentColor" strokeOpacity="0.16" />
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={theoY}
        y2={theoY}
        className="stroke-theo"
        strokeDasharray="4 4"
        strokeWidth="1.4"
      />
      {d && (
        <path
          d={d}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <text x={pad.l + 6} y={theoY - 6} className="fill-theo" fontSize="11">
        teórico {formatPct(theoretical, 0)}
      </text>
      <text x={pad.l} y={h - 8} className="fill-subtle" fontSize="11">
        1
      </text>
      <text x={w - pad.r - 28} y={h - 8} className="fill-subtle" fontSize="11">
        N
      </text>
    </svg>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function frame() {
  return new Promise<void>((r) => requestAnimationFrame(() => r()));
}
