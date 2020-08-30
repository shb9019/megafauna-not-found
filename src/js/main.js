let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';
import { Humans } from './objects/human';
import { MiniMap } from './objects/minimap';
import { Shadow } from './objects/shadow';
import { Title } from './objects/title';

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
    let lastLoop = new Date();
    let didLionBlow = false;
    let didLionSlay = false;

    let setLionBlow = () => {
        didLionBlow = true;
    };

    let setLionSlay = () => {
        didLionSlay = true;
    };

    let lion = Lion(mapSize, tileSizePx, idleSprite, walkSprite, setLionBlow, setLionSlay);
    let terrain = Terrain(canvas, mapSize, grassTile, fireTile, burntTile);
    terrain.initializeTerrain();
    let miniMap = MiniMap(mapSize);
    let humans = Humans(context, mapSize, 5);
    humans.initializeHumans(terrain.getMap(), lion.tilePosition());
    let shadow = Shadow();
    let title = Title();

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

            if (didLionSlay) {
                humans.handleLionSlay(lion.absPosition(), 200);
                didLionSlay = false;
            }

            humans.updateHumanTargets(map, lion.tilePosition());
            let burnPositions = humans.updatePositions();
            terrain.handleHumanBurn(burnPositions);
        },
        render: () => { // render the game state
            terrain.renderTerrain(origin);
            lion.render();
            humans.renderHumans(origin);
            shadow.addShadow(lion.absPosition(), terrain.getFireTiles(), 200, 82.5, origin);
            miniMap.render(lion.tilePosition(), terrain.getMap(), humans.getNumAliveHumans(), lion.getHealth(), lion.getBlowStamina());
            title.render();
        }
    });

    loop.start();    // start the game
};
