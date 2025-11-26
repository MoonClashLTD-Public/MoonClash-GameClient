import { _decorator, Component, Node, Size, UITransform, Vec2, v2, v3, Vec3 } from 'cc';
import { BattleManger } from './BattleManger';
const { ccclass, property } = _decorator;

  
@ccclass('BattlePlacedArea')
export class BattlePlacedArea extends Component {
    @property(Node)
    tmpSprNode: Node;
    touchSize: Size = new Size();
    touchGrid: {
        size: Size,
        row: number,
        col: number,
    } = { size: new Size(), row: 0, col: 0 };

    start() {
    }

    update(deltaTime: number) {

    }

    init() {

        let battleMap = BattleManger.getInstance().BattleMap;
        this.touchGrid.row = battleMap.row / 2;
        this.touchGrid.col = battleMap.col / 2;
        this.touchGrid.size.width = battleMap.tiledSize.width * 2;
        this.touchGrid.size.height = battleMap.tiledSize.height * 2;
        this.touchSize.width = this.touchGrid.row * this.touchGrid.size.width;
        this.touchSize.height = this.touchGrid.col * this.touchGrid.size.height;

        // let x = 0, y = 0;
        // for (let i = 0; i < this.touchGrid.row; i++) {
        //     for (let j = 0; j < this.touchGrid.col; j++) {
        //         let node = instantiate(this.tmpSprNode);
        //         this.node.addChild(node);
        //         node.setPosition(x + this.touchGrid.size.width / 2, y - this.touchGrid.size.height / 2, 0);
        //         node.getComponent(UITransform).setContentSize(this.touchGrid.size);
        //         node.getComponent(Sprite).color = color(i * 20 + 40, j * 20 + 40, 0, 100);

        //         y -= this.touchGrid.size.height;
        //     }
        //     y = 0;
        //     x += this.touchGrid.size.width;
        // }
    }

    /**
       
     * @param posInPixel 
     * @returns 
     */
    getTilePos(posInPixel): Vec2 {
        // var mapSize = this.touchSize;
        var tileSize = this.touchGrid.size;
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor(posInPixel.y / tileSize.height) + 1;
        if (x >= 0 && x <= this.touchGrid.row && y * -1 >= 0 && y * -1 < this.touchGrid.col)
            return v2(x * tileSize.width + tileSize.width / 2, y * tileSize.height - tileSize.height / 2);
        return null;
    }
    /**
       
     * @param posInPixel 
     * @returns 
     */
    getPosTile(posInPixel): Vec2 {
        // var mapSize = this.touchSize;
        var tileSize = this.touchGrid.size;
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor(posInPixel.y / tileSize.height) + 1;
        return v2(x, y);
    }
      
    getTilePosByWorld(pos: Vec3) {
        let _pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(pos);
        let mPos = this.getTilePos(_pos);
        if (mPos) {
            let tPos = this.node.getComponent(UITransform).convertToWorldSpaceAR(v3(mPos.x, mPos.y, 0));
            return tPos;
        } else {
            return null;
        }
    }
      
    getTileWroldPos(pos: Vec3) {
        let _pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(pos);
        let mPos = this.getPosTile(_pos);
        return mPos;
    }
}

