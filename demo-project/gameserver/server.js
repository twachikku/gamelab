
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
    var charactor_names = ["01", "02", "03","04","05"];

    this.players_group = this.physics.add.group({ classType: Player });
    this.items_group = this.physics.add.staticGroup({ classType: GameItem });  // 
    this.monsters_group = this.physics.add.group({ classType: Monster });

    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("platformPack_tilesheet", "platform");
    this.layer_ground = this.map.createDynamicLayer("ground", tileset, 0, 0);
    this.layer_item = this.map.createDynamicLayer("item", tileset, 0, 0);
    this.layer_ground.setCollisionByProperty({ collide: true });

    this.physics.add.collider(this.layer_ground, this.players_group);
    this.physics.add.collider(this.layer_ground, this.monsters_group);
    this.physics.add.collider(this.monsters_group, this.monsters_group);

    this.physics.add.overlap(this.players_group, this.monsters_group, (player, m) => m.overlap(player) );
    this.physics.add.overlap(this.players_group, this.items_group,    (player, c) => player.pickup(c)  );

    this.layer_item.forEachTile((tile) => {
      if (tile.properties.monster) this.monsters_group.create(0,0,tile).setSize(40,70);
      if (tile.properties.item) this.items_group.create(0,0,tile).setSize(64,64);
    });
   
    io.on('connection', (socket) => {
      // create a new player and add it to our players object
      var charindex = Phaser.Math.Between(0, charactor_names.length - 1);
      var sprite = this.players_group.create(200, 0, charactor_names[charindex]);
      sprite.setSocket(socket);
      console.log('a user connected ' + sprite.info.no);
      this.players[socket.id] = sprite.info;
      socket.player = sprite.info;
      socket.sprite = sprite;
      socket.emit("currentPlayers", this.players);
      socket.emit('currentItems', GameItem.list);
      socket.emit('currentMonsters', Monster.list);
      socket.broadcast.emit("newPlayer", socket.player);
      socket.on('disconnect', () => {
        var player = socket.player;
        console.log('user disconnected ', player.no);
        socket.sprite.info = null;
        // remove player from server
        socket.sprite.destroy();
        delete this.players[socket.id];
        // emit a message to all players to remove this player
        io.emit('removeplayer', socket.id);
      });
      socket.on('playerInput', (input) => {
        socket.player.input = input;
      });
    }
    );

  }
  update() {    
    io.emit("playerUpdates", this.players);
    io.emit("monstersUpdate", Monster.list);
  }
}
