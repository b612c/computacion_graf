const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const gridSize = 20; // 20x20 grid (canvas is 400x400)
const tileCount = canvas.width / gridSize;
const gameSpeed = 100; // ms por frame

// Colors from CSS
const snakeColor = '#ffef5c';
const snakeHeadColor = '#fffde7';
const foodColor = '#ff0055';
const sfoodColor = '#ff5a5a';

const audioComer = document.getElementById('audioComer');
const sonidoChoque = document.getElementById('audioChoque');

// State variables
let snake = [];
let dx = gridSize;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let gameTimeout;
let isRunning = false;
let changingDirection = false;


// UI Buttons listeners
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

// Mobile Controls Listeners
document.getElementById('btn-up').addEventListener('pointerdown', (e) => { e.preventDefault(); handleInput('UP'); });
document.getElementById('btn-down').addEventListener('pointerdown', (e) => { e.preventDefault(); handleInput('DOWN'); });
document.getElementById('btn-left').addEventListener('pointerdown', (e) => { e.preventDefault(); handleInput('LEFT'); });
document.getElementById('btn-right').addEventListener('pointerdown', (e) => { e.preventDefault(); handleInput('RIGHT'); });



function initGame() {

    // Initial snake position (center)
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    changingDirection = false;

    spawnFood();

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    isRunning = true;
    main();
}

function main() {
    if (!isRunning) return;

    changingDirection = false;

    gameTimeout = setTimeout(function () {
        if (hasGameEnded()) {
            endGame();
            return;
        }
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = '#302f35';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => {
        // Neon glow effect for head
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = snakeColor;
            ctx.fillStyle = snakeHeadColor;
        } else {
            ctx.shadowBlur = 5;
            ctx.shadowColor = snakeColor;
            ctx.fillStyle = snakeColor;
        }

        ctx.strokeStyle = '#1c132b';
        ctx.lineWidth = 2;

        //  redondea los cuadritos de la serpiente 
        ctx.beginPath();
        ctx.roundRect(part.x, part.y, gridSize, gridSize, 5);
        ctx.fill();
        ctx.stroke();

        // Reset shadow to avoid affecting other elements too much
        ctx.shadowBlur = 0;
    });
}

function drawFood() {
    ctx.shadowBlur = 20;
    ctx.shadowColor = sfoodColor;
    ctx.fillStyle = foodColor;

    ctx.beginPath();
    // Draw a circle for food
    ctx.arc(foodX + gridSize / 2, foodY + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const hasEatenFood = head.x === foodX && head.y === foodY;
    if (hasEatenFood) {
        score += 1;
        audioComer.play();
        scoreDisplay.textContent = score;
        spawnFood();
    } else {
        // Remove tail if didn't eat
        snake.pop();
    }
}

function spawnFood() {
    // Generate random coordinates multiples of gridSize
    foodX = Math.floor(Math.random() * tileCount) * gridSize;
    foodY = Math.floor(Math.random() * tileCount) * gridSize;

    // Check if food spawned on snake, if so, reroll
    snake.forEach(function isFoodOnSnake(part) {
        const isSpawnedOnSnake = part.x === foodX && part.y === foodY;
        if (isSpawnedOnSnake) spawnFood();
    });
}

// function hasGameEnded() {
//     // Self collision
//     for (let i = 4; i < snake.length; i++) {
//         if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
//     }

//     // Wall collision
//     const hitLeftWall = snake[0].x < 0;
//     const hitRightWall = snake[0].x >= canvas.width;
//     const hitTopWall = snake[0].y < 0;
//     const hitBottomWall = snake[0].y >= canvas.height;

//     return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
// }

function hasGameEnded() {
    // 1. Calculamos dónde va a estar la cabeza en el próximo milisegundo
    const nextX = snake[0].x + dx;
    const nextY = snake[0].y + dy;

    // 2. Chocar con el cuerpo
    // Revisamos hasta snake.length - 1 porque la punta de la cola se va a mover de ahí
    for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === nextX && snake[i].y === nextY) return true;
    }

    // 3. Chocar con las paredes (usando la próxima posición: nextX y nextY)
    const hitLeftWall = nextX < 0;
    const hitRightWall = nextX >= canvas.width;
    const hitTopWall = nextY < 0;
    const hitBottomWall = nextY >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function endGame() {
    isRunning = false;
    clearTimeout(gameTimeout);

    sonidoChoque.currentTime = 0; // Reinicia el audio
    sonidoChoque.play().then(() => {
        console.log("¡Sonido reproducido con éxito por el DOM!");
    }).catch(error => {
        // Si el navegador lo bloquea, esto nos dirá EXACTAMENTE por qué
        console.error("El navegador bloqueó el sonido. Motivo:", error);
    });


    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function handleInput(direction) {
    if (changingDirection) return;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    switch (direction) {
        case 'LEFT':
            if (!goingRight) {
                dx = -gridSize;
                dy = 0;
            }
            break;
        case 'UP':
            if (!goingDown) {
                dx = 0;
                dy = -gridSize;
            }
            break;
        case 'RIGHT':
            if (!goingLeft) {
                dx = gridSize;
                dy = 0;
            }
            break;
        case 'DOWN':
            if (!goingUp) {
                dx = 0;
                dy = gridSize;
            }
            break;
    }
    changingDirection = true;


    // if (direction === 'LEFT' ) {
    //     dx = -gridSize;
    //     dy = 0;
    //     changingDirection = true;
    // }
    // if (direction === 'UP') {
    //     dx = 0;
    //     dy = -gridSize;
    //     changingDirection = true;
    // }
    // if (direction === 'RIGHT') {
    //     dx = gridSize;
    //     dy = 0;
    //     changingDirection = true;
    // }
    // if (direction === 'DOWN' ) {
    //     dx = 0;
    //     dy = gridSize;
    //     changingDirection = true;
    // }
}

// Keyboard listeners
document.addEventListener("keydown", (e) => {
    if (!isRunning) return;
    // Prevent default scrolling for arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowLeft': handleInput('LEFT'); break;
        case 'ArrowUp': handleInput('UP'); break;
        case 'ArrowRight': handleInput('RIGHT'); break;
        case 'ArrowDown': handleInput('DOWN'); break;
    }
});


// Initial paint
clearCanvas();
