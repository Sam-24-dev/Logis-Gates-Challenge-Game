import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { levelsByDifficulty } from "../data/levels";
import { LevelScreen } from "./LevelScreen";

function practiceProps(levelNumber = 1) {
  return {
    currentLevel: levelNumber,
    difficulty: "easy" as const,
    inputStates: { A: levelNumber !== 3, B: true },
    level: levelsByDifficulty.easy[levelNumber],
    result: true,
    totalLevels: 7,
    onBackToMode: vi.fn(),
    onNextLevel: vi.fn(),
    onRetry: vi.fn(),
    onToggleInput: vi.fn(),
  };
}

function challengeProps() {
  return {
    ...practiceProps(),
    difficulty: "hard" as const,
    level: levelsByDifficulty.hard[1],
    inputStates: { A: false, B: false, C: false },
    result: false,
    challengeState: {
      elapsedSeconds: 12,
      hasSubmittedCurrentLevel: true,
      lastPoints: 0,
      lastWasCorrect: false,
      score: 0,
      streak: 0,
      submissionLocked: true,
      wrongSubmissions: 1,
    },
    onChallengeReady: vi.fn(),
    onSubmitAnswer: vi.fn(),
  };
}

describe("LevelScreen R3", () => {
  it.each([1, 3])("keeps practice orientation and Continue outside native help at level %i", (levelNumber) => {
    render(<LevelScreen {...practiceProps(levelNumber)} />);
    const summary = screen.getByText("Ver pista y tabla de verdad", { selector: "summary" });
    const help = summary.closest("details")!;
    const title = screen.getByText("Tabla " + levelsByDifficulty.easy[levelNumber].gates[0]);
    const next = screen.getByRole("button", { name: "Continuar" });

    expect(help).not.toHaveAttribute("open");
    expect(title).not.toBeVisible();
    expect(screen.getByText(/tu objetivo es conseguir una salida/i)).toBeVisible();
    expect(screen.getByText("Regla lógica")).toBeVisible();
    expect(next.closest("details")).toBeNull();
    expect(next.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(screen.queryByRole("button", { name: "Enviar respuesta" })).not.toBeInTheDocument();

    fireEvent.click(summary);
    expect(help).toHaveAttribute("open");
    expect(title).toBeVisible();
    expect(screen.getByRole("table", { name: /tabla de verdad/i })).toBeVisible();
    fireEvent.click(summary);
    expect(title).not.toBeVisible();
    expect(next).toBeVisible();
  });

  it("keeps one atomic practice announcement independent of help", () => {
    const props = practiceProps();
    const { rerender } = render(<LevelScreen {...props} />);
    fireEvent.click(screen.getByText("Ver pista y tabla de verdad", { selector: "summary" }));
    const status = screen.getByRole("status");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status.textContent).toBe("Entradas A 1, B 1. Salida 1.");
    expect(status.closest("details")).toBeNull();
    rerender(<LevelScreen {...props} inputStates={{ A: true, B: false }} result={false} />);
    expect(status.textContent).toBe("Entradas A 1, B 0. Salida 0.");
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("groups the locked challenge feedback with Send and keeps general instructions non-spoiling", () => {
    const props = challengeProps();
    const { rerender } = render(<LevelScreen {...props} />);
    const turn = screen.getByRole("region", { name: "Estado y acción del nivel" });
    const send = within(turn).getByRole("button", { name: "Enviar respuesta" });
    const recovery = within(turn).getByText(/cambia una entrada para habilitar/i);
    const summary = screen.getByText("Ver instrucciones del reto", { selector: "summary" });
    expect(send).toBeDisabled();
    expect(recovery).toBeVisible();
    expect(send.closest("details")).toBeNull();
    expect(recovery.compareDocumentPosition(send) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(screen.getByText("Enviar comprueba la salida. El reloj continúa entre intentos.")).toBeVisible();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    fireEvent.click(summary);
    expect(summary.closest("details")).toHaveAttribute("open");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Pista")).not.toBeInTheDocument();
    expect(screen.queryByText("Filas objetivo")).not.toBeInTheDocument();
    expect(screen.queryByText("Regla lógica")).not.toBeInTheDocument();
    expect(send).toBeDisabled();

    rerender(<LevelScreen {...props} inputStates={{ A: true, B: false, C: false }} challengeState={{ ...props.challengeState, hasSubmittedCurrentLevel: false, lastWasCorrect: null, submissionLocked: false }} />);
    expect(send).toBeEnabled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.queryByText(/cambia una entrada para habilitar/i)).not.toBeInTheDocument();
    fireEvent.click(send);
    expect(props.onSubmitAnswer).toHaveBeenCalledOnce();
  });

  it("preserves the existing practice controls and callbacks outside help", () => {
    const props = practiceProps();
    render(<LevelScreen {...props} />);
    const next = screen.getByRole("button", { name: "Continuar" });
    const restart = screen.getByRole("button", { name: "Reiniciar" });
    const back = screen.getByRole("button", { name: "Volver al modo" });
    expect(screen.getAllByRole("button", { name: /nodo de entrada/i })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /nodo de entrada b/i }));
    fireEvent.click(next);
    fireEvent.click(restart);
    fireEvent.click(back);
    expect(props.onToggleInput).toHaveBeenCalledExactlyOnceWith("B");
    expect(props.onNextLevel).toHaveBeenCalledOnce();
    expect(props.onRetry).toHaveBeenCalledOnce();
    expect(props.onBackToMode).toHaveBeenCalledOnce();
    for (const button of [next, restart, back]) expect(button.closest("details")).toBeNull();
  });

  it("names challenge restart as a whole race without changing its callback", () => {
    const props = challengeProps();
    render(<LevelScreen {...props} />);
    const restart = screen.getByRole("button", { name: "Reiniciar carrera" });
    expect(restart.closest("details")).toBeNull();
    fireEvent.click(restart);
    expect(props.onRetry).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
  });
});
