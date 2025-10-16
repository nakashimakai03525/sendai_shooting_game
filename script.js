const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');

const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;

let playerX = player.offsetLeft;
const playerSpeed = 10;
let score = 0;
let gameOver = false;

const bullets = [];
const enemies = [];
const enemyBullets = [];

let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function createEnemy() {
    if (gameOver) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.textContent = '🐮'; // 仙台名物
    const x = Math.random() * (gameWidth - 40);
    const y = -40;
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;
    gameContainer.appendChild(enemy);
    enemies.push({ element: enemy, x, y, speedY: 2, speedX: Math.random() > 0.5 ? 2 : -2 });
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    const x = playerX + player.offsetWidth / 2 - 5;
    const y = player.offsetTop;
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;
    gameContainer.appendChild(bullet);
    bullets.push({ element: bullet, x, y });
}

function createEnemyBullet(enemy) {
    if (gameOver) return;
    const bullet = document.createElement('div');
    bullet.className = 'enemy-bullet';
    const x = enemy.x + enemy.element.offsetWidth / 2 - 5;
    const y = enemy.y + enemy.element.offsetHeight;
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;
    gameContainer.appendChild(bullet);
    enemyBullets.push({ element: bullet, x, y });
}

function update() {
    if (gameOver) return;

    // Player movement
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['ArrowRight'] && playerX < gameWidth - player.offsetWidth) {
        playerX += playerSpeed;
    }
    player.style.left = `${playerX}px`;

    // Player shoot
    if (keys[' '] || keys['Spacebar']) {
        // Add a cooldown to prevent too many bullets
        if (!keys.fired) {
            createBullet();
            keys.fired = true;
            setTimeout(() => {
                keys.fired = false;
            }, 200);
        }
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= 15;
        if (bullet.y < 0) {
            bullet.element.remove();
            bullets.splice(i, 1);
        } else {
            bullet.element.style.top = `${bullet.y}px`;
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speedY;
        enemy.x += enemy.speedX;

        if (enemy.x <= 0 || enemy.x >= gameWidth - 40) {
            enemy.speedX *= -1;
        }

        if (enemy.y > gameHeight) {
            enemy.element.remove();
            enemies.splice(i, 1);
        } else {
            enemy.element.style.top = `${enemy.y}px`;
            enemy.element.style.left = `${enemy.x}px`;
        }
        
        // Enemy shoot
        if (Math.random() < 0.01) {
            createEnemyBullet(enemy);
        }
    }
    
    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.y += 7;
        if (bullet.y > gameHeight) {
            bullet.element.remove();
            enemyBullets.splice(i, 1);
        } else {
            bullet.element.style.top = `${bullet.y}px`;
        }
    }

    // Collision detection
    // Bullet -> Enemy
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const enemy = enemies[j];
            if (bullet && enemy && isColliding(bullet.element, enemy.element)) {
                bullet.element.remove();
                bullets.splice(i, 1);
                enemy.element.remove();
                enemies.splice(j, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        }
    }
    
    // Enemy Bullet -> Player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (bullet && isColliding(bullet.element, player)) {
            bullet.element.remove();
            enemyBullets.splice(i, 1);
            endGame();
        }
    }
    
    // Enemy -> Player
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy && isColliding(enemy.element, player)) {
            enemy.element.remove();
            enemies.splice(i, 1);
            endGame();
        }
    }


    requestAnimationFrame(update);
}

function isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.left > bRect.right ||
        aRect.right < bRect.left
    );
}

function endGame() {
    gameOver = true;
    gameOverDisplay.classList.remove('hidden');
    player.style.display = 'none';
}

// Start game
setInterval(createEnemy, 1000);
update();
