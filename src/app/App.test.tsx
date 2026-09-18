import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { progressStorageKey } from "../core/progress.ts";
import { App } from "./App";

function solveChallengeLevel(inputsToToggle: string[]) {
  for (const input of inputsToToggle) {
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(`entrada ${input}`, "i") }),
    );
  }

  fireEvent.click(screen.getByRole("button", { name: /enviar respuesta/i }));
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts on the welcome screen", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /aprende lógica digital viendo la señal/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /empezar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /circuito and con entradas a y b activas/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the mode selection screen after the welcome screen", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    expect(
      screen.getByRole("heading", { name: /ahora elige cómo avanzar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /entrar a práctica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar reto/i }),
    ).toBeInTheDocument();
  });

  it("shows recovered local progress on mode selection", () => {
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        version: 1,
        practiceCompletedLevels: 7,
        challengeCompletedLevels: 4,
        bestChallengeScore: 4321,
        bestChallengeStreak: 3,
      }),
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /progreso de práctica/i }),
    ).toHaveAttribute("value", "7");
    expect(
      screen.getByRole("progressbar", { name: /progreso de reto/i }),
    ).toHaveAttribute("value", "4");
    expect(screen.getByText(/tus récords/i)).toBeInTheDocument();
    expect(screen.getByText(/mejor puntaje 4321/i)).toBeInTheDocument();
    expect(screen.getByText(/mejor racha x3/i)).toBeInTheDocument();
    expect(screen.queryByText(/registro local/i)).not.toBeInTheDocument();
  });

  it("starts the challenge route with HUD, no truth table, and visible combined gates", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

    expect(
      await screen.findByRole("heading", { name: /reto 1: XOR bajo presión/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tiempo/i)).toBeInTheDocument();
    expect(screen.getByText(/puntos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/racha/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/nivel 1\/7/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sin tabla de verdad en reto/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar respuesta/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("MIX")).not.toBeInTheDocument();
    expect(screen.getAllByText("XOR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AND").length).toBeGreaterThan(0);
  });

  it("advances challenge only after submitting a correct output and updates score", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

    fireEvent.click(await screen.findByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrada c/i }));
    fireEvent.click(screen.getByRole("button", { name: /enviar respuesta/i }));

    expect(screen.getByText(/\+\d+ puntos/i)).toBeInTheDocument();
    expect(screen.getByText(/nivel 2\/7/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reto 2: OR bajo presión/i }),
    ).toBeInTheDocument();
  });

  it("announces brief non-spoiling challenge feedback after an incorrect submission", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /enviar respuesta/i }),
    );

    expect(
      screen.getByText(/revisa qué rama bloquea la señal/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/filas objetivo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/regla lógica/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /reto 1: XOR bajo presión/i }),
    ).toBeInTheDocument();
  });

  it("restarts challenge as a fresh run without clearing stored bests", async () => {
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        version: 1,
        practiceCompletedLevels: 7,
        challengeCompletedLevels: 7,
        bestChallengeScore: 5000,
        bestChallengeStreak: 7,
      }),
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
    await screen.findByRole("button", { name: /entrada a/i });

    solveChallengeLevel(["a", "c"]);

    expect(
      await screen.findByRole("heading", { name: /reto 2: OR bajo presión/i }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: /estado del reto/i })).getByText(
        "x1",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reiniciar/i }));

    expect(
      await screen.findByRole("heading", { name: /reto 1: XOR bajo presión/i }),
    ).toBeInTheDocument();
    const resetHud = screen.getByRole("region", { name: /estado del reto/i });
    expect(within(resetHud).getByText("00:00")).toBeInTheDocument();
    expect(within(resetHud).getByText("0")).toBeInTheDocument();
    expect(within(resetHud).getByText("x0")).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}"),
    ).toMatchObject({
      challengeCompletedLevels: 7,
      bestChallengeScore: 5000,
      bestChallengeStreak: 7,
    });
  });

  it("reveals a challenge result only on submit and ignores repeated submissions until inputs change", async () => {
    vi.spyOn(performance, "now").mockReturnValue(1000);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

    expect(
      await screen.findByRole("img", {
        name: /salida oculta hasta enviar respuesta/i,
      }),
    ).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /enviar respuesta/i });
    fireEvent.click(submit);

    expect(
      screen.getByRole("img", { name: /salida actual 0/i }),
    ).toBeInTheDocument();
    expect(submit).toBeDisabled();

    fireEvent.click(submit);
    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrada c/i }));

    expect(
      screen.getByRole("img", {
        name: /salida oculta hasta enviar respuesta/i,
      }),
    ).toBeInTheDocument();
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    expect(await screen.findByText(/\+1320 puntos/i)).toBeInTheDocument();
  });

  it("uses circuit input nodes as the primary controls", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));

    expect(
      await screen.findByRole("heading", { name: /nivel 1: compuerta and/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/toca los nodos de entrada/i)).toBeInTheDocument();
    expect(screen.queryByText(/valor 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/valor 0/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /nodo de entrada b.*apagada/i }),
    );

    expect(
      screen.getByRole("button", { name: /nodo de entrada b.*encendida/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/salida encendida/i)).toBeInTheDocument();
  });

  it("shows structured educational feedback in practice mode", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));

    expect(
      await screen.findByRole("heading", { name: /nivel 1: compuerta and/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lectura actual/i)).toBeInTheDocument();
    expect(screen.getByText(/regla lógica/i)).toBeInTheDocument();
    expect(screen.getByText(/pista/i)).toBeInTheDocument();
    expect(screen.getByText(/filas objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/A=1 · B=0 → salida 0/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AND necesita que todas sus entradas estén en 1/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/activa B/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /comprobar señal/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: /tabla de verdad/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /entrada b/i }));

    expect(screen.getByText(/salida encendida/i)).toBeInTheDocument();
    expect(screen.getByText(/A=1 · B=1 → salida 1/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continuar/i }),
    ).toBeInTheDocument();
  });

  it("saves the best challenge score after completing the challenge route", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
    await screen.findByRole("button", { name: /entrada a/i });

    solveChallengeLevel(["a", "c"]);
    solveChallengeLevel(["a", "c"]);
    solveChallengeLevel(["a", "b", "c"]);
    solveChallengeLevel(["a", "c"]);
    solveChallengeLevel(["c", "d"]);
    solveChallengeLevel(["b", "c"]);
    solveChallengeLevel(["b", "c"]);

    expect(
      await screen.findByRole("heading", { name: /reto completado/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/récord guardado/i)).toBeInTheDocument();
    expect(screen.getByText(/mejor marca/i)).toBeInTheDocument();
    expect(screen.queryByText(/navegador/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mejor local/i)).not.toBeInTheDocument();

    const savedProgress = JSON.parse(
      window.localStorage.getItem(progressStorageKey) ?? "{}",
    );

    expect(savedProgress.challengeCompletedLevels).toBe(7);
    expect(savedProgress.bestChallengeScore).toBeGreaterThan(0);
    expect(savedProgress.bestChallengeStreak).toBe(7);
  });

  it("shows the results screen after completing the practice route", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));

    fireEvent.click(await screen.findByRole("button", { name: /entrada b/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada b/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /entrada b/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(
      await screen.findByRole("heading", { name: /laboratorio completado/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("7/7")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar reto/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/has completado todos los niveles/i),
    ).not.toBeInTheDocument();

    expect(
      JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}"),
    ).toMatchObject({ practiceCompletedLevels: 7 });
  });
});
