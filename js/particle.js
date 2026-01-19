// パーティクルクラス - 星のきらめき、爆発エフェクト、トレイルを管理
class Particle {
    constructor(x, y, type = 'trail', customColor = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;

        if (type === 'trail') {
            // トレイルパーティクル
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 3 + 2;
            this.decay = 0.02;
            this.color = customColor || `hsl(${180 + Math.random() * 60}, 100%, 70%)`;
        } else if (type === 'explosion') {
            // 爆発パーティクル
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 4 + 3;
            this.decay = 0.015;
            this.color = customColor || `hsl(${Math.random() * 60 + 300}, 100%, 60%)`;
        } else if (type === 'star') {
            // 星のきらめき
            this.vx = 0;
            this.vy = 0;
            this.size = Math.random() * 2 + 1;
            this.decay = 0.01;
            this.color = '#ffffff';
            this.twinkle = Math.random() * Math.PI * 2;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.type === 'star') {
            this.twinkle += 0.1;
        }

        // 重力効果(爆発パーティクルのみ)
        if (this.type === 'explosion') {
            this.vy += 0.1;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;

        if (this.type === 'star') {
            // きらめき効果
            const twinkleAlpha = (Math.sin(this.twinkle) + 1) / 2;
            ctx.globalAlpha = this.life * twinkleAlpha;
        }

        // グロー効果
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// パーティクルシステム管理クラス
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addParticle(x, y, type = 'trail') {
        this.particles.push(new Particle(x, y, type));
    }

    addExplosion(x, y, count = 20, customColor = null) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, 'explosion', customColor));
        }
    }

    addTrail(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, 'trail'));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}
