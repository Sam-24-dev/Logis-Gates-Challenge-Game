import { describe, expect, it } from "vitest";
import { getPracticeFeedback } from "./feedback.ts";
import { levelsByDifficulty } from "../data/levels";

describe("getPracticeFeedback", () => {
  it("derives solved feedback from the circuit and current inputs", () => {
    const feedback = getPracticeFeedback(
      levelsByDifficulty.easy[1],
      { A: true, B: true },
    );

    expect(feedback.status).toBe("solved");
    expect(feedback.reading).toContain("salida 1");
    expect(feedback.hint).toMatch(/ya coincide/i);
  });

  it("explains why AND stays off when only one input is active", () => {
    const level = levelsByDifficulty.easy[1];

    const feedback = getPracticeFeedback(level, { A: true, B: false }, false);

    expect(feedback.reading).toContain("A=1 · B=0");
    expect(feedback.reading).toContain("salida 0");
    expect(feedback.rule).toMatch(
      /AND necesita que todas sus entradas estén en 1/i,
    );
    expect(feedback.hint).toMatch(/activa B/i);
    expect(feedback.targetSummary).toContain("A=1 · B=1");
  });

  it("explains NOT as inversion and points to the next useful action", () => {
    const level = levelsByDifficulty.easy[3];

    const feedback = getPracticeFeedback(level, { A: true }, false);

    expect(feedback.rule).toMatch(/NOT invierte/i);
    expect(feedback.hint).toMatch(/apaga A/i);
    expect(feedback.targetSummary).toContain("A=0");
  });

  it("summarizes all target rows for gates with more than one valid answer", () => {
    const level = levelsByDifficulty.easy[7];

    const feedback = getPracticeFeedback(level, { A: true, B: false }, false);

    expect(feedback.rule).toMatch(
      /XNOR se enciende cuando las entradas son iguales/i,
    );
    expect(feedback.targetSummary).toContain("A=0 · B=0");
    expect(feedback.targetSummary).toContain("A=1 · B=1");
  });
});
