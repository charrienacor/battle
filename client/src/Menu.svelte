<script>
  import { onMount } from "svelte";
  import p5 from "p5";
  import Game from "./Game.svelte";

  let menuCanvas;
  let gameTitle = "BATTLESHIP\nBLITZ";
  const menuOptions = ["Start Game", "How to Play", "About the Game"];
  const colors = ['blue', 'orange', 'red', 'green'];
  let menuHoverIndex = -1;
  let showGame = false;
  let showInfoBox = false;
  let infoText = "";
  let letterColors = Array(gameTitle.length).fill(0);
  let currentColorIndex = 0;
  let currentLetterIndex = 0;
  let colorChangeSpeed = 30;
  let typingSpeed = 15;

  const menu = (p) => {
    let bg;
    let bgOffsetX = 0;
    let tileSize = 100;
    let gameFont;
    // green boat and cannon
    let gBFrames = [],
      gCFrames = [],
      currGBFrame = 0,
      currGCFrame = 0;
    // blue boat and cannon
    let bBFrames = [],
      bCFrames = [],
      currBBFrame = 0,
      currBCFrame = 0;
    let boatAnimationSpeed = 0.1;

    p.preload = () => {
      gameFont = p.loadFont("src/assets/fonts/VCR_OSD_MONO.ttf");

      // Draw water
      bg = p.loadImage("src/assets/bg/water-tile.png");

      // Draw green boat
      for (let i = 1; i <= 4; i++) {
        gBFrames.push(
          p.loadImage(`src/assets/boats/boat1/Boat1_water_frame${i}.png`)
        );
      }
      gCFrames.push(
        p.loadImage(`src/assets/cannons/cannon1/Cannon1_color1_3.png`)
      );

      // Draw blue boat
      for (let i = 1; i <= 4; i++) {
        bBFrames.push(
          p.loadImage(`src/assets/boats/boat2/Boat2_water_frame${i}.png`)
        );
      }
      bCFrames.push(
        p.loadImage(`src/assets/cannons/cannon2/Cannon2_color1_2.png`)
      );
    };

    p.setup = () => {
      p.createCanvas(800, 600);
      p.angleMode(p.DEGREES);
    };

    p.draw = () => {
      p.background(51);
      p.drawBackground();
      p.updateBackgroundOffset();
      p.displayTitle();
      p.displayMenu();
      p.drawGB(); // Green Boat
      p.drawBB(); // Blue Boat
      p.drawInfoBox();

      if (currentLetterIndex < gameTitle.length) {
                if (p.frameCount % typingSpeed === 0) {
                    letterColors[currentLetterIndex] = 1; 
                    currentLetterIndex++; 
                }
            }

            if (p.frameCount % colorChangeSpeed === 0) {
                currentColorIndex = (currentColorIndex + 1) % colors.length; 
            }
    };

    p.drawBackground = () => {
      for (var x = -tileSize; x < p.width + tileSize; x += tileSize) {
        for (var y = 0; y < p.height; y += tileSize) {
          p.image(bg, x + bgOffsetX, y, tileSize, tileSize);
        }
      }
    };

    p.updateBackgroundOffset = () => {
      bgOffsetX += 0.15;
      if (bgOffsetX >= tileSize) {
        bgOffsetX = 0;
      }
    };

    p.displayTitle = () => {
      const rectHeight = 32;
      const rectWidth = 32;

      p.textSize(32);
      p.textAlign(p.CENTER, p.TOP); 

      for (let i = 0; i < gameTitle.length; i++) {
          const x = p.width / 2 - (gameTitle.length * rectWidth) / 2 + i * rectWidth;
          const y = 190; 

          p.fill(0, 0, 0, 50); 
          p.stroke(0);
          p.rect(x, y, rectWidth, rectHeight);

          p.fill(letterColors[i] === 1 ? colors[currentColorIndex] : 'white');
          p.strokeWeight(3); 
          p.stroke('black'); 
          p.text(gameTitle[i], x + rectWidth / 2, y);
      }
  };

    p.displayMenu = () => {
      const menuSize = 28;
      const menuSpacing = 40;
      let isHovering = false;

      p.textFont(gameFont);
      p.textSize(menuSize);
      for (let i = 0; i < menuOptions.length; i++) {
        const yPosition = 270 + i * menuSpacing;

        // Check if the mouse is over the menu option
        if (
          p.mouseX > p.width / 2 - p.textWidth(menuOptions[i]) / 2 &&
          p.mouseX < p.width / 2 + p.textWidth(menuOptions[i]) / 2 &&
          p.mouseY > yPosition &&
          p.mouseY < yPosition + menuSize
        ) {
          menuHoverIndex = i;
          isHovering = true;
          p.fill("green");
        } else {
          p.fill(255);
        }
        // Draw main text
        p.fill(isHovering && menuHoverIndex === i ? "green" : 255);
        p.text(menuOptions[i], p.width / 2, yPosition);

        // Handle click events
        if (p.mouseIsPressed && isHovering) {
          if (menuHoverIndex === 0) {
            clearCanvas();
            showGame = true;
          } else if (menuHoverIndex === 1) {
            infoText = "Type as fast as you can to sink the enemy ship!";
            showInfoBox = true;
          } else if (menuHoverIndex === 2) {
            infoText =
              "Battleship Blitz is an action-packed naval \n warfare game to test your typing speed \n and race against time!";
            showInfoBox = true;
          }
        }
      }
      // Change the cursor based on hover state
      if (isHovering) {
        p.cursor(p.HAND);
      } else {
        p.cursor(p.ARROW);
      }
    };

    p.drawInfoBox = () => {
      const boxWidth = p.width + 5;
      const boxHeight = 100;
      const boxX = p.width / 2 - boxWidth / 2;
      const boxY = p.height - boxHeight - 50;

      if (showInfoBox) {
        p.fill(0, 150);
        p.stroke(128, 128, 0);
        p.rect(boxX, boxY, boxWidth, boxHeight);
        p.fill(255);
        p.textSize(25);
        p.stroke(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(infoText, p.width / 2, boxY + boxHeight / 2);

        if (
          p.mouseX > boxX &&
          p.mouseX < boxX + boxWidth &&
          p.mouseY > boxY &&
          p.mouseY < boxY + boxHeight
        ) {
          p.cursor(p.HAND);
        } else {
          p.cursor(p.ARROW);
        }
      }
    };

    p.drawGB = () => {
      let boatWidth = gBFrames[0].width;
      let boatHeight = gBFrames[0].height;

      p.push();
      p.translate(boatWidth / 2 + 100, p.height / 2);

      p.image(
        gBFrames[p.floor(currGBFrame)],
        -boatWidth / 2 + 20,
        -boatHeight / 2
      );
      currGBFrame += boatAnimationSpeed;
      if (currGBFrame >= gBFrames.length) {
        currGBFrame = 0;
      }

      p.image(
        gCFrames[p.floor(currGCFrame)],
        -boatWidth / 2 + 22,
        -boatHeight / 2 + 30
      );
      currGCFrame += boatAnimationSpeed;
      if (currGCFrame >= gCFrames.length) {
        currGCFrame = 0;
      }
      p.pop();
    };

    p.drawBB = () => {
      let boatWidth = bBFrames[0].width;
      let boatHeight = bBFrames[0].height;

      p.push();
      p.translate(p.width - boatWidth / 2 - 100, p.height / 2);

      p.image(
        bBFrames[p.floor(currBBFrame)],
        -boatWidth / 2 - 35,
        -boatHeight / 2
      );
      currBBFrame += boatAnimationSpeed;
      if (currBBFrame >= bBFrames.length) {
        currBBFrame = 0;
      }

      p.image(
        bCFrames[p.floor(currBCFrame)],
        -boatWidth / 2 - 33,
        -boatHeight / 2 + 30
      );
      currBCFrame += boatAnimationSpeed;
      if (currBCFrame >= bCFrames.length) {
        currBCFrame = 0;
      }

      p.pop();
    };

    p.mousePressed = () => {
      if (showInfoBox) {
        const boxWidth = 300;
        const boxHeight = 100;
        const boxX = p.width / 2 - boxWidth / 2;
        const boxY = p.height / 2 - boxHeight / 2;

        // Check if the click is outside the info box
        if (
          p.mouseX < boxX ||
          p.mouseX > boxX + boxWidth ||
          p.mouseY < boxY ||
          p.mouseY > boxY + boxHeight
        ) {
          showInfoBox = false;
        }
      }
    };
  };

  const clearCanvas = () => {
    if (menuCanvas) {
      menuCanvas.remove();
      menuCanvas = null;
    }
  };

  onMount(() => {
    menuCanvas = new p5(menu);
    return () => {
      clearCanvas();
    };
  });
</script>

{#if showGame}
  <Game />
{/if}
