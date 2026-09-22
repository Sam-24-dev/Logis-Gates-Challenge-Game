import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CircuitBoard } from "../components/CircuitBoard/CircuitBoard";
import { getPracticeFeedback } from "../core/feedback";
import { generateTruthTable } from "../core/truthTable";
import type {
  Difficulty,
  InputName,
  InputStates,
  LevelDefinition,
} from "../app/appTypes";

type ChallengeState = {
  elapsedSeconds: number;
  hasSubmittedCurrentLevel: boolean;
  lastPoints: number | null;
  lastWasCorrect: boolean | null;
  score: number;
  streak: number;
  submissionLocked: boolean;
  wrongSubmissions: number;
};

type LevelScreenProps = {
  currentLevel: number;
  difficulty: Difficulty;
  inputStates: InputStates;
  level: LevelDefinition;
  result: boolean;
  totalLevels: number;
  challengeState?: ChallengeState;
  onBackToMode: () => void;
  onChallengeReady?: () => void;
  onNextLevel: () => void;
  onRetry: () => void;
  onSubmitAnswer?: () => void;
  onToggleInput: (input: InputName) => void;
};

type PulseKind = "miss" | "success";

function formatValue(value: boolean | undefined) {
  return value ? "1" : "0";
}

function getCurrentRowKey(inputs: InputName[], inputStates: InputStates) {
  return inputs.map((input) => formatValue(inputStates[input])).join("");
}

function getLevelHeading(level: LevelDefinition) {
  if (level.difficulty === "easy" && level.gates.length === 1) {
    return `Nivel ${level.levelNumber}: compuerta ${level.gates[0]}`;
  }

  return `Reto ${level.levelNumber}: ${level.gates[0]} bajo presión`;
}

function getModeLabel(
  difficulty: Difficulty,
  currentLevel: number,
  totalLevels: number,
) {
  const mode = difficulty === "easy" ? "Práctica" : "Reto";

  return `${mode} · Nivel ${currentLevel} de ${totalLevels}`;
}

function formatElapsedTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function LevelScreen({
  currentLevel,
  difficulty,
  inputStates,
  level,
  result,
  totalLevels,
  challengeState,
  onBackToMode,
  onChallengeReady,
  onNextLevel,
  onRetry,
  onSubmitAnswer,
  onToggleInput,
}: LevelScreenProps) {
  const isChallenge = difficulty === "hard";
  const truthTable = isChallenge ? [] : generateTruthTable(level.circuit);
  const currentRowKey = getCurrentRowKey(level.inputs, inputStates);
  const feedback = isChallenge
    ? null
    : getPracticeFeedback(level, inputStates, result);
  const progress = Math.round((currentLevel / totalLevels) * 100);
  const heading = getLevelHeading(level);
  const isOutputRevealed =
    !isChallenge || Boolean(challengeState?.hasSubmittedCurrentLevel);
  const outputText = isOutputRevealed ? formatValue(result) : "?";
  const inputSummary = level.inputs
    .map((input) => `${input} ${formatValue(inputStates[input])}`)
    .join(", ");
  const liveStatus = isChallenge
    ? challengeState?.lastWasCorrect === false
      ? `Respuesta incorrecta. Salida ${outputText}. Racha rota. Revisa las entradas y vuelve a enviar.`
      : ""
    : `Entradas ${inputSummary}. Salida ${outputText}.`;
  const targetOutput = "1";
  const [pulse, setPulse] = useState<PulseKind | null>(null);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (isChallenge) {
      onChallengeReady?.();
    }
  }, [isChallenge, level.id, onChallengeReady]);

  useEffect(() => {
    if (isChallenge) {
      return undefined;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    setPulse(null);
    const showPulse = window.setTimeout(() => {
      setPulse(result ? "success" : "miss");
    }, 0);
    const hidePulse = window.setTimeout(() => {
      setPulse(null);
    }, 560);

    return () => {
      window.clearTimeout(showPulse);
      window.clearTimeout(hidePulse);
    };
  }, [currentRowKey, isChallenge, result]);

  useEffect(() => {
    if (
      !isChallenge ||
      !challengeState?.hasSubmittedCurrentLevel ||
      challengeState.lastWasCorrect === null
    ) {
      return undefined;
    }

    const showPulse = window.setTimeout(() => {
      setPulse(challengeState.lastWasCorrect ? "success" : "miss");
    }, 0);
    const hidePulse = window.setTimeout(() => {
      setPulse(null);
    }, 720);

    return () => {
      window.clearTimeout(showPulse);
      window.clearTimeout(hidePulse);
      setPulse(null);
    };
  }, [
    challengeState?.hasSubmittedCurrentLevel,
    challengeState?.lastPoints,
    challengeState?.lastWasCorrect,
    isChallenge,
  ]);

  return (
    <main className="level-screen-shell" data-screen="game">
      <a className="skip-link" href="#level-title">
        Saltar al contenido principal
      </a>
      <div className="level-screen">
        <header className="level-topbar" aria-label="Barra superior del nivel">
          <div className="level-brand">Lógica Digital</div>
          <div className="level-top-actions">
            <div className="level-pill">
              {getModeLabel(difficulty, currentLevel, totalLevels)}
            </div>
            <button
              className="level-ghost-button"
              type="button"
              onClick={onBackToMode}
            >
              Cambiar modo
            </button>
          </div>
        </header>

        {isChallenge && challengeState ? (
          <section className="level-challenge-hud" aria-label="Estado del reto">
            <div className="level-hud-card">
              <span>Tiempo</span>
              <strong>
                {formatElapsedTime(challengeState.elapsedSeconds)}
              </strong>
            </div>
            <div className="level-hud-card">
              <span>Puntos</span>
              <strong>{challengeState.score}</strong>
            </div>
            <div className="level-hud-card">
              <span>Racha</span>
              <strong>x{challengeState.streak}</strong>
            </div>
            <div className="level-hud-card">
              <span>
                Nivel {currentLevel}/{totalLevels}
              </span>
              <strong>{level.gates[0]}</strong>
            </div>
          </section>
        ) : null}

        <div className="level-layout">
          <section
            className="level-panel level-main-panel"
            aria-labelledby="level-title"
          >
            <div className="level-header">
              <div>
                <p className="level-eyebrow">Circuito activo</p>
                <h1 id="level-title" className="level-title" tabIndex={-1}>
                  {heading}
                </h1>
                <p className="level-lead">
                  {isChallenge ? (
                    <>
                      Consigue salida <strong>{targetOutput}</strong>. Envía
                      solo cuando estés seguro: fallar rompe la racha.
                    </>
                  ) : (
                    <>
                      Tu objetivo es conseguir una salida <strong>1</strong>.
                      Cambia las entradas y observa cómo la señal viaja por el
                      circuito.
                    </>
                  )}
                </p>
              </div>

              <aside
                className="level-progress-card"
                aria-label="Progreso del modo actual"
              >
                <span>Progreso</span>
                <strong>{progress}%</strong>
                <div
                  className="level-progress-bar"
                  data-progress={progress}
                  aria-hidden="true"
                >
                  <i />
                </div>
              </aside>
            </div>

            <CircuitBoard
              heading={heading}
              inputStates={inputStates}
              level={level}
              pulse={pulse}
              result={result}
              revealOutput={isOutputRevealed}
              onToggleInput={onToggleInput}
            />
            <p className="level-board-hint">
              Toca los nodos de entrada dentro del circuito para cambiar la
              señal.
            </p>
            {isChallenge ? (
              <section
                className="level-actions level-submit-actions"
                aria-label="Envío del reto"
              >
                <button
                  className="level-action-button is-primary"
                  type="button"
                  disabled={challengeState?.submissionLocked ?? true}
                  onClick={onSubmitAnswer}
                >
                  Enviar respuesta
                </button>
              </section>
            ) : null}
          </section>

          <aside
            className="level-side"
            aria-label={isChallenge ? "Panel del reto" : "Ayuda del nivel"}
          >
            <section className="level-panel level-side-panel">
              <h2 className="level-side-title">
                {isChallenge ? "Panel de misión" : "Qué está pasando"}
              </h2>
              <p
                aria-atomic="true"
                aria-live="polite"
                className="level-live-status"
                role="status"
              >
                {liveStatus}
              </p>
              <div className="level-state-grid" aria-label="Estado actual">
                {level.inputs.map((input) => (
                  <div className="level-mini-state" key={input}>
                    <span>{input}</span>
                    <strong>{formatValue(inputStates[input])}</strong>
                  </div>
                ))}
                <div
                  className={`level-mini-state level-output-state ${isOutputRevealed && result ? "is-on" : ""}`}
                >
                  <span>Salida</span>
                  <strong>{outputText}</strong>
                </div>
              </div>
              {isChallenge ? (
                <>
                  <p className="level-feedback-copy">
                    Reto activo: razona la salida, evita probar al azar y envía
                    cuando la señal final coincida con el objetivo. El reloj
                    sigue corriendo si cambias de pestaña.
                  </p>
                  {challengeState?.lastWasCorrect === true ? (
                    <div className="level-next-step is-success">
                      <strong>+{challengeState.lastPoints} puntos:</strong>{" "}
                      racha aumentada. Sigue el siguiente circuito.
                    </div>
                  ) : null}
                  {challengeState?.lastWasCorrect === false ? (
                    <div className="level-next-step is-danger">
                      <strong>Racha rota:</strong> la salida enviada no cumple el
                      objetivo. Cambia una entrada, revisa qué rama bloquea la
                      señal y vuelve a enviar.
                    </div>
                  ) : null}
                </>
              ) : feedback ? (
                <div
                  className={`level-education-grid ${feedback.status === "solved" ? "is-solved" : ""}`}
                >
                  <article className="level-education-card is-reading">
                    <span>Lectura actual</span>
                    <p>
                      {feedback.currentCombination} → salida {outputText}
                    </p>
                  </article>
                  <article className="level-education-card">
                    <span>Regla lógica</span>
                    <p>{feedback.rule}</p>
                  </article>
                  <article className="level-education-card">
                    <span>Pista</span>
                    <p>{feedback.hint}</p>
                  </article>
                  <article className="level-education-card is-target-row">
                    <span>Filas objetivo</span>
                    <p>{feedback.targetSummary}</p>
                  </article>
                </div>
              ) : null}
            </section>

            {!isChallenge ? (
              <section className="level-panel level-side-panel">
                <h2 className="level-side-title">Tabla {level.gates[0]}</h2>
                <table
                  className={`level-truth-table ${pulse ? `is-${pulse}-pulse` : ""}`}
                  aria-label={`Tabla de verdad de ${heading}`}
                >
                  <thead>
                    <tr>
                      {level.inputs.map((input) => (
                        <th key={input}>{input}</th>
                      ))}
                      <th>Salida</th>
                      <th className="level-truth-status">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truthTable.map((row) => {
                      const rowKey = getCurrentRowKey(level.inputs, row.inputs);
                      const isCurrent = rowKey === currentRowKey;
                      const isTarget = row.output;
                      const rowStatus =
                        isCurrent && isTarget
                          ? "Actual y objetivo"
                          : isCurrent
                            ? "Actual"
                            : isTarget
                              ? "Objetivo"
                              : null;

                      return (
                        <tr
                          className={`${isCurrent ? "is-current" : ""} ${isTarget ? "is-target" : ""}`}
                          key={rowKey}
                        >
                          {level.inputs.map((input) => (
                            <td key={input}>
                              {formatValue(row.inputs[input])}
                            </td>
                          ))}
                          <td>{formatValue(row.output)}</td>
                          <td className="level-truth-status">
                            {rowStatus ? (
                              <span className="level-truth-marker">
                                {rowStatus}
                              </span>
                            ) : (
                              <span aria-hidden="true">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="level-hint-line">
                  Estado: “Actual” indica tu combinación. “Objetivo” identifica
                  las filas que producen salida 1.
                </p>
              </section>
            ) : null}

            <section className="level-actions" aria-label="Acciones del nivel">
              {!isChallenge && result ? (
                <button
                  className="level-action-button is-primary"
                  type="button"
                  onClick={onNextLevel}
                >
                  Continuar
                </button>
              ) : null}
              <button
                className="level-action-button"
                type="button"
                onClick={onRetry}
              >
                Reiniciar
              </button>
              <button
                className="level-action-button is-secondary"
                type="button"
                onClick={onBackToMode}
              >
                Volver al modo
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
