import Phaser from './lib/phaser.js';
import MenuScene from "./scenes/menu.js"
import GameScene from "./scenes/game.js";

var config = {
    type: Phaser.AUTO,
    width: 16*60,
    height: 9*60,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true
        }
    },
    scene: [MenuScene, GameScene],
    parent: "gamecanvas"
};

const game = new Phaser.Game(config);

export default game;