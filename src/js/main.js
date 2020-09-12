import { copy, calculateAngle, updateOrigin } from './helper';
import { Terrain } from './objects/terrain';
import { Lion } from './objects/lion';
import { Humans } from './objects/human';
import { MiniMap } from './objects/minimap';
import { Shadow } from './objects/shadow';
import { Title } from './objects/title';
import { mapSize, tileSizePx, initialCameraPos, levelConstants, deppSong, numLevels } from './constants';

const canvas = document.getElementById('main');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Main = () => {
	const origin = copy(initialCameraPos);

    const buffer = zzfxM(...deppSong);
    let sound = null;

    const playMusic = () => {
    	stopMusic();
    	sound = zzfxP(...buffer);
    	sound.loop = true;
    };

    const stopMusic = () => {
		if (sound !== null) {
			sound.stop();
			sound = null;
		}
    };

	const props = {
		canvas,
		context
	};

	const getLocalStorage = () => {
		let lsDetails = window.localStorage.getItem("mfnf");
		if (lsDetails === null) {
			window.localStorage.setItem("mfnf", JSON.stringify({level: 1}));
			lsDetails = window.localStorage.getItem("mfnf");
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
			window.localStorage.setItem("mfnf", JSON.stringify(lsDetails));
		}
	}

	const state = {
		// True, if lion has extinguished and the move has not been processed
		didLionBlow: false,
		// True, if lion has slain and the move has not been processed
		didLionSlay: false,
		currentLevel: getLevelFromLocalStorage(),
		isGameStarted: false,
		minLevelCover: 25,
		gamePaused: false
	};

	const setLionBlow = (value) => {
		state.didLionBlow = value;
	};

	const setLionSlay = (value) => {
		state.didLionSlay = value;
	};

	let lion;
	let terrain, miniMap, humans;

	const resetAll = (level) => {
		state.gamePaused = false;
		if (level === -1) return;
		else if (level === (numLevels + 1)) {
			state.currentLevel = numLevels;
			level = numLevels;
		}
		lion = Lion(context, levelConstants[level - 1].lion, () => setLionBlow(true), () => setLionSlay(true), () => setCurrentLevel(state.currentLevel), togglePauseGame, () => {sound ? stopMusic() : playMusic()});
		terrain = Terrain(canvas);
		miniMap = MiniMap(mapSize);
		humans = Humans(context, levelConstants[level - 1].human);
		humans.initializeHumans(terrain.getMap(), lion.tilePosition());
	}

	const changeIsGameStarted = (value) => {
		state.isGameStarted = value;
		if (value === true) {
			playMusic();
			resetAll(state.currentLevel);
		} else {
			stopMusic();
		}
	}

	const setCurrentLevel = (value) => {
		state.currentLevel = value;
		state.currentLevel %= (numLevels + 1);
	};

	const pauseGame = () => {
		state.gamePaused = true;
		title.pause();
		stopMusic();
	};

	const resumeGame = () => {
		state.gamePaused = false;
		title.resume();
		playMusic();
	};

	let shadow = Shadow();
	let title = Title(state.currentLevel, setCurrentLevel, changeIsGameStarted, pauseGame, resumeGame);

	const togglePauseGame = () => {
		if (state.gamePaused) {
			resumeGame();
		} else {
			sound.stop();
			pauseGame();
		}
	};

	const update = () => { // update the game state
		let mppx = mapSize * tileSizePx;
		if (!state.gamePaused && state.isGameStarted === true) {
			updateOrigin(lion.absPosition(), mppx, mppx, origin);
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
				humans.handleLionSlay(lion.absPosition(), lion.getKillRange());
				setLionSlay(false);
			}

			humans.updateTargets(map, lion.tilePosition());
			let burnPositions = humans.updatePositions(lion.absPosition());
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
		title.update(state.currentLevel);
	};
	const render = () => { // render the game state
		if (!state.gamePaused && state.isGameStarted) {
			terrain.renderTerrain(origin);
			lion.render(state.stamina);
			humans.renderHumans(origin);
			shadow.addShadow(lion.absPosition(), terrain.getFireTiles(), 200, 50, origin);
			miniMap.render(state.currentLevel, lion.tilePosition(), terrain.getMap(), terrain.getGreenCoverPercentage(), humans.getNumAliveHumans(), lion.getHealth(), lion.getBlowStamina());
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
