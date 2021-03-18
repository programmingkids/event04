import Player  from "./player.js";
import Ghost  from "./ghost.js";

// メイン画面のシーン
class MainScene extends Phaser.Scene {
    constructor() {
        super({key: 'MainScene'});
    }
    
    create() {
        // 初期設定
        this.config();
        // マップ作成
        this.createMap();
        // プレイヤー作成
        this.createPlayer();
        // ピル作成
        this.createPills();
        // ゴースト作成
        this.createGhosts();
        // UI作成
        this.createUI();
        // 衝突設定
        this.setCollider();
    }
    
    update() {
        // ゴーストの移動処理
        for(var ghost of this.ghostsGroup.getChildren()) {
            if(!this.player.playing) {
                ghost.freeze();
            }
            ghost.setDirections(this.getDirection(this.map, this.borderLayer, ghost));
            ghost.setTurningPoint(this.getTurningPoint(this.map, ghost));
            ghost.update();
        }
        // プレイヤーの移動処理
        this.player.setDirections(this.getDirection(this.map, this.borderLayer, this.player));
        this.player.setTurningPoint(this.getTurningPoint(this.map, this.player));
        this.player.update();
    }
    
    config() {
        // 初期設定
        // ピルの合計数
        this.pillTotal = 0;
        // 現在のピルの獲得数
        this.pillCount = 0;
        // 以下はマップ関連の設定
        this.gridSize = 32;
        this.rowSize = 18;
        this.columnSize = 25;
        this.mapWidth = this.gridSize * this.columnSize;
        this.mapHeight = this.gridSize * this.rowSize;
        this.offset = parseInt(this.gridSize / 2, 10);
    }
    
    createMap() {
        // マップ作成
        // マップの背景色設定
        this.cameras.main.setBackgroundColor('#8B8989');
        // マップデータの読み込み
        this.map = this.make.tilemap({ key: "map1", tileWidth: this.gridSize, tileHeight: this.gridSize });
        // マップデータにマップタイル画像を適用
        var tiles = this.map.addTilesetImage('map-tiles');
        // Borderレイヤーの作成
        this.borderLayer = this.map.createStaticLayer("Border", tiles, 0, 0);
        this.borderLayer.setCollisionByExclusion([-1]);
        // Gateレイヤーの作成
        this.gateLayer = this.map.createStaticLayer("Gate", tiles, 0, 0);
        this.gateLayer.setCollisionByExclusion([-1]);
    }
    
    createPlayer() {
        // プレイヤーの作成
        // マップからプレイヤーのデータ取得
        var object = this.map.findObject("Player", obj => obj.name === "Player"); 
        // プレイヤーのX座標
        var x = object.x + this.offset;
        // プレイヤーのY座標
        var y = object.y + this.offset;
        // プレイヤー作成
        this.player = new Player(this, x, y, 'pacman');
        // プレイヤーがゴーストに接触した後の処理
        this.player.on('animationcomplete', function(animation, frame) {
            if(animation.key == 'die') {
                if(this.player.life <= 0) {
                    // ライフが「0」なのでゲームオーバー
                    this.gameOver();
                } else {
                    // ライフが「0」ではないので、リスタート
                    this.restart();
                }
            }
        }, this);
    }
    
    createPills() {
        // ピルを作成
        // ピルグループの作成
        this.pillGroup = this.physics.add.group();
        // マップデータからピルのデータ取得
        this.map.filterObjects("Pills", function (value, index, array) {
            if(value.name == "Pill") {
                // ピルのX座標
                var x = value.x + this.offset;
                // ピルのY座標
                var y = value.y + this.offset;
                // ピルの作成
                this.pillGroup.create(x, y, 'pill');
                // ピルの合計数を加算
                this.pillTotal++;
            }
        }, this);
    }
    
