const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const retryButton = document.getElementById('retry-button');
const specialAttackGauge = document.getElementById('special-attack-gauge');

const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;

let playerX = gameWidth / 2 - 25;
const playerSpeed = 10;
let score = 0;
let gameOver = false;
let animationFrameId;

let bullets = [];
let enemies = [];
let enemyBullets = [];
let items = [];

let keys = {};

let isRapidFireActive = false;
let isShieldActive = false;
let rapidFireTimeout;

let specialAttackGaugeValue = 0;
const specialAttackGaugeMax = 100;
let canUseSpecialAttack = false;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

retryButton.addEventListener('click', resetGame);

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

function createItem() {
    if (gameOver) return;
    const item = document.createElement('div');
    const itemType = Math.random() > 0.5 ? 'rapid-fire' : 'shield';
    item.className = `item ${itemType}`;
    item.textContent = itemType === 'rapid-fire' ? 'R' : 'S';

    const x = Math.random() * (gameWidth - 30);
    const y = -30;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    gameContainer.appendChild(item);
    items.push({ element: item, x, y, type: itemType });
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

function updateSpecialAttackGauge(value) {
    specialAttackGaugeValue = Math.min(specialAttackGaugeValue + value, specialAttackGaugeMax);
    const percentage = (specialAttackGaugeValue / specialAttackGaugeMax) * 100;
    specialAttackGauge.style.width = `${percentage}%`;
    if (specialAttackGaugeValue >= specialAttackGaugeMax) {
        canUseSpecialAttack = true;
        specialAttackGauge.style.backgroundColor = 'gold';
    }
}

function useSpecialAttack() {
    if (!canUseSpecialAttack) return;

    // 画面上のすべての敵を破壊
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].element.remove();
        enemies.splice(i, 1);
        score += 10; // 必殺技でもスコア加算
    }
    scoreDisplay.textContent = `Score: ${score}`;

    // ゲージをリセット
    specialAttackGaugeValue = 0;
    canUseSpecialAttack = false;
    specialAttackGauge.style.width = '0%';
    specialAttackGauge.style.backgroundColor = 'cyan';
}

function activateRapidFire() {
    isRapidFireActive = true;
    clearTimeout(rapidFireTimeout);
    rapidFireTimeout = setTimeout(() => {
        isRapidFireActive = false;
    }, 10000); // 10秒間
}

function activateShield() {
    isShieldActive = true;
    player.classList.add('shielded');
}

function deactivateShield() {
    isShieldActive = false;
    player.classList.remove('shielded');
}

function update() {
    if (gameOver) return;

    // Player movement
    if (keys['arrowleft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['arrowright'] && playerX < gameWidth - player.offsetWidth) {
        playerX += playerSpeed;
    }
    player.style.left = `${playerX}px`;

    // Player shoot
    if (keys[' '] || keys['spacebar']) {
        if (!keys.fired) {
            createBullet();
            keys.fired = true;
            setTimeout(() => {
                keys.fired = false;
            }, isRapidFireActive ? 50 : 200); // 連射アイテム効果
        }
    }
    
    // Special Attack
    if (keys['x']) {
        useSpecialAttack();
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

    // Update items
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += 3;
        if (item.y > gameHeight) {
            item.element.remove();
            items.splice(i, 1);
        } else {
            item.element.style.top = `${item.y}px`;
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
    // Player -> Item
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item && isColliding(item.element, player)) {
            if (item.type === 'rapid-fire') {
                activateRapidFire();
            } else if (item.type === 'shield') {
                activateShield();
            }
            item.element.remove();
            items.splice(i, 1);
        }
    }

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
                updateSpecialAttackGauge(20); // 敵を倒すとゲージが20増える
            }
        }
    }
    
    // Enemy Bullet -> Player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (bullet && isColliding(bullet.element, player)) {
            bullet.element.remove();
            enemyBullets.splice(i, 1);
            if (isShieldActive) {
                deactivateShield();
            } else {
                endGame();
            }
        }
    }
    
    // Enemy -> Player
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy && isColliding(enemy.element, player)) {
            enemy.element.remove();
            enemies.splice(i, 1);
            if (isShieldActive) {
                deactivateShield();
            } else {
                endGame();
            }
        }
    }

    animationFrameId = requestAnimationFrame(update);
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
    cancelAnimationFrame(animationFrameId);
    gameOverDisplay.classList.remove('hidden');
    player.style.display = 'none';
}

function resetGame() {
    // Reset variables
    score = 0;
    gameOver = false;
    playerX = gameWidth / 2 - 25;
    keys = {};
    specialAttackGaugeValue = 0;
    canUseSpecialAttack = false;
    isRapidFireActive = false;
    deactivateShield();
    clearTimeout(rapidFireTimeout);

    // Update displays
    scoreDisplay.textContent = 'Score: 0';
    gameOverDisplay.classList.add('hidden');
    player.style.display = 'block';
    player.style.left = `${playerX}px`;
    specialAttackGauge.style.width = '0%';
    specialAttackGauge.style.backgroundColor = 'cyan';


    // Clear all elements
    bullets.forEach(b => b.element.remove());
    enemies.forEach(e => e.element.remove());
    enemyBullets.forEach(b => b.element.remove());
    items.forEach(i => i.element.remove());
    bullets = [];
    enemies = [];
    enemyBullets = [];
    items = [];

    // Restart game loop
    update();
}

// Start game
setInterval(createEnemy, 1000);
setInterval(createItem, 15000); // 15秒ごとにアイテムを生成
update();
