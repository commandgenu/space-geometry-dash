// パワーアップアイテム・ゾーンクラス
class PowerUp {
    constructor(x, y, type, canvasHeight) {
        this.x = x;
        this.y = y;
        this.type = type; // 'speed_boost', 'slow_motion', 'invincible'
        this.canvasHeight = canvasHeight;
        this.collected = false;
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.floatPhase = Math.random() * Math.PI * 2;

        // タイプごとの形状設定
        if (this.type === 'speed_boost' || this.type === 'slow_motion') {
            this.isZone = true;
            this.width = 80; // ゲートの幅
            this.height = canvasHeight; // 画面全体の高さ
            this.y = 0; // 最上部から
        } else {
            this.isZone = false;
            this.width = 40;
            this.height = 40;
        }

        // タイプごとの色設定など
        this.setupType();
    }

    setupType() {
        switch (this.type) {
            case 'speed_boost':
                this.color1 = '#ff6b00';
                this.color2 = '#ffaa00';
                this.icon = '⚡';
                this.duration = 5000;
                this.name = 'SPEED ZONE';
                break;
            case 'slow_motion':
                this.color1 = '#00d4ff';
                this.color2 = '#0ff0fc';
                this.icon = '❄';
                this.duration = 6000;
                this.name = 'SLOW ZONE';
                break;
            case 'invincible':
                this.color1 = '#ffff00';
                this.color2 = '#ffd700';
                this.icon = '★';
                this.duration = 4000;
                this.name = '無敵';
                break;
        }
    }

    update(speedMultiplier = 1.0) {
        this.rotation += 0.05 * speedMultiplier;
        this.pulsePhase += 0.08 * speedMultiplier;

        if (!this.isZone) {
            this.floatPhase += 0.06 * speedMultiplier;
            this.y += Math.sin(this.floatPhase) * 0.5 * speedMultiplier;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        if (this.isZone) {
            this.drawZone(ctx);
        } else {
            this.drawItem(ctx);
        }
    }

    drawZone(ctx) {
        ctx.save();

        // パルス効果
        const alpha = (Math.sin(this.pulsePhase) * 0.2 + 0.3); // 0.1 ~ 0.5

        // グラデーションの柱
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.2, this.hexToRgba(this.color1, alpha));
        gradient.addColorStop(0.5, this.hexToRgba(this.color2, alpha + 0.2));
        gradient.addColorStop(0.8, this.hexToRgba(this.color1, alpha));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, 0, this.width, this.canvasHeight);

        // 境界線
        ctx.strokeStyle = this.hexToRgba(this.color2, 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, 0);
        ctx.lineTo(this.x + this.width / 2, this.canvasHeight);

        // 点線効果
        ctx.setLineDash([10, 15]);
        ctx.lineDashOffset = -this.pulsePhase * 20; // 流れるようなアニメーション
        ctx.stroke();

        // アイコン表示（中央と上下に）
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerY = this.canvasHeight / 2;
        ctx.fillText(this.icon, this.x + this.width / 2, centerY);
        ctx.fillText(this.icon, this.x + this.width / 2, centerY - 200);
        ctx.fillText(this.icon, this.x + this.width / 2, centerY + 200);

        // 文字列
        ctx.font = 'bold 16px Arial';
        ctx.save();
        ctx.translate(this.x + this.width / 2, centerY + 40);
        ctx.fillText(this.name, 0, 0);
        ctx.restore();

