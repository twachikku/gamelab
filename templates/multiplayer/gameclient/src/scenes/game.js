
import Phaser from '../lib/phaser.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
    }
    load_dragonbone(key,name,tex=""){
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
    preload() {
        this.load_dragonbone("player","player");
        this.load.tilemapTiledJSON("map", "assets/demo.json");
        this.load.image("platform", "assets/platformPack_tilesheet.png");
        this.load.atlas("coins", "assets/coins.png", "assets/coins.json");
        this.load.spritesheet("items", "assets/platformPack_tilesheet.png",
            { frameWidth: 64, frameHeight: 64 });
    }
    create() {

        this.create_animate();
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setDeadzone(width * 0.5, height * 0.5);

        this.map = this.make.tilemap({ key: "map" });
        const tileset = this.map.addTilesetImage("platformPack_tilesheet", "platform");
        this.layer_bg = this.map.createStaticLayer("bg", tileset, 0, 0);
        this.layer_ground = this.map.createDynamicLayer("ground", tileset, 0, 0);
        this.layer_fg = this.map.createStaticLayer("fg", tileset, 0, 0);
        this.players = {};
        this.items = {};
        this.items_group = this.add.group();
        this.players_group = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
        this.upKeyPressed = false;

        this.create_socket();
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start("menu");
            // ตัดการติดต่อเมื่อกลับไปหน้าจอเมนู
            this.socket.disconnect();
        });

    }
    create_socket() {
        // connect game server  
        this.socket = io();
        // จัดการข้อมูลที่ได้รับจาก server
        this.socket.on('currentPlayers', (players) => {
            for (const id in players) {
                if (players[id].playerId === this.socket.id) {
                    this.me = this.displayPlayers(players[id], 'redhat');
                    this.cameras.main.startFollow(this.me);
                } else {
                    this.displayPlayers(players[id], 'redhat');
                }
            }
        });

        this.socket.on('currentItems', (items) => {
            for (const id in items) {
                var coin = items[id];
                var c = this.items_group.create(coin.centerx, coin.centery, "items", coin.tile);
                c.id = id;
                c.item = coin.item;
                c.setVisible(coin.active);
                if (c.item == 'coin')
                    c.play("coins-gold");

                c.setScale(0.6);
                this.items[id] = c;
                this.layer_ground.removeTileAt(coin.x, coin.y);
            }
        });

        this.socket.on('newPlayer', (playerInfo) => {
            this.displayPlayers(playerInfo, 'redhat');
        });

        this.socket.on('removeItem', (itemid) => {
            if (this.items[itemid])
                this.items[itemid].setVisible(false);
        }
        );

        this.socket.on('disconnect', (playerId) => {
            if (this.players[playerId]) {
                this.players[playerId].destroy();
            }
        });

        this.socket.on('playerUpdates', (players) => {
            for (var id in players) {
                if (this.players[id]) {
                    this.players[id].x = players[id].x;
                    this.players[id].y = players[id].y+36;
                    //this.players[id].setFlipX(players[id].flipX);       // สำหรับ sprite
                    this.players[id].armature.flipX = players[id].flipX;  // สำหรับ dragonbone

                    if(this.players[id].animation_name != players[id].animation){
                      this.players[id].animation_name = players[id].animation;  
                      //this.players[id].play(players[id].animation, true)         // สำหรับ sprite
                      this.players[id].animation.play(players[id].animation, -1);  // สำหรับ dragonbone
                    }
                }
            }
        });

        this.socket.on('updateScore', (scores)=>{

        });
    }

    create_animate() {
        this.anims.create({
            key: "coins-gold", frames: [
                { key: "coins", frame: "gold_1" },
                { key: "coins", frame: "gold_2" },
                { key: "coins", frame: "gold_3" },
                { key: "coins", frame: "gold_4" }
            ],
            repeat: -1,
            frameRate: 8,
        });
        this.anims.create({
            key: "coins-yellow", frames: [
                { key: "coins", frame: "yellow1" },
                { key: "coins", frame: "yellow2" },
                { key: "coins", frame: "yellow3" },
                { key: "coins", frame: "yellow4" },
                { key: "coins", frame: "yellow5" },
            ],
            repeat: -1,
            frameRate: 8,
        });        
    }
    update() {
        const left = this.leftKeyPressed;
        const right = this.rightKeyPressed;
        const jump = this.upKeyPressed;
        
        if (this.cursors.left.isDown) {
          this.leftKeyPressed = true;
        } else if (this.cursors.right.isDown) {
          this.rightKeyPressed = true;
        } else {
          this.leftKeyPressed = false;
          this.rightKeyPressed = false;
        }
        
        if (this.cursors.up.isDown) {
          this.upKeyPressed = true;
        } else {
          this.upKeyPressed = false;
        }
        
        if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || jump !== this.upKeyPressed) {
          this.socket.emit('playerInput', 
          { left: this.leftKeyPressed , 
            right: this.rightKeyPressed, 
            jump : this.upKeyPressed });
        }
    }
    displayPlayers(playerInfo, sprite) {        
         const player = this.add.armature("player_"+playerInfo.sprite, "dgplayer");
         window.dg = player;
         player.animation.play("idle",-1);
         player.playerId = playerInfo.playerId;
         player.depth = 1;
         player.x = playerInfo.x;
         player.y = playerInfo.y;         
         
         this.players[player.playerId] = player;
         this.players_group.add(player);
         return player;
     }
}