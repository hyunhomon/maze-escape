const width = 20;
const height = 20;
const delay = 1;

const map = [
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
];

const start = { x: 0, y: 0 };
const goal = { x: 19, y: 19 };

const openSet = [];
const cameFrom = {};

const gScore = Array(width).fill().map(() => Array(height));
const fScore = Array(width).fill().map(() => Array(height));

let intervalId = null;
let isCompleted = true;

const createGrid = () => {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        document.getElementById('grid').appendChild(cell);
    }
    updateGrid();
}

const updateGrid = () => {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        const x = index % width;
        const y = Math.floor(index / width);

        cell.className = 'cell';

        if (x === start.x && y === start.y) cell.classList.add('start');
        else if (x === goal.x && y === goal.y) cell.classList.add('goal');
        else if (map[y][x] === 1) cell.classList.add('wall');
        else if (gScore[x][y] !== undefined) cell.classList.add('explored');
    });
}

const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const getNeighbors = ({ x, y }) => {
    const neighbors = [];

    if (x > 0 && map[y][x - 1] === 0) neighbors.push({ x: x - 1, y });
    if (x < width - 1 && map[y][x + 1] === 0) neighbors.push({ x: x + 1, y });
    if (y > 0 && map[y - 1][x] === 0) neighbors.push({ x, y: y - 1 });
    if (y < height - 1 && map[y + 1][x] === 0) neighbors.push({ x, y: y + 1 });
    
    return neighbors;
}

const aStar = () => {
    if (openSet.length === 0) {
        isCompleted = true;
        stopInterval();
        document.getElementById('msg').style.display = 'block';
        return;
    }

    let current = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
        const node = openSet[i];
        if (fScore[node.x][node.y] < fScore[current.x][current.y])
            current = node;
    }

    if (current.x === goal.x && current.y === goal.y) {
        document.getElementById('handleButton').style.display = 'none';

        isCompleted = true;
        stopInterval();
        while (current) {
            const cells = document.querySelectorAll('.cell');
            const index = current.y * width + current.x;

            cells[index].classList.remove('explored');
            cells[index].classList.add('path');

            current = cameFrom[`${current.x},${current.y}`];
        }
        return;
    }

    openSet.splice(openSet.indexOf(current), 1);
    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
        const tentativeGScore = gScore[current.x][current.y] + 1;

        if (gScore[neighbor.x][neighbor.y] === undefined || tentativeGScore < gScore[neighbor.x][neighbor.y]) {
            cameFrom[`${neighbor.x},${neighbor.y}`] = current;
            gScore[neighbor.x][neighbor.y] = tentativeGScore;
            fScore[neighbor.x][neighbor.y] = gScore[neighbor.x][neighbor.y] + heuristic(neighbor, goal);

            let isInOpenSet = false;
            for (let i = 0; i < openSet.length; i++) {
                const node = openSet[i];
                if (node.x === neighbor.x && node.y === neighbor.y) {
                    isInOpenSet = true;
                    break;
                }
            }
            if (!isInOpenSet) openSet.push(neighbor);
        }
    }

    updateGrid();
}

const handleAlgorithm = () => {
    if (intervalId) stopInterval();
    else {
        if (isCompleted) {
            openSet.length = 0;
            openSet.push(start);

            gScore[start.x][start.y] = 0;
            fScore[start.x][start.y] = heuristic(start, goal);

            isCompleted = false;
        }

        intervalId = setInterval(aStar, delay);
        updateButton();
    }
}

const resetAlgorithm = () => {
    if (intervalId) stopInterval();

    document.getElementById('msg').style.display = 'none';
    document.getElementById('handleButton').style.display = 'block';

    openSet.length = 0;
    gScore.forEach(row => row.fill());
    fScore.forEach(row => row.fill());
    isCompleted = true;

    updateGrid();
    updateButton();
}

const updateButton = () => {
    const handleButton = document.getElementById('handleButton');

    if (intervalId) {
        handleButton.textContent = 'Stop';
        handleButton.style.backgroundColor = '#F15858';
    } else if (isCompleted) {
        handleButton.textContent = 'Start';
        handleButton.style.backgroundColor = '#27D862';
    } else {
        handleButton.textContent = 'Continue';
        handleButton.style.backgroundColor = '#0940AE';
    }
}

const stopInterval = () => {
    clearInterval(intervalId);
    intervalId = null;
    updateButton();
}

document.getElementById('handleButton').addEventListener('click', handleAlgorithm);
document.getElementById('resetButton').addEventListener('click', resetAlgorithm);

createGrid();
updateButton();
