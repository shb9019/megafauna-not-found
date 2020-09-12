(function () {
'use strict';

const copy = (a) => {
	return JSON.parse(JSON.stringify(a));
}

const getTimeSince = (time) => {
	return (Date.now() - time);
};

const distance = (pointA, pointB) => {
	return Math.sqrt((pointA.x - pointB.x)*(pointA.x - pointB.x) + (pointA.y - pointB.y)*(pointA.y - pointB.y));
};

const getMidPointPx = (tileIndex, tileSizePx) => {
	return {
		x: (tileIndex.x + 0.5) * tileSizePx,
		y: (tileIndex.y + 0.5) * tileSizePx
	};
}

const updateOrigin = (pos, width, height, origin) => {
	let px1 = (pos.x - (window.innerWidth / 2));
	let py1 = (pos.y - (window.innerHeight / 2));
	let px2 = (pos.x + (window.innerWidth / 2));
	let py2 = (pos.y + (window.innerHeight / 2));

	if (px1 <= 0) {
		origin.x = 0;
	} else if (px2 >= width) {
		origin.x = window.innerWidth - width;
	} else {
		origin.x = -px1;
	}

	if (py1 <= 0) {
		origin.y = 0;
	} else if (py2 >= height) {
		origin.y = window.innerHeight - height;
	} else {
		origin.y = -py1;
	}
}

const create2DArray = (mapSize, initialValue = null) => {
	let arr = [];
	for (let i = 0; i < mapSize; i++) {
		let row = [];
		for (let j = 0; j < mapSize; j++) row.push(initialValue);
		arr.push(row);
	}
	return arr;
}

let spareRandom = null;

const normalRandom = () => {
	let val, u, v, s, mul;

	if(spareRandom !== null) {
		val = spareRandom;
		spareRandom = null;
	} else {
		do {
			u = Math.random()*2 - 1;
			v = Math.random()*2 - 1;

			s = u*u + v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}
	
	return val;
};

const normalRandomInRange = (min, max) => {
	let val;
	do {
		val = normalRandom();
	} while(val < min || val > max);
	
	return val;
}

const normalRandomScaled = (mean, stddev) => {
	let r = normalRandom();

	r = r * stddev + mean;

	return r;
};

const getRandomIndex = (totalSize) => {
	let randomIndex;
	do {
		randomIndex = normalRandomScaled(0, 0.15) * totalSize;
	} while (randomIndex < 0 || randomIndex >= totalSize);
	return Math.floor(randomIndex);
};

const randomIntFromInterval = (min, max) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Number of tiles per edge of square map
const mapSize = 100;

// Size of each tile in pixels
const tileSizePx = 25;

// Top left corner point in pixels wrt canvas.
const initialCameraPos = {
	x: 0,
	y: 0
};

// 4 directions
const directions = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];

const terrainParameters = {
	// Number of seconds between each fire spread
	fireSpreadRate: 2000
};

const lionParameters = {
	initialPosition: {
		x: 32,
		y: 32
	},
	speed: 10.0,
	extinguishRange: 15,
	extinguishRechargeTime: 5000,
	initialHealth: 100,
	fireDamage: 2,
	killRange: 5
};

const keys = {
	"s": "down",
	"S": "down",
	"ArrowDown": "down",
	"w": "up",
	"W": "up",
	"ArrowUp": "up",
	"a": "left",
	"A": "left",
	"ArrowLeft": "left",
	"d": "right",
	"D": "right",
	"ArrowRight": "right",
	" ": "space"
};

const numLevels = 6;

const levelConstants = [{
	lion: {
		extinguishRechargeTime: 2000,
		fireDamage: 2,
		speed: 10.0
	},
	human: {
		w1: 0.2,
		w2: 0.7,
		w3: 0.1,
		speed: 8.0,
		targetUpdateInterval: 2000,
		minBurnInterval: 3000,
		maxBurnInterval: 8000,
		numHumans: 10
	}
}, {
	lion: {
		extinguishRechargeTime: 3000,
		fireDamage: 4,
		speed: 10.0
	},
	human: {
		w1: 0.1,
		w2: 0.85,
		w3: 0.05,
		speed: 10.0,
		targetUpdateInterval: 3000,
		minBurnInterval: 1000,
		maxBurnInterval: 3000,
		numHumans: 5
	}
}, {
	lion: {
		extinguishRechargeTime: 5000,
		fireDamage: 8,
		speed: 10.0
	},
	human: {
		w1: 0.7,
		w2: 0.2,
		w3: 0.1,
		speed: 15.0,
		targetUpdateInterval: 1000,
		minBurnInterval: 2000,
		maxBurnInterval: 5000,
		numHumans: 8
	}
}, {
	lion: {
		extinguishRechargeTime: 3000,
		fireDamage: 8,
		speed: 10.0
	},
	human: {
		w1: 0.5,
		w2: 0.3,
		w3: 0.2,
		speed: 18.0,
		targetUpdateInterval: 1000,
		minBurnInterval: 1000,
		maxBurnInterval: 8000,
		numHumans: 12
	}
}, {
	lion: {
		extinguishRechargeTime: 3000,
		fireDamage: 10,
		speed: 10.0
	},
	human: {
		w1: 1.0,
		w2: 0.001,
		w3: 0.001,
		speed: 20.0,
		targetUpdateInterval: 500,
		minBurnInterval: 1000,
		maxBurnInterval: 5000,
		numHumans: 3
	}
}, {
	lion: {
		extinguishRechargeTime: 3000,
		fireDamage: 10,
		speed: 10.0
	},
	human: {
		w1: 0.998,
		w2: 0.001,
		w3: 0.001,
		speed: 23.0,
		targetUpdateInterval: 500,
		minBurnInterval: 1000,
		maxBurnInterval: 5000,
		numHumans: 18
	}
}];

const deppSong = [[[,0,77,,,.7,2,.41,,,,,,,,.06],[,0,43,.01,,.3,2,,,,,,,,,.02,.01],[,0,170,.003,,.008,,.97,-35,53,,,,,,.1],[.8,0,270,,,.12,3,1.65,-2,,,,,4.5,,.02],[,0,86,,,.1,,.7,,,,.5,,6.7,1,.05],[,0,41,,.05,.4,2,0,,,9,.01,,,,.08,.02],[,0,2200,,,.04,3,2,,,800,.02,,4.8,,.01,.1],[.3,0,16,,,.3,3]],[[[1,-1,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33],[3,1,22,,,,,,,,,,,,,,,,,,,,,,,,,,,,24,,,,24,,,,,,,,,,,,,,,,,,,,,,,,22,,22,,22,,,,],[5,-1,21,,,,,,,,,,,,,,,,,,,,,,,,,,,,24,,,,23,,,,,,,,,,,,,,,,,,,,,,,,24,,23,,21,,,,],[,1,21,,,,,,,,,,,,,,,,,,,,,,,,,,,,24,,,,23,,,,,,,,,,,,,,,,,,,,,,,,24,,23,,21,,,,]],[[1,-1,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33],[3,1,24,,,,,,,,27,,,,,,,,,,,,,,,,27,,,,24,,,,24,,,,,,,,27,,,,,,,,,,,,,,,,24,,24,,24,,,,],[5,-1,21,,,,,,,,,,,,,,,,,,,,,,,,,,,,24,,,,23,,,,,,,,,,,,,,,,,,,,,,,,24,,23,,21,,,,],[,1,21,,,,,,,,,,,,,,,,,,,,,,,,,,,,24,,,,23,,,,,,,,,,,,,,,,,,,,,,,,24,,23,,21,,,,],[6,1,,,34,34,34,,,,,,34,34,,,,,34,,,,34,34,,,,,34,,,,34,,,,34,34,34,,,,,,34,,,,,,34,34,,,34,34,,,,,,,,,34,34],[4,1,,,,,,,24,,,,,,24,,24,,,,24,,,,24,,,,,,,,,,,,,,,,24,,,,,,24,,24,,,,24,,,,24,,,,,,,,,,]],[[1,-1,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,23,23,35,23,23,36,23,23,35,23,23,36,23,23,35,35,23,23,35,23,23,35,23,23,36,23,23,35,23,23,36,36],[5,-1,21,,,19,,,21,,,,,,,,,,21,,,19,,,17,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[3,1,24,,,24,,,24,,,,,,,,,,24,,,24,,,24,,,,24.75,24.5,24.26,24.01,24.01,24.01,,,,,25,,,,,,,,25,,,,,,,,25,,,,,,,,25,25,25,25],[4,-1,,,,,,,,,,,,,,,,,,,,,,,,,,,24.75,24.5,24.26,24.01,24.01,24.01,24.01,24,,24,24,,24,24,24,24,,24,24,,24,,24,24,,24,24,,24,24,24,24,,24,24,,24,24],[7,-1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,23,,21,23,,35,,23,,21,23,,35,,35,,23,,21,23,,35,,21,23,,35,,21,23,,,],[6,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,34,36,34,,33,34,34,36,31,36,34,,31,34,32,,33,36,34,,31,34,34,36,33,36,33,,31,,,]],[[1,-1,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,21,21,33,21,21,33,21,21,33,21,21,33,21,21,33,33,17,17,29,17,17,29,17,17,29,17,17,29,17,17,29,29,17,17,29,17,17,29,17,17,29,17,17,29,17,17,29,29],[4,1,24,24,,24,24,,24,24,24,24,,24,24,,24,,24,24,,24,24,,24,24,24,24,,24,24,,24,24,24,24,,24,24,,24,24,24,,,24,24,,24,,24,24,,24,24,,24,24,24,24,,24,24,,24,24],[7,-1,21,,19,21,,33,,21,,19,21,,33,,33,,21,,19,21,,33,,21,,19,21,,33,,33,,17,,17,17,29,17,17,29,17,,17,17,29,17,17,29,17,,17,17,29,17,17,29,17,,17,17,29,17,17,29],[2,1,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,,,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,34,34,,34,,,],[6,1,,,36,,,,,,36,,36,,,,,,,,36,,,,,,36,,36,,,,,,,,36,,,,,,,,,,,,,,,,36,,,,,,36,,36,,,,,,],[3,1,,,,,25,,,,,,,,25,,,,,,,,25,,,,,,,,25,25,25,25,,,,,25,,,,,25,,,25,,,,,,,,25,,,,,,,,25,25,25,25]],[[1,-1,14,14,26,14,14,26,14,14,26,14,14,26,14,14,26,26,14,14,26,14,14,26,14,14,26,14,14,26,14,14,26,26,17,17,29,17,17,29,17,17,29,17,17,29,17,17,29,29,19,19,31,19,19,31,19,19,31,19,19,31,19,19,31,31],[4,1,24,24,,24,24,,24,24,24,24,,24,24,,24,,24,24,,24,24,,24,24,24,24,,24,24,,24,24,24,24,,24,24,,24,24,24,24,,24,24,,36,,24,24,,24,24,,24,24,24,24,,24,24,,24,24],[7,-1,14,,14,14,26,14,14,26,14,,14,14,26,14,14,26,14,,14,14,26,14,14,26,14,,14,14,26,14,14,26,17,,17,17,29,17,17,29,17,,17,17,29,17,17,29,19,,19,19,31,19,19,31,19,,19,19,31,19,19,31],[2,1,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,,,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,36,36,,36,,,],[3,1,,,,,25,,,,,,,,25,,,,,,,,25,,,,,,,,25,25,25,25,,,,,25,,,,,,,,25,,,,,,,,25,,,,,,,,25,25,25,25],[6,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,34,,,,,,34,,34,,,,,,,,34,,,,,,34,,34,,,,,,]]],[0,1,1,2,3,4,4]];

let grassTile = new Image();
grassTile.src = 'public/assets/grass.png';

let fireTile = new Image();
fireTile.src = 'public/assets/fire2.png';

let burntTile = new Image();
burntTile.src = 'public/assets/burnt.png';

const Terrain = (canvas) => {
	const context = canvas.getContext("2d");
	const {fireSpreadRate} = terrainParameters;

	// Create and initialize map
	let map = [];
	(function () {
 		for (let i = 0; i < mapSize; i++) {
			let row = [];
			for (let j = 0; j < mapSize; j++) {
				row.push(0);
			}
			map.push(row);
		}
	})();

	let lastUpdateTime = Date.now();

	// Get tile top-left corner in px 
	const getTilePositionPx = (x, y) => {
		return {
			x: x * tileSizePx,
			y: y * tileSizePx
		};
	}

	const terrainInterface = {};

	terrainInterface.getMap = () => {
		return map;
	};

	terrainInterface.renderTerrain = (origin) => {
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				const tilePx = getTilePositionPx(i, j);
				// Adjusted Position
				const adjPos = {
					x: origin.x + tilePx.x,
					y: origin.y + tilePx.y
				};

				if (map[i][j] == 0) {
					context.drawImage(grassTile, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
					context.lineWidth = 0.4;
					context.strokeStyle = 'black';
					context.strokeRect(adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				} else if (map[i][j] == 1) {
					let frame = Math.floor(getTimeSince(0) / 50) % 45;
					context.drawImage(fireTile, frame * 16, 0, 16, 16, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				} else if (map[i][j] == 2) {
					context.drawImage(burntTile, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
					context.lineWidth = 0.4;
					context.strokeStyle = 'black';
					context.strokeRect(adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				}
			}
		}
	};

	terrainInterface.updateTerrain = () => {
		if (getTimeSince(lastUpdateTime) < fireSpreadRate) return;

		lastUpdateTime = Date.now();
		let updatedMap = copy(map);
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 1) {
					updatedMap[i][j] = 2;
					directions.forEach(dir => {
						const x = i + dir.x;
						const y = j + dir.y;
						if ((x >= 0) && (y >= 0) && (x < mapSize) && (y < mapSize) && (map[x][y] == 0)) {
							updatedMap[x][y] = 1;
						}
					});
				}
			}
		}
		map = updatedMap;
	}

	// Used by minimap
	terrainInterface.getFireTiles = () => {
		const fireTiles = [];
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 1) {
					fireTiles.push(getMidPointPx({x: i, y: j}, tileSizePx));
				}
			}
		}

		return fireTiles;
	};

	terrainInterface.handleLionBlow = (updatedMap) => {
		map = copy(updatedMap);
	};

	terrainInterface.handleHumanBurn = (burnPositions) => {
		burnPositions.forEach((burnPosition) => {
			map[burnPosition.x][burnPosition.y] = 1;
		});
	};

	terrainInterface.getGreenCoverPercentage = () => {
		let numGreenTiles = 0;
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] === 0) numGreenTiles++;
			}
		}
		return ((100.0 * numGreenTiles) / (mapSize * mapSize)).toFixed(2);
	};

	return terrainInterface;
}

