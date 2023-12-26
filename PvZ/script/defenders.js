// projectiles
import { ctx, canvas, cellSize, cellGap, enemies, enemyPositions, collision, resources } from './main.js';
import { projectiles, defenders } from "./main.js"


export { Projectile, handleProjectiles, Defender, handleDefenders, createDefender };

class Projectile {
    constructor(parents, x, y, trajectoryFunction, power = 25, imageSrc, maxDistance = Infinity) {
        this.parents = parents
        this.initialX = x;
        this.initialY = y;
        this.maxDistance = maxDistance;

        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.image = new Image();
        this.image.src = imageSrc;
        this.power = power;

        this.trajectoryFunction = trajectoryFunction;

        this.enablePiercing = false;
        this.piercingNumber = Infinity;
        this.collidedEnemies = [];

        this.canReduceSpeed = false;
        this.freezingPercent = 0;
        this.freezingTime = 0;
    }

    update() {
        const newPosition = this.trajectoryFunction(this.x, this.y);
        this.x = newPosition.x;
        this.y = newPosition.y;

        const distance = Math.sqrt((this.x - this.initialX) ** 2 + (this.y - this.initialY) ** 2);

        if (distance >= this.maxDistance) {
            this.remove = true;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}


function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        if (projectiles[i].x + + projectiles[i].width < 0 || projectiles[i].x > canvas.width || projectiles[i].y + projectiles[i].height < -100 || projectiles[i].y > canvas.height) {
            projectiles.splice(i, 1);
            i--;
            continue;
        }

        for (let j = 0; j < enemies.length; j++) {
            const enemyIdString = enemies[j].id.toString();
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j]) && !isPresent(projectiles[i].collidedEnemies, enemyIdString)) {
                enemies[j].health -= projectiles[i].power;
                if (projectiles[i].canReduceSpeed == true) {
                    enemies[j].reduceSpeed(projectiles[i].freezingPercent, projectiles[i].freezingTime);
                }
                projectiles[i].collidedEnemies.push(enemyIdString);

                if (!projectiles[i].enablePiercing || projectiles[i].piercingNumber <= 0) {
                    projectiles.splice(i, 1);
                    i--;
                } else if (projectiles[i].x > canvas.width + 1) {
                    projectiles.splice(i, 1);
                    i--;
                } else if (projectiles[i].enablePiercing && projectiles[i].piercingNumber > 0) {
                    projectiles[i].piercingNumber--;
                }
            }
        }

        //Velocità Positiva
        if (projectiles[i] && projectiles[i].speed > 0) {
            if (projectiles[i].x > canvas.width) {
                projectiles.splice(i, 1);
                i--;
            } else if (projectiles[i].x > projectiles[i].initialX + projectiles[i].maxDistance) {
                projectiles.splice(i, 1);
                i--;
            }
        }

        //Velocità Negativa
        if (projectiles[i] && projectiles[i].speed < 0) {
            if (projectiles[i].x + projectiles[i].width < 0) {
                projectiles.splice(i, 1);
                i--;
            } else if (projectiles[i].x + projectiles[i].width < projectiles[i].initialX - projectiles[i].maxDistance) {
                projectiles.splice(i, 1);
                i--;
            }
        }


    }
}

function isPresent(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
}





class Sun {
    constructor(x, y, amount) {
        this.despawnTime = 250;
        this.numRays = 10;

        this.amount = amount;
        this.radius = cellSize * (this.amount / 200);
        const safeDistance = this.radius * 1.5;

        this.x = Math.max(x + safeDistance, Math.min(x + cellSize - safeDistance, Math.random() * cellSize + x));
        this.y = Math.max(y + safeDistance, Math.min(y + cellSize - safeDistance, Math.random() * cellSize + y));
    }


