import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  GateName,
  InputName,
  LevelDefinition,
} from "../../core/gameTypes";
import { levelsByDifficulty } from "../../data/levels";
import { CircuitBoard } from "./CircuitBoard";

const repeatedAndLevel = {
  id: "hard-8",
  difficulty: "hard",
  levelNumber: 8,
  title: "Reto sintético - AND",
  inputs: ["A", "B", "C"],
  gates: ["AND"],
  circuit: {
    inputs: ["A", "B", "C"],
    output: {
      type: "gate",
      gate: "AND",
      inputs: [
        {
          type: "gate",
          gate: "AND",
          inputs: [
            { type: "input", name: "A" },
            { type: "input", name: "B" },
          ],
        },
        { type: "input", name: "C" },
      ],
    },
  },
  feedbackCorrect: "Las dos compuertas AND están activas.",
  feedbackIncorrect: "Revisa las dos etapas AND.",
} satisfies LevelDefinition;

const unsupportedGate = "BUFFER" as GateName;

const unsupportedGateLevel = {
  id: "easy-8",
  difficulty: "easy",
  levelNumber: 8,
  title: "Práctica sintética - BUFFER",
  inputs: ["A"],
  gates: [unsupportedGate],
  circuit: {
    inputs: ["A"],
    output: {
      type: "gate",
      gate: unsupportedGate,
      inputs: [{ type: "input", name: "A" }],
    },
  },
  feedbackCorrect: "La compuerta transmite la entrada.",
  feedbackIncorrect: "Revisa la entrada.",
} satisfies LevelDefinition;

const excessiveGateSourcesLevel = {
  id: "easy-9",
  difficulty: "easy",
  levelNumber: 9,
  title: "Práctica sintética - AND de tres entradas",
  inputs: ["A", "B", "C"],
  gates: ["AND"],
  circuit: {
    inputs: ["A", "B", "C"],
    output: {
      type: "gate",
      gate: "AND",
      inputs: [
        { type: "input", name: "A" },
        { type: "input", name: "B" },
        { type: "input", name: "C" },
      ],
    },
  },
  feedbackCorrect: "Las tres entradas están activas.",
  feedbackIncorrect: "Revisa las tres entradas.",
} satisfies LevelDefinition;

const inputE = "E" as InputName;

const excessiveDeclaredInputsLevel = {
  id: "easy-10",
  difficulty: "easy",
  levelNumber: 10,
  title: "Práctica sintética - cinco entradas",
  inputs: ["A", "B", "C", "D", inputE],
  gates: ["AND"],
  circuit: {
    inputs: ["A", "B", "C", "D", inputE],
    output: {
      type: "gate",
      gate: "AND",
      inputs: [
        { type: "input", name: "A" },
        { type: "input", name: "B" },
      ],
    },
  },
  feedbackCorrect: "Las entradas A y B están activas.",
  feedbackIncorrect: "Revisa las entradas A y B.",
} satisfies LevelDefinition;

const excessiveTopologyDepthLevel = {
  id: "hard-9",
  difficulty: "hard",
  levelNumber: 9,
  title: "Reto sintético - profundidad cuatro",
  inputs: ["A", "B", "C", "D"],
  gates: ["AND"],
  circuit: {
    inputs: ["A", "B", "C", "D"],
    output: {
      type: "gate",
      gate: "AND",
      inputs: [
        {
          type: "gate",
          gate: "AND",
          inputs: [
            {
              type: "gate",
              gate: "AND",
              inputs: [
                {
                  type: "gate",
                  gate: "AND",
                  inputs: [
                    { type: "input", name: "A" },
                    { type: "input", name: "B" },
                  ],
                },
                { type: "input", name: "C" },
              ],
            },
            { type: "input", name: "D" },
          ],
        },
        { type: "input", name: "A" },
      ],
    },
  },
  feedbackCorrect: "La cadena AND está activa.",
  feedbackIncorrect: "Revisa la cadena AND.",
} satisfies LevelDefinition;

