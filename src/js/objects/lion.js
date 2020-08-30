let { Sprite, SpriteSheet } = kontra;

export const Lion = (numTiles, tileSizePx, idleSprite, walkSprite, setLionBlow, setLionSlay) => {
	const lionInterface = {};
	const mapSizePx = numTiles * tileSizePx;

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
    const blowRange = 10;
    const blowTimeout = 5000;
    let lastBlowTime = 0;

    let health = 100;
    const fireDamage = 2;

    const sprite = Sprite({
        x: absolutePosition.x,
        y: absolutePosition.y,
        anchor: {x: 0.5, y: 0.5},
        animations: idleSpriteSheet.animations
    });


    // FIXME: In some cases, the key gets stuck i.e., keeps moving in a direciton.
	let map = {}; // You could also use an array

	window.onkeyup = (e) => {
		map[e.key] = false;
	}
    
    window.onkeydown = (e) => {
	    map[e.key] = true;

	    if (e.key == " ") {
	    	setLionSlay();
	    	if ((Date.now() - lastBlowTime) >= blowTimeout) {
	    		setLionBlow();
	    		lastBlowTime = Date.now();
	    	}
	    }
    };

    let updatePosition = () => {
    	if (map["d"] || map["ArrowRight"]) {
    		absolutePosition.x += speed;
    		absolutePosition.x = Math.min(mapSizePx - 1, absolutePosition.x);
    	} else if (map["a"] || map["ArrowLeft"]) {
    		absolutePosition.x -= speed;
    		absolutePosition.x = Math.max(0, absolutePosition.x);
    	}
    	if (map["w"] || map["ArrowUp"]) {
    		absolutePosition.y -= speed;
    		absolutePosition.y = Math.max(0, absolutePosition.y);
    	} else if (map["s"] || map["ArrowDown"]) {
	    	absolutePosition.y += speed;
    		absolutePosition.y = Math.min(mapSizePx - 1, absolutePosition.y);
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

    let tilePosition = () => {
    	return {
    		x: Math.floor(absolutePosition.x / tileSizePx),
    		y: Math.floor(absolutePosition.y / tileSizePx)
    	};
    }

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

    lionInterface.tilePosition = () => {
    	return tilePosition();
    }

    lionInterface.blow = (map) => {
    	const returnMap = JSON.parse(JSON.stringify(map));
    	let position = tilePosition();

    	for (let i = Math.max(0, position.x - blowRange); i <= Math.min(numTiles - 1, position.x + blowRange); i++) {
    		for (let j = Math.max(0, position.y - blowRange); j <= Math.min(numTiles - 1, position.y + blowRange); j++) {
    			if (returnMap[i][j] == 1) {
    				returnMap[i][j] = 2;
    			}
    		}
    	}

    	return returnMap;
    }

    lionInterface.fireDamage = (map) => {
    	let position = tilePosition();
    	if (map[position.x][position.y] == 1) {
    		health = Math.max(0, health - fireDamage);
    	}
    }

    lionInterface.getHealth = () => {
    	return (health / 100);
    }

    lionInterface.getBlowStamina = () => {
    	return Math.min(1, ((Date.now() - lastBlowTime) / blowTimeout));
    };

    return lionInterface;
}
