
import Phaser from '../lib/phaser.js'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");      
  }
  
  preload(){
    this.load.image("tab-start","assets/tab-start.png");
    const width  = this.scale.width;
    const height = this.scale.height;    
    this.center = {x: width/2, y: height/2};
  }
  create() {
    this.add.image(this.center.x, this.center.y, "tab-start");
    this.input.on('pointerdown',() => this.scene.start("game") );
  }

}