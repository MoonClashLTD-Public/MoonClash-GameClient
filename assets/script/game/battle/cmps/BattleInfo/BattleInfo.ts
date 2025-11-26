import { _decorator, Component, Node, tween, easing, v3, Widget } from 'cc';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import { BattleManger } from '../../BattleManger';
import { BattleAlertCmp } from './BattleAlertCmp';
import { BattleDoubleFoodCmp } from './BattleDoubleFoodCmp';
import { BattleEndTime10Cmp } from './BattleEndTime10Cmp';
import { BattleInfoCmp } from './BattleInfoCmp';
import { BattleMathcTipsCmp } from './BattleMathcTipsCmp';
import { BattleNoCardTipsCmp } from './BattleNoCardTipsCmp';
import { BattleScoreCmp } from './BattleScoreCmp';
import { BattleSettlementCmp } from './BattleSettlementCmp';
import { BattleSettlementPVECmp } from './BattleSettlementPVECmp';
import { BattleStart1Cmp } from './BattleStart1Cmp';
import { BattleStart2Cmp } from './BattleStart2Cmp';
import { BattleTimeTipsCmp } from './BattleTimeTipsCmp';
import { BattleTouchFighterCmp } from './BattleTouchFighterCmp';
import { BattleSettlementTVGameCmp } from './BattleSettlementTVGameCmp';
const { ccclass, property } = _decorator;

@ccclass('BattleInfo')
export class BattleInfo extends Component {
    @property(BattleStart1Cmp)
    battleStart1Cmp: BattleStart1Cmp
    @property(BattleStart2Cmp)
    battleStart2Cmp: BattleStart2Cmp
    @property(BattleNoCardTipsCmp)
    battleNoCardTipsCmp: BattleNoCardTipsCmp
    @property(BattleScoreCmp)
    battleScoreCmp: BattleScoreCmp
    @property(BattleSettlementCmp)
    battleSettlementCmp: BattleSettlementCmp
    @property(BattleSettlementPVECmp)
    battleSettlementPVECmp: BattleSettlementPVECmp
    @property(BattleSettlementTVGameCmp)
    battleSettlementTVGameCmp: BattleSettlementTVGameCmp
    @property(BattleInfoCmp)
    battleInfoCmp: BattleInfoCmp

    @property(BattleTouchFighterCmp)
    battleTouchFighterCmp: BattleTouchFighterCmp   
    @property(BattleDoubleFoodCmp)
    battleDoubleFoodCmp: BattleDoubleFoodCmp   
    @property(BattleTimeTipsCmp)
    battleTimeTipsCmp: BattleTimeTipsCmp   
    @property(BattleAlertCmp)
    battleAlertCmp: BattleAlertCmp   
    @property(BattleEndTime10Cmp)
    battleEndTime10Cmp: BattleEndTime10Cmp   
    @property(BattleMathcTipsCmp)
    battleMathcTipsCmp: BattleMathcTipsCmp   

    onLoad() {
        this.node.children.forEach(e => e.active = false);

        this.battleInfoCmp.registers();
        this.battleTouchFighterCmp.registers();
        this.battleScoreCmp.registers();
    }
    onDestroy() {
        this.battleTouchFighterCmp.unRegisters();
        this.battleInfoCmp.unRegisters();
        this.battleScoreCmp.unRegisters();
    }
    start() {

    }

    update(deltaTime: number) {

    }

      
    showStart(ready_ms: number) {
        this._cameraActStart(ready_ms / 1000)
    }
      
    async showEnd(data: core.IBattleResult) {
        await CommonUtil.waitCmpt(this, 6);
        let n1 = BattleManger.getInstance().Battle.battleCards.node;   
        let n2 = BattleManger.getInstance().Battle.battleInfo.battleInfoCmp.node;   
        n1.getComponent(Widget).enabled = false;
        n2.getComponent(Widget).enabled = false;
        tween(n1)
            .by(1, { position: v3(0, -500, 0) }, { easing: easing.smooth })
            .start();
        tween(n2)
            .by(1, { scale: v3(5, 5, 5) }, { easing: easing.smooth })
            .start();


        let bm = BattleManger.getInstance();
        let t = 3;
        bm.Battle.mapNode.setScale(v3(1, 1, 1));
        tween(bm.Battle.mapNode)
            .to(t, { scale: v3(0.85, 0.85, 0.85) }, {
                easing: easing.cubicOut, onUpdate(target: Node, ratio: number) {
                    bm.BattleMap.mapShadowNode.setWorldScale(v3(1, 1, 1));
                }
            })
            .start();

        await CommonUtil.waitCmpt(this, 3);
        this.battleScoreCmp.hide();
        if (BattleManger.getInstance().isPVE()) {
            this.battleSettlementPVECmp.show(data);   
        } else if (BattleManger.getInstance().isTVGame()) {
            this.battleSettlementTVGameCmp.show(data);   
        } else {
            this.battleSettlementCmp.show(data);
        }
    }

      
    private _cameraActStart(readyTime: number) {
        let bm = BattleManger.getInstance();
        bm.Battle.battleUI.hideLoadingUI()
        let t = 3;
        let tt = readyTime;
        if (tt > t) {
            bm.Battle.mapNode.setScale(v3(0.85, 0.85, 0.85));
            tween(bm.Battle.mapNode)
                .to(t, { scale: v3(1, 1, 1) }, {
                    easing: easing.cubicOut, onUpdate(target: Node, ratio: number) {
                        bm.BattleMap.mapShadowNode.setWorldScale(v3(1, 1, 1));
                    },
                })
                .start();
            this._cameraActEnd(t, tt - t)
        } else {
            this._cameraActEnd(0, tt)
        }
    }

    // enterMapAct(node: Node, cb?: Function) {
    //     node.setScale(v3(0.75, 0.75, 0.75));
    //     tween(node)
    //         .to(3, { scale: v3(1, 1, 1) }, { easing: easing.cubicOut })
    //         .call(() => {
    //             cb && cb();
    //         })
    //         .start();
    // }
    // quitMapAct(node: Node) {
    //     tween(node)
    //         .to(3, { scale: v3(0.75, 0.75, 0.75) }, { easing: easing.cubicOut })
    //         .start();
    // }

      
    private async _cameraActEnd(t: number, overTime: number) {
        let bm = BattleManger.getInstance();

        // let t1 = t * 0.8;
        // let t2 = t * 0.2;
        bm.Battle.battleInfo.battleStart1Cmp.show(t, overTime);
        // await CommonUtil.waitCmpt(this, t);
        // bm.Battle.battleInfo.battleStart2Cmp.show(overTime);
    }
}