const SpriteSheet = (context, image, frameWidth, frameHeight, totalFrameCount, frameRate) => {
	let currentFrame = 0;

	let spriteSheetInterface = {};

	spriteSheetInterface.update = () => {
		let time = Math.floor(new Date() / frameRate);
		currentFrame = time % totalFrameCount;
	};

	spriteSheetInterface.render = (x, y, rotation, width = frameWidth, height = frameHeight, vertical = false) => {
		context.save();
		context.translate(x, y);
		context.rotate(rotation);
		if (!vertical) {
			context.drawImage(image, 0, currentFrame * frameHeight, frameWidth, frameHeight, - frameWidth / 2, - frameHeight / 2, width, height);
		} else {
			context.drawImage(image, currentFrame * frameWidth, 0, frameWidth, frameHeight, - frameWidth / 2, - frameHeight / 2, width, height);
		}
		context.restore();
	};

	return spriteSheetInterface;
};

const idleSprite = new Image();
idleSprite.src = 'public/assets/idle.png';

const walkSprite = new Image();
walkSprite.src = 'public/assets/walk.png';

// Object to handle the user Lion
const Lion = (context, lionConstants, setLionBlow, setLionSlay, restartLevel, togglePauseGame, pauseAudio) => {
	// Initializing all constants used.
	const lionInterface = {};

	const mapSizePx = mapSize * tileSizePx;
	const {
		killRange,
		extinguishRange
	} = lionParameters;

	const {
		extinguishRechargeTime,
		fireDamage,
		speed
	} = lionConstants;
	
	let lastBlowTime = 0;
	let lastKillTime = 0;
	let lastStamina = 1;
	let isMoving = false;
	const blowAnimationTime = 250;
	const killAnimationTime = 100;

	const IdleSpriteSheet = () => SpriteSheet(context, idleSprite, 64, 64, 5, 250);
	const WalkSpriteSheet = () => SpriteSheet(context, walkSprite, 64, 64, 2, 500);

	// Initializing all variables.
	const state = {
		position: copy(lionParameters.initialPosition),
		health: lionParameters.initialHealth,
		lastExtinguishTime: 0,
		pressedKeys: {}
	};

	// Helper function
	const tilePosition = () => {
		return {
			x: Math.floor(state.position.x / tileSizePx),
			y: Math.floor(state.position.y / tileSizePx)
		};
	}

	const sprite = {
		x: state.position.x,
		y: state.position.y,
		rotation: 0,
		anchor: {x: 0.5, y: 0.5},
		animation: IdleSpriteSheet()
	};

	// All key press logic
	const pressKey = (key) => {
		state.pressedKeys[key] = true;
	};

	const releaseKey = (key) => {
		state.pressedKeys[key] = false;
	};

	const isKeyPressed = (key) => {
		return state.pressedKeys[key];
	};

	window.onkeyup = (e) => {
		releaseKey(keys[e.key]);
	}
	
	window.onkeydown = (e) => {
		pressKey(keys[e.key]);

		if (e.key === " ") {
			setLionBlow();
		} else if (e.key === "k" || e.key === "K") {
			setLionSlay();
			lastKillTime = new Date();
		} else if (e.key === "Escape") {
			togglePauseGame();
		} else if (e.key.toUpperCase() === "M") {
			pauseAudio();
		}
	};

	// Updates position based on keys currently pressed.
	const updatePosition = () => {
		if (isKeyPressed("right")) {
			state.position.x += speed;
			state.position.x = Math.min(mapSizePx - 1, state.position.x);
		} else if (isKeyPressed("left")) {
			state.position.x -= speed;
			state.position.x = Math.max(0, state.position.x);
		}
		if (isKeyPressed("up")) {
			state.position.y -= speed;
			state.position.y = Math.max(0, state.position.y);
		} else if (isKeyPressed("down")) {
			state.position.y += speed;
			state.position.y = Math.min(mapSizePx - 1, state.position.y);
		}
	};

	// Updates sprite rotation based on keys currently pressed.
	const updateRotation = () => {
		if (isKeyPressed("right") && isKeyPressed("down")) {
			sprite.rotation = Math.PI / 4;
		} else if (isKeyPressed("right") && isKeyPressed("up")) {
			sprite.rotation = -Math.PI / 4;
		} else if (isKeyPressed("up") && isKeyPressed("left")) {
			sprite.rotation = (-3 * Math.PI) / 4;
		} else if (isKeyPressed("left") && isKeyPressed("down")) {
			sprite.rotation = (3 * Math.PI) / 4;
		} else if (isKeyPressed("right")) {
			sprite.rotation = 0;
		} else if (isKeyPressed("up")) {
			sprite.rotation = -Math.PI / 2;
		} else if (isKeyPressed("left")) {
			sprite.rotation = -Math.PI;
		} else if (isKeyPressed("down")) {
			sprite.rotation = Math.PI / 2;
		}

		if (isKeyPressed("up") || isKeyPressed("down") || isKeyPressed("left") || isKeyPressed("right")) {
			if (isMoving === false) {
				isMoving = true;
				sprite.animation = WalkSpriteSheet();
			}
		} else {
			if (isMoving === true) {
				isMoving = false;
				sprite.animation = IdleSpriteSheet();
			}
		}
	};

	const renderBlow = (blowStamina) => {
		let fraction = getTimeSince(lastBlowTime) / blowAnimationTime;
		context.strokeStyle = 'white';
		context.lineWidth = 3;
		context.beginPath();
		context.arc(sprite.x, sprite.y, lastStamina * (extinguishRange / 2) * tileSizePx * fraction, 0, Math.PI*2, false);
		context.stroke();
	};

	const renderKill = () => {
		let fraction = getTimeSince(lastKillTime) / killAnimationTime;
		context.strokeStyle = 'red';
		context.lineWidth = 3;
		context.beginPath();
		context.arc(sprite.x, sprite.y, killRange * tileSizePx * fraction, 0, Math.PI*2, false);
		context.stroke();
	};

	// Functions exposed to main
	lionInterface.update = (origin) => {
		updatePosition();
		updateRotation();
		sprite.x = origin.x + state.position.x;
		sprite.y = origin.y + state.position.y;
		sprite.animation.update();
	};

	lionInterface.render = (blowStamina) => {
		sprite.animation.render(sprite.x, sprite.y, sprite.rotation);
		if (getTimeSince(lastBlowTime) <= blowAnimationTime) {
			renderBlow(blowStamina);
		}
		if (getTimeSince(lastKillTime) <= killAnimationTime) {
			renderKill();
		}
	}

	lionInterface.absPosition = () => {
		return state.position;
	}

	lionInterface.tilePosition = () => {
		return tilePosition();
	}

	lionInterface.blow = (map, blowStamina) => {
		const returnMap = copy(map);
		let position = tilePosition();

		let range = Math.ceil(extinguishRange * blowStamina / 2);

		for (let i = Math.max(0, position.x - range); i <= Math.min(mapSize - 1, position.x + range); i++) {
			for (let j = Math.max(0, position.y - range); j <= Math.min(mapSize - 1, position.y + range); j++) {
				let distanceFromLion = distance(getMidPointPx({x: i, y: j}, tileSizePx), state.position);
				if ((distanceFromLion <= (range * tileSizePx)) && (returnMap[i][j] === 1)) {
					returnMap[i][j] = 2;
				}
			}
		}

		lastBlowTime = new Date();
		lastStamina = blowStamina;
		state.lastExtinguishTime = Date.now();

		return returnMap;
	}

	lionInterface.fireDamage = (map) => {
		let position = tilePosition();
		if (map[position.x][position.y] === 1) {
			state.health = Math.max(0, state.health - fireDamage);
		}
	}

	lionInterface.getHealth = () => {
		return (state.health / 100);
	}

	lionInterface.getBlowStamina = () => {
		return Math.min(1, (getTimeSince(state.lastExtinguishTime) / extinguishRechargeTime));
	};

	lionInterface.getKillRange = () => {
		return killRange * tileSizePx;
	};

	return lionInterface;
}

