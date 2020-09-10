import { copy, calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';
import { Humans } from './objects/human';
import { MiniMap } from './objects/minimap';
import { Shadow } from './objects/shadow';
import { Title } from './objects/title';
import { mapSize, tileSizePx, initialCameraPos } from './constants';

const canvas = document.getElementById('main');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Main = () => {
	const origin = copy(initialCameraPos);

	const props = {
		canvas,
		context
	};

	const getLocalStorage = () => {
		let lsDetails = window.localStorage.getItem("megafaunanotfound");
		if (lsDetails === null) {
			window.localStorage.setItem("megafaunanotfound", JSON.stringify({level: 1}));
			lsDetails = window.localStorage.getItem("megafaunanotfound");
		}
		return JSON.parse(lsDetails);
	};

	const getLevelFromLocalStorage = () => {
		const lsDetails = getLocalStorage();
		return lsDetails.level;
	}

	const setLevelInLocalStorage = (level) => {
		const lsDetails = getLocalStorage();
		if (level > lsDetails.level) {
			lsDetails.level = level;
			window.localStorage.setItem("megafaunanotfound", JSON.stringify(lsDetails));
		}
	}

	const state = {
		// True, if lion has extinguished and the move has not been processed
		didLionBlow: false,
		// True, if lion has slain and the move has not been processed
		didLionSlay: false,
		currentLevel: getLevelFromLocalStorage(),
		isGameStarted: false,
		minLevelCover: 25
	};

	const setLionBlow = (value) => {
		state.didLionBlow = value;
	};

	const setLionSlay = (value) => {
		state.didLionSlay = value;
	};

	let lion = Lion(context, () => setLionBlow(true), () => setLionSlay(true), () => setCurrentLevel(state.currentLevel));;
	let terrain, miniMap, humans;

	const resetAll = (level) => {
		if (level === -1) return;
		lion = Lion(context, () => setLionBlow(true), () => setLionSlay(true), () => setCurrentLevel(state.currentLevel));
		terrain = Terrain(canvas);
		miniMap = MiniMap(mapSize);
		humans = Humans(context, 5);
		humans.initializeHumans(terrain.getMap(), lion.tilePosition());
	}

	const changeIsGameStarted = (value) => {
		state.isGameStarted = value;
		if (value === true) {
			resetAll(state.currentLevel);
		}
	}

	const setCurrentLevel = (value) => {
		state.currentLevel = value;
	};

	let shadow = Shadow();
	let title = Title(state.currentLevel, setCurrentLevel, changeIsGameStarted);
	const update = () => { // update the game state
		if (state.isGameStarted === true) {
			updateOrigin(lion.absPosition(), mapSize * tileSizePx, mapSize * tileSizePx, origin);
			lion.update(origin);
			terrain.updateTerrain();

			let map = terrain.getMap();
			state.stamina = lion.getBlowStamina();
			lion.fireDamage(map);
			if (state.didLionBlow) {
				terrain.handleLionBlow(lion.blow(map, state.stamina));
				setLionBlow(false);
			}

			if (state.didLionSlay) {
				humans.handleLionSlay(lion.absPosition(), 200);
				setLionSlay(false);
			}

			humans.updateTargets(map, lion.tilePosition());
			let burnPositions = humans.updatePositions();
			terrain.handleHumanBurn(burnPositions);
			if (humans.getNumAliveHumans() === 0) {
				changeIsGameStarted(false);
				title.setLevelWon();
				setLevelInLocalStorage(state.currentLevel + 1);
				setCurrentLevel(state.currentLevel + 1);
			}
			if (terrain.getGreenCoverPercentage() < state.minLevelCover) {
				changeIsGameStarted(false);
				title.setLevelLost("You lost the forest");
			} else if (lion.getHealth() === 0) {
				changeIsGameStarted(false);
				title.setLevelLost("You burned to death");
			}
		}
		title.update();
	};
	const render = () => { // render the game state
		if (state.isGameStarted) {
			terrain.renderTerrain(origin);
			lion.render(state.stamina);
			humans.renderHumans(origin);
			shadow.addShadow(lion.absPosition(), terrain.getFireTiles(), 200, 82.5, origin);
			miniMap.render(lion.tilePosition(), terrain.getMap(), terrain.getGreenCoverPercentage(), humans.getNumAliveHumans(), lion.getHealth(), lion.getBlowStamina());
		}
		title.render();
	};

	const loop = () => {
		update();
		render();

		window.requestAnimationFrame(loop);
	};


	window.requestAnimationFrame(loop);
};

Main();
