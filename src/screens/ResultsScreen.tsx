import type { Difficulty, GateName, LevelDefinition } from "../app/appTypes";
import type { StoredProgress } from "../core/progress";

type ChallengeSummary = {
  score: number;
  runBestStreak: number;
};

type ResultsScreenProps = {
  challengeSummary?: ChallengeSummary;
  completedDifficulty: Difficulty;
  completedLevels: LevelDefinition[];
  isNewBestChallengeScore: boolean;
  onChallenge: () => void;
  onHome: () => void;
  onPracticeAgain: () => void;
  progress: StoredProgress;
};

const gateSummaries: Partial<Record<GateName, string>> = {
  AND: "Salida 1 solo cuando todas las entradas están activas.",
  OR: "Salida 1 cuando al menos una entrada lleva señal.",
  NOT: "Invierte la señal: 1 se vuelve 0 y 0 se vuelve 1.",
  XOR: "Salida 1 cuando las dos entradas son diferentes.",
  NAND: "Salida inversa de AND: se apaga solo con todo en 1.",
  NOR: "Salida inversa de OR: solo prende cuando todo está en 0.",
  XNOR: "Salida 1 cuando las dos entradas son iguales.",
};

const gateOrder: GateName[] = [
  "AND",
  "OR",
  "NOT",
  "XOR",
  "NAND",
  "NOR",
  "XNOR",
];

function getUniqueGates(levels: LevelDefinition[]) {
  const gates = new Set(levels.flatMap((level) => level.gates));

  return gateOrder.filter((gate) => gates.has(gate));
}

function getModeCopy(difficulty: Difficulty) {
  if (difficulty === "hard") {
    return {
      pill: "Reto completado",
      title: "Reto completado",
      lead: "Resolviste circuitos combinados con menos ayuda. Ya puedes seguir señales entre varias compuertas y explicar cómo se transforma la salida final.",
      note: "Siguiente experimento: repite el reto para mejorar tu ritmo o vuelve a práctica si quieres reforzar una regla antes de avanzar.",
    };
  }

  return {
    pill: "Práctica completada",
    title: "Laboratorio completado",
    lead: "Terminaste la ruta inicial de compuertas. Ya sabes leer entradas, seguir la señal y usar la tabla de verdad para explicar por qué una salida prende o se apaga.",
    note: "Siguiente experimento: entra al modo reto para resolver con menos ayuda y más ritmo, o repite práctica si quieres reforzar las reglas antes de avanzar.",
  };
}

