import { handleEnemies, Enemy } from "./enemies.js"
import { handleDefenders, Defender, createDefender } from "./defenders.js"
import { handleProjectiles, Projectile } from "./defenders.js"
import { handleResources, Resource } from "./resources.js"


export const canvas = document.getElementById('canvas1');
export const ctx = canvas.getContext('2d');


// global variables
export const cellSize = canvas.width/9;
export const cellGap = 3;
export let numberOfResources = { numberOfResources: 10000000 };
export let enemiesInterval = { enemiesInterval: 600 };
export let frame = { frame: 0 };
export let gameOver = { gameOver: false };
export let score = { score: 0 };
export const winningScore = 1000;

export const gameGrid = [];
export const defenders = [];
export const enemies = [];
export const enemyPositions = [];
export const projectiles = [];
export const resources = [];

// mouse
export const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function () {
    mouse.y = undefined;
    mouse.y = undefined;
});




// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.color = color; // Aggiunto il colore come parametro
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Aggiunto il bordo nero solo se il mouse è sopra la cella
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            // Assegna un colore diverso a ciascuna cella
            const color = (x / cellSize + y / cellSize) % 2 === 0 ? '#aad751' : '#91c74b';
            gameGrid.push(new Cell(x, y, color));
        }
    }
}

createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;

    if (selectedDefender == "Pala") {
        removeDefender(gridPositionX, gridPositionY)
        return;
    }

    if (gridPositionY < cellSize || !selectedDefender) return;



    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }

    let newDefender = createDefender(gridPositionX, gridPositionY, selectedDefender, numberOfResources.numberOfResources)
    if (newDefender != false) {
        defenders.push(newDefender.defender);
        numberOfResources.numberOfResources -= newDefender.cost;

        const selectedCard = document.querySelector(`.defender-card[data-type="${selectedDefender}"]`);
        if (selectedCard) {
            selectedCard.classList.remove('selected');

            startCooldown(selectedCard, newDefender.defender.cooldown);
        }
    }

    selectedDefender = null;

    document.querySelectorAll('.defender-card').forEach(card => {
        card.classList.remove('selected');
    });
});


function handleGameStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score.score, 20, 40);
    ctx.fillText('Resources: ' + numberOfResources.numberOfResources, 20, 80);
    if (gameOver.gameOver) {
        ctx.fillStyle = 'goldenrod';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score.score >= winningScore && enemies.length === 0) {
        ctx.fillStyle = 'goldenrod';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score.score + ' points!', 134, 340);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FCEE98';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame.frame++;
    if (!gameOver.gameOver) requestAnimationFrame(animate);
}
animate();

export function collision(first, second) {
    if ((first.x <= second.x + second.width &&
        first.x + first.width >= second.x &&
        first.y <= second.y + second.height &&
        first.y + first.height >= second.y)
    ) {
        return true;
    };
};



window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
})

const sidebar = document.getElementById('sidebar');

function createDefenderOption(defenderType, imagePath, cost) {
    const option = document.createElement('div');
    option.className = 'col-lg-4 col-md-6 col-sm-12 defender-card';
    option.setAttribute('data-type', defenderType);

    const nameText = document.createElement('div');
    nameText.textContent = `${defenderType}`;
    option.appendChild(nameText);

    const image = document.createElement('img');
    image.src = imagePath;
    image.alt = defenderType;
    image.className = 'defender-image';
    option.appendChild(image);

    if(defenderType != "Pala"){
        const costText = document.createElement('div');
        costText.textContent = `Cost: ${cost}`;
        option.appendChild(costText);
    }

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress';
    option.appendChild(progressBarContainer);

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', '0');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.style.width = '0%';
    progressBarContainer.appendChild(progressBar);

    if (defenderType === 'Pala') {
        option.classList.add('fixed-defender');
    }

    option.addEventListener('click', () => {
        selectDefender(defenderType);
    });

    sidebar.appendChild(option);
}


function startCooldown(selectedCard, cooldown) {
    const progressBarContainer = selectedCard.querySelector('.progress');
    const progressBar = progressBarContainer.querySelector('.progress-bar');

    progressBar.style.transition = `width ${cooldown / 1000}s linear`;
    progressBar.style.width = '100%';

    progressBarContainer.classList.remove('hide');
    selectedCard.classList.add('not-clickable');

    setTimeout(() => {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        progressBarContainer.classList.add('hide');
        selectedCard.classList.remove('not-clickable');
    }, cooldown);
}




function setupSidebar() {
    createDefenderOption('Pala', './image/others/Pala/Pala.png', 0);
    createDefenderOption('Sparasemi', './image/plants/Sparasemi/Sparasemi.png', 100);
    createDefenderOption('Sparasemi Infuocato', './image/plants/SparasemiInfuocato/SparasemiInfuocato.png', 200);
    createDefenderOption("Sparasemi Dell'Era Glaciale", './image/plants/SparasemiDellEraGlaciale/SparasemiDellEraGlaciale.png', 125);
    createDefenderOption("Pianta da Hacker", './image/plants/PiantaDaHacker/PiantaDaHacker.png', 0);
    createDefenderOption('Noce', './image/plants/Noce/Noce.png', 50);
    createDefenderOption('Ciliegie', './image/plants/Ciliegie/Ciliegie.png', 150);
    createDefenderOption('Girasole', './image/plants/Girasole/Girasole.png', 50);
    createDefenderOption('Rovo', './image/plants/Rovo/Rovo.png', 125);
    createDefenderOption('Cavolbotto', './image/plants/Cavolbotto/Cavolbotto.png', 125);
    createDefenderOption('Cactus', './image/plants/Cactus/Cactus.png', 125);
    createDefenderOption('Cactus di Diamante', './image/plants/DiamondCactus/DiamondCactus.png', 225);
    createDefenderOption('Pianta1', './image/plants/Pianta1/Pianta1.png', 1000);
    createDefenderOption('Cavolpulta', './image/plants/Cavolpulta/Cavolpulta.png', 100);
    createDefenderOption('Bananapulta', './image/plants/Banana/ChargedBanana.png', 300);
}

setupSidebar();

let selectedDefender = null;

function selectDefender(defenderType) {
    document.querySelectorAll('.defender-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`.defender-card[data-type="${defenderType}"]`);
    if (selectedCard) {
        selectedDefender = defenderType;
        selectedCard.classList.add('selected');
    }
}


export function removeDefender(x, y) {
    document.querySelectorAll('.defender-card').forEach(card => {
        card.classList.remove('selected');
    });
    selectedDefender = null;

    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === x && defenders[i].y === y) {
            let cost = defenders[i].cost * 0.75;
            let refundedResources = 0;
            while (true) {
                if (cost >= 75) {
                    refundedResources += 75;
                    cost -= 75;
                } else if (cost >= 50) {
                    refundedResources += 50;
                    cost -= 50;
                } else if (cost >= 25) {
                    refundedResources += 25;
                    cost -= 25;
                } else {
                    break;
                }
            }

            for (let j = 0; j < enemies.length; j++) {
                if (collision({ x, y, width: cellSize, height: cellSize }, enemies[j])) {
                    enemies[j].movement = enemies[j].speed;
                }
            }

            numberOfResources.numberOfResources += refundedResources;
            defenders.splice(i, 1);

            return true;
        }
    }
    return false;
}
