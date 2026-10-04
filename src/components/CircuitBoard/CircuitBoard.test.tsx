import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  CircuitNode,
  GateName,
  InputName,
  LevelDefinition,
} from "../../core/gameTypes";
import { allLevels, levelsByDifficulty } from "../../data/levels";
import { CircuitBoard } from "./CircuitBoard";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  it("toggles the receiving button once even at another inputs old coordinates", () => {
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

    // Proximity routing hid intersections by breaking receiver/action identity.
    expect(onToggleInput.mock.calls).toEqual([["B"], ["D"]]);
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

// Rectangles here are layout inputs, not evidence of physical browser targets.
describe.each([257, 319, 528, 860])("shared geometry at stage width %s", (width) => {
  it.each([...allLevels, repeatedAndLevel] as LevelDefinition[])("keeps controls and every wire port coherent for $id", (level) => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { width: this.classList.contains("level-node-hotspot") ? 48 : width, height: 48 } as DOMRect;
    });
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    const toggle = vi.fn();
    const props = { heading: level.title, level, pulse: null, result: true, revealOutput: false, onToggleInput: toggle } as const;
    const { container, rerender } = render(<CircuitBoard {...props} inputStates={{}} />);
    const svg = screen.getByRole("img");
    const [, , viewWidth, viewHeight] = svg.getAttribute("viewBox")!.split(" ").map(Number);
    const circles = [...container.querySelectorAll<SVGCircleElement>(".level-node")];
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(level.inputs.length);
    expect(container.querySelectorAll("svg button, svg [tabindex]")).toHaveLength(0);
    const nodes = circles.map((node) => ({x: Number(node.getAttribute("cx")), y: Number(node.getAttribute("cy"))}));
    for (let i = 0; i < nodes.length; i++) {
      expect(buttons[i]).toHaveAccessibleName(new RegExp(`entrada ${level.inputs[i]} apagada`, "i"));
      expect(buttons[i]).toHaveAttribute("aria-pressed", "false");
      expect.soft(buttons[i].textContent).toBe(`${level.inputs[i]}0`);
      expect(parseFloat(buttons[i].style.left)).toBeCloseTo(nodes[i].x / viewWidth * 100);
      expect(parseFloat(buttons[i].style.top)).toBeCloseTo(nodes[i].y / viewHeight * 100);
      if (i) expect((nodes[i].y - nodes[i-1].y) * width / viewWidth - 48).toBeGreaterThanOrEqual(12 - 1e-6);
    }
    const gates = [...container.querySelectorAll(".level-gate-text")].map((label) => {
      const [x,y] = label.parentElement!.getAttribute("transform")!.match(/[-\d.]+/g)!.map(Number);
      return { x, y };
    });
    const wires = [...container.querySelectorAll(".level-wire-base")].map((wire) => wire.getAttribute("d")!);
    let gateIndex = 0; let wireIndex = 0;
    const outputOffset = { AND:132, OR:150, NOT:164, NAND:164, NOR:184, XOR:150, XNOR:184 };
    const single = gates.length === 1;
    function check(node: CircuitNode): {x:number; y:number} {
      if (node.type === "input") { const pos = nodes[level.inputs.indexOf(node.name)]; return { x: pos.x + (single ? 0 : 30), y:pos.y }; }
      const children = node.inputs.map(check);
      const gate = gates[gateIndex++];
      children.forEach((child,i) => {
        const nums = wires[wireIndex++].match(/[-\d.]+/g)!.map(Number);
        const port = node.inputs.length === 1 ? 60 : single ? (i === 0 ? 30 : 90) : (i === 0 ? 38 : 82);
        expect(nums.slice(0,2)).toEqual([child.x,child.y]);
        expect(nums.slice(-2)).toEqual([gate.x,gate.y + port]);
      });
      return { x:gate.x + outputOffset[node.gate], y:gate.y+60 };
    }
    const root = check(level.circuit.output);
    const led = container.querySelector(".level-led")!;
    const last = wires[wireIndex++].match(/[-\d.]+/g)!.map(Number);
    expect(last).toEqual([root.x,root.y,Number(led.getAttribute("x"))]);
    expect(Number(led.getAttribute("y")) + 41).toBe(root.y);
    expect(wireIndex).toBe(wires.length);
    expect(wires.join(" ")).not.toMatch(/NaN|undefined|Infinity/);
    expect(nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y))).toBe(true);
    expect(container.querySelectorAll(".level-wire-signal")).toHaveLength(wires.length);
    if (!single) {
      expect(svg).toHaveAccessibleName(/salida oculta/i);
      expect(container.querySelector(".level-output-text")).toHaveTextContent("?");
      expect(container.querySelectorAll(".level-gate-shell")[gates.length-1]).not.toHaveClass("is-complete");
    }
    rerender(<CircuitBoard {...props} inputStates={Object.fromEntries(level.inputs.map((input) => [input,true]))} />);
    const updated = screen.getAllByRole("button");
    updated.forEach((button,i) => {
      expect(button).toBe(buttons[i]);
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(button).toHaveAccessibleName(new RegExp(`entrada ${level.inputs[i]} encendida`, "i"));
      expect(button.textContent).toBe(`${level.inputs[i]}1`);
      fireEvent.click(button);
    });
    expect(toggle.mock.calls).toEqual(level.inputs.map((input) => [input]));
  });
});