    createGhosts() {
        // ゴーストの作成
        // ゴーストの画像配列
        var images = ['ghost-blue', 'ghost-cyan', 'ghost-green', 'ghost-orange', 'ghost-red'];
        // ゴーストグループの作成
        this.ghostsGroup = this.physics.add.group();
        // マップデータからゴーストのデータ取得
        this.map.filterObjects("Ghosts", function (object, index, array) {
            if(object.name == "Ghost") {
                // ゴーストのX座標
                var x = object.x + this.offset;
                // ゴーストのY座標
                var y = object.y + this.offset;
                // ゴーストの画像を配列内のインデックスに収める
                var i = index % images.length;
                // ゴーストの作成
                var ghost = new Ghost(this, x, y, images[i]);
                // ゴーストをゴーストグループに追加
                this.ghostsGroup.add(ghost);
            }
         }, this);
    }
    
    createUI() {
        // 画面下部のUI作成
        // 画面幅の取得
        var width = this.game.config.width;
        // UI部分の背景色を「黒」にする
        this.add.rectangle( width/2, this.mapHeight+(this.gridSize/2) , width, this.gridSize, 0x000000);
        
        // スコアの文字作成
        var scoreText = this.createScoreText();
        // スコアテキストの作成
        this.scoreText = this.add.text(200, 580, scoreText, {
            font : '18px Open Sans',
            fill : '#ff0000',
        });
        // ライフの文字作成
        var lifeText = this.createLifeText();
        // ライフテキストの作成
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
        // 各所衝突設定
        // プレイヤーとBorderレイヤーの衝突
        this.physics.add.collider(this.player, this.borderLayer);
        // プレイヤーとGateレイヤーの衝突
        this.physics.add.collider(this.player, this.gateLayer);
        
        // プレイヤーとピルグループの衝突
        this.physics.add.overlap(this.player, this.pillGroup, this.hitPills, null, this);
        // プレイヤーとゴーストグループの衝突
        this.physics.add.overlap(this.player, this.ghostsGroup, this.hitGhost, null, this);
        // ゴーストグループとBorderレイヤーの衝突
        this.physics.add.collider(this.ghostsGroup, this.borderLayer);
    }
    
    hitPills(player, pill) {
        // プレイヤーとピルが衝突したときの処理
        // ピルを非表示にする
        pill.disableBody(true, true);
        // ピルの獲得数を加算
        this.pillCount++;
        // プレイヤーのスコアを加算
        this.player.score += 10;
        // スコアを表示
        this.showScore();
        // ピルの合計数と現在のピルの獲得数が一致した場合
        if(this.pillTotal == this.pillCount) {
            // ゲームクリア
            this.gameClear();
        }
    }
    
    hitGhost(player, ghost) {
        // プレイヤーとゴーストが衝突したときの処理
        // プレイヤーが移動開始後であれば
        if(player.isActive) {
            // プレイヤー敗北
            player.die();
            // ゴーストの停止処理
            for(var g of this.ghostsGroup.getChildren()) {
                g.freeze();
            }
            // ライフを表示
            this.showLife();
        }
    }

    restart() {
        // リスタート処理
        // プレイヤーのリスタート
        this.player.restart();
        // ゴーストのリスタート
        for(var ghost of this.ghostsGroup.getChildren()) {
            ghost.restart();
        }
    }
    
    gameClear() {
        // ゲームクリア処理
        // プレイヤーの移動停止
        this.player.freeze();
        // ゴーストの移動停止
        for(var g of this.ghostsGroup.getChildren()) {
            g.freeze();
        }
        // 画面中央の座標取得
        var x = this.cameras.main.midPoint.x;
        var y = this.cameras.main.midPoint.y;
        // ゲームオーバー画像を画面中央に表示
        var gameoverImage = this.add.image(x, y, 'gameclear');
        gameoverImage.setDisplaySize(600,450);
        // 何かキーをクリックするとゲームリスタート
        this.input.keyboard.on('keydown', function(event) {
            this.scene.start('StartScene');
        }, this);
    }
    
    gameOver() {
        // ゲームオーバー処理
        // 画面中央の座標取得
        var x = this.cameras.main.midPoint.x;
        var y = this.cameras.main.midPoint.y;
        // ゲームオーバー画像を画面中央に表示
        var gameoverImage = this.add.image(x, y, 'gameover');
        gameoverImage.setDisplaySize(500,400);
        // 何かキーをクリックするとゲームリスタート
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
