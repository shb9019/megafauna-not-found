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
