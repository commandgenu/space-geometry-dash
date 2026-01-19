// ゲームエンジンのコアクラス
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = 1200;
        this.height = canvas.height = 600;

        // ゲーム状態
        this.state = 'waiting'; // waiting, playing, gameover
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.frameCount = 0;
        this.baseSpeed = 7.5; // ゲームの基本スピード
        this.audioManager = new AudioManager();

        // ゲームオブジェクト
        this.terrain = new Terrain(this.width, this.height);
        this.player = new Player(150, this.height / 2);
        this.obstacleManager = new ObstacleManager(this.width, this.height, this.audioManager);
        this.obstacleManager.setTerrain(this.terrain);
        this.particleSystem = new ParticleSystem();
        this.powerUpManager = new PowerUpManager(this.width, this.height);
        this.powerUpManager.setTerrain(this.terrain);
        this.powerUpManager.setObstacleManager(this.obstacleManager);

        // 背景の星
        this.backgroundStars = [];
        this.initBackgroundStars();

        // アニメーションフレーム
        this.animationId = null;
    }

    initBackgroundStars() {
        // 背景の静的な星を生成
        for (let i = 0; i < 100; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.05 + 0.02
            });
        }
    }

    start(difficulty = 'normal', isDemo = false) {
        this.state = 'playing';
        this.paused = false; // ポーズ状態リセット
        this.isDemo = isDemo; // デモモードフラグ
        // ポーズメニューを確実に隠す
        document.getElementById('pauseMenu').classList.add('hidden');

        this.score = 0;
        this.frameCount = 0;
        this.terrain.reset();
        this.player = new Player(150, this.height / 2);
        this.obstacleManager.reset();
        this.obstacleManager.setDifficulty(difficulty); // 難易度設定
        this.obstacleManager.setTerrain(this.terrain);
        this.particleSystem.clear();
        this.powerUpManager.reset();
        this.powerUpManager.setTerrain(this.terrain);
        this.gameLoop();
    }

    gameLoop() {
        if (this.state !== 'playing') return;

        if (!this.paused) {
            this.update();
            this.draw();
        }

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    togglePause() {
        if (this.state !== 'playing') return;
        this.paused = !this.paused;

        const pauseMenu = document.getElementById('pauseMenu');
        if (this.paused) {
            pauseMenu.classList.remove('hidden');
        } else {
            pauseMenu.classList.add('hidden');
        }
    }

    update() {
        this.frameCount++;

        // デモモード（オートパイロット）
        if (this.isDemo) {
            this.autoPilot();
        }

        // 地形更新
        this.terrain.update();

        // パワーアップの速度倍率を取得
        const speedMultiplier = this.powerUpManager.getSpeedMultiplier();

        // 現在の実効速度
        const currentSpeed = this.baseSpeed * speedMultiplier;

        // 全オブジェクトのスピードを同期
        this.terrain.speed = currentSpeed;
        this.obstacleManager.speed = currentSpeed;
        this.powerUpManager.speed = currentSpeed;

        // 丸いもの（ジャンプ雲）接触フラグをリセット
        this.player.touchingJumpCloud = false;

        // プレイヤー更新（地形を渡す）
        this.player.update(this.height, this.terrain);

        // 障害物更新
        this.obstacleManager.update(speedMultiplier);

        // パワーアップ更新
        this.powerUpManager.update(speedMultiplier);

        // パーティクル更新
        this.particleSystem.update();

        // トレイルエフェクト追加
        if (this.frameCount % 3 === 0) {
            this.particleSystem.addTrail(this.player.x - 15, this.player.y, 2);
        }

        // パワーアップの取得判定
        const collectedPowerUp = this.powerUpManager.checkCollision(this.player.getBounds());
        if (collectedPowerUp) {
            // 取得エフェクト
            this.particleSystem.addExplosion(collectedPowerUp.x, collectedPowerUp.y, 15, collectedPowerUp.color1);
        }

        // 衝突判定（無敵状態でない場合、かつデモモードでない場合）
        if (!this.powerUpManager.isInvincible() && !this.isDemo) {
            this.checkCollisions();
        }

        // スコア更新（デモモードではスコア加算なし）
        if (this.frameCount % 10 === 0 && !this.isDemo) {
            this.score++;
        }

        // スコア230でゲームクリア（タイトルへ戻る）
        if (this.score >= 230) {
            this.returnToTitle();
            return;
        }

        // 背景の星を更新
        this.updateBackgroundStars();
    }

    // デモモード用の簡易オートパイロット
    autoPilot() {
        // 前方の障害物を検知
        const lookAheadDist = 200;
        const obstacles = this.obstacleManager.getObstacles();

        // 直近の危険な障害物を探す
        const danger = obstacles.find(obs => {
            const dist = obs.x - this.player.x;
            return dist > 0 && dist < lookAheadDist;
        });

        // 障害物が見つかったらジャンプ
        // 実際にはより高度な判定が必要だが、デモ（下見）なので
        // 「障害物が見えたらとりあえず飛ぶ」くらいの単純動作でOK
        // 死なない（無敵）なので、失敗しても進み続ける
        if (danger) {
            if (!this.player.isJumping) {
                this.player.jump();
            } else if (this.player.velocity > 0 && this.player.jumpCount < 2) {
                // 落下中でまだ2段ジャンプできるなら飛ぶ
                this.player.jump();
            }
        }

        // 穴（地形の切れ目や低い場所）も本来は避けるべきだが、今回は省略
    }

    returnToTitle() {
        if (this.audioManager) this.audioManager.stopMusic();
        this.state = 'waiting';

        // ベストスコア更新チェック
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }

        // フェードアウトなどの演出があれば良いが、即座に戻る
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');

        // ベストスコア表示更新
        document.getElementById('bestScore').textContent = this.bestScore;
    }

    updateBackgroundStars() {
        this.backgroundStars.forEach(star => {
            star.x -= star.speed;
            star.twinkle += star.twinkleSpeed;

            // 画面外に出たら右端に戻す
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
        });
    }

    checkCollisions() {
        const playerBounds = this.player.getBounds();
        const obstacles = this.obstacleManager.getObstacles();
        // 現在の移動速度を取得（すり抜け防止用）
        const currentSpeed = this.obstacleManager.speed || 0;

        for (let obstacle of obstacles) {
            const obstacleBounds = obstacle.getBounds();

            if (this.isColliding(playerBounds, obstacleBounds, currentSpeed)) {
                // ジャンプ台の判定
                if (obstacle.type === 'jump_pad') {
                    // 足元がジャンプ台の上部付近にあるかチェック
                    const playerBottom = playerBounds.y + playerBounds.height;
                    const obstacleTop = obstacleBounds.y;

                    // 上からの接触ならジャンプ発動（判定を少し緩く）
                    if (this.player.velocity >= 0 && playerBottom >= obstacleTop - 20 && playerBottom <= obstacleTop + 40) {
                        this.player.superJump();
                        this.particleSystem.addExplosion(this.player.x, this.player.y + this.player.height / 2, 10, '#ffff00');
                    }

                    // ジャンプ台はいかなる方向から当たってもゲームオーバーにはしない
                    continue;
                }

                // 丸いもの（ジャンプ雲）の判定
                if (obstacle.type === 'jump_cloud') {
                    // 触れているフラグを立てる（ジャンプキーを押すと空中ジャンプ可能になる）
                    this.player.touchingJumpCloud = true;
                    // ゲームオーバーにはしない
                    continue;
                }

                // 乗れる障害物の判定
                if (obstacle.isRideable) {

                    // 偽物の壁(fake_wall)の特殊判定: 真ん中以外はゲームオーバー
                    if (obstacle.type === 'fake_wall') {
                        // 中央1/3の幅を計算
                        const zoneWidth = obstacleBounds.width / 3;
                        const zoneStart = obstacleBounds.x + zoneWidth; // 左から1/3
                        const zoneEnd = obstacleBounds.x + zoneWidth * 2; // 左から2/3

                        // プレイヤーの左右端
                        const pLeft = playerBounds.x;
                        const pRight = playerBounds.x + playerBounds.width;

                        // プレイヤー全体が、安全ゾーンからはみ出している（= 危険ゾーンに触れている）かどうか
                        // プレイヤーの中心が安全ゾーンに入っていればセーフ、とする甘めの判定にする
                        const pCenter = pLeft + playerBounds.width / 2;

                        if (pCenter < zoneStart || pCenter > zoneEnd) {
                            // 真ん中以外に触れた -> 即死
                            this.gameOver();
                            return;
                        }
                    }

                    // プレイヤーの下端
                    const playerBottom = playerBounds.y + playerBounds.height;
                    // 障害物の上端
                    const obstacleTop = obstacleBounds.y;

                    // 許容範囲
                    const tolerance = 30 + Math.abs(this.player.velocity);

                    // プレイヤーが落下中（または静止）
                    const playerCenterY = playerBounds.y + playerBounds.height / 2;

                    // 横方向の重なりを確認
                    // すり抜け対策: 判定自体は拡張したが、着地判定の重なりチェックは
                    // 「現在位置」で行わないと、空中で吸い寄せられてしまう。
                    // ただし、高速移動で1フレームで通り過ぎる可能性もあるため、少しだけ緩和する。
                    const landingPadding = currentSpeed * 0.5; // 速度の半分くらい判定を甘くする

                    const overlapLeft = Math.max(playerBounds.x, obstacleBounds.x);
                    const overlapRight = Math.min(playerBounds.x + playerBounds.width, obstacleBounds.x + obstacleBounds.width + landingPadding);
                    const overlapWidth = overlapRight - overlapLeft;

                    // 1フレーム前のプレイヤー位置（Y座標）を推定
                    const prevY = this.player.y - this.player.velocity;
                    const prevBottom = prevY + playerBounds.height;

                    const isHighSpeedLanding = prevBottom <= obstacleTop + Math.abs(this.player.velocity) + 10;
                    const isLowSpeedLanding = playerBottom <= obstacleTop + 25;

                    // 小さなブロック（single_block）の場合は重なり判定を緩く
                    const minOverlap = obstacle.type === 'single_block' ? 1 : 4;

                    const isLanding = this.player.velocity >= 0 &&
                        (isHighSpeedLanding || isLowSpeedLanding) &&
                        overlapWidth > minOverlap;

                    if (!isLanding && this.player.velocity > 0 && isHighSpeedLanding) {
                        return; // 衝突を無視
                    }

                    if (isLanding) { // 着地成功
                        this.player.y = obstacleTop - this.player.height / 2;
                        this.player.velocity = 0;
                        this.player.isJumping = false;
                        this.player.jumpCount = 0;
                        continue;
                    }

                    // 右側面（通過後）の接触判定の緩和
                    // プレイヤーの中心が障害物の中心を超えている、または
                    // プレイヤーの左端が障害物の右端に近い（通り過ぎる寸前）場合
                    const playerCenterX = playerBounds.x + playerBounds.width / 2;
                    const obstacleCenterX = obstacleBounds.x + obstacleBounds.width / 2;

                    if (playerCenterX > obstacleCenterX) {
                        // 通過後の「後ろ足が引っかかる」ような接触は無視する
                        // 完全に埋まっていない限りはセーフとする
                        continue;
                    }
                }

                this.gameOver();
                return;
            }
        }
    }

    isColliding(playerRect, obstacleBounds, speed = 0) {
        // 円形衝突判定
        if (obstacleBounds.shape === 'circle') {
            return this.checkCircleCollision(playerRect, obstacleBounds, speed);
        }

        // 矩形衝突判定（すり抜け対策付き）
        // 障害物は左に動くので、判定ボックスの「右側」を移動量分だけ拡張する
        // 判定範囲: [x, x + width + speed]
        // これにより、このフレームで通過する領域全てを判定対象にする

        const effectiveWidth = obstacleBounds.width + speed;

        return playerRect.x < obstacleBounds.x + effectiveWidth &&
            playerRect.x + playerRect.width > obstacleBounds.x &&
            playerRect.y < obstacleBounds.y + obstacleBounds.height &&
            playerRect.y + playerRect.height > obstacleBounds.y;
    }

    checkCircleCollision(playerRect, circleBounds, speed = 0) {
        // 円の中心
        const circleX = circleBounds.centerX;
        const circleY = circleBounds.centerY;
        const radius = circleBounds.radius;

        // X軸方向のすり抜け対策:
        // 円もX軸方向に引き伸ばして（カプセル型のように）判定するのが理想だが、
        // 簡易的に「X軸の範囲チェック」を拡張し、Y軸が合致していれば衝突とする

        // 1. まず矩形として簡易判定（X軸拡張あり）
        // 円の外接矩形: [cx - r, cx + r] -> 幅 2r
        const circleLeft = circleX - radius;
        // 右端を速度分拡張
        const circleRight = circleX + radius + speed;
        const circleTop = circleY - radius;
        const circleBottom = circleY + radius;

        // 矩形レベルで重なっていなければ衝突なし
        if (playerRect.x >= circleRight ||
            playerRect.x + playerRect.width <= circleLeft ||
            playerRect.y >= circleBottom ||
            playerRect.y + playerRect.height <= circleTop) {
            return false;
        }

        // 2. 詳細判定
        // 通常の円判定を行う（現在位置での判定）
        // これだけだとやはりすり抜けるので、本来は線分と円の判定が必要。
        // ここでは「矩形判定で重なっていて、かつY軸が円の範囲内」なら
        // X軸の細かいカーブは無視して衝突としてしまう（プレイヤーに厳しい判定だが安全側に倒す）
        // ただし、角への衝突判定が少し甘くなる

        // 矩形の、円の中心に最も近い点を探す
        let testX = circleX;
        let testY = circleY;

        // X軸方向のクランプ（移動後の位置で判定）
        if (circleX < playerRect.x) {
            testX = playerRect.x;
        } else if (circleX > playerRect.x + playerRect.width) {
            testX = playerRect.x + playerRect.width;
        }

        // Y軸方向のクランプ
        if (circleY < playerRect.y) {
            testY = playerRect.y;
        } else if (circleY > playerRect.y + playerRect.height) {
            testY = playerRect.y + playerRect.height;
        }

        const distX = circleX - testX;
        const distY = circleY - testY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        if (distance <= radius) {
            return true;
        }

        // すり抜け（Tunneling）チェック: 
        // 矩形判定では重なっているが、今の位置での円判定では外れている場合。
        // 障害物が通り過ぎた（円の中心がプレイヤーより左にある）なら、
        // 「通過中に当たっていたはず」とみなす
        if (circleX < playerRect.x && speed > 0) {
            // Y軸方向で重なっていれば衝突とみなす
            if (playerRect.y < circleBottom && playerRect.y + playerRect.height > circleTop) {
                return true;
            }
        }

        return false;
    }

    gameOver() {
        this.state = 'gameover';
        if (this.audioManager) this.audioManager.stopMusic();

        // 爆発エフェクト
        this.particleSystem.addExplosion(this.player.x, this.player.y, 30);

        // ベストスコア更新
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }

        // ゲームオーバー画面を表示
        setTimeout(() => {
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('bestScoreDisplay').textContent = this.bestScore;
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }, 500);
    }

    draw() {
        // 背景をクリア
        // 背景色を動的に変更
        const theme = this.obstacleManager.currentThemeColor || 'rgba(10, 14, 39, 0.3)';
        this.ctx.fillStyle = theme;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 背景の星を描画
        this.drawBackgroundStars();

        // 地形を描画
        this.terrain.draw(this.ctx);

        // 障害物を描画
        this.obstacleManager.draw(this.ctx);

        // パワーアップを描画
        this.powerUpManager.draw(this.ctx);

        // パーティクルを描画
        this.particleSystem.draw(this.ctx);

        // プレイヤーを描画（無敵状態の場合は点滅）
        if (this.powerUpManager.isInvincible()) {
            const blinkPhase = Math.floor(this.frameCount / 5) % 2;
            if (blinkPhase === 0) {
                this.ctx.globalAlpha = 0.5;
            }
        }
        this.player.draw(this.ctx);
        this.ctx.globalAlpha = 1.0;

        // アクティブな効果を描画
        this.drawActiveEffects();

        // スコアを更新
        document.getElementById('score').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
    }

    drawBackgroundStars() {
        this.backgroundStars.forEach(star => {
            this.ctx.save();

            // きらめき効果
            const twinkleAlpha = (Math.sin(star.twinkle) + 1) / 2;
            this.ctx.globalAlpha = star.opacity * twinkleAlpha;

            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#ffffff';

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawActiveEffects() {
        const effects = this.powerUpManager.getActiveEffects();
        if (effects.length === 0) return;

        const startX = 20;
        const startY = 60;
        const spacing = 150;

        effects.forEach((effect, index) => {
            const x = startX + index * spacing;
            const y = startY;

            // 背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(x, y, 140, 40);

            // 枠線
            let borderColor = '#ffffff';
            if (effect.type === 'speed_boost') borderColor = '#ff6b00';
            if (effect.type === 'slow_motion') borderColor = '#00d4ff';
            if (effect.type === 'invincible') borderColor = '#ffff00';

            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, 140, 40);

            // アイコンと名前
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(effect.name, x + 5, y + 18);

            // 残り時間バー
            const progress = effect.remaining / effect.duration;
            const barWidth = 130;
            const barHeight = 8;
            const barX = x + 5;
            const barY = y + 25;

            // バー背景
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            // バー本体
            this.ctx.fillStyle = borderColor;
            this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

            // 残り時間テキスト
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${(effect.remaining / 1000).toFixed(1)}s`, x + 135, y + 18);
        });
    }

    handleJump() {
        if (this.state === 'playing') {
            this.player.jump();
        }
    }
}
