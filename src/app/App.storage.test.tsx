import { fireEvent, render, screen } from "@testing-library/react";
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

function solveChallengeLevel(inputsToToggle: string[]) {
  for (const input of inputsToToggle) {
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(`entrada ${input}`, "i") }),
    );
  }

  fireEvent.click(screen.getByRole("button", { name: /enviar respuesta/i }));
}

describe("App progress storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    expect(screen.getByText("Práctica 2/7")).toBeInTheDocument();
    expect(screen.getByText("Reto 4/7")).toBeInTheDocument();
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
    expect(screen.queryByText(/récord guardado/i)).not.toBeInTheDocument();
  });
});
