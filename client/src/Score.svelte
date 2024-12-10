<script>
  import { onMount } from "svelte";
  import p5 from "p5";
  import Menu from "./Menu.svelte";

  let backMenu = false;
  let scoreCanvas;
  let isHovering = false; 
  export let finalScore;

  const menu = (p) => {
    let bg;
    let bgOffsetX = 0;
    let tileSize = 100;
    let gameFont;

    p.preload = () => {
      gameFont = p.loadFont("src/assets/fonts/VCR_OSD_MONO.ttf");
      bg = p.loadImage("src/assets/bg/water-tile.png");
    };

    p.setup = () => {
      p.createCanvas(800, 600);
      p.angleMode(p.DEGREES);
    };

    p.draw = () => {
      p.background(51);
      p.drawBackground();
      p.updateBackgroundOffset();
      p.drawBackButton(); 
      p.displayFinalScore(); 
    };

    p.drawBackground = () => {
      for (let x = -tileSize; x < p.width + tileSize; x += tileSize) {
        for (let y = 0; y < p.height; y += tileSize) {
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

    p.drawBackButton = () => {
      p.fill(isHovering ? "green" : "white"); 
      p.textSize(32);
      p.textAlign(p.LEFT, p.TOP);
      p.textFont(gameFont);
      p.strokeWeight(3);
      p.stroke("black");
      p.text("back", 25, 25); 
    };

    p.displayFinalScore = () => {
      p.fill("white"); 
      p.textSize(40); 
      p.textAlign(p.CENTER, p.CENTER); 
      p.textFont(gameFont); 
      p.strokeWeight(4);
      p.stroke("black");
      p.text("Your Final Score", p.width / 2, p.height / 2 - 20); 
      p.fill("yellow");
      p.textSize(80); 
      p.text(`${finalScore}`, p.width / 2, p.height / 2 + 40);
    };

    p.mouseMoved = () => {
      isHovering = p.mouseX >= 25 && p.mouseX <= 75 && p.mouseY >= 25 && p.mouseY <= 57;
      if (isHovering) {
        p.cursor(p.HAND);
      } else {
        p.cursor(p.ARROW); 
      }
    };

    p.mousePressed = () => {
      if (isHovering) {
        clearCanvas();
        backMenu = true; 
      }
    };
  };

  const clearCanvas = () => {
    if (scoreCanvas) {
      scoreCanvas.remove();
      scoreCanvas = null;
    }
  };

  onMount(() => {
    scoreCanvas = new p5(menu);
    return () => {
      clearCanvas();
    };
  });
</script>

{#if backMenu}
  <Menu />
{/if}