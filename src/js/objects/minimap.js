export const MiniMap = (context, numTiles) => {
	let miniMapInterface = {};
	let startX = window.innerWidth - 11 - (2 * numTiles);
	let startY = 12;

	let drawBoundingBox = () => {
		let startX = window.innerWidth - 12 - (2 * numTiles);
		let startY = 11;
		context.strokeRect(startX, startY, 2*numTiles + 2, 2*numTiles + 2);
	}

	let drawLionBlip = (lionPosition) => {
		let x = startX + ((lionPosition.x / 25) * 2);
		let y = startY + ((lionPosition.y / 25) * 2);
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
				}
			}
		}	
	}

	miniMapInterface.render = (lionPosition, map) => {
		 drawBoundingBox();
		 drawLionBlip(lionPosition);
		 drawFireBlips(map);
	}

	return miniMapInterface; 
};
