class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image) {
        super(scene, x, y, image);
        // シーンに追加
        this.scene.add.existing(this);
        // 物理エンジンの対象に追加
        this.scene.physics.add.existing(this);
        // 衝突範囲サイズの変更
        this.body.setSize(26, 26);
        // 表示サイズの変更
        this.setDisplaySize(26,26);
        
        // 引数の代入
        this.scene = scene;
        this.originalX = x;
        this.originalY = y;
        
        // 設定を呼び出す
        this.config();
        // アニメーション作成
        this.createAnimation();
        // アニメーション開始
        this.anims.play('stay', true);
    }
    
    update() {
        var cursors = this.scene.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.setTurn(Phaser.LEFT);
        } else if (cursors.right.isDown) {
            this.setTurn(Phaser.RIGHT);
        } else if (cursors.up.isDown) {
            this.setTurn(Phaser.UP);
        } else if (cursors.down.isDown) {
            this.setTurn(Phaser.DOWN);
        } else {
            this.setTurn(Phaser.NONE);   
        }
        
        this.setVelocity(this.moveTo.x * this.speed,  this.moveTo.y * this.speed);
        this.turn();
        
        if(this.x < 0 ) {
            this.setPosition(this.mapWidth, this.y);
        } else if(this.x > this.mapWidth) {
            this.setPosition(0, this.y);
        }
        if(this.y < 0) {
            this.setPosition(this.x, this.mapHeight);
        } else if(this.y > this.mapHeight) {
            this.setPosition(this.x, 0);
        }
    }
    
    config() {
        // 速度
        this.speed = 100;
        // スコア
        this.score = 0;
        // 移動開始しているかどうかのフラグ
        this.isActive = true;
        // 現在プレイ中かどうかのフラグ
        this.playing = false;
        // 回転角度
        this.angle = 0;
        // ライフ
        this.life = 3;
        // 以下は移動のためのデータ
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
        this.threshold = 5;
        this.safetile = [-1, 18];
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turningPoint = new Phaser.Geom.Point();
        this.moveTo = new Phaser.Geom.Point();
        // 以下はマップに関するデータ
        this.gridSize = 32;
        this.rowSize = 18;
        this.columnSize = 25;
        this.mapWidth = this.gridSize * this.columnSize;
        this.mapHeight = this.gridSize * this.rowSize;
    }
    
    createAnimation() {
        // 移動アニメーション
        this.scene.anims.create({
            key: 'eat',
            frames: this.scene.anims.generateFrameNumbers('pacman', { start: 3, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        // 停止アニメーション
        this.scene.anims.create({
            key: 'stay',
            frames: [ { key: 'pacman', frame: 3 } ],
            frameRate: 20
        });
        // 敗北アニメーション
        this.scene.anims.create({
            key: 'die',
            frames: this.scene.anims.generateFrameNumbers('pacman', { start: 0, end: 2 }),
            frameRate: 5,
        });
    }
    
    die() {
        // 敗北処理
        this.isActive = false;
        this.playing = false;
        this.life--;
        this.moveTo = new Phaser.Geom.Point();
        this.setTint(0xff0000);
        this.anims.play('die', true);
    }

    restart() {
        // ゲーム再開処理
        this.isActive = true;
        this.playing = false;
        this.setFlipX(false);
        this.angle = 0;
        this.setPosition(this.originalX, this.originalY);
        this.moveTo = new Phaser.Geom.Point();
        this.setTint();
        this.anims.play('stay', true);
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    }
    
    freeze() {
        // 停止処理
        this.isActive = false;
        this.playing = false;
        this.moveTo = new Phaser.Geom.Point();
        this.setTint();
        this.anims.play('stay', true);
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    }
    
    setDirections(directions) {
        // 移動可能方向を配列に代入
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        // 移動可能座標を配列に代入
        this.turningPoint = turningPoint;
    }
    
    moveLeft() {
        this.moveTo.x = -1;
        this.moveTo.y = 0;
        this.anims.play('eat', true);
        this.setFlipX(true);
        this.angle = 0;
    }

    moveRight() {
        this.moveTo.x = 1;
        this.moveTo.y = 0;
        this.anims.play('eat', true);
        this.setFlipX(false);
        this.angle = 0;
    }

    moveUp() {
        this.moveTo.x = 0;
        this.moveTo.y = -1;
        this.anims.play('eat', true);

        this.setFlipX(true);
        this.angle = -270;
    }

    moveDown() {
        this.moveTo.x = 0;
        this.moveTo.y = 1;
        this.anims.play('eat', true);

        this.setFlipX(false);
        this.angle = 90;
    }
    
    setTurn(turnTo) {
        // 方向転換のチェック
        if (!this.isActive ||
            !this.directions[turnTo] || 
            this.turning === turnTo || 
            this.current === turnTo || 
            !this.isSafe(this.directions[turnTo].index)) {
            return false;
        }
        
        if(this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
            this.move(turnTo);
            this.turning = Phaser.NONE;
            this.turningPoint = new Phaser.Geom.Point();
        } else {
            this.turning = turnTo;
        }
    }
    
    turn() {
        // 方向転換
        if(this.turning === Phaser.NONE) {
            return false;
        }
        if (!Phaser.Math.Within(this.x, this.turningPoint.x, this.threshold) || 
            !Phaser.Math.Within(this.y, this.turningPoint.y, this.threshold)) {
            this.setPosition(this.turningPoint.x, this.turningPoint.y);
        }
        this.setPosition(this.turningPoint.x, this.turningPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        return true;
    }
    
    move(direction) {
        // 移動
        this.playing = true;
        this.current = direction;
        
        switch(direction) {
            case Phaser.LEFT:
                this.moveLeft();
                break;
            case Phaser.RIGHT:
                this.moveRight();
                break;
            case Phaser.UP:
                this.moveUp();
                break;
            case Phaser.DOWN:
                this.moveDown();
                break;
        }
    }

    isSafe(index) {
        // マップ内で移動可能かどうかの判定
        for (var i of this.safetile) {
            if(i===index) {
                return true;
            }
        }
        return false;
    }
}

export default Player;