    draw() {
        for (let i = 0; i < this.numRays; i++) {
            const angle = (Math.PI * 2) / this.numRays * i;
            const rayX = this.x + this.radius * Math.cos(angle);
            const rayY = this.y + this.radius * Math.sin(angle);

            const nextAngle = (Math.PI * 2) / this.numRays * (i + 1);
            const nextRayX = this.x + this.radius * Math.cos(nextAngle);
            const nextRayY = this.y + this.radius * Math.sin(nextAngle);

            const middleX = (nextRayX + rayX) / 2
            const middleY = (nextRayY + rayY) / 2




            const angleToCenter = Math.atan2(this.y - middleY, this.x - middleX);

            const extremeX = this.x + (this.radius) * 1.5 * Math.cos(angleToCenter) * -1;
            const extremeY = this.y + (this.radius) * 1.5 * Math.sin(angleToCenter) * -1;


            ctx.save();
            ctx.fillStyle = '#fba301';
            ctx.beginPath();
            ctx.moveTo(rayX, rayY);
            ctx.lineTo(extremeX, extremeY);
            ctx.lineTo(nextRayX, nextRayY);
            ctx.closePath();
            ctx.fill();
        }


        ctx.fillStyle = '#fbe601';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();


        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';

        const textX = this.x - ctx.measureText(this.amount).width / 2;
        const textY = this.y + 7;

        ctx.fillText(this.amount, textX, textY);
        this.despawnTime--
    }
}

const healthBarHeight = 5;

class Defender {
    constructor(x, y, maxHealth = 100, cost = 100, imageSrc = './image/plants/Sparasemi/Sparasemi.png', cooldown = 5000) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.maxHealth = maxHealth
        this.health = maxHealth;
        this.cost = cost;
        this.cooldown = cooldown
        this.image = new Image();
        this.image.src = imageSrc;
        this.enableCollision = true;
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

    takeDamage(amount) {
        this.health -= amount;
    }

    handleTypeSpecificBehavior() { }
}




function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].health <= 0) {
            defenders.splice(i, 1);
            i--;
        }
        if (defenders[i]) {

            defenders[i].draw();
            defenders[i].handleTypeSpecificBehavior();
            if (defenders[i].hasOwnProperty("shooting")) {
                defenders[i].shooting = false;
                if (enemyPositions.indexOf(defenders[i].y) !== -1) {
                    for (let j = 0; j < enemies.length; j++) {
                        if (enemies[j].x + enemies[j].width > defenders[i].x + defenders[i].width && enemies[j].y == defenders[i].y) {
                            defenders[i].shooting = true;
                        }
                    }
                }
            }

            for (let j = 0; j < enemies.length; j++) {
                if (defenders[i] && collision(defenders[i], enemies[j]) && defenders[i].enableCollision == true) {
                    enemies[j].movement = 0;
                    defenders[i].takeDamage(enemies[j].damage);
                }
                if (defenders[i] && defenders[i].health <= 0) {
                    defenders.splice(i, 1);
                    i--;
                    enemies[j].movement = enemies[j].speed;
                }
            }
        }
    }
}

class Sparasemi extends Defender {
    constructor(x, y, health = 100, cost = 100, img = './image/plants/Sparasemi/Sparasemi.png') {
        super(x, y, health, cost, img);
        this.power = 25;
        this.projectileSpeed = 7.5;
        this.shootingFrequency = 100;
        this.timer = 0;
        this.shooting = false;

        this.xOffsetProjectile = 80;
        this.yOffsetProjectile = 15;
        this.projectileImage = "./image/plants/Sparasemi/Projectile.png";
        this.projectileWidth = 30;
        this.projectileHeight = 30;
    }

    Trajectory(x, y) {
        return { x: x + this.projectileSpeed, y: y };
    }

