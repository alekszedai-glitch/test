// Константы
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Цвета фигур
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000',
    EMPTY: '#1a1a2e'
};

// Формы фигур
const SHAPES = {
    I: [
        [[0, 0, 0, 0],
         [1, 1, 1, 1],
         [0, 0, 0, 0],
         [0, 0, 0, 0]],
        [[0, 0, 1, 0],
         [0, 0, 1, 0],
         [0, 0, 1, 0],
         [0, 0, 1, 0]]
    ],
    O: [
        [[1, 1],
         [1, 1]]
    ],
    T: [
        [[0, 1, 0],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 1],
         [0, 1, 0]],
        [[0, 0, 0],
         [1, 1, 1],
         [0, 1, 0]],
        [[0, 1, 0],
         [1, 1, 0],
         [0, 1, 0]]
    ],
    S: [
        [[0, 1, 1],
         [1, 1, 0],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 1],
         [0, 0, 1]]
    ],
    Z: [
        [[1, 1, 0],
         [0, 1, 1],
         [0, 0, 0]],
        [[0, 0, 1],
         [0, 1, 1],
         [0, 1, 0]]
    ],
    J: [
        [[1, 0, 0],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 1],
         [0, 1, 0],
         [0, 1, 0]],
        [[0, 0, 0],
         [1, 1, 1],
         [0, 0, 1]],
        [[0, 1, 0],
         [0, 1, 0],
         [1, 1, 0]]
    ],
    L: [
        [[0, 0, 1],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 0],
         [0, 1, 1]],
        [[0, 0, 0],
         [1, 1, 1],
         [1, 0, 0]],
        [[1, 1, 0],
         [0, 1, 0],
         [0, 1, 0]]
    ]
};

// Игровые переменные
let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let dropInterval = 1000;
let lastDropTime = 0;
let fastDrop = false;

// Инициализация
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);

    createBoard();
    drawBoard();
}

// Создание игрового поля
function createBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Создание новой фигуры
function createPiece() {
    const pieces = Object.keys(SHAPES);
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        type: type,
        shape: SHAPES[type][0],
        rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0,
        color: COLORS[type]
    };
}

// Отрисовка блока
function drawBlock(x, y, color, context = ctx, size = BLOCK_SIZE) {
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size, size);
    context.strokeStyle = '#000';
    context.lineWidth = 1;
    context.strokeRect(x * size, y * size, size, size);
}

// Отрисовка игрового поля
function drawBoard() {
    // Очистка canvas
    ctx.fillStyle = COLORS.EMPTY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка установленных блоков
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }

    // Отрисовка текущей фигуры
    if (currentPiece) {
        drawPiece(currentPiece);
    }
}

// Отрисовка фигуры
function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

// Отрисовка следующей фигуры
function drawNextPiece() {
    nextCtx.fillStyle = COLORS.EMPTY;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece) {
        const size = 20;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * size) / 2 / size;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * size) / 2 / size;

        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    drawBlock(offsetX + x, offsetY + y, nextPiece.color, nextCtx, size);
                }
            }
        }
    }
}

// Проверка коллизий
function checkCollision(piece, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Движение фигуры
function movePiece(direction) {
    if (!gameRunning || gamePaused) return;

    const offset = { left: -1, right: 1, down: 0 }[direction];
    const offsetY = direction === 'down' ? 1 : 0;

    if (!checkCollision(currentPiece, offset, offsetY)) {
        currentPiece.x += offset;
        currentPiece.y += offsetY;
        drawBoard();
        return true;
    }

    if (direction === 'down') {
        lockPiece();
    }
    return false;
}

// Поворот фигуры
function rotatePiece() {
    if (!gameRunning || gamePaused || currentPiece.type === 'O') return;

    const rotations = SHAPES[currentPiece.type];
    const nextRotation = (currentPiece.rotation + 1) % rotations.length;
    const rotatedShape = rotations[nextRotation];

    const tempPiece = { ...currentPiece, shape: rotatedShape };

    if (!checkCollision(tempPiece)) {
        currentPiece.shape = rotatedShape;
        currentPiece.rotation = nextRotation;
        drawBoard();
    }
}

// Фиксация фигуры на поле
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;

                if (boardY < 0) {
                    gameOver();
                    return;
                }

                board[boardY][boardX] = currentPiece.color;
            }
        }
    }

    clearLines();
    spawnNewPiece();
}

// Очистка заполненных линий
function clearLines() {
    let linesCleared = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Проверяем эту линию снова
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        score += [0, 100, 300, 500, 800][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        updateScore();
    }
}

// Появление новой фигуры
function spawnNewPiece() {
    currentPiece = nextPiece || createPiece();
    nextPiece = createPiece();
    drawNextPiece();

    if (checkCollision(currentPiece)) {
        gameOver();
    }
}

// Обновление счёта
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
}

// Обработка нажатий клавиш
function handleKeyPress(e) {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece('right');
            break;
        case 'ArrowDown':
            e.preventDefault();
            fastDrop = true;
            movePiece('down');
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
}

// Обработка отпускания клавиши
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        fastDrop = false;
    }
});

// Пауза
function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
}

// Игровой цикл
function gameLoop(timestamp) {
    if (!gameRunning) return;

    if (!gamePaused) {
        const currentInterval = fastDrop ? 50 : dropInterval;

        if (timestamp - lastDropTime > currentInterval) {
            movePiece('down');
            lastDropTime = timestamp;
        }

        drawBoard();
    }

    requestAnimationFrame(gameLoop);
}

// Начало игры
function startGame() {
    createBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameRunning = true;
    gamePaused = false;
    fastDrop = false;

    document.getElementById('gameOver').classList.add('hidden');
    updateScore();

    nextPiece = createPiece();
    spawnNewPiece();

    lastDropTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Конец игры
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Запуск при загрузке страницы
window.addEventListener('load', init);