//code.iamkate.com
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};

const humanSprite = new Image();
humanSprite.src = 'public/assets/human.png';


const Humans = (context, humanConstants) => {
	const {w1, w2, w3, targetUpdateInterval, speed, minBurnInterval, maxBurnInterval, numHumans} = humanConstants;

	let humans = [];

	// Tile probabilities ordered by probabilities desc
	let sortedProbabilities = [];
	// Tile probabilities ordered by row and col indices
	let allProbabilities = [];

	// Interval from lastBurnAt to next burn
	let burnInterval = [], lastBurnAt = [], lastTargetUpdateAt = Date.now();

	const getEndToEndDistance = () => {
		return Math.sqrt(2.0 * mapSize * mapSize);
	};

	const humansInterface = {};
	humansInterface.initializeHumans = (map, lionPos) => {
		generateProbabilityMap(map, lionPos, true);

		for (let i = 0; i < numHumans; i++) {
			let position = sortedProbabilities[getRandomIndex(mapSize * mapSize)];
			let positionPx = getMidPointPx(position, tileSizePx);
			humans.push({
				x: positionPx.x,
				y: positionPx.y,
				sprite: SpriteSheet(context, humanSprite, 16, 16, 12, 80),
				targetX: positionPx.x,
				targetY: positionPx.y
			});
			lastBurnAt.push(Date.now());
			burnInterval.push(randomIntFromInterval(minBurnInterval, maxBurnInterval));
		}
	};

	humansInterface.handleLionSlay = (lionPos, radius) => {
		let indices = [];
		for (let i = (humans.length - 1); i >= 0; i--) {
			if (distance(lionPos, humans[i]) <= radius) {
				indices.push(i);
			}
		}
		for (let i = 0; i < indices.length; i++) {
			humans.splice(indices[i], 1);
		}
	};

	const getHumanProximity = (tileX, tileY, initial = false) => {
		let x = tileSizePx * tileX;
		let y = tileSizePx * tileY;
		let sum = 0;
		if (initial) {
			for (let i = 0; i < numHumans; i++) {
				sum += (distance({x: (mapSize * tileSizePx), y: (mapSize * tileSizePx)}, {x, y}) / tileSizePx);
			}
			return (sum / (numHumans * Math.sqrt(2) * mapSize));
		} else {
			for (let i = 0; i < humans.length; i++) {
				sum += (distance({x: humans[i].targetX, y: humans[i].targetY}, {x, y}) / tileSizePx);
			}
			return (sum / (humans.length * Math.sqrt(2) * mapSize));
		}
	};

	const generateProbabilityMap = (map, lionPos, initial = false) => {
		const maxDistance = getEndToEndDistance();
		let totalProbability = [];
		let greenTiles = 0;

		for (let x = 0; x < mapSize; x++) {
			let row = [];
			for (let y = 0; y < mapSize; y++) {
				const distanceToLion = distance(lionPos, {x, y});
				row.push(w1 * distanceToLion / maxDistance);
				if (map[x][y] === 0) greenTiles++;
			}
			totalProbability.push(row);
		}

		let visited = create2DArray(mapSize, false);

		for (let x = 0; x < mapSize; x++) {
			for (let y = 0; y < mapSize; y++) {
				if (visited[x][y] === true) continue;

				let visitedIndices = [];
				visitedIndices.push({x, y});
				visited[x][y] = true;

				if (map[x][y] === 0) {
					let queue = new Queue();
					queue.enqueue({x, y});
					while (!queue.isEmpty()) {
						const tile = queue.dequeue();
						visited.push(tile);

						directions.forEach((dir) => {
							const x = tile.x + dir.x;
							const y = tile.y + dir.y;

							if ((x >= 0) && (x < mapSize) && (y >= 0) && (y < mapSize)
								&& (map[x][y] === 0) && (!visited[x][y])) {
								queue.enqueue({x, y});
								visitedIndices.push({x, y});
								visited[x][y] = true;
							}
						});
					}
				}
				for (let k = 0; k < visitedIndices.length; k++) {
					const x = visitedIndices[k].x;
					const y = visitedIndices[k].y;
					totalProbability[x][y] += ((w2 * visitedIndices.length / greenTiles) + (w3 * getHumanProximity(x, y, initial)));
				}
			}
		}

		allProbabilities = [];
		for (let x = 0; x < mapSize; x++) {
			for (let y = 0; y < mapSize; y++) {
				allProbabilities.push({
					x,
					y,
					probability: (totalProbability[x][y]).toFixed(4)
				});
			}
		}

		allProbabilities.sort((a, b) => {
			if (a.x === b.x) {
				return a.y - b.y;
			}
			return a.x - b.x;
		});

		sortedProbabilities = copy(allProbabilities);
		sortedProbabilities.sort((a, b) => {
			return (b.probability - a.probability);
		});
	};

	const getNextTarget = (currPos, lionPos) => {
		let count = 10;
		let nextPos;
		while (count--) {
			nextPos = sortedProbabilities[getRandomIndex(mapSize * mapSize)];
			if (nextPos.x == currPos.x) continue;
			let a = ((nextPos.y - currPos.y) / (nextPos.x - currPos.x));
			let c = - (-1 * currPos.y) - (a * currPos.x);
			let dist = Math.abs(a * lionPos.x - lionPos.y + c) / Math.sqrt(a * a + 1);
			if (dist >= (tileSizePx * 10)) break;
		}

		return nextPos;
	};

	humansInterface.renderHumans = (origin) => {
		for (let i = 0; i < humans.length; i++) {
			let angle = Math.atan2(humans[i].x - humans[i].targetX, humans[i].y - humans[i].targetY);
			humans[i].sprite.render(humans[i].x + origin.x, humans[i].y + origin.y, -angle, 32, 32, true);
		}
	};

	humansInterface.updateTargets = (map, lionPos) => {
		if (getTimeSince(lastTargetUpdateAt) < targetUpdateInterval) return;

		lastTargetUpdateAt = Date.now();
		generateProbabilityMap(map, lionPos);
		for (let i = 0; i < humans.length; i++) {
			let selectedTarget = getNextTarget({x: humans[i].x, y: humans[i].y}, lionPos);
			let p1 = selectedTarget.probability;
			let val = mapSize * Math.floor(humans[i].targetX / tileSizePx) + Math.floor(humans[i].targetY / tileSizePx);
			let currentTarget = allProbabilities[val];
			let p2 = currentTarget.probability;
			humans[i].targetX = (selectedTarget.x * 25 + 5);
			humans[i].targetY = (selectedTarget.y * 25 + 5);
		}
	}

	humansInterface.updatePositions = (lionPos) => {
		let burnPositions = [];

		for (let i = 0; i < humans.length; i++) {
			const human = humans[i];
			if ((human.targetX === human.x) && (human.targetY === human.y)) continue;
			if (human.targetX === human.x) {
				if (human.targetY >= human.y) human.y = Math.min(human.y + speed, human.targetY);
				else human.y = Math.max(human.y - speed, human.targetY);
				continue;
			}

			let targetX = human.targetX;
			let targetY = human.targetY;

			if (distance(human, {x: targetX, y: targetY}) <= speed) {
				human.x = targetX;
				human.y = targetY;
				continue;
			}

			const m = Math.abs((targetY - human.y) / (targetX - human.x));
			let finalX, finalY;
			let denom = Math.sqrt(1.0 / (1.0 + m * m));
			if (targetX > human.x) finalX = human.x + (speed * denom);
			else finalX = human.x - (speed * denom);
			if (targetY > human.y) finalY = human.y + (m * speed * denom);
			else finalY = human.y - (m * speed * denom);
			humans[i].x = finalX;
			humans[i].y = finalY;
		}

		for (let i = 0; i < humans.length; i++) {
			humans[i].sprite.update();
			if (getTimeSince(lastBurnAt[i]) >= burnInterval[i]) {
				burnPositions.push({
					x: Math.floor(humans[i].x / tileSizePx),
					y: Math.floor(humans[i].y / tileSizePx)
				});
				lastBurnAt[i] = Date.now();
				burnInterval[i] = randomIntFromInterval(minBurnInterval, maxBurnInterval);
			}
		}

		return burnPositions;
	};

	humansInterface.getNumAliveHumans = () => {
		return humans.length;
	};

	return humansInterface;
};

