import type {
  CircuitDefinition,
  CircuitNode,
  Difficulty,
  GateName,
  InputName,
  LevelDefinition,
  LevelsByDifficulty,
} from "../core/gameTypes";

function input(name: InputName): CircuitNode {
  return { type: "input", name };
}

function gate(gateName: GateName, inputs: CircuitNode[]): CircuitNode {
  return { type: "gate", gate: gateName, inputs };
}

function circuit(inputs: InputName[], output: CircuitNode): CircuitDefinition {
  return { inputs, output };
}

function createLevel({
  difficulty,
  levelNumber,
  title,
  inputs,
  gates,
  circuit,
  feedbackCorrect,
  feedbackIncorrect,
  initialInputStates,
}: Omit<LevelDefinition, "id">): LevelDefinition {
  return {
    id: `${difficulty}-${levelNumber}`,
    difficulty,
    levelNumber,
    title,
    inputs,
    gates,
    circuit,
    feedbackCorrect,
    feedbackIncorrect,
    initialInputStates,
  };
}

const easyLevels: Record<number, LevelDefinition> = {
  1: createLevel({
    difficulty: "easy",
    levelNumber: 1,
    title: "Práctica - AND",
    inputs: ["A", "B"],
    gates: ["AND"],
    circuit: circuit(["A", "B"], gate("AND", [input("A"), input("B")])),
    feedbackCorrect:
      "¡Correcto! AND solo enciende la salida cuando A y B están activas al mismo tiempo.",
    feedbackIncorrect:
      "AND todavía no recibe todas las señales necesarias para encender la salida.",
  }),
  2: createLevel({
    difficulty: "easy",
    levelNumber: 2,
    title: "Práctica - OR",
    inputs: ["A", "B"],
    gates: ["OR"],
    circuit: circuit(["A", "B"], gate("OR", [input("A"), input("B")])),
    feedbackCorrect:
      "¡Correcto! OR enciende la salida cuando A o B llevan señal.",
    feedbackIncorrect:
      "OR necesita al menos una entrada en 1 para encender la salida.",
  }),
  3: createLevel({
    difficulty: "easy",
    levelNumber: 3,
    title: "Práctica - NOT",
    inputs: ["A"],
    gates: ["NOT"],
    circuit: circuit(["A"], gate("NOT", [input("A")])),
    feedbackCorrect:
      "¡Correcto! NOT invierte la señal: si A está en 0, la salida pasa a 1.",
    feedbackIncorrect:
      "NOT invierte una sola entrada. Cambia A para ver cómo la salida toma el valor contrario.",
  }),
  4: createLevel({
    difficulty: "easy",
    levelNumber: 4,
    title: "Práctica - XOR",
    inputs: ["A", "B"],
    gates: ["XOR"],
    circuit: circuit(["A", "B"], gate("XOR", [input("A"), input("B")])),
    feedbackCorrect: "¡Correcto! XOR se enciende cuando A y B son diferentes.",
    feedbackIncorrect:
      "XOR necesita que las entradas sean distintas: una en 1 y la otra en 0.",
  }),
  5: createLevel({
    difficulty: "easy",
    levelNumber: 5,
    title: "Práctica - NAND",
    inputs: ["A", "B"],
    gates: ["NAND"],
    circuit: circuit(["A", "B"], gate("NAND", [input("A"), input("B")])),
    feedbackCorrect:
      "¡Correcto! NAND es AND invertida: solo se apaga cuando A y B son 1.",
    feedbackIncorrect:
      "NAND está apagada únicamente cuando ambas entradas están activas. Rompe esa combinación para encenderla.",
  }),
  6: createLevel({
    difficulty: "easy",
    levelNumber: 6,
    title: "Práctica - NOR",
    inputs: ["A", "B"],
    gates: ["NOR"],
    circuit: circuit(["A", "B"], gate("NOR", [input("A"), input("B")])),
    feedbackCorrect:
      "¡Correcto! NOR es OR invertida: se enciende solo cuando ninguna entrada lleva señal.",
    feedbackIncorrect:
      "NOR se apaga si cualquier entrada está en 1. Deja A y B en 0 para encenderla.",
  }),
  7: createLevel({
    difficulty: "easy",
    levelNumber: 7,
    title: "Práctica - XNOR",
    inputs: ["A", "B"],
    gates: ["XNOR"],
    circuit: circuit(["A", "B"], gate("XNOR", [input("A"), input("B")])),
    feedbackCorrect: "¡Correcto! XNOR se enciende cuando A y B son iguales.",
    feedbackIncorrect:
      "XNOR necesita igualdad: prueba dejar ambas entradas en 0 o ambas en 1.",
  }),
};

