export const Terrain = (canvas, grassTile, fireTile, burntTile) => {
	const terrainObject = {};
	const context = canvas.getContext("2d");
	const sizeInPixel = canvas.width;
	const sizeInTiles = 100;
	const pixelsPerTile = sizeInPixel / sizeInTiles;

	terrainObject.renderTerrain = (map) => {
		for (let i = 0; i < sizeInTiles; i++) {
			for (let j = 0; j < sizeInTiles; j++) {
				if (map[i][j] == 0) {
					context.drawImage(grassTile, i*pixelsPerTile, j*pixelsPerTile, pixelsPerTile, pixelsPerTile);
				}
			}
		}
	}

	return terrainObject;
}
