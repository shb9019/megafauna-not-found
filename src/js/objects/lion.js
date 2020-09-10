import {mapSize, tileSizePx, lionParameters, keys} from '../constants';
import {copy, getTimeSince, distance, getMidPointPx} from '../helper';
import { SpriteSheet } from './spriteSheet';

const idleSprite = new Image();
idleSprite.src = 'public/assets/idle.png';

const walkSprite = new Image();
walkSprite.src = 'public/assets/walk.png';

// Object to handle the user Lion
export const Lion = (context, setLionBlow, setLionSlay, restartLevel) => {
	// Initializing all constants used.
	const lionInterface = {};

	const mapSizePx = mapSize * tileSizePx;
	const {
		speed,
		fireDamage,
		extinguishRange,
		extinguishRechargeTime,
		killRange
	} = lionParameters;
	
	let lastBlowTime = 0;
	let lastKillTime = 0;
	let lastStamina = 1;
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
		} else if (e.key === "k") {
			setLionSlay();
			lastKillTime = new Date();
		} else if (e.key === "r") {
			restartLevel();
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
		console.log(blowStamina);

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
