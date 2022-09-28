class ServerScene extends Phaser.Scene {
  constructor() {
    super();
    this.players = {};
    this.playerNo = 0;
    this.isGameOver = false;
  }
  preload() {
    this.load.tilemapTiledJSON("map", "../gameclient/assets/demo.json");
    this.load.image("rect", "../gameclient/assets/rect.png");
    this.load.image("platform", "../gameclient/assets/platformPack_tilesheet.png");

  }
  create() {
    console.log("Server is created.");
    var charactor_names = ["man1", "man2", "robot", "woman1", "woman2", "zombie"];
    this.players_group = this.physics.add.group();
    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("platformPack_tilesheet", "platform");
    this.layer_ground = this.map.createDynamicLayer("ground", tileset, 0, 0);
    this.layer_ground.setCollisionByProperty({ collide: true });
    this.physics.add.collider(this.layer_ground, this.players_group);
    this.physics.add.collider(this.players_group);

    io.on('connection', (socket) => {
      this.playerNo++;
      console.log('a user connected ' + this.playerNo);
      // create a new player and add it to our players object
      var charindex = Phaser.Math.Between(0, 5);
      socket.player = {
        x: Phaser.Math.Between(200, 260),
        y: Phaser.Math.Between(100, 200),
        no: this.playerNo,
        animation: "idle",
        flipX: false,
        playerId : socket.id,
        sprite: charactor_names[charindex],
        status: 1,
        score: 0,
        hp: 100,
        mp: 0, maxhp: 100, 
        input: {
          left: false,
          right: false,
          jump: false,
        }
      };
      var sprite = this.physics.add.sprite(socket.player.x, socket.player.y,"");
      sprite.setSize(40,70);
      sprite.socketId = socket.id;
      this.players_group.add(sprite);
      this.players[socket.id] = socket.player;
      socket.emit("currentPlayers",this.players);
      socket.broadcast.emit("newPlayer",socket.player);
      socket.on('disconnect', ()=>{
        var player = socket.player;
        console.log('user disconnected ',player.no);
        // remove player from server
        delete this.players[socket.id];
        // emit a message to all players to remove this player
        io.emit('removeplayer', socket.id);
      });

       socket.on('playerInput',(input)=>{
        socket.player.input = input;
       });
    }
    );

  }
  update() {
    this.players_group.getChildren().forEach((sprite) => {

       if(this.players[sprite.socketId]){
        var p = this.players[sprite.socketId];
        var isFloor = sprite.body.blocked.down;
        var input = p.input;
        if(input.left){
          sprite.setVelocityX(-200);
          p.animation = 'walk';
          p.flipX = true;
        }
        else if(input.right){
          sprite.setVelocityX(200);
          p.animation = 'walk';
          p.flipX = false;
        }
        else {
          p.animation = 'idle';
          sprite.setVelocityX(0);
        }

        if(input.jump && isFloor){          
          sprite.setVelocityY(-500);
        }
        if(Math.abs(sprite.body.velocity.y)>1){
          p.animation = 'jump';
        }

        p.x = sprite.x;
        p.y = sprite.y;
       }       
    });
    io.emit("playerUpdates",this.players);
  }
}
