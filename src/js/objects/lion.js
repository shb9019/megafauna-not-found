let { Sprite, SpriteSheet } = kontra;
import {mapSize, tileSizePx, lionParameters, keys} from '../constants';
import {copy, getTimeSince, distance, getMidPointPx} from '../helper';

const idleSprite = new Image();
idleSprite.src = 'public/assets/idle.png';

const walkSprite = new Image();
walkSprite.src = 'public/assets/walk.png';

// Object to handle the user Lion
export const Lion = (setLionBlow, setLionSlay, restartLevel) => {
	// Initializing all constants used.
	const lionInterface = {};

	const mapSizePx = mapSize * tileSizePx;
	const {
		speed,
		fireDamage,
		extinguishRange,
		extinguishRechargeTime
	} = lionParameters;

	const idleSpriteSheet = SpriteSheet({
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

	const walkSpriteSheet = SpriteSheet({
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

	const sprite = Sprite({
		x: state.position.x,
		y: state.position.y,
		anchor: {x: 0.5, y: 0.5},
		animations: idleSpriteSheet.animations
	});

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
			if (getTimeSince(state.lastExtinguishTime) >= extinguishRechargeTime) {
				setLionBlow();
				state.lastExtinguishTime = Date.now();
			}
		} else if (e.key === "k") {
			setLionSlay();
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

	// Functions exposed to main
	lionInterface.update = (origin) => {
		updatePosition();
		updateRotation();
		sprite.x = origin.x + state.position.x;
		sprite.y = origin.y + state.position.y;
		sprite.update();
	};

	lionInterface.render = () => {
		sprite.render();
	}

	lionInterface.absPosition = () => {
		return state.position;
	}

	lionInterface.tilePosition = () => {
		return tilePosition();
	}

	lionInterface.blow = (map) => {
		const returnMap = copy(map);
		let position = tilePosition();

		let range = (extinguishRange / 2);

		for (let i = Math.max(0, position.x - range); i <= Math.min(mapSize - 1, position.x + range); i++) {
			for (let j = Math.max(0, position.y - range); j <= Math.min(mapSize - 1, position.y + range); j++) {
				let distanceFromLion = distance(getMidPointPx({x: i, y: j}, tileSizePx), state.position);
				if ((distanceFromLion <= (range * tileSizePx)) && (returnMap[i][j] === 1)) {
					returnMap[i][j] = 2;
				}
			}
		}

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

	return lionInterface;
}
