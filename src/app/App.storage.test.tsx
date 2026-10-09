import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultProgress,
  progressStorageKey,
  type ProgressPatch,
} from "../core/progress";
import { App } from "./App";

function storedProgress(patch: ProgressPatch) {
  return JSON.stringify({ ...defaultProgress, ...patch });
}

async function enterPractice() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
  fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));
  await screen.findByRole("heading", { name: /nivel 1: compuerta and/i });
}

function solvePracticeLevel(input: string) {
  const controls = within(screen.getByLabelText("Controles del circuito"));
  fireEvent.click(
    controls.getByRole("button", { name: new RegExp(`entrada ${input}`, "i") }),
  );

  const turn = within(screen.getByLabelText("Estado y acción del nivel"));
  return turn.getByRole("button", { name: "Continuar" });
}

async function prepareFinalPracticeLevel() {
  await enterPractice();
  for (const input of ["b", "a", "a", "a", "b", "a"]) {
    fireEvent.click(solvePracticeLevel(input));
  }

  return solvePracticeLevel("b");
}

function solveChallengeLevel(inputsToToggle: string[]) {
  const controls = within(screen.getByLabelText("Controles del circuito"));
  for (const input of inputsToToggle) {
    fireEvent.click(
      controls.getByRole("button", { name: new RegExp(`entrada ${input}`, "i") }),
    );
  }

  const turn = within(screen.getByLabelText("Estado y acción del nivel"));
  fireEvent.click(turn.getByRole("button", { name: /enviar respuesta/i }));
}

describe("App progress storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes practice progress once when the final level advances to results", async () => {
    const next = await prepareFinalPracticeLevel();
    expect(
      JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}"),
    ).toMatchObject({ practiceCompletedLevels: 6 });

    const setItem = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.click(next);

    expect(
      await screen.findByRole("heading", { name: /laboratorio completado/i }),
    ).toBeVisible();
    const transitionWrites = setItem.mock.calls.filter(
      ([key]) => key === progressStorageKey,
    );
    expect(transitionWrites).toHaveLength(1);
    expect(JSON.parse(transitionWrites[0][1])).toEqual({
      ...defaultProgress,
      practiceCompletedLevels: 7,
    });
    expect(window.localStorage.getItem(progressStorageKey)).toBe(
      transitionWrites[0][1],
    );
  }, 10000);

  it("keeps a single intermediate practice save when advancing to the next level", async () => {
    await enterPractice();
    const next = solvePracticeLevel("b");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.click(next);

    expect(
      await screen.findByRole("heading", { name: /nivel 2: compuerta or/i }),
    ).toBeVisible();
    const transitionWrites = setItem.mock.calls.filter(
      ([key]) => key === progressStorageKey,
    );
    expect(transitionWrites).toHaveLength(1);
    expect(JSON.parse(transitionWrites[0][1])).toEqual({
      ...defaultProgress,
      practiceCompletedLevels: 1,
    });
    expect(window.localStorage.getItem(progressStorageKey)).toBe(
      transitionWrites[0][1],
    );
  });

  it("merges newer stored records into the single final practice save", async () => {
    const next = await prepareFinalPracticeLevel();
    const newerProgress = {
      ...defaultProgress,
      bestChallengeScore: 3200,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 6,
    };
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify(newerProgress),
    );

    const setItem = vi.spyOn(Storage.prototype, "setItem");
    fireEvent.click(next);

    expect(
      await screen.findByRole("heading", { name: /laboratorio completado/i }),
    ).toBeVisible();
    const transitionWrites = setItem.mock.calls.filter(
      ([key]) => key === progressStorageKey,
    );
    expect(transitionWrites).toHaveLength(1);
    expect(JSON.parse(transitionWrites[0][1])).toEqual({
      ...newerProgress,
      practiceCompletedLevels: 7,
    });
    expect(window.localStorage.getItem(progressStorageKey)).toBe(
      transitionWrites[0][1],
    );
  });

  it("reaches practice results after one rejected final save without claiming persisted completion", async () => {
    const next = await prepareFinalPracticeLevel();
    const previousProgress = window.localStorage.getItem(progressStorageKey);
    expect(JSON.parse(previousProgress ?? "{}")).toMatchObject({
      practiceCompletedLevels: 6,
    });

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("storage full", "QuotaExceededError");
      });
    fireEvent.click(next);

    expect(
      await screen.findByRole("heading", { name: /laboratorio completado/i }),
    ).toBeVisible();
    const transitionAttempts = setItem.mock.calls.filter(
      ([key]) => key === progressStorageKey,
    );
    expect(transitionAttempts).toHaveLength(1);
    expect(JSON.parse(transitionAttempts[0][1])).toMatchObject({
      practiceCompletedLevels: 7,
    });
    expect(window.localStorage.getItem(progressStorageKey)).toBe(
      previousProgress,
    );

    const actions = within(screen.getByLabelText("Acciones de resultado"));
    fireEvent.click(actions.getByRole("button", { name: "Volver al inicio" }));
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    expect(
      screen.getByRole("progressbar", { name: /progreso de práctica/i }),
    ).toHaveAttribute("value", "6");
    expect(window.localStorage.getItem(progressStorageKey)).toBe(
      previousProgress,
    );
  });

  it("refreshes visible progress after another tab writes storage", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    const updatedProgress = storedProgress({
      bestChallengeScore: 3200,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 2,
    });

    window.localStorage.setItem(progressStorageKey, updatedProgress);
    fireEvent(
      window,
      new StorageEvent("storage", {
        key: progressStorageKey,
        newValue: updatedProgress,
        storageArea: window.localStorage,
      }),
    );

    expect(
      screen.getByRole("progressbar", { name: /progreso de práctica/i }),
    ).toHaveAttribute("value", "2");
    expect(
      screen.getByRole("progressbar", { name: /progreso de reto/i }),
    ).toHaveAttribute("value", "4");
    expect(screen.getByText(/mejor puntaje 3200/i)).toBeInTheDocument();
    expect(screen.getByText(/mejor racha x3/i)).toBeInTheDocument();
  });

  it("preserves newer stored progress when a stale tab saves", async () => {
    window.localStorage.setItem(
      progressStorageKey,
      storedProgress({ practiceCompletedLevels: 2 }),
    );
    render(<App />);

    window.localStorage.setItem(
      progressStorageKey,
      storedProgress({
        bestChallengeScore: 3200,
        bestChallengeStreak: 3,
        challengeCompletedLevels: 4,
        practiceCompletedLevels: 2,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));
    fireEvent.click(await screen.findByRole("button", { name: /entrada b/i }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(
      JSON.parse(window.localStorage.getItem(progressStorageKey) ?? "{}"),
    ).toMatchObject({
      bestChallengeScore: 3200,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 2,
    });
  });

  it("does not claim an unsaved challenge record when storage rejects writes", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
    await screen.findByRole("button", { name: /entrada a/i });

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("storage full", "QuotaExceededError");
      });

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
    expect(setItem).toHaveBeenCalled();
    expect(screen.getByText("Mejor racha").parentElement).toHaveTextContent("x7");
    expect(screen.queryByText(/récord guardado/i)).not.toBeInTheDocument();
  });
});
