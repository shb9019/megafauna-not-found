// Number of tiles per edge of square map
export const mapSize = 100;

// Size of each tile in pixels
export const tileSizePx = 25;

// Top left corner point in pixels wrt canvas.
export const initialCameraPos = {
	x: 0,
	y: 0
};

// 4 directions
export const directions = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];

export const terrainParameters = {
	// Number of seconds between each fire spread
	fireSpreadRate: 2000
};

export const lionParameters = {
	initialPosition: {
		x: 32,
		y: 32
	},
	speed: 10.0,
	extinguishRange: 15,
	extinguishRechargeTime: 5000,
	initialHealth: 100,
	fireDamage: 2,
	killRange: 8
};

export const humanParameters = {
	w1: 0.7,
	w2: 0.3,
	targetUpdateInterval: 1000,
	speed: 1,
	minBurnInterval: 5000,
	maxBurnInterval: 10000
};

export const keys = {
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

export const levelConstants = [{
	lion: {
		extinguishRechargeTime: 2000,
		fireDamage: 2,
		speed: 10.0
	},
	human: {
		w1: 1.0,
		w2: 0.0,
		speed: 8.0,
		targetUpdateInterval: 3000,
		minBurnInterval: 8000,
		maxBurnInterval: 10000,
		numHumans: 5
	}
}, {
	lion: {
		extinguishRechargeTime: 3000,
		fireDamage: 4,
		speed: 10.0
	},
	human: {
		w1: 1.0,
		w2: 0.0,
		speed: 9.0,
		targetUpdateInterval: 3000,
		minBurnInterval: 8000,
		maxBurnInterval: 10000,
		numHumans: 3
	}
}];