    handleShootingBehavior() {
        if (this.shooting) {
            this.timer++;
            if (this.timer % this.shootingFrequency === 0) {
                let newProjectile = new Projectile(
                    this,
                    this.x + this.xOffsetProjectile,
                    this.y + this.yOffsetProjectile,
                    (x, y) => this.Trajectory(x, y),
                    this.power,
                    this.projectileImage
                );
                newProjectile.width = this.projectileWidth;
                newProjectile.height = this.projectileHeight;
                projectiles.push(newProjectile);
            }
        } else {
            this.timer = 0;
        }
    }

    handleTypeSpecificBehavior() {
        this.handleShootingBehavior()
    }
}

class SparasemiInfuocato extends Sparasemi {
    constructor(x, y) {
        super(x, y, 150, 200, './image/plants/SparasemiInfuocato/SparasemiInfuocato.png')
        this.power = 35;
        this.projectileSpeed = 8;
        this.shootingFrequency = 95;
        this.cooldown = 7500;

        this.xOffsetProjectile = 80;
        this.yOffsetProjectile = 30;
        this.projectileImage = "./image/plants/SparasemiInfuocato/Projectile.png"
        this.projectileWidth = 60;
        this.projectileHeight = 35;
    }
}

class SparasemiDellEraGlaciale extends Sparasemi {
    constructor(x, y) {
        super(x, y, 197, 125, './image/plants/SparasemiDellEraGlaciale/SparasemiDellEraGlaciale.png')
        this.power = 25;
        this.projectileSpeed = 9.1;
        this.shootingFrequency = 100;
        this.cooldown = 3000;

        this.xOffsetProjectile = 80;
        this.yOffsetProjectile = 15;
        this.projectileImage = "./image/plants/SparasemiDellEraGlaciale/Projectile.png"
        this.projectileWidth = 60;
        this.projectileHeight = 35;

        this.freezingTime = 1500;
        this.freezingPercent = 0.3;
        this.speedNullPercent = 0.1;
    }

    handleFreezing() {
        const percent = Math.random();
        if (percent <= this.speedNullPercent) {
            return 1
        }

        return this.freezingPercent;
    }

    Trajectory(x, y) {
        return { x: x + this.projectileSpeed, y: y };
    }

    handleShootingBehavior() {
        if (this.shooting) {
            this.timer++;
            if (this.timer % this.shootingFrequency === 0) {
                let newProjectile = new Projectile(
                    this,
                    this.x + this.xOffsetProjectile,
                    this.y + this.yOffsetProjectile,
                    (x, y) => this.Trajectory(x, y),
                    this.power,
                    this.projectileImage
                );
                newProjectile.width = this.projectileWidth
                newProjectile.height = this.projectileHeight
                newProjectile.canReduceSpeed = true;
                newProjectile.freezingTime = this.freezingTime
                newProjectile.freezingPercent = this.handleFreezing()
                projectiles.push(newProjectile);
            }
        } else {
            this.timer = 0;
        }
    }

    handleTypeSpecificBehavior() {
        this.handleShootingBehavior()
    }
}

class PiantaDaHacker extends Sparasemi {
    constructor(x, y) {
        super(x, y, Infinity, 0, './image/plants/PiantaDaHacker/PiantaDaHacker.jpg')
        this.power = 75;
        this.projectileSpeed = 15;
        this.shootingFrequency = 10;
        this.cooldown = 0;

        this.xOffsetProjectile = 80;
        this.yOffsetProjectile = 10;
        this.projectileImage = this.randProjectile()
        this.projectileWidth = 70;
        this.projectileHeight = 70;
    }



    randProjectile() {
        let imageArray = ["./image/plants/DiamondCactus/DiamondCactus.png", "./image/plants/Cactus/Cactus.png", './image/plants/Ciliegie/Ciliege.png', './image/plants/Girasole/Girasole.png']
        this.projectileImage = imageArray[Math.floor(Math.random() * imageArray.length)]
    }

    handleTypeSpecificBehavior() {
        this.randProjectile()
        this.handleShootingBehavior()
    }
}

