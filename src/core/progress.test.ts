import { describe, expect, it } from "vitest";
import {
  defaultProgress,
  loadStoredProgress,
  mergeProgress,
  progressStorageKey,
  saveStoredProgress,
} from "./progress";

function createThrowingStorage(): Storage {
  return {
    get length(): number {
      throw new Error("storage unavailable");
    },
    clear() {
      throw new Error("storage unavailable");
    },
    getItem() {
      throw new Error("storage unavailable");
    },
    key() {
      throw new Error("storage unavailable");
    },
    removeItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
  };
}

describe("stored progress", () => {
  it("returns default progress when storage is empty, corrupt, or unavailable", () => {
    window.localStorage.clear();

    expect(loadStoredProgress()).toEqual(defaultProgress);

    window.localStorage.setItem(progressStorageKey, "not-json");

    expect(loadStoredProgress()).toEqual(defaultProgress);
    expect(loadStoredProgress(createThrowingStorage())).toEqual(
      defaultProgress,
    );
  });

  it("falls back safely when the default localStorage getter throws", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage unavailable");
      },
    });

    try {
      expect(loadStoredProgress()).toEqual(defaultProgress);
      expect(saveStoredProgress(defaultProgress)).toBe(false);
    } finally {
      if (descriptor) {
        Object.defineProperty(window, "localStorage", descriptor);
      }
    }
  });

  it("merges progress by keeping the best completed levels, score, and streak", () => {
    const progress = mergeProgress(defaultProgress, {
      bestChallengeScore: 3200,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 7,
    });

    expect(
      mergeProgress(progress, {
        bestChallengeScore: 2500,
        bestChallengeStreak: 6,
        challengeCompletedLevels: 2,
        practiceCompletedLevels: 3,
      }),
    ).toMatchObject({
      bestChallengeScore: 3200,
      bestChallengeStreak: 6,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 7,
    });
  });

  it("saves and reloads valid versioned progress without throwing", () => {
    const saved = saveStoredProgress({
      ...defaultProgress,
      bestChallengeScore: 4100,
      bestChallengeStreak: 5,
      challengeCompletedLevels: 7,
    });

    expect(saved).toBe(true);
    expect(loadStoredProgress()).toMatchObject({
      bestChallengeScore: 4100,
      bestChallengeStreak: 5,
      challengeCompletedLevels: 7,
    });
  });

  it("fails safely when storage cannot be written", () => {
    expect(saveStoredProgress(defaultProgress, createThrowingStorage())).toBe(
      false,
    );
  });
});