const MiniMap = (numTiles) => {
	let miniMapInterface = {};
	let startX = window.innerWidth - 11 - (2 * numTiles);
	let startY = 12;

	const canvas = document.getElementById('shadow');
	const context = canvas.getContext('2d');

	let drawBoundingBox = () => {
		let startX = window.innerWidth - 12 - (2 * numTiles);
		let startY = 11;
		context.strokeRect(startX, startY, 2*numTiles + 2, 2*numTiles + 2);
	}

	let drawLionBlip = (lionPosition) => {
		let x = startX + (lionPosition.x * 2);
		let y = startY + (lionPosition.y * 2);
		context.fillStyle = "red";
		context.fillRect(x - 1, y - 1, 4, 4); 
	}

	let drawFireBlips = (map) => {
		for (let i = 0; i < numTiles; i++) {
			for (let j = 0; j < numTiles; j++) {
				if (map[i][j] === 1) {
					context.fillStyle = "#FFA500";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				} else if (map[i][j] === 2) {
					context.fillStyle = "#8B4513";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				} else {
					context.fillStyle = "#ACFB9A";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				}
			}
		}
	}

	let drawLevel = (level) => {
		context.fillStyle = "yellow";
		context.font = "15px arial";
		context.fillText("Level " + level, startX, startY + (2 * numTiles) + 20);
	};

	let drawGreenCover = (greenCover) => {
		context.fillStyle = "yellow";
		context.font = "15px arial";
		context.fillText("Green Cover left: " + greenCover + "%", startX, startY + (2 * numTiles) + 40);
	
		let sX = canvas.width - 30;
		let sY = canvas.height - 60;

		let gc = greenCover / 100;
		context.fillStyle = '#3cb043';
		context.beginPath();
    	context.moveTo(sX + 10, sY + 0);
    	context.lineTo(sX + 2, sY + 10);
    	context.lineTo(sX + 18, sY + 10);
    	context.fill();
    	context.beginPath();
    	context.moveTo(sX + 2, sY + 10);
    	context.lineTo(sX + 18, sY + 10);
    	context.lineTo(sX + 10, sY + 20);
    	context.fill();

    	context.fillStyle = 'white';
    	context.fillRect(sX - 214, sY, 204, 20);
    	context.fillStyle = '#3cb043';
    	context.fillRect(sX - 212, sY + 2, 200 *  gc, 16);
    	context.fillStyle = '#FF2400';
    	context.fillRect(sX - 212 + (200 * 0.25) + 2, sY + 2, 2, 16);
    	context.fillStyle = 'black';
    	context.fillRect(sX - 212 + (200 * gc), sY + 2, 200 *  (1 - gc), 16);
	};

	let drawAliveHumans = (numHumansAlive) => {
		context.fillStyle = "yellow";
		context.font = "15px arial";
		context.fillText("Humans alive: " + numHumansAlive, startX, startY + (2 * numTiles) + 60);
	};

	let drawHealthBar = (health) => {
		// Draw the cross sign
		context.fillStyle = 'white';
		context.fillRect(10, canvas.height - 25, 20, 10);
		context.fillRect(15, canvas.height - 30, 10, 20);

		// Draw the health bar
		context.fillRect(40, canvas.height - 30, 204, 20);
		context.fillStyle = 'red';
		context.fillRect(42, canvas.height - 28, 200 * health, 16);
		context.fillStyle = 'black';
		context.fillRect(42 + (200 * health), canvas.height - 28, 200 * (1 - health), 16);
	};

	let drawStaminaBar = (stamina) => {
		let startX = canvas.width - 30;
		let startY = canvas.height - 30;

		// Draw the energy icon
		context.fillStyle = '#ffc40c';
		context.beginPath();
    	context.moveTo(startX + 10, startY + 0);
    	context.lineTo(startX + 0, startY + 10);
    	context.lineTo(startX + 10, startY + 10);
    	context.fill();
    	context.beginPath();
    	context.moveTo(startX + 6, startY + 10);
    	context.lineTo(startX + 16, startY + 10);
    	context.lineTo(startX + 6, startY + 20);
    	context.fill();

    	context.fillStyle = 'white';
    	context.fillRect(startX - 214, startY, 204, 20);
    	context.fillStyle = '#ffc40c';
    	context.fillRect(startX - 212, startY + 2, 200 *  stamina, 16);
    	context.fillStyle = 'black';
    	context.fillRect(startX - 212 + (200 * stamina), startY + 2, 200 *  (1 - stamina), 16);
	};

	miniMapInterface.render = (level, lionPosition, map, greenCover, numHumansAlive, health, stamina) => {
		context.globalCompositeOperation = 'source-over';
		drawBoundingBox();
		drawFireBlips(map);
		drawLionBlip(lionPosition);
		drawLevel(level);
		drawGreenCover(greenCover);
		drawAliveHumans(numHumansAlive);
		drawHealthBar(health);
		drawStaminaBar(stamina);
	}

	return miniMapInterface; 
};

