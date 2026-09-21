import { useId, type MouseEvent, type ReactElement } from "react";
import { evaluateGate } from "../../core/evaluateGate";
import type {
  CircuitNode,
  GateName,
  InputName,
  InputStates,
  LevelDefinition,
} from "../../core/gameTypes";

type CircuitBoardProps = {
  heading: string;
  inputStates: InputStates;
  level: LevelDefinition;
  pulse: "miss" | "success" | null;
  result: boolean;
  revealOutput?: boolean;
  onToggleInput: (input: InputName) => void;
};

type GateNodeProps = {
  gate: GateName;
  isActive: boolean;
  x: number;
  y: number;
};

type SignalWireProps = {
  d: string;
  isActive: boolean;
  variant?: "default" | "warm";
};

type InputNodeProps = {
  input: InputName;
  isActive: boolean;
  x: number;
  y: number;
};

type OutputNodeProps = {
  isActive: boolean;
  isRevealed: boolean;
  x: number;
  y: number;
};

const twoInputYPositions = [170, 270];
const oneInputYPositions = [220];

const inputYPositionsByCount: Record<number, number[]> = {
  1: [220],
  2: [170, 270],
  3: [104, 240, 376],
  4: [82, 164, 336, 418],
};

function formatValue(value: boolean | undefined) {
  return value ? "1" : "0";
}

function evaluateNode(node: CircuitNode, inputStates: InputStates): boolean {
  if (node.type === "input") {
    return Boolean(inputStates[node.name]);
  }

  return evaluateGate(
    node.gate,
    node.inputs.map((input) => evaluateNode(input, inputStates)),
  );
}

function describeCircuitTopology(output: CircuitNode) {
  const gateDescriptions: string[] = [];

  function describeSource(node: CircuitNode): string {
    if (node.type === "input") {
      return `la entrada ${node.name}`;
    }

    const sources = node.inputs.map(describeSource);
    const gateNumber = gateDescriptions.length + 1;
    gateDescriptions.push(
      `Compuerta ${gateNumber}, ${node.gate}: recibe ${sources.join(" y ")}.`,
    );

    return `la salida de la compuerta ${gateNumber}`;
  }

  const outputSource = describeSource(output);

  return `Topología del circuito. ${gateDescriptions.join(" ")} La salida del circuito recibe ${outputSource}.`;
}

function SignalWire({ d, isActive, variant = "default" }: SignalWireProps) {
  return (
    <>
      <path className="level-wire-base" d={d} />
      <path
        className={`level-wire-signal ${isActive ? "is-on" : ""} ${variant === "warm" ? "is-warm" : ""}`}
        d={d}
      />
      <path className={`level-wire-off ${isActive ? "is-hidden" : ""}`} d={d} />
    </>
  );
}

function InputNode({ input, isActive, x, y }: InputNodeProps) {
  return (
    <g>
      <circle
        className={`level-node ${isActive ? "is-on" : ""}`}
        cx={x}
        cy={y}
        r="25"
      />
      <text
        className="level-svg-label level-node-value"
        x={x}
        y={y + 8}
        textAnchor="middle"
      >
        {formatValue(isActive)}
      </text>
      <text className="level-svg-small" x={x - 40} y={y + 48}>
        {input} = {formatValue(isActive)}
      </text>
    </g>
  );
}

function OutputNode({ isActive, isRevealed, x, y }: OutputNodeProps) {
  const outputState = isRevealed ? (isActive ? "is-on" : "is-off") : "";

  return (
    <g>
      <rect
        className={`level-led ${isRevealed && isActive ? "is-on" : ""}`}
        x={x}
        y={y - 41}
        width="82"
        height="82"
        rx="20"
      />
      <text
        className={`level-svg-label level-output-text ${outputState}`}
        x={x + 30}
        y={y + 11}
      >
        {isRevealed ? formatValue(isActive) : "?"}
      </text>
      <text className="level-svg-small" x={x - 10} y={y + 74}>
        {isRevealed
          ? `Salida ${isActive ? "encendida" : "apagada"}`
          : "Salida oculta"}
      </text>
    </g>
  );
}

function GateNode({ gate, isActive, x, y }: GateNodeProps) {
  const shellClass = `level-gate-shell ${isActive ? "is-complete" : ""}`;

  if (gate === "AND" || gate === "NAND") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path className={shellClass} d="M0 0H72A60 60 0 0 1 72 120H0Z" />
        {gate === "NAND" ? (
          <circle className="level-gate-bubble" cx="150" cy="60" r="13" />
        ) : null}
        <text
          className="level-svg-label level-gate-text"
          x="62"
          y="69"
          textAnchor="middle"
        >
          {gate}
        </text>
      </g>
    );
  }

  if (gate === "OR" || gate === "NOR" || gate === "XOR" || gate === "XNOR") {
    return (
      <g transform={`translate(${x} ${y})`}>
        {gate === "XOR" || gate === "XNOR" ? (
          <path className="level-gate-extra" d="M-18 0C12 42 12 78 -18 120" />
        ) : null}
        <path
          className={shellClass}
          d="M0 0C50 4 112 22 150 60C112 98 50 116 0 120C30 78 30 42 0 0Z"
        />
        {gate === "NOR" || gate === "XNOR" ? (
          <circle className="level-gate-bubble" cx="170" cy="60" r="13" />
        ) : null}
        <text
          className="level-svg-label level-gate-text"
          x="74"
          y="69"
          textAnchor="middle"
        >
          {gate}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={shellClass} d="M0 0L128 60L0 120Z" />
      <circle className="level-gate-bubble" cx="148" cy="60" r="13" />
      <text
        className="level-svg-label level-gate-text"
        x="54"
        y="69"
        textAnchor="middle"
      >
        NOT
      </text>
    </g>
  );
}

