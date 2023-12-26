// resources
import { canvas, ctx, cellSize, score, winningScore, frame, mouse } from './main.js';
import { resources, numberOfResources } from "./main.js"

export {Resource, handleResources };

const amounts = [25, 50, 75];

class Resource {
    constructor() {
        this.numRays = 10;
        this.despawnTime = 350;

        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.radius = cellSize * (this.amount / 200);
        const safeDistance = this.radius * 1.5;

        this.x = Math.max(safeDistance, Math.min(canvas.width - safeDistance, Math.random() * canvas.width));
        this.y = Math.max(cellSize + safeDistance, Math.min(canvas.height - safeDistance, Math.random() * canvas.height));

    }

    draw() {
        //console.log("\nCentre\n(" + this.x + ";" + this.y + ")\n\n")

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


            //console.log("\nCurrent\nAngle: " + angleToCenter + "(" + rayX + ";" + rayY + ")")
            //console.log("\nNext\nAngle: " + angleToCenter + "(" + nextRayX + ";" + nextRayY + ")")
            //console.log("\nMedia\nAngle: " + angleToCenter + "(" + middleX + ";" + middleY + ")")
            //console.log("\nExtreme\n(" + extremeX + ";" + extremeY + ")\n\n")


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
        this.despawnTime--;
    }
}

function handleResources() {
    if (frame.frame % Math.round(Math.random() * 300 + 3000) === 0 && score.score < winningScore) {
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++) {
        if(resources[i].despawnTime <= 0){
            resources.splice(i, 1);
            i--;
            continue;
        }
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collisionSun(resources[i], mouse)) {
            numberOfResources.numberOfResources += resources[i].amount;
            resources.splice(i, 1);
            i--;
        }
    }
}

function collisionSun(first, second) {
    const circleX = first.x;
    const circleY = first.y;
    const circleRadius = first.radius * 1.5;

    const distance = Math.sqrt((circleX - second.x) ** 2 + (circleY - second.y) ** 2);

    if (distance <= circleRadius) {
        return true;
    }
}