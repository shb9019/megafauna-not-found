let { init } = kontra;

export const MiniMap = (numTiles) => {
	let miniMapInterface = {};
	let startX = window.innerWidth - 11 - (2 * numTiles);
	let startY = 12;

	const { canvas, context } = init('shadow');

	let drawBoundingBox = () => {
		let startX = window.innerWidth - 12 - (2 * numTiles);
		let startY = 11;
		context.strokeRect(startX, startY, 2*numTiles + 2, 2*numTiles + 2);
	}

	let drawLionBlip = (lionPosition) => {
		let x = startX + (lionPosition.x * 2);
		let y = startY + (lionPosition.y * 2);
		context.fillStyle = "#FFFF00";
		context.fillRect(x - 1, y - 1, 4, 4); 
	}

	let drawFireBlips = (map) => {
		for (let i = 0; i < numTiles; i++) {
			for (let j = 0; j < numTiles; j++) {
				if (map[i][j] == 1) {
					context.fillStyle = "#FFA500";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				} else if (map[i][j] == 2) {
					context.fillStyle = "#8B4513";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				} else {
					context.fillStyle = "#ACFB9A";
					context.fillRect(startX + (2 * i), startY + (2 * j), 2, 2);
				}
			}
		}
	}

	let drawGreenCover = (map) => {
		let numGreenTiles = 0;
		for (let i = 0; i < numTiles; i++) {
			for (let j = 0; j < numTiles; j++) {
				if (map[i][j] == 0) numGreenTiles++;
			}
		}
		let greenCoverPercentage = ((100.0 * numGreenTiles) / (numTiles * numTiles)).toFixed(2);
		context.font = "15px arial";
		context.fillText("Green Cover left: " + greenCoverPercentage + "%", startX, startY + (2 * numTiles) + 20);
	};

	miniMapInterface.render = (lionPosition, map) => {
		context.globalCompositeOperation = 'source-over';
		drawBoundingBox();
		drawFireBlips(map);
		drawLionBlip(lionPosition);
		drawGreenCover(map);
	}

	return miniMapInterface; 
};
