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
  }
  create() {
    console.log("Server is created.");
    var charactor_names = ["man1", "man2", "robot", "woman1", "woman2", "zombie"];

    io.on('connection', (socket) => {
      this.playerNo++;
      console.log('a user connected ' + this.playerNo);
      // create a new player and add it to our players object
      var charindex = Phaser.Math.Between(0, 5);
      socket.player = {
        x: 200,
        y: 50,
        no: this.playerNo,
        animation: "idle",
        flipX: false,
        sprite: charactor_names[charindex],
        status: 1,
        score: 0,
        hp: 0,
        input: {
          left: false,
          right: false,
          jump: false,
        }
      };
      this.players[socket.id] = socket.player;

      socket.on('disconnect', ()=>{
        var player = socket.player;
        console.log('user disconnected ',player.no);
        // remove player from server
        delete this.players[socket.id];
        // emit a message to all players to remove this player
        io.emit('removeplayer', socket.id);
      });
    }
    );

  }
  update() {

  }
}