describe("measurement lifecycle", () => {
  it("preserves the same buttons and values across measured resize and disconnects", () => {
    let width = 860;
    let size = 68;
    let notify = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { width: this.classList.contains("level-node-hotspot") ? size : width, height:size } as DOMRect;
    });
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const { unmount } = render(<CircuitBoard heading="Reto 5" level={levelsByDifficulty.hard[5]} inputStates={{ A:true }} pulse={null} result={false} revealOutput={false} onToggleInput={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(observe).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("img")).toHaveAttribute("viewBox", "0 0 860 480");
    for (const next of [[528,68], [257,96], [860,68]]) {
      [width,size] = next;
      act(() => notify());
      const current = screen.getAllByRole("button");
      current.forEach((button,i) => expect(button).toBe(buttons[i]));
      expect(current[0]).toHaveAttribute("aria-pressed", "true");
      const svg = screen.getByRole("img");
      const [, , viewWidth] = svg.getAttribute("viewBox")!.split(" ").map(Number);
      const y = [...document.querySelectorAll(".level-node")].map((node) => Number(node.getAttribute("cy")));
      for (let i=1; i<y.length; i++) expect((y[i]-y[i-1])*width/viewWidth-size).toBeGreaterThanOrEqual(12-1e-6);
    }
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});

describe("enlarged control content", () => {
  it("reserves the larger target dimension when text increases its height", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { width: this.classList.contains("level-node-hotspot") ? 48 : 257, height:96 } as DOMRect;
    });
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    const { container } = render(<CircuitBoard heading="Reto 5" level={levelsByDifficulty.hard[5]} inputStates={{}} pulse={null} result={false} onToggleInput={vi.fn()} />);
    const [, , width] = screen.getByRole("img").getAttribute("viewBox")!.split(" ").map(Number);
    const y = [...container.querySelectorAll(".level-node")].map((node) => Number(node.getAttribute("cy")));
    for (let i=1; i<y.length; i++) expect((y[i]-y[i-1])*257/width-96).toBeGreaterThanOrEqual(12-1e-6);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});


describe("input labels with node controls", () => {
  it.each([levelsByDifficulty.easy[1], levelsByDifficulty.hard[5]])(
    "keeps input information in controls and accessible SVG, without auxiliary labels for $id",
    (level) => {
      const onToggleInput = vi.fn();
      const props = {
        heading: level.title,
        level,
        pulse: null,
        revealOutput: level.difficulty === "easy",
        onToggleInput,
      } as const;
      const { rerender } = render(
        <CircuitBoard {...props} inputStates={{}} result={false} />,
      );
      const controls = screen.getByRole("group", {
        name: "Controles del circuito",
      });
      const buttons = screen.getAllByRole("button");

      for (const isOn of [false, true]) {
        const value = isOn ? "1" : "0";
        rerender(
          <CircuitBoard
            {...props}
            inputStates={Object.fromEntries(level.inputs.map((input) => [input, isOn]))}
            result={isOn}
          />,
        );
        const svg = screen.getByRole("img");
        const auxiliaryLabels = [...svg.querySelectorAll("text")].filter(
          (label) => /^[A-D]\s*=\s*[01]$/.test(label.textContent ?? ""),
        );
        expect.soft(auxiliaryLabels.map((label) => label.textContent)).toEqual([]);
        expect(svg.querySelectorAll(".level-node")).toHaveLength(level.inputs.length);
        expect(svg).toHaveAccessibleDescription(/topología del circuito.*la salida del circuito recibe/i);
        expect(controls.querySelectorAll("button")).toHaveLength(level.inputs.length);

        level.inputs.forEach((input, index) => {
          const button = screen.getByRole("button", {
            name: new RegExp(`nodo de entrada ${input} `, "i"),
          });
          expect(button).toBe(buttons[index]);
          expect(button.textContent).toBe(`${input}${value}`);
          expect(button).toHaveAttribute("aria-pressed", String(isOn));
          expect(button).toHaveAccessibleName(
            `Nodo de entrada ${input} ${isOn ? "encendida" : "apagada"}. Tocar para ${isOn ? "apagar" : "encender"}.`,
          );
          expect(svg.getAttribute("aria-label")).toContain(`${input} igual ${value}`);
          fireEvent.click(button);
        });
        expect(svg.querySelector(".level-output-text + .level-svg-small")).toHaveTextContent(
          props.revealOutput ? `Salida ${isOn ? "encendida" : "apagada"}` : "Salida oculta",
        );
        if (!props.revealOutput) {
          expect(svg).toHaveAccessibleName(/salida oculta hasta enviar respuesta/i);
          expect(svg.querySelector(".level-output-text")).toHaveTextContent("?");
        }
      }
      expect(onToggleInput.mock.calls).toEqual(
        [...level.inputs, ...level.inputs].map((input) => [input]),
      );
    },
  );
});
