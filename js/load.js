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
        this.load.image('gameclear', 'assets/images/gameclear.png');
        
        this.load.tilemapTiledJSON('map1', 'assets/data/map1.json');
        this.load.image('tiles', 'assets/images/tiles.png');
        this.load.image("pill", 'assets/images/pill.png');
        this.load.spritesheet('pacman', 'assets/images/pacman.png', { 
            frameWidth: 32, 
            frameHeight: 32,
        });
    }
    
    create() {
        this.scene.start("StartScene");
    }
}

export default LoadScene;
