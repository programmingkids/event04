import LoadScene from './load.js';
import StartScene from './start.js';
import MainScene from './main.js';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0,
                x: 0
            },
            debug: false,
        }
    },
};

var game = new Phaser.Game(config);

game.scene.add('LoadScene', LoadScene);
game.scene.add('StartScene', StartScene);
game.scene.add('MainScene', MainScene);
game.scene.start('LoadScene');
