class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image) {
        super(scene, x, y, image);
        // シーンに追加
        this.scene.add.existing(this);
        // 物理エンジンの対象に追加
        this.scene.physics.add.existing(this);
        // 表示サイズ変更
        this.setDisplaySize(28,28);
        
        // 引数の代入
        this.scene = scene;
        this.originalX = x;
        this.originaly = y;
        this.image = image;
        
        // 設定を呼び出す
        this.config();
        // アニメーション作成
        this.createAnimation();
        // アニメーション開始
        this.anims.play(this.image, true);
    }
    
    update() {
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
        
        // 以下は移動のためのデータ
        this.moveTo = new Phaser.Geom.Point();
        this.safetile = [-1, 19];
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 5;
        // 以下はランダムに移動するためのデータ
        this.rnd = new Phaser.Math.RandomDataGenerator();
        this.turnCount = 0;
        this.turnAtTime = [4, 8, 16, 32, 64];
        this.turnAt = this.rnd.pick(this.turnAtTime);
        // 以下はマップに関するデータ
        this.gridSize = 32;
        this.rowSize = 18;
        this.columnSize = 25;
        this.mapWidth = this.gridSize * this.columnSize;
        this.mapHeight = this.gridSize * this.rowSize;
    }
    
    createAnimation() {
        // 移動アニメーション作成
        this.scene.anims.create({
            key: this.image,
            frames: this.scene.anims.generateFrameNumbers(this.image, { 
                start: 0, 
                end: 1,
            }),
            frameRate: 5,
            repeat: -1
        });
    }

    freeze() {
        // 停止処理
        this.moveTo = new Phaser.Geom.Point();
        this.current = Phaser.NONE;
    }

    restart() {
        // ゲーム再開処理
        this.setPosition(this.originalX, this.originaly);
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
        this.flipX = false;
    }
    
    turn() {
        // 移動方向転換処理
        if(this.turnCount === this.turnAt) {
            this.takeRandomTurn();            
        }
        this.turnCount++;
        
        if(this.turning === Phaser.NONE) {
            return false;
        }
        
        if (!Phaser.Math.Within(this.x, this.turningPoint.x, this.threshold) || 
            !Phaser.Math.Within(this.y, this.turningPoint.y, this.threshold)) {
            return false;
        }
        
        this.setPosition(this.turningPoint.x, this.turningPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        return true;
    }
    
    takeRandomTurn() {
        // 回転方向をランダムに決定する処理
        var turns = [];
        for (var i=0; i < this.directions.length; i++) {
            var direction = this.directions[i];
            if(direction) {
                if(this.isSafe(direction.index)) {
                    turns.push(i);
                }
            }
        }
        
        if(turns.length >= 2) {
            var index=turns.indexOf(this.opposites[this.current]);
            if(index>-1) {
                turns.splice(index, 1);
            }
        }
        
        var turn = this.rnd.pick(turns);       
        this.setTurn(turn);
        
        this.turnCount = 0;
        this.turnAt = this.rnd.pick(this.turnAtTime);
    }
    
    move() {
        // 移動処理
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));        
    }
    
    moveLeft() {
        this.moveTo.x = -1;
        this.moveTo.y = 0;
        this.flipX = true;
        this.angle = 0;
    }

    moveRight() {
        this.moveTo.x = 1;
        this.moveTo.y = 0;
        this.flipX = false;
        this.angle = 0;
    }

    moveUp() {
        this.moveTo.x = 0;
        this.moveTo.y = -1;
        this.angle = 0;
    }

    moveDown() {
        this.moveTo.x = 0;
        this.moveTo.y = 1;
        this.angle = 0;
    }
    
    setDirections(directions) {
        // 移動可能方向を配列に代入
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        // 移動可能座標を配列に代入
        this.turningPoint=turningPoint;
    }
    
    setTurn(turnTo) {
        // 方向転換のチェック
        if (!this.directions[turnTo] 
            || this.turning === turnTo 
            || this.current === turnTo 
            || !this.isSafe(this.directions[turnTo].index)
            ) {
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

    move(direction) {
        // 移動
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
            if(i === index) {
                return true;
            }
        }
        return false;
    }
}

export default Ghost;
