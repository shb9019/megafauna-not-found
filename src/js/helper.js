export const calculateAngle = (dx, dy) => {
    if (dy == 0) {
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
		randomIndex = normalRandomScaled(0, 0.1) * totalSize;
	} while (randomIndex < 0 || randomIndex >= totalSize);
	return randomIndex;
};
