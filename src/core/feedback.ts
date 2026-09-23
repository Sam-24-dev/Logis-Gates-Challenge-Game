import { evaluateCircuit } from "./evaluateCircuit";
import { generateTruthTable } from "./truthTable";
import type { GateName, InputName, InputStates, LevelDefinition } from "./gameTypes";

type FeedbackStatus = "learning" | "solved";

export type EducationalFeedback = {
  currentCombination: string;
  hint: string;
  reading: string;
  rule: string;
  status: FeedbackStatus;
  targetSummary: string;
};

const gateRules: Record<GateName, string> = {
  AND: "AND necesita que todas sus entradas estén en 1 para encender la salida.",
  OR: "OR se enciende cuando al menos una entrada lleva señal 1.",
  NOT: "NOT invierte una entrada: si entra 1 sale 0, y si entra 0 sale 1.",
  XOR: "XOR se enciende cuando las entradas son diferentes.",
  NAND: "NAND es AND invertida: solo se apaga cuando todas sus entradas están en 1.",
  NOR: "NOR es OR invertida: solo se enciende cuando ninguna entrada lleva señal.",
  XNOR: "XNOR se enciende cuando las entradas son iguales.",
};

function formatValue(value: boolean | undefined) {
  return value ? "1" : "0";
}

function formatCombination(inputs: InputName[], inputStates: InputStates) {
  return inputs.map((input) => `${input}=${formatValue(inputStates[input])}`).join(" · ");
}

function getClosestTargetInput(
  inputs: InputName[],
  inputStates: InputStates,
  targetRows: InputStates[],
): { input: InputName; shouldBeOn: boolean } | null {
  const [closestTarget] = [...targetRows].sort((left, right) => {
    const leftDistance = inputs.filter(
      (input) => Boolean(left[input]) !== Boolean(inputStates[input]),
    ).length;
    const rightDistance = inputs.filter(
      (input) => Boolean(right[input]) !== Boolean(inputStates[input]),
    ).length;

    return leftDistance - rightDistance;
  });

  if (!closestTarget) {
    return null;
  }

  const nextInput = inputs.find(
    (input) => Boolean(closestTarget[input]) !== Boolean(inputStates[input]),
  );

  if (!nextInput) {
    return null;
  }

  return {
    input: nextInput,
    shouldBeOn: Boolean(closestTarget[nextInput]),
  };
}

function getHint(
  level: LevelDefinition,
  inputStates: InputStates,
  result: boolean,
  targetRows: InputStates[],
) {
  if (result) {
    return "La salida ya coincide con el objetivo: continúa al siguiente circuito.";
  }

  const nextMove = getClosestTargetInput(level.inputs, inputStates, targetRows);

  if (!nextMove) {
    return "Sigue una fila verde de la tabla y compara qué entrada cambia la salida.";
  }

  return `${nextMove.shouldBeOn ? "Activa" : "Apaga"} ${nextMove.input} y observa cómo cambia la señal final.`;
}

export function getPracticeFeedback(
  level: LevelDefinition,
  inputStates: InputStates,
): EducationalFeedback {
  const result = evaluateCircuit(level.circuit, inputStates);
  const gate = level.gates[0];
  const currentCombination = formatCombination(level.inputs, inputStates);
  const targetRows = generateTruthTable(level.circuit)
    .filter((row) => row.output)
    .map((row) => row.inputs);
  const targetSummary = targetRows
    .map((row) => formatCombination(level.inputs, row))
    .join(" / ");

  return {
    currentCombination,
    hint: getHint(level, inputStates, result, targetRows),
    reading: `Lectura actual: ${currentCombination} → salida ${formatValue(result)}.`,
    rule: gateRules[gate],
    status: result ? "solved" : "learning",
    targetSummary,
  };
}
