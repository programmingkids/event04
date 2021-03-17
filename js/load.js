// 画像読込のシーン
class LoadScene extends Phaser.Scene {
    constructor() {
        super({key : 'LoadScene'});
    }

    preload() {
        // スタート画像
        this.load.image('gamestart', 'assets/images/gamestart.gif');
        // ゲームオーバー画像
        this.load.image('gameover', 'assets/images/gameover.png');
        // ゲームクリア画像
        this.load.image('gameclear', 'assets/images/gameclear.png');
        
        // マップデータ
        this.load.tilemapTiledJSON('map2', 'assets/data/map2.json');
        // マップ画像
        this.load.image('map-tiles', 'assets/images/map-tiles.png');
        // ピル画像
        this.load.image("pill", 'assets/images/pill.png');
        // パックマン画像
        this.load.spritesheet('pacman', 'assets/images/pacman.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
        // ゴースト画像
        this.load.spritesheet('ghost-blue', 'assets/images/ghost-blue.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
        this.load.spritesheet('ghost-cyan', 'assets/images/ghost-cyan.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
        this.load.spritesheet('ghost-green', 'assets/images/ghost-green.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
        this.load.spritesheet('ghost-orange', 'assets/images/ghost-orange.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
        this.load.spritesheet('ghost-red', 'assets/images/ghost-red.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
    }
    
    create() {
        this.scene.start("StartScene");
    }
}

export default LoadScene;
