var   playerNo=0;
class Player extends Actor {
    constructor(scene, x, y, key) {
      super(scene, x, y, key);
    }
    setSocket(socket){
       playerNo++; 
       this.setSize(40, 70);
       this.socket = socket;
       this.info.playerId = socket.id; 
       this.info.score = 0;
       this.info.no = playerNo;
       this.info.input = {
        left: false,
        right: false,
        jump: false,
        attack : false,
      };
      this.attack_time = 20;
      this.attack_timehit = 14;
      this.maxhp = 20;
      this.power_attack = 10;
      this.power_heal = 1;  
      this.info.hp = 20;    // พลังรักษา
    }
    preUpdate(time, delta) {
      super.preUpdate(time,delta);
      if (!this.info.active) return;

      var isFloor = this.body.blocked.down;
      var input = this.info.input;      
      if (input.attack) this.attack();
      if (this.info.animation=='attack') return;

      if (input.left) {
        this.setVelocityX(-200);
        this.info.animation = 'walk';
        this.info.flipX = true;
      } else if (input.right) {
        this.setVelocityX(200);
        this.info.animation = 'walk';
        this.info.flipX = false;
      }
      else {
        this.info.animation = 'idle';
        this.setVelocityX(0);
      }        
      if (input.jump && isFloor) {
        this.setVelocityY(-500);
      }
      if (Math.abs(this.body.velocity.y) > 1) {
        this.info.animation = 'jump';
      }
    }    
    dead(){
       super.dead(); 
       this.info.score = 0;
       this.power_attack = 10;
       this.addScore(0);
    }
    pickup(item){
        this.addScore(item.info.score);        
        item.dead();
    }
    addScore(score){
        this.info.score += score;
        this.power_attack =  10+Math.floor(this.info.score/100);
        this.maxhp =  100+Math.floor(this.info.score/50);
    }

    after_attack(){
        this.attack_target = this.findClosetSprite(this.scene.monsters_group,100);
        if(this.attack_target!=null){
          this.attack_target.damaged(this.power_attack); 
          this.attack_target.attack_target = this;
          var vx=(this.info.flipX)?-200 : 200; 
          this.attack_target.setVelocityX(vx);
          this.attack_target.setVelocityY(-400);
          if(this.attack_target.info.hp <= 0){
            this.addScore(this.attack_target.score);
          }
        } 
    }
}