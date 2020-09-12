export const calculateAngle = (dx, dy) => {
    if (dy === 0) {
    	if (dx > 0) return 0;
    	else if (dx < 0) return Math.PI;
    } else if (dy > 0) {
    	if (dx > 0) return Math.PI / 4.0;
    	else if (dx < 0) return ((3 * Math.PI) / 4.0);
    	else return Math.PI / 2.0;
    } else if (dy < 0) {
    	if (dx > 0) return (-Math.PI / 4.0);
    	else if (dx < 0) return (-3 * Math.PI) / 4.0;
    	else return -Math.PI / 2.0;
    }
}

export const copy = (a) => {
	return JSON.parse(JSON.stringify(a));
}

export const getTimeSince = (time) => {
	return (Date.now() - time);
};

export const distance = (pointA, pointB) => {
	return Math.sqrt((pointA.x - pointB.x)*(pointA.x - pointB.x) + (pointA.y - pointB.y)*(pointA.y - pointB.y));
};

export const getMidPointPx = (tileIndex, tileSizePx) => {
	return {
		x: (tileIndex.x + 0.5) * tileSizePx,
		y: (tileIndex.y + 0.5) * tileSizePx
	};
}

export const renderTiles = (tileImage, context, minEdgeSize) => {
	const pattern = context.createPattern(tileImage, 'repeat');
	context.rect(0, 0, minEdgeSize, minEdgeSize);
	context.fillStyle = pattern;
	context.fill();
}

export const updateOrigin = (pos, width, height, origin) => {
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

export const create2DArray = (mapSize, initialValue = null) => {
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

export const getRandomIndex = (totalSize) => {
	let randomIndex;
	do {
		randomIndex = normalRandomScaled(0, 0.15) * totalSize;
	} while (randomIndex < 0 || randomIndex >= totalSize);
	return Math.floor(randomIndex);
};

export const randomIntFromInterval = (min, max) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
