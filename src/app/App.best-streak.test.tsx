import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultProgress, progressStorageKey } from "../core/progress";
import { levelsByDifficulty } from "../data/levels";
import { App } from "./App";

const levels = Object.values(levelsByDifficulty.hard);
const solutions = ["101", "101", "011", "011", "1011", "1110", "1101"];

async function startChallenge() {
  fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
  const modes = within(screen.getByRole("region", { name: /ahora elige cómo avanzar/i }));
  fireEvent.click(modes.getByRole("button", { name: /iniciar reto/i }));
  await screen.findByRole("group", { name: "Controles del circuito" });
}

function setInputs(levelNumber: number, bits: string) {
  const controls = within(screen.getByLabelText("Controles del circuito"));
  levels[levelNumber - 1].inputs.forEach((input, index) => {
    const button = controls.getByRole("button", { name: new RegExp("entrada " + input, "i") });
    const pressed = String(bits[index] === "1");
    if (button.getAttribute("aria-pressed") !== pressed) fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", pressed);
  });
}

function turn() {
  return within(screen.getByLabelText("Estado y acción del nivel"));
}

function solveLevel(levelNumber: number) {
  setInputs(levelNumber, solutions[levelNumber - 1]);
  fireEvent.click(turn().getByRole("button", { name: "Enviar respuesta" }));
}

function expectActiveStreak(streak: number) {
  expect(within(screen.getByLabelText("Estado del reto")).getByText("x" + streak)).toBeInTheDocument();
}

describe("challenge run best streak", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(performance, "now").mockReturnValue(1000);
  });

  afterEach(() => vi.restoreAllMocks());

  it.each([[1, false], [2, false], [1, true]] as const)("shows the run peak of five, final streak two and historical seven after %i errors (storage rejected: %s)", async (errors, storageRejected) => {
    window.localStorage.setItem(progressStorageKey, JSON.stringify({ ...defaultProgress, bestChallengeStreak: 7 }));
    const rejectedWrite = storageRejected
      ? vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
          throw new DOMException("storage full", "QuotaExceededError");
        })
      : null;
    render(<App />);
    await startChallenge();
    for (let levelNumber = 1; levelNumber <= 5; levelNumber++) solveLevel(levelNumber);
    expectActiveStreak(5);

    const send = turn().getByRole("button", { name: "Enviar respuesta" });
    for (let miss = 0; miss < errors; miss++) {
      if (miss > 0) setInputs(6, "1001");
      expect(send).toBeEnabled();
      fireEvent.click(send);
      expect(send).toBeDisabled();
      expectActiveStreak(0);
      expect(turn().getByRole("status")).toHaveTextContent(/racha rota/i);
    }
    solveLevel(6);
    expectActiveStreak(1);
    solveLevel(7);

    await screen.findByRole("heading", { name: "Reto completado" });
    expect(screen.getByText("Puntos").parentElement).toHaveTextContent(String(12830 - errors * 150));
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ version: 1, bestChallengeStreak: 7 });
    expect(screen.getByText("Mejor racha").parentElement).toHaveTextContent("x5");
    if (rejectedWrite) {
      expect(rejectedWrite).toHaveBeenCalled();
      expect(screen.queryByText(/récord guardado/i)).not.toBeInTheDocument();
    }
  }, 10000);

  it.each(["restart", "results", "menu"] as const)("does not carry the prior peak into a new run via %s", async (entry) => {
    render(<App />);
    await startChallenge();
    const priorPeak = entry === "restart" ? levels.length - 1 : levels.length;
    for (let levelNumber = 1; levelNumber <= priorPeak; levelNumber++) solveLevel(levelNumber);

    if (entry === "restart") {
      expectActiveStreak(priorPeak);
      fireEvent.click(screen.getByRole("button", { name: "Reiniciar carrera" }));
    } else {
      await screen.findByRole("heading", { name: "Reto completado" });
      expect(screen.getByText("Mejor racha").parentElement).toHaveTextContent("x" + priorPeak);
      const actions = within(screen.getByLabelText("Acciones de resultado"));
      if (entry === "results") {
        fireEvent.click(actions.getByRole("button", { name: "Iniciar reto" }));
      } else {
        fireEvent.click(actions.getByRole("button", { name: "Volver al inicio" }));
        await startChallenge();
      }
    }

    await screen.findByRole("group", { name: "Controles del circuito" });
    expectActiveStreak(0);
    const hud = within(screen.getByLabelText("Estado del reto"));
    expect(hud.getByText("0")).toBeInTheDocument();
    expect(hud.getByText("00:00")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ bestChallengeStreak: priorPeak });

    for (let levelNumber = 1; levelNumber <= levels.length; levelNumber++) {
      if (levelNumber === 3) {
        fireEvent.click(turn().getByRole("button", { name: "Enviar respuesta" }));
        expectActiveStreak(0);
      }
      solveLevel(levelNumber);
    }

    await screen.findByRole("heading", { name: "Reto completado" });
    expect(screen.getByText("Mejor racha").parentElement).toHaveTextContent("x5");
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ bestChallengeStreak: priorPeak });
  });
});
