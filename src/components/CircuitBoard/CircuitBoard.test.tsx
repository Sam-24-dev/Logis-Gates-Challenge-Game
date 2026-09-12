import { fireEvent, render, screen } from "@testing-library/react";
import { levelsByDifficulty } from "../../data/levels";
import { CircuitBoard } from "./CircuitBoard";

describe("CircuitBoard mobile hit testing", () => {
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
});
