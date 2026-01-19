// 障害物クラス
class Obstacle {
    constructor(x, canvasHeight, type = 'spike', groundHeight = null) {
        this.x = x;
        this.type = type;
        this.canvasHeight = canvasHeight;
        this.rotation = 0;
        this.rotationSpeed = 0.02;

        // 地形の高さ（指定されていない場合はcanvasHeightを使用）
        const baseY = groundHeight !== null ? groundHeight : canvasHeight;

        if (type === 'spike') {
            // 地面のスパイク (矩形として扱うが、見た目は三角)
            this.width = 40;
            this.height = 60;
            // 地形の表面に配置（地形の高さから障害物の高さ全体を引く）
            this.y = baseY - this.height;
            this.color1 = '#ff006e';
            this.color2 = '#ff4d94';
            this.shape = 'box';
            this.snapToTerrain = true; // 地形の高さに追従する
        } else if (type === 'floating') {
            // 浮遊障害物 (円形)
            this.width = 50;
            this.height = 50;
            this.y = canvasHeight / 2 + (Math.random() - 0.5) * 200;
            this.color1 = '#b24bf3';
            this.color2 = '#d896ff';
            this.floatPhase = Math.random() * Math.PI * 2;
            this.floatSpeed = 0.03;
            this.floatAmplitude = 20;
            this.shape = 'circle';
            // 判定半径は見た目より少し小さくする（理不尽な衝突を防ぐ）
            this.hitboxRadius = (this.width / 2) * 0.8;
        } else if (type === 'floating_high') {
            // 高い位置の浮遊障害物 (円形)
            this.width = 50;
            this.height = 50;
            this.y = canvasHeight * 0.25;
            this.color1 = '#ff9500';
            this.color2 = '#ffb84d';
            this.floatPhase = Math.random() * Math.PI * 2;
            this.floatSpeed = 0.03;
            this.floatAmplitude = 15;
            this.shape = 'circle';
            this.hitboxRadius = (this.width / 2) * 0.8;
        } else if (type === 'laser') {
            // レーザーバリア (矩形)
            this.width = 10;
            this.height = canvasHeight * 0.4;
            this.y = this.height / 2;
            this.color1 = '#00d4ff';
            this.color2 = '#0ff0fc';
            this.pulsePhase = 0;
            this.shape = 'box';
        } else if (type === 'rotating_blade') {
            // 回転する刃 (円形)
            this.width = 60;
            this.height = 60;
            this.y = baseY - this.height;
            this.color1 = '#ff3300';
            this.color2 = '#ff9500';
            this.rotationSpeed = 0.15;
            this.shape = 'circle';
            this.hitboxRadius = (this.width / 2) * 0.7; // 刃物は隙間が多いので少し判定甘めに
        } else if (type === 'bouncing_ball') {
            // バウンドするボール (円形)
            this.radius = 25;
            this.width = this.radius * 2;
            this.height = this.radius * 2;
            this.y = baseY - this.radius * 2;
            this.groundY = baseY;
            this.velocityY = -8;
            this.gravity = 0.4;
            this.bounce = 0.7;
            this.color1 = '#00ff00';
            this.color2 = '#7fff00';
            this.shape = 'circle';
            this.hitboxRadius = this.radius * 0.9;
        } else if (type === 'horizontal_laser') {
            // 横方向のレーザー (矩形)
            this.width = 150;
            this.height = 8;
            this.y = canvasHeight * 0.5;
            this.color1 = '#ffff00';
            this.color2 = '#ffd700';
            this.pulsePhase = 0;
            this.shape = 'box';
        } else if (type === 'spiral') {
            // 螺旋状に動く障害物 (円形)
            this.radius = 20;
            this.width = this.radius * 2;
            this.height = this.radius * 2;
            this.centerY = canvasHeight / 2;
            this.y = this.centerY;
            this.spiralPhase = 0;
            this.spiralRadius = 0;
            this.spiralSpeed = 0.1;
            this.maxSpiralRadius = 150;
            this.color1 = '#00ffff';
            this.color2 = '#40e0d0';
            this.shape = 'circle';
            this.hitboxRadius = this.radius * 0.8;
        } else if (type === 'expanding_ring') {
            // 拡大縮小するリング (円形)
            this.innerRadius = 30;
            this.outerRadius = 50;
            this.maxOuterRadius = 80;
            this.minOuterRadius = 40;
            this.expandSpeed = 0.05;
            this.expanding = true;
            this.width = this.maxOuterRadius * 2;
            this.height = this.maxOuterRadius * 2;
            this.y = canvasHeight / 2;
            this.color1 = '#ff00ff';
            this.color2 = '#ff69b4';
            this.shape = 'circle';
            this.hitboxRadius = this.outerRadius * 0.9; // リング外周
        } else if (type === 'wave_pattern') {
            // 波状に動く障害物 (円形)
            this.radius = 15;
            this.width = this.radius * 2;
            this.height = this.radius * 2;
            this.centerY = canvasHeight / 2;
            this.y = this.centerY;
            this.wavePhase = Math.random() * Math.PI * 2;
            this.waveSpeed = 0.08;
            this.waveAmplitude = 100;
            this.color1 = '#9370db';
            this.color2 = '#4169e1';
            this.shape = 'circle';
            this.hitboxRadius = this.radius * 0.8; // 判定を少し小さく
        } else if (type === 'wall') {
            // 乗れる壁 (矩形)
            this.width = 120;
            this.height = 100;
            this.y = baseY - this.height;
            this.color1 = '#00ffcc';
            this.color2 = '#00997a';
            this.isRideable = true;
            this.shape = 'box';
        } else if (type === 'jump_pad') {
            // ジャンプ台 (矩形)
            this.width = 60;
            this.height = 20;
            this.y = baseY - this.height;
            this.color1 = '#ffff00';
            this.color2 = '#ffaa00';
            this.shape = 'box';
            this.snapToTerrain = true;
        } else if (type === 'fake_wall') {
            // 偽物の壁 (一見普通の壁だが、真ん中しか判定がない)
            this.width = 120;
            this.height = 100;
            this.y = baseY - this.height;
            this.color1 = '#ccff00'; // 黄緑
            this.color2 = '#99cc00';
            this.isRideable = true;
            this.shape = 'box';
        } else if (type === 'single_block') {
            // 一マスの壁 (正方形ブロック)
            this.width = 50;
            this.height = 50;
            this.y = baseY - this.height;
            this.color1 = '#ff9900'; // オレンジ
            this.color2 = '#cc7a00';
            this.isRideable = true;
            this.shape = 'box';
        } else if (type === 'jump_cloud') {
            // ジャンプ雲（踏み台として使える空中の雲）
            this.radius = 30;
            this.width = this.radius * 2;
            this.height = this.radius * 2;
            // Y座標は中心基準（floating系と同じ）
            // baseYがあれば地形基準、なければ画面中央
            if (baseY) {
                this.y = baseY - 100 - Math.random() * 200; // 地面から100～300px上
            } else {
                this.y = 150 + Math.random() * 250;
            }
            this.color1 = '#ffffff'; // 白
            this.color2 = '#e0e0e0'; // 薄いグレー
            this.shape = 'circle';
            this.isJumpCloud = true; // 特殊フラグ
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
    }

    // サイズを変更して再配置するメソッド
    resize(w, h) {
        // 元の底辺Y座標を保存
        const bottomY = this.y + this.height;

        this.width = w;
        this.height = h;

        // 底辺基準で高さを変更（上に伸び縮みするイメージ）
        this.y = bottomY - this.height;

        // 円形の場合は半径も更新
        if (this.shape === 'circle') {
            this.hitboxRadius = (this.width / 2) * 0.8;
            this.radius = this.width / 2;
        }
    }

    update(terrain = null, speedMultiplier = 1.0) {
        this.rotation += this.rotationSpeed * speedMultiplier;

        // 地形の高さに合わせて位置を補正
        if (terrain) {
            const currentGroundHeight = terrain.getHeightAtX(this.x);

            if (this.snapToTerrain) {
                this.y = currentGroundHeight - this.height;
            }

            if (this.type === 'bouncing_ball') {
                this.groundY = currentGroundHeight;
            }
        }


        if (this.type === 'floating' || this.type === 'floating_high') {
            this.floatPhase += this.floatSpeed * speedMultiplier;
            this.y += Math.sin(this.floatPhase) * 0.5 * speedMultiplier;
        } else if (this.type === 'laser') {
            this.pulsePhase += 0.1 * speedMultiplier;
        } else if (this.type === 'bouncing_ball') {
            // バウンドロジック
            // 重力も時間経過なので multiplier を掛けるべきだが、ここは物理挙動なので難しい。
            // 簡易的に速度変化だけ適用する
            this.velocityY += this.gravity * speedMultiplier;
            this.y += this.velocityY * speedMultiplier;

            // 地面との衝突判定（Y座標は地形の表面を基準にしている）
            const groundLevel = this.groundY || this.canvasHeight;
            if (this.y >= groundLevel - this.radius * 2) {
                this.y = groundLevel - this.radius * 2;
                this.velocityY = -this.velocityY * this.bounce;
            }
        } else if (this.type === 'horizontal_laser') {
            this.pulsePhase += 0.1 * speedMultiplier;
        } else if (this.type === 'spiral') {
            // 螺旋軌道
            this.spiralPhase += this.spiralSpeed * speedMultiplier;
            this.spiralRadius = Math.min(this.spiralRadius + 1 * speedMultiplier, this.maxSpiralRadius);
            this.y = this.centerY + Math.sin(this.spiralPhase) * this.spiralRadius;
        } else if (this.type === 'expanding_ring') {
            // 拡大縮小
            if (this.expanding) {
                this.outerRadius += this.expandSpeed * 2 * speedMultiplier;
                if (this.outerRadius >= this.maxOuterRadius) {
                    this.expanding = false;
                }
            } else {
                this.outerRadius -= this.expandSpeed * 2 * speedMultiplier;
                if (this.outerRadius <= this.minOuterRadius) {
                    this.expanding = true;
                }
            }
        } else if (this.type === 'wave_pattern') {
            // 波状移動
            this.wavePhase += this.waveSpeed * speedMultiplier;
            this.y = this.centerY + Math.sin(this.wavePhase) * this.waveAmplitude;
        }

        // expanding_ringの場合は半径が変わるのでhitboxRadiusも更新
        if (this.type === 'expanding_ring' && this.shape === 'circle') {
            this.hitboxRadius = this.outerRadius * 0.9;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'spike') {
            // スパイク障害物
            // Y座標は地形の表面を基準にしているため、描画時に高さの半分を加算
            ctx.translate(0, this.height / 2);
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();

            // エッジのハイライト
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

        } else if (this.type === 'floating') {
            // 浮遊障害物(隕石風)
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
            gradient.addColorStop(0, this.color2);
            gradient.addColorStop(1, this.color1);
            ctx.fillStyle = gradient;

            // 不規則な形状
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = this.width / 2 + (Math.random() - 0.5) * 10;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

        } else if (this.type === 'floating_high') {
            // 高い位置の浮遊障害物(オレンジ色)
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
            gradient.addColorStop(0, this.color2);
            gradient.addColorStop(1, this.color1);
            ctx.fillStyle = gradient;

            // 不規則な形状
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = this.width / 2 + (Math.random() - 0.5) * 10;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

        } else if (this.type === 'laser') {
            // レーザーバリア
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
            ctx.shadowBlur = 30 * pulse;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
            gradient.addColorStop(0.5, this.color1);
            gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');
            ctx.fillStyle = gradient;

            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // レーザーのコア
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(-this.width / 4, -this.height / 2, this.width / 2, this.height);

        } else if (this.type === 'single_block') {
            // 一マスの壁の描画
            ctx.translate(0, this.height / 2);

            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color1;

            // 本体
            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 立体感を出すためのハイライト
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 5); // 上辺
            ctx.fillRect(-this.width / 2, -this.height / 2, 5, this.height); // 左辺

            // 枠線
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this.type === 'jump_cloud') {
            // ジャンプ雲の描画（ふわふわした雲）
            const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color1;

            // 雲の本体（複数の円を重ねて雲っぽく）
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * pulse);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(0.7, this.color2);
            gradient.addColorStop(1, 'rgba(224, 224, 224, 0)');
            ctx.fillStyle = gradient;

            // メインの円
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * pulse, 0, Math.PI * 2);
            ctx.fill();