class Noce extends Defender {
    constructor(x, y) {
        super(x, y, 4000, 50, './image/plants/Noce/Noce.png');
        this.cooldown = 20000
    }

    handleTypeSpecificBehavior() {
    }
}

class Ciliege extends Defender {
    constructor(x, y) {
        super(x, y, 1, 150, './image/plants/Ciliegie/Ciliege.png');
        this.cooldown = 25000;
        this.enableCollision = false;
        this.collisionFrames = 0;

        this.explosionImage = new Image();
        this.explosionImage.src = './image/plants/Ciliegie/Esplosione.png';

    }

    handleTypeSpecificBehavior() {
        if (this.collisionFrames == 0) {
            this.handleExplosion();
        } else if (this.collisionFrames < 50) {

            /*ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(this.x - cellSize - cellGap, this.y - cellSize - cellGap);
            ctx.lineTo(this.x + 2 * cellSize - cellGap, this.y - cellSize - cellGap);
            ctx.lineTo(this.x + 2 * cellSize - cellGap, this.y + 2 * cellSize - cellGap);
            ctx.lineTo(this.x - cellSize - cellGap, this.y + 2 * cellSize - cellGap);
            ctx.closePath();*/


            ctx.drawImage(this.explosionImage, this.x - cellSize - cellGap, this.y - cellSize - cellGap, cellSize * 3, cellSize * 3);
        } else {
            this.health = 0;
        }
        this.collisionFrames++;
    }

    handleExplosion() {
        for (let i = 0; i < enemies.length; i++) {
            if (this.collision(this, enemies[i])) {
                enemies[i].health -= 5000;
            }
        }
    }


    collision(defender, enemy) {
        if (
            (defender.x - cellSize - cellGap < enemy.x + cellSize - cellGap &&
                defender.x + 2 * cellSize - cellGap > enemy.x) &&
            (defender.y - cellSize - cellGap < enemy.y + cellSize - cellGap &&
                defender.y + 2 * cellSize - cellGap > enemy.y)
        ) {
            return true;
        }

        return false;
    }


}

class Girasole extends Defender {
    constructor(x, y) {
        super(x, y, 80, 50, './image/plants/Girasole/Girasole.png');
        this.sunTimeMin = 600;
        this.sunTimeMax = 800;
        this.sunProductionFrequency = Math.floor(Math.random() * (this.sunTimeMax - this.sunTimeMin + 1)) + this.sunTimeMin;
        this.sunValue = [50, 75, 25]
        this.sunTimer = 0;
    }

    handleTypeSpecificBehavior() {
        if (this.sunProductionFrequency == this.sunTimer) {
            this.sunTimer = 0;
            this.dropSun()
            this.sunProductionFrequency = Math.floor(Math.random() * (this.sunTimeMax - this.sunTimeMin + 1)) + this.sunTimeMin;
        }

        this.sunTimer++;
    }

    randAmount() {
        const percentages = [75, 20, 5];

        const randomValue = Math.random() * 100;

        let cumulativePercentage = 0;
        for (let i = 0; i < percentages.length; i++) {
            cumulativePercentage += percentages[i];
            if (randomValue < cumulativePercentage) {
                return this.sunValue[i];
            }
        }

        return this.sunValue[this.sunValue.length - 1];
    }

    dropSun() {
        resources.push(new Sun(this.x - cellGap, this.y - cellGap, this.randAmount()));
    }
}

class Rovo extends Defender {
    constructor(x, y) {
        super(x, y, 500, 125, './image/plants/Rovo/Rovo.png');
        this.enableCollision = false;
        this.damage = 0.4
    }

    handleTypeSpecificBehavior() {
        for (let j = 0; j < enemies.length; j++) {
            if (collision(this, enemies[j])) {
                enemies[j].health -= this.damage
            }
        }
    }
}

