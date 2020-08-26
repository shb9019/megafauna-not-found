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