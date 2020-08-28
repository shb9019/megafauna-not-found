import { Queue } from '../classes/queue.js';
import { create2DArray } from '../helper.js';

export const Humans = (mapSize) => {
	// Human Goals:
	// 1. Get away from Lion in the dark.
	// 2. Destroy as much land as possible.
	// So, maximize distance from lion and find patches that are green.
	// Each tile's probability = (w1*((distance from lion)/(max distance from lion)) + w2*((area of grass that can be burned)/(total area)))/(w1 + w2)

	let humansInterface = {};
	let w1 = 0.5, w2 = 0.5;

	humansInterface.generateProbabilityMap = (map, lionPos) => {
		console.log("Starting generation...", Date.now());
		let distanceProb = create2DArray(mapSize);
		let totalDistance = Math.sqrt(2 * 99 * 99);
		for (let x = 0; x < mapSize; x++) {
			for (let y = 0; y < mapSize; y++) {
				let distanceToLion = Math.sqrt((lionPos.x - x) * (lionPos.x - x) + (lionPos.y - y) * (lionPos.y - y));
				distanceProb[x][y] = (distanceToLion / totalDistance);
			}
		}

		let totalProbability = create2DArray(mapSize);
		for (let i = 0; i < mapSize; i++) {
			for (let j = 0; j < mapSize; j++) {
				totalProbability[i][j] = (w1 * distanceProb[i][j]) ;
			}
		}

		console.log("Completed generation...", Date.now());
	};

	return humansInterface;
};
