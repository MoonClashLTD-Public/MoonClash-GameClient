import { _decorator, Component, Node, Enum, Button, Layout, Event, Label } from 'cc';
import { EDITOR } from 'cc/env';
import { Message } from '../../../core/common/event/MessageManager';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import { GameEvent } from '../config/GameEvent';
import { EquipInfo } from './equipInfo/EquipInfo';
import { EquipInfoNew } from './equipInfo/EquipInfoNew';
import { EquipInfoNone } from './equipInfo/EquipInfoNone';
import { EquipInfoTop } from './equipInfo/EquipInfoTop';
const { ccclass, property, executeInEditMode } = _decorator;

export enum EquipPrefabType {
      
    None,
      
    Info,
      
    NumInfoHasPower,
      
    NumInfoNoPower,
      
    NumInfoHasPowerAndBg,
      
    NumInfoNoPowerAndBg,
      
    NewInfoBannerHasDelete,
    NewInfoBanner,
    NewInfoPower,
    NewPveInfoBannerHasDelete,
    NewPveInfoBanner,
    NewPveInfoPower,
    NewInfoNoPower,
}
  
export const showEquipInfoBgKv: { [num: number]: EquipPrefabType } = {
    [EquipPrefabType.NumInfoNoPowerAndBg]: EquipPrefabType.NumInfoNoPowerAndBg,
    [EquipPrefabType.NumInfoHasPowerAndBg]: EquipPrefabType.NumInfoHasPowerAndBg,
    [EquipPrefabType.NewInfoBannerHasDelete]: EquipPrefabType.NewInfoBannerHasDelete,
    [EquipPrefabType.NewInfoBanner]: EquipPrefabType.NewInfoBanner,
    [EquipPrefabType.NewPveInfoBannerHasDelete]: EquipPrefabType.NewPveInfoBannerHasDelete,
    [EquipPrefabType.NewPveInfoBanner]: EquipPrefabType.NewPveInfoBanner,
}
  
export const showNewEquipInfoKv: { [num: number]: EquipPrefabType } = {
    [EquipPrefabType.NewInfoBanner]: EquipPrefabType.NewInfoBanner,
    [EquipPrefabType.NewInfoBannerHasDelete]: EquipPrefabType.NewInfoBannerHasDelete,
    [EquipPrefabType.NewInfoPower]: EquipPrefabType.NewInfoPower,
    [EquipPrefabType.NewPveInfoBannerHasDelete]: EquipPrefabType.NewPveInfoBannerHasDelete,
    [EquipPrefabType.NewPveInfoBanner]: EquipPrefabType.NewPveInfoBanner,
    [EquipPrefabType.NewPveInfoPower]: EquipPrefabType.NewPveInfoPower,
    [EquipPrefabType.NewInfoNoPower]: EquipPrefabType.NewInfoNoPower,
}
  

export const showPowerKv: { [num: number]: EquipPrefabType } = {
    [EquipPrefabType.NumInfoHasPower]: EquipPrefabType.NumInfoHasPower,
    [EquipPrefabType.NumInfoHasPowerAndBg]: EquipPrefabType.NumInfoHasPowerAndBg,
    [EquipPrefabType.NewInfoBanner]: EquipPrefabType.NewInfoBanner,
    [EquipPrefabType.NewInfoBannerHasDelete]: EquipPrefabType.NewInfoBannerHasDelete,
    [EquipPrefabType.NewInfoPower]: EquipPrefabType.NewInfoPower,
    [EquipPrefabType.NewPveInfoBannerHasDelete]: EquipPrefabType.NewPveInfoBannerHasDelete,
    [EquipPrefabType.NewPveInfoBanner]: EquipPrefabType.NewPveInfoBanner,
    [EquipPrefabType.NewPveInfoPower]: EquipPrefabType.NewPveInfoPower,
}

  
export const isPvePowerKv: { [num: number]: EquipPrefabType } = {
    [EquipPrefabType.NewPveInfoBannerHasDelete]: EquipPrefabType.NewPveInfoBannerHasDelete,
    [EquipPrefabType.NewPveInfoBanner]: EquipPrefabType.NewPveInfoBanner,
    [EquipPrefabType.NewPveInfoPower]: EquipPrefabType.NewPveInfoPower,
}

