//Canvas set up
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 1200;
canvas.height = 700;
const C = {
    minShipSpeed: 2,
    maxShipSpeed: 400,
    shipAcceleration: 0.001,
    shipBrake: 0.06,
    shipUpSpeed: 2.8,
    alive: true,
    shieldRecharge: 0.025,
}
let score = 0;
let gameFrame = 0;
let gameSpeedX = 0;
let gameSpeedY = 0;

let currentMission = {
    xLengths: 10,
};

ctx.font = '50px Georgia';

class Camera {
    constructor() {
        this.x = 100;
        this.y = 100;

    }
    moveTo(x, y) {
        this.x = x - 200;
        this.y = 0;
    }
    moveBy(x, y) {
        this.x += x;
        this.y += y;
    }
}
let camera = new Camera();

class Player {
    constructor() {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.motionX = 0;
        this.motionY = 0;
        this.radius = 10;
        this.width = 20;
        this.height = 20;

        this.health = 3;
        this.shield = 1;
        this.shieldRecharge = 0;

        this.invulnerabilityFrames = 0;
        this.invulnerable = false;

        this.angle = 0;

        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;

        this.updatePolygon();

    }
    updatePolygon() {
           this.polygon = new Polygon(new Point(this.x, this.y), 'white');
           this.polygon.addPoint(new Point(-this.width/2,-this.height/2));
           this.polygon.addPoint(new Point(-this.width/2,this.height/2));
           this.polygon.addPoint(new Point(this.width/2,this.height/2));
           this.polygon.addPoint(new Point(this.width/2,-this.height/2));

           this.polygon.rotate(this.angle);
    }
    update() {
        this.updatePolygon();

        if (this.invulnerabilityFrames > 0) {
            this.invulnerabilityFrames--;
        }
        if (this.invulnerabilityFrames == 0) {
            this.invulnerable = false;
        } else {
            this.invulnerable = true;
        }
        if (this.shield < 1) {
            this.shieldRecharge += C.shieldRecharge;
            if (this.shieldRecharge >= 30) {
                this.shield = 1;
            }
        } else {
            this.shieldRecharge = 0;
        }
        if (this.health == 0) {
            C.alive = false;
        }

        gameSpeedX = 0;
        //Handle input
        if (!C.alive) {
            return;
        }
        this.motionY = 0;
        if (upPressed) {
            this.motionY -= C.shipUpSpeed;
        }
        if (downPressed) {
            this.motionY += C.shipUpSpeed;
        }
        if (!spacePressed) {
            this.motionX += C.shipAcceleration;
        } else {
            this.motionX -= C.shipAcceleration;
        }
        if (this.motionX > C.maxShipSpeed) {
            this.motionX = C.maxShipSpeed;
        }
        if (this.motionX < C.minShipSpeed) {
            this.motionX = C.minShipSpeed;
        }
        this.x += this.motionX;
        this.y += this.motionY;
        //Handle collision
        for (let i = 0; i < asteroidArray.length; i++) {
            if (asteroidArray[i].checkPlayerCollision()) {
                this.takeDamage();
                console.log('player col detected');
            }
        }


        gameSpeedX = this.motionX;
    }
    takeDamage() {
        this.invulnerabilityFrames = 30;
        if (this.invulnerable) {
            console.log('invulnerable');
        } else {
            if (this.shield > 0) {
                this.shield = 0;
                console.log('shields down!');
            } else {
                this.health--;
                console.log('hull damaged!');
            }
        }

    }
    getLeft() {

        return new Point(this.x, this.y + this.height/2);
    }
    getRight() {

        return new Point(this.x + this.width, this.y + this.height/2);
    }
    getTop() {

        return new Point(this.x + this.width/2, this.y);
    }
    getBottom() {

        return new Point(this.x + this.width/2, this.y + this.height);
    }

    draw() {
        this.updatePolygon();
        this.polygon.draw(ctx, camera.x, camera.y);

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.x - camera.x, this.y - camera.y);
        ctx.lineTo(this.x + 20 * Math.cos(this.angle) - camera.x, this.y + 20 * Math.sin(this.angle) - camera.y);
        ctx.stroke();

    }

}
let player = new Player();
class Star {
    constructor(x, y, color, radius) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
    }
    moveBy(x, y) {
        this.x += x;
        this.y += y;
    }
    draw() {

    }
}

