// Inicialización de los niveles
let currentLevel = 1;
let difficulty = 'easy';
let inputStates = {};
const levels = {
    easy: {
        1: {
            title: "Nivel Bajo - Nivel 1",
            inputs: ['A', 'B'],
            logic: function() {
                // Lógica del circuito para Nivel 1: (A AND B)
                return inputStates.A && inputStates.B;
            }
        },
        2: {
            title: "Nivel Bajo - Nivel 2",
            inputs: ['A', 'B', 'C'],
            logic: function() {
                // Lógica del circuito para Nivel 2: (A OR B) AND NOT C
                return (inputStates.A || inputStates.B) && !inputStates.C;
            }
        }
    },
    hard: {
        1: {
            title: "Nivel Alto - Nivel 1",
            inputs: ['A', 'B', 'C'],
            logic: function() {
                // Lógica del circuito para Nivel 1 (Difícil): (A XOR B) AND (NOT C)
                return (inputStates.A !== inputStates.B) && !inputStates.C;
            }
        },
        2: {
            title: "Nivel Alto - Nivel 2",
            inputs: ['A', 'B', 'C', 'D'],
            logic: function() {
                // Lógica del circuito para Nivel 2 (Difícil): ((A AND B) OR (C NAND D))
                return (inputStates.A && inputStates.B) || !(inputStates.C && inputStates.D);
            }
        }
    }
};

// Función para empezar el nivel seleccionado
function startLevel(selectedDifficulty) {
    difficulty = selectedDifficulty;
    currentLevel = 1;  // Resetear a nivel 1
    document.querySelector('.level-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    loadLevel(currentLevel);
}

// Función para cargar un nivel
function loadLevel(level) {
    const levelData = levels[difficulty][level];
    document.getElementById('level-title').textContent = levelData.title;
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';

    // Crear botones para cada entrada
    levelData.inputs.forEach(input => {
        inputStates[input] = false;
        const button = document.createElement('button');
        button.className = 'input-button';
        button.textContent = `Entrada ${input}`;
        button.onclick = () => toggleInput(input);
        buttonsContainer.appendChild(button);
    });

    updateOutput();  // Evaluar y mostrar el resultado inicial
}

// Función para cambiar el estado de las entradas
function toggleInput(input) {
    inputStates[input] = !inputStates[input];
    updateOutput();
}

// Función que evalúa el circuito lógico y actualiza la salida
function updateOutput() {
    const output = levels[difficulty][currentLevel].logic();
    const outputElement = document.getElementById('output');
    if (output) {
        outputElement.classList.remove('off');
        outputElement.classList.add('on');
        outputElement.textContent = 'ON';
        document.getElementById('next-level').style.display = 'block';  // Mostrar botón para avanzar
    } else {
        outputElement.classList.remove('on');
        outputElement.classList.add('off');
        outputElement.textContent = 'OFF';
        document.getElementById('next-level').style.display = 'none';  // Ocultar botón para avanzar
    }
}

// Función para avanzar al siguiente nivel
function startNextLevel() {
    currentLevel++;
    if (levels[difficulty][currentLevel]) {
        loadLevel(currentLevel);
    } else {
        alert('¡Has completado todos los niveles!');
        document.getElementById('game-container').style.display = 'none';
        document.querySelector('.level-selection').style.display = 'block';
    }
}