export function ResultsScreen({
  challengeSummary,
  completedDifficulty,
  completedLevels,
  isNewBestChallengeScore,
  onChallenge,
  onHome,
  onPracticeAgain,
  progress,
}: ResultsScreenProps) {
  const modeCopy = getModeCopy(completedDifficulty);
  const learnedGates = getUniqueGates(completedLevels);
  const totalLevels = completedLevels.length;

  if (totalLevels === 0) {
    return (
      <main className="results-screen-shell" data-screen="results">
        <a className="skip-link" href="#results-title">
          Saltar al contenido principal
        </a>
        <div className="results-screen">
          <header
            className="results-topbar"
            aria-label="Barra superior de resultados"
          >
            <div className="results-brand">Lógica Digital</div>
            <div className="results-top-actions">
              <div className="results-pill">Sin resultados</div>
              <button
                className="results-ghost-button"
                type="button"
                onClick={onHome}
              >
                Volver al inicio
              </button>
            </div>
          </header>

          <section
            className="results-panel results-hero"
            aria-labelledby="results-title"
          >
            <div>
              <p className="results-eyebrow">Estado de recuperación</p>
              <h1 id="results-title" className="results-title" tabIndex={-1}>
                Resultados{" "}
                <span className="results-title-accent">no disponibles</span>
              </h1>
              <p className="results-lead">
                No encontramos resultados válidos para mostrar. Inicia una
                nueva práctica o vuelve al inicio para continuar.
              </p>
            </div>

            <div
              className="results-actions"
              aria-label="Acciones de resultado"
            >
              <button
                className="results-button is-primary"
                type="button"
                onClick={onChallenge}
              >
                Iniciar reto
              </button>
              <button
                className="results-button"
                type="button"
                onClick={onPracticeAgain}
              >
                Practicar otra vez
              </button>
              <button
                className="results-button"
                type="button"
                onClick={onHome}
              >
                Volver al inicio
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="results-screen-shell" data-screen="results">
      <a className="skip-link" href="#results-title">
        Saltar al contenido principal
      </a>
      <div className="results-screen">
        <header
          className="results-topbar"
          aria-label="Barra superior de resultados"
        >
          <div className="results-brand">Lógica Digital</div>
          <div className="results-top-actions">
            <div className="results-pill">{modeCopy.pill}</div>
            <button
              className="results-ghost-button"
              type="button"
              onClick={onHome}
            >
              Volver al inicio
            </button>
          </div>
        </header>

        <div className="results-layout">
          <section
            className="results-panel results-hero"
            aria-labelledby="results-title"
          >
            <div>
              <p className="results-eyebrow">Resultado del laboratorio</p>
              <h1 id="results-title" className="results-title" tabIndex={-1}>
                {modeCopy.title.split(" ")[0]}{" "}
                <span className="results-title-accent">
                  {modeCopy.title.split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <section
                className="results-route"
                aria-labelledby="results-route-title"
              >
                <div className="results-route-top">
                  <span>Registro de recorrido</span>
                  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
                    <path d="M2 18h7l4-9 4 14 4-8h5" />
                    <circle cx="26" cy="15" r="2.5" />
                  </svg>
                </div>
                <h2 id="results-route-title">Ruta completada</h2>
                <p className="results-route-readout">
                  <strong>{totalLevels}/{totalLevels}</strong>
                  <span>niveles completados</span>
                </p>
                <div
                  className="results-route-path"
                  aria-hidden="true"
                  style={{ gridTemplateColumns: `repeat(${totalLevels}, minmax(0, 1fr))` }}
                >
                  {completedLevels.map((level) => (
                    <span className="results-route-mark" key={level.id}>
                      <i>✓</i>
                      <small>{String(level.levelNumber).padStart(2, "0")}</small>
                    </span>
                  ))}
                </div>
                <div className="results-route-ends" aria-hidden="true">
                  <span>Inicio</span>
                  <span>Fin de ruta ✓</span>
                </div>
              </section>

              <p className="results-orientation">Elige tu siguiente experimento.</p>
              <div
                className={`results-summary${completedDifficulty === "hard" ? " is-challenge" : ""}`}
                aria-label="Resumen de progreso"
              >
                <div className="results-metric">
                  <span>
                    {completedDifficulty === "hard" ? "Puntos" : "Ruta"}
                  </span>
                  <strong>
                    {completedDifficulty === "hard"
                      ? (challengeSummary?.score ?? 0)
                      : "100%"}
                  </strong>
                </div>
                <div className="results-metric">
                  <span>
                    {completedDifficulty === "hard"
                      ? "Mejor racha"
                      : "Compuertas"}
                  </span>
                  <strong>
                    {completedDifficulty === "hard"
                      ? `x${challengeSummary?.runBestStreak ?? 0}`
                      : learnedGates.length}
                  </strong>
                </div>
                {completedDifficulty === "hard" ? (
                  <div className="results-metric is-record">
                    <span>Mejor marca</span>
                    <strong>{progress.bestChallengeScore}</strong>
                  </div>
                ) : null}
              </div>
              {completedDifficulty === "hard" ? (
                <div className="results-mission-note">
                  <strong>
                    {isNewBestChallengeScore ? "Récord guardado:" : "Mejor marca:"}
                  </strong>{" "}
                  {isNewBestChallengeScore
                    ? "superaste tu mejor carrera."
                    : `tu mejor carrera sigue en ${progress.bestChallengeScore} puntos.`}
                </div>
              ) : null}
              <div
                className="results-actions"
                aria-label="Acciones de resultado"
              >
                <button
                  className="results-button is-primary"
                  type="button"
                  onClick={onChallenge}
                >
                  Iniciar reto
                </button>
                <button
                  className="results-button"
                  type="button"
                  onClick={onPracticeAgain}
                >
                  Practicar otra vez
                </button>
                <button
                  className="results-button"
                  type="button"
                  onClick={onHome}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </section>
          <aside
            className="results-panel results-lab-card"
            aria-label={
              completedDifficulty === "hard"
                ? "Resumen educativo del reto"
                : "Resumen educativo de la práctica"
            }
          >
            <details className="lab-disclosure">
              <summary>Repasar compuertas y sus reglas</summary>
              <div className="results-recap-content">
                <div className="results-badge">Señales estabilizadas</div>
                <p className="results-lead">{modeCopy.lead}</p>
                {completedDifficulty === "easy" ? (
                  <div className="results-mission-note">
                    <strong>Siguiente experimento:</strong>{" "}
                    {modeCopy.note.replace("Siguiente experimento: ", "")}
                  </div>
                ) : null}
                <div className="results-learned">
                  <h2 id="results-learned-title">Lo que ya dominas</h2>
                  <ul
                    className="results-learned-list"
                    aria-labelledby="results-learned-title"
                  >
                    {learnedGates.map((gate) => (
                      <li className="results-row" key={gate}>
                        <b className="results-gate">{gate}</b>
                        <p>{gateSummaries[gate]}</p>
                        <span className="results-status">Listo</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </aside>
        </div>
      </div>
    </main>
  );
}
