import Player  from "./player.js";
import Ghost  from "./ghost.js";

// メイン画面のシーン
class MainScene extends Phaser.Scene {
    constructor() {
        super({key: 'MainScene'});
    }
    
    create() {
        this.config();
        this.createMap();
        this.createPlayer();
        this.createPills();
        this.createGhosts();
        this.createUI();
        this.setCollider();
    }
    
    update() {
        for(var ghost of this.ghostsGroup.getChildren()) {
            if(!this.player.playing) {
                ghost.freeze();
            }
            ghost.setDirections(this.getDirection(this.map, this.borderLayer, ghost));
            ghost.setTurningPoint(this.getTurningPoint(this.map, ghost));
            ghost.update();
        }
        
        this.player.setDirections(this.getDirection(this.map, this.borderLayer, this.player));
        this.player.setTurningPoint(this.getTurningPoint(this.map, this.player));
        this.player.update();
    }
    
    config() {
        this.gridSize = 32;
        this.rowSize = 18;
        this.columnSize = 25;
        this.mapWidth = this.gridSize * this.columnSize;
        this.mapHeight = this.gridSize * this.rowSize;
        
        this.offset = parseInt(this.gridSize / 2, 10);
        
        this.pillTotal = 0;
        this.pillCount = 0;
    }
    
    createMap() {
        this.cameras.main.setBackgroundColor('#8B8989');
        
        this.map = this.make.tilemap({ key: "map1", tileWidth: this.gridSize, tileHeight: this.gridSize });
        var tiles = this.map.addTilesetImage('map-tiles');
        
        this.borderLayer = this.map.createStaticLayer("Border", tiles, 0, 0);
        this.borderLayer.setCollisionByExclusion([-1]);
        
        this.gateLayer = this.map.createStaticLayer("Gate", tiles, 0, 0);
        this.gateLayer.setCollisionByExclusion([-1]);
    }
    
    createPlayer() {
        var object = this.map.findObject("Player", obj => obj.name === "Player"); 
        var x = object.x + this.offset;
        var y = object.y + this.offset;
        
        this.player = new Player(this, x, y, 'pacman');
        
        this.player.on('animationcomplete', function(animation, frame) {
            if(animation.key == 'die') {
                if(this.player.life <= 0) {
                    this.gameOver();
                } else {
                    this.restart();
                }
            }
        }, this);
    }
    
    createPills() {
        this.pillGroup = this.physics.add.group();
        this.map.filterObjects("Pills", function (value, index, array) {
            if(value.name == "Pill") {
                var x = value.x + this.offset;
                var y = value.y + this.offset;
                this.pillGroup.create(x, y, 'pill');
                this.pillTotal++;
            }
        }, this);
    }
    
    createGhosts() {
        var images = ['ghost-blue', 'ghost-cyan', 'ghost-green', 'ghost-orange', 'ghost-red'];
        
        this.ghostsGroup = this.physics.add.group();
        this.map.filterObjects("Ghosts", function (object, index, array) {
            if(object.name == "Ghost") {
                var x = object.x + this.offset;
                var y = object.y + this.offset;
                var i = index % images.length;
                var ghost = new Ghost(this, x, y, images[i]);
                this.ghostsGroup.add(ghost);
            }
         }, this);
    }
    
    createUI() {
        var width = this.game.config.width;
        this.add.rectangle( width/2, this.mapHeight+(this.gridSize/2) , width, this.gridSize, 0x000000);
        
        var scoreText = this.createScoreText();
        this.scoreText = this.add.text(200, 580, scoreText, {
            font : '18px Open Sans',
            fill : '#ff0000',
        });
        
        var lifeText = this.createLifeText();
        this.lifeText = this.add.text(500, 580, lifeText, {
            font : '18px Open Sans',
            fill : '#ff0000',
        });
    }
    
    createScoreText() {
        return 'Score : ' + this.player.score;
    }
    
    createLifeText() {
        return 'Life : ' + this.player.life;
    }
    
    showScore() {
        var scoreText = this.createScoreText();
        this.scoreText.setText(scoreText);
    }
    
    showLife() {
        var lifeText = this.createLifeText();
        this.lifeText.setText(lifeText);
    }
    
    setCollider() {
        this.physics.add.collider(this.player, this.borderLayer);
        this.physics.add.collider(this.player, this.gateLayer);
        
        this.physics.add.overlap(this.player, this.pillGroup, this.hitPills, null, this);
        this.physics.add.overlap(this.player, this.ghostsGroup, this.hitGhost, null, this);
        
        this.physics.add.collider(this.ghostsGroup, this.borderLayer);
    }
    
    hitPills(player, pill) {
        pill.disableBody(true, true);
        
        this.pillCount++;
        
        this.player.score += 10;
        this.showScore();
        
        if(this.pillTotal == this.pillCount) {
            // ゲームクリア
            this.gameClear();
        }
    }
    
    hitGhost(player, ghost) {
        if(player.isActive) {
            player.die();
            for(var g of this.ghostsGroup.getChildren()) {
                g.freeze();
            }
            this.showLife();
        }
    }

    restart() {
        this.player.restart();
        for(var ghost of this.ghostsGroup.getChildren()) {
            ghost.restart();
        }
    }
    
    gameClear() {
        this.player.freeze();
        for(var g of this.ghostsGroup.getChildren()) {
            g.freeze();
        }
        var x = this.cameras.main.midPoint.x;
        var y = this.cameras.main.midPoint.y;
        // ゲームオーバー画像を画面中央に表示
        var gameoverImage = this.add.image(x, y, 'gameclear');
        gameoverImage.setDisplaySize(600,450);
        // 何かキーをクリックするとゲーム再開
        this.input.keyboard.on('keydown', function(event) {
            this.scene.start('StartScene');
        }, this);
    }
    
    gameOver() {
        var x = this.cameras.main.midPoint.x;
        var y = this.cameras.main.midPoint.y;
        // ゲームオーバー画像を画面中央に表示
        var gameoverImage = this.add.image(x, y, 'gameover');
        gameoverImage.setDisplaySize(500,400);
        // 何かキーをクリックするとゲーム再開
        this.input.keyboard.on('keydown', function(event) {
            this.scene.start('StartScene');
        }, this);
    }

    getDirection(map, layer, sprite) {
        var directions = [];
        var sx = Phaser.Math.FloorTo(sprite.x);
        var sy = Phaser.Math.FloorTo(sprite.y);
        var currentTile = map.getTileAtWorldXY(sx, sy, true);  
        if(currentTile) {
            var x = currentTile.x;
            var y = currentTile.y;
            directions[Phaser.LEFT]     =   map.getTileAt(x-1, y, true, layer);
            directions[Phaser.RIGHT]    =   map.getTileAt(x+1, y, true, layer);
            directions[Phaser.UP]       =   map.getTileAt(x, y-1, true, layer);
            directions[Phaser.DOWN]     =   map.getTileAt(x, y+1, true, layer);
        }
        return directions;
    }

    getTurningPoint(map, sprite) {
        var turningPoint = new Phaser.Geom.Point();
        var sx = Phaser.Math.FloorTo(sprite.x);
        var sy = Phaser.Math.FloorTo(sprite.y);
        var currentTile = map.getTileAtWorldXY(sx, sy, true);  
        if(currentTile) {    
            turningPoint.x = currentTile.pixelX + this.offset;
            turningPoint.y = currentTile.pixelY + this.offset;
        }
        return turningPoint;
    }
}

export default MainScene;
