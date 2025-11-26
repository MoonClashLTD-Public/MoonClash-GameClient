import { _decorator, Component, Node, EventTouch, Layout, Label } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { DefBottonCom } from '../../common/com/DefBottonCom';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { PlayerManger } from '../../data/playerManager';
import { HomeTurnPagesParam } from '../../homeUI/HomeBottom';
import { HOMEPAGEENUM } from '../../homeUI/HomeEvent';
import { WalletSellPopUpParam } from '../../walletUI/WalletSellPopUp';
import WalletUtil from '../../walletUI/WalletUtil';
import { CSCardAttrBanner } from '../com/attrBanner/CSCardAttrBanner';
import { CardSystemUtils } from '../utils/cardSystemUtils';
import { ICSCardPopCfg, ICSCardPopNetCfg, ICSResetAttrPopCfg } from '../utils/enum';


const { ccclass, property } = _decorator;
@ccclass('CSCardInfoPop')
export class CSCardInfoPop extends Component {
    @property(Layout)
    private mainLayout: Layout = null
    @property(CSCardAttrBanner)
    private attrBanner: CSCardAttrBanner = null
    @property(Label)
    private cardId: Label = null
    @property([DefBottonCom])
    private btns: DefBottonCom[] = []
    @property(Node)
    private btnNode: Node = null
    @property(DefBottonCom)
    private useBtn: DefBottonCom = null
    @property(DefBottonCom)
    private marketBtn: DefBottonCom = null
    @property(Node)
    private noBtnNode: Node = null
    @property(Node)
    private timerNode: Node = null
    @property(LanguageLabel)
    private timerLb: LanguageLabel = null

    private config: ICardSysInfoPopConfig = {}

    start() {
        this.schedule(this.upTimeLb, 1);
    }

    /**
  
     * {
  
  
     * }
     */
    public onAdded(params: ICardSysInfoPopConfig) {
        this.config = params || {}
        this.node.active = true
        this.initView()
        this.setNameLevelItem()
    }

    private initView() {
        const params = this.config
        const isNetCard = !!(params?.netCardId)
        if (this.btnNode) this.btnNode.active = isNetCard
        if (this.useBtn) this.useBtn.setEnable(!(params?.isGroup))
        const _cardData = PlayerManger.getInstance().cardManager.playCard.getNetCardById(this.config.netCardId)
        if (this.marketBtn) this.marketBtn.setEnable((_cardData?.power ?? 0) > 0)
        if (this.noBtnNode) this.noBtnNode.active = !isNetCard
    }

    private setNameLevelItem() {
        const params = this.config
        const netCardId = params?.netCardId
        const lCardId = params?.lCardId
        const csCardPopCfg: ICSCardPopCfg = {}
        if (netCardId) {
            csCardPopCfg.netId = netCardId
        } else if (lCardId) {
            csCardPopCfg.lId = lCardId
        }
        if (this.attrBanner) {
            this.attrBanner.init(csCardPopCfg)
            if (netCardId) this.cardId.string = `#${this.attrBanner.nftId}`
            if (lCardId) this.cardId.string = ''
        }
        this.upBtnStatus()
    }

