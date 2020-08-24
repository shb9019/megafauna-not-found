export const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(x1 - x2, y2 - y1) + 1.5708;
};

export const renderTiles = (tileImage, context, minEdgeSize) => {
	const pattern = context.createPattern(tileImage, 'repeat');
	context.rect(0, 0, minEdgeSize, minEdgeSize);
	context.fillStyle = pattern;
	context.fill();
}

export const initializeMap = (mapSize) => {
	let map = [];
	for (let i = 0; i < mapSize; i++) {
		let row = [];
		for (let j = 0; j < mapSize; j++) {
			row.push(0);
		}
		map.push(row);
	}
	return map;
}
