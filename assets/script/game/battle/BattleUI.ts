import { _decorator, Component, Node, find, ProgressBar, Label, tween, Tween, Animation, Sprite, instantiate } from 'cc';
import TableMaps from '../common/table/TableMaps';
import { BattleManger } from './BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleUI')
export class BattleUI extends Component {
    @property(Node)
    mapNode: Node = null;
    @property(Animation)
    matchAnim: Animation = null;
    @property(Label)
    msgsLengthLabel: Label = null;
    @property(Node)
    loadingUI: Node = null;
    @property(Sprite)
    pB: Sprite = null;
    @property(Label)
    pBLbl: Label = null;
    @property(Node)
    cdUI: Node = null;
    onLoad() {
        this.node.children.forEach(e => e.active = false);
    }
    start() {
        this.mapNode.active = false;
        this.mapNode.destroyAllChildren();
        let mapName = TableMaps.getInfoById(BattleManger.getInstance().mapId).res_name;
        BattleManger.getInstance().loadMiniatureMap(mapName).then((mapPrefab) => {
            this.mapNode.addChild(instantiate(mapPrefab));
        })

        // let uiof = this.mapNode.addComponent(UIOpacity);
        this.matchAnim.play('animation-002');
        this.matchAnim.on(Animation.EventType.FINISHED, () => {
            this.scheduleOnce(() => {
                this.mapNode.active = true;
            }, 0.1)
            // uiof.opacity = 0;
            // tween(uiof)
            //     .to(1, {
            //         opacity: 255
            //     })
            //     .start();
        })
    }

    update(deltaTime: number) {

    }

    showLoadingUI() {
        this.loadingUI.active = true;
    }
      
    onProgressCallback(finished: number, total: number, item: any) {
        let pb = this.pB;
        // this.data.finished = finished;
        // this.data.total = total;

        var progress = finished / total;
        if (progress > pb.fillRange) {
            pb.fillRange = progress;
            this.pBLbl.string = `${(progress * 100).toFixed(2)}%`;
        }
    }
    hideLoadingUI() {
        this.loadingUI.active = false;
    }

      
    startCountDown(ms: number) {
        let cd = Math.floor(ms / 1000);
        this.cdUI.active = true;
        let lbl = this.cdUI.getComponentInChildren(Label);
        lbl.string = `${cd}`
        Tween.stopAllByTarget(this.cdUI);
        let tw = tween(this.cdUI);
        for (let index = 0; index <= cd; index++) {
            tw.delay(1).call(() => {
                lbl.string = `${cd--}`
            })
        }
        tw.call(() => {
            this.cdUI.active = false;
        });
        tw.start();
    }
}