function getGateOutputX(gate: GateName, x: number) {
  if (gate === "NOR" || gate === "XNOR") {
    return x + 184;
  }

  if (gate === "NOT" || gate === "NAND") {
    return x + 164;
  }

  if (gate === "AND") {
    return x + 132;
  }

  return x + 150;
}

function renderPracticeBoard(
  level: LevelDefinition,
  inputStates: InputStates,
  result: boolean,
) {
  const gate = level.gates[0];
  const inputYPositions =
    level.inputs.length === 1 ? oneInputYPositions : twoInputYPositions;
  const gateY = 160;
  const gateX = 392;
  const outputStart = getGateOutputX(gate, gateX);

  return (
    <>
      {level.inputs.map((input, index) => {
        const fromY = inputYPositions[index];
        const toY = level.inputs.length === 1 ? 220 : index === 0 ? 190 : 250;
        const isActive = Boolean(inputStates[input]);
        const path = `M88 ${fromY} H282 C326 ${fromY} 326 ${toY} ${gateX} ${toY}`;

        return (
          <g key={input}>
            <SignalWire d={path} isActive={isActive} />
            <InputNode input={input} isActive={isActive} x={88} y={fromY} />
          </g>
        );
      })}
      <SignalWire d={`M${outputStart} 220 H704`} isActive={result} />
      <GateNode gate={gate} isActive={result} x={gateX} y={gateY} />
      <OutputNode isActive={result} isRevealed x={704} y={220} />
    </>
  );
}

type TreeSource = {
  elements: ReactElement[];
  value: boolean;
  x: number;
  y: number;
};

function getInputYPositions(inputCount: number) {
  return inputYPositionsByCount[inputCount] ?? inputYPositionsByCount[4];
}

function getGateDepth(node: CircuitNode): number {
  if (node.type === "input") {
    return 0;
  }

  return 1 + Math.max(...node.inputs.map(getGateDepth));
}

function isSingleGateCircuit(level: LevelDefinition) {
  return getGateDepth(level.circuit.output) === 1;
}

function getChallengeGateX(depth: number, maxDepth: number) {
  if (maxDepth >= 3) {
    const deepCircuitColumns = [608, 392, 168];

    return deepCircuitColumns[depth] ?? deepCircuitColumns.at(-1)!;
  }

  const compactCircuitColumns = [520, 248];

  return compactCircuitColumns[depth] ?? compactCircuitColumns.at(-1)!;
}

function getGateInputY(gateTopY: number, index: number, inputCount: number) {
  if (inputCount === 1) {
    return gateTopY + 60;
  }

  if (inputCount === 2) {
    return gateTopY + (index === 0 ? 38 : 82);
  }

  return gateTopY + 30 + index * 30;
}

function renderChallengeTree(
  node: CircuitNode,
  inputStates: InputStates,
  inputPositions: Partial<Record<InputName, number>>,
  maxDepth: number,
  revealRootResult: boolean,
  depth = 0,
  keyPrefix = "root",
): TreeSource {
  if (node.type === "input") {
    const y = inputPositions[node.name] ?? 220;

    return {
      elements: [],
      value: Boolean(inputStates[node.name]),
      x: 118,
      y,
    };
  }

  const childSources = node.inputs.map((child, index) =>
    renderChallengeTree(
      child,
      inputStates,
      inputPositions,
      maxDepth,
      revealRootResult,
      depth + 1,
      `${keyPrefix}-${index}`,
    ),
  );
  const centerY =
    childSources.reduce((total, child) => total + child.y, 0) /
    childSources.length;
  const gateY = Math.min(332, Math.max(50, centerY - 60));
  const gateX = getChallengeGateX(depth, maxDepth);
  const gateValue = evaluateNode(node, inputStates);
  const childElements = childSources.flatMap((child) => child.elements);
  const wireElements = childSources.map((child, index) => {
    const targetY = getGateInputY(gateY, index, childSources.length);
    const controlX = child.x + (gateX - child.x) * 0.52;

    return (
      <SignalWire
        d={`M${child.x} ${child.y} C${controlX} ${child.y} ${controlX} ${targetY} ${gateX} ${targetY}`}
        isActive={child.value}
        key={`${keyPrefix}-wire-${index}`}
        variant={index > 0 ? "warm" : "default"}
      />
    );
  });

  return {
    elements: [
      ...childElements,
      ...wireElements,
      <GateNode
        gate={node.gate}
        isActive={(depth > 0 || revealRootResult) && gateValue}
        key={`${keyPrefix}-${node.gate}`}
        x={gateX}
        y={gateY}
      />,
    ],
    value: gateValue,
    x: getGateOutputX(node.gate, gateX),
    y: gateY + 60,
  };
}

