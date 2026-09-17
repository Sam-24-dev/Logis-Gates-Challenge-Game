type WelcomeScreenProps = {
  onStart: () => void;
  onDemo: () => void;
};

const gates = ["AND", "OR", "NOT", "XOR", "NAND", "NOR", "XNOR"];

export function WelcomeScreen({ onDemo, onStart }: WelcomeScreenProps) {
  return (
    <main className="welcome-shell" data-screen="intro">
      <a className="skip-link" href="#welcome-title">
        Saltar al contenido principal
      </a>
      <header className="welcome-topbar">
        <div className="welcome-brand" aria-label="Lógica Digital">
          <span className="welcome-brand-copy">
            <strong>Lógica Digital</strong>
          </span>
        </div>
        <ol className="welcome-nav" aria-label="Etapas de la experiencia">
          <li aria-current="step">Inicio</li>
          <li>Circuitos</li>
          <li>Práctica</li>
        </ol>
        <div className="welcome-hud" aria-hidden="true">
          <span className="welcome-hud-led" />
          <span>Listo para aprender</span>
        </div>
      </header>

      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="welcome-kicker">Lección inicial: compuerta AND</p>
          <h1
            id="welcome-title"
            aria-label="Aprende lógica digital viendo la señal"
            tabIndex={-1}
          >
            <span className="welcome-title-line">Aprende lógica digital</span>
            <span className="welcome-title-line is-accent">
              viendo la señal
            </span>
          </h1>
          <p className="welcome-lead">
            Cambia las entradas A y B, observa la salida y descubre paso a paso
            cómo funciona una compuerta lógica. Empieza por AND: se enciende
            solo cuando ambas entradas están activas.
          </p>
          <ul className="welcome-chip-row" aria-label="Compuertas disponibles">
            {gates.map((gate, index) => (
              <li className={index === 0 ? "is-hot" : undefined} key={gate}>
                {gate}
              </li>
            ))}
          </ul>
          <div className="welcome-actions">
            <button
              className="welcome-button is-primary"
              type="button"
              onClick={onStart}
            >
              Empezar →
            </button>
            <button className="welcome-button" type="button" onClick={onDemo}>
              Probar ejemplo
            </button>
          </div>
          <p className="welcome-microcopy">
            No necesitas saber electrónica: la pantalla te guía paso a paso.
          </p>
        </div>

        <aside
          className="welcome-board"
          aria-label="Vista previa de un circuito lógico AND"
        >
          <div className="welcome-board-head">
            <span>Vista previa del circuito</span>
            <span>A:1 · B:1 · Salida:1</span>
          </div>

          <div className="welcome-circuit-frame">
            <svg
              className="welcome-circuit"
              viewBox="0 0 820 500"
              role="img"
              aria-label="Circuito AND con entradas A y B activas y salida 1"
            >
              <path
                className="welcome-wire is-live"
                d="M88 155 H275 V238 H380"
              />
              <path
                className="welcome-wire is-live is-delay"
                d="M88 315 H275 V272 H380"
              />
              <path
                className="welcome-wire is-live is-output"
                d="M512 255 H675"
              />
              <circle
                className="welcome-node is-live"
                cx="88"
                cy="155"
                r="20"
              />
              <circle
                className="welcome-node is-live"
                cx="88"
                cy="315"
                r="20"
              />

              <rect
                className="welcome-gate"
                x="378"
                y="200"
                width="136"
                height="112"
                rx="6"
              />
              <text className="welcome-svg-label" x="412" y="264">
                AND
              </text>
              <rect
                className="welcome-led"
                x="675"
                y="217"
                width="76"
                height="76"
                rx="18"
              />
              <text className="welcome-svg-out" x="705" y="264">
                1
              </text>
              <text className="welcome-svg-small" x="42" y="198">
                Entrada A · activa
              </text>
              <text className="welcome-svg-small" x="42" y="358">
                Entrada B · activa
              </text>
              <text className="welcome-svg-small" x="666" y="328">
                Salida
              </text>
            </svg>
          </div>

          <div className="welcome-board-bottom">
            <div className="welcome-truth-strip">
              <strong>Cómo leer AND</strong>
              <span className="welcome-truth-help">
                1 = activa · 0 = apagada
              </span>
              <table aria-label="Tabla de verdad simple de la compuerta AND">
                <thead>
                  <tr>
                    <th>A</th>
                    <th>B</th>
                    <th>Salida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>0</td>
                    <td>1</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>1</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                  <tr className="is-current">
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="welcome-board-feedback" aria-live="polite">
              AND solo entrega 1 cuando A y B están activas al mismo tiempo.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
