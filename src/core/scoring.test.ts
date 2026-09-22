import { describe, expect, it } from "vitest";
import { calculateAttemptScore, calculateChallengeScore } from "./scoring.ts";

const invalidNumbers = [
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  1.5,
  Number.MAX_SAFE_INTEGER + 1,
];

describe("calculateAttemptScore", () => {
  it("rewards correct answers and subtracts attempt/time penalties without going below zero", () => {
    expect(
      calculateAttemptScore({
        isCorrect: true,
        attempts: 1,
        elapsedSeconds: 12,
      }),
    ).toBe(976);
    expect(
      calculateAttemptScore({
        isCorrect: true,
        attempts: 4,
        elapsedSeconds: 120,
      }),
    ).toBe(610);
    expect(
      calculateAttemptScore({
        isCorrect: true,
        attempts: 20,
        elapsedSeconds: 999,
      }),
    ).toBe(0);
  });

  it("returns zero for incorrect answers", () => {
    expect(
      calculateAttemptScore({
        isCorrect: false,
        attempts: 1,
        elapsedSeconds: 5,
      }),
    ).toBe(0);
  });

  it.each(invalidNumbers)(
    "returns zero when attempts is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateAttemptScore({
          isCorrect: true,
          attempts: invalidNumber,
          elapsedSeconds: 5,
        }),
      ).toBe(0);
    },
  );

  it.each(invalidNumbers)(
    "returns zero when elapsedSeconds is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateAttemptScore({
          isCorrect: true,
          attempts: 1,
          elapsedSeconds: invalidNumber,
        }),
      ).toBe(0);
    },
  );

  it("keeps the incorrect-answer short circuit for malformed numbers", () => {
    expect(
      calculateAttemptScore({
        isCorrect: false,
        attempts: Number.NaN,
        elapsedSeconds: Number.POSITIVE_INFINITY,
      }),
    ).toBe(0);
  });

  it("keeps the existing clamps for negative safe integers", () => {
    expect(
      calculateAttemptScore({
        isCorrect: true,
        attempts: -5,
        elapsedSeconds: -10,
      }),
    ).toBe(1000);
  });
});

describe("calculateChallengeScore", () => {
  it("rewards speed and streak while penalizing wrong submissions", () => {
    expect(
      calculateChallengeScore({
        isCorrect: true,
        levelNumber: 5,
        elapsedSeconds: 18,
        wrongSubmissions: 0,
        streak: 3,
      }),
    ).toEqual({ points: 1918, nextStreak: 4 });
  });

  it("breaks the streak and returns no points for incorrect submissions", () => {
    expect(
      calculateChallengeScore({
        isCorrect: false,
        levelNumber: 3,
        elapsedSeconds: 22,
        wrongSubmissions: 1,
        streak: 2,
      }),
    ).toEqual({ points: 0, nextStreak: 0 });
  });

  it.each(invalidNumbers)(
    "fails closed when levelNumber is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateChallengeScore({
          isCorrect: true,
          levelNumber: invalidNumber,
          elapsedSeconds: 18,
          wrongSubmissions: 0,
          streak: 3,
        }),
      ).toEqual({ points: 0, nextStreak: 0 });
    },
  );

  it.each(invalidNumbers)(
    "fails closed when elapsedSeconds is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateChallengeScore({
          isCorrect: true,
          levelNumber: 5,
          elapsedSeconds: invalidNumber,
          wrongSubmissions: 0,
          streak: 3,
        }),
      ).toEqual({ points: 0, nextStreak: 0 });
    },
  );

  it.each(invalidNumbers)(
    "fails closed when wrongSubmissions is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateChallengeScore({
          isCorrect: true,
          levelNumber: 5,
          elapsedSeconds: 18,
          wrongSubmissions: invalidNumber,
          streak: 3,
        }),
      ).toEqual({ points: 0, nextStreak: 0 });
    },
  );

  it.each(invalidNumbers)(
    "fails closed when streak is not a safe integer: %s",
    (invalidNumber) => {
      expect(
        calculateChallengeScore({
          isCorrect: true,
          levelNumber: 5,
          elapsedSeconds: 18,
          wrongSubmissions: 0,
          streak: invalidNumber,
        }),
      ).toEqual({ points: 0, nextStreak: 0 });
    },
  );

  it("keeps the incorrect-answer short circuit for malformed numbers", () => {
    expect(
      calculateChallengeScore({
        isCorrect: false,
        levelNumber: Number.NaN,
        elapsedSeconds: Number.POSITIVE_INFINITY,
        wrongSubmissions: Number.NEGATIVE_INFINITY,
        streak: 1.5,
      }),
    ).toEqual({ points: 0, nextStreak: 0 });
  });

  it("keeps the existing clamps for negative safe integers", () => {
    expect(
      calculateChallengeScore({
        isCorrect: true,
        levelNumber: -2,
        elapsedSeconds: -3,
        wrongSubmissions: -4,
        streak: -5,
      }),
    ).toEqual({ points: 1470, nextStreak: 1 });
  });
});