let colorTemplates = {
    warm: 1,
    cold: 2,
    regular: 3,
    bright: 4,
}
class Layer {
    constructor(speedModifier, colorIndex, numStars, size) {
        this.speedModifier = speedModifier;
        this.starArray = [];

        for (let i = 0; i < numStars * currentMission.xLengths; i++) {
            let newColor = 'black';
            switch (colorIndex) {
                case colorTemplates.warm:
                    switch (getRandomIntBtwn(0,5)) {
                        case (0):
                        newColor = 'red';
                        break;
                        case (1):
                        newColor = 'crimson';
                        break;
                        case (2):
                        newColor = 'darkorange';
                        break;
                        case (3):
                        newColor = 'gold';
                        break;
                        case (4):
                        newColor = 'orangered';
                        break;
                    }
                break;
                case colorTemplates.cold:
                    switch (getRandomIntBtwn(0,5)) {
                        case (0):
                        newColor = 'blue';
                        break;
                        case (1):
                        newColor = 'navy';
                        break;
                        case (2):
                        newColor = 'white';
                        break;
                        case (3):
                        newColor = 'papayawhip';
                        break;
                        case (4):
                        newColor = 'skyblue';
                        break;
                    }

                break;
                case colorTemplates.regular:
                    switch (getRandomIntBtwn(0,5)) {
                        case (0):
                        newColor = 'red';
                        break;
                        case (1):
                        newColor = 'orange';
                        break;
                        case (2):
                        newColor = 'yellow';
                        break;
                        case (3):
                        newColor = 'white';
                        break;
                        case (4):
                        newColor = 'cyan';
                        break;
                    }

                break;
                case colorTemplates.bright:
                    switch (getRandomIntBtwn(0,5)) {
                        case (0):
                        newColor = 'pink';
                        break;
                        case (1):
                        newColor = 'yellow';
                        break;
                        case (2):
                        newColor = 'red';
                        break;
                        case (3):
                        newColor = 'white';
                        break;
                        case (4):
                        newColor = 'lime';
                        break;
                    }
                break;
            }
            console.log(newColor);
            let newSize = getRandomIntBtwn(5, 20)/10;
            this.starArray.push(new Star(getRandomIntBtwn(0, canvas.width * currentMission.xLengths), getRandomIntBtwn(0, canvas.height), newColor, newSize));
        }
    }
    update() {
        for (let i = 0; i < this.starArray.length; i++) {
            this.starArray[i].x -= gameSpeedX * this.speedModifier;
            if (this.starArray[i].x < -200) {
                this.starArray[i].x += canvas.width * currentMission.xLengths;
            }
            //this.starArray[i].y -= gameSpeedY * this.speedModifier;

        }
    }
    draw() {
        for (let i = 0; i < this.starArray.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = this.starArray[i].color;
            ctx.beginPath();
            ctx.arc(this.starArray[i].x, this.starArray[i].y, this.starArray[i].radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.fill();
        }

    }
}
let layerArray = [];

function newGame() {
    camera = new Camera();
    player = new Player();
    C.alive = true;
    layerArray = [];
    let layer1 = new Layer(0.5, colorTemplates.warm, 100, 2);
    let layer2 = new Layer(0.25, colorTemplates.warm, 100, 1);
    let layer3 = new Layer(0.1, colorTemplates.warm, 100, 0.5);
    layerArray.push(layer1);
    layerArray.push(layer2);
    layerArray.push(layer3);
}

let asteroidArray = [];
class Asteroid {
    constructor(x, y, size) {
        this.angle = 0;
        this.rotation = Math.random() - 0.5;
        this.x = x;
        this.y = y;
        this.rx = size;
        this.ry = size;
    }
    update() {
        this.angle += this.rotation/30;
    }
    checkPlayerCollision() {
        let distance = Math.sqrt((this.x - player.x)*(this.x - player.x)+(this.y - player.y)*(this.y - player.y));
        if (distance < this.rx + player.radius) {
            return true;
        }
        return false;
    }
    draw() {
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.ellipse(this.x - camera.x, this.y - camera.y, this.rx, this.ry, this.angle, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function spawnAsteroids() {
    if (gameFrame % 50 == 0) {
        asteroidArray.push(new Asteroid(player.x + canvas.width, getRandomIntBtwn(0, canvas.height), getRandomIntBtwn(10,100)));
    }
}
function handleAsteroids() {
    for (let i = 0; i < asteroidArray.length; i++) {
        asteroidArray[i].update();
        asteroidArray[i].draw();
    }
}

function drawBackground() {
    for (let i = 0; i < layerArray.length; i++) {
        layerArray[i].update();
        layerArray[i].draw();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //refresh screen
    ctx.fillStyle ='black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    gameFrame++;
    drawBackground();
    player.update();
    camera.moveTo(player.x, player.y);
    player.draw();

    spawnAsteroids();
    handleAsteroids();

    //GUI
    drawShield();
    drawHealth();

    requestAnimationFrame(animate);
}
function drawHealth() {
    if (player.health > 0) {
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.rect(100, canvas.height - 50, 25, -100);
        ctx.fill();
    }
    if (player.health > 1) {
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.rect(150, canvas.height - 50, 25, -100);
        ctx.fill();
    }
    if (player.health > 2) {
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.rect(200, canvas.height - 50, 25, -100);
        ctx.fill();
    }

    ctx.fillText('Speed: ' + Math.floor(player.motionX * 1000) / 1000,50, 50);
}
function drawShield() {

    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    let shieldHeight = 0;
    if (player.shield > 0) {
        shieldHeight = 100;
    } else {
        shieldHeight = player.shieldRecharge * 3.33;
        ctx.fillStyle = 'aqua';
    }

    ctx.rect(250, canvas.height - 50, 70, -shieldHeight);
    ctx.fill();
}
newGame();
animate();

function getRandomIntBtwn(max, min) {
    return (Math.floor(Math.random() * (max - min)) + min);
}