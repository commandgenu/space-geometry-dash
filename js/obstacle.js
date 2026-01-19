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
            // 横方向のレーザー
            this.width = 120;
            this.height = 15;
            if (groundHeight !== null) {
                this.y = groundHeight;
            } else {
                this.y = Math.random() * (canvasHeight - 200) + 100; // 空中のランダムな高さ
            }
            this.color1 = '#ff0000'; // 赤
            this.color2 = '#ff8800'; // オレンジ
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.shape = 'box'; // Added shape property for consistency
        } else if (type === 'flash_laser') {
            // 一瞬で消えるステルスレーザー
            this.width = 150;
            this.height = 12;
            if (groundHeight !== null) {
                this.y = groundHeight;
            } else {
                this.y = Math.random() * (canvasHeight - 200) + 100; // 空中のランダムな高さ
            }
            this.color1 = '#ff00ff'; // マゼンタ
            this.color2 = '#ffffff'; // 白
            this.isVisible = true;
            this.age = 0;
            this.lifeTime = 6; // 0.1秒 (60fps換算で約6フレーム)
            this.pulsePhase = 0;
            this.shape = 'box'; // Added shape property for consistency
        } else if (type === 'tracking_beam') {
            // 端から端まで画面についていく追尾ビーム
            this.width = 3000; // 画面幅を完全にカバー
            this.height = 10;
            if (groundHeight !== null) {
                this.y = groundHeight;
            } else {
                this.y = Math.random() * (canvasHeight - 200) + 100;
            }
            this.color1 = '#00ffff'; // シアン
            this.color2 = '#ffffff'; // 白
            this.isTracking = true; // 画面に追従するフラグ
            this.lifeTime = 120; // 2秒間持続
            this.age = 0;
            this.markedForDeletion = false;
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
                // 地面から高すぎると届かないので調整 (70px ~ 180px上)
                this.y = baseY - 70 - Math.random() * 110;
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
            // expanding_ringの場合は半径が変わるのでhitboxRadiusも更新
            if (this.type === 'expanding_ring' && this.shape === 'circle') {
                this.hitboxRadius = this.outerRadius * 0.9;
            }
        } else if (this.type === 'flash_laser') {
            // flash_laserの寿命管理
            this.age += speedMultiplier;
            if (this.age > this.lifeTime) {
                this.isVisible = false; // 0.1秒後に透明化（当たり判定は残る）
            }
        } else if (this.type === 'tracking_beam') {
            // 寿命管理
            this.age += speedMultiplier;
            if (this.age > this.lifeTime) {
                this.markedForDeletion = true; // 寿命が尽きたら削除
            }

            // 明滅エフェクト
            this.pulsePhase = (this.age / 10) % (Math.PI * 2);

        } else if (this.type === 'wave_pattern') {
            // 波状移動
            this.wavePhase += this.waveSpeed * speedMultiplier;
            this.y = this.centerY + Math.sin(this.wavePhase) * this.waveAmplitude;
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

            // レーザーのコア
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9;
            ctx.fillRect(-this.width / 2, -this.height / 4, this.width, this.height / 2);

            // Alphaリセット（コンテキスト復帰で戻るはずだが念のため）
            ctx.globalAlpha = 1.0;

        } else if (this.type === 'flash_laser') {
            // ステルスレーザー（表示中のみ描画）
            if (this.isVisible) {
                // 明るく発光するレーザー
                ctx.shadowBlur = 30;
                ctx.shadowColor = this.color1;

                // コア（白）
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-this.width / 2, -this.height / 6, this.width, this.height / 3);

                // 外光
                const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.2, this.color1);
                gradient.addColorStop(0.8, this.color1);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.fillStyle = gradient;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }

        } else if (this.type === 'tracking_beam') {
            // 追尾ビームの描画
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color1;

            // 明滅する不透明度
            const alpha = 0.5 + Math.sin(this.pulsePhase) * 0.3;
            ctx.globalAlpha = alpha;

            // 本体
            ctx.fillStyle = this.color1;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // コアライン
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9;
            ctx.fillRect(-this.width / 2, -2, this.width, 4);

            // 警告表示（出現直後）
            if (this.age < 30) {
                ctx.fillStyle = 'red';
                ctx.font = '20px Arial';
                ctx.fillText("⚠ DANGER ⚠", -50, -20);
            }

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
        // 偽物の壁は判定を小さくする（中央のみ）
        if (this.type === 'fake_wall') {
            return {
                x: this.x - this.width / 6, // 横幅の1/3だけ判定
                y: this.y + this.height / 3, // 上下の1/3は安全
                width: this.width / 3,
                height: this.height / 3,
                centerX: this.x,
                centerY: this.y + this.height / 2,
                shape: 'box',
                radius: this.width / 6
            };
        }

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
    constructor(canvasWidth, canvasHeight, audioManager) {
        this.obstacles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.audioManager = audioManager;
        this.spawnTimer = 0;
        this.spawnInterval = 70; // 速度上昇に合わせて調整 (80 -> 70)
        this.minInterval = 30; // 最小間隔 (35 -> 30)
        this.speed = 7.5; // 基本スピードアップ (5.5 -> 7.5)
        this.maxSpeed = 10; // 最大スピード (8 -> 10)
        this.patternCounter = 0; // パターン生成用カウンター
        this.terrain = null; // 地形への参照
        this.difficulty = 'normal'; // default
        this.baseWeights = {}; // 重み保存用
    }

    setDifficulty(level) {
        this.difficulty = level;

        // 難易度別の基本設定
        switch (level) {
            case 'easy':
                this.initialSpeed = 6.0;
                this.maxSpeed = 8.0;
                this.initialSpawnInterval = 90; // ゆったり
                this.minInterval = 50;
                break;
            case 'hard':
                this.initialSpeed = 8.5;
                this.maxSpeed = 12.0;
                this.initialSpawnInterval = 60; // 高速
                this.minInterval = 25;
                break;
            case 'extreme':
                this.initialSpeed = 11.5; // 神速
                this.maxSpeed = 18.0;
                this.initialSpawnInterval = 30; // 息継ぎなし
                this.minInterval = 15;
                break;
            case 'normal':
            default:
                this.initialSpeed = 7.5;
                this.maxSpeed = 10.0;
                this.initialSpawnInterval = 70;
                this.minInterval = 30;
                break;
        }

        this.speed = this.initialSpeed;
        this.spawnInterval = this.initialSpawnInterval;

        // エクストリームモード用のパターンシーケンス管理
        this.currentPatternIndex = 0;
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    update(speedMultiplier = 1.0) {
        // 障害物の更新と移動
        // 障害物の更新と移動
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update(this.terrain, speedMultiplier);

            // 追うタイプ(tracking_beam)はスクロールさせない（xを減算しないことで画面に固定）
            if (!this.obstacles[i].isTracking) {
                this.obstacles[i].x -= this.speed;
            }

            // 画面外に出た障害物、または削除フラグが立った障害物を削除
            if (
                (this.obstacles[i].x + this.obstacles[i].width < 0 && !this.obstacles[i].isTracking) ||
                this.obstacles[i].markedForDeletion
            ) {
                this.obstacles.splice(i, 1);
            }
        }

        // 新しい障害物の生成（距離ベース）
        // 既存の障害物の最後尾を取得
        let lastRight = -1000;
        // 有効な（削除予定でない）障害物の中で最も右にあるものを探す
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            if (!this.obstacles[i].markedForDeletion) {
                const obs = this.obstacles[i];
                const r = obs.x + obs.width;
                if (r > lastRight) lastRight = r;
                // 後ろから探して最初に見つかったものが通常は最も右だが、
                // 生成順序と位置がずれる可能性も考慮してループ（念のため）
                break;
            }
        }

        const spawnX = this.canvasWidth + 50; // 生成予定位置

        let requiredGap = 300;
        if (this.difficulty === 'extreme') requiredGap = 60;  // 緩和（無理ゲー回避）
        else if (this.difficulty === 'hard') requiredGap = 120;
        else if (this.difficulty === 'normal') requiredGap = 200;
        else requiredGap = 350; // easyも少し短縮

        // 最後の障害物から十分離れたら次を生成
        if (this.obstacles.length === 0 || spawnX - lastRight >= requiredGap) {
            this.spawnObstacle();

            // 難易度進行
            if (this.speed < this.maxSpeed) {
                this.speed += 0.01; // 加速レート倍増
            }
        }
    }

    spawnObstacle() {
        // パターンカウンターを進める（バリエーション用）
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
        }

        // ------------------------------------
        // スペシャルパターン生成 (確率発動)
        // ------------------------------------

        // Extremeモード: シーケンシャル生成
        // ------------------------------------

        const rand = Math.random();
        let oldChallengeChance = 0.2;
        let newPatternChance = 0.2;

        if (this.difficulty === 'hard') {
            oldChallengeChance = 0.35;
            newPatternChance = 0.35;
        } else if (this.difficulty === 'normal') {
            oldChallengeChance = 0.25;
            newPatternChance = 0.25;
        } else { // easy
            oldChallengeChance = 0.1;
            newPatternChance = 0.05;
        }

        if (this.difficulty === 'extreme') {
            this.currentPatternIndex = (this.currentPatternIndex % 25) + 1;
            const pId = this.currentPatternIndex;
            newObstacles = this.spawnSpecificPattern(pId, spawnX, groundHeight);
        }
        else if (rand < oldChallengeChance) {
            const challengeType = Math.random();
            if (challengeType < 0.2) newObstacles = this.spawnSpikeField(spawnX);
            else if (challengeType < 0.4) newObstacles = this.spawnWallChallenge(spawnX, groundHeight);
            else if (challengeType < 0.6) newObstacles = this.spawnHighChallenge(spawnX, groundHeight);
            else if (challengeType < 0.8) newObstacles = this.spawnSingleBlockChallenge(spawnX, groundHeight);
            else newObstacles = this.spawnJumpCloudChallenge(spawnX, groundHeight);
        }
        else if (rand < oldChallengeChance + newPatternChance) {
            const pId = Math.floor(Math.random() * 25) + 1;
            newObstacles = this.spawnSpecificPattern(pId, spawnX, groundHeight);
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
                'jump_cloud',
                'flash_laser',
                'tracking_beam' // 端から端まで追従
            ];

            // 難易度に応じた出現率調整
            let weights;
            if (this.difficulty === 'easy') {
                weights = [
                    0.15,  // spike (多めだが単純)
                    0.15,  // floating
                    0.05,  // floating_high
                    0.05,  // rotating_blade
                    0.05,  // bouncing_ball
                    0.05,  // horizontal_laser
                    0.05,  // spiral
                    0.05,  // expanding_ring
                    0.05,  // wave_pattern
                    0.10,  // wall (練習用)
                    0.05,  // jump_pad
                    0.05,  // fake_wall
                    0.05,  // single_block
                    0.05,  // jump_cloud
                    0.00,  // flash_laser (なし)
                    0.00   // tracking_beam (なし)
                ];
            } else if (this.difficulty === 'hard') {
                // 現在のハード仕様 (追尾ビーム33%)
                weights = [
                    0.07,  // spike 
                    0.06,  // floating 
                    0.05,  // floating_high
                    0.06,  // rotating_blade 
                    0.05,  // bouncing_ball
                    0.04,  // horizontal_laser 
                    0.05,  // spiral 
                    0.05,  // expanding_ring
                    0.03,  // wave_pattern 
                    0.05,  // wall 
                    0.03,  // jump_pad 
                    0.05,  // fake_wall 
                    0.02,  // single_block 
                    0.04,  // jump_cloud 
                    0.02,  // flash_laser 
                    0.33   // tracking_beam (33%)
                ];
            } else {
                // Normal (バランス型) - ビーム少なめ
                weights = [
                    0.11,  // spike 
                    0.10,  // floating 
                    0.08,  // floating_high
                    0.09,  // rotating_blade
                    0.08,  // bouncing_ball
                    0.06,  // horizontal_laser
                    0.07,  // spiral
                    0.07,  // expanding_ring
                    0.05,  // wave_pattern
                    0.07,  // wall
                    0.04,  // jump_pad
                    0.08,  // fake_wall
                    0.03,  // single_block
                    0.06,  // jump_cloud
                    0.02,  // flash_laser
                    0.05   // tracking_beam (5%)
                ];
            }
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
        let patternEndX = spawnX; // このパターンの最終地点

        // 予測シミュレーションによるチェック
        // 生成されたパターンが物理的にクリア可能か試す
        if (newObstacles.length > 0 && !this.isPathPossible(newObstacles, spawnX, groundHeight)) {
            // クリア不可能と判断された場合、パターン全体を破棄して安全な浮遊障害物に置き換える
            console.log("Impossible pattern detected, replacing with safe obstacle.");
            newObstacles = [new Obstacle(spawnX, this.canvasHeight, 'floating_high')];
        }

        newObstacles.forEach(obs => {
            // 各障害物の位置での地形高さを再取得（位置がずれている場合があるため）
            const obsGroundHeight = this.terrain ? this.terrain.getHeightAtX(obs.x) : this.canvasHeight;
            if (!this.ensurePassableGap(obs, obsGroundHeight)) {
                // 通行不可能な障害物は画面外に追放（生成しない）
                obs.x = -9999;
            } else {
                // 有効な障害物の終了位置を更新
                const endX = obs.x + obs.width;
                if (endX > patternEndX) {
                    patternEndX = endX;
                }
            }
            this.obstacles.push(obs);
        });

        // 動的スペーシングロジック:
        // パターンの長さに応じて次の生成タイミングを遅らせることで、
        // どんなに速くても被らないように調整している。
        const patternLength = patternEndX - spawnX;
        if (patternLength > 100) {
            // パターン通過にかかる時間を計算
            // 少し余裕（バッファ）を持たせる
            // Extremeの場合はバッファを最小限にする（60px）
            const bufferDistance = this.difficulty === 'extreme' ? 60 : 150;
            const requiredTime = (patternLength + bufferDistance) / this.speed;

            if (requiredTime > this.spawnInterval) {
                // 必要な時間が標準間隔より長い場合、タイマーを巻き戻して遅延させる
                this.spawnTimer -= (requiredTime - this.spawnInterval);
            }
        }
    }

    // プレイヤーが通れる隙間を確保する
    // 戻り値: true = 通行可能、false = 通行不可能（削除推奨）
    ensurePassableGap(obstacle, groundHeight) {
        // まずビームとの干渉をチェック（優先度高）
        if (!this.checkBeamInterference(obstacle, groundHeight)) {
            return false;
        }

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
        const floatingTypes = ['floating', 'floating_high', 'expanding_ring', 'spiral', 'wave_pattern', 'laser', 'horizontal_laser', 'flash_laser', 'tracking_beam'];

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

    // 予測シミュレーション：プレイヤーがパターンをクリア可能か判定
    isPathPossible(newObstacles, spawnX, startGroundHeight) {
        // パフォーマンスのため、複雑すぎる計算は避ける
        // 簡易的な状態探索を行う

        // シミュレーション範囲: チャレンジ開始の少し前から、すべての障害物を超えるまで
        const startX = spawnX - 100;
        let endX = spawnX;
        newObstacles.forEach(o => {
            if (o.x + o.width > endX) endX = o.x + o.width;
        });
        endX += 200; // 余裕を持つ

        const distance = endX - startX;
        const steps = Math.ceil(distance / this.speed); // 必要フレーム数

        // 状態: { relativeX, y, velocity, jumpCount, inAir }
        // スタート地点: 地面上
        let currentStates = [{
            x: startX,
            y: this.terrain ? this.terrain.getHeightAtX(startX) - 17.5 : startGroundHeight - 17.5, // Player height half
            vy: 0,
            jumpCount: 0
        }];

        // 探索ステップ幅（フレーム間引き）
        const stepSkip = 5;

        for (let t = 0; t < steps; t += stepSkip) {
            let nextStates = [];
            let passed = false;

            // 各状態から可能なアクションを試行
            for (const state of currentStates) {
                // ゴール到達チェック
                if (state.x >= endX) {
                    return true;
                }

                // 3つのアクション: そのまま走る、ジャンプ開始(1段/2段)、落下維持
                const actions = [
                    { type: 'run' },
                    { type: 'jump' }
                ];

                for (const action of actions) {
                    const nextState = this.simulateStep(state, action, stepSkip, newObstacles);
                    if (nextState) {
                        // 重複排除（簡易的にY座標で間引き）
                        // 同じような高さの状態が大量に増えないようにする
                        const existing = nextStates.find(s => Math.abs(s.y - nextState.y) < 20 && s.jumpCount === nextState.jumpCount);
                        if (!existing) {
                            nextStates.push(nextState);
                        }
                    }
                }
            }

            if (nextStates.length === 0) {
                // 全滅（詰み）
                return false;
            }
            // 状態数を制限して爆発を防ぐ (上位5つ程度に絞る)
            currentStates = nextStates.sort((a, b) => a.jumpCount - b.jumpCount).slice(0, 8);
        }

        return true;
    }

    simulateStep(state, action, frames, obstacles) {
        let { x, y, vy, jumpCount } = state;

        // プレイヤー定数 (js/player.jsより)
        const gravity = 0.6;
        const jumpForce = -12;
        const playerHeight = 35;
        const playerWidth = 35;

        // アクション適用
        if (action.type === 'jump') {
            if (jumpCount < 2) { // 2段ジャンプまで
                vy = jumpForce;
                jumpCount++;
            } else {
                // ジャンプできない場合はこのアクション無効
                return null;
            }
        }

        // フレーム経過
        for (let i = 0; i < frames; i++) {
            // 移動
            x += this.speed;
            vy += gravity;
            y += vy;

            // 地面判定
            const groundY = this.terrain ? this.terrain.getHeightAtX(x) : this.canvasHeight;
            if (y + playerHeight / 2 > groundY) {
                y = groundY - playerHeight / 2;
                vy = 0;
                jumpCount = 0; // 着地リセット
            }

            // 天井判定
            if (y - playerHeight / 2 < 0) {
                return null; // 天井衝突は死あるいは無効
            }

            // 障害物衝突判定
            // newObstacles + 既存のobstacles(特にビーム) も考慮すべきだが今回は新規のみ
            // 簡易AABB
            const pLeft = x - playerWidth / 2 + 5;
            const pRight = x + playerWidth / 2 - 5;
            const pTop = y - playerHeight / 2 + 5;
            const pBottom = y + playerHeight / 2 - 2.5;

            for (const obs of obstacles) {
                const b = obs.getBounds();

                // 衝突チェック
                if (pRight > b.x && pLeft < b.x + b.width &&
                    pBottom > b.y && pTop < b.y + b.height) {
                    return null; // 衝突死
                }
            }
        }

        return { x, y, vy, jumpCount };
    }

    // 追尾ビームとの干渉をチェック（追加ロジック）
    // ensurePassableGap内で呼び出される
    checkBeamInterference(obstacle, groundHeight) {
        // アクティブなビームを取得
        const activeBeams = this.obstacles.filter(obs => obs.type === 'tracking_beam' && !obs.markedForDeletion);

        if (activeBeams.length === 0) return true;

        const bounds = obstacle.getBounds();
        const playerJumpHeight = 140; // ジャンプで超えるのに必要な高さ
        const playerHeight = 60;

        for (const beam of activeBeams) {
            const beamTop = beam.y - beam.height / 2;
            const beamBottom = beam.y + beam.height / 2;

            // 1. 直接的な衝突チェック
            // 障害物とビームが重なっていたらNG
            if (bounds.y < beamBottom && bounds.y + bounds.height > beamTop) {
                return false;
            }

            // 2. 通行可能領域の確保
            // ビームによって画面が上下に分断される
            // 障害物は「ビームの上」か「ビームの下」のどちらかに収まる必要がある

            const isAboveBeam = bounds.y + bounds.height <= beamTop;
            const isBelowBeam = bounds.y >= beamBottom;

            if (!isAboveBeam && !isBelowBeam) {
                // 部分的に重なっている（衝突チェックで弾かれるはずだが念のため）
                return false;
            }

            // 3. ルート封鎖チェック
            if (isBelowBeam) {
                // ビームの下にある障害物
                // 「ジャンプして超えられるか？」
                // 障害物の上端からビームの下端までの距離が、ジャンプ高さより小さいと頭をぶつける
                // ただし、もし障害物が「下を通れる（浮遊）」ならOKだが、wall等はNG

                const gapToBeam = beamTop - bounds.y; // 障害物の上端が基準（bounds.yは上端）

                // 地面設置型（飛び越える必要があるもの）
                const groundTypes = ['spike', 'bouncing_ball', 'wall', 'jump_pad', 'fake_wall', 'single_block'];

                if (groundTypes.includes(obstacle.type)) {
                    // 障害物の上端とビームの下端の隙間をチェック
                    // 障害物は bottom が地面(groundHeight)にあると仮定、あるいは bounds.y + height が地面付近
                    // 実際には bounds.y は障害物の上端

                    const clearance = beamTop - bounds.y;

                    // プレイヤーが飛び越える隙間がない（頭上のビームに当たる）
                    if (clearance < playerHeight + 20) {
                        return false;
                    }

                    // ジャンプの頂点がビームに届いてしまうような高さの障害物は危険
                    // 障害物の高さ + プレイヤーのジャンプ高さ > 地面からビームまでの高さ
                    // => ぶつかる可能性がある
                }
            }

            if (isAboveBeam) {
                // ビームの上にある障害物
                // プレイヤーがビームの上を走っている（あるいは飛んでいる）想定
                // 天井(y=0)との隙間が十分か？（これは既存ロジックでチェック済み）

                // ビームを「擬似的な地面」と見立てた場合のチェックが必要かも
            }
        }

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
        let currentY = groundHeight - 100;

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

    // -----------------------------------------------------
    // 新規追加ステージ (パターン1〜10)
    // -----------------------------------------------------

    // Pattern 1: レーザー回廊 (高さ違いのレーザーを連続配置)
    spawnPattern1(spawnX, groundHeight) {
        const obs = [];
        // 1. 低いレーザー
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'horizontal_laser', groundHeight - 40));
        // 2. 高いレーザー
        obs.push(new Obstacle(spawnX + 200, this.canvasHeight, 'horizontal_laser', groundHeight - 120));
        // 3. 再び低いレーザー
        obs.push(new Obstacle(spawnX + 400, this.canvasHeight, 'horizontal_laser', groundHeight - 40));
        return obs;
    }

    // Pattern 2: ダブルウォール (狭い隙間)
    spawnPattern2(spawnX, groundHeight) {
        const obs = [];
        const gap = 140; // ジャンプで越えられる隙間
        // 1. 最初の壁
        const wall1 = new Obstacle(spawnX, this.canvasHeight, 'wall', groundHeight);
        wall1.resize(50, 80);
        wall1.y = groundHeight - 80;
        obs.push(wall1);

        // 2. 2番目の壁
        const wall2 = new Obstacle(spawnX + 150, this.canvasHeight, 'wall', groundHeight);
        wall2.resize(50, 100);
        wall2.y = groundHeight - 100;
        obs.push(wall2);

        // 3. ジャンプ台（救済）
        obs.push(new Obstacle(spawnX + 75, this.canvasHeight, 'jump_pad', groundHeight));

        return obs;
    }

    // Pattern 3: 浮遊ステップ (小さな足場渡り)
    spawnPattern3(spawnX, groundHeight) {
        const obs = [];
        const startY = groundHeight - 60;

        for (let i = 0; i < 3; i++) {
            const step = new Obstacle(spawnX + i * 180, this.canvasHeight, 'single_block');
            step.y = startY - i * 30;
            obs.push(step);

            // 下にスパイク
            obs.push(new Obstacle(spawnX + i * 180, this.canvasHeight, 'spike', groundHeight));
        }
        return obs;
    }

    // Pattern 4: スパイク・ピット・ラン (長いトゲ地帯と極小足場)
    spawnPattern4(spawnX, groundHeight) {
        const obs = [];
        // 長いトゲ
        const spikeCount = 5;
        for (let i = 0; i < spikeCount; i++) {
            obs.push(new Obstacle(spawnX + i * 40, this.canvasHeight, 'spike', groundHeight));
        }

        // 中央に退避用足場 (single_block)
        const safeBlock = new Obstacle(spawnX + 100, this.canvasHeight, 'single_block', groundHeight - 80);
        safeBlock.y = groundHeight - 80;
        obs.push(safeBlock);

        return obs;
    }

    // Pattern 5: ビームラッシュ (警告付きビームの連続)
    spawnPattern5(spawnX, groundHeight) {
        // 短い間隔でフラッシュレーザーを配置
        const obs = [];
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'flash_laser'));
        obs.push(new Obstacle(spawnX + 300, this.canvasHeight, 'flash_laser'));

        // 地上には邪魔なボール
        obs.push(new Obstacle(spawnX + 150, this.canvasHeight, 'bouncing_ball', groundHeight));
        return obs;
    }

    // Pattern 6: サークルストリーム (拡散リングの列)
    spawnPattern6(spawnX, groundHeight) {
        const obs = [];
        // 空中にリングを配置
        const y = Math.max(100, groundHeight - 150);
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'expanding_ring', y));
        obs.push(new Obstacle(spawnX + 250, this.canvasHeight, 'expanding_ring', y));

        // 地上にはスパイク
        obs.push(new Obstacle(spawnX + 125, this.canvasHeight, 'spike', groundHeight));
        return obs;
    }

    // Pattern 7: ジグザグウォール (上下の壁)
    spawnPattern7(spawnX, groundHeight) {
        const obs = [];
        // 下の壁
        const wallLow = new Obstacle(spawnX, this.canvasHeight, 'wall', groundHeight);
        wallLow.resize(50, 70);
        wallLow.y = groundHeight - 70;
        obs.push(wallLow);

        // 上の壁（吊り天井）
        const wallHigh = new Obstacle(spawnX + 200, this.canvasHeight, 'wall');
        wallHigh.resize(50, 150);
        wallHigh.y = 75; // 天井からぶら下がる
        obs.push(wallHigh);

        return obs;
    }

    // Pattern 8: スピードゲート (加速してくぐる)
    spawnPattern8(spawnX, groundHeight) {
        const obs = [];
        // 上下にレーザーで挟む
        const yLow = groundHeight - 30;
        const yHigh = groundHeight - 120;

        obs.push(new Obstacle(spawnX, this.canvasHeight, 'horizontal_laser', yLow));
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'horizontal_laser', yHigh));

        // 中央を通ることを強要
        // パワーアップ（スピード）があれば良いが、障害物としては「間を通るリング」などを配置
        const ring = new Obstacle(spawnX + 150, this.canvasHeight, 'expanding_ring', groundHeight - 75);
        obs.push(ring);

        return obs;
    }

    // Pattern 9: プレシジョン・ジャンプ (精密動作)
    spawnPattern9(spawnX, groundHeight) {
        const obs = [];
        // 非常に狭い足場
        const block = new Obstacle(spawnX, this.canvasHeight, 'single_block');
        block.y = groundHeight - 60;
        obs.push(block);

        // その直後に上下の脅威
        const spike = new Obstacle(spawnX + 120, this.canvasHeight, 'spike', groundHeight);
        obs.push(spike);
        const ball = new Obstacle(spawnX + 120, this.canvasHeight, 'bouncing_ball');
        ball.y = groundHeight - 140; // 上から降ってくる想定
        obs.push(ball);

        return obs;
    }

    // Pattern 10: ボスウェーブ (複合壁)
    spawnPattern10(spawnX, groundHeight) {
        const obs = [];
        // 巨大な壁と穴
        const bigWall = new Obstacle(spawnX, this.canvasHeight, 'wall');
        bigWall.resize(60, 200);
        bigWall.y = groundHeight - 200;
        obs.push(bigWall);

        // 壁の手前にジャンプ台
        obs.push(new Obstacle(spawnX - 100, this.canvasHeight, 'jump_pad', groundHeight));

        // 壁の向こうにスパイク
        obs.push(new Obstacle(spawnX + 80, this.canvasHeight, 'spike', groundHeight));

        return obs;
    }

    // Pattern 11: 天空への階段 (高高度へ登る)
    spawnPattern11(spawnX, groundHeight) {
        const obs = [];
        const startY = groundHeight - 50;

        for (let i = 0; i < 5; i++) {
            const block = new Obstacle(spawnX + i * 120, this.canvasHeight, 'single_block', startY - i * 40);
            block.y = startY - i * 40;
            obs.push(block);
        }

        // 頂上に報酬代わりの安全な足場
        const topPlatform = new Obstacle(spawnX + 5 * 120, this.canvasHeight, 'wall');
        topPlatform.resize(100, 40);
        topPlatform.y = startY - 5 * 40;
        obs.push(topPlatform);

        return obs;
    }

    // Pattern 12: トンネル (狭い通路)
    spawnPattern12(spawnX, groundHeight) {
        const obs = [];
        // 天井のような壁を長く配置
        for (let i = 0; i < 3; i++) {
            const ceiling = new Obstacle(spawnX + i * 200, this.canvasHeight, 'wall');
            ceiling.resize(200, 200);
            ceiling.y = 0; // 画面上端
            obs.push(ceiling);
        }

        // 床に散発的なスパイク
        obs.push(new Obstacle(spawnX + 150, this.canvasHeight, 'spike', groundHeight));
        obs.push(new Obstacle(spawnX + 450, this.canvasHeight, 'spike', groundHeight));

        return obs;
    }

    // Pattern 13: マインフィールド (空中の機雷原)
    spawnPattern13(spawnX, groundHeight) {
        const obs = [];
        // 回転刃をランダムに配置
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'rotating_blade', groundHeight - 60));
        obs.push(new Obstacle(spawnX + 150, this.canvasHeight, 'rotating_blade', groundHeight - 120));
        obs.push(new Obstacle(spawnX + 300, this.canvasHeight, 'rotating_blade', groundHeight - 60));

        // 地面は安全（ジャンプすると危ない）
        return obs;
    }

    // Pattern 14: 三択ゲート (上・中・下、正解は一つ)
    spawnPattern14(spawnX, groundHeight) {
        const obs = [];
        // 上段：レーザー
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'horizontal_laser', groundHeight - 150));
        // 中段：ボール（動く）
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'bouncing_ball', groundHeight - 80));
        // 下段：スパイク
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'spike', groundHeight));

        // 回避策として手前にジャンプ台
        obs.push(new Obstacle(spawnX - 100, this.canvasHeight, 'jump_pad', groundHeight));

        return obs;
    }

    // Pattern 15: スピードバンプ (連続する低い壁)
    spawnPattern15(spawnX, groundHeight) {
        const obs = [];
        for (let i = 0; i < 4; i++) {
            const wall = new Obstacle(spawnX + i * 150, this.canvasHeight, 'wall', groundHeight);
            wall.resize(30, 60); // 幅30, 高さ60
            wall.y = groundHeight - 60;
            obs.push(wall);
        }
        return obs;
    }

    // Pattern 16: 信仰の跳躍 (大穴)
    spawnPattern16(spawnX, groundHeight) {
        const obs = [];
        // スタート地点
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'wall', groundHeight));

        // 巨大な空間（障害物なし）
        // 落下死用の判定はこのゲームにはないので、スパイクを敷き詰める
        for (let i = 0; i < 4; i++) {
            obs.push(new Obstacle(spawnX + 150 + i * 50, this.canvasHeight, 'spike', groundHeight));
        }

        // ゴール地点（高い）
        const goal = new Obstacle(spawnX + 450, this.canvasHeight, 'wall', groundHeight);
        goal.resize(100, 150);
        goal.y = groundHeight - 150;
        obs.push(goal);

        // ジャンプ台
        obs.push(new Obstacle(spawnX + 80, this.canvasHeight, 'jump_pad', groundHeight));

        return obs;
    }

    // Pattern 17: ウェーブライダー (波状配置)
    spawnPattern17(spawnX, groundHeight) {
        const obs = [];
        // y = sin(x) のように配置
        for (let i = 0; i < 5; i++) {
            const midY = groundHeight - 100;
            const y = midY + Math.sin(i) * 50;
            const ball = new Obstacle(spawnX + i * 80, this.canvasHeight, 'single_block');
            ball.y = y;
            obs.push(ball);
        }
        return obs;
    }

    // Pattern 18: 挟撃 (上下からの圧迫)
    spawnPattern18(spawnX, groundHeight) {
        const obs = [];
        // 上の壁
        const topWall = new Obstacle(spawnX, this.canvasHeight, 'wall');
        topWall.resize(50, 200);
        topWall.y = 50;
        obs.push(topWall);

        // 下の壁
        const bottomWall = new Obstacle(spawnX, this.canvasHeight, 'wall', groundHeight);
        bottomWall.resize(50, 150);
        bottomWall.y = groundHeight - 150;
        obs.push(bottomWall);

        // 通れる隙間は y=250〜y=450 付近

        // 隙間にコイン代わりのリング
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'expanding_ring', 300));

        return obs;
    }

    // Pattern 19: 空中庭園 (雲と浮遊岩)
    spawnPattern19(spawnX, groundHeight) {
        const obs = [];
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'jump_cloud', groundHeight - 100));
        obs.push(new Obstacle(spawnX + 180, this.canvasHeight, 'floating_high', groundHeight - 150));
        obs.push(new Obstacle(spawnX + 360, this.canvasHeight, 'jump_cloud', groundHeight - 200));
        return obs;
    }

    // Pattern 20: 最終防衛線 (複合要塞)
    spawnPattern20(spawnX, groundHeight) {
        const obs = [];
        // レーザーフェンス
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'flash_laser'));

        // 壁
        const wall = new Obstacle(spawnX + 250, this.canvasHeight, 'wall', groundHeight);
        wall.resize(80, 120);
        wall.y = groundHeight - 120;
        obs.push(wall);

        // 壁の上に回転刃
        const blade = new Obstacle(spawnX + 250, this.canvasHeight, 'rotating_blade');
        blade.y = wall.y - 60;
        obs.push(blade);

        return obs;
    }

    // Pattern 21: 高速スラローム (上下の壁とレーザー)
    spawnPattern21(spawnX, groundHeight) {
        const obs = [];
        // 上下に互い違いの壁
        const topWall = new Obstacle(spawnX, this.canvasHeight, 'wall');
        topWall.resize(80, 200);
        topWall.y = -50; // 天井から突き出し
        obs.push(topWall);

        const bottomWall = new Obstacle(spawnX + 300, this.canvasHeight, 'wall', groundHeight);
        bottomWall.resize(80, 150);
        bottomWall.y = groundHeight - 150;
        obs.push(bottomWall);

        // 間を縫うレーザー
        const laser = new Obstacle(spawnX + 150, this.canvasHeight, 'horizontal_laser', 300);
        laser.width = 100;
        obs.push(laser);

        return obs;
    }

    // Pattern 22: スパイラル・ヘル (回転刃の嵐)
    spawnPattern22(spawnX, groundHeight) {
        const obs = [];
        // 地面にトゲ
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'spike', groundHeight));
        obs.push(new Obstacle(spawnX + 400, this.canvasHeight, 'spike', groundHeight));

        // 空中に回転刃を大量配置
        for (let i = 0; i < 3; i++) {
            const blade = new Obstacle(spawnX + 100 + i * 100, this.canvasHeight, 'rotating_blade');
            blade.y = groundHeight - 120 - (i % 2) * 80; // ジグザグ配置
            obs.push(blade);
        }
        return obs;
    }

    // Pattern 23: レーザーネット (格子状ビーム)
    spawnPattern23(spawnX, groundHeight) {
        const obs = [];
        // 縦ビーム
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'laser'));
        obs.push(new Obstacle(spawnX + 400, this.canvasHeight, 'laser'));

        // 横ビーム (高さ違い)
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'horizontal_laser', groundHeight - 80));
        obs.push(new Obstacle(spawnX + 200, this.canvasHeight, 'horizontal_laser', groundHeight - 160));

        // 安全地帯となる小さな足場
        const platform = new Obstacle(spawnX + 200, this.canvasHeight, 'single_block');
        platform.y = groundHeight - 200; // 高い位置
        obs.push(platform);

        return obs;
    }

    // Pattern 24: デス・プレッシャー (追尾ビームとの競走)
    spawnPattern24(spawnX, groundHeight) {
        const obs = [];
        // 追尾ビーム（地面すれすれ）
        // プレイヤーが退避できるよう、ビームの発生を遅らせる (spawnX + 600)
        const beam = new Obstacle(spawnX + 600, this.canvasHeight, 'tracking_beam', groundHeight - 10);
        obs.push(beam);

        // 退避用の雲（ビームより手前から配置）
        // 地面→雲へ飛び乗るためのステップ
        obs.push(new Obstacle(spawnX + 100, this.canvasHeight, 'jump_cloud', groundHeight - 90));

        // 連続する雲
        for (let i = 1; i < 5; i++) {
            const cloud = new Obstacle(spawnX + 100 + i * 160, this.canvasHeight, 'jump_cloud', groundHeight - 150 - (i % 2) * 40);
            obs.push(cloud);
        }
        return obs;
    }

    // Pattern 25: カオス・フィナーレ (全種混合)
    spawnPattern25(spawnX, groundHeight) {
        const obs = [];
        // スパイク
        obs.push(new Obstacle(spawnX, this.canvasHeight, 'spike', groundHeight));

        // リング
        obs.push(new Obstacle(spawnX + 100, this.canvasHeight, 'expanding_ring', groundHeight - 150));

        // 偽の壁
        const fake = new Obstacle(spawnX + 300, this.canvasHeight, 'fake_wall', groundHeight);
        obs.push(fake);

        // その上にスパイラル
        const spiral = new Obstacle(spawnX + 300, this.canvasHeight, 'spiral');
        spiral.centerY = groundHeight - 200;
        obs.push(spiral);

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
        this.cooldownTimer = 0;
    }

    getObstacles() {
        return this.obstacles;
    }

    setThemeForPattern(pId) {
        // パターンに応じた背景色と音楽の設定（プレースホルダー）
        let color = 'rgba(10, 14, 39, 0.3)'; // デフォルト (Deep Blue)

        if (pId === 21) color = 'rgba(50, 10, 10, 0.3)'; // Red (Slalom)
        else if (pId === 22) color = 'rgba(10, 50, 20, 0.3)'; // Green (Spiral)
        else if (pId === 23) color = 'rgba(0, 20, 60, 0.3)'; // Cyan/Blue (Laser Net)
        else if (pId === 24) color = 'rgba(60, 30, 0, 0.3)'; // Orange (Death Pressure)
        else if (pId === 25) color = 'rgba(40, 0, 60, 0.3)'; // Purple (Chaos)
        else if (pId > 10) color = 'rgba(20, 25, 50, 0.3)'; // Slightly brighter blue for mid stages

        this.currentThemeColor = color;
        // 音楽変更
        if (this.audioManager) {
            this.audioManager.playTheme(pId);
        }
    }

    spawnSpecificPattern(pId, spawnX, groundHeight) {
        this.setThemeForPattern(pId);
        switch (pId) {
            case 1: return this.spawnPattern1(spawnX, groundHeight);
            case 2: return this.spawnPattern2(spawnX, groundHeight);
            case 3: return this.spawnPattern3(spawnX, groundHeight);
            case 4: return this.spawnPattern4(spawnX, groundHeight);
            case 5: return this.spawnPattern5(spawnX, groundHeight);
            case 6: return this.spawnPattern6(spawnX, groundHeight);
            case 7: return this.spawnPattern7(spawnX, groundHeight);
            case 8: return this.spawnPattern8(spawnX, groundHeight);
            case 9: return this.spawnPattern9(spawnX, groundHeight);
            case 10: return this.spawnPattern10(spawnX, groundHeight);
            case 11: return this.spawnPattern11(spawnX, groundHeight);
            case 12: return this.spawnPattern12(spawnX, groundHeight);
            case 13: return this.spawnPattern13(spawnX, groundHeight);
            case 14: return this.spawnPattern14(spawnX, groundHeight);
            case 15: return this.spawnPattern15(spawnX, groundHeight);
            case 16: return this.spawnPattern16(spawnX, groundHeight);
            case 17: return this.spawnPattern17(spawnX, groundHeight);
            case 18: return this.spawnPattern18(spawnX, groundHeight);
            case 19: return this.spawnPattern19(spawnX, groundHeight);
            case 20: return this.spawnPattern20(spawnX, groundHeight);
            case 21: return this.spawnPattern21(spawnX, groundHeight);
            case 22: return this.spawnPattern22(spawnX, groundHeight);
            case 23: return this.spawnPattern23(spawnX, groundHeight);
            case 24: return this.spawnPattern24(spawnX, groundHeight);
            case 25: return this.spawnPattern25(spawnX, groundHeight);
            default: return this.spawnPattern1(spawnX, groundHeight);
        }
    }
}
