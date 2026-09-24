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

const maxRouteLevels = 7;

function toSafeNumber(value: unknown, maximum = Number.MAX_SAFE_INTEGER) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value <= maximum
    ? Math.max(0, value)
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
    bestChallengeStreak: toSafeNumber(
      candidate.bestChallengeStreak,
      maxRouteLevels,
    ),
    challengeCompletedLevels: toSafeNumber(
      candidate.challengeCompletedLevels,
      maxRouteLevels,
    ),
    practiceCompletedLevels: toSafeNumber(
      candidate.practiceCompletedLevels,
      maxRouteLevels,
    ),
    version: 1,
  };
}

export function mergeProgress(
  current: StoredProgress,
  patch: ProgressPatch,
): StoredProgress {
  const safeCurrent = parseProgress(current);
  const safePatch = parseProgress({ ...patch, version: 1 });

  return {
    bestChallengeScore: Math.max(
      safeCurrent.bestChallengeScore,
      safePatch.bestChallengeScore,
    ),
    bestChallengeStreak: Math.max(
      safeCurrent.bestChallengeStreak,
      safePatch.bestChallengeStreak,
    ),
    challengeCompletedLevels: Math.max(
      safeCurrent.challengeCompletedLevels,
      safePatch.challengeCompletedLevels,
    ),
    practiceCompletedLevels: Math.max(
      safeCurrent.practiceCompletedLevels,
      safePatch.practiceCompletedLevels,
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
