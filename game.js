const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.5;
let jumpForce = -8;
let speed = 4;
let score = 0;
let hardModeStartFrame = null;
let isGameOver = false;
let frameCount = 0;

const playerImg = new Image();
playerImg.src = "assets/player.png";

const player = {
  x: 80,
  y: canvas.height / 2,
  width: 60,
  height: 60,
  velocityY: 0
};

let obstacles = [];

function spawnObstacle() {
  const gap = 200;
  const minHeight = 80;
  const maxHeight = canvas.height - gap - minHeight;

  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  obstacles.push({
    x: canvas.width,
    y: 0,
    width: 60,
    height: topHeight,
    top: true
  });

  obstacles.push({
    x: canvas.width,
    y: topHeight + gap,
    width: 60,
    height: canvas.height - (topHeight + gap),
    top: false
  });
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObstacle(obs) {
  const windowWidth = obs.width / 3 - 4;
  const windowHeight = 12;
  const windowPadding = 2;
  const windowSpacingY = 18;

  // Parede do prédio
  ctx.fillStyle = "#555";
  ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

  // Topo marrom
  ctx.fillStyle = "#8B4513";
  if (obs.top) {
    ctx.fillRect(obs.x, obs.y + obs.height - 10, obs.width, 10);
  } else {
    ctx.fillRect(obs.x, obs.y, obs.width, 10);
  }

  // Janelas azuis
  ctx.fillStyle = "#3cf";
  let startY = obs.top ? obs.y + 10 : obs.y + 10;
  let endY = obs.top ? obs.y + obs.height - 10 : obs.y + obs.height - 10;

  for (let y = startY; y + windowHeight < endY; y += windowSpacingY) {
    for (let i = 0; i < 3; i++) {
      let wx = obs.x + i * (windowWidth + windowPadding) + windowPadding;
      ctx.fillRect(wx, y, windowWidth, windowHeight);
    }
  }
  ctx.restore();
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "20px Arial";
  ctx.fillText("Clique ou aperte espaço para jogar novamente", canvas.width / 2, canvas.height / 2 + 20);
}

function update() {
  if (isGameOver) {
    drawGameOver();
    return;
  }

  frameCount++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Score e dificuldade
  if (frameCount % 10 === 0) score++;
  if (score % 50 === 0 && frameCount % 10 === 0) speed += 0.1;

  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 40, 60);

  // Exibe "Modo Difícil ativado" piscando por 10 segundos a partir de 400 pontos
  if (score >= 400 && hardModeStartFrame === null) {
    hardModeStartFrame = frameCount;
  }
  if (hardModeStartFrame !== null && frameCount - hardModeStartFrame < 600) {
    if (Math.floor((frameCount - hardModeStartFrame) / 30) % 2 === 0) {
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ff4444";
      ctx.textAlign = "center";
      ctx.fillText("Modo Difícil Ativado!", canvas.width / 2, 40);
    }
  }

  // Player
  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y + player.height > canvas.height) {
    isGameOver = true;
    drawGameOver();
    return;
  }

  if (player.y < 0) {
    player.y = 0;
    player.velocityY = 0;
  }

  drawPlayer();

  // Obstacles
  if (frameCount % 90 === 0) {
    spawnObstacle();
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= speed;
    drawObstacle(obs);

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      isGameOver = true;
    }
  }

  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  requestAnimationFrame(update);
}

function jump() {
  if (!isGameOver) {
    player.velocityY = jumpForce;
  } else {
    score = 0;
    speed = 4;
    player.y = canvas.height / 2;
    player.velocityY = 0;
    isGameOver = false;
    obstacles = [];
    frameCount = 0;
    hardModeStartFrame = null;
    update();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

document.addEventListener("mousedown", () => {
  jump();
});

update();
