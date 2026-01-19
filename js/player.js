// プレイヤークラス - 宇宙船の描画と物理演算
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.velocity = 0;
        this.gravity = 0.6;
        this.jumpForce = -12;
        this.rotation = 0;
        this.targetRotation = 0;
        this.isJumping = false;
        this.pulsePhase = 0;
        this.jumpCount = 0;  // ジャンプ回数を追跡
        this.maxJumps = 2;   // 最大ジャンプ回数
        this.touchingJumpCloud = false; // 丸いもの（ジャンプ雲）に触れているか
    }

    jump() {
        // 丸いものに触れている場合、ジャンプ回数をリセット
        if (this.touchingJumpCloud) {
            this.jumpCount = 0;
        }

        // ダブルジャンプの実装
        if (this.jumpCount < this.maxJumps) {
            this.velocity = this.jumpForce;
            this.isJumping = true;
            this.targetRotation = -0.3;
            this.jumpCount++;
        }
    }

    superJump() {
        // ジャンプ台による大ジャンプ（回数制限なし）
        this.velocity = this.jumpForce * 1.7; // 通常の1.7倍のジャンプ力
        this.isJumping = true;
        this.targetRotation = -0.8; // 回転も激しく
        this.jumpCount = 1; // 空中ジャンプ1回分消費したことにする（あと1回ジャンプ可能）
    }

    update(canvasHeight, terrain = null) {
        // 重力適用
        this.velocity += this.gravity;
        this.y += this.velocity;

        // 回転アニメーション
        if (this.velocity > 0) {
            this.targetRotation = 0.3;
        }
        this.rotation += (this.targetRotation - this.rotation) * 0.1;

        // パルスアニメーション
        this.pulsePhase += 0.1;

        // 地形との衝突判定
        if (terrain) {
            const groundHeight = terrain.getHeightAtX(this.x);
            if (this.y + this.height / 2 > groundHeight) {
                this.y = groundHeight - this.height / 2;
                this.velocity = 0;
                this.isJumping = false;
                this.jumpCount = 0;  // 地面に着地したらジャンプ回数をリセット
            }
        } else {
            // 地形がない場合は従来の地面との衝突
            if (this.y + this.height / 2 > canvasHeight) {
                this.y = canvasHeight - this.height / 2;
                this.velocity = 0;
                this.isJumping = false;
                this.jumpCount = 0;
            }
        }

        // 天井との衝突
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.velocity = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // パルス効果
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;
        ctx.scale(pulse, pulse);

        // グロー効果
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00d4ff';

        // 四角形の本体
        const size = 30;
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(-size / 2, -size / 2, size, size);

        // 内側のグラデーション四角形
        const gradient = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
        gradient.addColorStop(0, '#b24bf3');
        gradient.addColorStop(1, '#0ff0fc');
        ctx.fillStyle = gradient;
        const innerSize = size * 0.7;
        ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);

        // コアの光
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // エッジのハイライト
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);

        ctx.restore();
    }

    getBounds() {
        // ヒットボックスの調整
        // this.width/height は 35px だが、描画サイズは 30px
        // 見た目通りの足元判定にするために、下部のパディングを調整
        // 上・左右は少し甘く（内側に）設定して、回避しやすくする

        const padX = 5;       // 描画(15px)よりさらに2.5px内側
        const padTop = 5;     // 描画(15px)よりさらに2.5px内側
        const padBottom = 2.5; // 描画(15px)と一致させる (17.5 - 2.5 = 15)

        return {
            x: this.x - this.width / 2 + padX,
            y: this.y - this.height / 2 + padTop,
            width: this.width - padX * 2,
            height: this.height - padTop - padBottom
        };
    }
}
