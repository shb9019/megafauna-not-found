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
		context.fillStyle = "red";
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
		context.fillStyle = "yellow";
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

	let drawAliveHumans = (numHumansAlive) => {
		context.fillStyle = "yellow";
		context.font = "15px arial";
		context.fillText("Humans alive: " + numHumansAlive, startX, startY + (2 * numTiles) + 40);
	};

	let drawHealthBar = (health) => {
		// Draw the cross sign
		context.fillStyle = 'white';
		context.fillRect(10, canvas.height - 25, 20, 10);
		context.fillRect(15, canvas.height - 30, 10, 20);

		// Draw the health bar
		context.fillRect(40, canvas.height - 30, 204, 20);
		context.fillStyle = 'red';
		context.fillRect(42, canvas.height - 28, 200 * health, 16);
		context.fillStyle = 'black';
		context.fillRect(42 + (200 * health), canvas.height - 28, 200 * (1 - health), 16);
	};

	let drawStaminaBar = (stamina) => {
			let startX = canvas.width - 30;
			let startY = canvas.height - 30;

		    // Draw the energy icon
		    context.fillStyle = '#ffc40c';
		    context.beginPath();
    		context.moveTo(startX + 10, startY + 0);
    		context.lineTo(startX + 0, startY + 10);
    		context.lineTo(startX + 10, startY + 10);
    		context.fill();
    		context.beginPath();
    		context.moveTo(startX + 6, startY + 10);
    		context.lineTo(startX + 16, startY + 10);
    		context.lineTo(startX + 6, startY + 20);
    		context.fill();

    		context.fillStyle = 'white';
    		context.fillRect(startX - 214, startY, 204, 20);
    		context.fillStyle = '#ffc40c';
    		context.fillRect(startX - 212, startY + 2, 200 *  stamina, 16);
    		context.fillStyle = 'black';
    		context.fillRect(startX - 212 + (200 * stamina), startY + 2, 200 *  (1 - stamina), 16);
	};

	miniMapInterface.render = (lionPosition, map, numHumansAlive, health, stamina) => {
		context.globalCompositeOperation = 'source-over';
		drawBoundingBox();
		drawFireBlips(map);
		drawLionBlip(lionPosition);
		drawGreenCover(map);
		drawAliveHumans(numHumansAlive);
		drawHealthBar(health);
		drawStaminaBar(stamina);
	}

	return miniMapInterface; 
};