const hardLevels: Record<number, LevelDefinition> = {
  1: createLevel({
    difficulty: "hard",
    levelNumber: 1,
    title: "Reto 1 - XOR",
    inputs: ["A", "B", "C"],
    gates: ["XOR", "AND"],
    circuit: circuit(
      ["A", "B", "C"],
      gate("AND", [gate("XOR", [input("A"), input("B")]), input("C")]),
    ),
    feedbackCorrect: "XOR encontró una diferencia y C confirmó la salida.",
    feedbackIncorrect:
      "Busca una diferencia entre A y B, pero no olvides habilitar C.",
  }),
  2: createLevel({
    difficulty: "hard",
    levelNumber: 2,
    title: "Reto 2 - OR",
    inputs: ["A", "B", "C"],
    gates: ["OR", "AND"],
    circuit: circuit(
      ["A", "B", "C"],
      gate("AND", [gate("OR", [input("A"), input("B")]), input("C")]),
    ),
    feedbackCorrect: "OR abrió una rama y C cerró la condición final.",
    feedbackIncorrect:
      "OR necesita al menos una señal, y C debe validar el circuito.",
  }),
  3: createLevel({
    difficulty: "hard",
    levelNumber: 3,
    title: "Reto 3 - NOT",
    inputs: ["A", "B", "C"],
    gates: ["NOT", "AND"],
    circuit: circuit(
      ["A", "B", "C"],
      gate("AND", [
        gate("AND", [gate("NOT", [input("A")]), input("B")]),
        input("C"),
      ]),
    ),
    feedbackCorrect:
      "NOT invirtió A y las dos condiciones restantes cerraron el circuito.",
    feedbackIncorrect:
      "Recuerda que NOT invierte A; después B y C deben acompañar.",
    initialInputStates: { A: true, B: false, C: false },
  }),
  4: createLevel({
    difficulty: "hard",
    levelNumber: 4,
    title: "Reto 4 - NAND",
    inputs: ["A", "B", "C"],
    gates: ["NAND", "AND"],
    circuit: circuit(
      ["A", "B", "C"],
      gate("AND", [gate("NAND", [input("A"), input("B")]), input("C")]),
    ),
    feedbackCorrect:
      "NAND se mantuvo activa al romper la combinación AND completa.",
    feedbackIncorrect:
      "Si A y B están en 1, NAND se apaga. Rompe esa pareja y valida con C.",
    initialInputStates: { A: true, B: true, C: false },
  }),
  5: createLevel({
    difficulty: "hard",
    levelNumber: 5,
    title: "Reto 5 - NOR",
    inputs: ["A", "B", "C", "D"],
    gates: ["NOR", "XOR", "AND"],
    circuit: circuit(
      ["A", "B", "C", "D"],
      gate("AND", [
        gate("XOR", [gate("NOR", [input("A"), input("B")]), input("C")]),
        input("D"),
      ]),
    ),
    feedbackCorrect:
      "XOR comparó la salida de NOR con C y D confirmó la señal final.",
    feedbackIncorrect:
      "NOR solo se activa con A y B apagadas; después revisa C y D.",
    initialInputStates: { A: true, B: false, C: false, D: false },
  }),
  6: createLevel({
    difficulty: "hard",
    levelNumber: 6,
    title: "Reto 6 - XNOR",
    inputs: ["A", "B", "C", "D"],
    gates: ["XNOR", "XOR", "AND"],
    circuit: circuit(
      ["A", "B", "C", "D"],
      gate("AND", [
        gate("XNOR", [input("A"), input("B")]),
        gate("XOR", [input("C"), input("D")]),
      ]),
    ),
    feedbackCorrect:
      "XNOR confirmó igualdad y XOR pidió diferencia en la segunda rama.",
    feedbackIncorrect:
      "Una rama pide igualdad y la otra diferencia. Haz que ambas sean verdaderas.",
    initialInputStates: { A: true, B: false, C: false, D: false },
  }),
  7: createLevel({
    difficulty: "hard",
    levelNumber: 7,
    title: "Reto 7 - XNOR",
    inputs: ["A", "B", "C", "D"],
    gates: ["XNOR", "NAND", "AND"],
    circuit: circuit(
      ["A", "B", "C", "D"],
      gate("AND", [
        gate("XNOR", [input("A"), input("B")]),
        gate("NAND", [input("C"), input("D")]),
      ]),
    ),
    feedbackCorrect:
      "Igualaste la primera rama y evitaste que NAND se apagara en la segunda.",
    feedbackIncorrect:
      "El boss pide igualdad en A/B y que C/D no sean ambas 1.",
    initialInputStates: { A: true, B: false, C: true, D: true },
  }),
};

export const levelsByDifficulty: LevelsByDifficulty = {
  easy: easyLevels,
  hard: hardLevels,
};

export const allLevels = Object.values(levelsByDifficulty).flatMap((levels) =>
  Object.values(levels),
);

export function getFirstLevel(difficulty: Difficulty): LevelDefinition {
  return levelsByDifficulty[difficulty][1];
}
