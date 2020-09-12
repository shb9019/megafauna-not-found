import {mapSize, tileSizePx, directions, terrainParameters} from '../constants';
import {getTimeSince, getMidPointPx, copy} from '../helper';

let grassTile = new Image();
grassTile.src = 'public/assets/grass.png';

let fireTile = new Image();
fireTile.src = 'public/assets/fire2.png';

let burntTile = new Image();
burntTile.src = 'public/assets/burnt.png';

export const Terrain = (canvas) => {
	const context = canvas.getContext("2d");
	const {fireSpreadRate} = terrainParameters;

	// Create and initialize map
	let map = [];
	(function () {
 		for (let i = 0; i < mapSize; i++) {
			let row = [];
			for (let j = 0; j < mapSize; j++) {
				row.push(0);
			}
			map.push(row);
		}
	})();

	let lastUpdateTime = Date.now();

	// Get tile top-left corner in px 
	const getTilePositionPx = (x, y) => {
		return {
			x: x * tileSizePx,
			y: y * tileSizePx
		};
	}

	const terrainInterface = {};

	terrainInterface.getMap = () => {
		return map;
	};

	terrainInterface.renderTerrain = (origin) => {
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				const tilePx = getTilePositionPx(i, j);
				// Adjusted Position
				const adjPos = {
					x: origin.x + tilePx.x,
					y: origin.y + tilePx.y
				};

				if (map[i][j] == 0) {
					context.drawImage(grassTile, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
					context.lineWidth = 0.4;
					context.strokeStyle = 'black';
					context.strokeRect(adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				} else if (map[i][j] == 1) {
					let frame = Math.floor(getTimeSince(0) / 50) % 45;
					context.drawImage(fireTile, frame * 16, 0, 16, 16, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				} else if (map[i][j] == 2) {
					context.drawImage(burntTile, adjPos.x, adjPos.y, tileSizePx, tileSizePx);
					context.lineWidth = 0.4;
					context.strokeStyle = 'black';
					context.strokeRect(adjPos.x, adjPos.y, tileSizePx, tileSizePx);
				}
			}
		}
	};

	terrainInterface.updateTerrain = () => {
		if (getTimeSince(lastUpdateTime) < fireSpreadRate) return;

		lastUpdateTime = Date.now();
		let updatedMap = copy(map);
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 1) {
					updatedMap[i][j] = 2;
					directions.forEach(dir => {
						const x = i + dir.x;
						const y = j + dir.y;
						if ((x >= 0) && (y >= 0) && (x < mapSize) && (y < mapSize) && (map[x][y] == 0)) {
							updatedMap[x][y] = 1;
						}
					});
				}
			}
		}
		map = updatedMap;
	}

	// Used by minimap
	terrainInterface.getFireTiles = () => {
		const fireTiles = [];
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] == 1) {
					fireTiles.push(getMidPointPx({x: i, y: j}, tileSizePx));
				}
			}
		}

		return fireTiles;
	};

	terrainInterface.handleLionBlow = (updatedMap) => {
		map = copy(updatedMap);
	};

	terrainInterface.handleHumanBurn = (burnPositions) => {
		burnPositions.forEach((burnPosition) => {
			map[burnPosition.x][burnPosition.y] = 1;
		});
	};

	terrainInterface.getGreenCoverPercentage = () => {
		let numGreenTiles = 0;
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (map[i][j] === 0) numGreenTiles++;
			}
		}
		return ((100.0 * numGreenTiles) / (mapSize * mapSize)).toFixed(2);
	};

	return terrainInterface;
}
