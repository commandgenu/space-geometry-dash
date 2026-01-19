// 地形クラス - ステージの高低差を管理
class Terrain {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.baseHeight = canvasHeight * 0.75; // 基本の地面の高さ
        this.points = [];
        this.segmentWidth = 50; // 各地形セグメントの幅
        this.speed = 7.5; // 地形のスクロール速度
        this.offset = 0;

        // 地形パターンの種類
        this.patterns = ['flat', 'hill', 'valley', 'stairs_up', 'stairs_down', 'wave'];
        this.currentPatternIndex = 0;
        this.patternLength = 0;
        this.patternProgress = 0;

        this.initTerrain();
    }

    initTerrain() {
        // 初期地形ポイントを生成
        const numPoints = Math.ceil(this.canvasWidth / this.segmentWidth) + 5;
        for (let i = 0; i < numPoints; i++) {
            this.points.push({
                x: i * this.segmentWidth,
                y: this.baseHeight
            });
        }
    }

    update() {
        // 地形を左にスクロール
        this.offset += this.speed;

        // 各ポイントを移動
        for (let point of this.points) {
            point.x -= this.speed;
        }

        // 画面外に出たポイントを削除し、新しいポイントを追加
        while (this.points.length > 0 && this.points[0].x < -this.segmentWidth) {
            this.points.shift();
        }

        // 新しいポイントを追加 (障害物生成のために画面外の遠くまで生成しておく)
        while (this.points[this.points.length - 1].x < this.canvasWidth * 2) {
            this.addNewPoint();
        }
    }

    addNewPoint() {
        const lastPoint = this.points[this.points.length - 1];
        const newX = lastPoint.x + this.segmentWidth;
        let newY;

        // パターンが終了したら新しいパターンを選択
        if (this.patternProgress >= this.patternLength) {
            this.selectNewPattern();
        }

        // 現在のパターンに基づいて高さを決定
        newY = this.getHeightForPattern(this.patternProgress);
        this.patternProgress++;

        this.points.push({
            x: newX,
            y: newY
        });
    }

    selectNewPattern() {
        // ランダムに新しいパターンを選択
        const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
        this.currentPattern = pattern;

        // パターンの長さを設定
        switch (pattern) {
            case 'flat':
                this.patternLength = Math.floor(Math.random() * 5) + 3; // 3-7セグメント
                break;
            case 'hill':
            case 'valley':
                this.patternLength = Math.floor(Math.random() * 6) + 6; // 6-11セグメント
                break;
            case 'stairs_up':
            case 'stairs_down':
                this.patternLength = Math.floor(Math.random() * 4) + 4; // 4-7セグメント
                break;
            case 'wave':
                this.patternLength = Math.floor(Math.random() * 8) + 8; // 8-15セグメント
                break;
        }

        this.patternProgress = 0;
        this.patternStartHeight = this.points[this.points.length - 1].y;
    }

    getHeightForPattern(progress) {
        const maxHeightVariation = this.canvasHeight * 0.25; // 最大高低差
        const minHeight = this.canvasHeight * 0.55; // 最小高さ（画面上部）
        const maxHeight = this.canvasHeight * 0.85; // 最大高さ（画面下部）

        let height;
        const t = progress / this.patternLength; // 0から1の進行度

        switch (this.currentPattern) {
            case 'flat':
                height = this.patternStartHeight;
                break;

            case 'hill':
                // 山型（サイン波の前半）
                height = this.patternStartHeight - Math.sin(t * Math.PI) * maxHeightVariation;
                break;

            case 'valley':
                // 谷型（サイン波の後半を反転）
                height = this.patternStartHeight + Math.sin(t * Math.PI) * maxHeightVariation;
                break;

            case 'stairs_up':
                // 階段状に上昇
                const stepUp = Math.floor(t * 4) / 4;
                height = this.patternStartHeight - stepUp * maxHeightVariation;
                break;

            case 'stairs_down':
                // 階段状に下降
                const stepDown = Math.floor(t * 4) / 4;
                height = this.patternStartHeight + stepDown * maxHeightVariation;
                break;

            case 'wave':
                // 波状
                height = this.patternStartHeight + Math.sin(t * Math.PI * 4) * (maxHeightVariation * 0.5);
                break;

            default:
                height = this.baseHeight;
        }

        // 高さを制限
        return Math.max(minHeight, Math.min(maxHeight, height));
    }

    draw(ctx) {
        ctx.save();

        // 地形の塗りつぶし
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.canvasHeight);

        // 地形の輪郭を描画
        for (let i = 0; i < this.points.length; i++) {
            if (i === 0) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            } else {
                // スムーズな曲線で接続
                const prevPoint = this.points[i - 1];
                const currentPoint = this.points[i];
                const controlX = (prevPoint.x + currentPoint.x) / 2;
                const controlY = (prevPoint.y + currentPoint.y) / 2;
                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
            }
        }

        // 最後のポイントから画面下部へ
        const lastPoint = this.points[this.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(lastPoint.x, this.canvasHeight);
        ctx.closePath();

        // グラデーション塗りつぶし
        const gradient = ctx.createLinearGradient(0, this.canvasHeight * 0.5, 0, this.canvasHeight);
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)'); // 紫
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.5)'); // インディゴ
        gradient.addColorStop(1, 'rgba(25, 25, 112, 0.7)'); // ミッドナイトブルー
        ctx.fillStyle = gradient;
        ctx.fill();

        // 地形の輪郭線
        ctx.strokeStyle = '#b24bf3';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#b24bf3';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            const prevPoint = this.points[i - 1];
            const currentPoint = this.points[i];
            const controlX = (prevPoint.x + currentPoint.x) / 2;
            const controlY = (prevPoint.y + currentPoint.y) / 2;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
        }
        ctx.stroke();

        // グリッドラインを追加（サイバーな雰囲気）
        ctx.strokeStyle = 'rgba(178, 75, 243, 0.2)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(this.points[i].x, this.points[i].y);
                ctx.lineTo(this.points[i].x, this.canvasHeight);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // 指定されたX座標での地形の高さを取得
    getHeightAtX(x) {
        // xの位置に最も近い2つのポイントを見つける
        for (let i = 0; i < this.points.length - 1; i++) {
            if (x >= this.points[i].x && x <= this.points[i + 1].x) {
                // 線形補間で高さを計算
                const t = (x - this.points[i].x) / (this.points[i + 1].x - this.points[i].x);
                return this.points[i].y + (this.points[i + 1].y - this.points[i].y) * t;
            }
        }

        // 範囲外の場合は基本の高さを返す
        return this.baseHeight;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    reset() {
        this.points = [];
        this.offset = 0;
        this.patternProgress = 0;
        this.patternLength = 0;
        this.initTerrain();
    }
}
