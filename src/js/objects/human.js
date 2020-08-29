import { Queue } from '../classes/queue.js';
import { create2DArray, getRandomIndex,randomIntFromInterval } from '../helper.js';

export const Humans = (context, mapSize, numHumans) => {
	// Human Goals:
	// 1. Get away from Lion in the dark.
	// 2. Destroy as much land as possible.
	// So, maximize distance from lion and find patches that are green.
	// Each tile's probability = (w1*((distance from lion)/(max distance from lion)) + w2*((area of grass that can be burned)/(total area)))/(w1 + w2)

	let humansInterface = {};
	const w1 = 0.8, w2 = 0.2;
	const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
	let humanSprites = [];
	let allTilesViabilities = [];
	let allProbabilities = [];
	let burnWaitTime = [];
	let lastBurnTime = [];
	let lastGeneration = 0;
	let generationGap = 1000;
	let speed = 4;

	humansInterface.initializeHumans = (map, lionPos) => {
		generateViabilityMap(map, lionPos);
		lastGeneration = Date.now();
		for (let i = 0; i < numHumans; i++) {
			let position = allTilesViabilities[getRandomIndex(mapSize * mapSize)];
			humanSprites.push({
				x: position.x * 25 + 5,
				y: position.y * 25 + 5,
				targetX: position.x * 25 + 5,
				targetY: position.y * 25 + 5,
				currentScore: position.probability
			});
			lastBurnTime.push(Date.now());
			burnWaitTime.push(randomIntFromInterval(5000, 8000));
		}
	};

	let generateViabilityMap = (map, lionPos) => {
		let totalProbability = [];
		let allTileProbabilities = [];
		const totalDistance = Math.sqrt(2 * 99 * 99);
		for (let x = 0; x < mapSize; x++) {
			let row = [];
			for (let y = 0; y < mapSize; y++) {
				let distanceToLion = Math.sqrt((lionPos.x - x) * (lionPos.x - x) + (lionPos.y - y) * (lionPos.y - y));
				row.push(w1 * (distanceToLion / totalDistance));
			}
			totalProbability.push(row);
		}

		let visited = create2DArray(mapSize,false);

		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				if (visited[i][j] === false) {
					let visitedIndices = [];
					visitedIndices.push({
						x: i,
						y: j
					});
					visited[i][j] = true;
					if (map[i][j] === 0) {
						let queue = new Queue();
						queue.enqueue({
							x: i,
							y: j
						});
						while (!queue.isEmpty()) {
							let tile = queue.dequeue();
							visited.push(tile);

							directions.forEach((dir) => {
								if (((tile.x + dir[0]) >= 0) && ((tile.x + dir[0]) < mapSize)
									&& ((tile.y + dir[1]) >= 0) && ((tile.y + dir[1]) < mapSize)
									&& (map[tile.x + dir[0]][tile.y + dir[1]] === 0) && (!visited[tile.x + dir[0]][tile.y + dir[1]])) {
									queue.enqueue({
										x: tile.x + dir[0],
										y: tile.y + dir[1]
									});
									visitedIndices.push({
										x: tile.x + dir[0],
										y: tile.y + dir[1]
									});
									visited[tile.x  + dir[0]][tile.y  + dir[1]] = true;
								}
							});
						}
					}
					for (let k = 0; k < visitedIndices.length; k++) {
						let x = visitedIndices[k].x, y = visitedIndices[k].y;
						allTileProbabilities.push({
							x,
							y,
							probability: totalProbability[x][y] + (w2 * (visitedIndices.length / 10000.0))
						})
					}
				}
			}
		}

		allProbabilities = JSON.parse(JSON.stringify(allTileProbabilities));
		allProbabilities.sort((a, b) => {
			if (a.x == b.x) {
				return a.y - b.y;
			}
			return a.x - b.x;
		});
		allTileProbabilities.sort((a, b) => (b.probability - a.probability));
		allTilesViabilities = allTileProbabilities;
	};

	humansInterface.renderHumans = (origin) => {
		for (let i = 0; i < numHumans; i++) {
			context.fillStyle = 'black';
			context.fillRect(humanSprites[i].x + origin.x, humanSprites[i].y + origin.y, 15, 15);
		}
	};

	humansInterface.updateHumanTargets = (map, lionPos) => {
		if ((Date.now() - lastGeneration) < generationGap) {
			return [];
		}
		lastGeneration = Date.now();
		generateViabilityMap(map, lionPos);
		for (let i = 0; i < numHumans; i++) {
			let position = allTilesViabilities[getRandomIndex(mapSize * mapSize)];
			let p1 = position.probability;
			let px = allProbabilities[100 * Math.floor(humanSprites[i].targetX / 25) + Math.floor(humanSprites[i].targetY / 25)];
			let p2 = px.probability;
			if ((p1 - p2) > 0.02) {
				humanSprites[i].targetX = (position.x * 25 + 5);
				humanSprites[i].targetY = (position.y * 25 + 5);
				humanSprites[i].currentScore = p1;
			} else {
				humanSprites[i].currentScore = p2;
			}
		}
	}

	humansInterface.updatePositions = () => {
		let burnPositions = [];
		for (let i = 0; i < numHumans; i++) {
			const human = humanSprites[i];
			if ((human.targetX == human.x) && (human.targetY == human.y)) continue;
			if (human.targetX == human.x) {
				if (human.targetY >= human.y) human.y = Math.min(human.y + speed, human.targetY);
				else human.y = Math.max(human.y - speed, human.targetY);
				continue;
			}
			if (Math.sqrt(((human.targetY - human.y) * (human.targetY - human.y)) + ((human.targetX - human.x)*(human.targetX - human.x))) <= speed) {
				human.x = human.targetX;
				human.y = human.targetY;
				continue;
			}
			const m = Math.abs((human.targetY - human.y) / (human.targetX - human.x));
			let finalX, finalY;
			let denom = Math.sqrt(1.0 / (1.0 + m * m));
			if (human.targetX > human.x) finalX = human.x + (speed * denom);
			else finalX = human.x - (speed * denom);
			if (human.targetY > human.y) finalY = human.y + (m * speed * denom);
			else finalY = human.y - (m * speed * denom);
			humanSprites[i].x = finalX;
			humanSprites[i].y = finalY;
		
			if ((Date.now() - lastBurnTime[i]) >= burnWaitTime[i]) {
				burnPositions.push({
					x: Math.floor(humanSprites[i].x / 25),
					y: Math.floor(humanSprites[i].y / 25)
				});
				lastBurnTime[i] = Date.now();
				burnWaitTime[i] = randomIntFromInterval(5000, 8000);
			}
		}
		return burnPositions;
	};

	return humansInterface;
};
