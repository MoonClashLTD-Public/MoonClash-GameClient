import { _decorator, Component, Node, Label, tween, v3, easing, UITransform, Vec3, instantiate, Animation, Skeleton, sp, UIOpacity, Tween } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { oops } from '../../../../core/Oops';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import TableEquip from '../../../common/table/TableEquip';
import TableGlobalConfig from '../../../common/table/TableGlobalConfig';
import { AudioSoundRes } from '../../../data/resManger';
import { WalletEquipment } from '../../../walletUI/widget/WalletEquipment';
import { BattleManger } from '../../BattleManger';
import { FighterManager } from '../../flighter/FighterManager';
import { BattleEvent, BattleTowerType } from '../../utils/BattleEnum';
const { ccclass, property } = _decorator;

@ccclass('BattleInfoCmp')
export class BattleInfoCmp extends Component {
    @property(Node)
    pveIcon: Node
    @property(Node)
    cupIcon: Node
    @property(Label)
    iconScoreLbl: Label
    @property(Label)
    meNameLbl: Label
    @property(Label)
    timeLbl: Label
    @property(Label)
    timeLblRed: Label
    @property(Node)
    meSpr: Node
    @property(Node)
    enemySpr: Node
    @property(Label)
    meScoreLbl: Label
    @property(Label)
    enemyScoreLbl: Label

    @property(Node)
    crownNode: Node

    @property(Node)
    rightStoreNode: Node
    @property(Node)
    meEquipmentNode: Node
    @property(Node)
    enemyEquipmentNode: Node

    start() {
        this.crownNode.active = false;
    }

    update(deltaTime: number) {

    }

    init() {
        this.node.active = true;
        this.updTime(0);

        let meTowerIds: BattleTowerType
        let emenyTowerIds: BattleTowerType
        if (BattleManger.getInstance().meTeam == core.Team.Blue) {
            meTowerIds = FighterManager.getInstance().blueTowerIds;
            emenyTowerIds = FighterManager.getInstance().redTowerIds;
        } else {
            meTowerIds = FighterManager.getInstance().redTowerIds;
            emenyTowerIds = FighterManager.getInstance().blueTowerIds;
        }
        this.meNameLbl.string = BattleManger.getInstance().getEnemyName();
        this.meNameLbl.node.parent.active = BattleManger.getInstance().isWatcher == false;
        this.cupIcon.active = !BattleManger.getInstance().isPVE();
        this.pveIcon.active = BattleManger.getInstance().isPVE();
        this.iconScoreLbl.string = `${9999}`;
        this.iconScoreLbl.node.parent.active = false;   
        this.updMeScore(meTowerIds);
        this.updEnemyScore(emenyTowerIds);


          
        this.updEquipInfo(this.meEquipmentNode, BattleManger.getInstance().battleData.armys[BattleManger.getInstance().meTeam].equips)
        this.updEquipInfo(this.enemyEquipmentNode, BattleManger.getInstance().battleData.armys[BattleManger.getInstance().enemyTeam].equips)
    }

    updEquipInfo(node: Node, equips: core.IEquipment[]) {
        for (let index = 0; index < node.children.length; index++) {
            let equip = equips[index];
            const equipment = node.children[index].getComponent(WalletEquipment);
            if (equip) {
                equipment.init(equip);
                equipment.hideAttr();
            }
            equipment.node.active = !!equip;
        }
    }

    updTime(time: number) {
        let t = TableGlobalConfig.cfg.over_time_ms
        let _time = time - t;
        let isOver = false;   
        if (_time < 0) {
              
            _time = t + _time;
            isOver = true;
        } else {
        }
        this.timeLblRed.node.active = isOver;
        this.timeLbl.node.active = !isOver;

        let _s = Math.floor(_time / 1000);
        let m = Math.floor(_s / 60);
        let s = _s - m * 60;

        if (_s <= 10)   
            BattleManger.getInstance().Battle.battleInfo.battleEndTime10Cmp.show(Math.floor(_time / 1000))
        else
            BattleManger.getInstance().Battle.battleInfo.battleEndTime10Cmp.hide();

        this.timeLbl.string = `${CommonUtil.prefixInteger(m, 2)}:${CommonUtil.prefixInteger(s, 2)}`
        this.timeLblRed.string = `${CommonUtil.prefixInteger(m, 2)}:${CommonUtil.prefixInteger(s, 2)}`
    }

