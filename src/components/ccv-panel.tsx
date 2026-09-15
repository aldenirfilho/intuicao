import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import cipher from "@/lib/cipher-data.json";
import { SigmaLab } from "@/components/sigma-lab";
import { formatPoint, realDerivative, realUpper } from "@/lib/ecc";
import {
  CCV_N1_AT_MEAN,
  CCV_NF_AT_MEAN,
  CCV_RATIO,
  CCV_SCALES,
  GRANDEZA,
  HAND_CANDIDATE,
  HAND_SCORES,
  IEZZI,
  INTEGRAL_GABARITO,
  cohortFor,
  decodeWord,
  fElliptic,
  formatPt,
  gaussPhi,
  handCheck,
  rankMessages,
  trapezoid,
  type CcvPaper,
  type Grandeza,
  type TurmaId,
} from "@/lib/ccv";
import { cn } from "@/lib/utils";

const PAPERS = Object.keys(CCV_SCALES) as CcvPaper[];

export function CcvPanel() {
  const [paper, setPaper] = useState<CcvPaper>("matematica");
  const [grandeza, setGrandeza] = useState<Grandeza>("gematria");
  const [turma, setTurma] = useState<TurmaId>("chaves");
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [traps, setTraps] = useState(10);

  const msg = cipher.messages[selected];
  const liveQuery = query.trim() || msg.key;
  const liveIndex = query.trim() ? 1 : msg.id;

  const live = useMemo(
    () => decodeWord(liveQuery, liveIndex, grandeza, turma, paper),
    [liveQuery, liveIndex, grandeza, turma, paper],
  );

  const cohort = useMemo(() => cohortFor(grandeza, turma), [grandeza, turma]);
  const ranks = useMemo(() => rankMessages(grandeza, turma, paper), [grandeza, turma, paper]);
  const trap = useMemo(() => trapezoid(-1, 4, traps), [traps]);

  const yG = realUpper(4);
  const ypG = realDerivative(4, yG);
  const scale = CCV_SCALES[paper];
  const gabarito = useMemo(() => handCheck(), []);

  return (
    <div className="min-w-0 space-y-6">
      <header className="max-w-2xl">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
          Caderno CCV · UFC 2002–2010
        </p>
        <h1 className="font-display mt-1 text-3xl tracking-tight sm:text-4xl">
          O escore não é o acerto
        </h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          A CCV não lia o número cru. Lia a distância à média da turma, em unidades de desvio
          padrão — o z do Iezzi vol. 11. A cifra elíptica é a mesma operação: um ponto só significa
          alguma coisa em relação ao grupo. Derivada, integral e σ cabem num caderno de vestibular.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PAPERS.map((id) => {
          const s = CCV_SCALES[id];
          const active = id === paper;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPaper(id)}
              className={cn(
                "min-h-24 rounded-xl px-4 py-3 text-left shadow-[var(--shadow-border)]",
                active ? "bg-fg text-bg" : "bg-surface hover:bg-raised",
              )}
            >
              <p className={cn("text-xs font-medium", active ? "opacity-70" : "text-subtle")}>
                {s.etapa}ª etapa · teto {s.a}
              </p>
              <p className="font-display mt-1 text-lg leading-tight">{s.short}</p>
              <p className={cn("mt-1 font-mono text-xs", active ? "opacity-70" : "text-muted")}>
                {s.hint}
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="order-2 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5 lg:order-none">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Protocolo</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">O que entra no z</h2>

          <Field label="Grandeza (escore bruto x)">
            {(Object.keys(GRANDEZA) as Grandeza[]).map((id) => (
              <Chip
                key={id}
                current={grandeza === id}
                onClick={() => {
                  setGrandeza(id);
                  if (id === "k") setTurma("chaves");
                  if (id === "x") setTurma("abcissas");
                  if (id === "gematria" && turma === "abcissas") setTurma("chaves");
                }}
              >
                {GRANDEZA[id].label}
              </Chip>
            ))}
          </Field>
          <p className="text-subtle mt-2 text-xs">{GRANDEZA[grandeza].iezzi}</p>

          <Field label="Turma (μ e σ)">
            <Chip current={turma === "chaves"} onClick={() => setTurma("chaves")}>
              {grandeza === "x" ? "16 presentes" : "18 chaves"}
            </Chip>
            {grandeza === "gematria" ? (
              <Chip current={turma === "dias"} onClick={() => setTurma("dias")}>
                365 dias
              </Chip>
            ) : null}
            {grandeza === "x" ? (
              <Chip current={turma === "abcissas"} onClick={() => setTurma("abcissas")}>
                39 pontos
              </Chip>
            ) : null}
          </Field>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat k="n" v={String(cohort.n)} />
            <Stat k="μ" v={formatPt(cohort.mu, 4)} />
            <Stat k="σ" v={formatPt(cohort.sigma, 4)} />
            <Stat k="prova" v={scale.short} />
          </div>

          <label className="mt-5 block">
            <span className="text-subtle text-xs">Palavra-chave (ou clique na lista)</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={msg.key}
              className="mt-1 h-11 w-full rounded-lg bg-raised px-3 font-mono text-sm uppercase shadow-[var(--shadow-border)] outline-none"
            />
          </label>

          <div className="mt-4 grid max-h-64 gap-1 overflow-y-auto pr-1">
            {cipher.messages.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelected(i);
                  setQuery("");
                }}
                className={cn(
                  "flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm",
                  i === selected && !query.trim() ? "bg-fg text-bg" : "bg-raised hover:bg-raised/80",
                )}
              >
                <span className="font-medium">{m.key}</span>
                <span className="font-mono text-xs tabular opacity-70">Σ {m.sum}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="order-1 min-w-0 space-y-4 lg:order-none">
          <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
              Questão resolvida
            </p>
            <h2 className="font-display mt-1 text-xl tracking-tight">
              Padronizar «{liveQuery}» como a CCV
            </h2>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              Estilo Iezzi + Edital UFC 2010. Cinco casas decimais no escore padronizado. Faltosos
              fora de μ e σ.
            </p>

            <ol className="mt-4 space-y-3 text-sm leading-relaxed">
              <Step n={1} title="Escore bruto x">
                {live.letters.length === 0 ? (
                  "Digite letras A–Z."
                ) : (
                  <>
                    {live.letters.map(([ch, v]) => `${ch}=${v}`).join(" + ")} ={" "}
                    <span className="text-fg font-mono">{live.sum}</span>
                    {grandeza === "k" ? (
                      <>
                        . k = ({live.sum} + {liveIndex}) mod 20 ={" "}
                        <span className="text-fg font-mono">{live.k}</span>
                      </>
                    ) : null}
                    {grandeza === "x" ? (
                      <>
                        . {live.k}G ={" "}
                        <span className="text-fg font-mono">{formatPoint(live.point)}</span>
                      </>
                    ) : null}
                  </>
                )}
              </Step>
              <Step n={2} title="Média da turma (Iezzi vol. 11)">
                μ = Σxᵢ / n = {formatPt(cohort.mu, 5)} · n = {cohort.n} · {cohort.label}
              </Step>
              <Step n={3} title="Desvio padrão (CCV 3.5.8, denominador n)">
                σ = √[ Σ(xᵢ − μ)² / n ] = {formatPt(cohort.sigma, 5)}
              </Step>
              <Step n={4} title="Escore reduzido z">
                {live.faltoso || live.z === null ? (
                  "Ponto no infinito — faltoso nesta prova. A Cruz e a Nova criação saem da média, como o candidato que não assina a lista."
                ) : (
                  <>
                    z = (x − μ) / σ = ({formatPt(live.raw ?? 0, 2)} − {formatPt(live.mu, 4)}) /{" "}
                    {formatPt(live.sigma, 4)} ={" "}
                    <span className="text-fg font-mono">{formatPt(live.z, 5)}</span>
                  </>
                )}
              </Step>
              <Step n={5} title={`Padronização CCV · ${scale.short}`}>
                {live.xp === null ? (
                  "xp indefinido (faltoso)."
                ) : (
                  <>
                    xp = {formatPt(scale.a, 1)} + {formatPt(scale.b, 1)} · z ={" "}
                    <span className="text-fg font-mono">{formatPt(live.xp, 5)}</span>
                    <span className="text-subtle"> · 5ª casa, como o edital</span>
                  </>
                )}
              </Step>
              <Step n={6} title="Selo elíptico">
                k = {live.k} → {formatPoint(live.point)}
                {live.point ? (
                  <>
                    {" "}
                    · y′ nos reais em x={live.point[0]} ≈{" "}
                    {live.yp !== null ? formatPt(live.yp, 4) : "—"}
                  </>
                ) : (
                  " · O, o elemento neutro"
                )}
              </Step>
            </ol>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat k="x" v={live.raw === null ? "faltoso" : formatPt(live.raw, 2)} />
              <Stat k="z" v={live.z === null ? "—" : formatPt(live.z, 4)} />
              <Stat k="xp" v={live.xp === null ? "—" : formatPt(live.xp, 5)} />
              <Stat k="kG" v={formatPoint(live.point)} />
            </div>
            <GaussInsight z={live.z} />
          </article>

          <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
                  Classificação
                </p>
                <h2 className="font-display mt-1 text-xl tracking-tight">18 candidatos, um ranking</h2>
              </div>
              <p className="text-muted text-xs">ordem decrescente de xp · {scale.hint}</p>
            </div>
            <div className="mt-4 min-w-0 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm sm:min-w-[36rem]">
                <thead className="text-subtle text-xs tracking-wide uppercase">
                  <tr>
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Chave</th>
                    <th className="pb-2 font-medium">x</th>
                    <th className="pb-2 font-medium">z</th>
                    <th className="pb-2 font-medium">xp</th>
                    <th className="text-muted hidden pb-2 font-medium sm:table-cell">kG</th>
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((r, i) => {
                    const active = r.id === msg.id && !query.trim();
                    return (
                      <tr
                        key={r.id}
                        className={cn(
                          "border-t border-border",
                          active && "bg-raised",
                        )}
                      >
                        <td className="py-2.5 font-mono tabular">{r.faltoso ? "—" : i + 1}</td>
                        <td className="py-2.5 font-medium">{r.key}</td>
                        <td className="py-2.5 font-mono tabular">
                          {r.raw === null ? "faltoso" : formatPt(r.raw, 0)}
                        </td>
                        <td className="py-2.5 font-mono tabular">
                          {r.z === null ? "—" : formatPt(r.z, 3)}
                        </td>
                        <td className="py-2.5 font-mono tabular">
                          {r.xp === null ? "—" : formatPt(r.xp, 5)}
                        </td>
                        <td className="text-muted hidden py-2.5 font-mono text-xs tabular sm:table-cell">
                          {formatPoint(r.point)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <SigmaLab
        paper={paper}
        liveX={live.raw}
        liveMu={live.mu}
        liveSigma={live.sigma}
        liveLabel={liveQuery}
      />

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
            Iezzi vol. 8 · integral
          </p>
          <h2 className="font-display mt-1 text-xl tracking-tight">
            Trapézios em ∫ √(x³+2x+3) dx
          </h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            De −1 a 4 a curva real toca o eixo (raiz em x=−1) e sobe até 5√3. A primitiva é elíptica
            — daí o nome. O vestibular pedia trapézios, não Weierstrass.
          </p>
          <label className="mt-4 block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-subtle text-xs">n trapézios</span>
              <span className="font-mono text-sm tabular">{traps}</span>
            </div>
            <input
              type="range"
              min={4}
              max={40}
              step={1}
              value={traps}
              onChange={(e) => setTraps(Number(e.target.value))}
              className="h-11 w-full accent-accent"
              aria-label="Número de trapézios"
            />
          </label>
          <IntegralChart trap={trap} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Stat k="h" v={formatPt(trap.h, 4)} />
            <Stat k="Tn" v={formatPt(trap.value, 5)} />
            <Stat k="gabarito" v={formatPt(INTEGRAL_GABARITO, 5)} />
          </div>
          <p className="text-muted mt-3 font-mono text-xs leading-relaxed">
            Tₙ = (h/2)[y₀ + 2y₁ + … + 2yₙ₋₁ + yₙ] · erro = {formatPt(trap.value - INTEGRAL_GABARITO, 5)}
          </p>
        </article>

        <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
          <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">
            Iezzi vol. 8 · derivada
          </p>
          <h2 className="font-display mt-1 text-xl tracking-tight">A tangente é o λ do grupo</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            Implícita: 2y y′ = 3x² + 2. No gerador real (4, 5√3), y′ = 5/√3. Em F₃₇ a mesma conta
            dá λ ≡ 25 — a duplicação 2G = (25, 29).
          </p>
          <TangentChart />
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Stat k="y(4)" v={`5√3 ≈ ${formatPt(yG, 4)}`} />
            <Stat k="y′(4)" v={`5/√3 ≈ ${formatPt(ypG, 4)}`} />
          </div>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            Campana de Gauss da turma: φ(z) = (1/√(2π)) exp(−z²/2). O candidato marcado é o z de
            «{liveQuery}».
          </p>
          <GaussChart z={live.z} />
        </article>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Conferência</p>
        <h2 className="font-display mt-1 text-xl tracking-tight">As contas fecham</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          CEPE 01/2004 art. 7º e Edital 2010 item 3.5. A média da escala é o teto da prova bruta
          (Português 12×3=36, demais 24, estrangeira 6, 2ª etapa 80). O desvio da escala é 20%
          desse teto — por isso a/b = 5, nunca 2,7 nem 8,4 (troca de dígitos em OCR de PDF).
        </p>
        <div className="mt-4 min-w-0 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="text-subtle text-xs tracking-wide uppercase">
              <tr>
                <th className="pb-2 font-medium">Prova</th>
                <th className="pb-2 font-medium">a teto</th>
                <th className="pb-2 font-medium">b = 0,2a</th>
                <th className="pb-2 font-medium">a/b</th>
                <th className="pb-2 font-medium">xp(z=0)</th>
                <th className="pb-2 font-medium">xp(z=1)</th>
              </tr>
            </thead>
            <tbody>
              {PAPERS.map((id) => {
                const s = CCV_SCALES[id];
                return (
                  <tr key={id} className="border-t border-border">
                    <td className="py-2.5 font-medium">{s.short}</td>
                    <td className="py-2.5 font-mono tabular">{formatPt(s.a, 1)}</td>
                    <td className="py-2.5 font-mono tabular">{formatPt(s.b, 1)}</td>
                    <td className="py-2.5 font-mono tabular">{formatPt(s.a / s.b, 0)}</td>
                    <td className="py-2.5 font-mono tabular">{formatPt(s.a, 1)}</td>
                    <td className="py-2.5 font-mono tabular">{formatPt(s.a + s.b, 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Stat k="1ª etapa (z=0)" v={`${CCV_N1_AT_MEAN} = 36+6×24+6`} />
          <Stat k="2ª etapa (z=0)" v="240 = 3×80" />
          <Stat k="final (z=0)" v={`${CCV_NF_AT_MEAN} = 186+240`} />
        </div>
        <p className="text-muted mt-3 font-mono text-xs leading-relaxed">
          N1 = 186 + 37,2 z · N2 = 240 + 48 z · NF = 426 + 85,2 z · razão {CCV_RATIO}
        </p>

        <h3 className="font-display mt-6 text-lg tracking-tight">Gabarito à mão · Iezzi vol. 11</h3>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          Turma {HAND_SCORES.join(", ")}. Candidato x = {HAND_CANDIDATE}. σ com n. Matemática 1ª
          etapa.
        </p>
        <ol className="text-muted mt-3 space-y-1.5 text-sm leading-relaxed">
          <li>n = {gabarito.n} · Σx = {gabarito.sum} · μ = Σ/n = {formatPt(gabarito.mu, 0)}</li>
          <li>
            Σ(xᵢ−μ)² = {gabarito.ss} · σ = √({gabarito.ss}/{gabarito.n}) = √5,6 ={" "}
            {formatPt(gabarito.sigma, 5)}
          </li>
          <li>
            z = ({HAND_CANDIDATE}−5)/σ = {formatPt(gabarito.z, 5)}
          </li>
          <li>
            xp = 24 + 4,8 z = <span className="text-fg font-mono">{formatPt(gabarito.matematica, 5)}</span>
          </li>
          <li>
            Português {formatPt(gabarito.portugues, 5)} · Estrangeira {formatPt(gabarito.estrangeira, 5)}{" "}
            · 2ª etapa {formatPt(gabarito.segunda, 5)}
          </li>
          <li>
            N1 = {formatPt(gabarito.n1, 5)} · N2 = {formatPt(gabarito.n2, 5)} · NF ={" "}
            {formatPt(gabarito.nf, 5)}
          </li>
        </ol>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-subtle text-xs font-medium tracking-[0.16em] uppercase">Fontes</p>
        <ul className="text-muted mt-3 space-y-2 text-sm leading-relaxed">
          <li>
            {IEZZI.edital}. {IEZZI.cepe}. Extrações de PDF que leem 2,7 / 8,4 / 2,1 invertiram os
            dígitos: 36/2,7 não é 5.
          </li>
          <li>{IEZZI.vol11}. σ com n, não n−1: a turma presente é a população do concurso.</li>
          <li>
            {IEZZI.vol8}. y′ implícita = λ da duplicação. Integral por trapézios; arco ≈{" "}
            {formatPt(cipher.stats["arc_-1_to_4"] as number, 4)} (tangente vertical em x=−1).
          </li>
          <li>
            Faltosos (CCV 3.5.8): Cruz e Nova criação caem no infinito — não entram em μₓ. Depois de
            2010 a UFC largou esse código:{" "}
            <Link to="/tri" className="text-fg underline-offset-2 hover:underline">
              ENEM TRI + SiSU
            </Link>
            . A cifra elíptica continua na{" "}
            <Link to="/cifra" className="text-fg underline-offset-2 hover:underline">
              constelação
            </Link>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-subtle mb-2 text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
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
        "h-11 rounded-lg px-3 text-sm font-medium",
        current ? "bg-fg text-bg" : "bg-raised text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-3">
      <span className="text-subtle font-mono text-xs tabular">{String(n).padStart(2, "0")}</span>
      <div>
        <p className="text-fg font-medium">{title}</p>
        <p className="text-muted mt-0.5">{children}</p>
      </div>
    </li>
  );
}

function GaussInsight({ z }: { z: number | null }) {
  if (z === null) {
    return (
      <p className="text-muted mt-4 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">
        Sem z: o ponto no infinito não tem abscissa. A CCV também não padronizava quem faltou.
      </p>
    );
  }
  const az = Math.abs(z);
  const text =
    az < 0.5
      ? "Dentro de ½σ da média. Chave típica da turma — o centro da campana."
      : az < 1
        ? "Dentro de 1σ. Se a turma fosse normal, ~68% cairia nesta faixa."
        : az < 2
          ? "Entre 1σ e 2σ. Distante, ainda comum (~95% da massa normal cabe em ±2σ)."
          : z > 0
            ? "Cauda superior (|z|≥2). Escore raro para cima — como Ressurreição na gematria."
            : "Cauda inferior (|z|≥2). Escore raro para baixo — palavra curta demais para a turma.";
  return (
    <p className="text-muted mt-4 rounded-lg bg-raised px-3 py-3 text-sm leading-relaxed">{text}</p>
  );
}

function IntegralChart({ trap }: { trap: ReturnType<typeof trapezoid> }) {
  const w = 640;
  const h = 220;
  const pad = { l: 36, r: 16, t: 16, b: 32 };
  const xMin = -1;
  const xMax = 4;
  const yMax = 10;
  const xOf = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const yOf = (y: number) => pad.t + (1 - y / yMax) * (h - pad.t - pad.b);

  const curve: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = xMin + (i / 80) * (xMax - xMin);
    const y = fElliptic(x);
    curve.push(`${i === 0 ? "M" : "L"}${xOf(x).toFixed(1)},${yOf(y).toFixed(1)}`);
  }

  const traps = trap.xs.slice(0, -1).map((x0, i) => {
    const x1 = trap.xs[i + 1];
    const y0 = trap.ys[i];
    const y1 = trap.ys[i + 1];
    return `${xOf(x0).toFixed(1)},${yOf(0).toFixed(1)} ${xOf(x0).toFixed(1)},${yOf(y0).toFixed(1)} ${xOf(x1).toFixed(1)},${yOf(y1).toFixed(1)} ${xOf(x1).toFixed(1)},${yOf(0).toFixed(1)}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-48 w-full" role="img" aria-label="integral por trapézios">
      {traps.map((pts, i) => (
        <polygon key={i} points={pts} className="fill-accent/25 stroke-accent/50" strokeWidth="0.8" />
      ))}
      <path d={curve.join(" ")} fill="none" className="stroke-fg" strokeWidth="2" />
      <line
        x1={xOf(-1)}
        x2={xOf(4)}
        y1={yOf(0)}
        y2={yOf(0)}
        className="stroke-fg"
        strokeOpacity="0.2"
      />
      <text x={xOf(-1)} y={h - 10} className="fill-subtle" fontSize="11">
        −1
      </text>
      <text x={xOf(4) - 8} y={h - 10} className="fill-subtle" fontSize="11">
        4
      </text>
    </svg>
  );
}

function TangentChart() {
  const w = 640;
  const h = 200;
  const pad = { l: 36, r: 16, t: 16, b: 28 };
  const xMin = -1.2;
  const xMax = 5.2;
  const yMin = -10;
  const yMax = 10;
  const xOf = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const yOf = (y: number) => pad.t + ((yMax - y) / (yMax - yMin)) * (h - pad.t - pad.b);
  const yG = realUpper(4);
  const yp = realDerivative(4, yG);

  const upper: string[] = [];
  const lower: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = xMin + (i / 100) * (xMax - xMin);
    const y = fElliptic(x);
    if (x * x * x + 2 * x + 3 < 0) continue;
    const cmdU = upper.length === 0 ? "M" : "L";
    const cmdL = lower.length === 0 ? "M" : "L";
    upper.push(`${cmdU}${xOf(x).toFixed(1)},${yOf(y).toFixed(1)}`);
    lower.push(`${cmdL}${xOf(x).toFixed(1)},${yOf(-y).toFixed(1)}`);
  }

  const t0 = 2.2;
  const t1 = 5.1;
  const yAt = (x: number) => yG + yp * (x - 4);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-44 w-full" role="img" aria-label="tangente em G">
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={yOf(0)}
        y2={yOf(0)}
        className="stroke-fg"
        strokeOpacity="0.16"
      />
      <path d={upper.join(" ")} fill="none" className="stroke-fg" strokeWidth="1.8" />
      <path d={lower.join(" ")} fill="none" className="stroke-fg" strokeWidth="1.8" strokeOpacity="0.35" />
      <line
        x1={xOf(t0)}
        y1={yOf(yAt(t0))}
        x2={xOf(t1)}
        y2={yOf(yAt(t1))}
        className="stroke-accent"
        strokeWidth="1.6"
      />
      <circle cx={xOf(4)} cy={yOf(yG)} r="4.5" className="fill-fg stroke-accent" strokeWidth="1.5" />
      <text x={xOf(4) + 8} y={yOf(yG) - 8} className="fill-subtle" fontSize="11">
        G (4, 5√3)
      </text>
    </svg>
  );
}

function GaussChart({ z }: { z: number | null }) {
  const w = 640;
  const h = 140;
  const pad = { l: 16, r: 16, t: 12, b: 24 };
  const zMin = -4;
  const zMax = 4;
  const yMax = gaussPhi(0) * 1.15;
  const xOf = (v: number) => pad.l + ((v - zMin) / (zMax - zMin)) * (w - pad.l - pad.r);
  const yOf = (p: number) => pad.t + (1 - p / yMax) * (h - pad.t - pad.b);

  const d: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const zv = zMin + (i / 120) * (zMax - zMin);
    d.push(`${i === 0 ? "M" : "L"}${xOf(zv).toFixed(1)},${yOf(gaussPhi(zv)).toFixed(1)}`);
  }

  const band = (a: number, b: number) => {
    const pts: string[] = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const zv = a + (i / n) * (b - a);
      pts.push(`${xOf(zv).toFixed(1)},${yOf(gaussPhi(zv)).toFixed(1)}`);
    }
    return `${xOf(a).toFixed(1)},${yOf(0).toFixed(1)} ${pts.join(" ")} ${xOf(b).toFixed(1)},${yOf(0).toFixed(1)}`;
  };

  const zc = z === null ? null : Math.max(zMin, Math.min(zMax, z));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-32 w-full" role="img" aria-label="curva normal">
      <polygon points={band(-1, 1)} className="fill-accent/20" />
      <path d={d.join(" ")} fill="none" className="stroke-fg" strokeWidth="1.8" />
      <line
        x1={xOf(0)}
        x2={xOf(0)}
        y1={yOf(0)}
        y2={yOf(gaussPhi(0))}
        className="stroke-fg"
        strokeOpacity="0.25"
      />
      {zc !== null ? (
        <line
          x1={xOf(zc)}
          x2={xOf(zc)}
          y1={yOf(0)}
          y2={yOf(gaussPhi(zc))}
          className="stroke-accent"
          strokeWidth="2"
        />
      ) : null}
      <text x={xOf(0)} y={h - 6} textAnchor="middle" className="fill-subtle" fontSize="11">
        μ
      </text>
      <text x={xOf(-2)} y={h - 6} textAnchor="middle" className="fill-subtle" fontSize="11">
        −2σ
      </text>
      <text x={xOf(2)} y={h - 6} textAnchor="middle" className="fill-subtle" fontSize="11">
        +2σ
      </text>
    </svg>
  );
}