let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle } from './helper';
import { Terrain } from './objects/terrain';

let { canvas } = init();
let minEdgeSize = Math.min(window.innerWidth, window.innerHeight);
canvas.width = minEdgeSize;
canvas.height = minEdgeSize;

let idleSprite = new Image();
idleSprite.src = 'public/assets/idle.png';

let walkSprite = new Image();
walkSprite.src = 'public/assets/walk.png';

let grassTile = new Image();
grassTile.src = 'public/assets/grass.png';

let fireTile = new Image();
fireTile.src = 'public/assets/fire.png';

let burntTile = new Image();
burntTile.src = 'public/assets/burnt.png';

grassTile.onload = () => {

    let mouse = {
        x: canvas.width,
        y: canvas.height
    };

    let mapSize = 100;

    let terrain = Terrain(canvas, mapSize, grassTile, fireTile, burntTile);
    terrain.initializeTerrain();

    let idleSpriteSheet = SpriteSheet({
        image: idleSprite,
        frameWidth: 64,
        frameHeight: 64,
        animations: {
            idle: {
                frames: '0..4',
                frameRate: 5
            }
        }
    });

    let walkSpriteSheet = SpriteSheet({
        image: walkSprite,
        frameWidth: 64,
        frameHeight: 64,
        animations: {
            idle: {
                frames: '0..1',
                frameRate: 2
            }
        }
    });

    let sprite = Sprite({
        x: 32,
        y: 32,
        anchor: {x: 0.5, y: 0.5},
        animations: idleSpriteSheet.animations
    });

    // TODO: Use keyboard API of Kontra 
    window.onmousemove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    window.onkeydown = (e)  => {
        if (e.key === "w" || e.key === "ArrowUp") {
            sprite.dx = Math.cos(sprite.rotation) * 2.0;
            sprite.dy = Math.sin(sprite.rotation) * 2.0;
            sprite.animations = walkSpriteSheet.animations;
        }
    }

    window.onkeyup = (e) => {
        if (e.key === "w" || e.key === "ArrowUp") {
            sprite.dx = 0;
            sprite.dy = 0;
            sprite.animations = idleSpriteSheet.animations;
        }
    }

    let loop = GameLoop({  // create the main game loop
        update: (dt) => { // update the game state
            sprite.rotation = calculateAngle(sprite.x, sprite.y, mouse.x, mouse.y);
            terrain.updateTerrain();
            sprite.update();
        },
        render: () => { // render the game state
            terrain.renderTerrain();
            sprite.render();
        }
    });

    loop.start();    // start the game
};
