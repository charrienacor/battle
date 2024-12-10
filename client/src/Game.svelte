<script>
  import { onMount } from "svelte";
  import p5 from "p5";
  import { generate } from "random-words";
  import Menu from "./Menu.svelte";
  import Score from "./Score.svelte";

  let myP5;
  let backMenu = false;
  let isHovering = false;
  let timerDuration = 30; 
  let timer; 
  let timerStarted = false; 
  let timerDone = false; 
  let finalScore = 0; 

  const game = (p) => {
    let backgroundImage;
    let tileSize = 100;
    let greenBoatFrames = [],
      greenCannonFrames = [],
      greenFireFrames = [],
      currentGreenBoatFrame = 0,
      currentGreenCannonFrame = 0,
      currentGreenFireFrame = 0;
    let blueBoatFrames = [],
      blueCannonFrames = [],
      blueFireFrames = [],
      currentBlueBoatFrame = 0,
      currentBlueCannonFrame = 0,
      currentBlueFireFrame = 0;
    let boatAnimationSpeed = 0.2;
    let words = generate({ exactly: 100, wordsPerString: 1, minLength: 5, maxLength: 10, formatter: (word) => word.toUpperCase() });
    let wordPositions = [];
    let fontSize = 32;
    let currentWordIndex = 0;
    let userInput = "";
    let currentWord = words[currentWordIndex];
    let backgroundOffsetX = 0;
    let wordCompleted = false;
    let score = 0;
    let blueBoatAlpha = 255;
    let fadeSpeed = 5;
    let blinkCount = 0;
    let myFont;

    p.preload = () => {
      myFont = p.loadFont("src/assets/fonts/VCR_OSD_MONO.ttf");

      // Draw water
      backgroundImage = p.loadImage("src/assets/bg/water-tile.png");

      // Draw green boat
      for (let i = 1; i <= 4; i++) {
        greenBoatFrames.push(
          p.loadImage(`src/assets/boats/boat1/Boat1_water_frame${i}.png`)
        );
      }
      for (let i = 1; i <= 4; i++) {
        greenCannonFrames.push(
          p.loadImage(`src/assets/cannons/cannon1/Cannon1_color1_${i}.png`)
        );
      }
      for (let i = 1; i <= 3; i++) {
        greenFireFrames.push(
          p.loadImage(`src/assets/fires/fire1/Fire1_${i}.png`)
        );
      }

      // Draw blue boat
      for (let i = 1; i <= 4; i++) {
        blueBoatFrames.push(
          p.loadImage(`src/assets/boats/boat2/Boat2_water_frame${i}.png`)
        );
      }
      for (let i = 1; i <= 3; i++) {
        blueCannonFrames.push(
          p.loadImage(`src/assets/cannons/cannon2/Cannon2_color1_${i}.png`)
        );
      }
      for (let i = 1; i <= 3; i++) {
        blueFireFrames.push(
          p.loadImage(`src/assets/fires/fire2/Fire2_${i}.png`)
        );
      }
    };

    p.setup = () => {
      p.createCanvas(800, 600);
      p.angleMode(p.DEGREES);

      timer = timerDuration;
      timerStarted = true;

      for (let i = 0; i < words.length; i++) {
        let startX, startY;
        let edge = p.floor(p.random(4));
        if (edge === 0) {
          startX = p.random(p.width);
          startY = 0;
        } else if (edge === 1) {
          startX = p.width;
          startY = p.random(p.height);
        } else if (edge === 2) {
          startX = p.random(p.width);
          startY = p.height;
        } else {
          startX = 0;
          startY = p.random(p.height);
        }
        wordPositions.push({ x: startX, y: startY });
      }
    };

    p.draw = () => {
      p.background(0);
      p.drawBackground();
      p.updateBackgroundOffset();
      p.displayScore();
      
      if (timerStarted && timer > 0) {
        timer -= p.deltaTime / 1000; 
        if (timer <= 0) {
          timer = 0;
          timerDone = true; 
          finalScore = score; 
          clearCanvas();
        }
      }

      p.drawTimer(); 
      p.drawGreenBoat();
      p.drawBlueBoat();
      p.drawWordsTowardsCenter();
      p.handleInput();
      p.drawBackButton();
    };

  p.drawTimer = () => {
    p.fill(255);
    p.textSize(32);
    p.textAlign(p.RIGHT, p.TOP);
    p.strokeWeight(3);
      p.stroke("black");
    p.textFont(myFont);
    p.text(`Time: ${Math.ceil(timer)}`, p.width - 25, 25); 
  };

    p.drawBackground = () => {
      for (let x = -tileSize; x < p.width + tileSize; x += tileSize) {
        for (let y = 0; y < p.height; y += tileSize) {
          p.image(
            backgroundImage,
            x + backgroundOffsetX,
            y,
            tileSize,
            tileSize
          );
        }
      }
    };

    p.updateBackgroundOffset = () => {
      backgroundOffsetX += 0.15;
      if (backgroundOffsetX >= tileSize) {
        backgroundOffsetX = 0;
      }
    };

    p.displayScore = () => {
      p.fill(0, 100);
      p.textSize(50);
      p.textAlign(p.CENTER, p.TOP);
      p.textFont(myFont);
      p.strokeWeight(2);
      p.stroke("black");
      const formattedScore = String(score).padStart(4, "0");
      p.text(formattedScore, p.width / 2 + 2, 22);
      p.fill(255);
      p.text(formattedScore, p.width / 2, 20);
    };

    p.drawBackButton = () => {
      p.fill(isHovering ? "green" : 255);
      p.textSize(32);
      p.textAlign(p.LEFT, p.TOP);
      p.strokeWeight(3);
      p.stroke("black");
      p.text("back", 25, 25);
      if (isHovering) {
        p.cursor(p.HAND);
      } else {
        p.cursor(p.ARROW);
      }
    };

    p.mouseMoved = () => {
      isHovering =
        p.mouseX >= 25 && p.mouseX <= 75 && p.mouseY >= 25 && p.mouseY <= 57;
    };

    p.mousePressed = () => {
      if (isHovering) {
        backMenu = true;
        clearCanvas();
      }
    };

    p.drawGreenBoat = () => {
      let targetWordPosition = wordPositions[currentWordIndex];
      let angleToWord = p.atan2(
        targetWordPosition.y - p.height / 2,
        targetWordPosition.x - p.width / 2
      );
      let blueBoatDistance = p.dist(
        wordPositions[currentWordIndex].x,
        wordPositions[currentWordIndex].y,
        p.width / 2,
        p.height / 2
      );
      let blink = blueBoatDistance < 200;

      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(angleToWord - 85);

      if (blink) {
        let alpha = p.sin(p.frameCount * 15) * 255;
        p.tint(255, alpha);
        blinkCount++;

        if (blinkCount >= 10) {
          if (blueBoatAlpha > 0) {
            blueBoatAlpha -= fadeSpeed;
          } else {
            currentWordIndex = (currentWordIndex + 1) % words.length;
            currentWord = words[currentWordIndex];
            userInput = "";
            wordCompleted = false;
            blueBoatAlpha = 255;
          }
        }
      } else {
        blinkCount = 0;
      }

      let boatWidth = greenBoatFrames[0].width;
      let boatHeight = greenBoatFrames[0].height;

      p.image(
        greenBoatFrames[p.floor(currentGreenBoatFrame)],
        -boatWidth / 2,
        -boatHeight / 2
      );
      currentGreenBoatFrame += boatAnimationSpeed;
      if (currentGreenBoatFrame >= greenBoatFrames.length) {
        currentGreenBoatFrame = 0;
      }

      p.image(
        greenCannonFrames[p.floor(currentGreenCannonFrame)],
        -boatWidth / 2 + 2,
        -boatHeight / 2 + 30
      );
      currentGreenCannonFrame += boatAnimationSpeed;
      if (currentGreenCannonFrame >= greenCannonFrames.length) {
        currentGreenCannonFrame = 0;
      }

      p.image(
        greenFireFrames[p.floor(currentGreenFireFrame)],
        -boatWidth / 2 + 30,
        -boatHeight / 2 + 135
      );
      currentGreenFireFrame += boatAnimationSpeed;
      if (currentGreenFireFrame >= greenFireFrames.length) {
        currentGreenFireFrame = 0;
      }

      p.pop();
    };

    p.drawBlueBoat = () => {
      let i = currentWordIndex;
      let targetWordPosition = wordPositions[i];
      let angleToWord = p.atan2(
        targetWordPosition.y - p.height / 2,
        targetWordPosition.x - p.width / 2
      );

      p.push();
      p.translate(targetWordPosition.x, targetWordPosition.y);
      p.rotate(angleToWord + 95);

      p.tint(255, blueBoatAlpha);

      let boatWidth = greenBoatFrames[0].width;
      let boatHeight = greenBoatFrames[0].height;

      p.image(
        blueBoatFrames[p.floor(currentBlueBoatFrame)],
        -boatWidth / 2 + 20,
        -boatHeight / 2 + 20
      );
      currentBlueBoatFrame += boatAnimationSpeed;
      if (currentBlueBoatFrame >= blueBoatFrames.length) {
        currentBlueBoatFrame = 0;
      }

      p.image(
        blueCannonFrames[p.floor(currentBlueCannonFrame)],
        -boatWidth / 2 + 20,
        -boatHeight / 2 + 40
      );
      currentBlueCannonFrame += boatAnimationSpeed;
      if (currentBlueCannonFrame >= blueCannonFrames.length) {
        currentBlueCannonFrame = 0;
      }

      p.image(
        blueFireFrames[p.floor(currentBlueFireFrame)],
        -boatWidth / 2 + 54,
        -boatHeight / 2 + 135
      );
      currentBlueFireFrame += boatAnimationSpeed;
      if (currentBlueFireFrame >= blueFireFrames.length) {
        currentBlueFireFrame = 0;
      }

      p.pop();
    };

    p.drawWordsTowardsCenter = () => {
      p.push();
      p.translate(p.width / 2, p.height / 2);

      let i = currentWordIndex;
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont("monospace");
      p.textSize(fontSize);

      if (!wordCompleted) {
        for (var j = 0; j < currentWord.length; j++) {
          p.fill(0, 0, 0, 100);

          let rectX =
            wordPositions[i].x -
            p.width / 2 +
            (j * fontSize) / 2 -
            fontSize / 4;
          let rectY = wordPositions[i].y - p.height / 2 - fontSize / 2;
          let rectWidth = fontSize * 0.5;
          let rectHeight = fontSize;

          p.rect(rectX, rectY, rectWidth, rectHeight);

          let textX = rectX + rectWidth / 2;
          let textY = rectY + rectHeight / 2 + 2;

          if (userInput[j] === currentWord[j]) {
            p.fill(0, 255, 0);
          } else {
            p.fill(255);
          }

          p.text(currentWord[j], textX, textY);
        }
        let centerX = p.width / 2;
        let centerY = p.height / 2;
        let dirX = centerX - wordPositions[i].x;
        let dirY = centerY - wordPositions[i].y;
        let distance = p.dist(
          wordPositions[i].x,
          wordPositions[i].y,
          centerX,
          centerY
        );

        if (distance > 1) {
          wordPositions[i].x += (dirX / distance) * 1;
          wordPositions[i].y += (dirY / distance) * 1;
        }
      } else {
        if (blueBoatAlpha > 0) {
          blueBoatAlpha -= fadeSpeed;
        } else {
          currentWordIndex = (currentWordIndex + 1) % words.length;
          currentWord = words[currentWordIndex];
          userInput = "";
          wordCompleted = false;
          blueBoatAlpha = 255;
        }
      }

      p.pop();
    };

    p.handleInput = () => {
      if (p.keyIsPressed) {
        var typedChar = String.fromCharCode(p.keyCode);

        if (
          typedChar.match(/[a-zA-Z]/) &&
          userInput.length < currentWord.length
        ) {
          if (typedChar === currentWord[userInput.length]) {
            userInput += typedChar;

            if (userInput.length === currentWord.length) {
              if (userInput === currentWord) {
                score++;
                wordCompleted = true;
                blueBoatAlpha -= fadeSpeed;
              }
            }
          }
        }
      }
    };
  };

  const clearCanvas = () => {
    if (myP5) {
      myP5.remove();
      myP5 = null;
    }
  };

  onMount(() => {
    myP5 = new p5(game);
    return () => {
      clearCanvas();
    };
  });
</script>

{#if backMenu}
  <Menu />
{/if}

{#if timerDone}
  <Score {finalScore} />
{/if}
