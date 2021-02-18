var mainScene = new Phaser.Scene("mainScene");

// 初期設定
mainScene.config = function() {
    // プレイヤーの動く速度
    this.runSpeed = 300;
    // プレイヤーのジャンプパワー
    this.jumpPower = 500;
    // ゲームオーバーフラグ
    this.gameOver = false;
    // スコアの初期値
    this.score = 0;
    // 敵の配列
    this.enemyData = ['enemy01','enemy02','enemy05','enemy07','enemy08'];
    // 敵のスピードを設定する配列
    this.enemySpeed = [-100,-50,50,100];
    // カーソルを取得する
    this.cursors = this.input.keyboard.createCursorKeys();
};

// マップ表示
mainScene.createMap = function() {
    // JSON形式のマップデータの読み込み　Tilemapオブジェクトの作成
    this.map = this.make.tilemap({key: 'map'});

    // タイル画像をマップデータに反映する　Tilesetオブジェクトの作成
    var groundTiles = this.map.addTilesetImage('tiles');
    // 地面レイヤー作成 DynamicTilemapLayerオブジェクト作成
    this.groundLayer = this.map.createDynamicLayer('World', groundTiles, 0, 0);
    
    // 衝突判定から除外したいタイルのインデックスを配列で指定する
    // -1は空のタイルなので衝突しない。それ以外は衝突する
    this.groundLayer.setCollisionByExclusion([-1]);

    // ゲームワールドの幅と高さの設定
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    // カメラの表示サイズの設定をする。マップのサイズがカメラの表示サイズ
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
};

mainScene.createCoin = function() {
    // コイン画像の読み込み
    var coinTiles = this.map.addTilesetImage('coin');
    // コインレイヤー作成
    this.coinLayer = this.map.createDynamicLayer('Coin', coinTiles, 0, 0);
    // プレイヤーとコインレイヤーの衝突判定（すり抜けモード）
    this.physics.add.overlap(this.player, this.coinLayer);
    // コインレイヤーとの衝突処理
    this.coinLayer.setTileIndexCallback(17, collectCoin, this);
};

mainScene.createPlayer = function() {
    // プレイヤースプライトの表示
    this.player = this.physics.add.sprite(50, 100, 'player');
    // 衝突サイズの調整
    this.player.body.setSize(20,25);
    
    // プレイヤーのサイズ変更
    this.player.setDisplaySize(70,70);
    
    // プレイヤーの衝突時のバウンス設定
    this.player.setBounce(0);
    // プレイヤーがゲームワールドの外に出ないように衝突させる
    this.player.setCollideWorldBounds(true);
    // プレイヤーが地面レイヤーと衝突する設定
    this.physics.add.collider(this.player, this.groundLayer);

    // プレイヤーの歩行アニメーション
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 7, end: 9}),
        frameRate: 10,
        repeat: -1
    });
    // プレイヤーの正面を向く状態のアニメーション
    this.anims.create({
        key: 'turn',
        frames: [{key: 'player', frame: 'sprite1'}],
        frameRate: 10,
    });
};

mainScene.createEnemyGroup = function() {
    // 敵グループ作成
    this.enemies = this.physics.add.group();
    
    // 最初の敵の作成
    this.createEnemy();
    // 敵はマップと衝突する
    this.physics.add.collider(this.enemies, this.groundLayer);
    // 敵はプレイヤーと衝突する
    this.physics.add.overlap(this.enemies, this.player, hitEnemy, null, this);
    // 1秒ごとに、新しい敵を作成する
    this.timeEvent = this.time.addEvent({
      delay: 1000,
      callback: this.createEnemy,
      loop: true,
      callbackScope: this
    });
};

mainScene.create = function () {
    // 初期設定
    this.config();
    
    // マップ表示
    this.createMap();
    
    // プレイヤー作成
    this.createPlayer();
    
    // コイン作成
    this.createCoin();
    
    // 敵作成
    this.createEnemyGroup();
    
    // カメラはプレイヤーを追跡する。プレイヤーの移動に合わせて、カメラが表示が移動する
    this.cameras.main.startFollow(this.player);
    
    // 背景色の設定
    this.cameras.main.setBackgroundColor('#99CCFF');
    
    // 画面左下に白色でテキスト表示
    this.text = this.add.text(20, 570, this.score, {
        fontSize: '20px',
        fill: '#ffffff'
    });
    // 文字は固定表示（カメラに合わせて移動しない）
    this.text.setScrollFactor(0);
};

mainScene.update = function() {
    if(this.gameOver) {
        return false;
    }
    // ここにプログラムを作成します
    if (this.cursors.left.isDown)
    {
        this.player.body.setVelocityX(-this.runSpeed);
        this.player.anims.play('walk', true);
        this.player.flipX = true;
    }
    else if (this.cursors.right.isDown)
    {
        this.player.body.setVelocityX(this.runSpeed);
        this.player.anims.play('walk', true);
        this.player.flipX = false;
    } else {
        this.player.body.setVelocityX(0);
        this.player.anims.play('turn', true);
    }
    if (this.cursors.space.isDown && this.player.body.onFloor())
    {
        this.player.body.setVelocityY(-this.jumpPower);
    }
};

mainScene.createEnemy = function() {
    var enemyType = Phaser.Math.RND.pick(this.enemyData);
    var enemyPositionX = Phaser.Math.RND.between(500, 2000);

    // ここにプログラムを作成します
    var enemy = this.enemies.create(enemyPositionX, 100, enemyType);
    enemy.body.setSize(350,350);
    enemy.setDisplaySize(70, 70);
    var speed = Phaser.Math.RND.pick(this.enemySpeed);
    enemy.setVelocityX(speed);
};

function collectCoin(sprite, tile) {
    // ここにプログラムを作成します
    this.coinLayer.removeTileAt(tile.x, tile.y);
    this.score++;
    this.text.setText(this.score);
}

function hitEnemy(player, enemy) {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.stop();
    this.gameOver = true;
    
    // ここにプログラムを作成します
    var cameraPositionX = this.cameras.main.midPoint.x;
    var cameraPositionY = this.cameras.main.midPoint.y;
    var gameover = this.add.image(cameraPositionX, cameraPositionY, 'gameover');
    gameover.setDisplaySize(500,400);
    
    this.input.keyboard.on('keydown', function(event) {
        this.scene.start('mainScene');
    }, this);
}
