const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.5;
let jumpForce = -12;
let speed = 4;
let score = 0;
let isGameOver = false;
let frameCount = 0;

const playerImg = new Image();
playerImg.src = "assets/player.png";

const player = {
  x: 100,
  y: canvas.height / 2,
  width: 60,
  height: 60,
  velocityY: 0
};

let obstacles = [];

function spawnObstacle() {
  const gap = 160;
  const minHeight = 50;
  const maxHeight = canvas.height - gap - 100;
  const topHeight = Math.floor(minHeight + Math.random() * (maxHeight - minHeight));

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
  ctx.fillStyle = "#228B22";
  ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
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
  score++;
  if (score > 100 && score % 200 === 0) speed += 1;

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);

  // Player
  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.velocityY = 0;
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
