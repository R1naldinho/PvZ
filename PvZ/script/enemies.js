// enemies
import { ctx, canvas, cellSize, cellGap, enemies, enemyPositions, gameOver, score, winningScore, frame } from './main.js';
import { enemiesInterval, numberOfResources } from "./main.js"

export { Enemy, handleEnemies };

const healthBarHeight = 5;
let id = 1000;

class Enemy {
    constructor(verticalPosition) {
        this.id = id;
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.damage = 0.3;
        this.maxHealth = this.health;
        this.healthBarHeight = 5;
        this.image = new Image();
        this.image.src = './image/zombie/Zombie/Zombie.png';
        this.isFrozen = false;
    }

    update() {
        this.x -= this.movement;
    }

    draw() {
        if (this.health > 0) {
            let healthBarWidth = (this.health * this.width) / this.maxHealth;
            let healthBarColor = 'green';

            if (healthBarWidth <= 20) {
                healthBarColor = 'red';
            } else if (healthBarWidth <= 50) {
                healthBarColor = 'yellow';
            }

            let healthBarY = this.y;

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;

            ctx.strokeRect(this.x, healthBarY, this.width, healthBarHeight);

            ctx.fillStyle = healthBarColor;
            ctx.fillRect(this.x, healthBarY, healthBarWidth, healthBarHeight);

            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }


        
    }

    reduceSpeed(percentage, duration) {
        this.movement *= (1 - percentage);

        setTimeout(() => {
            this.movement = this.speed;
            this.isFrozen = false;
        }, duration);

        this.isFrozen = true;
    }
}

function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x + enemies[i].width + 1 < 0) {
            gameOver.gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            numberOfResources.numberOfResources += gainedResources;
            score.score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame.frame % enemiesInterval.enemiesInterval === 0 && score.score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        id++;
        enemyPositions.push(verticalPosition);
        if (enemiesInterval.enemiesInterval > 120) enemiesInterval.enemiesInterval -= 50;
    }
}