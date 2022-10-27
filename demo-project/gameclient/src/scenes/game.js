
import Phaser from '../lib/phaser.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
    }
    load_dragonbone(key, name, tex = "") {
        this.load.dragonbone(
            key,
            "assets/dragonbone/" + name + "_tex.png",
            "assets/dragonbone/" + name + "_tex.json",
            "assets/dragonbone/" + name + "_ske.dbbin",
            null,
            null,
            { responseType: "arraybuffer" }
        );
    }
    preload() {
        this.load_dragonbone("player", "player");
        this.load_dragonbone("monsters", "monster");
        this.load_dragonbone("items", "items");

        this.load.tilemapTiledJSON("map", "assets/demo.json");
        this.load.image("platform", "assets/platformPack_tilesheet.png");
        const width  = this.scale.width;
        const height = this.scale.height; 
        this.center = {x: width/2, y: height/2};
    }
    create() {        
        const bShader = new Phaser.Display.BaseShader('star', filter_ball);
        const shader = this.add.shader(bShader, this.center.x, this.center.y, 16*60, 8*60);
        shader.setScrollFactor(0,0);

        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setDeadzone(width * 0.5, height * 0.5);

        this.map = this.make.tilemap({ key: "map" });
        const tileset = this.map.addTilesetImage("platformPack_tilesheet", "platform");
        this.layer_bg = this.map.createStaticLayer("bg", tileset, 0, 0);
        this.layer_ground = this.map.createDynamicLayer("ground", tileset, 0, 0);
        this.layer_fg = this.map.createStaticLayer("fg", tileset, 0, 0);
        this.layer_bg.depth = -1;
        this.layer_fg.depth = 9;
        this.players = {};
        this.items = {};
        this.monsters = {};

        //this.players_group = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        //this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);  // 32
        this.attackKey = this.input.keyboard.addKey(32); 

        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
        this.upKeyPressed = false;
        this.attackPressed = false;

        // var p = this.add.armature("player_zombie", "player");
        // p.x =400; p.y = 400;

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
            //console.log(players,this.socket);
            for (const id in players) {
                if (players[id].playerId === this.socket.id) {
                    this.me = this.displayPlayers(players[id]);
                    this.cameras.main.startFollow(this.me);
                } else {
                    this.displayPlayers(players[id]);
                }
            }
        });

        this.socket.on('currentItems', (items) => {
            for (const id in items) {
                var it = items[id];
                var iname = "01";
                if (it.color == "blue") iname = "02";
                if (it.color == "yellow") iname = "03";
                //var c = this.add.sprite(it.x, it.y, "items", it.tile);
                var c = this.add.armature("item_" + iname, "items");
                c.x = it.x;
                c.y = it.y;
                c.depth = 1;
                //c.animation.play("idle",-1);
                c.animation.gotoAndPlayByTime("idle", 100 * Math.random(), -1);
                c.id = id;
                c.item = it.item;
                c.setVisible(it.active);
                this.items[id] = c;
            }
        });

        this.socket.on('newPlayer', (playerInfo) => {
            this.displayPlayers(playerInfo);
        });

        this.socket.on('removeItem', (itemid) => {
            if (this.items[itemid])
                this.items[itemid].setVisible(false);
        }
        );

        this.socket.on('showItem', (itemid) => {
            if (this.items[itemid])
                this.items[itemid].setVisible(true);
        }
        );

        this.socket.on('removeplayer', (playerId) => {
            if (this.players[playerId]) {
                this.players[playerId].destroy();
                delete this.players[playerId];
            }
        });

        this.socket.on('playerUpdates', (players) => {
            for (var id in players) {
                if (this.players[id]) {
                    this.players[id].x = players[id].x;
                    this.players[id].y = players[id].y + 35;
                    //this.players[id].setFlipX(players[id].flipX);       // สำหรับ sprite
                    this.players[id].armature.flipX = players[id].flipX;  // สำหรับ dragonbone
                    this.players[id].label.text = "Score:" + players[id].score + " HP:" + players[id].hp;
                    if (this.players[id].animation_name != players[id].animation) {
                        this.players[id].animation_name = players[id].animation;
                        var loop = (players[id].animation=="dead")?1 : -1;  // -1 = infinity
                        this.players[id].animation.play(players[id].animation, loop);  // สำหรับ dragonbone

                    }
                }
            }
        });

        this.socket.on('currentMonsters', (list) => {
            for (const id in list) {
                var it = list[id];
                var c = this.add.armature("monster_" + it.sprite, "monsters");
                c.x = it.x;
                c.y = it.y + 35;
                c.depth = 1;
                c.animation.gotoAndPlayByTime("idle", 100 * Math.random(), -1);
                c.id = id;
                c.setVisible(it.active);
                c.label = this.add.text(-30, -110, "hp:");
                c.add(c.label);

                this.monsters[id] = c;
            }
        });

        this.socket.on('monstersUpdate', (list) => {
            for (var id in list) {
                if (this.monsters[id]) {
                    var it = list[id];
                    var c = this.monsters[id];
                    //c.setVisible(it.active);
                    c.label.text = "HP:" + it.hp;                    
                    if (!it.active) it.animation="dead";
                    c.x = it.x;
                    c.y = it.y;
                    c.armature.flipX = it.flipX;
                    if (c.animation_name != it.animation) {
                        c.animation_name = it.animation;
                        var loop = (it.animation=="dead")?1 : -1;  // -1 = infinity
                        c.animation.play(it.animation, loop);
                    }
                    //}
                }
            }
        });

        this.socket.on('disconnect', () => {
            this.socket.disconnect();
            this.scene.start("menu");
        });
    }

    update() {
        const left = this.leftKeyPressed;
        const right = this.rightKeyPressed;
        const jump = this.upKeyPressed;
        const attack = this.attackPressed;
        this.attackPressed = this.attackKey.isDown;

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

        if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || jump !== this.upKeyPressed ||
            attack !== this.attackPressed
        ) {
            this.socket.emit('playerInput',
                {
                    left: this.leftKeyPressed,
                    right: this.rightKeyPressed,
                    jump: this.upKeyPressed,
                    attack: this.attackPressed,
                });
        }
    }
    displayPlayers(playerInfo) {
        console.log(playerInfo);
        const player = this.add.armature("player_" + playerInfo.sprite, "player");
        //  window.dg = player;
        player.animation.play("idle", -1);
        player.playerId = playerInfo.playerId;
        player.depth = 1;
        player.x = playerInfo.x;
        player.y = playerInfo.y + 35;
        player.label = this.add.text(-30, -110, "Score:");
        player.add(player.label);

        this.players[player.playerId] = player;
        //this.players_group.add(player);
        return player;
    }
}