Enum(EquipPrefabType)
@ccclass('EquipmentPrefab')
@executeInEditMode(true)
export class EquipmentPrefab extends Component {
    @property({ type: EquipPrefabType, serializable: true, visible: false })
    private _cardPrefabType: EquipPrefabType = EquipPrefabType.None;
    @property({ type: EquipPrefabType })
    set cardPrefabType(val: EquipPrefabType) {
        this._cardPrefabType = val;
        this.updInfo();
    }
    get cardPrefabType() {
        return this._cardPrefabType;
    }

    @property(Button)
    private cardBtn: Button = null;

    @property(EquipInfo)
    private equipInfo: EquipInfo = null;
    @property(EquipInfoNone)
    private equipInfoNone: EquipInfoNone = null;
    @property(EquipInfoTop)
    private equipInfoTop: EquipInfoTop = null

    @property(EquipInfoNew)
    private equipInfoNew: EquipInfoNew = null;

    @property(Label)
    private power: Label = null;

    param: EquipPrefabParam;

    onLoad() {
        this.addEvent()
        if (!this.node.getComponent(ListItemOptimize))
            this.node.addComponent(ListItemOptimize);
    }

    start() {
        if (EDITOR) this.updInfo()
    }

    init(param: EquipPrefabParam) {
        this.param = param;
        this.cardPrefabType = param.equipPrefabType;

        if (this.cardBtn) this.cardBtn.interactable = !!this.param.cb;
    }

    private updInfo() {
        this.equipInfo.node.active = this.cardPrefabType != EquipPrefabType.None;
        this.equipInfoNone.node.active = this.cardPrefabType == EquipPrefabType.None;
        this.power.node.active = !!showPowerKv[this.cardPrefabType]
        this.equipInfoNew.node.active = !!showNewEquipInfoKv[this.cardPrefabType]
        this.updCardSize();

        this.equipInfoNone.node.active && this.equipInfoNone.init();
        this.equipInfo.node.active && this.equipInfo.init();
        this.equipInfoNew.node.active && this.equipInfoNew.init();
        this.equipInfoTop?.init()

        if (this.power.node.active && this.equipInfo.node.active) {
            this.power.string = this.equipInfo.powerStr
        }
        this.setOtherGroup(this.param?.userOtherGroup)
    }

    private updCardSize() {
        this.node.getComponent(Layout).updateLayout();
    }

    btnClick(event: Event, customEventData: string) {
        this.param?.cb && this.param.cb(event, this.param.flagCB);
    }

    btnDeleteClick(event: Event, customEventData: string) {
        this.param?.remove && this.param.remove(event, this.param.flagCB);
    }

      
    setGray(bf: boolean = true) {
        // this.cardInfo?.setGray(bf)
    }

      
    setSelect(bf: boolean = false) {
        this.equipInfoTop?.openMask(bf)
        this.equipInfo.isOpenGlow(bf)
    }

      
    setCheck(bf: boolean = true) {

    }

    openHot(b) {
        this.equipInfoTop?.openHot(b)
    }

    setOtherGroup(b) {
        this.equipInfo?.setOtherGroup(b ?? false)
    }

    get equipInfoCom() {
        if (!this.equipInfo.node.active) return
        return this.equipInfo
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.EquipSingleRefresh, this.singleRefresh, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipSingleRefresh, this.singleRefresh, this);
    }

    private singleRefresh(event, card: core.IEquipment) {
        if (this.param?.id == card?.id) {
            this.updInfo()
        }
    }
}

type CbFunc = (event: Event, cbFlag: string) => void;

  
export interface EquipPrefabParam {
      
    id?: number
    equip?: core.IEquipment
    equipPrefabType: EquipPrefabType;
    cb?: CbFunc

    remove?: CbFunc
    flagCB?: string
      
    userOtherGroup?: boolean
}
