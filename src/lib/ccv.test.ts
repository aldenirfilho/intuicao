import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CCV_N1_AT_MEAN,
  CCV_N2_AT_MEAN,
  CCV_NF_AT_MEAN,
  CCV_RATIO,
  CCV_SCALES,
  HAND_CANDIDATE,
  HAND_SCORES,
  TWO_TURMAS,
  ccvScore,
  dxpDsigma,
  firstStageFromZ,
  handCheck,
  impactAt,
  mean,
  round5,
  secondStageFromZ,
  stdevPop,
  zScore,
} from "./ccv-formula.ts";

describe("CCV UFC 2002–2010 — padronização", () => {
  it("b = 0,2 · a em todas as provas (teto bruto = média da escala)", () => {
    for (const s of Object.values(CCV_SCALES)) {
      assert.equal(round5(s.b), round5(CCV_RATIO * s.a));
      assert.equal(round5(s.a / s.b), 5);
    }
  });

  it("z = 0 devolve o teto bruto da prova", () => {
    assert.equal(ccvScore(0, "portugues"), 36);
    assert.equal(ccvScore(0, "matematica"), 24);
    assert.equal(ccvScore(0, "estrangeira"), 6);
    assert.equal(ccvScore(0, "segunda"), 80);
  });

  it("z = 1 acrescenta 20% do teto", () => {
    assert.equal(ccvScore(1, "portugues"), 43.2);
    assert.equal(ccvScore(1, "matematica"), 28.8);
    assert.equal(ccvScore(1, "estrangeira"), 7.2);
    assert.equal(ccvScore(1, "segunda"), 96);
  });

  it("1ª etapa na média = 186; 2ª = 240; final = 426", () => {
    assert.equal(firstStageFromZ(0), CCV_N1_AT_MEAN);
    assert.equal(secondStageFromZ(0), CCV_N2_AT_MEAN);
    assert.equal(firstStageFromZ(0) + secondStageFromZ(0), CCV_NF_AT_MEAN);
    assert.equal(round5(firstStageFromZ(1)), 223.2);
    assert.equal(round5(secondStageFromZ(1)), 288);
    assert.equal(round5(firstStageFromZ(1) + secondStageFromZ(1)), 511.2);
  });

  it("N1(z) = 186 + 37,2 z  e  N2(z) = 240 + 48 z", () => {
    for (const z of [-2, -0.5, 0, 0.7, 2.5914332428815623]) {
      assert.equal(round5(firstStageFromZ(z)), round5(186 + 37.2 * z));
      assert.equal(round5(secondStageFromZ(z)), round5(240 + 48 * z));
    }
  });

  it("gabarito à mão: turma {2,4,4,6,9}, candidato 9", () => {
    const g = handCheck();
    assert.equal(g.n, 5);
    assert.equal(g.sum, 25);
    assert.equal(g.mu, 5);
    assert.equal(g.ss, 28);
    assert.equal(g.sigma, Math.sqrt(28 / 5));
    const z = (HAND_CANDIDATE - 5) / Math.sqrt(5.6);
    assert.equal(g.z, z);
    assert.equal(g.matematica, round5(24 + 4.8 * z));
    assert.equal(g.portugues, round5(36 + 7.2 * z));
    assert.equal(g.estrangeira, round5(6 + 1.2 * z));
    assert.equal(g.segunda, round5(80 + 16 * z));
  });

  it("σ populacional usa n, não n−1", () => {
    const xs = [...HAND_SCORES];
    const m = mean(xs);
    const pop = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
    const sample = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
    assert.equal(stdevPop(xs), pop);
    assert.notEqual(stdevPop(xs), sample);
  });

  it("σ = 0 ⇒ z = 0 (faltosos/turma degenerada)", () => {
    assert.equal(zScore(10, 10, 0), 0);
    assert.equal(stdevPop([7, 7, 7]), 0);
  });

  it("quinta casa: 32,11348084… → 32,11348", () => {
    const z = (9 - 5) / Math.sqrt(5.6);
    const raw = 24 + 4.8 * z;
    assert.equal(round5(raw), 32.11348);
  });
});

describe("impacto do σ", () => {
  it("mesmo x=18, μ=12: σ=2 ⇒ z=3 e xp=38,4; σ=6 ⇒ z=1 e xp=28,8", () => {
    const { x, mu, tight, wide } = TWO_TURMAS;
    const a = impactAt(x, mu, tight, "matematica");
    const b = impactAt(x, mu, wide, "matematica");
    assert.equal(a.z, 3);
    assert.equal(b.z, 1);
    assert.equal(a.xp, 38.4);
    assert.equal(b.xp, 28.8);
    assert.equal(a.n1, 297.6);
    assert.equal(b.n1, 223.2);
    assert.equal(round5(a.xp - b.xp), 9.6);
  });

  it("na média, σ não move xp e ∂xp/∂σ = 0", () => {
    for (const sigma of [0.5, 2, 6, 10]) {
      const i = impactAt(12, 12, sigma, "matematica");
      assert.equal(i.z, 0);
      assert.equal(i.xp, 24);
      assert.equal(i.dxpDsigma, 0);
    }
  });

  it("acima da média, σ maior reduz xp; abaixo, σ maior aumenta xp", () => {
    assert.ok(dxpDsigma(18, 12, 2, "matematica") < 0);
    assert.ok(dxpDsigma(6, 12, 2, "matematica") > 0);
    assert.ok(impactAt(18, 12, 1.5, "matematica").xp > impactAt(18, 12, 6, "matematica").xp);
    assert.ok(impactAt(6, 12, 1.5, "matematica").xp < impactAt(6, 12, 6, "matematica").xp);
  });

  it("∂xp/∂σ analítica bate com a derivada numérica", () => {
    const x = 18;
    const mu = 12;
    const sigma = 2;
    const h = 1e-4;
    const num =
      (ccvScore(zScore(x, mu, sigma + h), "matematica") -
        ccvScore(zScore(x, mu, sigma - h), "matematica")) /
      (2 * h);
    const analytic = dxpDsigma(x, mu, sigma, "matematica");
    assert.ok(Math.abs(num - analytic) < 1e-4);
    assert.equal(round5(analytic), round5((-4.8 * 6) / 4));
  });

  it("σ → ∞ manda xp para o teto a, qualquer x", () => {
    const hi = impactAt(18, 12, 1e6, "matematica");
    assert.ok(Math.abs(hi.xp - 24) < 1e-3);
  });
});

