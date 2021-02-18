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
        
        this.load.spritesheet('pacman-spritesheet', 'assets/images/pacmansprites.png', { frameWidth: 32, frameHeight: 32 });
        this.load.tilemapTiledJSON('map',           'assets/levels/codepen-level.json');
        this.load.image('pacman-tiles',             'assets/images/background.png');
        this.load.image("pill",                     'assets/images/pill.png');
    }
    
    create() {
        this.scene.start("StartScene");
    }
}

export default LoadScene;
