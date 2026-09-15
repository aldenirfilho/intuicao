import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  PATTERNS,
  SISU_AREAS,
  SISU_MEDICINA,
  TRI_D,
  TRI_ITEMS,
  eapTheta,
  enemScale,
  itemInfo,
  sisuMean,
  tScore500,
  threePl,
  type AreaId,
} from "@/lib/tri";
import { formatPt } from "@/lib/ccv";
import { cn } from "@/lib/utils";

const AREA_IDS = Object.keys(SISU_AREAS) as AreaId[];

export function TriPanel() {
  const [u, setU] = useState<boolean[]>([...PATTERNS[0].u]);
  const [notes, setNotes] = useState<Record<AreaId, number>>({
    lc: 640,
    ch: 620,
    cn: 710,
    mt: 680,
    red: 860,
  });

  const est = useMemo(() => eapTheta(u), [u]);
  const nota = enemScale(est.theta);
  const acertos = u.filter(Boolean).length;
  const sisu = sisuMean(notes, SISU_MEDICINA);
  const tct = tScore500(acertos, 2.5, 1.2);

  return (
    <div className="min-w-0 space-y-6">
      <header className="max-w-2xl">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
          Depois de 2014 · ENEM / SiSU / particulares
        </p>
        <h1 className="font-display mt-1 text-3xl tracking-tight sm:text-4xl">
          Ninguém usa curva elíptica para nota
        </h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          A cifra y² = x³ + 2x + 3 é o nosso selo pedagógico. O INEP, o SiSU e as particulares não
          decifram ECC. O código vivo é outro: logística de 3 parâmetros, um integral (EAP) e um σ
          de âncora — a escala (500, 100).
        </p>
      </header>

      <section className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-subtle text-xs tracking-wide uppercase">
            <tr>
              <th className="pb-2 font-medium">Onde</th>
              <th className="pb-2 font-medium">Código</th>
              <th className="pb-2 font-medium">Fórmula</th>
              <th className="pb-2 font-medium">σ / integral / derivada</th>
            </tr>
          </thead>
          <tbody>
            <Row
              where="ENEM objetivas"
              code="TRI 3PL"
              formula="P = c + (1−c)/(1+e^{−Da(θ−b)})"
              note="EAP = ∫ θ Lφ dθ / ∫ Lφ dθ · nota = 500+100θ"
            />
            <Row
              where="ENEM redação"
              code="TCT"
              formula="5 competências × 200"
              note="0 a 1000. Sem TRI, sem σ."
            />
            <Row
              where="SiSU (UFC 2011–hoje)"
              code="média ponderada"
              formula="Σ wᵢ nᵢ / Σ wᵢ"
              note="nᵢ já veio da TRI. Pesos por curso."
            />
            <Row
              where="Unicamp / UFRGS"
              code="T-score"
              formula="500 + 100 (x−μ)/σ"
              note="Herdeiro da CCV. σ explícito, sem logística."
            />
            <Row
              where="Particulares"
              code="TCT ou ENEM"
              formula="soma de acertos · ou nota ENEM"
              note="PUC-SP pondera áreas. Mackenzie aceita ENEM cru."
            />
            <Row
              where="Cifra deste app"
              code="ECC + CCV"
              formula="kG em E(F₃₇), xp = a+bz"
              note="Didático. Nenhuma banca aplica."
            />
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Itens</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">Quais, não quantos</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            D = {formatPt(TRI_D, 1)}. Marque o gabarito. Dois candidatos com 3 acertos saem com
            notas diferentes — a TRI lê o padrão, não a conta.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setU([...p.u])}
                className={cn(
                  "h-11 rounded-lg px-3 text-sm font-medium",
                  u.every((v, i) => v === p.u[i])
                    ? "bg-fg text-bg"
                    : "bg-raised text-muted hover:text-fg",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {TRI_ITEMS.map((it, i) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() =>
                    setU((prev) => {
                      const next = [...prev];
                      next[i] = !next[i];
                      return next;
                    })
                  }
                  className={cn(
                    "flex h-14 w-full min-w-0 items-center justify-between rounded-xl px-3 text-left shadow-[var(--shadow-border)]",
                    u[i] ? "bg-fg text-bg" : "bg-raised hover:bg-surface",
                  )}
                >
                  <span>
                    <span className="font-medium">{it.label}</span>
                    <span className={cn("ml-2 font-mono text-xs", u[i] ? "opacity-70" : "text-subtle")}>
                      a={formatPt(it.a, 1)} b={formatPt(it.b, 1)} c={formatPt(it.c, 2)}
                    </span>
                  </span>
                  <span className="font-mono text-sm tabular">{u[i] ? "certo" : "errado"}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="min-w-0 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
            Decifração oficial
          </p>
          <h2 className="font-display mt-1 text-xl tracking-tight">theta por integral, nota por σ</h2>
          <ol className="text-muted mt-3 space-y-2 text-sm leading-relaxed">
            <li>
              01 · P(θ) = c + (1−c) / (1 + exp[−{formatPt(TRI_D, 1)} a (θ−b)]). Logística, não
              elipse.
            </li>
            <li>
              02 · L(θ) = produto P^u (1−P) na potência 1−u. Máxima verossimilhança — a chave do
              padrão de respostas.
            </li>
            <li>
              03 · Integral EAP: E[θ | u] = ∫ θ L(θ) φ(θ) dθ / ∫ L(θ) φ(θ) dθ, φ = N(0,1). INEP:
              quadratura gaussiana, 40 nós. Aqui: Riemann em [−4, 4].
            </li>
            <li>
              04 · Derivada: I(θ) = [P′]² / [P(1−P)]. Soma = informação do teste. Onde I é máxima, a
              prova discrimina.
            </li>
            <li>
              05 · Escala: nota = 500 + 100 θ. O 100 é o σ da âncora 2009. O 500 é a média dos
              concluintes.
            </li>
          </ol>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat k="acertos" v={`${acertos}/5`} />
            <Stat k="theta EAP" v={formatPt(est.theta, 3)} />
            <Stat k="EP (se)" v={formatPt(est.se, 3)} />
            <Stat k="nota ENEM" v={formatPt(nota, 1)} />
          </div>
          <p className="text-muted mt-3 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">
            {acertos === 3 && u[0] && u[1] && u[2]
              ? "Padrão coerente: acertou o fácil, errou o difícil. A TRI acredita em você."
              : acertos === 3 && !u[0] && !u[1]
                ? "Mesmos 3 acertos, ordem invertida. A TRI lê chute — θ cai."
                : "Mude o gabarito. A nota não é regra de três."}
          </p>
          <IccChart u={u} theta={est.theta} />
        </article>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">SiSU</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">A UFC não calcula mais z</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            Desde 2011 a UFC entra 100% pelo SiSU. A nota que classifica é a média ponderada das
            cinco notas ENEM. Medicina típica: CN peso 3, CH peso 1, resto 2.
          </p>
          <div className="mt-4 space-y-3">
            {AREA_IDS.map((id) => (
              <label key={id} className="block min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm">
                    {SISU_AREAS[id].short}
                    <span className="text-subtle"> · peso {SISU_MEDICINA[id]}</span>
                  </span>
                  <span className="font-mono text-sm tabular">{formatPt(notes[id], 0)}</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={10}
                  value={notes[id]}
                  onChange={(e) => setNotes((n) => ({ ...n, [id]: Number(e.target.value) }))}
                  className="h-11 w-full accent-accent"
                  aria-label={SISU_AREAS[id].label}
                />
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat k="média simples" v={formatPt(AREA_IDS.reduce((s, k) => s + notes[k], 0) / 5, 1)} />
            <Stat k="SiSU Medicina" v={formatPt(sisu, 2)} />
          </div>
        </article>

        <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Particulares e estaduais</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">O σ clássico ainda respira</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            Unicamp e UFRGS (2025) ainda fazem o que a CCV fazia: T-score. Mackenzie e boa parte
            das privadas aceitam a nota ENEM crua ou aplicam vestibular TCT — soma de acertos, pesos
            por área, sem logística.
          </p>
          <div className="mt-4 grid gap-2">
            <Stat k="Unicamp/UFRGS se x=acertos desta mini-prova" v={formatPt(tct, 1)} />
            <p className="text-muted font-mono text-xs leading-relaxed">
              NP = 500 + 100 (x − μ)/σ · μ=2,5 σ=1,2 nesta turma fictícia · x={acertos}
            </p>
          </div>
          <ul className="text-muted mt-4 space-y-2 text-sm leading-relaxed">
            <li>
              <span className="text-fg font-medium">ProUni / FIES.</span> Média das 5 notas ENEM.
              ProUni pede ≥ 450 e redação ≠ 0.
            </li>
            <li>
              <span className="text-fg font-medium">PUC-SP.</span> Soma ponderada por grupo
              (humanas / exatas / saúde). TCT.
            </li>
            <li>
              <span className="text-fg font-medium">ITA / IME / ENAMED.</span> ITA/IME: prova
              própria, acerto cru. ENAMED: Rasch 1PL, não 3PL.
            </li>
          </ul>
          <p className="text-muted mt-4 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">
            A «derivada + integral + desvio padrão» que as bancas usam hoje é a informação de Fisher
            + o EAP + o 100 da escala. Não é a curva elíptica. A elipse fica na{" "}
            <Link to="/cifra" className="text-fg underline-offset-2 hover:underline">
              cifra
            </Link>{" "}
            e no{" "}
            <Link to="/ccv" className="text-fg underline-offset-2 hover:underline">
              caderno CCV 2002–2010
            </Link>
            .
          </p>
        </article>
      </section>
    </div>
  );
}

function Row({
  where,
  code,
  formula,
  note,
}: {
  where: string;
  code: string;
  formula: string;
  note: string;
}) {
  return (
    <tr className="border-t border-border">
      <td className="py-2.5 font-medium">{where}</td>
      <td className="py-2.5">{code}</td>
      <td className="py-2.5 font-mono text-xs">{formula}</td>
      <td className="text-muted py-2.5 text-xs leading-relaxed">{note}</td>
    </tr>
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

function IccChart({ u, theta }: { u: boolean[]; theta: number }) {
  const w = 640;
  const h = 200;
  const pad = { l: 36, r: 16, t: 12, b: 28 };
  const tMin = -3;
  const tMax = 3;
  const xOf = (t: number) => pad.l + ((t - tMin) / (tMax - tMin)) * (w - pad.l - pad.r);
  const yOf = (p: number) => pad.t + (1 - p) * (h - pad.t - pad.b);

  const curves = TRI_ITEMS.map((it) => {
    const d: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = tMin + (i / 80) * (tMax - tMin);
      d.push(`${i === 0 ? "M" : "L"}${xOf(t).toFixed(1)},${yOf(threePl(t, it.a, it.b, it.c)).toFixed(1)}`);
    }
    return d.join(" ");
  });

  const tc = Math.max(tMin, Math.min(tMax, theta));
  const Isum = TRI_ITEMS.reduce((s, itm) => s + itemInfo(theta, itm.a, itm.b, itm.c), 0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-44 w-full" role="img" aria-label="curvas características">
      {curves.map((d, i) => (
        <path
          key={TRI_ITEMS[i].id}
          d={d}
          fill="none"
          className={u[i] ? "stroke-accent" : "stroke-fg"}
          strokeWidth={u[i] ? 2.2 : 1.2}
          strokeOpacity={u[i] ? 1 : 0.35}
        />
      ))}
      <line
        x1={xOf(tc)}
        x2={xOf(tc)}
        y1={pad.t}
        y2={h - pad.b}
        className="stroke-fg"
        strokeWidth="1.6"
        strokeDasharray="4 3"
      />
      <text x={xOf(0)} y={h - 8} textAnchor="middle" className="fill-subtle" fontSize="11">
        θ = 0
      </text>
      <text x={xOf(tc) + 6} y={pad.t + 12} className="fill-subtle" fontSize="11">
        theta · I {formatPt(Isum, 2)}
      </text>
    </svg>
  );
}
