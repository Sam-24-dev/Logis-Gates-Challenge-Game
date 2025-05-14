document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('intro-screen').style.display = 'block';
});

// Inicialización de los Niveles
let currentLevel = 1;
let difficulty = 'easy';
let inputStates = {};
let levelCompleted = false;

const levels = {
    easy: {
        1: {
            title: "Nivel Bajo - Nivel 1",
            inputs: ['A', 'B'],
            gates: ['AND'],
            logic: function() {
                return inputStates.A && inputStates.B;
            },
            feedbackCorrect: "¡Correcto! Activaste ambas entradas A y B, lo que hizo que la compuerta AND produjera una salida positiva.",
            feedbackIncorrect: "La combinación no es correcta. "
        },
        2: {
            title: "Nivel Bajo - Nivel 2",
            inputs: ['A', 'B'],
            gates: ['OR'],
            logic: function() {
                return inputStates.A || inputStates.B;
            },
            feedbackCorrect: "¡Correcto! Activaste A o B, lo que hizo que la compuerta OR produjera una salida positiva.",
            feedbackIncorrect: "La combinación no es correcta."
        },
        3: {
            title: "Nivel Bajo - Nivel 3",
            inputs: ['A', 'B'],
            gates: ['XOR'],
            logic: function() {
                return inputStates.A !== inputStates.B;
            },
            feedbackCorrect: "¡Correcto! Activaste A o B, lo que hizo que la compuerta XOR produjera una salida positiva.",
            feedbackIncorrect: "La combinación no es correcta."
        },
        4: {
            title: "Nivel Bajo - Nivel 4",
            inputs: ['A', 'B'],
            gates: ['NAND'],
            logic: function() {
                return !(inputStates.A && inputStates.B);
            },
            feedbackCorrect: "¡Correcto! Activaste A o B (o no activaste ninguna), lo que hizo que la compuerta NAND produjera una salida positiva.",
            feedbackIncorrect: "La combinación no es correcta."
        },
    },
    hard: {
        1: {
            title: "Nivel Alto - Nivel 1",
            inputs: ['A', 'B', 'C'],
            gates: ['XOR', 'NOT', 'AND'], // Añadida la compuerta AND
            logic: function() {
                const xorResult = inputStates.A !== inputStates.B;
                const notResult = !inputStates.C;
                return xorResult && notResult; // segun la compuerta and,esa es ,la salida
            },
            feedbackCorrect: "¡Correcto! Descubriste una de las soluciones de la lógica de las compuertas.",
            feedbackIncorrect: "La combinación no es correcta."
        },
        2: {
            title: "Nivel Alto - Nivel 2",
            inputs: ['A', 'B', 'C', 'D'],
            gates: ['AND', 'NAND','XOR'],
            logic: function() {
                const andResult = inputStates.A && inputStates.B;
                const nandResult = !(inputStates.C && inputStates.D);
                return andResult !== nandResult; //segun la compuerta xor,esa es la salida
            },
            feedbackCorrect: "¡Correcto! Descubriste una de las soluciones de la lógica de las compuertas.",
            feedbackIncorrect: "La combinación no es correcta. Intenta de nuevo"
        }
    }
};

// Función para mostrar la pantalla de selección de nivel
function showLevelSelection() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('level-selection').style.display = 'block';
}

// Función para empezar el nivel seleccionado
function startLevel(selectedDifficulty) {
    difficulty = selectedDifficulty;
    currentLevel = 1;
    levelCompleted = false;
    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('go-back-menu').style.display = 'block'; // Mostrar botón "Regresar al Menú Principal" al comenzar el nivel
    loadLevel(currentLevel);

}

// Función para cargar un nivel
function loadLevel(level) {
    const levelData = levels[difficulty][level];
    document.getElementById('level-title').textContent = levelData.title;
    const buttonsContainer = document.getElementById('buttons-container');
    buttonsContainer.innerHTML = '';

    // Mostrar el diagrama del circuito
    const circuitDiagram = document.getElementById('circuit-diagram');
    circuitDiagram.innerHTML = ''; // Limpiar el diagrama anterior
    drawCircuit(levelData.inputs, levelData.gates);

    // Crear botones de entrada
    levelData.inputs.forEach((input) => {
        inputStates[input] = false; // Inicializar el estado de la entrada
        const button = document.createElement('button');
        button.textContent = input;
        button.className = 'input-button off';
        button.onclick = () => {
            inputStates[input] = !inputStates[input];
            button.className = inputStates[input] ? 'input-button on' : 'input-button off';
            updateOutput();
        };
        buttonsContainer.appendChild(button);
    });

    // Reiniciar el estado de la salida y feedback
    document.getElementById('output').className = 'output-led off';
    document.getElementById('output').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('retry-level').style.display = 'none';
    document.getElementById('next-level').style.display = 'none';
    levelCompleted = false; // Reiniciar el estado de nivel completado
}

