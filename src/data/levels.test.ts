import { describe, expect, it } from "vitest";
import { evaluateCircuit } from "../core/evaluateCircuit.ts";
import type { CircuitNode } from "../core/gameTypes.ts";
import { generateTruthTable } from "../core/truthTable.ts";
import { gateDefinitions } from "./gates.ts";
import { allLevels, levelsByDifficulty } from "./levels.ts";

describe("levelsByDifficulty", () => {
  it("contains the guided practice route and a seven-level challenge route", () => {
    expect(Object.keys(levelsByDifficulty.easy)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
    expect(Object.keys(levelsByDifficulty.hard)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
    expect(allLevels).toHaveLength(14);
  });

  it.each(
    (["easy", "hard"] as const).flatMap((difficulty) =>
      Object.entries(levelsByDifficulty[difficulty]).map(([number, level]) => ({
        difficulty,
        number: Number(number),
        level,
      })),
    ),
  )("keeps $difficulty-$number consistent with its circuit", ({
    difficulty,
    number,
    level,
  }) => {
    expect(level).toMatchObject({
      id: `${difficulty}-${number}`,
      difficulty,
      levelNumber: number,
    });
    expect(level.circuit.inputs).toEqual(level.inputs);
    expect(new Set(level.inputs).size).toBe(level.inputs.length);
    expect(new Set(level.gates).size).toBe(level.gates.length);

    const inputs = new Set<string>();
    const gates = new Set<string>();
    function visit(node: CircuitNode) {
      if (node.type === "input") {
        inputs.add(node.name);
        return;
      }

      gates.add(node.gate);
      expect(node.inputs).toHaveLength(gateDefinitions[node.gate].inputCount);
      node.inputs.forEach(visit);
    }
    visit(level.circuit.output);

    expect([...inputs].sort()).toEqual([...level.inputs].sort());
    expect([...gates].sort()).toEqual([...level.gates].sort());

    const rows = generateTruthTable(level.circuit);
    expect(rows).toHaveLength(2 ** level.inputs.length);
    expect(rows.some((row) => row.output)).toBe(true);
  });

  it("keeps display metadata needed by the current UI", () => {
    expect(levelsByDifficulty.easy[1]).toMatchObject({
      id: "easy-1",
      title: "Práctica - AND",
      inputs: ["A", "B"],
      gates: ["AND"],
    });
    expect(levelsByDifficulty.easy[7]).toMatchObject({
      id: "easy-7",
      title: "Práctica - XNOR",
      inputs: ["A", "B"],
      gates: ["XNOR"],
    });
    expect(levelsByDifficulty.hard[2]).toMatchObject({
      id: "hard-2",
      title: "Reto 2 - OR",
      inputs: ["A", "B", "C"],
      gates: ["OR", "AND"],
    });
    expect(levelsByDifficulty.hard[7]).toMatchObject({
      id: "hard-7",
      title: "Reto 7 - XNOR",
      inputs: ["A", "B", "C", "D"],
      gates: ["XNOR", "NAND", "AND"],
    });
  });

  it("describes hard 5 victories whether NOR is on or off", () => {
    const level = levelsByDifficulty.hard[5];
    const victories = Array.from({ length: 16 }, (_, value) =>
      value.toString(2).padStart(4, "0"),
    )
      .map((bits) => {
        const [A, B, C, D] = [...bits].map((bit) => bit === "1");
        return { bits, inputs: { A, B, C, D }, norOn: !A && !B };
      })
      .filter(({ inputs }) => evaluateCircuit(level.circuit, inputs));

    expect(victories.map(({ bits, norOn }) => [bits, norOn])).toEqual([
      ["0001", true],
      ["0111", false],
      ["1011", false],
      ["1111", false],
    ]);
    expect(level.feedbackCorrect).toBe(
      "XOR comparó la salida de NOR con C y D confirmó la señal final.",
    );
  });

  it("distributes the seven learned gates across the challenge route", () => {
    const challengeGates = new Set(
      Object.values(levelsByDifficulty.hard).flatMap((level) => level.gates),
    );

    expect([...challengeGates].sort()).toEqual([
      "AND",
      "NAND",
      "NOR",
      "NOT",
      "OR",
      "XNOR",
      "XOR",
    ]);
  });
});
