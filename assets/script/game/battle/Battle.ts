import { _decorator, Component, Node, TiledMap, v2, tween, Tween, v3, UITransform, Vec3, Vec2, instantiate } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { LayerUtil } from '../../core/utils/LayerUtil';
import { UIID } from '../common/config/GameUIConfig';
import { BattleCards } from './BattleCards';
import { BattleManger } from './BattleManger';
import { BattlePlacedArea } from './BattlePlacedArea';
import { BattleTouch } from './BattleTouch';
import { BattleUI } from './BattleUI';
import { BattleZIndexManager } from './BattleZIndexManager';
import { BattleAudio } from './cmps/BattleInfo/BattleAudio';
import { BattleInfo } from './cmps/BattleInfo/BattleInfo';
import { BattleEvent, BattlePrefabs, BattleTowerType } from './utils/BattleEnum';
import { BattleWatcherInfo } from './watcher/BattleWatcherInfo';
const { ccclass, property } = _decorator;

@ccclass('Battle')
export class Battle extends Component {
    @property(Node)
    mapNode: Node
    @property(Node)
    shadowNode: Node   
    @property(BattlePlacedArea)
    battlePlacedArea: BattlePlacedArea   
    @property(BattleTouch)
    battleTouch: BattleTouch
    @property(BattleUI)
    battleUI: BattleUI
    @property(Node)
    startNode: Node
    @property(Node)
    endNode: Node
    @property(Node)
    bgNode: Node
    @property(Node)
    cgNode: Node
    @property(Node)
    fgNode: Node

    battleCards: BattleCards   
    battleInfo: BattleInfo
    battleWatcherInfo: BattleWatcherInfo
    battleAudio: BattleAudio
    tiledMap: TiledMap;
    async start() {
        this.battleCards = null;
        this.battleUI.showLoadingUI();
        BattleManger.getInstance().initRes(this);
        BattleManger.getInstance().isLoadRes = true;
        let bf = await BattleManger.getInstance().loadRes(this.battleUI.onProgressCallback.bind(this.battleUI));
        BattleManger.getInstance().isLoadRes = false;
        let needClose = false;
        if (!!!bf) {
            needClose = true;
            oops.gui.toast('load_res_error', true);
        }
        if (BattleManger.getInstance().needClose || needClose) {
            oops.gui.remove(UIID.BattleUI, true);
            return;
        }
        this.createMap();
        BattleManger.getInstance().create();

        let battlePrefabs = BattleManger.getInstance().battlePrefabs;
          
        let cardNodes = instantiate(battlePrefabs[BattlePrefabs.BattleCards]);
        this.bgNode.addChild(cardNodes);
        this.battleCards = cardNodes.getComponent(BattleCards);

          
        let battleWatcherInfo = instantiate(battlePrefabs[BattlePrefabs.BattleWatcherInfo]);
        this.fgNode.addChild(battleWatcherInfo);
        this.battleWatcherInfo = battleWatcherInfo.getComponent(BattleWatcherInfo);

          
        let battleInfo = instantiate(battlePrefabs[BattlePrefabs.BattleInfo]);
        this.fgNode.addChild(battleInfo);
        this.battleInfo = battleInfo.getComponent(BattleInfo);

          
        let battleAudio = instantiate(battlePrefabs[BattlePrefabs.BattleAudio]);
        this.fgNode.addChild(battleAudio);
        this.battleAudio = battleAudio.getComponent(BattleAudio);

        if (BattleManger.getInstance().battleData) {
            BattleManger.getInstance().openBattle(errcode.ErrCode.Ok);
        }

        let node = new Node();
        node.layer = LayerUtil.UI_2D.mask;
        node.addComponent(UITransform).setAnchorPoint(v2(0, 0));
        BattleManger.getInstance().BattleMap.getGroundLayer().addUserNode(node);
        BattleZIndexManager.getInstance().init(node);

        // test
        // let floor = BattleManger.getInstance().BattleMap.getGroundLayer();
        // // role_drudgery
        // // role_harvester
        // let battlePrefabs = BattleManger.getInstance().battlePrefabs;
        // let roleNode = instantiate(battlePrefabs[BattlePrefabs.Flighter]);
        // roleNode.setPosition(v3(20 * 4 - 20 / 2, 16 * 8 - 16 / 2, 0));
        // floor.addUserNode(roleNode);
        // // // this.mapNode.addChild(roleNode);
        // let flighter = roleNode.getComponent(Flighter);
        // flighter.init('role_drudgery');
    }

    dataInit() {
        if (this.battleCards)
            this.battleCards.hide();
    }

      
    onAdded(data: unknown) {
        Message.dispatchEvent(BattleEvent.ENTER);
    }
      
    onRemoved() {
        Message.dispatchEvent(BattleEvent.QUIT);
    }

    onBeforeRemove() {
        // oops.gui.camera.orthoHeight = oops.gameConfig.orthoHeight;
    }

    update(deltaTime: number) {
        BattleManger.getInstance().updateMsg(deltaTime);
        BattleZIndexManager.getInstance().update(deltaTime);
    }

    onDestroy() {
        BattleManger.getInstance().exitGame();
        BattleZIndexManager.getInstance().destroy();
        oops.gui.open(UIID.HomeUI);
    }

    createMap() {
        let node = instantiate(BattleManger.getInstance().mapPrefab);
        this.tiledMap = node.getComponentInChildren(TiledMap);
        this.mapNode.addChild(node);
    }

    findPathClick2() {
        let startPos = this.startNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        startPos = BattleManger.getInstance().BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(startPos);
        let endPos = this.endNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        endPos = BattleManger.getInstance().BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(endPos);
        // let path = BattleManger.getInstance().BattleMap.searchPath(v2(startPos.x, startPos.y), v2(endPos.x, endPos.y));
        let path = BattleManger.getInstance().BattleMap.searchPath(v2(endPos.x, endPos.y), v2(startPos.x, startPos.y));
        console.log(path);
        if (path.length == 0) return;
        Tween.stopAllByTarget(this.endNode);
        let tw = tween(this.endNode)
        let ppp = this.endNode.position;
        for (const p of path) {
            let wPos = BattleManger.getInstance().BattleMap.getMapPosByTPos(v3(p.x, p.y));
            let pos = this.endNode.parent.getComponent(UITransform).convertToNodeSpaceAR(wPos);
            let t = Vec2.distance(pos, ppp) / 80;
            tw.to(t, { position: v3(pos.x, pos.y, 0) });
            ppp = pos;
        }
        tw.start();
    }
    findPathClick() {
        this.findPathClick2();

        let startPos = this.startNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        startPos = BattleManger.getInstance().BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(startPos);
        let endPos = this.endNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        endPos = BattleManger.getInstance().BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(endPos);
        let path = BattleManger.getInstance().BattleMap.searchPath(v2(startPos.x, startPos.y), v2(endPos.x, endPos.y));
        console.log(path);
        if (path.length == 0) return;
        Tween.stopAllByTarget(this.startNode);
        let tw = tween(this.startNode)
        let ppp = this.startNode.position;
        for (const p of path) {
            let wPos = BattleManger.getInstance().BattleMap.getMapPosByTPos(v3(p.x, p.y));
            let pos = this.startNode.parent.getComponent(UITransform).convertToNodeSpaceAR(wPos);
            let t = Vec2.distance(pos, ppp) / 80;
            tw.to(t, { position: v3(pos.x, pos.y, 0) });
            ppp = pos;
        }
        tw.start();
    }

    testClick() {
        let x = this.mapNode.children[0].getChildByName("chilun");
        x.active = !x.active;
    }
}

