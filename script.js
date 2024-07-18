const rows = 6;
const cols = 7;
const board = [];
let currentPlayer = 'player';
let playerScore = 0;
let computerScore = 0;

const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const resetSound = document.getElementById('resetSound');
const notificationElement = document.getElementById('notification');

const boardElement = document.getElementById('board');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');

for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
        board[r][c] = null;
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = r;
        cellElement.dataset.col = c;
        boardElement.appendChild(cellElement);
    }
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

showNotification('Game Start!', 'info');

function makeMove(col, player) {
    for (let r = rows - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = player;
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            cell.classList.add(player);
            moveSound.play();
            return true;
        }
    }
    return false;
}

function handleCellClick(event) {
    const col = parseInt(event.target.dataset.col);
    if (currentPlayer === 'player') {
        if (makeMove(col, 'player')) {
            const win = checkWin('player');
            if (win) {
                drawWinLine(win);
                winSound.play();
                showNotification('Player wins!', 'success');
                playerScore++;
                playerScoreElement.textContent = playerScore;
                resetBoardWithDelay();
                return;
            }
            currentPlayer = 'computer';
            setTimeout(computerMove, 500);
        }
    }
}

function computerMove() {
    let bestCol = getBestMove();
    
    if (bestCol === null) {
        do {
            bestCol = Math.floor(Math.random() * cols);
        } while (board[0][bestCol]);
    }

    if (makeMove(bestCol, 'computer')) {
        const win = checkWin('computer');
        if (win) {
            drawWinLine(win);
            winSound.play();
            showNotification('Computer wins!', 'error');
            computerScore++;
            computerScoreElement.textContent = computerScore;
            resetBoardWithDelay();
            return;
        }
        currentPlayer = 'player';
    }
}

function getBestMove() {
    for (let col = 0; col < cols; col++) {
        const copyBoard = JSON.parse(JSON.stringify(board));
        if (makeMove(col, 'computer')) {
            if (checkWin('computer')) {
                undoMove(col);
                return col;
            }
            undoMove(col);
        }
    }

    for (let col = 0; col < cols; col++) {
        const copyBoard = JSON.parse(JSON.stringify(board));
        if (makeMove(col, 'player')) {
            if (checkWin('player')) {
                undoMove(col);
                return col;
            }
            undoMove(col);
        }
    }

    return null;
}

function undoMove(col) {
    for (let r = 0; r < rows; r++) {
        if (board[r][col]) {
            board[r][col] = null;
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            cell.classList.remove('player', 'computer');
            return;
        }
    }
}

function checkWin(player) {
    function checkDirection(r, c, dr, dc) {
        let count = 0;
        let winPositions = [];
        for (let i = 0; i < 4; i++) {
            const row = r + dr * i;
            const col = c + dc * i;
            if (row >= 0 && row < rows && col >= 0 && col < cols && board[row][col] === player) {
                count++;
                winPositions.push({ row, col });
            } else {
                break;
            }
        }
        return count === 4 ? winPositions : null;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === player) {
                let winPositions;
                if (winPositions = checkDirection(r, c, 0, 1) ||
                    checkDirection(r, c, 1, 0) ||
                    checkDirection(r, c, 1, 1) ||
                    checkDirection(r, c, 1, -1)) {
                    return winPositions;
                }
            }
        }
    }
    return null;
}

function drawWinLine(winPositions) {
    winPositions.forEach(pos => {
        const cell = document.querySelector(`.cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
        cell.classList.add('win');
    });

    const startCell = document.querySelector(`.cell[data-row="${winPositions[0].row}"][data-col="${winPositions[0].col}"]`);
    const endCell = document.querySelector(`.cell[data-row="${winPositions[3].row}"][data-col="${winPositions[3].col}"]`);

    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    const line = document.createElement('div');
    line.classList.add('win-line');

    const width = Math.sqrt(Math.pow(endRect.left - startRect.left, 2) + Math.pow(endRect.top - startRect.top, 2));
    const angle = Math.atan2(endRect.top - startRect.top, endRect.left - startRect.left) * 180 / Math.PI;

    line.style.width = `${width}px`;
    line.style.top = `${(startRect.top + endRect.top) / 2}px`;
    line.style.left = `${(startRect.left + endRect.left) / 2}px`;
    line.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    document.body.appendChild(line);
}

function resetBoard() {
    board.forEach((row, r) => row.forEach((_, c) => {
        board[r][c] = null;
        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        cell.classList.remove('player', 'computer', 'win');
    }));
    document.querySelectorAll('.win-line').forEach(line => line.remove());
    resetSound.play();
    currentPlayer = 'player';
}

function resetBoardWithDelay() {
    setTimeout(() => {
        resetBoard();
        showNotification('Game Start!', 'info');
    }, 3000);
}

function showNotification(message, type = 'info') {
    notificationElement.textContent = message;
    notificationElement.classList.remove('notification-success', 'notification-error');
    notificationElement.classList.add(`notification-${type}`);
    notificationElement.classList.add('show');
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000);
}
