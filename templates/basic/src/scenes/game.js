
import Phaser from '../lib/phaser.js'

export default class GameScene extends Phaser.Scene{
    constructor() {
        super("game");	
    }
    preload(){
        
    }   
   
    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.text(width/2,10,"BASIC GAME",{fontSize: 32,fontFamily: 'Monoton',color:'#FF0'}).setOrigin(0.5,0)

        this.add.text(width/2,200,"(scenes/game.js) กดปุ่ม ESC เพื่อกลับ",{fontSize: 16,fontFamily: 'Bai Jamjuree'})
                .setOrigin(0.5,0)
        this.input.keyboard.on('keydown-ESC',function(){
            this.scene.start("menu");  
        }, this);             
        this.cameras.main.setDeadzone(width * 0.5, height * 0.5) ;
    }        

    update () {
       
    }    
    
}