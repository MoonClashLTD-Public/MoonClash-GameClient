import { _decorator, Component, Node, UITransform, Size, Enum, Button, Sprite, Layout, Event, Input, EventTouch, Tween, tween } from 'cc';
import { EDITOR } from 'cc/env';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../config/GameEvent';
import { CardInfo } from './cardInfo/CardInfo';
import { CardInfoClassify } from './cardInfo/CardInfoClassify';
import { CardInfoMarket } from './cardInfo/CardInfoMarket';
import { CardInfoNew } from './cardInfo/CardInfoNew';
import { CardInfoNone } from './cardInfo/CardInfoNone';
import { CardInfoNum } from './cardInfo/CardInfoNum';
import { CardInfoTop } from './cardInfo/CardInfoTop';
const { ccclass, property, executeInEditMode } = _decorator;

export enum CardPrefabType {
      
    None = 1,
      
    NoneAdd,
      
    CardInfo,
      
    MarketInfo,
      
    NoneMarketInfo,
      
    classifyInfo,
    PVPclassifyInfo,
    PVEclassifyInfo,
      
    NumInfoHasPower,
      
    NumInfoNoPower,
      
    NumInfoHasPowerAndBg,
      
    NumInfoNoPowerAndBg,
      
      
    NewInfoBannerHasDelete,
      
    NewInfoBanner,
      
    NewInfoPower,

    NewPVEInfoBannerHasDelete,
      
    NewPVEInfoBanner,
      
    NewPVEInfoPower,
      
    NewInfoNoPower,
}

export const showNumInfoKV: { [num: number]: CardPrefabType } = {
    [CardPrefabType.NumInfoHasPower]: CardPrefabType.NumInfoHasPower,
    [CardPrefabType.NumInfoNoPower]: CardPrefabType.NumInfoNoPower,
    [CardPrefabType.NumInfoHasPowerAndBg]: CardPrefabType.NumInfoHasPowerAndBg,
    [CardPrefabType.NumInfoNoPowerAndBg]: CardPrefabType.NumInfoNoPowerAndBg,
    [CardPrefabType.MarketInfo]: CardPrefabType.MarketInfo,
}
export const showclassifyInfoKv: { [num: number]: CardPrefabType } = {
    [CardPrefabType.classifyInfo]: CardPrefabType.classifyInfo,
    [CardPrefabType.PVPclassifyInfo]: CardPrefabType.PVPclassifyInfo,
    [CardPrefabType.PVEclassifyInfo]: CardPrefabType.PVEclassifyInfo,
}

export const showNewInfoKv: { [num: number]: CardPrefabType } = {
    [CardPrefabType.NewInfoBanner]: CardPrefabType.NewInfoBanner,
    [CardPrefabType.NewInfoBannerHasDelete]: CardPrefabType.NewInfoBannerHasDelete,
    [CardPrefabType.NewInfoPower]: CardPrefabType.NewInfoPower,
    [CardPrefabType.NewPVEInfoBanner]: CardPrefabType.NewPVEInfoBanner,
    [CardPrefabType.NewPVEInfoBannerHasDelete]: CardPrefabType.NewPVEInfoBannerHasDelete,
    [CardPrefabType.NewPVEInfoPower]: CardPrefabType.NewPVEInfoPower,
    [CardPrefabType.NewInfoNoPower]: CardPrefabType.NewInfoNoPower,
}
export const showNewInfoPowerKv: { [num: number]: CardPrefabType } = {
    [CardPrefabType.NewInfoBanner]: CardPrefabType.NewInfoBanner,
    [CardPrefabType.NewInfoBannerHasDelete]: CardPrefabType.NewInfoBannerHasDelete,
    [CardPrefabType.NewInfoPower]: CardPrefabType.NewInfoPower,
    [CardPrefabType.NewPVEInfoBanner]: CardPrefabType.NewPVEInfoBanner,
    [CardPrefabType.NewPVEInfoBannerHasDelete]: CardPrefabType.NewPVEInfoBannerHasDelete,
    [CardPrefabType.NewPVEInfoPower]: CardPrefabType.NewPVEInfoPower,
}
export const isPveKv: { [num: number]: CardPrefabType } = {
    [CardPrefabType.NewPVEInfoBanner]: CardPrefabType.NewPVEInfoBanner,
    [CardPrefabType.NewPVEInfoBannerHasDelete]: CardPrefabType.NewPVEInfoBannerHasDelete,
    [CardPrefabType.NewPVEInfoPower]: CardPrefabType.NewPVEInfoPower,
}
export const showNoKv: { [num: number]: CardPrefabType } = {
    [CardPrefabType.None]: CardPrefabType.None,
    [CardPrefabType.NoneAdd]: CardPrefabType.NoneAdd,
    [CardPrefabType.NoneMarketInfo]: CardPrefabType.NoneMarketInfo,
}
Enum(CardPrefabType)
@ccclass('CardPrefab')
@executeInEditMode(true)
export class CardPrefab extends Component {
    @property({ type: CardPrefabType, serializable: true, visible: false })
    private _cardPrefabType: CardPrefabType = CardPrefabType.None;
    @property({ type: CardPrefabType })
    set cardPrefabType(val: CardPrefabType) {
        this._cardPrefabType = val;
        this.updInfo();
    }
    get cardPrefabType() {
        return this._cardPrefabType;
    }