        ctx.restore();
    }

    drawItem(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // パルス効果
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        ctx.scale(pulse, pulse);

        // グロー効果
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color1;

        // 外側の円
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.color2);
        gradient.addColorStop(0.7, this.color1);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 内側の明るい円
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
        ctx.fill();

        // アイコン描画
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);

        // 回転するリング
        ctx.strokeStyle = this.color2;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // ヘルパー: HEX色をRGBAに変換
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getBounds() {
        if (this.isZone) {
            return {
                x: this.x,
                y: 0,
                width: this.width,
                height: this.canvasHeight
            };
        }
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// パワーアップマネージャークラス
class PowerUpManager {
    constructor(canvasWidth, canvasHeight) {
        this.powerUps = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.spawnTimer = 0;
        this.spawnInterval = 400; // 約8秒に1回
        this.speed = 7.5; // 基本スピードアップ (5.5 -> 7.5)
        this.terrain = null;

        // アクティブな効果
        this.activeEffects = {
            speed_boost: { active: false, endTime: 0 },
            slow_motion: { active: false, endTime: 0 },
            invincible: { active: false, endTime: 0 }
        };
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    setObstacleManager(obstacleManager) {
        this.obstacleManager = obstacleManager;
    }

    update(speedMultiplier = 1.0) {
        // パワーアップの更新と移動
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update(speedMultiplier);
            this.powerUps[i].x -= this.speed;

            // 画面外に出たら削除
            if (this.powerUps[i].x + this.powerUps[i].width < 0) {
                this.powerUps.splice(i, 1);
            }
        }

        // 新しいパワーアップの生成
        this.spawnTimer += speedMultiplier;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPowerUp();
            // 生成成功したかどうかに関わらずタイマーリセットはspawnPowerUp内で行う方が柔軟だが
            // ここでは簡易的に、失敗したらタイマーを少し戻す
        }

        // アクティブな効果の時間チェック
        const currentTime = Date.now();
        for (let effectType in this.activeEffects) {
            if (this.activeEffects[effectType].active && currentTime >= this.activeEffects[effectType].endTime) {
                this.activeEffects[effectType].active = false;
            }
        }
    }

    spawnPowerUp() {
        const spawnX = this.canvasWidth + 50;

        // 障害物との距離チェック
        if (this.obstacleManager) {
            const obstacles = this.obstacleManager.getObstacles();
            const safeDistance = 250; // 前後250pxは空ける

            for (const obstacle of obstacles) {
                // 障害物のX座標（中心または左端）
                const obsX = obstacle.x + obstacle.width / 2;

                // 生成位置との距離
                if (Math.abs(obsX - spawnX) < safeDistance) {
                    // 障害物が近すぎるため生成スキップ
                    // タイマーを少し戻して、次回以降（少し位置がずれたタイミング）で再試行
                    this.spawnTimer = this.spawnInterval - 10;
                    return;
                }
            }
        }

        // 生成成功、タイマーリセット
        this.spawnTimer = 0;

        // ランダムにタイプを選択
        const types = ['speed_boost', 'slow_motion', 'invincible'];
        const weights = [0.4, 0.35, 0.25];
        const randomType = this.weightedRandom(types, weights);

        let spawnY = 0;

        // 無敵アイテムのみ、地形に合わせて配置
        if (randomType === 'invincible') {
            // 地形の高さを取得
            const groundHeight = this.terrain ? this.terrain.getHeightAtX(spawnX) : this.canvasHeight;

            // 安全な高さに配置
            const minY = 150;
            const maxY = groundHeight - 100;

            if (maxY <= minY) return; // 配置不可
            spawnY = minY + Math.random() * (maxY - minY);
        }

        // コンストラクタにcanvasHeightを渡す
        this.powerUps.push(new PowerUp(spawnX, spawnY, randomType, this.canvasHeight));
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[0];
    }

    checkCollision(playerBounds) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (powerUp.collected) continue;

            const powerUpBounds = powerUp.getBounds();

            // 矩形衝突判定
            if (playerBounds.x < powerUpBounds.x + powerUpBounds.width &&
                playerBounds.x + playerBounds.width > powerUpBounds.x &&
                playerBounds.y < powerUpBounds.y + powerUpBounds.height &&
                playerBounds.y + playerBounds.height > powerUpBounds.y) {

                // アイテム取得
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
                return powerUp;
            }
        }
        return null;
    }

    collectPowerUp(powerUp) {
        const currentTime = Date.now();
        this.activeEffects[powerUp.type] = {
            active: true,
            endTime: currentTime + powerUp.duration,
            duration: powerUp.duration,
            name: powerUp.name
        };
    }

    // 現在のスピード倍率を取得
    getSpeedMultiplier() {
        if (this.activeEffects.speed_boost.active) {
            return 1.5; // 1.5倍速
        } else if (this.activeEffects.slow_motion.active) {
            return 0.6; // 0.6倍速
        }
        return 1.0; // 通常速度
    }

    // 無敵状態かどうか
    isInvincible() {
        return this.activeEffects.invincible.active;
    }

    // アクティブな効果の情報を取得
    getActiveEffects() {
        const effects = [];
        for (let type in this.activeEffects) {
            if (this.activeEffects[type].active) {
                const remaining = Math.max(0, this.activeEffects[type].endTime - Date.now());
                effects.push({
                    type: type,
                    name: this.activeEffects[type].name,
                    remaining: remaining,
                    duration: this.activeEffects[type].duration
                });
            }
        }
        return effects;
    }

    draw(ctx) {
        this.powerUps.forEach(powerUp => powerUp.draw(ctx));
    }

    reset() {
        this.powerUps = [];
        this.spawnTimer = 0;
        this.activeEffects = {
            speed_boost: { active: false, endTime: 0 },
            slow_motion: { active: false, endTime: 0 },
            invincible: { active: false, endTime: 0 }
        };
    }

    getPowerUps() {
        return this.powerUps;
    }
}
