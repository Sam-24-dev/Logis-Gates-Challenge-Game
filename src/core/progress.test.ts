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

  it("loads only safe in-range fields from versioned progress", () => {
    const valid = {
      ...defaultProgress,
      bestChallengeScore: 4100,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 5,
    };
    const invalidFields = [
      ["bestChallengeScore", 2.7],
      ["bestChallengeScore", Number.MAX_SAFE_INTEGER + 1],
      ["bestChallengeStreak", 2.7],
      ["bestChallengeStreak", 8],
      ["challengeCompletedLevels", 2.7],
      ["challengeCompletedLevels", 8],
      ["practiceCompletedLevels", 2.7],
      ["practiceCompletedLevels", 9],
      ["practiceCompletedLevels", Number.MAX_SAFE_INTEGER + 1],
    ] as const;

    for (const [field, value] of invalidFields) {
      window.localStorage.setItem(
        progressStorageKey,
        JSON.stringify({ ...valid, [field]: value }),
      );
      expect(loadStoredProgress()).toEqual({ ...valid, [field]: 0 });
    }

    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        ...valid,
        bestChallengeScore: Number.MAX_SAFE_INTEGER,
        bestChallengeStreak: 7,
        challengeCompletedLevels: 7,
        practiceCompletedLevels: 7,
      }),
    );
    expect(loadStoredProgress()).toEqual({
      ...valid,
      bestChallengeScore: Number.MAX_SAFE_INTEGER,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 7,
      practiceCompletedLevels: 7,
    });

    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        ...valid,
        bestChallengeScore: -2,
        bestChallengeStreak: -1,
        challengeCompletedLevels: -3,
        practiceCompletedLevels: -4,
      }),
    );
    expect(loadStoredProgress()).toEqual(defaultProgress);
  });

  it("ignores invalid patch fields without erasing valid current records", () => {
    const current = {
      ...defaultProgress,
      bestChallengeScore: 4100,
      bestChallengeStreak: 3,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 5,
    };

    expect(mergeProgress(current, {
      bestChallengeScore: Number.MAX_SAFE_INTEGER + 1,
      bestChallengeStreak: 8,
      challengeCompletedLevels: 2.7,
      practiceCompletedLevels: 9,
    })).toEqual(current);

    for (const value of [NaN, Infinity, -Infinity]) {
      expect(mergeProgress(current, {
        bestChallengeScore: value,
        bestChallengeStreak: value,
        challengeCompletedLevels: value,
        practiceCompletedLevels: value,
      })).toEqual(current);
    }

    expect(mergeProgress(current, {
      bestChallengeScore: 5000,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 7,
      practiceCompletedLevels: 2,
    })).toEqual({
      ...current,
      bestChallengeScore: 5000,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 7,
    });
  });

  it("normalizes invalid current fields before merging", () => {
    const current = {
      ...defaultProgress,
      bestChallengeScore: NaN,
      bestChallengeStreak: 8,
      challengeCompletedLevels: 2.7,
      practiceCompletedLevels: Infinity,
    };

    expect(mergeProgress(current, {})).toEqual(defaultProgress);
    expect(mergeProgress(current, {
      bestChallengeScore: 4100,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 5,
    })).toEqual({
      ...defaultProgress,
      bestChallengeScore: 4100,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 4,
      practiceCompletedLevels: 5,
    });
    expect(mergeProgress({
      ...defaultProgress,
      bestChallengeScore: Number.MAX_SAFE_INTEGER + 1,
      bestChallengeStreak: -3,
      challengeCompletedLevels: 8,
      practiceCompletedLevels: 9,
    }, {})).toEqual(defaultProgress);
    expect(mergeProgress(defaultProgress, {
      bestChallengeScore: -2,
      bestChallengeStreak: -1,
      challengeCompletedLevels: -3,
      practiceCompletedLevels: -4,
    })).toEqual(defaultProgress);
  });

  it("saves normalized fields and preserves valid values on reload", () => {
    const progress = {
      ...defaultProgress,
      bestChallengeScore: NaN,
      bestChallengeStreak: 8,
      challengeCompletedLevels: 2.7,
      practiceCompletedLevels: 5,
    };
    const normalized = {
      ...defaultProgress,
      practiceCompletedLevels: 5,
    };

    expect(saveStoredProgress(progress)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(progressStorageKey)!)).toEqual(normalized);
    expect(loadStoredProgress()).toEqual(normalized);

    for (const value of [Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(saveStoredProgress({ ...progress, bestChallengeScore: value })).toBe(true);
      expect(loadStoredProgress()).toEqual(normalized);
    }

    const valid = {
      ...defaultProgress,
      bestChallengeScore: Number.MAX_SAFE_INTEGER,
      bestChallengeStreak: 7,
      challengeCompletedLevels: 7,
      practiceCompletedLevels: 7,
    };
    expect(saveStoredProgress(valid)).toBe(true);
    expect(loadStoredProgress()).toEqual(valid);
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
