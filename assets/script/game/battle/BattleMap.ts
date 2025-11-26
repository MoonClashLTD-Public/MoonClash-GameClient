import { instantiate, Node, Size, TiledMap, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import { Logger } from "../../core/common/log/Logger";
import { AStar, AStarGrid } from "./astar/AStar";
import { AStar16 } from "./astar/AStar16";

enum MapTiledLayer {
    AIR = 'air',   
    GROUND = 'ground',   
    BORNRED = 'bornRed',   
    BORNBLUE = 'bornBlue',   
    BLOCK = 'block',   
}
enum MapObjcetLayer {
    BUILDING = 'building',   
}
enum MapTiled {
    ROAD = 1,   
    UNREASONABLE = 2,   
    LEAP = 3,   
    BLOCK = 4,   
}

export enum MapPlacedArea {   
    BLOCK = -1,   
    NONE = 0,   
    PLACEDAREA = 8,   
    PLACEDAREALEFT = 6,   
    PLACEDAREARIGHT = 7,   
    PLACEDAREALEFTME = 9,   
    PLACEDAREARIGHTME = 10,   
}

export class BattleMap {
    mapShadowNode: Node
    bg: Node
    private _tiledMap: TiledMap;
    private _tiledCPos: Vec2;
    UITransform: UITransform;
    mapSize: Size
    tiledSize: Size
    row: number
    col: number
    tiledNum: number
    // autoFindPath: AStar = new AStar();
    // private _grid: AStarGrid;
    autoFindPath: AStar16.AStar = new AStar16.AStar();
    private _grid: AStar16.Grid;

      
    setShadow(shadowNode: Node, mapNode: Node) {
        let mapShadowNode = this._tiledMap.node.parent.getChildByName('shadowNode')
        if (mapShadowNode && mapShadowNode.children.length == 0) {
            let node = instantiate(shadowNode);
            mapShadowNode.addChild(node);
            this.mapShadowNode = mapShadowNode;
            node.active = true;
            shadowNode.active = false;
            node.setPosition(v3(0, -mapNode.position.y, 0));
        }
    }

    constructor(tiledMap: TiledMap) {
        this._tiledMap = tiledMap;
        this.bg = tiledMap.node.parent.getChildByName('bg');
        this.UITransform = this.getGroundLayer().node.getComponent(UITransform);
        // this.mapSize = tiledMap.getMapSize();
        this.mapSize = this.UITransform.contentSize;
        this.tiledSize = tiledMap.getTileSize();
        // this.row = this.mapSize.width / this.tiledSize.width;
        // this.col = this.mapSize.height / this.tiledSize.height;
        this.row = this._tiledMap.getMapSize().width;
        this.col = this._tiledMap.getMapSize().height;
        this.tiledNum = this.row * this.col;
        this._tiledCPos = v2(this.tiledSize.width / 2, this.tiledSize.height / 2)

        this.initAStar();
    }

    initAStar() {
        this._grid = new AStar16.Grid(this.row, this.col);
        let air = this.getLayer(MapTiledLayer.AIR);
        let ground = this.getLayer(MapTiledLayer.GROUND);
        let block = this.getLayer(MapTiledLayer.BLOCK);
        let bronRed = this.getLayer(MapTiledLayer.BORNRED);
        let bronBlue = this.getLayer(MapTiledLayer.BORNBLUE);
        let layerSize = block.getLayerSize();

        air.node.active = true;
        ground.node.active = true;
        block.node.active = false;
        bronRed.node.active = false;
        bronBlue.node.active = false;

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                  
                let tiled = block.getTiledTileAt(i, j, true);
                if (tiled.grid == MapTiled.LEAP || tiled.grid == MapTiled.BLOCK) {
                    this._grid.setWalkable(i, j, false);   
                } else {
                    this._grid.setWalkable(i, j, true);   
                }

                  
                if (tiled.grid == MapTiled.ROAD) {
                    this._grid.setCostMultiplier(i, j, 1.0);
                } else {
                    this._grid.setCostMultiplier(i, j, 1.3);
                }
            }
        }
    }

    searchPath(startPos: Vec2, endPos: Vec2) {
        let startP = this.getTilePos(startPos);
        let endP = this.getTilePos(endPos);
        this._grid.setStartNode(startP.x, startP.y);
        this._grid.setEndNode(endP.x, endP.y);
        if (this.autoFindPath.findPath(this._grid)) {
            return this.autoFindPath.path;
        }
        return [];
    }

    getBluePlacedArea(x: number, y: number) {
        try {
            let w = this.tiledSize.width / 2;
            let h = this.tiledSize.height / 2;
            let pos = [
                v2(x - w, y + h), v2(x + w, y + h),
                v2(x - w, y - h), v2(x + w, y - h),
            ]

            let getArea = (x: number, y: number) => {
                let tiledPos = this.getTilePos(v2(x, y));
                let bronBlue = this.getLayer(MapTiledLayer.BORNBLUE);
                let tiled = bronBlue.getTiledTileAt(tiledPos.x, tiledPos.y, true);
                let mapPlacedArea: MapPlacedArea = tiled.grid;
                return mapPlacedArea;
            }

            let areas: MapPlacedArea[] = [];
            pos.forEach(e => {
                let area = getArea(e.x, e.y);
                areas.push(area);
            });

            let idx = areas.findIndex((v) => v == MapPlacedArea.NONE);
            if (idx != -1) {
                return MapPlacedArea.NONE;
            } else {
                return getArea(x, y);
            }
        } catch (error) {
            return MapPlacedArea.BLOCK;
        }


        // if (tiled.grid == MapPlacedArea.PLACEDAREA) {
        //     log("PLACEDAREA")
        // } else if (tiled.grid == MapPlacedArea.PLACEDAREALEFT) {
        //     log("PLACEDAREALEFT")
        // } else if (tiled.grid == MapPlacedArea.PLACEDAREARIGHT) {
        //     log("PLACEDAREARIGHT")
        // }
    }

    getBarrierTilePos(x: number, y: number) {
        let layer = this._tiledMap.getLayer(MapTiledLayer.BLOCK);
        let tiled = layer.getTiledTileAt(x, y, false);   
        return tiled;
    }

    /**
       
     * @param posInPixel 
     * @returns 
     */
    getTilePos(posInPixel): Vec2 {
        var mapSize = this.UITransform;
        var tileSize = this._tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        return v2(x, y);
    }

    private getLayer(lay: MapTiledLayer) {
        return this._tiledMap.getLayer(lay);
    }

    getGroundLayer() {
        return this.getLayer(MapTiledLayer.GROUND);
    }
    getAirLayer() {
        return this.getLayer(MapTiledLayer.AIR);
    }

      
    getMapPosByTPos(mPos: Vec3) {
        let tPos = this.getGroundLayer().getPositionAt(mPos).add(this._tiledCPos);   
        let pos = this.UITransform.convertToWorldSpaceAR(v3(tPos.x, tPos.y, 0));
        return pos;
    }
      
    getMapPosByWorld(pos: Vec3) {
        let mPos = this.UITransform.convertToNodeSpaceAR(pos);
        return mPos;
    }

}