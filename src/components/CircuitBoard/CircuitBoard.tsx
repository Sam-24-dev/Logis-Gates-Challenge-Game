import { useId, useLayoutEffect, useRef, useState, type ReactElement } from "react";
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

const MAX_LAYOUT_INPUTS = 4;
const MAX_LAYOUT_DEPTH = 3;
const MAX_GATE_INPUTS = 2;

const inputYPositionsByCount: Record<number, number[]> = {
  1: [220],
  2: [170, 270],
  3: [104, 240, 376],
  4: [82, 164, 336, 418],
};

type BoardLayout = {
  inputY: number[];
  shiftX: number;
  width: number;
  height: number;
  compact: boolean;
};

function getBoardLayout(
  inputCount: number,
  stageWidth: number,
  controlSize: number,
  focusSpace: number,
): BoardLayout {
  const wideY = inputYPositionsByCount[inputCount];
  const scale = stageWidth / 860;
  const margin = controlSize / 2 + focusSpace;
  const fits =
    88 * scale >= margin &&
    wideY.every((y, i) => i === 0 || (y - wideY[i - 1]) * scale >= controlSize + 12);
  if (fits) {
    return { inputY: wideY, shiftX: 0, width: 860, height: 480, compact: false };
  }

  // Move the whole circuit together; reserve CSS space for the target and focus ring.
  const shiftX = Math.max(
    0,
    (margin * 860 - 88 * stageWidth) / Math.max(1, stageWidth - margin),
  );
  const width = 860 + shiftX;
  const compactScale = stageWidth / width;
  const firstY = Math.max(130, margin / compactScale);
  const step = Math.max(220, (controlSize + 12.5) / compactScale);
  const inputY = Array.from({ length: inputCount }, (_, i) => firstY + step * i);
  return {
    inputY,
    shiftX,
    width,
    height: Math.max(480, inputY.at(-1)! + Math.max(130, margin / compactScale)),
    compact: true,
  };
}

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