    @property(CardInfo)
    private cardInfo: CardInfo = null;
    @property(CardInfoTop)
    private cardInfoTop: CardInfoTop = null;  
    @property(CardInfoNone)
    private noneInfo: CardInfoNone = null;   
    @property(Node)
    private noneAddInfo: Node = null;   
    @property(CardInfoMarket)
    private marketInfo: CardInfoMarket = null;   
    @property(Node)
    private marketNoneInfo: Node = null;   
    @property(CardInfoNum)
    private numInfo: CardInfoNum = null;   
    @property(CardInfoClassify)
    private classifyInfo: CardInfoClassify = null;   
    @property(CardInfoNew)
    private cardInfoNew: CardInfoNew = null;

    @property(Button)
    private cardBtn: Button = null;
    @property(Node)
    private bgNode: Node = null;

      
    @property(Sprite)
    private glowSprite: Sprite = null;  

    param: CardPrefabParam;

    onLoad() {
        this.addEvent()
    }

    start() {
        if (EDITOR) this.updInfo()
    }

    init(param: CardPrefabParam) {
        this.param = param;
        this.cardPrefabType = param.cardPrefabType;

        if (this.cardBtn) this.cardBtn.enabled = !!this.param.cb;
    }

    private updInfo() {
        const unNone = !!!showNoKv[this._cardPrefabType];
        this.noneInfo.node.active = this._cardPrefabType == CardPrefabType.None;
        this.noneAddInfo.active = this._cardPrefabType == CardPrefabType.NoneAdd;
        this.marketInfo.node.active = this._cardPrefabType == CardPrefabType.MarketInfo;
        this.marketNoneInfo.active = this.cardPrefabType == CardPrefabType.NoneMarketInfo
        this.cardInfoNew.node.active = !!showNewInfoKv[this._cardPrefabType]
        this.numInfo.node.active = !!showNumInfoKV[this._cardPrefabType]
        this.classifyInfo.node.active = !!showclassifyInfoKv[this._cardPrefabType];
        this.cardInfo.node.active = unNone;
        this.cardInfoTop.node.active = unNone;
        this.bgNode.active = false;// this.cardPrefabType == CardPrefabType.NoneMarketInfo ||
        this.cardPrefabType == CardPrefabType.MarketInfo;
        this.updCardSize();

        this.noneInfo.node.active && this.noneInfo.init();
        this.cardInfo.node.active && this.cardInfo.init();
        this.marketInfo.node.active && this.marketInfo.init();
        this.numInfo.node.active && this.numInfo.init();
        this.classifyInfo.node.active && this.classifyInfo.init();
        this.cardInfoNew.node.active && this.cardInfoNew.init();
        this.cardInfoTop.node.active && this.cardInfoTop.init();

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
        this.cardInfo?.setGray(bf)
    }

      
    setSelect(bf: boolean = false) {
        // this.glowSprite.node.active = bf;
        if (this.numInfo.node.active) {
            this.numInfo.setSelect(bf)
        }
        if (this.cardInfoNew.node.active) {
            this.cardInfoNew.setSelect(bf)
        }
    }

      
    setCheck(bf: boolean = true) {

    }

    openHot(b) {
        this.cardInfoTop?.openHot(b)
    }

    private setOtherGroup(bool: boolean) {
        this.cardInfo?.setOtherGroup(bool ?? false)
    }

      
    rumAnim() {
        this._runAnim(this.node)
    }

    clearCardSprate() {
        this.cardInfo.cardSprite.spriteFrame = null;
    }

    get cardInfoCom() {
        if (this.cardInfo.node.active)
            return this.cardInfo
    }

    get cardTopCom() {
        if (this.cardInfoTop.node.active)
            return this.cardInfoTop
    }

      
    private _runAnim(animNode: Node) {
        Tween.stopAllByTarget(animNode)
        tween(animNode)
            .to(0.3, { angle: -3 })
            .to(0.3, { angle: 3 })
            .union()
            .repeatForever()
            .start()
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.CardSingleRefresh, this.singleRefresh, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.CardSingleRefresh, this.singleRefresh, this);
    }

    private singleRefresh(event, card: core.ICard) {
        const currId = this.param?.id ?? this.param?.card?.id
        if (currId == card?.id) {
            this.updInfo()
        }
    }
}

type CbFunc = (event: Event, cbFlag: string) => void;

  
export interface CardPrefabParam {
      
    id?: number
      
    cardId?: number
      
    cardProtoId?: number
    cardPrefabType: CardPrefabType;
    cb?: CbFunc
    remove?: CbFunc
    flagCB?: string
      
    userOtherGroup?: boolean
    card?: core.ICard
    friendCard?: wafriend.IFriend
}
