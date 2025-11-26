import { _decorator, Component, PageView, log, Node, Sprite, instantiate } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { oops } from '../../../../core/Oops';
import { UIID } from '../../../common/config/GameUIConfig'
import TableBornAddrs from '../../../common/table/TableBornAddrs';
import { CardCfg } from '../../../common/table/TableCards';
import TableJobs from '../../../common/table/TableJobs';
import { CardUtils } from '../../../common/utils/CardUtils';
import { PlayerManger } from '../../../data/playerManager';
import { ResManger } from '../../../data/resManger';
import { ICSCardPopCfg } from '../../utils/enum';
import { CSDispostionCom } from '../dispostion/CSDispostionCom';
import { CSCardAttrItem } from './CSCardAttrItem';
import { CSNameLevelItem } from './CSNameLevelItem';

const { ccclass, property } = _decorator;

@ccclass('CSCardAttrBanner')
export class CSCardAttrBanner extends Component {
    @property(CSNameLevelItem)
    private nameLevelItem: CSNameLevelItem = null
    @property(PageView)
    private mainPageView: PageView = null
    @property(Node)
    private dotControll: Node = null
    // page 1
    @property(Node)
    private attrLayout: Node = null
    // page 2
    @property(Node)
    private disposLayout: Node = null
    // page 3
    @property(LanguageLabel)
    private desLb: LanguageLabel = null;
    @property(Node)
    private page3Btms: Node = null
    @property(Node)
    private bornNode: Node = null
    @property(Node)
    private jobNode: Node = null
    @property(LanguageLabel)
    private bornDesc: LanguageLabel = null;
    @property(LanguageLabel)
    private skillDesc: LanguageLabel = null;
    @property(Sprite)
    private jobIcon: Sprite = null

    private get playerCardManager() {
        return PlayerManger.getInstance().cardManager.playCard
    }

    private attrItem: Node
    private config: ICSCardPopCfg

    init(p: ICSCardPopCfg) {
        this.config = p
        if (!this.attrItem) this.attrItem = instantiate(this.attrLayout.children[0])
        if (this.nameLevelItem) this.nameLevelItem.init(p)
        this.setAttrPage()
        this.setCardDesPage()
    }

    private setAttrPage() {
        const p = this.config
        if (this.attrLayout && p) {
            this.attrLayout.destroyAllChildren()
            const attrCfgs = CardUtils.getCardAttrItems({ netId: p?.netId, cfgId: p?.lId })
            if (attrCfgs.length != 0) {
                for (const attr of attrCfgs) {
                    if (attr.num1 == '0') continue
                    const copyAttrNode = instantiate(this.attrItem)
                    this.attrLayout.addChild(copyAttrNode)
                    copyAttrNode.active = true
                    copyAttrNode.getComponent(CSCardAttrItem)?.init(attr)
                }
            }
        }

        if (this.disposLayout && p?.netId) {
            this.disposLayout.active = true
            if (this.dotControll) this.dotControll.children[2].active = true
            this.disposLayout.getComponent(CSDispostionCom).init(p.netId)
        } else {
            if (this.disposLayout) this.disposLayout.active = false
            if (this.dotControll) this.dotControll.children[2].active = false

        }
    }


    private async setCardDesPage() {
        const params = this.config
        const netId = params?.netId
        const cfgId = params?.lId
        let cardCfg: CardCfg
        let cardData: core.ICard
        this.bornNode.active = false
        this.jobNode.active = false
        if (netId) {
            cardCfg = this.playerCardManager.getTableCfgByNetId(netId)
            cardData = this.playerCardManager.getNetCardById(netId)
            this.page3Btms.active = true
        } else if (cfgId) {
            cardCfg = this.playerCardManager.getTableCfgByLIdMaxLevel(cfgId)
            this.page3Btms.active = false
        }
        if (this.desLb) this.desLb.dataID = cardCfg?.desc || ''
        if (cardData) {
            this.bornNode.active = cardData?.bornAddrId > 0;
            this.jobNode.active = cardData?.jobId > 0;
            if (cardData?.bornAddrId) this.bornDesc.dataID = TableBornAddrs.getInfoById(cardData.bornAddrId)?.display_name
            if (cardData.jobId) {
                this.skillDesc.dataID = TableJobs.getInfoById(cardData.jobId)?.display_name
                this.jobIcon.spriteFrame = await ResManger.getInstance().getCardJobSpriteFrame(cardData.jobId);
            }
        }
    }

    private closeFun: Function
    addListener(func: Function) {
        this.closeFun = func
    }

    onClosePop() {
        if (this.closeFun) {
            this.closeFun()
        } else {
            oops.gui.remove(UIID.CardSystemInfoPop, true)
        }
    }

    private prevInd = 0
    changePageListener() {
        const _pageIndex = this.mainPageView?.getCurrentPageIndex()
        if (this.dotControll) {
            if (this.prevInd != -1) this.setDot(this.prevInd, false)
            this.setDot(_pageIndex, true)
            this.prevInd = _pageIndex
        }
    }

    private setDot(num: number, active: boolean) {
        const sps = this.dotControll.children[num].getComponentsInChildren(Sprite)
        if (sps.length < 2) return
        sps[0].node.active = !active
        sps[1].node.active = active
    }

    get canUpgrade() {
        return this.nameLevelItem.curCardPrefab?.cardInfoCom?.canUpgrade ?? false
    }

    get canAddPower() {
        return this.nameLevelItem.curCardPrefab?.cardInfoCom?.canAddPower ?? false
    }

    get nftId() {
        return this.nameLevelItem.curCardPrefab?.cardInfoCom?.getCardData()?.nftId ?? ''
    }
}

