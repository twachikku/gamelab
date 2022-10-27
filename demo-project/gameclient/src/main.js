import Phaser from './lib/phaser.js';
import MenuScene from "./scenes/menu.js"
import GameScene from "./scenes/game.js";

var config = {
    type: Phaser.AUTO,
    width: 16 * 60,
    height: 8 * 60,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: true
        }
    },
    scene: [MenuScene, GameScene],
    parent: "gamecanvas",
    // scale: {
    //     mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    // },
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
const debugtext = document.getElementById("debugtext");
const game = new Phaser.Game(config);
window.game = game;
export default game;