function renderChallengeBoard(
  level: LevelDefinition,
  inputStates: InputStates,
  result: boolean,
  revealOutput: boolean,
) {
  const yPositions = getInputYPositions(level.inputs.length);
  const inputPositions = Object.fromEntries(
    level.inputs.map((input, index) => [input, yPositions[index]]),
  ) as Partial<Record<InputName, number>>;
  const maxDepth = getGateDepth(level.circuit.output);
  const tree = renderChallengeTree(
    level.circuit.output,
    inputStates,
    inputPositions,
    maxDepth,
    revealOutput,
  );

  return (
    <>
      {level.inputs.map((input) => (
        <InputNode
          input={input}
          isActive={Boolean(inputStates[input])}
          key={input}
          x={88}
          y={inputPositions[input] ?? 220}
        />
      ))}
      {tree.elements}
      <SignalWire
        d={`M${tree.x} ${tree.y} H744`}
        isActive={revealOutput && result}
      />
      <OutputNode
        isActive={result}
        isRevealed={revealOutput}
        x={744}
        y={tree.y}
      />
    </>
  );
}

function renderFallbackBoard(
  level: LevelDefinition,
  inputStates: InputStates,
  result: boolean,
  revealOutput: boolean,
) {
  if (isSingleGateCircuit(level)) {
    return renderPracticeBoard(level, inputStates, result);
  }

  return renderChallengeBoard(level, inputStates, result, revealOutput);
}

function getInputNodeHotspots(level: LevelDefinition) {
  const yPositions = isSingleGateCircuit(level)
    ? level.inputs.length === 1
      ? oneInputYPositions
      : twoInputYPositions
    : getInputYPositions(level.inputs.length);

  return level.inputs.map((input, index) => ({
    input,
    x: 88,
    y: yPositions[index] ?? 220,
  }));
}

function getClosestInputHotspot(
  inputHotspots: ReturnType<typeof getInputNodeHotspots>,
  clientX: number,
  clientY: number,
  bounds: DOMRect,
) {
  const pointerX = ((clientX - bounds.left) / bounds.width) * 860;
  const pointerY = ((clientY - bounds.top) / bounds.height) * 480;

  return inputHotspots.reduce((closest, hotspot) => {
    const closestDistance = Math.hypot(
      closest.x - pointerX,
      closest.y - pointerY,
    );
    const hotspotDistance = Math.hypot(
      hotspot.x - pointerX,
      hotspot.y - pointerY,
    );

    return hotspotDistance < closestDistance ? hotspot : closest;
  }).input;
}

export function CircuitBoard({
  heading,
  inputStates,
  level,
  pulse,
  result,
  revealOutput = true,
  onToggleInput,
}: CircuitBoardProps) {
  const topologyDescriptionId = useId();
  const outputText = formatValue(result);
  const outputDescription = revealOutput
    ? `Salida actual ${outputText}`
    : "Salida oculta hasta enviar respuesta";
  const boardContent = renderFallbackBoard(
    level,
    inputStates,
    result,
    revealOutput,
  );
  const inputHotspots = getInputNodeHotspots(level);
  const handlePointerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.detail === 0) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onToggleInput(
      getClosestInputHotspot(
        inputHotspots,
        event.clientX,
        event.clientY,
        bounds,
      ),
    );
  };

  return (
    <div className={`level-board ${pulse ? `is-${pulse}-pulse` : ""}`}>
      <div className="level-board-stage">
        <svg
          viewBox="0 0 860 480"
          role="img"
          aria-describedby={topologyDescriptionId}
          aria-label={`${heading}. ${outputDescription}. Entradas: ${level.inputs
            .map((input) => `${input} igual ${formatValue(inputStates[input])}`)
            .join(", ")}.`}
        >
          <desc id={topologyDescriptionId}>
            {describeCircuitTopology(level.circuit.output)}
          </desc>
          {boardContent}
        </svg>
        <div
          className="level-node-hotspots"
          role="group"
          aria-label="Controles del circuito"
          onClickCapture={handlePointerClick}
        >
          {inputHotspots.map(({ input, x, y }) => {
            const isOn = Boolean(inputStates[input]);
            const nextState = isOn ? "apagar" : "encender";

            return (
              <button
                aria-label={`Nodo de entrada ${input} ${isOn ? "encendida" : "apagada"}. Tocar para ${nextState}.`}
                aria-pressed={isOn}
                className={`level-node-hotspot ${isOn ? "is-on" : ""}`}
                key={input}
                style={{
                  left: `${(x / 860) * 100}%`,
                  top: `${(y / 480) * 100}%`,
                }}
                type="button"
                onClick={() => onToggleInput(input)}
              >
                <span>{input}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
