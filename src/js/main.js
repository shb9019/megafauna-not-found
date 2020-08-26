let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';
import { MiniMap } from './objects/minimap';

let { canvas, context } = init();
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
    let tileSizePx = 25;
    let origin = {
        x: 0,
        y: 0
    };
    let didLionBlow = false;

    let setLionBlow = () => {
        didLionBlow = true;
    };

    let lion = Lion(mapSize, tileSizePx, idleSprite, walkSprite, setLionBlow);
    let terrain = Terrain(canvas, mapSize, grassTile, fireTile, burntTile);
    terrain.initializeTerrain();
    let miniMap = MiniMap(context, mapSize);

    let loop = GameLoop({  // create the main game loop
        update: (dt) => { // update the game state
            updateOrigin(lion.absPosition(), mapSize * tileSizePx, mapSize * tileSizePx, origin);
            lion.update(origin);
            terrain.updateTerrain();
            
            let map = terrain.getMap();
            lion.fireDamage(map);
            if (didLionBlow) {
                terrain.handleLionBlow(lion.blow(map));
                didLionBlow = false;
            }
        },
        render: () => { // render the game state
            terrain.renderTerrain(origin);
            lion.render();
            miniMap.render(lion.tilePosition(), terrain.getMap());
        }
    });

    loop.start();    // start the game
};
