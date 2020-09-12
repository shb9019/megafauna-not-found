import { tileSizePx, deppSong, numLevels } from "../constants";

import { draw, getTextLength, getPositions } from '../classes/font';
import { getTimeSince, randomIntFromInterval } from "../helper";

let fireSprite = new Image();
fireSprite.src = 'public/assets/fire2.png';

export const Title = (currentLevel, setLevel, changeGameStarted, pauseGame, resumeGame) => {
	const titleInterface = {};
	let clickableRectangles = [];

    const tips = [
        "Look out for new fires in the minimap.",
        "Put out fires as early as possible.",
        "As levels increase, humans stay away lions.",
        "Keep roaming the map.",
        "Prioritize killing humans if the fires are out of control",
        "Humans become faster as levels progress"
    ];
    let tip = tips[0];

	let pageNumber = 0;
	let gameOverReason = "";
	const GAME_START = 99;

	const canvas = document.getElementById('title');
	const context = canvas.getContext('2d');
	let renderStoryStartTime = 0;
    let level = currentLevel;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const FireSpriteSheet = () => {
		const image = fireSprite;
		const frameWidth = 8;
		const frameHeight = 8;
		const totalFrameCount = 45;
		const frameRate = 20;
		let currentFrame = 0;

		let spriteSheetInterface = {};
		spriteSheetInterface.update = () => {
			currentFrame = (currentFrame + 1) % totalFrameCount;
		};
		spriteSheetInterface.render = (x, y, width, height) => {
			context.drawImage(image, currentFrame * frameWidth, 0, frameWidth, frameHeight, x, y, width, height);
		};

		return spriteSheetInterface;
	};

	const fireSprites = [];

	(function() {
		for (let i = 0; i < 200; i++) {
			fireSprites.push({
				x: 0,
				y: 0,
				spriteSheet: FireSpriteSheet()
			});
		}
	})();

	const renderPlay = () => {
		const gameLine = "PLAY";
		let fontSize = 8;
		let totalWidth = getTextLength(gameLine, fontSize) + 60;
		let startX = (canvas.width - totalWidth) / 2.0;
		const startY = (0.8 * canvas.height);
		draw(canvas, context, gameLine, fontSize, startX + 60, startY);

		let x = startX;
		let y = startY;
		context.fillStyle = "white";
		context.beginPath();
		context.moveTo(x, y);
		x += 40;
		y += 20;
		context.lineTo(x, y);
		x -= 40;
		y += 20;
		context.lineTo(x, y);
		context.fill();

		// Create the button.
		clickableRectangles.push([
			{x: startX, y: startY},
			{x: startX + 60 + getTextLength(gameLine, fontSize), y: startY + 80},
			() => { pageNumber = 1; renderStoryStartTime = new Date(); }
			]
		);
	};

    const renderResume = () => {
        const gameLine = "RESUME LEVEL " + Math.min(level, numLevels);
        let fontSize = 8;
        let totalWidth = getTextLength(gameLine, fontSize) + 60;
        let startX = (canvas.width - totalWidth) / 2.0;
        const startY = (0.8 * canvas.height);
        draw(canvas, context, gameLine, fontSize, startX + 60, startY);

        let x = startX;
        let y = startY;
        context.fillStyle = "white";
        context.beginPath();
        context.moveTo(x, y);
        x += 40;
        y += 20;
        context.lineTo(x, y);
        x -= 40;
        y += 20;
        context.lineTo(x, y);
        context.fill();

        // Create the button.
        clickableRectangles.push([
                {x: startX, y: startY},
                {x: startX + 60 + getTextLength(gameLine, fontSize), y: startY + 80},
                () => { pageNumber = GAME_START; changeGameStarted(true); }
            ]
        );
    };

	const renderTitle = () => {
	    let startY = 0.2 * canvas.height;
		const gameLine1 = "MEGA FAUNA";
		let gameLine1FontSize = 20;
		let startX1 = (canvas.width - getTextLength(gameLine1, gameLine1FontSize)) / 2.0;
		let blocks = getPositions(canvas, context, gameLine1, gameLine1FontSize, startX1, startY);
		for (let i = 0; i < blocks.length; i++) {
			fireSprites[i].x = blocks[i].x;
			fireSprites[i].y = blocks[i].y;
			fireSprites[i].spriteSheet.update();
			fireSprites[i].spriteSheet.render(fireSprites[i].x, fireSprites[i].y, gameLine1FontSize, gameLine1FontSize);
		}

		const gameLine2 = "NOT FOUND!";
		let gameLine2FontSize = 12;
		let startX2 = (canvas.width - getTextLength(gameLine2, gameLine2FontSize)) / 2.0;

		draw(canvas, context, gameLine2, gameLine2FontSize, startX2,startY + (6 * gameLine1FontSize));
	};

	const renderStory = () => {
		const story = [
			"This is 40,000 BC.",
			"",
			"Australia has been untouched for millennia by Humans.         ",
			"A new species called 'Homo Sapiens' has landed on this continent.        ",
			"They have almost immediately started threatening the existence of the",
			"ecosystem. They are driving the previously thriving megafauna,",
			"one that survived multiple ice ages, to extinction. Homo Sapiens",
			"are the only animals known to control an element of nature, Fire.            ",
			"",
			"This has become a bane to the local fauna.",
			"",
			"",
			"As the king of the forest, you have a responsibility to kill these",
			"aliens before they burn down the forests beyond repair!"
		]

		context.fillStyle = "white";
		context.font = '20px Courier New';
		let x = 20, y = 100;
		let remLength = (getTimeSince(renderStoryStartTime) / 80);
		for (let i = 0; i < story.length; i++) {
			if (remLength <= 0) continue;
			context.fillText(story[i].substring(0, remLength), x, y);
			y += 22;
			remLength -= story[i].length;
		}
	};

	const renderNext = () => {
	    const text = "NEXT";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - (2 * textLength);
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 25, y: y + 26},
                () => { pageNumber = 2; }
            ]
        );

        context.beginPath();
        context.lineWidth = 5;
        x += (textLength + 10);
        context.moveTo(x, y);
        x += 15;
        y += 13;
        context.lineTo(x, y);
        x -= 15;
        y += 13;
        context.lineTo(x, y);
        context.strokeStyle = "white";
        context.stroke();
    };

    const renderSkip = () => {
        const text = "SKIP";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - (4 * textLength);
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 25, y: y + 26},
                () => { renderStoryStartTime = 0; }
            ]
        );
    };

    const renderControls = () => {
        const text = "CONTROLS";
        let fontSize = 12;
        const textLength = getTextLength(text, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, text, fontSize, x, y);

        const controls = [
            "WASD  - Move",
            "",
            "K     - Kill humans in range",
            "Space - Extinguish Fire",
			"Esc   - Pause",
            "M     - Mute",
			"",
			"Goal: Find and kill all humans in the dark before 75% of the forest is burnt."
        ];
        context.font = '25px Courier New';
        y = 230;
        x = 80;
        for (let i = 0; i < controls.length; i++) {
            context.fillText(controls[i], x, y);
            y += 28;
        }
    };

    const renderStart = () => {
        const text = "START LEVEL 1";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 80;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength + 80, y: y + 30},
                () => { pageNumber = GAME_START; changeGameStarted(true); }
            ]
        );

        context.beginPath();
        context.lineWidth = 5;
        x += (textLength + 20);
        context.moveTo(x, y);
        x += 15;
        y += 13;
        context.lineTo(x, y);
        x -= 15;
        y += 13;
        context.lineTo(x, y);
        context.strokeStyle = "white";
        context.stroke();
    };

    const renderGameOver = () => {
        const gameOver = "GAME OVER!";
        let fontSize = 14;
        const textLength = getTextLength(gameOver, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, gameOver, fontSize, x, y, "#FF2400");

        const deathReason = gameOverReason;
        const fontSize2 = 5;
        const textLength2 = getTextLength(deathReason, fontSize2);
        x = (canvas.width - textLength2) / 2;
        y = 50 + 120;
        draw(canvas, context, deathReason, fontSize2, x, y, "white");
    };

    const renderGameWon = () => {
        let gameOver = "YOU SAVED THE FOREST!";
        if (level === (numLevels + 1)) gameOver = "YOU FINISHED THE GAME!";
        let fontSize = 14;
        const textLength = getTextLength(gameOver, fontSize);
        let x = (canvas.width - textLength) / 2;
        let y = 50;
        draw(canvas, context, gameOver, fontSize, x, y, "#0DB50D");
    };

    const renderHome = () => {
        const text = "HOME";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 30},
                () => { pageNumber = 0; }
            ]
        );
    };

    const renderRetry = () => {
        const text = "RETRY";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
            {x, y},
            {x: x + textLength, y: y + 30},
            () => { pageNumber = GAME_START; changeGameStarted(true);}    
        ]);
    };

    const renderNextLevel = () => {
        const text = "NEXT LEVEL";
        let fontSize = 5;
        const textLength = getTextLength(text, fontSize);
        let x = canvas.width - textLength - 50;
        let y = canvas.height - (10 * fontSize);
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 30},
                () => { pageNumber = GAME_START; changeGameStarted(true);}
            ]
        );
    };

    const renderPauseButtons = () => {
        let text = "HOME";
        let fontSize = 8;
        let textLength = getTextLength(text, fontSize);
        let x = (canvas.width / 4) - (textLength / 2);
        let y = (canvas.height / 2) - 20;
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 40},
                () => { pageNumber = 0; changeGameStarted(false);}
            ]
        );

        text = "RESTART";
        fontSize = 8;
        textLength = getTextLength(text, fontSize);
        x = (3 * canvas.width / 4) - (textLength / 2);
        y = (canvas.height / 2) - 20;
        draw(canvas, context, text, fontSize, x, y);

        clickableRectangles.push([
                {x, y},
                {x: x + textLength, y: y + 40},
                () => { pageNumber = GAME_START; changeGameStarted(true);}
            ]
        );

        text = "WASD - Move, K - Kill, Space - Extinguish, Esc - Pause/Resume"
        fontSize = 2;
        x = (canvas.width / 2);
        y += 150;
        context.fillStyle = 'white';
        context.font = '20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, x, y);

        text = "Tip: " + tip;
        fontSize = 2;
        x = (canvas.width / 2);
        y += 30;
        context.fillStyle = 'white';
        context.font = '20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, x, y);
    };

    const renderGameFinished = () => {

    };

    canvas.addEventListener('mousemove', e => {
		let isCursorPointer = false;
		clickableRectangles.forEach((rect) => {
			if ((rect[0].x <= e.offsetX) && (rect[0].y <= e.offsetY)
				&& (rect[1].x >= e.offsetX) && (rect[1].y >= e.offsetY)) {
				isCursorPointer = true;
			}
		});

		if (isCursorPointer) {
			document.getElementById("title").style.cursor = "pointer";
		} else {
			document.getElementById("title").style.cursor = "default";
		}
	});

	canvas.addEventListener("click", e => {
		let handler;
		clickableRectangles.forEach((rect) => {
			if ((rect[0].x <= e.offsetX) && (rect[0].y <= e.offsetY)
				&& (rect[1].x >= e.offsetX) && (rect[1].y >= e.offsetY)) {
				handler = rect[2];
			}
		});

		if (handler) handler();
	});

	titleInterface.setLevelWon = () => {
        pageNumber = 4;
    };

    titleInterface.setLevelLost = (reason) => {
        pageNumber = 3;
        gameOverReason = reason;
    };

    titleInterface.pause = () => {
        if (pageNumber === GAME_START) {
            tip = tips[randomIntFromInterval(0, tips.length - 1)];
            pageNumber = 5;
        }
    };

    titleInterface.resume = () => {
        if (pageNumber === 5) {
            pageNumber = GAME_START;
        }
    };

	titleInterface.update = (currentLevel) => {
        level = currentLevel;
    };

	titleInterface.render = () => {
	    if (pageNumber !== GAME_START) {
            clickableRectangles = [];
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
            if (pageNumber === 0) {
                // Title page
                renderTitle();
                if (level === 1) {
                    renderPlay();
                } else {
                    renderResume();
                }
            } else if (pageNumber === 1) {
                // Story page
                renderStory();
                if (renderStoryStartTime !== 0) {
                    renderSkip();
                }
                renderNext();
            } else if (pageNumber === 2) {
                // Controls page
                renderControls();
                renderStart();
            } else if (pageNumber === 3) {
                // Game over
                renderGameOver();
                renderRetry();
                renderHome();
            } else if (pageNumber === 4) {
                // Level won
                renderGameWon();
                if (level !== (numLevels + 1)) {
                    renderNextLevel();
                }
                renderHome();
            } else if (pageNumber === 5) {
                renderPauseButtons();
            }
        } else if (level === 7) {
            renderGameFinished();
        } else {
        	context.clearRect(0, 0, canvas.width, canvas.height);
        }
	};

	return titleInterface;
};
