import { _decorator, Component, ScrollView, } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { oops } from '../../../core/Oops';
import { CardInfoPrefab, CardInfoPrefabBtnColor, CardInfoPrefabParam } from '../../common/common/CardInfoPrefab';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { CSCardGroupBanner } from '../com/CSCardGroupBanner';
import { CSPopBtmNode } from '../com/CSPopBtmNode';
import { ECardSystemPop } from '../utils/enum';
import { ICardSysInfoPopConfig } from './CSCardInfoPop';

const { ccclass, property } = _decorator;
@ccclass('CardSystemPop')
export class CardSystemPop extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(CSCardGroupBanner)
    private banners: CSCardGroupBanner = null
    @property(CSPopBtmNode)
    private btmCard: CSPopBtmNode = null

    private get playerManager() {
        return PlayerManger.getInstance()
    }

    private cardPop: CardInfoPrefab
    private config: ICardSystemPopConfig

    onAdded(params: ICardSystemPopConfig) {
        if (!params.cardTypeId) throw new Error(`params id null ${params?.cardTypeId}`);
        this.config = params
        this.node.active = true
        this.initViews()
    }

    private async initViews() {
        if (!this.cardPop) {
            this.cardPop = await ResManger.getInstance().getCardInfoPopPrefab()
            if (this.cardPop) this.node.addChild(this.cardPop.node)
        }
        this.banners.init({
            listener: {
                itemClick: (cardNode: CardPrefab) =>
                    this.changePopState(ECardSystemPop.POLL_CARD_INNFO, cardNode)
            }
        })
        this.banners.updateItems()

        this.btmCard.init({
            cardTypeId: this.config.cardTypeId,
            itemCb: (n1, n2) => this.changePopState(n1, n2)
        })
    }

    private changePopState(type: ECardSystemPop, card: CardPrefab) {
        if (card) {
            if (type == ECardSystemPop.POLL_CARD_INNFO) {
                this.d1.id = card.param.id
                this.cardPop?.show(this.d1, card.node, this.mainScrollView);
            } else if (type == ECardSystemPop.KNAPSACK_CARD_INFO) {
                this.d2.id = card.param.id
                this.d2.cardPrefabType = card.param.cardPrefabType
                this.d2.userOtherGroup = card.param?.userOtherGroup ?? false
                this.cardPop?.show(this.d2, card.node, this.mainScrollView);
            }
        } else {
            this.cardPop?.hide()
        }
    }

    private onClosePop() {
        oops.gui.removeByNode(this.node, true)
    }

    private onCloseCardPop() {
        this.cardPop?.hide()
    }

    private d1: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
        cardPrefabType: CardPrefabType.NumInfoNoPower,
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "cspop_banner_btn_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: CardInfoPrefabBtnColor.Red,
                cbFlag: "cspop_banner_btn_remove"
            },
        ]
    }

    private d2: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "cspop_btn_info"
            },
            {
                i18nKey: "pop_btn_6",
                btnColor: CardInfoPrefabBtnColor.Yellow,
                cbFlag: "cspop_btn_use"
            }
        ]
    }
    private cb(event, cbFlag: string) {
        if (cbFlag == "cspop_banner_btn_info") {
            this.openCardInfo()
        } else if (cbFlag == "cspop_banner_btn_remove") {
            this.upCardGroup(false)
        } else if (cbFlag == "cspop_btn_info") {
            this.openCardInfo(false)
        } else if (cbFlag == "cspop_btn_use") {
            this.upCardGroup(true)
        }
        // this.cardPop?.hide()
    }

    private openCardInfo(isGroup = true) {
        const id = this.cardPop.param?.id
        const cfg: ICardSysInfoPopConfig = { netCardId: id, isGroup: isGroup, useCb: () => this.upCardGroup(true) }
        if (id) oops.gui.open(UIID.CardSystemInfoPop, cfg)
    }

    private async upCardGroup(isAdd: boolean) {
        const netCardId = this.cardPop?.param?.id
        if (netCardId) this.playerManager.cardManager.playCardGroup.upCardGroup(netCardId, isAdd)
        this.cardPop?.hide()
    }
    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.HomeTurnPages, this.onClosePop, this);
        Message.on(GameEvent.CardDataRefresh, this.onCloseCardPop, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.HomeTurnPages, this.onClosePop, this);
        Message.off(GameEvent.CardDataRefresh, this.onCloseCardPop, this);
    }
}

export interface ICardSystemPopConfig {
    cardTypeId: number
}

