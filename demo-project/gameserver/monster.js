class Monster extends Actor {
  static list = [];
  constructor(scene, x, y, tile) {
    super(scene, tile.getCenterX(), tile.getCenterY(),tile.properties.monster);
    this.info.id = Monster.list.length;
    this.width = 40;
    this.height = 70;
    this.attack_timehit = 20;
    this.attack_time    = 30;
    this.attack_target  = null;
    this.score   = tile.properties.score;
    this.maxhp   = tile.properties.maxhp;
    this.info.hp = this.maxhp;
    this.power_attack    = tile.properties.atk;
    this.power_defence   = tile.properties.def;
    this.power_heal      = tile.properties.heal;
    this.rebirth_time    = tile.properties.rebirth*1000;
    Monster.list.push(this.info);
  }

  preUpdate(time, delta) {
    super.preUpdate(time,delta);
    var v = this.body.velocity;
    var data = this.info;
    this.info.y = this.y+50;
    if(!this.info.active) return;
    if (data.animation == 'idle' || data.animation == 'walk') {
      if (v.x < -0.1 || v.x > 0.1) {
        data.animation = "walk";
        if (v.x < 0) data.flipX = true;
        if (v.x > 0) data.flipX = false;
      } else {
        data.animation = "idle";
      }
    }    
    
    if (data.animation != "attack" && this.attack_target) {
      if (this.x > this.attack_target.x) {
        this.setVelocityX(-50);
      }
      if (this.x < this.attack_target.x) {
        this.setVelocityX(50);
      }
      var d = this.distance(this.attack_target);
      if (d < 100 && this.body.blocked.down) this.setVelocityY(-200);
      if (d > 300) this.attack_target = null;
    }

    if (!this.attack_target) {
      this.attack_target = this.findClosetSprite(this.scene.players_group, 300);
    }else if(this.attack_target.info==null || !this.attack_target.alive){
      this.attack_target = null; 
    }
    
  }

  overlap(player) {
    if (this.info.active && this.info.animation != "attack" ) {
      this.attack_target = player;      
      this.info.flipX = this.x > player.x;      
      this.setVelocityY(-50);
      this.attack();
    }
  }

  after_attack() {
     
    if(this.info.active && this.attack_target!=null){
      var dy = Math.abs(this.y - this.attack_target.y);
      if(dy<70){
         var dx=this.attack_target.x - this.x;
         if(this.info.flipX) dx=-dx;
         if(dx>10 && dx<70){
          this.attack_target.damaged(this.power_attack);
          var vx=(this.info.flipX)?-50 : 50; 
          this.attack_target.setVelocityX(vx);
         }
      }
    }
     
  }
}