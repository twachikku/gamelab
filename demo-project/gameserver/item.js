
class GameItem extends Phaser.Physics.Arcade.Sprite {
    static list = [];
    constructor(scene, x, y, tile) {
        super(scene, tile.getCenterX(), tile.getCenterY(), "");
        this.info = {
            id: GameItem.list.length,
            x: tile.getCenterX(),
            y: tile.getCenterY(),
            color: tile.properties.color,
            item: tile.properties.item,
            score: tile.properties.score,
            tile: tile.index,
            active: true,
        };
        this.width = tile.width;
        this.height = tile.height;
        this.rebirth_time = 10000; // 10 sec
        GameItem.list.push(this.info);
    }

    dead(){
       this.active = false;
       this.disableBody();
       this.info.active = false;
       io.emit('removeItem', this.info.id);
       this.scene.time.delayedCall(this.rebirth_time,()=>this.rebirth());  
    }
    rebirth(){
        this.active = true;
        this.enableBody();
        this.info.active = true;
        io.emit('showItem', this.info.id);
    }
}