var filter_ball = `
precision highp float;

uniform float time;
uniform vec2 resolution;


// More Mods By NRLABS 2016


float speed = 0.0750;

float ball(vec2 p, float fx, float fy, float ax, float ay)
{
	vec2 r = vec2(p.x + sin(time*speed / 0.90 * fx) * ax * 10.0, p.y + cos(time*speed/ 2.0 * fy) * ay * 10.0);	
	return .027 / length(r / sin(fy * time * 0.01));
}

void main(void)
{
	vec2 p = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;
	p.x *= resolution.x / resolution.y;
	
	float col = 0.0;
		col += ball(p, 31.0, 22.0, 0.03, 0.09);
		col += ball(p, 22.5, 22.5, 0.04, 0.04);
		col += ball(p, 12.0, 23.0, 0.05, 0.03);
		col += ball(p, 32.5, 33.5, 0.06, 0.04);
		col += ball(p, 23.0, 24.0, 0.07, 0.03);	
		col += ball(p, 21.5, 22.5, 0.08, 0.02);
		col += ball(p, 33.1, 21.5, 0.09, 0.07);
		col += ball(p, 23.5, 32.5, 0.09, 0.06);
		col += ball(p, 14.1, 13.5, 0.09, 0.05);
		col += ball(p, 22.0, 27.0, 0.03, 0.05);
		col += ball(p, 12.5, 17.5, 0.04, 0.06);
		col += ball(p, 23.0, 17.0, 0.05, 0.02);
		col += ball(p, 19.5, 23.5, 0.06, 0.09);
		col += ball(p, 33.0, 14.0, 0.07, 0.01);	
		col += ball(p, 11.5, 12.5, 0.08, 0.04);
		col += ball(p, 23.1, 11.5, 0.09, 0.07);
		col += ball(p, 13.5, 22.5, 0.09, 0.03);
		col += ball(p, 14.1, 23.5, 0.09, 0.08);
		col *= 1.6;
	gl_FragColor = vec4(col * 0.22, col * 0.34, col * 0.9 * sin(time), 1.0);
}
`;
var filter_star = `
#ifdef GL_ES
precision mediump float;
#endif

// glslsandbox uniforms
uniform float time;
uniform vec2 resolution;

#define num_layers 6.

mat2 rot(float a) {

    float s=sin(a) , c=cos(a);
    
    return mat2(c, -s, s, c);
}    

float star(vec2 uv, float flare) {

float d = length (uv);
	
	float m = .05 / d;
	
	float rays = max (0. , 1. -abs (uv.x * uv.y * 1000.));
	m +=rays * flare;
	uv *=rot(3.1415/4.);
    rays = max (0. , 1. -abs (uv.x * uv.y * 1000.));
	m +=rays*.3 * flare;
    m *= smoothstep(1.,.2,d);
    return m;
  
}  

float hash (vec2 p) {

    p = fract(p*vec2(123.34,456.567));
    p += dot(p, p+45.32);
    return fract(p.x * p.y);
}

vec3 starlayer (vec2 uv)
{
vec3 col = vec3(0);

    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);
    for (int y=-1;y<=1;y++) {
        for (int x=-1;x<=1;x++) {
            vec2 offs = vec2(x,y);
            float n = hash(id+offs); // random value
            float size = fract(n*456.32);

            float star1 = star (gv-offs-vec2(n,fract (n*34.))+.5, smoothstep(.85,1.,size));
            
            vec3 color = vec3(0.4+(sin(uv.y+uv.x*2.0+n*1121.43)*.5),0.5,1.);	//sin(vec3(.2,.5,.9)*fract(n*4232.4)*6.28)*.5+.5;
            //color = color * vec3(1.,1,1.);
            //star1 *= sin(time*2.+n*12.56)*.5+1.;
		color.b *= 0.5+sin(n*17.7)*0.5;
            col+= star1*size*color;
            
        }
    }
   return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   
   // vec2 uv = (GL_FragCoord -.5 * resolution.xy) / resolution.y;
    vec2 uv = (fragCoord -.5 * resolution.xy) / resolution.y;	
    //if (gv.x > .48 || gv.y > .48) col.r = 1.;
    
    vec3 col = vec3 (0.);
    float t = time*.024+time/100.;
	uv *= rot(t);

    for (float i=0.;i < 1.;i += 1./num_layers)
    {
    float depth = fract(i+t);
    float scale = mix (20., .5, depth);
    float fade = depth*smoothstep (1.,.9,depth);;

    col+= starlayer(uv*scale+i*347.9)*fade;
    }
    
    fragColor = vec4(col,1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}`;