class Cavolbotto extends Defender {
    constructor(x, y) {
        super(x, y, 2000, 125, './image/plants/Cavolbotto/Cavolbotto.png');
        this.power = 25;
        this.projectileSpeed = 2.5;
        this.shootingFrequency = 50;
        this.timer = 0;
        this.shooting = true;
        this.cooldown = 5500;

        this.distanceFront = 2 * cellSize - cellGap - 30;
        this.distanceBack = cellSize + cellGap + 80;

        this.xOffsetProjectileFront = 30;
        this.xOffsetProjectileBack = 80;
    }

    TrajectoryFront(x, y) {
        return { x: x + this.projectileSpeed, y: y };
    }

    TrajectoryBack(x, y) {
        return { x: x - this.projectileSpeed, y: y };
    }


    handleShootingBehavior() {
        this.shooting = true
        if (this.shooting) {
            this.timer++;
            if (this.timer % this.shootingFrequency === 0) {
                let targetEnemy = [];
                for (let i = 0; i < enemies.length; i++) {
                    let enemy = enemies[i]
                    let collisionValue = this.collision(this, enemy)
                    if (collisionValue == 1) {
                        targetEnemy.push(1);
                    } else if (collisionValue == -1) {
                        targetEnemy.push(-1);
                    }
                }

                for (let i = 0; i < targetEnemy.length; i++) {
                    if (targetEnemy[i] == 1) {
                        let newProjectile = new Projectile(
                            this,
                            this.x + this.xOffsetProjectileFront,
                            this.y,
                            (x, y) => this.TrajectoryFront(x, y),
                            this.power,
                            "./image/plants/Cavolbotto/AttaccoFront.png",
                            this.distanceFront
                        );
                        newProjectile.width = 90;
                        newProjectile.height = 90;
                        projectiles.push(newProjectile);
                    } else if (targetEnemy[i] == -1) {
                        let newProjectile = new Projectile(
                            this,
                            this.x + this.xOffsetProjectileBack,
                            this.y,
                            (x, y) => this.TrajectoryBack(x, y),
                            this.power,
                            "./image/plants/Cavolbotto/AttaccoBack.png",
                            this.distanceBack
                        );
                        newProjectile.width = 90;
                        newProjectile.height = 90;
                        projectiles.push(newProjectile);
                    }
                }

            }
        } else {
            this.timer = 0;
        }
    }
    handleTypeSpecificBehavior() {
        this.handleShootingBehavior()
        this.shooting = true
    }


    collision(defender, enemy) {
        if (
            ((defender.x + 2 * cellSize > enemy.x) && (enemy.x >= defender.x + 0.5 * cellSize) && defender.y == enemy.y)
        ) {
            return 1;
        }
        if (
            ((enemy.x + cellSize > defender.x - cellSize) && (enemy.x <= defender.x + 0.5 * cellSize) && defender.y == enemy.y)
        ) {
            return -1;
        }

        return 0;
    }



}

class Cactus extends Defender {
    constructor(x, y, health = 200, cost = 125, img = './image/plants/Cactus/Cactus.png') {
        super(x, y, health, cost, img);
        this.collision = false
        this.power = 20;
        this.projectileSpeed = 5;
        this.shootingFrequency = 75;
        this.timer = 0;
        this.shooting = false;
        this.enablePiercing = true;
        this.piercingNumber = 2;
        this.projectileImage = "./image/plants/Cactus/Projectile.png"

        //Rovo Mode
        this.enableCollision = true;

        this.NormalImage = img
        this.DownImage = './image/plants/Cactus/CactusDown.png'
        this.rovoModeDamage = 0.4
    }

    Trajectory(x, y) {
        return { x: x + this.projectileSpeed, y: y };
    }

