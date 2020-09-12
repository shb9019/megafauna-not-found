import { Queue } from '../classes/queue';
import { getMidPointPx, copy, getTimeSince, create2DArray, distance, getRandomIndex, randomIntFromInterval } from '../helper';
import { mapSize, directions, humanParameters, tileSizePx } from '../constants';
import { SpriteSheet } from './spriteSheet';

const humanSprite = new Image();
humanSprite.src = 'public/assets/human.png';


export const Humans = (context, humanConstants) => {
	const {w1, w2, targetUpdateInterval, speed, minBurnInterval, maxBurnInterval, numHumans} = humanConstants;

	let humans = [];

	// Tile probabilities ordered by probabilities desc
	let sortedProbabilities = [];
	// Tile probabilities ordered by row and col indices
	let allProbabilities = [];

	// Interval from lastBurnAt to next burn
	let burnInterval = [];
	let lastBurnAt = [];
	let lastTargetUpdateAt = Date.now();

	const getEndToEndDistance = () => {
		return Math.sqrt(2.0 * mapSize * mapSize);
	};

	const humansInterface = {};
	humansInterface.initializeHumans = (map, lionPos) => {
		generateProbabilityMap(map, lionPos);

		for (let i = 0; i < numHumans; i++) {
			let position = sortedProbabilities[getRandomIndex(mapSize * mapSize)];
			let positionPx = getMidPointPx(position, tileSizePx);
			humans.push({
				x: positionPx.x,
				y: positionPx.y,
				sprite: SpriteSheet(context, humanSprite, 16, 16, 12, 80),
				targetX: positionPx.x,
				targetY: positionPx.y,
				targetProbability: position.probability,
				dead: false
			});
			lastBurnAt.push(Date.now());
			burnInterval.push(randomIntFromInterval(minBurnInterval, maxBurnInterval));
		}
	};

	humansInterface.handleLionSlay = (lionPos, radius) => {
		let indices = [];
		for (let i = (humans.length - 1); i >= 0; i--) {
			if (distance(lionPos, humans[i]) <= radius) {
				indices.push(i);
			}
		}
		for (let i = 0; i < indices.length; i++) {
			humans.splice(indices[i], 1);
		}
	};

	const generateProbabilityMap = (map, lionPos) => {
		const maxDistance = getEndToEndDistance();
		let totalProbability = [];
		let greenTiles = 0;

		for (let x = 0; x < mapSize; x++) {
			let row = [];
			for (let y = 0; y < mapSize; y++) {
				const distanceToLion = distance(lionPos, {x, y});
				row.push(w1 * distanceToLion / maxDistance);
				if (map[x][y] === 0) greenTiles++;
			}
			totalProbability.push(row);
		}

		let visited = create2DArray(mapSize, false);

		for (let x = 0; x < mapSize; x++) {
			for (let y = 0; y < mapSize; y++) {
				if (visited[x][y] === true) continue;

				let visitedIndices = [];
				visitedIndices.push({x, y});
				visited[x][y] = true;

				if (map[x][y] === 0) {
					let queue = new Queue();
					queue.enqueue({x, y});
					while (!queue.isEmpty()) {
						const tile = queue.dequeue();
						visited.push(tile);

						directions.forEach((dir) => {
							const x = tile.x + dir.x;
							const y = tile.y + dir.y;

							if ((x >= 0) && (x < mapSize) && (y >= 0) && (y < mapSize)
								&& (map[x][y] === 0) && (!visited[x][y])) {
								queue.enqueue({x, y});
								visitedIndices.push({x, y});
								visited[x][y] = true;
							}
						});
					}
				}
				for (let k = 0; k < visitedIndices.length; k++) {
					const x = visitedIndices[k].x;
					const y = visitedIndices[k].y;
					totalProbability[x][y] += (w2 * visitedIndices.length / greenTiles);
				}
			}
		}

		allProbabilities = [];
		for (let x = 0; x < mapSize; x++) {
			for (let y = 0; y < mapSize; y++) {
				allProbabilities.push({
					x,
					y,
					probability: (totalProbability[x][y]).toFixed(4)
				});
			}
		}

		allProbabilities.sort((a, b) => {
			if (a.x === b.x) {
				return a.y - b.y;
			}
			return a.x - b.x;
		});

		sortedProbabilities = copy(allProbabilities);
		sortedProbabilities.sort((a, b) => {
			return (b.probability - a.probability);
		});
	};

	const getNextTarget = (currPos, lionPos) => {
		let count = 10;
		let nextPos;
		while (count--) {
			nextPos = sortedProbabilities[getRandomIndex(mapSize * mapSize)];
			if (nextPos.x == currPos.x) continue;
			let a = ((nextPos.y - currPos.y) / (nextPos.x - currPos.x));
			let b = -1;
			let c = - (b * currPos.y) - (a * currPos.x);
			let x = lionPos.x;
			let y = lionPos.y;
			let dist = Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
			if (dist >= (tileSizePx * 10)) break;
		}

		return nextPos;
	};

	humansInterface.renderHumans = (origin) => {
		for (let i = 0; i < humans.length; i++) {
			let angle = Math.atan2(humans[i].x - humans[i].targetX, humans[i].y - humans[i].targetY);
			humans[i].sprite.render(humans[i].x + origin.x, humans[i].y + origin.y, -angle, 32, 32, true);
		}
	};

	humansInterface.updateTargets = (map, lionPos) => {
		if (getTimeSince(lastTargetUpdateAt) < targetUpdateInterval) return;

		lastTargetUpdateAt = Date.now();
		generateProbabilityMap(map, lionPos);
		for (let i = 0; i < humans.length; i++) {
			let selectedTarget = getNextTarget({x: humans[i].x, y: humans[i].y}, lionPos);
			let p1 = selectedTarget.probability;
			let val = mapSize * Math.floor(humans[i].targetX / tileSizePx) + Math.floor(humans[i].targetY / tileSizePx);
			let currentTarget = allProbabilities[val];
			let p2 = currentTarget.probability;
			if (Math.abs(p1 - p2) >= 0) {
				humans[i].targetX = (selectedTarget.x * 25 + 5);
				humans[i].targetY = (selectedTarget.y * 25 + 5);
				humans[i].targetProbability = p1;
			} else {
				humans[i].targetProbability = p2;
			}
		}
	}

	humansInterface.updatePositions = (lionPos) => {
		let burnPositions = [];

		for (let i = 0; i < humans.length; i++) {
			const human = humans[i];
			if ((human.targetX === human.x) && (human.targetY === human.y)) continue;
			if (human.targetX === human.x) {
				if (human.targetY >= human.y) human.y = Math.min(human.y + speed, human.targetY);
				else human.y = Math.max(human.y - speed, human.targetY);
				continue;
			}

			let targetX = human.targetX;
			let targetY = human.targetY;

			if (distance(human, {x: targetX, y: targetY}) <= speed) {
				human.x = targetX;
				human.y = targetY;
				continue;
			}

			const m = Math.abs((targetY - human.y) / (targetX - human.x));
			let finalX, finalY;
			let denom = Math.sqrt(1.0 / (1.0 + m * m));
			if (targetX > human.x) finalX = human.x + (speed * denom);
			else finalX = human.x - (speed * denom);
			if (targetY > human.y) finalY = human.y + (m * speed * denom);
			else finalY = human.y - (m * speed * denom);
			humans[i].x = finalX;
			humans[i].y = finalY;
		}

		for (let i = 0; i < humans.length; i++) {
			humans[i].sprite.update();
			if (getTimeSince(lastBurnAt[i]) >= burnInterval[i]) {
				burnPositions.push({
					x: Math.floor(humans[i].x / tileSizePx),
					y: Math.floor(humans[i].y / tileSizePx)
				});
				lastBurnAt[i] = Date.now();
				burnInterval[i] = randomIntFromInterval(minBurnInterval, maxBurnInterval);
			}
		}

		return burnPositions;
	};

	humansInterface.getNumAliveHumans = () => {
		return humans.length;
	};

	return humansInterface;
};