function InputNode({ isActive, x, y }: InputNodeProps) {
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

function assertNeverGate(gate: never): never {
  throw new Error(`Unsupported gate: ${String(gate)}`);
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

  if (gate === "NOT") {
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

  return assertNeverGate(gate);
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

  if (gate === "OR" || gate === "XOR") {
    return x + 150;
  }

  return assertNeverGate(gate);
}

function renderPracticeBoard(
  level: LevelDefinition,
  inputStates: InputStates,
  result: boolean,
  layout: BoardLayout,
) {
  const gate = level.gates[0];
  const inputYPositions = layout.inputY;
  const centerY = inputYPositions.reduce((sum, y) => sum + y, 0) / inputYPositions.length;
  const gateY = centerY - 60;
  const gateX = 392 + layout.shiftX;
  const outputStart = getGateOutputX(gate, gateX);

  return (
    <>
      {level.inputs.map((input, index) => {
        const fromY = inputYPositions[index];
        const toY = gateY + (level.inputs.length === 1 ? 60 : index === 0 ? 30 : 90);
        const isActive = Boolean(inputStates[input]);
        const path = `M${88 + layout.shiftX} ${fromY} H${282 + layout.shiftX} C${326 + layout.shiftX} ${fromY} ${326 + layout.shiftX} ${toY} ${gateX} ${toY}`;

        return (
          <g key={input}>
            <SignalWire d={path} isActive={isActive} />
            <InputNode isActive={isActive} x={88 + layout.shiftX} y={fromY} />
          </g>
        );
      })}
      <SignalWire d={`M${outputStart} ${centerY} H${704 + layout.shiftX}`} isActive={result} />
      <GateNode gate={gate} isActive={result} x={gateX} y={gateY} />
      <OutputNode isActive={result} isRevealed x={704 + layout.shiftX} y={centerY} />
    </>
  );
}

type TreeSource = {
  elements: ReactElement[];
  value: boolean;
  x: number;
  y: number;
};

function getGateDepth(node: CircuitNode): number {
  if (node.type === "input") {
    return 0;
  }

  return 1 + Math.max(...node.inputs.map(getGateDepth));
}

function assertSupportedCircuitLayout(level: LevelDefinition) {
  if (level.inputs.length > MAX_LAYOUT_INPUTS) {
    throw new Error(
      `Circuit layout supports at most ${MAX_LAYOUT_INPUTS} inputs; received ${level.inputs.length}.`,
    );
  }

  function assertGateSourceCapacity(node: CircuitNode) {
    if (node.type === "input") {
      return;
    }

    if (node.inputs.length > MAX_GATE_INPUTS) {
      throw new Error(
        `Circuit layout supports at most ${MAX_GATE_INPUTS} sources per gate; ${node.gate} received ${node.inputs.length}.`,
      );
    }

    node.inputs.forEach(assertGateSourceCapacity);
  }

  assertGateSourceCapacity(level.circuit.output);

  const depth = getGateDepth(level.circuit.output);
  if (depth > MAX_LAYOUT_DEPTH) {
    throw new Error(
      `Circuit layout supports a maximum depth of ${MAX_LAYOUT_DEPTH}; received ${depth}.`,
    );
  }
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
  layout: BoardLayout,
  revealRootResult: boolean,
  depth = 0,
  keyPrefix = "root",
): TreeSource {
  if (node.type === "input") {
    const y = inputPositions[node.name] ?? 220;

    return {
      elements: [],
      value: Boolean(inputStates[node.name]),
      x: 118 + layout.shiftX,
      y,
    };
  }

  const childSources = node.inputs.map((child, index) =>
    renderChallengeTree(
      child,
      inputStates,
      inputPositions,
      maxDepth,
      layout,
      revealRootResult,
      depth + 1,
      `${keyPrefix}-${index}`,
    ),
  );
  const centerY =
    childSources.reduce((total, child) => total + child.y, 0) /
    childSources.length;
  const gateY = Math.min(layout.compact ? layout.height - 134 : 332, Math.max(50, centerY - 60));
  const gateX = getChallengeGateX(depth, maxDepth) + layout.shiftX;
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
  layout: BoardLayout,
) {
  const yPositions = layout.inputY;
  const inputPositions = Object.fromEntries(
    level.inputs.map((input, index) => [input, yPositions[index]]),
  ) as Partial<Record<InputName, number>>;
  const maxDepth = getGateDepth(level.circuit.output);
  const tree = renderChallengeTree(
    level.circuit.output,
    inputStates,
    inputPositions,
    maxDepth,
    layout,
    revealOutput,
  );

  return (
    <>
      {level.inputs.map((input) => (
        <InputNode
          isActive={Boolean(inputStates[input])}
          key={input}
          x={88 + layout.shiftX}
          y={inputPositions[input] ?? 220}
        />
      ))}
      {tree.elements}
      <SignalWire
        d={`M${tree.x} ${tree.y} H${744 + layout.shiftX}`}
        isActive={revealOutput && result}
      />
      <OutputNode
        isActive={result}
        isRevealed={revealOutput}
        x={744 + layout.shiftX}
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
  layout: BoardLayout,
) {
  if (isSingleGateCircuit(level)) {
    return renderPracticeBoard(level, inputStates, result, layout);
  }

  return renderChallengeBoard(level, inputStates, result, revealOutput, layout);
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
  const stageRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 860,
    size: 68,
    focusSpace: 12,
  });
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const control = controlRef.current;
    if (!stage || !control) return;
    const measure = () => {
      const width = stage.getBoundingClientRect().width;
      const bounds = control.getBoundingClientRect();
      const size = Math.max(bounds.width, bounds.height);
      if (!width || !size) return;
      const focusSpace = 7 + (parseFloat(getComputedStyle(control).outlineOffset) || 0);
      setDimensions((previous) =>
        previous.width === width &&
        previous.size === size &&
        previous.focusSpace === focusSpace
          ? previous
          : { width, size, focusSpace },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // One observer measures the stage and one representative control, including rem changes.
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(control);
    return () => observer.disconnect();
  }, []);

  assertSupportedCircuitLayout(level);
  const outputText = formatValue(result);
  const outputDescription = revealOutput
    ? `Salida actual ${outputText}`
    : "Salida oculta hasta enviar respuesta";
  const layout = getBoardLayout(
    level.inputs.length,
    dimensions.width,
    dimensions.size,
    dimensions.focusSpace,
  );
  const boardContent = renderFallbackBoard(
    level,
    inputStates,
    result,
    revealOutput,
    layout,
  );
  const inputHotspots = level.inputs.map((input, index) => ({
    input,
    x: 88 + layout.shiftX,
    y: layout.inputY[index],
  }));

  return (
    <div className={`level-board ${pulse ? `is-${pulse}-pulse` : ""}`}>
      <div className="level-board-stage" ref={stageRef}>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
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
        >
          {inputHotspots.map(({ input, x, y }, index) => {
            const isOn = Boolean(inputStates[input]);
            const nextState = isOn ? "apagar" : "encender";

            return (
              <button
                aria-label={`Nodo de entrada ${input} ${isOn ? "encendida" : "apagada"}. Tocar para ${nextState}.`}
                aria-pressed={isOn}
                className={`level-node-hotspot ${isOn ? "is-on" : ""}`}
                key={input}
                ref={index === 0 ? controlRef : undefined}
                style={{
                  left: `${(x / layout.width) * 100}%`,
                  top: `${(y / layout.height) * 100}%`,
                }}
                type="button"
                onClick={() => onToggleInput(input)}
              >
                <span>{input}</span>
                <strong>{formatValue(isOn)}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
