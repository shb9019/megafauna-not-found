let { init, Sprite, SpriteSheet, GameLoop, TileEngine } = kontra;
import { copy, calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';
import { Humans } from './objects/human';
import { MiniMap } from './objects/minimap';
import { Shadow } from './objects/shadow';
import { Title } from './objects/title';
import { mapSize, tileSizePx, initialCameraPos } from './constants';

let { canvas, context } = init();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Main = () => {
	const origin = copy(initialCameraPos);

	const props = {
		canvas,
		context
	};

	const state = {
		// True, if lion has extinguished and the move has not been processed
		didLionBlow: false,
		// True, if lion has slain and the move has not been processed
		didLionSlay: false
	};

	const setLionBlow = (value) => {
		state.didLionBlow = value;
	};

	const setLionSlay = (value) => {
		state.didLionSlay = value;
	};

	const lion = Lion(() => setLionBlow(true), () => setLionSlay(true));

	const terrain = Terrain(canvas);

	let miniMap = MiniMap(mapSize);
	let humans = Humans(context, 5);
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
			if (state.didLionBlow) {
				terrain.handleLionBlow(lion.blow(map));
				setLionBlow(false);
			}

			if (state.didLionSlay) {
				humans.handleLionSlay(lion.absPosition(), 200);
				setLionSlay(false);
			}

			humans.updateTargets(map, lion.tilePosition());
			let burnPositions = humans.updatePositions();
			terrain.handleHumanBurn(burnPositions);
			title.update();
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

Main();
