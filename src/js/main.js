let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle } from './helper';

let { canvas } = init();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let idleSprite = new Image();
idleSprite.src = 'public/assets/idle.png';

let walkSprite = new Image();
walkSprite.src = 'public/assets/walk.png';

let tileImage = new Image();
tileImage.src = 'public/assets/grass.png';

tileImage.onload = () => {

    let tileEngine = TileEngine({
        // tile size
        tilewidth: 10,
        tileheight: 10,

        // map size in tiles
        width: 10,
        height: 10,

        // tileset object
        tilesets: [{
            firstgid: 1,
            image: tileImage
        }],
    });

    let mouse = {
        x: canvas.width,
        y: canvas.height
    };

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
        // required for an animation sprite
        animations: idleSpriteSheet.animations
    });
    tileEngine.addObject(sprite);

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
        update: () => { // update the game state
            sprite.rotation = calculateAngle(sprite.x, sprite.y, mouse.x, mouse.y);
            sprite.update();
        },
        render: () => { // render the game state
            tileEngine.render();
            sprite.render();
        }
    });

    loop.start();    // start the game
};
