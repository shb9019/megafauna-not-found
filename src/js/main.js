let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';

let { canvas } = init();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

    let mapSize = 100;
    let origin = {
        x: 0,
        y: 0
    };

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

    window.onkeydown = (e)  => {
        if (e.key === "d" || e.key === "ArrowRight") {
            sprite.dx = Math.min(2.0, sprite.dx + 2.0);
            sprite.animations = walkSpriteSheet.animations;
        } else if (e.key === "a" || e.key === "ArrowLeft") {
            sprite.dx = Math.max(-2.0, sprite.dx - 2.0);
            sprite.animations = walkSpriteSheet.animations;
        } else if (e.key === "w" || e.key === "ArrowUp") {
            sprite.dy = Math.max(-2.0, sprite.dy - 2.0);
            sprite.animations = walkSpriteSheet.animations;
        } else if (e.key === "s" || e.key === "ArrowDown") {
            sprite.dy = Math.min(2.0, sprite.dy + 2.0);
            sprite.animations = walkSpriteSheet.animations;
        }
    }

    window.onkeyup = (e) => {
        if (e.key === "d" || e.key === "ArrowRight") {
            sprite.dx = Math.max(0, sprite.dx - 2.0);
            sprite.animations = idleSpriteSheet.animations;
        } else if (e.key === "a" || e.key === "ArrowLeft") {
            sprite.dx = Math.min(0, sprite.dx + 2.0);
            sprite.animations = idleSpriteSheet.animations;
        } else if (e.key === "w" || e.key === "ArrowUp") {
            sprite.dy = Math.min(0, sprite.dy + 2.0);
            sprite.animations = walkSpriteSheet.animations;
        } else if (e.key === "s" || e.key === "ArrowDown") {
            sprite.dy = Math.max(0, sprite.dy - 2.0);
            sprite.animations = walkSpriteSheet.animations;
        }
    }

    let loop = GameLoop({  // create the main game loop
        update: (dt) => { // update the game state
            if (sprite.dx != 0 || sprite.dy != 0) {
                sprite.rotation = calculateAngle(sprite.dx, sprite.dy);
                if ((sprite.dx > 0) && ((sprite.x + 32) == canvas.width)) {
                    sprite.dx = 0;
                } else if ((sprite.dx < 0) && ((sprite.x - 32) == 0)) {
                    sprite.dx = 0;
                }

                if ((sprite.dy > 0) && ((sprite.y + 32) == canvas.height)) {
                    sprite.dy = 0;
                } else if ((sprite.dy < 0) && ((sprite.y - 32) == 0)) {
                    sprite.dy = 0;
                }
            }

            sprite.update();
            updateOrigin(sprite.x, sprite.y, 2500, 2500, origin);
        },
        render: () => { // render the game state
            terrain.renderTerrain(origin);
            sprite.render();
        }
    });

    loop.start();    // start the game
};
