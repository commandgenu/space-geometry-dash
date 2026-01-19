// メインエントリーポイント
let game;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);

    // ベストスコアを表示
    document.getElementById('bestScore').textContent = game.bestScore;

    // イベントリスナーの設定
    setupEventListeners();
});

function setupEventListeners() {
    // 難易度選択ボタン
    document.getElementById('easyBtn').addEventListener('click', () => {
        const isDemo = document.getElementById('previewModeToggle').checked;
        startGame('easy', isDemo);
    });
    document.getElementById('normalBtn').addEventListener('click', () => {
        const isDemo = document.getElementById('previewModeToggle').checked;
        startGame('normal', isDemo);
    });
    document.getElementById('hardBtn').addEventListener('click', () => {
        const isDemo = document.getElementById('previewModeToggle').checked;
        startGame('hard', isDemo);
    });
    document.getElementById('extremeBtn').addEventListener('click', () => {
        const isDemo = document.getElementById('previewModeToggle').checked;
        startGame('extreme', isDemo);
    });

    // リトライボタン
    document.getElementById('retryBtn').addEventListener('click', retryGame);

    // メニューボタン
    document.getElementById('menuBtn').addEventListener('click', showMenu);

    // ポーズ関連ボタン
    document.getElementById('pauseBtn').addEventListener('click', (e) => {
        e.stopPropagation(); // ゲームキャンバスのクリックイベントへの伝播を防ぐ
        game.togglePause();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
        game.togglePause();
    });

    document.getElementById('exitBtn').addEventListener('click', () => {
        game.returnToTitle();
        // ポーズメニューを隠す
        document.getElementById('pauseMenu').classList.add('hidden');
    });

    // キーボード入力(Escキーでポーズ)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (game.state === 'playing') {
                game.togglePause();
            }
        }
    });

    // キーボード入力(スペースキー)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (game.state === 'playing' && !game.paused) {
                game.handleJump();
            }
        }
    });

    // マウスクリック/タッチ
    document.getElementById('gameCanvas').addEventListener('click', () => {
        if (game.state === 'playing' && !game.paused) {
            game.handleJump();
        }
    });

    // タッチイベント(モバイル対応)
    document.getElementById('gameCanvas').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (game.state === 'playing' && !game.paused) {
            game.handleJump();
        }
    });
}

function startGame(difficulty, isDemo) {
    if (game.audioManager) game.audioManager.init();
    // スタート画面を非表示
    document.getElementById('startScreen').classList.add('hidden');

    // ゲーム画面を表示
    document.getElementById('gameScreen').classList.remove('hidden');

    // ゲーム開始
    game.start(difficulty, isDemo);
}

function retryGame() {
    if (game.audioManager) game.audioManager.init();
    // ゲームオーバー画面を非表示
    document.getElementById('gameOverScreen').classList.add('hidden');

    // ゲーム画面を表示
    document.getElementById('gameScreen').classList.remove('hidden');

    // ゲーム再開
    game.start();
}

function showMenu() {
    if (game.audioManager) game.audioManager.stopMusic();
    // ゲームオーバー画面を非表示
    document.getElementById('gameOverScreen').classList.add('hidden');

    // スタート画面を表示
    document.getElementById('startScreen').classList.remove('hidden');
}
