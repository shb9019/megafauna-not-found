let { Sprite, SpriteSheet } = kontra;

export const Lion = (mapSizePx, idleSprite, walkSprite) => {
	const lionInterface = {};

    const idleSpriteSheet = SpriteSheet({
        image: idleSprite,
        frameWidth: 64,
        frameHeight: 64,
        animations: {
            idle: {
                frames: '0..4',
                frameRate: 5
            }
        }
    });

    const walkSpriteSheet = SpriteSheet({
        image: walkSprite,
        frameWidth: 64,
        frameHeight: 64,
        animations: {
            idle: {
                frames: '0..1',
                frameRate: 2
            }
        }
    });

    const absolutePosition = {
    	x: 32,
    	y: 32
    };
    
    const speed = 5.0;

    const sprite = Sprite({
        x: absolutePosition.x,
        y: absolutePosition.y,
        anchor: {x: 0.5, y: 0.5},
        animations: idleSpriteSheet.animations
    });


	let map = {}; // You could also use an array

	window.onkeyup = (e) => {
		map[e.key] = false;	
	}
    
    window.onkeydown = (e) => {
	    map[e.key] = true;
    };

    let updatePosition = () => {
    	if (map["d"] || map["ArrowRight"]) {
    		absolutePosition.x += speed;
    		absolutePosition.x = Math.min(mapSizePx, absolutePosition.x);
    	} else if (map["a"] || map["ArrowLeft"]) {
    		absolutePosition.x -= speed;
    		absolutePosition.x = Math.max(0, absolutePosition.x);
    	}
    	if (map["w"] || map["ArrowUp"]) {
    		absolutePosition.y -= speed;
    		absolutePosition.y = Math.max(0, absolutePosition.y);
    	} else if (map["s"] || map["ArrowDown"]) {
	    	absolutePosition.y += speed;
    		absolutePosition.y = Math.min(mapSizePx, absolutePosition.y);
    	}
    };

    let updateRotation = () => {
    	if (map["d"] && map["s"]) {
    		sprite.rotation = Math.PI / 4;
    	} else if (map["d"] && map["w"]) {
    		sprite.rotation = -Math.PI / 4;
    	} else if (map["w"] && map["a"]) {
    		sprite.rotation = (-3 * Math.PI) / 4;
    	} else if (map["a"] && map["a"]) {
    		sprite.rotation = (3 * Math.PI) / 4;
    	} else if (map["d"]) {
    		sprite.rotation = 0;
    	} else if (map["w"]) {
    		sprite.rotation = -Math.PI / 2;
    	} else if (map["a"]) {
    		sprite.rotation = -Math.PI;
    	} else if (map["s"]) {
    		sprite.rotation = Math.PI / 2;
    	}
    };

    lionInterface.update = (origin) => {
    	updatePosition();
    	updateRotation();
    	sprite.x = origin.x + absolutePosition.x;
    	sprite.y = origin.y + absolutePosition.y;
    	sprite.update();
    };

    lionInterface.render = () => {
    	sprite.render();
    }

    lionInterface.absPosition = () => {
    	return absolutePosition;
    }

    return lionInterface;
}
