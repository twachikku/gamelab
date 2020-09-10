import Phaser from './lib/phaser.js';
import PreloadScene from "./scenes/preload.js";
import MenuScene from "./scenes/menu.js"
import GameScene from "./scenes/game.js";

var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: true
        }
    },
    render: {
        pixelArt: false,
        clearBeforeRender: false
    },
    scene: [PreloadScene, MenuScene, GameScene],
    parent: "gamecanvas",
    scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
        global: [
            {
                key: "DragonBonesPlugin",
                plugin: dragonBones.phaser.plugin.DragonBonesPlugin,
                start: true
            } // setup DB plugin
        ],
        scene: [
            {
                key: "DragonBones",
                plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                mapping: "dragonbone"
            }    // setup DB scene plugin
        ]
    },

};

const game = new Phaser.Game(config);

export default game;