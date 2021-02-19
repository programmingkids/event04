class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image) {
        super(scene, x, y, image);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // 衝突範囲サイズの変更
        this.body.setSize(28, 28);
        // 表示サイズの変更
        this.setDisplaySize(28,28);
        this.setOrigin(0.5);
        
        // 引数の代入
        this.scene = scene;
        this.originalX = x;
        this.originalY = y;
        
        // 設定
        this.config();
        // アニメーション作成
        this.createAnimation();
        // 初期状態設定
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
        
        var width = this.scene.game.config.width;
        var offset = 32;
        if(this.x < 0 - offset ) {
            this.setPosition(width + offset, this.y);
        } else if(this.x > width + offset) {
            this.setPosition(0 - offset, this.y);
        }
    }
    
    config() {
        this.speed = 100;
        this.score = 0;
        this.isActive = true;
        this.playing = false;
        this.angle = 0;
        this.life = 3;
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
        this.threshold = 5;
        this.safetile = [-1, 18];
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turningPoint = new Phaser.Geom.Point();
        this.moveTo = new Phaser.Geom.Point();
    }
    
    createAnimation() {
        this.scene.anims.create({
            key: 'eat',
            frames: this.scene.anims.generateFrameNumbers('pacman', { start: 9, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.scene.anims.create({
            key: 'stay',
            frames: [ { key: 'pacman', frame: 9 } ],
            frameRate: 20
        });
    
        this.scene.anims.create({
            key: 'die',
            frames: this.scene.anims.generateFrameNumbers('pacman', { start: 6, end: 8 }),
            frameRate: 5,
        });
    }
    
    die() {
        this.isActive = false;
        this.playing = false;
        this.life--;
        this.moveTo = new Phaser.Geom.Point();
        this.setTint(0xff0000);
        this.anims.play('die', true);
    }

    restart() {
        this.isActive = true;
        this.playing = false;
        this.angle = 0;
        this.setPosition(this.originalX, this.originalY);
        this.moveTo = new Phaser.Geom.Point();
        this.setTint();
        this.anims.play('stay', true);
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    }
    
    freeze() {
        this.isActive = false;
        this.playing = false;
        this.moveTo = new Phaser.Geom.Point();
        this.setTint();
        this.anims.play('stay', true);
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    }
    
    setDirections(directions) {
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint = turningPoint;
    }
    
    moveLeft() {
        this.moveTo.x = -1;
        this.moveTo.y = 0;
        this.anims.play('eat', true);
        this.angle = 180;
    }

    moveRight() {
        this.moveTo.x = 1;
        this.moveTo.y = 0;
        this.anims.play('eat', true);
        this.angle = 0;
    }

    moveUp() {
        this.moveTo.x = 0;
        this.moveTo.y = -1;
        this.anims.play('eat', true);
        this.angle = 270;
    }

    moveDown() {
        this.moveTo.x = 0;
        this.moveTo.y = 1;
        this.anims.play('eat', true);
        this.angle = 90;
    }
    
    setTurn(turnTo) {
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
    
    move(direction) {
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
        for (var i of this.safetile) {
            if(i===index) {
                return true;
            }
        }
        return false;
    }
}

export default Player;
