import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { levelsByDifficulty } from "../../data/levels";
import { CircuitBoard } from "./CircuitBoard";

describe("CircuitBoard", () => {
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
