// スタート画面のシーン
class StartScene extends Phaser.Scene {
    constructor() {
        super({key : 'StartScene'});
    }
    
    create() {
        // スタート画像表示
        this.gamestart = this.add.image(400, 300, 'gamestart');
        this.gamestart.setDisplaySize(300,300);
        // キーをクリックするとゲームスタート
        this.input.keyboard.on('keydown', function(event) {
            this.scene.start('MainScene');
        }, this);
    }
}

export default StartScene;
