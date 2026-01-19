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
    // スタートボタン
    document.getElementById('startBtn').addEventListener('click', startGame);

    // リトライボタン
    document.getElementById('retryBtn').addEventListener('click', retryGame);

    // メニューボタン
    document.getElementById('menuBtn').addEventListener('click', showMenu);

    // キーボード入力(スペースキー)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (game.state === 'playing') {
                game.handleJump();
            }
        }
    });

    // マウスクリック/タッチ
    document.getElementById('gameCanvas').addEventListener('click', () => {
        if (game.state === 'playing') {
            game.handleJump();
        }
    });

    // タッチイベント(モバイル対応)
    document.getElementById('gameCanvas').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (game.state === 'playing') {
            game.handleJump();
        }
    });
}

function startGame() {
    // スタート画面を非表示
    document.getElementById('startScreen').classList.add('hidden');

    // ゲーム画面を表示
    document.getElementById('gameScreen').classList.remove('hidden');

    // ゲーム開始
    game.start();
}

function retryGame() {
    // ゲームオーバー画面を非表示
    document.getElementById('gameOverScreen').classList.add('hidden');

    // ゲーム画面を表示
    document.getElementById('gameScreen').classList.remove('hidden');

    // ゲーム再開
    game.start();
}

function showMenu() {
    // ゲームオーバー画面を非表示
    document.getElementById('gameOverScreen').classList.add('hidden');

    // スタート画面を表示
    document.getElementById('startScreen').classList.remove('hidden');
}
