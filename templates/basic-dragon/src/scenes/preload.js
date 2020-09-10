
import Phaser from '../lib/phaser.js'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");      
  }
  load_dragonbone(key,name){
    this.load.dragonbone(
        key,
        "assets/dragonbone/"+name+"_tex.png",
        "assets/dragonbone/"+name+"_tex.json",
        "assets/dragonbone/"+name+"_ske.dbbin",
        null,
        null,
        { responseType: "arraybuffer" }
    );  
    
}
  
  preload(){

    this.load.image("tab-start","assets/tab-start.png");
  }
  create() {
    this.scene.start("menu");
  }
}