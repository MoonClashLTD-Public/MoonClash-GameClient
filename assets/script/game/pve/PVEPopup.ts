import { _decorator, Component, Node, instantiate, UIOpacity, UITransform, tween, easing, v3, Label } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { storage } from '../../core/common/storage/StorageManager';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { BattleManger } from '../battle/BattleManger';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { IAlertPopConfig } from '../common/pop/CommonAlert';
import TableBattlePowerSettlement from '../common/table/TableBattlePowerSettlement';
import TableMaps from '../common/table/TableMaps';
import TablePve from '../common/table/TablePve';
import TablePvePowerDelta from '../common/table/TablePvePowerDelta';
import { DataEvent } from '../data/dataEvent';
import { PlayerManger } from '../data/playerManager';
import { STORAGE_ENUM } from '../homeUI/HomeEvent';
const { ccclass, property } = _decorator;

@ccclass('PVEPopup')
export class PVEPopup extends Component {
    @property(Node)
    private btMap: Node = null
    @property(LanguageLabel)
    private levelNameLb: LanguageLabel = null
    @property(LanguageLabel)
    private levelDescLb: LanguageLabel = null
    @property(LanguageLabel)
    private mapNameLb: LanguageLabel = null
    @property(LanguageLabel)
    private diffLb: LanguageLabel = null
    @property(LanguageLabel)
    private easyLb: LanguageLabel = null

    @property(LanguageLabel)
    private minFightPowerLb: LanguageLabel = null
    @property(LanguageLabel)
    private minFightPowerLb2: LanguageLabel = null
    /*  
       
       
  
  
  
  
     */
    @property(Label)
    private equipPowerLb: Label = null
    @property(Label)
    private cardPowerLb: Label = null
    @property(Label)
    private rewardDnaLb: Label = null
    @property(DefBottonCom)
    private battleBtn: DefBottonCom = null

    private config: IInitPvePopCfg
    onAdded(parms: IInitPvePopCfg) {
        this.config = parms
        this.initMap()
        PlayerManger.getInstance().pveInfo.refreshCardData()
    }

    private minFightPower = 0
    private async initMap() {
        const pveBattleId = PlayerManger.getInstance().playerSelfInfo.pveBattleId
        if (pveBattleId == 0) {
            this.battleBtn.setEnable(false);
            return
        }
        let max = TablePve.cfg[TablePve.cfg.length - 1].id;
        const pveCfg = TablePve.getInfoById(pveBattleId > max ? max : pveBattleId);
        this.levelNameLb.dataID = pveCfg.name
        this.levelDescLb.dataID = pveCfg?.description ?? ''
        this.minFightPower = pveCfg.min_fight_power || 0
        this.minFightPowerLb.params[0].value = `${CommonUtil.fightPowerToShow(pveCfg.min_fight_power || 0)}`
        this.minFightPowerLb.forceUpdate()
        this.minFightPowerLb2.params[0].value = `${CommonUtil.fightPowerToShow(pveCfg.min_fight_power || 0)}`
        this.minFightPowerLb2.forceUpdate()
        this.rewardDnaLb.string = `+${CommonUtil.gweiToNum(pveCfg.award_dna_gwei.toString())}`
        this.upDiffStr()

        this.battleBtn.setEnable(pveBattleId <= max);

        let mapCfg = TableMaps.getInfoById(pveCfg?.map_id)
        this.mapNameLb.dataID = mapCfg.name
        let prefab = await BattleManger.getInstance().loadMiniatureMap(mapCfg.res_name);
        let map = instantiate(prefab);
        this.btMap.addChild(map);
        // map.setPosition(this.btMap.getComponent(UITransform).width / 2, 100, 0);
        let uio = map.addComponent(UIOpacity);
        uio.opacity = 0;
        tween(uio)
            .to(0.5, { opacity: 255 }, { easing: easing.smooth })
            .start();
    }

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

    private btnAction(event: Event, customEventData: string) {
        switch (Number(customEventData)) {
            case 1:// equipment
                oops.gui.open(UIID.PVEEqipmentPop);
                break;
            case 2:// battle
                if (PlayerManger.getInstance().pveInfo.canBattle) {
                    if (storage.get(STORAGE_ENUM.pveTip, 0) == new Date().getUTCDate()) {
                          
                        this.onClose()
                        this.config.confim && this.config.confim()
                    } else {
                        // oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
                        //     content: LanguageData.getLangByID('pve_battle_tip_1'),
                        //     okWord: LanguageData.getLangByID('pve_battle_btn'),
                        //     needCancel: true,
                        //     okFunc: () => {
                        //         this.onClose()
                        //         this.config.confim && this.config.confim()
                        //     }
                        // })
                        oops.gui.open<AlertParam>(UIID.Alert, {
                            content: LanguageData.getLangByID('pve_battle_tip_1'),
                            toggleInfo: {
                                i18DataID: "tip_not_remind",
                                isChecked: false,
                            },
                            okCB: (isCheck: boolean) => {
                                if (isCheck)
                                    storage.set(STORAGE_ENUM.pveTip, new Date().getUTCDate());
                                this.onClose()
                                this.config.confim && this.config.confim()
                            },
                            cancelCB: () => { },
                        });
                    }
                } else {
                    tips.errorTip("pve_battle_tip", true)
                }
                break;
            case 3:// card
                oops.gui.open(UIID.PVECardClickPop);
                break;

            default:
                break;
        }
    }

      
    private upDiffStr() {
        // return
        // const pveBattleId = PlayerManger.getInstance().playerSelfInfo.pveBattleId
        // const minPower = TableBattlePowerSettlement.getInfoById((pveBattleId + 1))?.battle_power_min
        const minPower = this.minFightPower
        const cardPower = PlayerManger.getInstance().pveInfo.getCardGroupPower()
        const equipPower = PlayerManger.getInstance().pveInfo.getEquipGroupPower()
        const totalPower = cardPower + equipPower
        this.cardPowerLb.string = totalPower.toString()
        // this.equipPowerLb.string = equipPower.toString()
          
        // let currDiff2 = new BigNumber(minPower).minus(CommonUtil.fightPowershowToNumber(totalPower)).toFixed(0)
        // const diff = TablePvePowerDelta.getPerByDiff(Number(currDiff2))
        // const isEasy = diff <= 0
        // this.diffLb.node.active = !isEasy
        // this.easyLb.node.active = isEasy

        // this.minFightPowerLb.node.active = isEasy
        // this.minFightPowerLb2.node.active = !isEasy
        // if (diff > 0) {
        //     this.diffLb.params[0].value = `${diff}%`
        //     this.diffLb.forceUpdate()
        // }


        // this.battleBtn.setEnable(this.minFightPower <= totalPower && totalPower != 0)
        // console.log('currDiff2', currDiff2)
    }

    onLoad() {
        this.addEvent()
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(GameEvent.PVEEquipGroupDataRefresh, this.upDiffStr, this);
        Message.on(GameEvent.PVECardGroupDataRefresh, this.upDiffStr, this);
        Message.on(DataEvent.DATA_PVEBATTLEID_CHANGE, this.initMap, this);
    }

    private removeEvent() {
        Message.off(GameEvent.PVEEquipGroupDataRefresh, this.upDiffStr, this);
        Message.off(GameEvent.PVECardGroupDataRefresh, this.upDiffStr, this);
        Message.off(DataEvent.DATA_PVEBATTLEID_CHANGE, this.initMap, this);
    }
}

export interface IInitPvePopCfg {
    confim: Function
}