            // 追加の小さな円（雲のもこもこ感）
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(-this.radius * 0.4, -this.radius * 0.3, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.radius * 0.4, -this.radius * 0.3, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
        } else if (this.type === 'fake_wall') {
            // 偽物の壁の描画（見た目は壁と同じデザインだが、色は黄緑）
            // Y座標は地形の表面を基準にしているため、描画時に高さの半分を加算
            ctx.translate(0, this.height / 2);

            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color1;

            // 本体
            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;

            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 上部のハイライト（乗れる感を出す）
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 10);

            // 枠線
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1.0;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 装飾的なパターン（壁と同じ）
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-this.width / 2 + 10 + i * 40, -this.height / 4, 20, this.height / 2);
            }
        } else if (this.type === 'rotating_blade') {
            // 回転する刃
            // Y座標は地形の表面を基準にしているため、描画時に高さの半分を加算
            ctx.translate(0, this.height / 2);
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
            gradient.addColorStop(0, this.color2);
            gradient.addColorStop(0.5, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;

            // 十字型の刃
            ctx.beginPath();
            // 横の刃
            ctx.moveTo(-this.width / 2, -5);
            ctx.lineTo(-10, -10);
            ctx.lineTo(0, -5);
            ctx.lineTo(10, -10);
            ctx.lineTo(this.width / 2, -5);
            ctx.lineTo(this.width / 2, 5);
            ctx.lineTo(10, 10);
            ctx.lineTo(0, 5);
            ctx.lineTo(-10, 10);
            ctx.lineTo(-this.width / 2, 5);
            ctx.closePath();
            ctx.fill();

            // 縦の刃
            ctx.beginPath();
            ctx.moveTo(-5, -this.height / 2);
            ctx.lineTo(-10, -10);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-10, 10);
            ctx.lineTo(-5, this.height / 2);
            ctx.lineTo(5, this.height / 2);
            ctx.lineTo(10, 10);
            ctx.lineTo(5, 0);
            ctx.lineTo(10, -10);
            ctx.lineTo(5, -this.height / 2);
            ctx.closePath();
            ctx.fill();

            // 中央の円
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'bouncing_ball') {
            // バウンドするボール
            // Y座標は地形の表面を基準にしているため、描画時にボールの半径を加算
            ctx.translate(0, this.radius);
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, this.radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, this.color2);
            gradient.addColorStop(1, this.color1);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // ハイライト
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(-8, -8, 6, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'horizontal_laser') {
            // 横方向のレーザー
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
            ctx.shadowBlur = 25 * pulse;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
            gradient.addColorStop(0.5, this.color1);
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0.3)');
            ctx.fillStyle = gradient;

            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // レーザーのコア
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9;
            ctx.fillRect(-this.width / 2, -this.height / 4, this.width, this.height / 2);

        } else if (this.type === 'spiral') {
            // 螺旋状に動く障害物
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.4, this.color2);
            gradient.addColorStop(1, this.color1);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // 軌跡エフェクト
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();

        } else if (this.type === 'expanding_ring') {
            // 拡大縮小するリング
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, this.innerRadius, 0, 0, this.outerRadius);
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0)');
            gradient.addColorStop(0.5, this.color1);
            gradient.addColorStop(1, this.color2);

            // 外側の円
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.outerRadius, 0, Math.PI * 2);
            ctx.fill();

            // 内側の円(くり抜き)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(0, 0, this.innerRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';

            // リングのエッジ
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(0, 0, this.outerRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, this.innerRadius, 0, Math.PI * 2);
            ctx.stroke();

        } else if (this.type === 'wave_pattern') {
            // 波状に動く障害物
            ctx.shadowBlur = 18;
            ctx.shadowColor = this.color1;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, this.color2);
            gradient.addColorStop(1, this.color1);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // 波紋エフェクト
            ctx.strokeStyle = this.color2;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'wall') {
            // 壁の描画
            // Y座標は地形の表面を基準にしているため、描画時に高さの半分を加算
            ctx.translate(0, this.height / 2);

            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color1;

            // 本体
            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;

            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 上部のハイライト（乗れる感を出す）
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 10);

            // 枠線
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1.0;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 装飾的なパターン
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-this.width / 2 + 10 + i * 40, -this.height / 4, 20, this.height / 2);
            }
        } else if (this.type === 'jump_pad') {
            // ジャンプ台の描画
            // Y座標は地形の表面を基準にしているため、描画時に高さの半分を加算
            ctx.translate(0, this.height / 2);

            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color1;

            // ベース部分
            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, '#444444');
            gradient.addColorStop(1, '#222222');
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // 発光部分（スプリング的なイメージ）
            ctx.fillStyle = this.color1;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, this.width - 10, 5);

            // 矢印マーク
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(0, -10);
            ctx.lineTo(10, 0);
            ctx.closePath();
            ctx.fill();

        }

        ctx.restore();
    }

    getBounds() {
        // 判定領域の計算
        // 障害物のタイプによって、this.y が「中心」か「上端」かが異なるため分岐する

        let topY;
        const topBasedTypes = ['spike', 'wall', 'rotating_blade', 'bouncing_ball', 'jump_pad', 'fake_wall', 'single_block'];

        if (topBasedTypes.includes(this.type)) {
            // this.y が上端(Top)を表すタイプ
            topY = this.y;
        } else {
            // this.y が中心(Center)を表すタイプ (floating, laser等)
            topY = this.y - this.height / 2;
        }

        // 判定を少し小さくして遊びを作る（すり抜けやすさ）
        const padding = 6;

        return {
            x: this.x - this.width / 2 + padding,
            y: topY + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2,
            centerX: this.x,
            centerY: topY + this.height / 2,
            shape: this.shape || 'box',
            radius: (this.hitboxRadius || (this.width / 2)) - padding
        };
    }
}

