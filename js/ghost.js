class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image, type) {
        super(scene, x, y, image);
        
        this.setDisplaySize(28,28);
        this.setOrigin(0.5);
        
        this.scene = scene;
        this.originalX = x;
        this.originaly = y;
        this.type = type;
        
        this.config();
        this.createAnimation();
        
        this.anims.play(this.type, true);
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(28, 28);
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
        this.turnCount=0;
        this.turnAtTime=[4, 8, 16, 32, 64];
        this.turnAt=this.rnd.pick(this.turnAtTime);
    }
    
    createAnimation() {
        var value = this.animationType[this.type];
        
        this.scene.anims.create({
            key: this.type,
            frames: this.scene.anims.generateFrameNumbers('pacman-spritesheet', { 
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

    respawn() {       
        this.setPosition(this.originalX, this.originaly);
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
        this.flipX = false;
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

    takeRandomTurn() {

        let turns = [];
        for (let i=0; i < this.directions.length; i++) {
            let direction=this.directions[i];
            if(direction) {
                if(this.isSafe(direction.index)) {
                    turns.push(i);
                    
                }
            }
        }

        if(turns.length >= 2) {
            let index=turns.indexOf(this.opposites[this.current]);
            if(index>-1) {
                turns.splice(index, 1);
            }
        }

        let turn=this.rnd.pick(turns);       
        this.setTurn(turn);

        this.turnCount=0;
        this.turnAt=this.rnd.pick(this.turnAtTime);
    }

    turn() {
        if(this.turnCount===this.turnAt) {
            this.takeRandomTurn();            
        }                
        this.turnCount++;

        if(this.turning === Phaser.NONE) {
            return false;
        }

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
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

    move(direction)
    {
        this.current=direction;

        switch(direction)
        {
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
        for (let i of this.safetile) {
            if(i===index) return true;
        }

        return false;
    }

    drawDebug(graphics) 
    {        
        let thickness = 4;
        let alpha = 1;
        let color = 0x00ff00;        
        for (var t = 0; t < 9; t++)
        {
            if (this.directions[t] === null || this.directions[t] === undefined)
            {
                continue;
            }

            if ( !this.isSafe(this.directions[t].index))
            {
                color = 0xff0000;
            }
            else
            {
                color = 0x00ff00;
            }

            graphics.lineStyle(thickness, color, alpha);
            graphics.strokeRect(this.directions[t].pixelX, this.directions[t].pixelY, 32, 32);
        }

        color = 0x00ff00;
        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(this.turningPoint.x, this.turningPoint.y, 1, 1);

    }
}

export default Ghost;
