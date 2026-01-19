// オーディオ管理クラス（Web Audio APIを使用）
class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.currentOscillators = [];
        this.currentInterval = null;
        this.isMuted = false;
        this.bgmVolume = 0.3;
        this.currentPatternId = -1;
    }

    // オーディオコンテキストの初期化（ユーザー操作後に呼ぶ必要あり）
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.bgmVolume;
            this.masterGain.connect(this.ctx.destination);
        } else if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 音楽を停止
    stopMusic() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
        this.stopOscillators();
        this.currentPatternId = -1;
    }

    // オシレーターを全停止
    stopOscillators() {
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) { }
        });
        this.currentOscillators = [];
    }

    // パターンに応じた音楽を再生
    playTheme(pId) {
        // 同じパターンの場合は再生しない（ループ維持）
        // ただし、EXTREMEモードではパターンが次々変わるので、
        // 毎回切り替えると目まぐるしいかもしれないが、要望通り「ステージごとの音楽」をやる。

        // 同じグループなら変えない、という手もあるが、
        // ユーザーは「音楽が出てない」と言っているため、まずは鳴らすことを優先。
        // パターンIDの変化を検知
        if (this.currentPatternId === pId) return;
        this.currentPatternId = pId;

        this.stopMusic();
        if (!this.ctx) return;

        // パターンIDに基づいてタイプ決定
        if (pId >= 21) {
            // 新ステージ群
            if (pId === 21) this.startLoop(140, 'sawtooth', [110, 110, 220, 110]); // Red: Fast Aggressive
            else if (pId === 22) this.startDrone([220, 330, 440], 'sine'); // Green: Swirly Drone
            else if (pId === 23) this.startArp(120, 'square', [440, 554, 659, 880]); // Blue: Techy
            else if (pId === 24) this.startLoop(160, 'sawtooth', [55, 0, 55, 110]); // Orange: Danger Low Bass
            else if (pId === 25) this.startChaos(); // Purple: Chaos
        } else if (pId >= 11) {
            // 中盤
            this.startArp(100, 'triangle', [200, 300, 400, 300]);
        } else {
            // 通常/序盤
            this.startDrone([110, 165], 'triangle'); // Ambient
        }
    }

    // ループシーケンサー（ベースライン等）
    startLoop(bpm, type, notes) {
        const intervalTime = (60 / bpm) * 1000 / 2; // 8分音符
        let index = 0;

        this.playTone(notes[0], type, 0.1);

        this.currentInterval = setInterval(() => {
            index = (index + 1) % notes.length;
            const freq = notes[index];
            if (freq > 0) {
                this.playTone(freq, type, 0.1);
            }
        }, intervalTime);
    }

    // アルペジエーター
    startArp(bpm, type, notes) {
        const intervalTime = (60 / bpm) * 1000 / 4; // 16分音符
        let index = 0;

        this.currentInterval = setInterval(() => {
            const freq = notes[index];
            this.playTone(freq, type, 0.1);
            index = (index + 1) % notes.length;
        }, intervalTime);
    }

    // 和音ドローン（持続音）
    startDrone(freqs, type) {
        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = f;
            gain.gain.value = 0.1 / freqs.length;

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            this.currentOscillators.push(osc);
            // ゲインも追跡できないとメモリリークするが、簡易実装のためstopOscillatorsでdisconnectされることを期待
            // (stopOscillatorsはoscのみ止める。gainはGC任せになる。厳密にはNodeGraph管理が必要だが省略)
        });
    }

    // カオスモード（ランダム）
    startChaos() {
        const intervalTime = 100;
        this.currentInterval = setInterval(() => {
            const freq = 100 + Math.random() * 800;
            const types = ['sawtooth', 'square', 'sine', 'triangle'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.playTone(freq, type, 0.1);
        }, intervalTime);
    }

    // 単音再生
    playTone(freq, type, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}
