const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

// Player ship
const player = {
  x: w / 2,
  y: h - 60,
  width: 30,
  height: 40,
  speed: 5,
  moveLeft: false,
  moveRight: false
};

let rocks = [];
let lastRockTime = 0;
let rockInterval = 800;
let gameOver = false;
let score = 0;

// Keyboard input
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") player.moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d") player.moveRight = true;

  if (gameOver && e.key === "Enter") resetGame();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") player.moveLeft = false;
  if (e.key === "ArrowRight" || e.key === "d") player.moveRight = false;
});

// Touch input
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);
canvas.addEventListener("touchend", () => {
  player.moveLeft = false;
  player.moveRight = false;
});

function handleTouch(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;

  player.moveLeft = x < w / 2;
  player.moveRight = x > w / 2;
}

function spawnRock() {
  const size = 20 + Math.random() * 30;
  rocks.push({
    x: Math.random() * (w - size),
    y: -size,
    size,
    speed: 2 + Math.random() * 3
  });
}

function rectCircleColliding(px, py, pw, ph, cx, cy, cr) {
  const testX = Math.max(px, Math.min(cx, px + pw));
  const testY = Math.max(py, Math.min(cy, py + ph));
  const distX = cx - testX;
  const distY = cy - testY;
  return Math.sqrt(distX * distX + distY * distY) <= cr;
}

function resetGame() {
  rocks = [];
  gameOver = false;
  score = 0;
  rockInterval = 800;
  player.x = w / 2;
}

function update(delta, time) {
  if (gameOver) return;

  // Movement
  if (player.moveLeft) player.x -= player.speed;
  if (player.moveRight) player.x += player.speed;

  // Keep inside screen
  player.x = Math.max(0, Math.min(player.x, w - player.width));

  // Spawn rocks
  if (time - lastRockTime > rockInterval) {
    spawnRock();
    lastRockTime = time;
    rockInterval = Math.max(330, rockInterval - 6);
  }

  // Move rocks & collision
  for (let i = rocks.length - 1; i >= 0; i--) {
    const r = rocks[i];
    r.y += r.speed;

    if (rectCircleColliding(
      player.x, player.y,
      player.width, player.height,
      r.x + r.size / 2, r.y + r.size / 2, r.size / 2
    )) {
      gameOver = true;
    }

    if (r.y > h + r.size) {
      rocks.splice(i, 1);
      score++;
    }
  }
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  // Stars
  ctx.fillStyle = "white";
  for (let i = 0; i < 40; i++) {
    ctx.fillRect((i * 53) % w, (i * 97) % h, 1, 1);
  }

  // Player ship
  ctx.fillStyle = "#0ff";
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Rocks
  ctx.fillStyle = "#888";
  for (const r of rocks) {
    ctx.beginPath();
    ctx.arc(r.x + r.size / 2, r.y + r.size / 2, r.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Score
  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 20);

  // Game over
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "26px sans-serif";
    ctx.fillText("GAME OVER", w / 2 - 80, h / 2);
    ctx.font = "16px sans-serif";
    ctx.fillText("Press Enter to restart", w / 2 - 95, h / 2 + 30);
  }
}

let lastTime = 0;
function loop(t) {
  const delta = t - lastTime;
  lastTime = t;
  update(delta, t);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