describe("CircuitBoard", () => {
  it("rejects unsupported runtime gate values", () => {
    expect(() =>
      render(
        <CircuitBoard
          heading="Práctica sintética"
          inputStates={{ A: false }}
          level={unsupportedGateLevel}
          pulse={null}
          result={false}
          onToggleInput={vi.fn()}
        />,
      ),
    ).toThrow(/unsupported gate.*buffer/i);
  });

  it("rejects gates beyond the supported source capacity", () => {
    expect(() =>
      render(
        <CircuitBoard
          heading="Práctica sintética"
          inputStates={{ A: false, B: false, C: false }}
          level={excessiveGateSourcesLevel}
          pulse={null}
          result={false}
          onToggleInput={vi.fn()}
        />,
      ),
    ).toThrow(
      /circuit layout supports at most 2 sources per gate; AND received 3\./i,
    );
  });

  it("rejects levels beyond the supported declared-input capacity", () => {
    expect(() =>
      render(
        <CircuitBoard
          heading="Práctica sintética"
          inputStates={{ A: false, B: false, C: false, D: false }}
          level={excessiveDeclaredInputsLevel}
          pulse={null}
          result={false}
          onToggleInput={vi.fn()}
        />,
      ),
    ).toThrow(/circuit layout supports at most 4 inputs; received 5\./i);
  });

  it("rejects circuits beyond the supported topology depth", () => {
    expect(() =>
      render(
        <CircuitBoard
          heading="Reto sintético"
          inputStates={{ A: false, B: false, C: false, D: false }}
          level={excessiveTopologyDepthLevel}
          pulse={null}
          result={false}
          revealOutput={false}
          onToggleInput={vi.fn()}
        />,
      ),
    ).toThrow(
      /circuit layout supports a maximum depth of 3; received 4\./i,
    );
  });
  it("renders repeated gates from circuit topology instead of gate metadata", () => {
    const { container } = render(
      <CircuitBoard
        heading="Reto sintético"
        inputStates={{ A: true, B: true, C: true }}
        level={repeatedAndLevel}
        pulse={null}
        result={true}
        revealOutput={true}
        onToggleInput={vi.fn()}
      />,
    );

    const gateLabels = [
      ...container.querySelectorAll<SVGTextElement>(".level-gate-text"),
    ].map((gate) => gate.textContent);
    const pathData = [
      ...container.querySelectorAll<SVGPathElement>("path[d]"),
    ].map((path) => path.getAttribute("d") ?? "");

    expect.soft(gateLabels).toHaveLength(2);
    expect.soft(gateLabels).toEqual(["AND", "AND"]);
    expect
      .soft(container.querySelectorAll(".level-wire-base"))
      .toHaveLength(5);
    expect.soft(pathData.some((path) => path.includes("undefined"))).toBe(false);
    expect.soft(pathData.some((path) => path.includes("NaN"))).toBe(false);
  });

  it("routes repeated-gate hotspots from the visual circuit topology", () => {
    const onToggleInput = vi.fn();
    const boardWidth = 257.1875;
    const boardHeight = (boardWidth * 480) / 860;
    render(
      <CircuitBoard
        heading="Reto sintético"
        inputStates={{ A: false, B: false, C: false }}
        level={repeatedAndLevel}
        pulse={null}
        result={false}
        revealOutput={false}
        onToggleInput={onToggleInput}
      />,
    );

    const controls = screen.getByRole("group", {
      name: "Controles del circuito",
    });
    vi.spyOn(controls, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: boardWidth,
      height: boardHeight,
    } as DOMRect);

    fireEvent.click(screen.getByRole("button", { name: /nodo de entrada c/i }), {
      clientX: (88 / 860) * boardWidth,
      clientY: (376 / 480) * boardHeight,
      detail: 1,
    });

    expect(onToggleInput).toHaveBeenCalledTimes(1);
    expect(onToggleInput).toHaveBeenCalledWith("C");
  });

  it("routes overlapping pointer clicks to the nearest visual input", () => {
    const onToggleInput = vi.fn();
    const boardWidth = 257.1875;
    const boardHeight = (boardWidth * 480) / 860;
    render(
      <CircuitBoard
        heading="Reto 5"
        inputStates={{ A: true, B: false, C: false, D: false }}
        level={levelsByDifficulty.hard[5]}
        pulse={null}
        result={false}
        revealOutput={false}
        onToggleInput={onToggleInput}
      />,
    );

    const controls = screen.getByRole("group", {
      name: "Controles del circuito",
    });
    vi.spyOn(controls, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: boardWidth,
      height: boardHeight,
    } as DOMRect);

    const clickVisualInput = (
      eventTarget: HTMLElement,
      visualY: number,
    ) => {
      fireEvent.click(eventTarget, {
        clientX: (88 / 860) * boardWidth,
        clientY: (visualY / 480) * boardHeight,
        detail: 1,
      });
    };

    clickVisualInput(
      screen.getByRole("button", { name: /nodo de entrada b/i }),
      82,
    );
    clickVisualInput(
      screen.getByRole("button", { name: /nodo de entrada d/i }),
      336,
    );

    expect(onToggleInput.mock.calls).toEqual([["A"], ["C"]]);
  });

  it("renders one finite signal layer for each challenge wire", () => {
    const { container } = render(
      <CircuitBoard
        heading="Reto 7"
        inputStates={{ A: true, B: true, C: true, D: true }}
        level={levelsByDifficulty.hard[7]}
        pulse={null}
        result={true}
        revealOutput={true}
        onToggleInput={vi.fn()}
      />,
    );

    const wireSelector = [
      ".level-wire-base",
      ".level-wire-signal",
      ".level-wire-packet",
      ".level-wire-off",
    ].join(", ");

    expect(container.querySelectorAll(".level-wire-base")).toHaveLength(7);
    expect(container.querySelectorAll(".level-wire-signal")).toHaveLength(7);
    expect(container.querySelectorAll(".level-wire-off")).toHaveLength(7);
    expect(container.querySelectorAll(".level-wire-packet")).toHaveLength(0);
    expect(container.querySelectorAll(wireSelector)).toHaveLength(21);
  });

  it("connects the root AND output to the LED without reversing", () => {
    const { container } = render(
      <CircuitBoard
        heading="Reto 5"
        inputStates={{ A: true, B: false, C: false, D: false }}
        level={levelsByDifficulty.hard[5]}
        pulse={null}
        result={false}
        revealOutput={false}
        onToggleInput={vi.fn()}
      />,
    );

    const rootOutputWire = [
      ...container.querySelectorAll<SVGPathElement>(".level-wire-base"),
    ].at(-1);
    const coordinates = rootOutputWire
      ?.getAttribute("d")
      ?.match(
        /^M(?<originX>\d+(?:\.\d+)?) [\d.]+ H(?<destinationX>\d+(?:\.\d+)?)$/,
      );

    expect(coordinates?.groups).toBeDefined();

    const originX = Number(coordinates?.groups?.originX);
    const destinationX = Number(coordinates?.groups?.destinationX);

    expect(originX).toBe(740);
    expect(destinationX).toBe(744);
    expect(originX).toBeLessThanOrEqual(destinationX);
  });

  it("describes challenge topology in signal-flow order", () => {
    render(
      <CircuitBoard
        heading="Reto 5"
        inputStates={{ A: true, B: false, C: false, D: false }}
        level={levelsByDifficulty.hard[5]}
        pulse={null}
        result={false}
        revealOutput={false}
        onToggleInput={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: /reto 5/i }))
      .toHaveAccessibleDescription(
        "Topología del circuito. Compuerta 1, NOR: recibe la entrada A y la entrada B. Compuerta 2, XOR: recibe la salida de la compuerta 1 y la entrada C. Compuerta 3, AND: recibe la salida de la compuerta 2 y la entrada D. La salida del circuito recibe la salida de la compuerta 3.",
      );
  });
});
