
import Phaser from '../lib/phaser.js'

export default class GameScene extends Phaser.Scene{
    constructor() {
        super("game");	
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
        this.load_dragonbone("dragon","DragonG");
        this.load.audio("swasdee","assets/audio/swasdee.ogg");
    }
    
    create ()
    {
       
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.text(width/2,10,"Dragon Bone",{fontSize: 32,fontFamily: 'Black Ops One',color:'#FF0'}).setOrigin(0.5,0)

        this.add.text(width/2,height-30,"กดปุ่ม ESC เพื่อกลับ",{fontSize: 16,fontFamily: 'Bai Jamjuree'})
                .setOrigin(0.5,0)
        this.input.keyboard.on('keydown-ESC',function(){ 
            this.scene.start("menu");             
        }, this);             
        this.cameras.main.setDeadzone(width * 0.5, height * 0.5) ;

        this.dragon = this.add.armature("Dragon", "dragon");
        this.dragon.scale = 0.5;
        //console.log(this.dragon);
        //console.log(this.dragon.animation.animationNames);        
        this.dragon.animation.play("walk",2);
        this.dragon.x = width;
        this.dragon.y = 400;
        this.dragon.addDBEventListener(dragonBones.EventObject.START, this._animationStart, this);
        this.dragon.addDBEventListener(dragonBones.EventObject.COMPLETE, this._animationComplete, this);
        this.input.on('pointerdown', () => {
           this.dragon.animation.play("swasdee",1);
        });

        var t = this.add.tween({
          targets: this.dragon,
          duration : 1800,
          x:{ from:1000, to: width/2}
        });

    }   
    _animationStart(event){
        if (event.animationState.name === "swasdee") {
            this.sound.play("swasdee");
        }    
    }
    _animationComplete(event){
        if (event.animationState.name === "walk") {
            this.dragon.animation.fadeIn("hello", 0.5,1);
        }
        if (event.animationState.name === "hello") {
            this.dragon.animation.fadeIn("swasdee", 0.5,1);
        }
        if (event.animationState.name === "swasdee") {
            this.dragon.animation.fadeIn("stand", 0.5);
        }
    }     

    update () {
       
    }    
    
}