    registers() {
        Message.on(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.on(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }
    unRegisters() {
        Message.off(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.off(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }

    BLUETOWERREDUCE(eventName: string, args: BattleTowerType) {
        if (BattleManger.getInstance().enemyTeam == core.Team.Blue) {
              
            this.updEnemyScore(args);
        } else {
              
            this.updMeScore(args);
        }
    }
    REDTOWERREDUCE(eventName: string, args: BattleTowerType) {
        if (BattleManger.getInstance().enemyTeam == core.Team.Red) {
              
            this.updEnemyScore(args);
        } else {
              
            this.updMeScore(args);
        }
    }

    playAudio(args: BattleTowerType) {
        let num = 0;
        if (args.centerTower != 0) {
            num++;
        }
        if (args.leftTower != 0) {
            num++;
        }
        if (args.rightTower != 0) {
            num++;
        }
        if (num == 2) {
            oops.audio.playEffect(AudioSoundRes.battleOne);
        } else if (num == 1) {
            oops.audio.playEffect(AudioSoundRes.battleTwo);
        } else if (num == 0) {
            oops.audio.playEffect(AudioSoundRes.battleThree);
        }
    }

    async updMeScore(args: BattleTowerType) {
        this.playAudio(args);
        await CommonUtil.waitCmpt(this, 0.5);
        let uif = this.rightStoreNode.getComponent(UIOpacity);
        Tween.stopAllByTarget(uif);
        uif.opacity = 255;
        await this.crownAct(args.dieFId, this.enemySpr);
        this.sprAct(this.enemySpr);
        this.enemyScoreLbl.string = `${BattleManger.getInstance().calcScore(args)}`;
    }
    async updEnemyScore(args: BattleTowerType) {
        this.playAudio(args);
        await CommonUtil.waitCmpt(this, 0.5);
        let uif = this.rightStoreNode.getComponent(UIOpacity);
        Tween.stopAllByTarget(uif);
        uif.opacity = 255;
        await this.crownAct(args.dieFId, this.meSpr);
        this.sprAct(this.meSpr);
        this.meScoreLbl.string = `${BattleManger.getInstance().calcScore(args)}`;
    }

      
    crownAct(fId: number, targetNode: Node) {
        let f = FighterManager.getInstance().flighters.get(fId);
        if (f) {
            let wPos = f.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            let crownNode = instantiate(this.crownNode)
            this.crownNode.parent.addChild(crownNode);
            crownNode.active = true;
            let isKing = f.fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing;
            if (isKing) {
                crownNode.setScale(v3(1, 1, 1));
            } else {
                crownNode.setScale(v3(0.6, 0.6, 0.6));
            }

            let pos = crownNode.parent.getComponent(UITransform).convertToNodeSpaceAR(wPos);
            crownNode.setPosition(v3(pos.x, pos.y));
            let targetPos = targetNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            targetPos = crownNode.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos);

            let halo = crownNode.getChildByName('halo').getComponent(sp.Skeleton);
            halo.setAnimation(0, 'animation', false);
            let crown = crownNode.getChildByName('crown').getComponent(sp.Skeleton);
            crown.setAnimation(0, 'animation', false);

            let skAnim = crown.findAnimation('animation');
            let t = skAnim.duration;
            let delayT = 0.5;
            let moveT = t - delayT;
            return new Promise((resolve) => {
                tween(crownNode)
                    .delay(delayT)
                    .parallel(
                        tween(crownNode).to(moveT - 1, { position: v3(targetPos.x, targetPos.y - 20) }, { easing: easing.expoIn }),
                        tween(crownNode).to(moveT - 1, { scale: v3(0.4, 0.4, 0.4) }, { easing: easing.expoIn }),
                        tween(crownNode).delay(moveT - 0.4)
                            .call(() => {
                                crownNode.destroy();
                                resolve(null);
                            })
                    )
                    .call(() => {
                    })
                    .start();
            });
        }
    }

    sprAct(node: Node) {
        tween(node)
            .to(0.5, { scale: v3(0.6, 0.6, 0.6) }, { easing: easing.fade })
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.fade })
            .to(0.5, { scale: v3(0.6, 0.6, 0.6) }, { easing: easing.fade })
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.fade })
            .delay(3)
            .call(() => {
                let uif = this.rightStoreNode.getComponent(UIOpacity);
                tween(uif)
                    .to(0.5, { opacity: 0 })
                    .start();
                // this.rightStoreNode.active = false;
            })
            .start();
    }
}

