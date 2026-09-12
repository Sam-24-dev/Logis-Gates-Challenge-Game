export type StoredProgress = {
  bestChallengeScore: number;
  bestChallengeStreak: number;
  challengeCompletedLevels: number;
  practiceCompletedLevels: number;
  version: 1;
};

export type ProgressPatch = Partial<
  Omit<StoredProgress, "version">
>;

export const progressStorageKey = "digital-logic-lab-progress-v1";

export const defaultProgress: StoredProgress = {
  bestChallengeScore: 0,
  bestChallengeStreak: 0,
  challengeCompletedLevels: 0,
  practiceCompletedLevels: 0,
  version: 1,
};

function getDefaultStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function toSafeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function parseProgress(value: unknown): StoredProgress {
  if (!value || typeof value !== "object") {
    return defaultProgress;
  }

  const candidate = value as Partial<StoredProgress>;

  if (candidate.version !== 1) {
    return defaultProgress;
  }

  return {
    bestChallengeScore: toSafeNumber(candidate.bestChallengeScore),
    bestChallengeStreak: toSafeNumber(candidate.bestChallengeStreak),
    challengeCompletedLevels: toSafeNumber(candidate.challengeCompletedLevels),
    practiceCompletedLevels: toSafeNumber(candidate.practiceCompletedLevels),
    version: 1,
  };
}

export function mergeProgress(
  current: StoredProgress,
  patch: ProgressPatch,
): StoredProgress {
  return {
    bestChallengeScore: Math.max(
      current.bestChallengeScore,
      toSafeNumber(patch.bestChallengeScore),
    ),
    bestChallengeStreak: Math.max(
      current.bestChallengeStreak,
      toSafeNumber(patch.bestChallengeStreak),
    ),
    challengeCompletedLevels: Math.max(
      current.challengeCompletedLevels,
      toSafeNumber(patch.challengeCompletedLevels),
    ),
    practiceCompletedLevels: Math.max(
      current.practiceCompletedLevels,
      toSafeNumber(patch.practiceCompletedLevels),
    ),
    version: 1,
  };
}

export function loadStoredProgress(
  storage: Storage | null = getDefaultStorage(),
): StoredProgress {
  try {
    const rawValue = storage?.getItem(progressStorageKey);

    if (!rawValue) {
      return defaultProgress;
    }

    return parseProgress(JSON.parse(rawValue));
  } catch {
    return defaultProgress;
  }
}

export function saveStoredProgress(
  progress: StoredProgress,
  storage: Storage | null = getDefaultStorage(),
): boolean {
  try {
    storage?.setItem(progressStorageKey, JSON.stringify(parseProgress(progress)));
    return Boolean(storage);
  } catch {
    return false;
  }
}