    handleShootingBehavior() {
        if (this.shooting && this.collision == false) {
            this.timer++;
            if (this.timer % this.shootingFrequency === 0) {
                let newProjectile = new Projectile(
                    this,
                    this.x + 70,
                    this.y + 35,
                    (x, y) => this.Trajectory(x, y),
                    this.power,
                    this.projectileImage
                );
                newProjectile.height = 20;
                newProjectile.enablePiercing = this.enablePiercing;
                newProjectile.piercingNumber = this.piercingNumber;
                projectiles.push(newProjectile);
            }
        } else {
            this.timer = 0;
        }
    }

    handleRovoFunction() {
        let enemiesCollision = false;

        for (let i = 0; i < enemies.length; i++) {
            if (
                !(this.x > enemies[i].x + enemies[i].width ||
                    this.x + this.width < enemies[i].x ||
                    this.y > enemies[i].y + enemies[i].height ||
                    this.y + this.height < enemies[i].y)
            ) {
                this.collision = true;
                this.enableCollision = false;
                this.image = new Image
                this.image.src = this.DownImage;
                enemies[i].health -= this.rovoModeDamage;
                enemiesCollision = true;
            }
        }

        if (enemiesCollision === false) {
            this.collision = false;
            this.enableCollision = true;
            this.image = new Image
            this.image.src = this.NormalImage;
        }

    }


    handleTypeSpecificBehavior() {
        this.handleShootingBehavior()
        this.handleRovoFunction()
    }
}

class DiamondCactus extends Cactus {
    constructor(x, y) {
        super(x, y, 200, 225, './image/plants/DiamondCactus/DiamondCactus.png');
        this.power = 40;
        this.projectileSpeed = 5.5;
        this.shootingFrequency = 65;
        this.piercingNumber = 4;
        this.projectileImage = "./image/plants/DiamondCactus/Projectile.png"


        this.NormalImage = './image/plants/DiamondCactus/DiamondCactus.png'
        this.DownImage = './image/plants/DiamondCactus/DiamondCactusDown.png'
        this.rovoModeDamage = 0.7
    }
}

class Pianta1 extends Defender {
    constructor(x, y) {
        super(x, y, 2000, 1000, './image/plants/Pianta1/Pianta1.png');
        this.damage = 0.2;
        this.barrier = true;

        this.collision = false
        this.power = 20;
        this.projectileSpeed = 5;
        this.shootingFrequency = 125;
        this.timer = 0;
        this.shooting = false;
        this.enablePiercing = true;
        this.piercingNumber = 1;

        this.xOffsetProjectile = 80;
        this.yOffsetProjectile = 60;
        this.projectileImage = "./image/plants/Pianta1/Knife.png";
        this.projectileWidth = 60;
        this.projectileHeight = 25;

        this.eating = true;
        this.eatingFrequency = 1500;
        this.eatingTimer = 0;
        this.hasEaten = false;

        //barrier
        this.percentDestroyBarrier = 0.33
        this.canBarrierProjectilePiercing = true;
        this.barrierProjectilePiercing = 9;
        this.barrierPower = 200;
        this.barrierProjectileHeight = 20;
        this.barrierProjectileWidth = 20;
        this.barrierProjectileImage = "./image/plants/Pianta1/BarrierFragment.png";
        this.imageWithoutBarrier = "./image/plants/Pianta1/WithoutBarrier.png";

        this.xOffsetBarrierProjectile = 50 - cellGap;
        this.yOffsetBarrierProjectile = 50 - cellGap;

        this.angleIncrease = 10;
    }

    handleTypeSpecificBehavior() {
        this.handleShootingBehavior()
        this.handleRovo()
        this.eatEnemies()

        if (this.health < this.maxHealth * this.percentDestroyBarrier) {
            if (this.barrier == true) {
                this.destroyBarrier()
            }
        }
    }

