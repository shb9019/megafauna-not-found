export const Shadow = () => {
	const shadowInterface = {};

	const canvas = document.getElementById('shadow');
	const context = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	shadowInterface.addShadow = (lionPosition, firePositions, lionRadius, fireRadius, origin) => {
		context.restore();
		context.save();
    	context.globalCompositeOperation = 'source-over';
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);

		let gradient1 = context.createRadialGradient(lionPosition.x + origin.x, lionPosition.y + origin.y, 3 * lionRadius / 4, lionPosition.x + origin.x, lionPosition.y + origin.y, lionRadius);
		gradient1.addColorStop(0, "black");
		gradient1.addColorStop(1, "transparent");

		context.globalCompositeOperation = 'destination-out';
		context.beginPath();
		context.fillStyle = gradient1;
    	context.arc(lionPosition.x + origin.x, lionPosition.y + origin.y, lionRadius, 0, Math.PI * 2, true);
    	context.fill();

    	for (let i = 0; i < firePositions.length; i++) {
    		let gradient2 = context.createRadialGradient(firePositions[i].x + origin.x, firePositions[i].y + origin.y, 3 * fireRadius / 4, firePositions[i].x + origin.x, firePositions[i].y + origin.y, fireRadius);
			gradient2.addColorStop(0, "black");
			gradient2.addColorStop(1, "transparent");

    		context.beginPath();
    		context.fillStyle = gradient2;
	    	context.arc(firePositions[i].x + origin.x, firePositions[i].y + origin.y, fireRadius, 0, Math.PI * 2, true);
    		context.fill();
    	}
	};

	return shadowInterface;
};