// 障害物管理クラス
class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.obstacles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.spawnTimer = 0;
        this.spawnInterval = 70; // 速度上昇に合わせて調整 (80 -> 70)
        this.minInterval = 30; // 最小間隔 (35 -> 30)
        this.speed = 7.5; // 基本スピードアップ (5.5 -> 7.5)
        this.maxSpeed = 10; // 最大スピード (8 -> 10)
        this.patternCounter = 0; // パターン生成用カウンター
        this.terrain = null; // 地形への参照
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    update(speedMultiplier = 1.0) {
        // 障害物の更新と移動
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update(this.terrain, speedMultiplier);
            this.obstacles[i].x -= this.speed;

            // 画面外に出た障害物を削除
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        // 新しい障害物の生成
        // スローモーション時はタイマーの進行も遅くして、距離間隔を一定に保つ
        this.spawnTimer += speedMultiplier;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;

            // 徐々に難易度を上げる
            if (this.spawnInterval > this.minInterval) {
                this.spawnInterval -= 0.8;
            }
            // スピードも徐々に上げる
            if (this.speed < this.maxSpeed) {
                this.speed += 0.02;
            }
        }
    }

    spawnObstacle() {
        this.patternCounter++;

        // 生成位置のX座標
        const spawnX = this.canvasWidth + 50;

        // 地形の高さを取得
        const groundHeight = this.terrain ? this.terrain.getHeightAtX(spawnX) : this.canvasHeight;

        // 地形の傾斜と絶対高さをチェック
        let isRiskyTerrain = false;

        if (this.terrain) {
            const nextGroundHeight = this.terrain.getHeightAtX(spawnX + 60);

            // 1. 急な上り坂判定 (閾値を厳格化)
            if (nextGroundHeight < groundHeight - 15) {
                isRiskyTerrain = true;
            }

            // 2. 地形位置が高すぎる (天井に近い) 判定
            // 画面上部250px未満（上の方）に地面がある場合は、壁などを置くと詰む
            if (groundHeight < 250) {
                isRiskyTerrain = true;
            }
        }

        let newObstacles = [];

        // リスクのある地形（急坂、高所）では、安全な「高い浮遊物」のみ出すか、生成をスキップ
        if (isRiskyTerrain) {
            // 50%の確率で floating_high を出す（残りは生成なし）
            if (Math.random() < 0.5) {
                newObstacles.push(new Obstacle(spawnX, this.canvasHeight, 'floating_high'));
            }

            // 【確率変更】 24%の確率で飛び石チャレンジ（一マスの壁）
            // ただし、天井が十分に高くないとジャンプできないため、groundHeight > 350 の場合のみ許可
        } else if (Math.random() < 0.24 && groundHeight > 400) {
            newObstacles = this.spawnSingleBlockChallenge(spawnX, groundHeight);
        }

        // 15%の確率でジャンプ雲チャレンジ
        else if (Math.random() < 0.15 && groundHeight > 350) {
            newObstacles = this.spawnJumpCloudChallenge(spawnX, groundHeight);
        }

        // 以下、その他のパターン生成
        else if (this.patternCounter % 10 === 0) {
            // ダブルジャンプパターン（地形リスクチェック付き）
            newObstacles = this.spawnDoubleJumpPattern(spawnX, groundHeight);
        }
        else if (this.patternCounter % 5 === 0) {
            // 複数障害物パターン（地形リスクチェック付き）
            newObstacles = this.spawnMultipleObstacles(spawnX, groundHeight);
        }
        // 7回に1回は「壁」を使った高難度パターン
        else if (this.patternCounter % 7 === 0) {
            newObstacles = this.spawnWallChallenge(spawnX, groundHeight);
        }
        // 12回に1回は連続トゲ地帯 (Spike Field)
        else if (this.patternCounter % 12 === 0) {
            newObstacles = this.spawnSpikeField(spawnX);
        }
        // 8回に1回はジャンプ台チャレンジ
        else if (this.patternCounter % 8 === 0) {
            newObstacles = this.spawnHighChallenge(spawnX, groundHeight);
        }
        // 通常の障害物生成(10種類すべてから選択)
        else {
            const types = [
                'spike',
                'floating',
                'floating_high',
                'rotating_blade',
                'bouncing_ball',
                'horizontal_laser',
                'spiral',
                'expanding_ring',
                'wave_pattern',
                'wall',
                'jump_pad',
                'fake_wall',
                'single_block',
                'jump_cloud'
            ];
            const weights = [
                0.11,  // spike (0.10 -> 0.11)
                0.10,  // floating (0.09 -> 0.10)
                0.08,  // floating_high
                0.10,  // rotating_blade (0.09 -> 0.10)
                0.08,  // bouncing_ball
                0.06,  // horizontal_laser
                0.08,  // spiral
                0.07,  // expanding_ring
                0.06,  // wave_pattern
                0.07,  // wall
                0.04,  // jump_pad
                0.08,  // fake_wall
                0.03,  // single_block
                0.06   // jump_cloud
            ];
            const randomType = this.weightedRandom(types, weights);

            // 地面に配置される障害物タイプ
            const groundTypes = ['spike', 'rotating_blade', 'bouncing_ball', 'wall', 'jump_pad', 'fake_wall', 'single_block'];
            // 空中に配置されるが地形を基準にする障害物タイプ
            const floatingTypes = ['jump_cloud'];
            const useGroundHeight = groundTypes.includes(randomType) || floatingTypes.includes(randomType);

            const obstacle = new Obstacle(
                spawnX,
                this.canvasHeight,
                randomType,
                useGroundHeight ? groundHeight : null
            );
            newObstacles.push(obstacle);
        }

        // 生成されたすべての障害物に対して、通行可能かチェックして補正
        newObstacles.forEach(obs => {
            // 各障害物の位置での地形高さを再取得（位置がずれている場合があるため）
            const obsGroundHeight = this.terrain ? this.terrain.getHeightAtX(obs.x) : this.canvasHeight;
            if (!this.ensurePassableGap(obs, obsGroundHeight)) {
                // 通行不可能な障害物は画面外に追放（生成しない）
                obs.x = -9999;
            }
            this.obstacles.push(obs);
        });
    }

    // プレイヤーが通れる隙間を確保する
    // 戻り値: true = 通行可能、false = 通行不可能（削除推奨）
    ensurePassableGap(obstacle, groundHeight) {
        const MIN_GAP = 110; // 下を通るのに必要な隙間
        const REQUIRED_CEILING_GAP = 140; // 上を飛び越えるのに必要な隙間

        const bounds = obstacle.getBounds();

        // 天井からのクリアランス (上を通れるか？)
        const gapAbove = bounds.y;

        // 地面からのクリアランス (下を通れるか？)
        const gapBelow = groundHeight - (bounds.y + bounds.height);

        // 壁タイプの処理
        if (obstacle.type === 'wall' || obstacle.type === 'fake_wall') {
            // 壁は「上を飛び越える」前提
            if (gapAbove < REQUIRED_CEILING_GAP) {
                // 天井が近すぎて飛び越えられない
                const diff = REQUIRED_CEILING_GAP - gapAbove;
                const newHeight = obstacle.height - diff;

                if (newHeight < 40) {
                    // 低くなりすぎるなら生成中止
                    return false;
                } else {
                    // 高さを変更
                    const currentBottom = obstacle.y + obstacle.height;
                    obstacle.resize(obstacle.width, newHeight);
                    obstacle.y = currentBottom - newHeight;
                }
            }
            return true;
        }

        // 地面に配置される障害物（spike, rotating_blade, bouncing_ball, jump_pad, fake_wall, single_block）
        const groundTypes = ['spike', 'rotating_blade', 'bouncing_ball', 'wall', 'jump_pad', 'fake_wall', 'single_block'];
        if (groundTypes.includes(obstacle.type)) {
            // 地面の障害物は「上を飛び越える」のみ
            // 天井が低すぎる場合は生成しない
            if (gapAbove < REQUIRED_CEILING_GAP) {
                return false;
            }
            return true;
        }

        // 浮遊障害物など
        const floatingTypes = ['floating', 'floating_high', 'expanding_ring', 'spiral', 'wave_pattern', 'laser', 'horizontal_laser'];

        if (floatingTypes.includes(obstacle.type)) {
            // 上も下も通れない場合は詰み
            const canPassAbove = gapAbove >= REQUIRED_CEILING_GAP;
            const canPassBelow = gapBelow >= MIN_GAP;

            if (!canPassAbove && !canPassBelow) {
                // 両方通れない → 調整を試みる
                // まず下を通せるように上に移動
                const shiftUp = MIN_GAP - gapBelow;
                obstacle.y -= shiftUp;

                // 再計算
                const newGapAbove = bounds.y - shiftUp;
                const newGapBelow = MIN_GAP;

                // 上げた結果、上も通れなくなったら生成中止
                if (newGapAbove < REQUIRED_CEILING_GAP && newGapBelow < MIN_GAP) {
                    return false;
                }
            }
            return true;
        }

        // その他の障害物は基本的に通行可能とみなす
        return true;
    }

    // ダブルジャンプ必須パターン
    spawnDoubleJumpPattern(spawnX, groundHeight) {
        // 地形リスクチェック（パターン全体の範囲をチェック）
        if (this.terrain) {
            for (let offset = 0; offset <= 150; offset += 50) {
                const checkX = spawnX + offset;
                const h = this.terrain.getHeightAtX(checkX);
                const nextH = this.terrain.getHeightAtX(checkX + 60);

                // 急な上り坂または天井が低い場合は安全なパターンに変更
                if (nextH < h - 15 || h < 250) {
                    return [new Obstacle(spawnX, this.canvasHeight, 'floating_high')];
                }
            }
        }

        const obs = [];
        // 地面の障害物 + 高い位置の障害物
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'spike', groundHeight));
        obs.push(new Obstacle(spawnX + 70, this.canvasHeight, 'floating_high'));
        return obs;
    }

    // 複数障害物の同時生成
    spawnMultipleObstacles(spawnX, groundHeight) {
        // 地形リスクチェック（パターン全体の範囲をチェック）
        if (this.terrain) {
            for (let offset = 0; offset <= 200; offset += 50) {
                const checkX = spawnX + offset;
                const h = this.terrain.getHeightAtX(checkX);
                const nextH = this.terrain.getHeightAtX(checkX + 60);

                // 急な上り坂または天井が低い場合は安全なパターンに変更
                if (nextH < h - 15 || h < 250) {
                    return [new Obstacle(spawnX, this.canvasHeight, 'floating_high')];
                }
            }
        }

        const obs = [];
        const types = ['spike', 'floating', 'laser'];
        const type1 = types[Math.floor(Math.random() * types.length)];
        const type2 = types[Math.floor(Math.random() * types.length)];

        const useGround1 = type1 === 'spike';
        const useGround2 = type2 === 'spike';

        obs.push(new Obstacle(
            spawnX,
            this.canvasHeight,
            type1,
            useGround1 ? groundHeight : null
        ));

        const ground2 = this.terrain ? this.terrain.getHeightAtX(spawnX + 130) : this.canvasHeight;
        obs.push(new Obstacle(
            spawnX + 130,
            this.canvasHeight,
            type2,
            useGround2 ? ground2 : null
        ));

        return obs;
    }

    // 連続トゲ地帯パターン (3連スパイク)
    spawnSpikeField(spawnX) {
        // 地形リスクチェック（パターン全体の範囲をチェック）
        if (this.terrain) {
            for (let offset = 0; offset <= 150; offset += 50) {
                const checkX = spawnX + offset;
                const h = this.terrain.getHeightAtX(checkX);
                const nextH = this.terrain.getHeightAtX(checkX + 60);

                // 急な上り坂または天井が低い場合は安全なパターンに変更
                if (nextH < h - 15 || h < 250) {
                    return [new Obstacle(spawnX, this.canvasHeight, 'floating_high')];
                }
            }
        }

        const obs = [];
        // トゲを少し間隔を詰めて3つ並べる
        const count = 3;
        const gap = 35; // 少し重ねるくらいの間隔で密度を出す

        for (let i = 0; i < count; i++) {
            const spikeX = spawnX + i * gap;
            // 地形の高さを個別に取得（必須）
            const h = this.terrain ? this.terrain.getHeightAtX(spikeX) : this.canvasHeight;

            // スパイク生成
            obs.push(new Obstacle(spikeX, this.canvasHeight, 'spike', h));
        }

        return obs;
    }

    // 壁を使った高難度パターン
    spawnWallChallenge(spawnX, groundHeight) {
        // 地形リスク先読みチェック
        if (this.terrain) {
            // パターンの最大長（island_hoppingは約600px）にわたってチェック
            // 100px刻みでチェックして、途中に危険な地形がないか確認
            for (let offset = 0; offset <= 650; offset += 100) {
                const checkX = spawnX + offset;
                const h = this.terrain.getHeightAtX(checkX);
                // 傾斜チェック用
                const nextH = this.terrain.getHeightAtX(checkX + 60);

                // 1. 急な上り坂 (15px以上)
                // 2. 天井が低い (250px未満)
                if (nextH < h - 15 || h < 250) {
                    // 危険な地形なので、コンボ生成を中止し、安全な 'floating_high' 単発に置き換える
                    return [new Obstacle(spawnX, this.canvasHeight, 'floating_high')];
                }
            }
        }

        const obs = [];
        const patternType = Math.random() < 0.5 ? 'island_hopping' : 'needle_gate';

        if (patternType === 'island_hopping') {
            // パターンA: 連続する足場と床の棘（アイランドホッピング）
            // 3つの壁を配置し、その下はスパイクだらけにする
            // 3つの壁を配置し、その下はスパイクだらけにする

            for (let i = 0; i < 3; i++) {
                // 間隔をさらに広げて、間の地面を安全地帯として使えるようにする (260 -> 300)
                const wallX = spawnX + i * 300;

                // その地点での地形高さを取得
                const currentGroundHeight = this.terrain ? this.terrain.getHeightAtX(wallX) : this.canvasHeight;

                // 壁のサイズをランダムに変える
                // 高すぎると届かないので制限する
                // プレイヤーのジャンプ力は約120px、ダブルジャンプで180pxだが、
                // 坂道などを考慮して、かなり余裕を持たせる（130px以内）

                // 壁自体の高さ: 60〜90 (少し低めに)
                const h = 60 + Math.random() * 30;

                // 地面からの浮き具合
                // gap + h が 130 を超えないように gap の最大値を制限
                const maxGap = 130 - h;
                const minGap = 20;
                // maxGapがminGapより小さい場合はminGapを使う（論理的にはh<=140なら起きない）
                const gap = minGap + Math.random() * (Math.max(minGap, maxGap) - minGap);

                // 一旦デフォルトで生成
                // baseYとして「地面に直置きする位置」を渡す
                const wallObs = new Obstacle(wallX, this.canvasHeight, 'wall', currentGroundHeight);

                // サイズ変更
                // 幅はランダム
                const w = 80 + Math.random() * 80;
                wallObs.resize(w, h);

                // Y座標のみ、浮かせた位置に上書き
                // 目標: 底辺が currentGroundHeight - gap の位置
                wallObs.y = (currentGroundHeight - gap) - h;

                obs.push(wallObs);

                // 壁と壁の間にはスパイクを置かない（確実に通れる安全地帯とする）
            }
        } else {
            // パターンB: ニードル・ゲート（頭上注意の壁）
            // 高い壁があり、その真上に浮遊障害物がある（ジャンプの高さ制御が必要）

            // 正確な地形高さを取得
            const currentGroundHeight = this.terrain ? this.terrain.getHeightAtX(spawnX) : this.canvasHeight;

            // 1. 壁
            // 総高さ 120px (浮き20 + 高さ100)
            const gap = 20;
            const h = 100;

            // baseHeight は「地面の高さ - gap」
            // obstacleのy = base - h = ground - gap - h
            const wallBaseY = currentGroundHeight - gap;

            const wall = new Obstacle(spawnX, this.canvasHeight, 'wall', wallBaseY);
            // サイズを明示的に設定（デフォルトも120x100だが念のため）
            wall.resize(100, h);
            wall.y = (currentGroundHeight - gap) - h;

            obs.push(wall);

            // 2. 壁の上の障害物（浮遊隕石や回転刃）
            // 壁の上端から少しだけ隙間を空けて配置
            const wallTop = wall.y;
            const hazardGap = 130; // 隙間を少し広げる (110 -> 130)

            const hazardType = Math.random() < 0.5 ? 'floating' : 'rotating_blade';

            if (hazardType === 'floating') {
                const hazard = new Obstacle(spawnX, this.canvasHeight, 'floating');
                hazard.y = wallTop - hazardGap; // 壁の上に配置
                obs.push(hazard);
            } else {
                // 回転刃の特殊配置
                const hazard = new Obstacle(spawnX, this.canvasHeight, 'rotating_blade', wallTop - hazardGap + 60);
                hazard.y = wallTop - hazardGap;
                obs.push(hazard);
            }
        }
        return obs;
    }

    // 重み付きランダム選択
    // 高い柱への挑戦パターン（空中アスレチック）
    spawnHighChallenge(spawnX, groundHeight) {
        const obs = [];

        // 1. ジャンプ台
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'jump_pad', groundHeight));

        // 2. 空中の足場（壁タイプを流用）
        // ジャンプ台から約320px先（少し近くする）
        const platformX = spawnX + 320;

        // 高さは地面から280px上だが、天井(y=0)から最低でも150pxは空ける
        // これによりensurePassableGapで削除されるのを防ぐ
        const platformY = Math.max(150, groundHeight - 280);

        const platform = new Obstacle(platformX, this.canvasHeight, 'wall');

        // 横長の足場にする
        const pWidth = 150;
        const pHeight = 40;
        platform.resize(pWidth, pHeight);

        // 空中に強制配置
        platform.y = platformY;

        obs.push(platform);

        return obs;
    }

    // 一マスの壁を使った階段チャレンジ（横長の壁から始まる階段）
    spawnSingleBlockChallenge(spawnX, groundHeight) {
        const obs = [];

        // 基準となる高さ（スタート地点の足場）
        // スーパージャンプなしでも届く高さ、あるいは2段ジャンプで届く高さに調整
        // 地面から80px上からスタート（上りやすく調整）
        const startY = groundHeight - 80;

        // 1. スタート地点の横長い壁（足場）
        const platformWidth = 150;
        const platform = new Obstacle(spawnX, this.canvasHeight, 'wall');
        platform.resize(platformWidth, 40);
        platform.y = startY;
        obs.push(platform);

        // 2. 階段状に single_block を配置
        // 足場の右端からスタート
        let currentX = spawnX + platformWidth + 80; // 1マスの隙間(約80px)
        let currentY = startY - 40; // 1段上へ（上りやすく調整）

        const stepCount = 3; // 階段を3段に減らす（丸いものを使う余地を作る）
        const stepGapX = 200; // 横の間隔（2マス分）
        const stepGapY = 25;  // 縦の間隔（0.5マス分）

        for (let i = 0; i < stepCount; i++) {
            // 天井チェック
            if (currentY < 100) break; // 天井にぶつかるなら終了

            const block = new Obstacle(currentX, this.canvasHeight, 'single_block', groundHeight);
            block.y = currentY - block.height; // single_blockの高さ分調整して配置
            // Y座標は直指定するのでコンストラクタのgroundHeightは無視されるが、念のため

            obs.push(block);

            currentX += stepGapX;
            currentY -= stepGapY; // 上昇
        }

        // 3. 階段の先に「丸いもの」を配置
        const cloudX = currentX + 150;
        const cloudY = currentY - 50;

        if (cloudY > 80) {
            const cloud = new Obstacle(cloudX, this.canvasHeight, 'jump_cloud');
            cloud.y = cloudY;
            obs.push(cloud);

            // 4. 丸いものの先にゴール足場
            const goalX = cloudX + 180;
            const goalY = cloudY - 80;

            if (goalY > 80) {
                const goalPlatform = new Obstacle(goalX, this.canvasHeight, 'wall');
                goalPlatform.resize(120, 40);
                goalPlatform.y = goalY;
                obs.push(goalPlatform);
            }
        }

        // 5. 階段の下に横細長い障害物を配置
        // 足場の下、地面の少し上
        const laser1X = spawnX + platformWidth + 150;
        const laser1Y = groundHeight - 30; // 地面から少し上
        const laser1 = new Obstacle(laser1X, this.canvasHeight, 'horizontal_laser');
        laser1.y = laser1Y;
        laser1.width = 200; // 幅を設定
        obs.push(laser1);

        // 階段の中間あたりにもう1本
        const laser2X = spawnX + platformWidth + 400;
        const laser2Y = groundHeight - 50;
        const laser2 = new Obstacle(laser2X, this.canvasHeight, 'horizontal_laser');
        laser2.y = laser2Y;
        laser2.width = 200;
        obs.push(laser2);

        return obs;
    }

    // ジャンプ雲を使った高難易度パターン（空中飛び移りチャレンジ）
    spawnJumpCloudChallenge(spawnX, groundHeight) {
        const obs = [];

        // スタート足場
        const platformWidth = 100;
        const platform = new Obstacle(spawnX, this.canvasHeight, 'wall');
        platform.resize(platformWidth, 40);
        platform.y = groundHeight - 80;
        obs.push(platform);

        // ジャンプ雲を連続配置（3～4個）
        const cloudCount = 3;
        let currentX = spawnX + platformWidth + 150;
        let currentY = groundHeight - 150;

        for (let i = 0; i < cloudCount; i++) {
            // 天井チェック
            if (currentY < 100) break;

            const cloud = new Obstacle(currentX, this.canvasHeight, 'jump_cloud', groundHeight);
            cloud.y = currentY;
            obs.push(cloud);

            // 次の雲の位置（少しずつ高く、遠くに）
            currentX += 180;
            currentY -= 30; // 少しずつ上昇
        }

        // ゴール足場
        const goalX = currentX + 150;
        const goalY = currentY - 50;

        if (goalY > 80) {
            const goalPlatform = new Obstacle(goalX, this.canvasHeight, 'wall');
            goalPlatform.resize(120, 40);
            goalPlatform.y = goalY;
            obs.push(goalPlatform);
        }

        // 下に横長レーザーを配置
        const laserX = spawnX + 300;
        const laserY = groundHeight - 20;
        const laser = new Obstacle(laserX, this.canvasHeight, 'horizontal_laser');
        laser.y = laserY;
        laser.width = 400;
        obs.push(laser);

        return obs;
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

    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 70;
        this.speed = 7.5;
        this.patternCounter = 0;
    }

    getObstacles() {
        return this.obstacles;
    }
}
