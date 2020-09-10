
import Phaser from '../lib/phaser.js'
import GameScene from "./game.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");      
  }  
  preload(){
  }
  create() {
    console.log(this.scene);
    const width  = this.scale.width;
    const height = this.scale.height;    
    this.center = {x: width/2, y: height/2};
    this.add.image(this.center.x, this.center.y, "tab-start");
    this.input.on('pointerdown',() => { 
       if(this.scene.get("game")==null) 
        this.scene.add("game", new GameScene());        
        this.scene.start('game');
      }
    );
  }

}