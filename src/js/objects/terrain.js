export const Terrain = (canvas, mapSize, grassTile, fireTile, burntTile) => {
	const terrainObject = {};
	let map = [];
	const context = canvas.getContext("2d");
	const pixelsPerTile = 25;
	let currentTime = Date.now();
	// in milliseconds
	const fireSpreadRate = 5000;

	terrainObject.getMap = () => {
		return map;
	};

	terrainObject.initializeTerrain = () => {
		for (let i = 0; i < mapSize; i++) {
			let row = [];
			for (let j = 0; j < mapSize; j++) {
				row.push(0);
			}
			map.push(row);
		}
		map[mapSize/2][mapSize/2] = 1;
	}

	terrainObject.renderTerrain = (origin) => {
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 0) {
					context.drawImage(grassTile, origin.x + (i*pixelsPerTile), origin.y + (j*pixelsPerTile), pixelsPerTile, pixelsPerTile);
				} else if (map[i][j] == 1) {
					context.drawImage(fireTile, origin.x + (i*pixelsPerTile), origin.y + (j*pixelsPerTile), pixelsPerTile, pixelsPerTile);
				} else if (map[i][j] == 2) {
					context.drawImage(burntTile, origin.x + (i*pixelsPerTile), origin.y + (j*pixelsPerTile), pixelsPerTile, pixelsPerTile);
				}
			}
		}
	};

	terrainObject.updateTerrain = () => {
		if (((Date.now() - currentTime) < fireSpreadRate)) {
			return;
		}

		currentTime = Date.now();

		let updatedMap = JSON.parse(JSON.stringify(map));
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 1) {
					updatedMap[i][j] = 2;
					if (((i-1) >= 0) && (map[i-1][j] == 0)) {
						updatedMap[i-1][j] = 1;
					}
					
					if (((j-1) >= 0) && (map[i][j-1] == 0)) {
						updatedMap[i][j-1] = 1;
					}
					
					if (((i+1) < mapSize) && (map[i+1][j] == 0)) {
						updatedMap[i+1][j] = 1;
					}
					
					if (((j+1) < mapSize) && (map[i][j+1] == 0)) {
						updatedMap[i][j+1] = 1;
					}
				}
			}
		}
		map = JSON.parse(JSON.stringify(updatedMap));
	}

	terrainObject.handleLionBlow = (updatedMap) => {
		map = JSON.parse(JSON.stringify(updatedMap));
	}

	return terrainObject;
}
