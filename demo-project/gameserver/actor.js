class Actor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, "");
        // ตัวแปร data ใช้สำหรับการส่งข้อมูล
        this.info = {
            x: x,
            y: y,
            flipX: false,
            sprite: key,
            animation: "idle",
            color: 0xFFFFFF,
            hp: 100,
            level: 1,
            active: true,
        };
        this.alive = true;
        this.maxhp = 100;
        this.power_defence = 1;
        this.power_attack = 10;
        this.power_heal = 0;         // พลังรักษา
        this.attack_target = null;   // actor เป้าหมาย
        this.attack_time = 30;       // เวลาที่ใช้ท่าโจมตี  จำนวน frame 
        this.attack_timehit = 20;    // เวลาที่ใช้โจมตี    จำนวน frame
        // จุดเกิด
        this.spawn_x = x;
        this.spawn_y = y;
        this.rebirth_time = 10000;    // เวลาที่จะกลับมาเกิดใหม่  millisec
        this.delta = 0;
    }

    preUpdate(time, delta) {
        this.delta += delta;
        this.info.x = this.x;
        this.info.y = this.y;
        if(!this.info.active) return;
        if(this.info.active && this.info.y > 4000) {
            this.dead();
        }               
        if(this.delta>1000){
          if (this.info.hp < this.maxhp) {
            this.info.hp += this.power_heal;
          } else if (this.info.hp > this.maxhp) {
            this.info.hp = this.maxhp;
          }
          if (this.info.hp <= 0) {
            this.dead();
          }
          this.delta -= 1000;
        }
    }
    // ตาย
    dead() {
        if(!this.alive) return; 
        this.alive = false;
        this.attack_target = null;
        this.setVelocity(0, 0);
        this.info.hp = 0;
        this.info.animation = "dead";
        this.info.active = false;
        //console.log("call rebirth "+this.rebirth_time);
        this.scene.time.delayedCall(this.rebirth_time, () => this.rebirth());
    }
    // เกิดใหม่
    rebirth() {
        //console.log("rebirth ");
        this.alive = true;
        this.info.animation = "idle";
        this.info.active = true;
        this.info.hp = this.maxhp;
        this.x = this.spawn_x;
        this.y = this.spawn_y;
        this.setVelocity(0, 0);
    }

    attack() {        
        if (this.info.animation != "attack") {
            this.info.animation = "attack";
            this.setVelocityX(0);
            this.scene.time.delayedCall(this.attack_timehit / 24 * 1000, () => this.after_attack());
            this.scene.time.delayedCall(this.attack_time / 24 * 1000, () => this.info.animation = "idle");
        }
    }
    after_attack() {

    }

    damaged(power_attack) {
        if (this.info==null) return;
        if (!this.alive) return;
        if (this.info.animation == "hurt") return;
        var dm = power_attack - this.power_defence;
        if (dm < 0) dm = 0;
        this.info.hp -= dm;
        this.info.animation = "hurt";
        this.info.active = false;
        this.scene.time.delayedCall(500, () => {
            if(this.info.animation!="dead"){
              this.info.animation = "idle";
              this.info.active = true;
            }
        });
    }

    distance(target) {
        var dx = this.x - target.x;
        var dy = this.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    findClosetSprite(group, min = 300) {
        var result = null;
        group.getChildren().forEach((sprite) => {
            if (sprite.info.active) {
                var d = this.distance(sprite);
                if (d < min) {
                    min = d;
                    result = sprite;
                }
            }
        });
        return result;
    }
}