    eatEnemies() {
        if (this.hasEaten == true) {
            this.eatingTimer++;
        }
        if (this.eatingTimer % this.eatingFrequency === 0) {
            this.hasEaten == false;
            this.eatingTimer = 0;
        }
        for (let j = 0; j < enemies.length; j++) {
            if (this.eatCollision(this, enemies[j])) {
                if (this.eating) {
                    if (this.eatingTimer % this.eatingFrequency === 0) {
                        enemies[j].health = 0
                        this.hasEaten = true;
                    }
                } else {
                    this.eatingTimer = 0;
                }

            }
        }

    }

    eatCollision(defender, enemy) {
        if (
            ((defender.x + 2 * cellSize > enemy.x) && (enemy.x >= defender.x + 0.5 * cellSize) && defender.y == enemy.y)
        ) {
            return 1;
        }
        if (
            ((enemy.x + cellSize > defender.x - cellSize) && (enemy.x <= defender.x + 0.5 * cellSize) && defender.y == enemy.y)
        ) {
            return -1;
        }

        return 0;
    }

    handleRovo() {
        for (let j = 0; j < enemies.length; j++) {
            if (collision(this, enemies[j])) {
                enemies[j].health -= this.damage
            }
        }

    }
    Trajectory(x, y) {
        return { x: x + this.projectileSpeed, y: y };
    }

    BarrierTrajectory(x, y, angle) {
        const angleInRadians = (angle * Math.PI) / 180;
        return { x: x + this.projectileSpeed * Math.cos(angleInRadians), y: y + this.projectileSpeed * Math.sin(angleInRadians) };
    }

    handleShootingBehavior() {
        if (this.shooting && this.collision == false) {
            this.timer++;
            if (this.timer % this.shootingFrequency === 0) {
                let newProjectile = new Projectile(
                    this,
                    this.x + this.xOffsetProjectile,
                    this.y + this.yOffsetProjectile,
                    (x, y) => this.Trajectory(x, y),
                    this.power,
                    this.projectileImage
                );
                newProjectile.width = this.projectileWidth
                newProjectile.height = this.projectileHeight
                newProjectile.enablePiercing = this.enablePiercing;
                newProjectile.piercingNumber = this.piercingNumber;
                projectiles.push(newProjectile);
            }
        } else {
            this.timer = 0;
        }
    }

    destroyBarrier() {
        this.barrier = false
        this.image.src = this.imageWithoutBarrier
        for (let angle = 0; angle < 360; angle += this.angleIncrease) {
            let newProjectile = new Projectile(
                this,
                this.x + this.xOffsetBarrierProjectile,
                this.y + this.yOffsetBarrierProjectile,
                (x, y) => this.BarrierTrajectory(x, y, angle),
                this.barrierPower,
                this.barrierProjectileImage
            );
            newProjectile.width = this.barrierProjectileWidth;
            newProjectile.height = this.barrierProjectileHeight;
            newProjectile.enablePiercing = this.canBarrierProjectilePiercing;
            newProjectile.piercingNumber = this.barrierProjectilePiercing;
            projectiles.push(newProjectile);
        }
    }
}

class Cavolpulta extends Defender {
    constructor(x, y, health = 150, cost = 100, img = './image/plants/Cavolpulta/Cavolpulta.png') {
        super(x, y, health, cost, img);
        this.power = 0;
        this.projectileSpeed = 5;
        this.shootingFrequency = 100;
        this.timer = 0;
        this.shooting = false;

        this.xOffsetProjectile = +50;
        this.yOffsetProjectile = -50;
        this.projectileImage = "./image/plants/Cavolpulta/Projectile.png";
        this.projectileWidth = 20;
        this.projectileHeight = 20;

        this.projectilePower = 35;

        this.xEnemy
        this.targetEnemy
    }

    FindParabolic(P, Z, V) {
        const a = (V.y + P.y) / (Math.pow(V.x, 2) - P.x * (P.x - 2 * V.x))
        const b = -2 * a * (V.x);
        const c = P.y - a * P.x * (P.x - 2 * V.x)
        return { a, b, c };
    }

