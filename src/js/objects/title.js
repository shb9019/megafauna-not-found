let { init, Sprite, SpriteSheet } = kontra;
import { draw, getTextLength, getPositions } from '../classes/font';

let fireSprite = new Image();
fireSprite.src = 'public/assets/fire.png';

export const Title = () => {
	const titleInterface = {};

	let { canvas, context } = init('title');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const fireSpriteSheet = SpriteSheet({
        image: fireSprite,
        frameWidth: 20,
        frameHeight: 20,
        animations: {
            burn: {
                frames: '0..5',
                frameRate: 15
            }
        }
    });

    const fireSprites = [];

    for (let i = 0; i < 200; i++) {
    	fireSprites.push(
    		Sprite({
        		x: 0,
        		y: 0,
        		animations: fireSpriteSheet.animations
    		})
    	);
    }


	let renderTitle = () => {
		const gameLine1 = "MEGA FAUNA";
		let gameLine1FontSize = 20;
		let startX1 = (canvas.width - getTextLength(gameLine1, gameLine1FontSize)) / 2.0;
		let blocks = getPositions(canvas, context, gameLine1, gameLine1FontSize, startX1, 0);
		for (let i = 0; i < blocks.length; i++) {
			fireSprites[i].x = blocks[i].x;
			fireSprites[i].y = blocks[i].y;
			fireSprites[i].update();
			fireSprites[i].render();
		}

		const gameLine2 = "NOT FOUND!";
		let gameLine2FontSize = 12;
		let startX2 = (canvas.width - getTextLength(gameLine2, gameLine2FontSize)) / 2.0;

		draw(canvas, context, gameLine2, 12, startX2, 6 * gameLine1FontSize);
	};


	titleInterface.render = () => {
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);
		renderTitle();
	};

	return titleInterface;
};