const Shadow = () => {
	const shadowInterface = {};

	const canvas = document.getElementById('shadow');
	const context = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	shadowInterface.addShadow = (lionPosition, firePositions, lionRadius, fireRadius, origin) => {
		context.restore();
		context.save();
    	context.globalCompositeOperation = 'source-over';
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);

		let gradient1 = context.createRadialGradient(lionPosition.x + origin.x, lionPosition.y + origin.y, 3 * lionRadius / 4, lionPosition.x + origin.x, lionPosition.y + origin.y, lionRadius);
		gradient1.addColorStop(0, "black");
		gradient1.addColorStop(1, "transparent");

		context.globalCompositeOperation = 'destination-out';
		context.beginPath();
		context.fillStyle = gradient1;
    	context.arc(lionPosition.x + origin.x, lionPosition.y + origin.y, lionRadius, 0, Math.PI * 2, true);
    	context.fill();

    	for (let i = 0; i < firePositions.length; i++) {
    		let gradient2 = context.createRadialGradient(firePositions[i].x + origin.x, firePositions[i].y + origin.y, 3 * fireRadius / 4, firePositions[i].x + origin.x, firePositions[i].y + origin.y, fireRadius);
			gradient2.addColorStop(0, "black");
			gradient2.addColorStop(1, "transparent");

    		context.beginPath();
    		context.fillStyle = gradient2;
	    	context.arc(firePositions[i].x + origin.x, firePositions[i].y + origin.y, fireRadius, 0, Math.PI * 2, true);
    		context.fill();
    	}
	};

	return shadowInterface;
};