    Trajectory(x, points) {
        const coefficients = this.FindParabolic(points.P, points.Z, points.V);
        return { x: x + this.projectileSpeed, y: coefficients.a * x * x + coefficients.b * x + coefficients.c };
    }

    CheckProjectile() {
        for (let i = 0; i < projectiles.length; i++) {
            if (projectiles[i].parents == this) {

                if (projectiles[i].y + projectiles[i].height >= this.y - 2 * cellGap + cellSize) {
                    projectiles.splice(i, 1);
                    i--;
                    continue;
                }

                if (projectiles[i].y <= this.y) {
                    projectiles[i].power = 0;
                    projectiles[i].piercingNumber = Infinity;
                } else {
                    projectiles[i].piercingNumber = 0;
                    projectiles[i].power = this.projectilePower;
                }
            }
        }
    }



    handleShootingBehavior() {
        if (this.shooting) {
            this.timer++;
            const P = { x: this.x + (cellSize / 2), y: this.y + (cellSize / 2) };
            const Z = { x: this.xEnemy + cellSize, y: P.y };
            const V = { x: Math.abs((this.xEnemy - this.x) / 2), y: 0 };
            const points = { P, Z, V };
            if (this.timer % this.shootingFrequency === 0) {
                const newProjectile = new Projectile(
                    this,
                    this.x + this.xOffsetProjectile,
                    this.y + this.yOffsetProjectile,
                    (x, y) => this.Trajectory(x, points),
                    this.power,
                    this.projectileImage
                );
                newProjectile.enablePiercing = true;
                newProjectile.piercingNumber = Infinity;
                newProjectile.width = this.projectileWidth;
                newProjectile.height = this.projectileHeight;
                projectiles.push(newProjectile);
            }
        } else {
            this.timer = 0;
        }
    }

    findNearestEnemy() {
        if (enemies.length > 0) {
            let enemiesX = [];
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i].y == this.y) {
                    enemiesX.push(enemies[i]);
                }
            }

            if (enemiesX.length > 0) {
                enemiesX.sort((a, b) => a.x - b.x);

                this.xEnemy = enemiesX[0].x;
                this.targetEnemy = enemiesX[0];
            }
        }
    }



    handleTypeSpecificBehavior() {
        this.findNearestEnemy()
        this.handleShootingBehavior()
        this.CheckProjectile()
    }
}

function createDefender(x, y, id, resources) {

    let newDefender;
    switch (id) {
        case "Sparasemi": {
            newDefender = new Sparasemi(x, y);
            break;
        }

        case "Sparasemi Infuocato": {
            newDefender = new SparasemiInfuocato(x, y);
            break;
        }

        case "Sparasemi Dell'Era Glaciale": {
            newDefender = new SparasemiDellEraGlaciale(x, y);
            break;
        }


        case "Pianta da Hacker": {
            newDefender = new PiantaDaHacker(x, y);
            break;
        }


        case "Noce": {
            newDefender = new Noce(x, y);
            break;
        }

        case "Ciliege": {
            newDefender = new Ciliege(x, y);
            break;
        }

        case "Girasole": {
            newDefender = new Girasole(x, y);
            break;
        }
        case "Rovo": {
            newDefender = new Rovo(x, y);
            break;
        }
        case "Cavolbotto": {
            newDefender = new Cavolbotto(x, y);
            break;
        }
        case "Cactus": {
            newDefender = new Cactus(x, y);
            break;
        }
        case "Cactus di Diamante": {
            newDefender = new DiamondCactus(x, y);
            break;
        }
        case "Pianta1": {
            newDefender = new Pianta1(x, y);
            break;
        }
        case "Cavolpulta": {
            newDefender = new Cavolpulta(x, y);
            break;
        }

        default: {
            newDefender = false;
            break;
        }
    }

    if (resources < newDefender.cost) {
        return false
    }
    return { defender: newDefender, cost: newDefender.cost }
}

