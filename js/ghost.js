class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image, type) {
        super(scene, x, y, image);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setDisplaySize(28,28);
        this.setOrigin(0.5);

        this.scene = scene;
        this.originalX = x;
        this.originaly = y;
        this.type = type;
        
        this.config();
        this.createAnimation();
        
        this.anims.play(this.type, true);
    }
    
    update() {
        this.setVelocity(this.moveTo.x * this.speed,  this.moveTo.y * this.speed);
        this.turn();
    }
    
    config() {
        this.animationType = {
            'ghost-blue'   : { start : 0,  end : 1 },
            'ghost-orange' : { start : 4,  end : 5 },
            'ghost-white'  : { start : 0,  end : 1 },
            'ghost-pink'   : { start : 14, end : 15 },
            'ghost-red'    : { start : 16, end : 17 },
        };

        this.speed = 100;
        this.moveTo = new Phaser.Geom.Point();
        this.safetile = [-1, 19];
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 5;
        
        this.rnd = new Phaser.Math.RandomDataGenerator();
        this.turnCount = 0;
        this.turnAtTime = [4, 8, 16, 32, 64];
        this.turnAt = this.rnd.pick(this.turnAtTime);
    }
    
    createAnimation() {
        var value = this.animationType[this.type];
        
        this.scene.anims.create({
            key: this.type,
            frames: this.scene.anims.generateFrameNumbers('pacman', { 
                start: value.start, 
                end: value.end,
            }),
            frameRate: 10,
            repeat: -1
        });
    }

    freeze() {
        this.moveTo = new Phaser.Geom.Point();
        this.current = Phaser.NONE;
    }

    restart() {       
        this.setPosition(this.originalX, this.originaly);
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
        this.flipX = false;
    }
    
    turn() {
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
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint=turningPoint;
    }
    
    setTurn(turnTo) {
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
            if(i === index) {
                return true;
            }
        }
        return false;
    }
}

export default Ghost;