var letters = letters = {
    'A': [
        [, 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1]
    ],
    'B': [
        [1, 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, 1]
    ],
    'C': [
        [1, 1, 1],
        [1],
        [1],
        [1],
        [1, 1, 1]
    ],
    'D': [
        [1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1]
    ],
    'E': [
        [1, 1, 1],
        [1],
        [1, 1, 1],
        [1],
        [1, 1, 1]
    ],
    'F': [
        [1, 1, 1],
        [1],
        [1, 1],
        [1],
        [1]
    ],
    'G': [
        [, 1, 1],
        [1],
        [1, , 1, 1],
        [1, , , 1],
        [, 1, 1]
    ],
    'H': [
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'I': [
        [1, 1, 1],
        [, 1],
        [, 1],
        [, 1],
        [1, 1, 1]
    ],
    'J': [
        [1, 1, 1],
        [, , 1],
        [, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'K': [
        [1, , , 1],
        [1, , 1],
        [1, 1],
        [1, , 1],
        [1, , , 1]
    ],
    'L': [
        [1],
        [1],
        [1],
        [1],
        [1, 1, 1]
    ],
    'M': [
        [1, 1, 1, 1, 1],
        [1, , 1, , 1],
        [1, , 1, , 1],
        [1, , , , 1],
        [1, , , , 1]
    ],
    'N': [
        [1, , , 1],
        [1, 1, , 1],
        [1, , 1, 1],
        [1, , , 1],
        [1, , , 1]
    ],
    'O': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'P': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [1],
        [1]
    ],
    'Q': [
        [0, 1, 1],
        [1, , , 1],
        [1, , , 1],
        [1, , 1, 1],
        [1, 1, 1, 1]
    ],
    'R': [
        [1, 1],
        [1, , 1],
        [1, , 1],
        [1, 1],
        [1, , 1]
    ],
    'S': [
        [1, 1, 1],
        [1],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    'T': [
        [1, 1, 1],
        [, 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    'U': [
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'V': [
        [1, , , , 1],
        [1, , , , 1],
        [, 1, , 1],
        [, 1, , 1],
        [, , 1]
    ],
    'W': [
        [1, , , , 1],
        [1, , , , 1],
        [1, , , , 1],
        [1, , 1, , 1],
        [1, 1, 1, 1, 1]
    ],
    'X': [
        [1, , , , 1],
        [, 1, , 1],
        [, , 1],
        [, 1, , 1],
        [1, , , , 1]
    ],
    'Y': [
        [1, , 1],
        [1, , 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    'Z': [
        [1, 1, 1, 1, 1],
        [, , , 1],
        [, , 1],
        [, 1],
        [1, 1, 1, 1, 1]
    ],
    '0': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    '1': [
        [, 1],
        [, 1],
        [, 1],
        [, 1],
        [, 1]
    ],
    '2': [
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    '3':[
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '4':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]
    ],
    '5':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '6':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '7':[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [0,0,1]
    ],
    '8':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '9':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    ' ': [
        [, ,],
        [, ,],
        [, ,],
        [, ,],
        [, ,]
    ],
    '!': [
        [,1 ,],
        [,1 ,],
        [,1 ,],
        [, ,],
        [,1 ,]
    ]
};

const getTextLength = (string, size) => {
    var needed = [];
    string = string.toUpperCase();
    for (var i = 0; i < string.length; i++) {
        var letter = letters[string.charAt(i)];
        if (letter) {
            needed.push(letter);
        }
    }

    let currX = 0;
    for (i = 0; i < needed.length; i++) {
        letter = needed[i];
        var addX = 0;
        for (var y = 0; y < letter.length; y++) {
            var row = letter[y];
            addX = Math.max(addX, row.length * size);
        }
        currX += size + addX;
    }

    return (currX - size);
};

function draw(canvas, context, string, size, startX, startY, color = 'white') {
    context.fillStyle = color;
    let blocks = getPositions(canvas, context, string, size, startX, startY);

    for (let i = 0; i < blocks.length; i++) {
        context.fillRect(blocks[i].x, blocks[i].y, blocks[i].width, blocks[i].height);
    }
}

const getPositions = (canvas, context, string, size, startX, startY) => {
    let blocks = [];
    var needed = [];
    string = string.toUpperCase();
    for (var i = 0; i < string.length; i++) {
        var letter = letters[string.charAt(i)];
        if (letter) {
            needed.push(letter);
        }
    }

    var currX = startX;
    for (i = 0; i < needed.length; i++) {
        letter = needed[i];
        var currY = startY;
        var addX = 0;
        for (var y = 0; y < letter.length; y++) {
            var row = letter[y];
            for (var x = 0; x < row.length; x++) {
                if (row[x]) {
                    blocks.push({
                        x: currX + x * size,
                        y: currY,
                        width: size,
                        height: size
                    });
                }
            }
            addX = Math.max(addX, row.length * size);
            currY += size;
        }
        if (i === (needed.length - 1)) {
            currX += size;
        } else {
            currX += size + addX;
        }
    }

    return blocks;
}

let fireSprite = new Image();
fireSprite.src = 'public/assets/fire2.png';

const Title = (currentLevel, setLevel, changeGameStarted, pauseGame, resumeGame) => {
	const titleInterface = {};
	let clickableRectangles = [];

    const tips = [
        "Look out for new fires in the minimap.",
        "Put out fires as early as possible.",
        "As levels increase, humans stay away lions.",
        "Keep roaming the map.",
        "Prioritize killing humans if the fires are out of control",
        "Humans become faster as levels progress"
    ];
    let tip = tips[0];

	let pageNumber = 0;
	let gameOverReason = "";
	const GAME_START = 99;

	const canvas = document.getElementById('title');
	const context = canvas.getContext('2d');
	let renderStoryStartTime = 0;
    let level = currentLevel;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const FireSpriteSheet = () => {
		const image = fireSprite;
		const frameWidth = 8;
		const frameHeight = 8;
		const totalFrameCount = 45;
		const frameRate = 20;
		let currentFrame = 0;

		let spriteSheetInterface = {};
		spriteSheetInterface.update = () => {
			currentFrame = (currentFrame + 1) % totalFrameCount;
		};
		spriteSheetInterface.render = (x, y, width, height) => {
			context.drawImage(image, currentFrame * frameWidth, 0, frameWidth, frameHeight, x, y, width, height);
		};

		return spriteSheetInterface;
	};

	const fireSprites = [];

	(function() {
		for (let i = 0; i < 200; i++) {
			fireSprites.push({
				x: 0,
				y: 0,
				spriteSheet: FireSpriteSheet()
			});
		}
	})();

	const renderPlay = () => {
		const gameLine = "PLAY";
		let fontSize = 8;
		let totalWidth = getTextLength(gameLine, fontSize) + 60;
		let startX = (canvas.width - totalWidth) / 2.0;
		const startY = (0.8 * canvas.height);
		draw(canvas, context, gameLine, fontSize, startX + 60, startY);

		let x = startX;
		let y = startY;
		context.fillStyle = "white";
		context.beginPath();
		context.moveTo(x, y);
		x += 40;
		y += 20;
		context.lineTo(x, y);
		x -= 40;
		y += 20;
		context.lineTo(x, y);
		context.fill();

		// Create the button.
		clickableRectangles.push([
			{x: startX, y: startY},
			{x: startX + 60 + getTextLength(gameLine, fontSize), y: startY + 80},
			() => { pageNumber = 1; renderStoryStartTime = new Date(); }
			]
		);
	};

    const renderResume = () => {
        const gameLine = "RESUME LEVEL " + (level % (numLevels + 1));
        let fontSize = 8;
        let totalWidth = getTextLength(gameLine, fontSize) + 60;
        let startX = (canvas.width - totalWidth) / 2.0;
        const startY = (0.8 * canvas.height);
        draw(canvas, context, gameLine, fontSize, startX + 60, startY);

        let x = startX;
        let y = startY;
        context.fillStyle = "white";
        context.beginPath();
        context.moveTo(x, y);
        x += 40;
        y += 20;
        context.lineTo(x, y);
        x -= 40;
        y += 20;
        context.lineTo(x, y);
        context.fill();

        // Create the button.
        clickableRectangles.push([
                {x: startX, y: startY},
                {x: startX + 60 + getTextLength(gameLine, fontSize), y: startY + 80},
                () => { pageNumber = GAME_START; changeGameStarted(true); }
            ]
        );
    };

	const renderTitle = () => {
	    let startY = 0.2 * canvas.height;
		const gameLine1 = "MEGA FAUNA";
		let gameLine1FontSize = 20;
		let startX1 = (canvas.width - getTextLength(gameLine1, gameLine1FontSize)) / 2.0;
		let blocks = getPositions(canvas, context, gameLine1, gameLine1FontSize, startX1, startY);
		for (let i = 0; i < blocks.length; i++) {
			fireSprites[i].x = blocks[i].x;
			fireSprites[i].y = blocks[i].y;
			fireSprites[i].spriteSheet.update();
			fireSprites[i].spriteSheet.render(fireSprites[i].x, fireSprites[i].y, gameLine1FontSize, gameLine1FontSize);
		}

		const gameLine2 = "NOT FOUND!";
		let gameLine2FontSize = 12;
		let startX2 = (canvas.width - getTextLength(gameLine2, gameLine2FontSize)) / 2.0;

		draw(canvas, context, gameLine2, gameLine2FontSize, startX2,startY + (6 * gameLine1FontSize));
	};

	const renderStory = () => {
		const story = [
			"This is 40,000 BC.",
			"",
			"Australia has been untouched for millennia by Humans.         ",
			"A new species called 'Homo Sapiens' has landed on this continent.        ",
			"They have almost immediately started threatening the existence of the",
			"ecosystem. They are driving the previously thriving megafauna,",
			"one that survived multiple ice ages, to extinction. Homo Sapiens",
			"are the only animals known to control an element of nature, Fire.            ",
			"",
			"This has become a bane to the local fauna.",
			"",
			"",
			"As the king of the forest, you have a responsibility to kill these",
			"aliens before they burn down the forests beyond repair!"
		]

		context.fillStyle = "white";
		context.font = '20px Courier New';
		let x = 20, y = 100;
		let remLength = (getTimeSince(renderStoryStartTime) / 80);
		for (let i = 0; i < story.length; i++) {
			if (remLength <= 0) continue;
			context.fillText(story[i].substring(0, remLength), x, y);
			y += 22;
			remLength -= story[i].length;
		}
	};

	const renderNext = () => {
	    const text = "NEXT";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - (2 * textLength);
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 25, y: y + 26},
                () => { pageNumber = 2; }
            ]
        );

        context.beginPath();
        context.lineWidth = 5;
        x += (textLength + 10);
        context.moveTo(x, y);
        x += 15;
        y += 13;
        context.lineTo(x, y);
        x -= 15;
        y += 13;
        context.lineTo(x, y);
        context.strokeStyle = "white";
        context.stroke();
    };

    const renderSkip = () => {
        const text = "SKIP";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - (4 * textLength);
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 25, y: y + 26},
                () => { renderStoryStartTime = 0; }
            ]
        );
    };

    const renderControls = () => {
        const text = "CONTROLS";
        let fontSize = 12;
        const textLength = getTextLength(text, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, text, fontSize, x, y);

        const controls = [
            "WASD  - Move",
            "",
            "K     - Kill humans in range",
            "Space - Extinguish Fire",
			"Esc   - Pause",
            "M     - Mute",
			"",
			"Goal: Find and kill all humans in the dark before 75% of the forest is burnt."
        ];
        context.font = '25px Courier New';
        y = 230;
        x = 80;
        for (let i = 0; i < controls.length; i++) {
            context.fillText(controls[i], x, y);
            y += 28;
        }
    };

    const renderStart = () => {
        const text = "START LEVEL 1";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 80;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 80, y: y + 30},
                () => { pageNumber = GAME_START; changeGameStarted(true); }
            ]
        );

        context.beginPath();
        context.lineWidth = 5;
        x += (textLength + 20);
        context.moveTo(x, y);
        x += 15;
        y += 13;
        context.lineTo(x, y);
        x -= 15;
        y += 13;
        context.lineTo(x, y);
        context.strokeStyle = "white";
        context.stroke();
    };

    const renderGameOver = () => {
        const gameOver = "GAME OVER!";
        let fontSize = 14;
        const textLength = getTextLength(gameOver, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, gameOver, fontSize, x, y, "#FF2400");

        const deathReason = gameOverReason;
        const fontSize2 = 5;
        const textLength2 = getTextLength(deathReason, fontSize2);
        x = (canvas.width - textLength2) / 2;
        y = 50 + 120;
        draw(canvas, context, deathReason, fontSize2, x, y, "white");
    };

    const renderGameWon = () => {
        let gameOver = "YOU SAVED THE FOREST!";
        if (level === (numLevels + 1)) gameOver = "YOU FINISHED THE GAME!";
        let fontSize = 14;
        const textLength = getTextLength(gameOver, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, gameOver, fontSize, x, y, "#0DB50D");
    };

    const renderHome = () => {
        const text = "HOME";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 30},
                () => { pageNumber = 0; }
            ]
        );
    };

    const renderRetry = () => {
        const text = "RETRY";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
            {x, y},
            {x: x + textLength, y: y + 30},
            () => { pageNumber = GAME_START; changeGameStarted(true);}    
        ]);
    };

    const renderNextLevel = () => {
        const text = "NEXT LEVEL";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 30},
                () => { pageNumber = GAME_START; changeGameStarted(true);}
            ]
        );
    };

    const renderPauseButtons = () => {
        let text = "HOME";
        let fontSize = 8;
        let textLength = getTextLength(text, fontSize);
        let x = (canvas.width / 4) - (textLength / 2);
        let y = (canvas.height / 2) - 20;
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 40},
                () => { pageNumber = 0; changeGameStarted(false);}
            ]
        );

        text = "RESTART";
        fontSize = 8;
        textLength = getTextLength(text, fontSize);
        x = (3 * canvas.width / 4) - (textLength / 2);
        y = (canvas.height / 2) - 20;
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 40},
                () => { pageNumber = GAME_START; changeGameStarted(true);}
            ]
        );

        text = "WASD - Move, K - Kill, Space - Extinguish, Esc - Pause/Resume"
        fontSize = 2;
        x = (canvas.width / 2);
        y += 150;
        context.fillStyle = 'white';
        context.font = '20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, x, y);

        text = "Tip: " + tip;
        fontSize = 2;
        x = (canvas.width / 2);
        y += 30;
        context.fillStyle = 'white';
        context.font = '20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, x, y);
    };

    const renderGameFinished = () => {

    };

    canvas.addEventListener('mousemove', e => {
		let isCursorPointer = false;
		clickableRectangles.forEach((rect) => {
			if ((rect[0].x <= e.offsetX) && (rect[0].y <= e.offsetY)
				&& (rect[1].x >= e.offsetX) && (rect[1].y >= e.offsetY)) {
				isCursorPointer = true;
			}
		});

		if (isCursorPointer) {
			document.getElementById("title").style.cursor = "pointer";
		} else {
			document.getElementById("title").style.cursor = "default";
		}
	});

	canvas.addEventListener("click", e => {
		let handler;
		clickableRectangles.forEach((rect) => {
			if ((rect[0].x <= e.offsetX) && (rect[0].y <= e.offsetY)
				&& (rect[1].x >= e.offsetX) && (rect[1].y >= e.offsetY)) {
				handler = rect[2];
			}
		});

		if (handler) handler();
	});

	titleInterface.setLevelWon = () => {
        pageNumber = 4;
    };

    titleInterface.setLevelLost = (reason) => {
        pageNumber = 3;
        gameOverReason = reason;
    };

    titleInterface.pause = () => {
        if (pageNumber === GAME_START) {
            tip = tips[randomIntFromInterval(0, tips.length - 1)];
            pageNumber = 5;
        }
    };

    titleInterface.resume = () => {
        if (pageNumber === 5) {
            pageNumber = GAME_START;
        }
    };

	titleInterface.update = (currentLevel) => {
        level = currentLevel;
    };

	titleInterface.render = () => {
	    if (pageNumber !== GAME_START) {
            clickableRectangles = [];
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
            if (pageNumber === 0) {
                // Title page
                renderTitle();
                if (level === 1) {
                    renderPlay();
                } else {
                    renderResume();
                }
            } else if (pageNumber === 1) {
                // Story page
                renderStory();
                if (renderStoryStartTime !== 0) {
                    renderSkip();
                }
                renderNext();
            } else if (pageNumber === 2) {
                // Controls page
                renderControls();
                renderStart();
            } else if (pageNumber === 3) {
                // Game over
                renderGameOver();
                renderRetry();
                renderHome();
            } else if (pageNumber === 4) {
                // Level won
                renderGameWon();
                if (level !== (numLevels + 1)) {
                    renderNextLevel();
                }
                renderHome();
            } else if (pageNumber === 5) {
                renderPauseButtons();
            }
        } else if (level === 6) { 
            renderGameFinished();
        } else {
        	context.clearRect(0, 0, canvas.width, canvas.height);
        }
	};

	return titleInterface;
};

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

}());
//# sourceMappingURL=main.js.map