    btnClick(event: EventTouch, ind: string) {
        const args: ICSCardPopNetCfg = { cardId: this.config.netCardId }
        const args2: ICSResetAttrPopCfg = { id: this.config.netCardId, funName: "onResetAll" }
        switch (Number(ind)) {
            case 2:  
                args2.funName = "onRefined"
                oops.gui.open(UIID.CardSysResetAttr, args2)
                break;
            case 3:  
                if (this.attrBanner.canAddPower) {
                    oops.gui.open(UIID.CardSysDurablePop, args)
                } else {
                    tips.errorTip('tip_err_full_power', true)
                }
                break;
            case 4:  
                let cardData = PlayerManger.getInstance().cardManager.playCard.getNetCardById(this.config.netCardId)
                if (cardData && cardData.localBound) {
                    tips.errorTip('tip_bound_upgrade', true)
                } else if (this.attrBanner.canUpgrade) {
                    oops.gui.open(UIID.CardSysUpGradePop, args)
                } else {
                    tips.errorTip('tip_err_max_level', true)
                }
                break;
            case 5:  
                this.config.useCb && this.config.useCb()
                this.btnClose()
                // oops.gui.open(UIID.CardSysFightPop)
                break;
            case 6:  
                args2.funName = "onResetSingle"
                oops.gui.open(UIID.CardSysResetAttr, args2)
                break;
            case 7:  
                args2.funName = "onResetAll"
                oops.gui.open(UIID.CardSysResetAttr, args2)
                break;
            case 88:  
                Message.dispatchEvent(GameEvent.HomeTurnPages,
                    <HomeTurnPagesParam>{ page: HOMEPAGEENUM.FIGHTINGPAGE });
                this.btnClose()
                break;
            case 99:  
                let param: WalletSellPopUpParam = {
                    card: PlayerManger.getInstance().cardManager.playCard.getNetCardById(this.config.netCardId)
                }
                WalletUtil.openWalletInfo(param);
                // Message.dispatchEvent(GameEvent.HomeTurnPages,
                //     <HomeTurnPagesParam>{ page: HOMEPAGEENUM.MARKETPAGE });
                this.btnClose()
                break;
            case 100:  
                Message.dispatchEvent(GameEvent.HomeTurnPages,
                    <HomeTurnPagesParam>{ page: HOMEPAGEENUM.MARKETPAGE });
                this.btnClose()
            default:
                break;
        }
    }

    btnClose() {
        oops.gui.removeByNode(this.node)
    }

    private CardSingleRefresh(event, card: core.ICard) {
        if (this.config?.netCardId == card?.id) {
            this.upViews()
        }
    }

    private upViews() {
        if (this.config.netCardId) {
            const csCardPopCfg: ICSCardPopCfg = { netId: this.config.netCardId }
            if (this.attrBanner) this.attrBanner.init(csCardPopCfg)
            this.upBtnStatus()
        }
    }

    private rentTime = 0
    private upBtnStatus() {
        let canClick = false
        let cardData: core.ICard
        if (this.config.netCardId) {
            canClick = CardSystemUtils.canClickBtn({ cardId: this.config.netCardId })
            cardData = PlayerManger.getInstance().cardManager.playCard.getNetCardById(this.config.netCardId)
        }
        this.btns.forEach(btn => {
            btn.setEnable(canClick)
        })
        this.timerNode.active = false
        this.rentTime = 0
        if (cardData) {
            const isRent = CardSystemUtils.isRent(cardData)
            this.rentTime = isRent?.rentState?.rentTime || 0
            if (isRent.ok) this.timerNode.active = true
            this.upTimeLb()
        }
    }

    private upTimeLb() {
        if (!this.timerNode.active) return
        let time = this.rentTime - new Date().getTime() / 1000;
        let d = CommonUtil.countDownDays(time > 0 ? time : 0);
        this.timerLb.params[0].value = `${d.d}`
        this.timerLb.params[1].value = `${d.m}`
        this.timerLb.params[2].value = `${d.s}`
        this.timerLb.forceUpdate()
    }

    onLoad() {
        Message.on(GameEvent.CardSingleRefresh, this.CardSingleRefresh, this);
        Message.on(GameEvent.CardDataRefresh, this.upViews, this);
    }

    onDestroy() {
        this.config = null
        Message.off(GameEvent.CardSingleRefresh, this.CardSingleRefresh, this);
        Message.off(GameEvent.CardDataRefresh, this.upViews, this);
    }
}

export interface ICardSysInfoPopConfig {
      
    netCardId?: number
      
    lCardId?: number
    isGroup?: boolean
    useCb?: Function
}

