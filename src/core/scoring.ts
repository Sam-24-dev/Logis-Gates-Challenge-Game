export type AttemptScoreInput = {
  isCorrect: boolean;
  attempts: number;
  elapsedSeconds: number;
};

export type ChallengeScoreInput = {
  isCorrect: boolean;
  levelNumber: number;
  elapsedSeconds: number;
  wrongSubmissions: number;
  streak: number;
};

export type ChallengeScoreResult = {
  points: number;
  nextStreak: number;
};

const baseCorrectScore = 1000;
const attemptPenalty = 50;
const timePenalty = 2;
const challengeBaseScore = 900;
const challengeLevelBonus = 100;
const challengeMaxTimeBonus = 470;
const challengeTimePenalty = 4;
const challengeStreakBonus = 40;
const challengeWrongPenalty = 150;

export function calculateAttemptScore({
  isCorrect,
  attempts,
  elapsedSeconds,
}: AttemptScoreInput): number {
  if (!isCorrect) {
    return 0;
  }

  if (![attempts, elapsedSeconds].every(Number.isSafeInteger)) {
    return 0;
  }

  const safeAttempts = Math.max(1, attempts);
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);
  const score =
    baseCorrectScore -
    (safeAttempts - 1) * attemptPenalty -
    safeElapsedSeconds * timePenalty;

  return Math.max(0, Math.round(score));
}

export function calculateChallengeScore({
  isCorrect,
  levelNumber,
  elapsedSeconds,
  wrongSubmissions,
  streak,
}: ChallengeScoreInput): ChallengeScoreResult {
  if (!isCorrect) {
    return { points: 0, nextStreak: 0 };
  }

  if (
    ![levelNumber, elapsedSeconds, wrongSubmissions, streak].every(
      Number.isSafeInteger,
    )
  ) {
    return { points: 0, nextStreak: 0 };
  }

  const safeLevelNumber = Math.max(1, levelNumber);
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);
  const safeWrongSubmissions = Math.max(0, wrongSubmissions);
  const safeStreak = Math.max(0, streak);
  const baseScore = challengeBaseScore + safeLevelNumber * challengeLevelBonus;
  const timeBonus = Math.max(
    0,
    challengeMaxTimeBonus - safeElapsedSeconds * challengeTimePenalty,
  );
  const streakBonus = safeStreak * challengeStreakBonus;
  const wrongPenalty = safeWrongSubmissions * challengeWrongPenalty;
  const points = Math.max(
    0,
    Math.round(baseScore + timeBonus + streakBonus - wrongPenalty),
  );

  return { points, nextStreak: safeStreak + 1 };
}
