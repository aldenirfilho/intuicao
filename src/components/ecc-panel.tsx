import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import cipher from "@/lib/cipher-data.json";
import {
  CURVE,
  formatPoint,
  gematria,
  mul,
  realDerivative,
  realUpper,
  scalarFrom,
  type Point,
} from "@/lib/ecc";
import { buttonVariants } from "@/components/ui/button";
import { CCV_SCALES, cohortFor, formatPt, zScore, ccvScore, round5 } from "@/lib/ccv";
import { cn, formatNum } from "@/lib/utils";

type Msg = (typeof cipher.messages)[number];
type Day = (typeof cipher.days)[number];

export function EccPanel() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("DEUS");
  const [dayN, setDayN] = useState(1);
  const msg = cipher.messages[selected] as Msg;
  const day = cipher.days.find((d) => d.day === dayN) as Day | undefined;

  const live = useMemo(() => {
    const g = gematria(query);
    const k = scalarFrom(g.sum, 1);
    const turma = cohortFor("gematria", "chaves");
    const z = zScore(g.sum, turma.mu, turma.sigma);
    return { ...g, k, point: mul(k), z, xp: round5(ccvScore(z, "matematica")), turma };
  }, [query]);

  const yReal = realUpper(4);
  const yp = realDerivative(4, yReal);
  const mat = CCV_SCALES.matematica;

  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Cifra elíptica pedagógica</p>
        <h1 className="font-display mt-1 text-3xl tracking-tight sm:text-4xl">Constelação Sem Jaula</h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          As 18 mensagens-núcleo do plano 365 viram pontos na curva{" "}
          <span className="text-fg font-mono">y² = x³ + 2x + 3 (mod 37)</span>. Quem lê a Almeida recalcula k à
          mão. A CCV da UFC (2002–2010) lê o mesmo número como z-escore. Não é criptografia de produção — é um
          caderno que fecha.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <figure className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <img
            src="/cifra-enigmatica.png"
            alt="Constelação de 18 pontos kG sobre a curva elíptica, com a Cruz marcada no infinito"
            className="aspect-[16/10] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
          <figcaption className="text-muted px-4 py-3 text-xs">
            Soma das gematrias = {cipher.stats.sum_of_key_gematria} · Σk = {cipher.stats.sum_of_k} · σx ={" "}
            {cipher.stats.sd_x.toFixed(3)}
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <img
            src="/cifra-enigma-art.jpg"
            alt="Gravura enigmática da curva elíptica como rio de luz sobre papel carvão"
            className="aspect-[16/10] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
          <figcaption className="text-muted px-4 py-3 text-xs">
            Imagem enigmática gerada das combinações aritméticas — o mapa sem alfabeto.
          </figcaption>
        </figure>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Fact k="Curva Almeida" v="y² ≡ x³ + 2x + 3" />
        <Fact k="Gerador G" v="(4, 1) · ordem 20" />
        <Fact k="Corpo" v="F₃₇  ·  |E| = 40" />
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Protocolo</p>
            <h2 className="font-display mt-1 text-xl tracking-tight">k = (soma + índice) mod 20</h2>
          </div>
          <a
            href="/downloads/Biblia_365_Cifra_Eliptica_TEMI360.docx"
            download
            className={buttonVariants({ variant: "accent" })}
          >
            <Download className="size-4" />
            Word TEMI 360
          </a>
        </div>
        <ol className="text-muted mt-4 grid gap-2 text-sm leading-relaxed sm:grid-cols-2">
          <li>1. Leia a chave na Almeida (Deus, Cruz, Graça…).</li>
          <li>2. Some A=1 … Z=26, ignore acentos.</li>
          <li>3. Some o índice. Reduza módulo 20 (resto 0 → 20).</li>
          <li>4. Confira kG na tabela. A Cruz cai no infinito.</li>
        </ol>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">18 mensagens</p>
        <h2 className="font-display mt-1 text-xl tracking-tight">Clique para ver o selo</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cipher.messages.map((m, i) => {
            const active = i === selected;
            const pt = m.point as number[] | null;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "min-h-20 rounded-lg px-3 py-3 text-left shadow-[var(--shadow-border)]",
                  active ? "bg-fg text-bg" : "bg-raised hover:bg-raised/80",
                )}
              >
                <p className="text-xs font-medium opacity-70">{String(m.id).padStart(2, "0")}</p>
                <p className="font-display text-lg leading-tight">{m.key}</p>
                <p className={cn("font-mono text-xs tabular", active ? "opacity-70" : "text-muted")}>
                  k={m.k} · {pt ? `(${pt[0]}, ${pt[1]})` : "O"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div>
            <p className="text-fg font-medium">{msg.key}</p>
            <p className="text-muted mt-1 text-sm">{msg.idea}</p>
            <p className="text-subtle mt-2 font-mono text-xs">{msg.ref}</p>
            <p className="mt-3 font-mono text-sm tabular">
              {msg.letters.map(([ch, v]) => `${ch}=${v}`).join(" + ")} = {msg.sum}
            </p>
            <p className="text-muted mt-1 font-mono text-sm">
              k = ({msg.sum} + {msg.id}) mod 20 = {msg.k} → {formatPoint(msg.point as Point | null)}
            </p>
          </div>
          <CurveMini highlight={msg.point as number[] | null} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Calculadora</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">Decifre uma palavra</h2>
          <label className="mt-4 block">
            <span className="text-subtle text-xs">Palavra-chave</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg bg-raised px-3 font-mono text-sm uppercase shadow-[var(--shadow-border)] outline-none"
            />
          </label>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Fact k="soma" v={String(live.sum)} />
            <Fact k="k" v={String(live.k)} />
            <Fact k="ponto" v={formatPoint(live.point)} />
            <Fact k="z CCV" v={formatPt(live.z, 4)} />
            <Fact k={`xp ${mat.short}`} v={formatPt(live.xp, 5)} />
            <Fact k="turma μ±σ" v={`${formatPt(live.turma.mu, 1)} ± ${formatPt(live.turma.sigma, 1)}`} />
          </dl>
          <p className="text-muted mt-3 font-mono text-xs leading-relaxed">
            {live.letters.length === 0
              ? "Digite uma chave. A=1 … Z=26."
              : live.letters.map(([ch, v]) => `${ch}=${v}`).join(" + ")}
          </p>
          <p className="text-muted mt-2 text-xs leading-relaxed">
            xp = 24 + 4,8 z, Matemática da 1ª etapa CCV/UFC 2010. Turma = 18 chaves.
          </p>
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Dia do plano</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">Selar um título</h2>
          <label className="mt-4 block">
            <span className="text-subtle text-xs">Dia 1–365</span>
            <input
              type="number"
              min={1}
              max={365}
              value={dayN}
              onChange={(e) => setDayN(Math.min(365, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1 h-11 w-full rounded-lg bg-raised px-3 font-mono text-sm tabular shadow-[var(--shadow-border)] outline-none"
            />
          </label>
          {day && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-display text-lg leading-tight">{day.title}</p>
              <p className="text-muted">{day.reading}</p>
              {day.wisdom ? <p className="text-fg/90">{day.wisdom}</p> : null}
              <p className="font-mono text-xs tabular">
                soma {day.sum} · k {day.k} · {formatPoint(day.point as Point | null)}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Vestibular CCV</p>
            <h2 className="font-display mt-1 text-xl tracking-tight">Derivada, integral, desvio padrão</h2>
          </div>
          <Link to="/ccv" className={buttonVariants({ variant: "quiet" })}>
            Abrir caderno CCV
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Fact k="y'(4) nos reais" v={(5 / Math.sqrt(3)).toFixed(4)} />
          <Fact k="∫ √(x³+2x+3) dx  [-1,4]" v={cipher.stats["integral_-1_to_4"].toFixed(4)} />
          <Fact k="σx dos 39 pontos" v={cipher.stats.sd_x.toFixed(4)} />
        </div>
        <div className="text-muted mt-4 space-y-2 text-sm leading-relaxed">
          <p>
            Implícita: 2y y' = 3x² + 2, logo y' = (3x² + 2)/(2y). Em x = 4, y = 5√3 ≈ {yReal.toFixed(4)}, portanto
            y' = 5/√3 ≈ {yp.toFixed(4)}. A mesma fórmula de λ da duplicação — outro corpo. Iezzi vol. 8.
          </p>
          <p>
            A integral de −1 a 4 é elíptica (daí o nome da curva). Valor numérico por trapézios:{" "}
            {cipher.stats["integral_-1_to_4"].toFixed(4)}. Arco ≈ {cipher.stats["arc_-1_to_4"].toFixed(4)}.
          </p>
          <p>
            μx = {cipher.stats.mu_x.toFixed(4)} · σx = {cipher.stats.sd_x.toFixed(4)} · μy ={" "}
            {cipher.stats.mu_y.toFixed(4)} · σy = {cipher.stats.sd_y.toFixed(4)} · n = {formatNum(cipher.curve.nAffine)}.
            A CCV padronizava xp = 24 + 4,8 (x − μ)/σ na Matemática da 1ª etapa.
          </p>
        </div>
      </section>

      <p className="text-subtle text-xs">
        Curva minúscula de propósito. Wikipedia: criptografia de curva elíptica. Não use p = {CURVE.p} para proteger
        dado real.
      </p>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-3 shadow-[var(--shadow-border)]">
      <p className="text-subtle text-xs">{k}</p>
      <p className="mt-1 font-mono text-sm tabular">{v}</p>
    </div>
  );
}

function CurveMini({ highlight }: { highlight: number[] | null }) {
  const w = 240;
  const h = 180;
  const pts = cipher.points as number[][];
  const xOf = (x: number) => 16 + (x / 36) * (w - 32);
  const yOf = (y: number) => h - 16 - (y / 36) * (h - 32);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-lg bg-bg" aria-label="pontos da curva em F37">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={xOf(x)} cy={yOf(y)} r="2.2" className="fill-accent/55" />
      ))}
      {highlight ? (
        <circle
          cx={xOf(highlight[0])}
          cy={yOf(highlight[1])}
          r="5"
          className="fill-fg stroke-accent"
          strokeWidth="1.5"
        />
      ) : (
        <text x={w / 2} y={20} textAnchor="middle" className="fill-fg" fontSize="11">
          O · infinito
        </text>
      )}
      <text x="8" y="14" className="fill-subtle" fontSize="9">
        E(F₃₇) · {pts.length} pontos
      </text>
    </svg>
  );
}
