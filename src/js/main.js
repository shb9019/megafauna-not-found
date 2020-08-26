let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';

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

    let lion = Lion(2500, idleSprite, walkSprite);
    let terrain = Terrain(canvas, mapSize, grassTile, fireTile, burntTile);
    terrain.initializeTerrain();

    let loop = GameLoop({  // create the main game loop
        update: (dt) => { // update the game state
            updateOrigin(lion.absPosition(), 2500, 2500, origin);
            lion.update(origin);
            terrain.updateTerrain();
        },
        render: () => { // render the game state
            terrain.renderTerrain(origin);
            lion.render();
        }
    });

    loop.start();    // start the game
};
