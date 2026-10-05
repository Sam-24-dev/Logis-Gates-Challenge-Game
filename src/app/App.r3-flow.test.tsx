import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { progressStorageKey } from "../core/progress";
import { App } from "./App";

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("R3 real App flow", () => {
  it("recovers Send after an error without resetting time, score or progress when help toggles", async () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
    const turn = within(
      await screen.findByRole("region", { name: "Estado y acción del nivel" }),
    );
    const send = turn.getByRole("button", { name: "Enviar respuesta" });
    now = 8000;
    fireEvent.click(send);
    expect(turn.getByText(/cambia una entrada para habilitar/i)).toBeVisible();
    expect(send).toBeDisabled();
    expect(screen.getByRole("img", { name: /salida actual 0/i })).toBeInTheDocument();
    expect(screen.getByText("00:07")).toBeInTheDocument();
    const beforeProgress = window.localStorage.getItem(progressStorageKey);
    const summary = screen.getByText("Ver instrucciones del reto", { selector: "summary" });
    fireEvent.click(summary);
    fireEvent.click(summary);
    expect(send).toBeDisabled();
    expect(screen.getByText("00:07")).toBeInTheDocument();
    expect(window.localStorage.getItem(progressStorageKey)).toBe(beforeProgress);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    now = 17000;
    const controls = within(screen.getByRole("group", { name: "Controles del circuito" }));
    fireEvent.click(controls.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(controls.getByRole("button", { name: /entrada c/i }));
    expect(send).toBeEnabled();
    expect(turn.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("img", { name: /salida oculta hasta enviar/i })).toBeInTheDocument();
    fireEvent.click(send);
    expect(await screen.findByRole("heading", { name: /reto 2: OR/i })).toBeInTheDocument();
    expect(screen.getByText(/\+1256 puntos/i)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Estado del reto" })).getByText("1256")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ challengeCompletedLevels: 1, bestChallengeStreak: 1 });
    expect(screen.getByText("Ver instrucciones del reto", { selector: "summary" }).closest("details")).not.toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar carrera" }));
    expect(await screen.findByRole("heading", { name: /reto 1: XOR/i })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Estado del reto" })).getByText("0")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ challengeCompletedLevels: 1, bestChallengeStreak: 1 });
  });

  it("advances practice outside closed help and restarts only its current level", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));
    fireEvent.click(await screen.findByRole("button", { name: /entrada b/i }));
    const next = screen.getByRole("button", { name: "Continuar" });
    expect(next.closest("details")).toBeNull();
    fireEvent.click(next);
    expect(await screen.findByRole("heading", { name: /nivel 2: compuerta OR/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByText("Ver pista y tabla de verdad", { selector: "summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByRole("heading", { name: /nivel 2: compuerta OR/i })).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("Entradas A 0, B 0. Salida 0.");
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}")).toMatchObject({ practiceCompletedLevels: 1 });
  });
});