// Función para actualizar la salida
function updateOutput() {
    const levelData = levels[difficulty][currentLevel];
    const result = levelData.logic();
    const output = document.getElementById('output');
    const circuitOutput = document.getElementById('circuit-output');
    output.className = 'output-led ' + (result ? 'on' : 'off');
    circuitOutput.className = 'circuit-output ' + (result ? 'on' : 'off');
    output.textContent = result ? '1' : '0';

    if (result) {
        document.getElementById('feedback').textContent = levelData.feedbackCorrect;
        document.getElementById('next-level').style.display = 'block';
        levelCompleted = true;
    } else {
        document.getElementById('feedback').textContent = levelData.feedbackIncorrect;
        document.getElementById('retry-level').style.display = 'block';
        levelCompleted = false;
    }
}

// Función para dibujar el circuito con posiciones dinámicas
function drawCircuit(inputs, gates) {
    const diagram = document.getElementById('circuit-diagram');
    const inputPositions = inputs.map((input, index) => ({
        input,
        x: 20 + (currentLevel - 1) * 50, // Mover entradas según nivel
        y: 80 + index * 55
    }));

    const gatePositions = gates.map((gate, index) => {
        let xPos = 200 + (currentLevel - 1) * 50; // Mover compuertas según nivel
        let yPos = 100 + index * 80;

        if (difficulty === 'hard') {
            if (gate === 'AND' && currentLevel === 1) {
                xPos += 100; // Mover más a la derecha
                yPos -= 130;
            } else if (gate === 'NOT' && currentLevel === 1) {
                yPos -= 10;
            } else if (gate === 'XOR' && currentLevel === 1) {
                yPos -= 10;
            } else if (gate === 'XOR' && currentLevel === 2) {
                xPos += 100;
                yPos -= 118;
            } else if (gate === 'NAND' && currentLevel === 2) {
                yPos += 5;
            }else if (gate === 'AND' && currentLevel === 2) {
                yPos -= 5;
            }

        } else if (difficulty === 'easy') {
            if (gate === 'AND' && currentLevel === 1) {
                yPos -= 10;
            } else if (gate === 'OR' && currentLevel === 2) { // Nivel 2
                
                yPos -= 10;
            } else if (gate === 'XOR' && currentLevel === 3) { // Nivel 3
                yPos -= 10;
            } else if (gate === 'NAND' && currentLevel === 4) { // Nivel 4
                yPos -= 10;
            }
        }

        return {
            gate,
            x: xPos,
            y: yPos
        };
    });
    // Dibujar las entradas
    inputPositions.forEach((pos) => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'circuit-gate';
        inputDiv.style.left = (pos.x) + 'px';
        inputDiv.style.top = (pos.y) + 'px';
        inputDiv.textContent = pos.input;
        diagram.appendChild(inputDiv);

        // Dibujar líneas desde la entrada hasta la compuerta
        const lineDiv = document.createElement('div');
        lineDiv.className = 'circuit-line';
        lineDiv.style.width = '150px';
        lineDiv.style.left = (pos.x + 50) + 'px';
        lineDiv.style.top = (pos.y + 20) + 'px';
        diagram.appendChild(lineDiv);
    });

    // Dibujar las compuertas
    gatePositions.forEach((pos, index) => {
        const gateDiv = document.createElement('div');
        gateDiv.className = 'circuit-gate';
        gateDiv.style.left = pos.x + 'px';
        gateDiv.style.top = pos.y + 'px';
        gateDiv.textContent = gates[index];
        diagram.appendChild(gateDiv);

        const lineDiv = document.createElement('div');
        lineDiv.className = 'circuit-line';
        lineDiv.style.width = '80px';
        lineDiv.style.left = (pos.x + 50) + 'px';
        lineDiv.style.top = (pos.y + 50) + 'px';
        diagram.appendChild(lineDiv);
    });

    // Dibujar el círculo de salida
    const outputDiv = document.createElement('div');
    outputDiv.className = 'circuit-output off';
    outputDiv.style.left = (gatePositions[gatePositions.length - 1].x + 106) + 'px';
    outputDiv.style.top = (gatePositions[gatePositions.length - 1].y + 10) + 'px';
    outputDiv.id = 'circuit-output';
    diagram.appendChild(outputDiv);
}

// Función para avanzar al siguiente nivel
function startNextLevel() {
    if (levelCompleted) {
        currentLevel++;
        if (currentLevel <= Object.keys(levels[difficulty]).length) {
            loadLevel(currentLevel);
        } else {
            alert('¡Felicidades! Has completado todos los niveles.');
            goBackToLevelSelection();
        }
    }
}

// Función para volver a jugar el nivel actual
function retryLevel() {
    loadLevel(currentLevel);
}

// Función para regresar al menú de selección de nivel
function goBackToLevelSelection() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('level-selection').style.display = 'block';
    document.getElementById('go-back-menu').style.display = 'none'; // Ocultar botón "Regresar al Menú Principal" al salir del nivel
}

// Mostrar el botón "Volver al Menú Principal" solo en los niveles
function toggleMenuButtonVisibility() {
    const menuButton = document.getElementById('go-back-menu');
    menuButton.style.display = document.getElementById('game-container').style.display === 'block' ? 'block' : 'none';
}





    

    
   

    








