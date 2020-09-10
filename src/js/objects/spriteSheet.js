export const SpriteSheet = (context, image, frameWidth, frameHeight, totalFrameCount, frameRate) => {
	let currentFrame = 0;

	let spriteSheetInterface = {};
	spriteSheetInterface.update = () => {
		let time = Math.floor(new Date() / frameRate);
		currentFrame = time % totalFrameCount;
	};
	spriteSheetInterface.render = (x, y, rotation, width = frameWidth, height = frameHeight) => {
		context.save();
		context.translate(x, y);
		context.rotate(rotation);
		context.drawImage(image, 0, currentFrame * frameHeight, frameWidth, frameHeight, - frameWidth / 2, - frameHeight / 2, width, height);
		context.restore();
	};

	return spriteSheetInterface;
};
