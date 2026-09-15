import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TRI_D,
  TRI_ITEMS,
  eapTheta,
  enemScale,
  itemInfo,
  sisuMean,
  tScore500,
  threePl,
  threePlDeriv,
} from "./tri.ts";

describe("TRI 3PL — ENEM", () => {
  const item = TRI_ITEMS[2];

  it("assíntotas: θ→−∞ dá c; θ→+∞ dá 1; em b dá (1+c)/2", () => {
    assert.ok(Math.abs(threePl(-20, item.a, item.b, item.c) - item.c) < 1e-6);
    assert.ok(Math.abs(threePl(20, item.a, item.b, item.c) - 1) < 1e-6);
    const mid = threePl(item.b, item.a, item.b, item.c);
    assert.ok(Math.abs(mid - (1 + item.c) / 2) < 1e-6);
  });

  it("P′ analítica bate com a numérica", () => {
    const th = 0.3;
    const h = 1e-4;
    const num = (threePl(th + h, item.a, item.b, item.c) - threePl(th - h, item.a, item.b, item.c)) / (2 * h);
    assert.ok(Math.abs(num - threePlDeriv(th, item.a, item.b, item.c)) < 1e-5);
  });

  it("informação é máxima perto de b (item sem chute extremo)", () => {
    const easy = TRI_ITEMS[0];
    const I_at_b = itemInfo(easy.b, easy.a, easy.b, easy.c);
    const I_left = itemInfo(easy.b - 2, easy.a, easy.b, easy.c);
    const I_right = itemInfo(easy.b + 2, easy.a, easy.b, easy.c);
    assert.ok(I_at_b > I_left && I_at_b > I_right);
  });

  it("mesmo 3 acertos: padrão coerente tem θ maior que o chute", () => {
    const coh = eapTheta([true, true, true, false, false]);
    const guess = eapTheta([false, false, true, true, true]);
    assert.ok(coh.theta > guess.theta);
    assert.ok(enemScale(coh.theta) > enemScale(guess.theta));
  });

  it("escala ENEM: 500 + 100θ", () => {
    assert.equal(enemScale(0), 500);
    assert.equal(enemScale(1), 600);
    assert.equal(enemScale(-1.5), 350);
  });

  it("D oficial = 1,7", () => {
    assert.equal(TRI_D, 1.7);
  });
});

describe("códigos vivos 2014–2026", () => {
  it("Unicamp/UFRGS: 500 + 100z", () => {
    assert.equal(tScore500(10, 10, 2), 500);
    assert.equal(tScore500(12, 10, 2), 600);
  });

  it("SiSU Medicina: média ponderada CN×3", () => {
    const notes = { lc: 700, ch: 700, cn: 800, mt: 700, red: 700 };
    const w = { lc: 2, ch: 1, cn: 3, mt: 2, red: 2 };
    const m = sisuMean(notes, w);
    assert.equal(m, (700 * 2 + 700 * 1 + 800 * 3 + 700 * 2 + 700 * 2) / 10);
    assert.equal(m, 730);
  });
});
