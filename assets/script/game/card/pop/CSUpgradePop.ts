import { _decorator, Component, Node, Sprite, find, instantiate, Label, Button, log } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../common/pop/CommonAlert';
import { CardCfg } from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { AudioSoundRes, ResManger } from '../../data/resManger';
import { ETUseTipPopConfig } from '../../equipmentUI/pop/ETConsumeTip';
import { CSCardAttrBanner } from '../com/attrBanner/CSCardAttrBanner';
import { CardSystemUtils } from '../utils/cardSystemUtils';
import { ICSCardPopCfg, ICSCardPopNetCfg } from '../utils/enum';
const { ccclass, property } = _decorator;

@ccclass('CSUpgradePop')
export class CSUpgradePop extends Component {
    @property(CSCardAttrBanner)
    private attrBanner: CSCardAttrBanner = null;
    @property(Node)
    private cardLayout: Node = null
    @property(Label)
    private needCardNumLb: Label = null
    @property(Label)
    private needDnaNumLb: Label = null
    @property(Label)
    private needDggNumLb: Label = null
    @property(Label)
    private needJxsNumLb: Label = null
    @property(Button)
    private confimBtm: Button = null
    @property(Node)
    private upgradeCd: Node = null
    @property(Label)
    private countDownLb: Label = null
    private _cardKV: { [key: number]: CardPrefab } = [];
    private get playCard() {
        return PlayerManger.getInstance().cardManager.playCard
    }
    private get cardPrefab() {
        return ResManger.getInstance().getCardPrefab()
    }
    private cardCfg: CardCfg
    private params: ICSCardPopNetCfg
    private hasCd = false
    onAdded(params: ICSCardPopNetCfg) {
        Message.dispatchEvent(GameEvent.HomePagesShowOrHide, { isShow: false });

        if (!params?.cardId) throw new Error(`card id null -- ${params?.cardId}`)
        this.params = params
        this.upViews()
        this.attrBanner?.addListener(this.onCancel)
        const countDown = this.playCard.getUpgradeCd(params.cardId)
        this.hasCd = countDown > 0
        this.upgradeCd.active = this.hasCd
        this.confimBtm.node.active = !this.hasCd
        if (this.hasCd) this.schedule(this.upBtnStatus.bind(this), 1)
    }

    onRemoved() {
        Message.dispatchEvent(GameEvent.HomePagesShowOrHide, { isShow: true });
    }
    flag = 0;
    private async upViews() {
        let flag = ++this.flag;
        const cardId = this.params.cardId
        const _cardCfg = this.playCard.getTableCfgByNetId(cardId)
        if (!_cardCfg) return
        this.cardCfg = _cardCfg
        this.updInfo();
        const args: ICSCardPopCfg = { netId: cardId }
        this.attrBanner?.init(args)
        const cardCom = await this.cardPrefab
        let _cards = this.playCard.getUpgradeCards(cardId);
        let len = 0
        this._cardKV = []
        this.cardLayout.active = true
        this.cardLayout.destroyAllChildren()
        for (const key in _cards) {
            const card = _cards[key]
            // if (CardSystemUtils.isHiddenUpGradeByCard(cardId, card)) continue
            const _id = card.id

              
            if (PlayerManger.getInstance().cardManager.playCardGroup.hasCardGroup(_id))
                continue;
              
            if (card.localBound)
                continue;

            const copyNode = instantiate(cardCom)
            const cardPrefab = copyNode.getComponent(CardPrefab)
            this.cardLayout.addChild(copyNode)
            cardPrefab.init({
                id: _id,
                cardPrefabType: CardPrefabType.NewInfoPower,
                cb: () => this.itemClick(_id)
            })
            cardPrefab.setSelect(false)
            this._cardKV[_id] = cardPrefab
            len++
            await CommonUtil.waitCmpt(this, 0);
            if (flag != this.flag) return;
        }
        if (len == 0) this.cardLayout.active = false
    }

    updInfo() {
        const updateCost = this.cardCfg?.upgrade_cost
        let jxsNum = PlayerManger.getInstance().playerSelfInfo.getMaterialCount(core.NftMaterialType.MaterialAwakeningStone);
        if (this.needCardNumLb) this.needCardNumLb.string = `${this.selectIds.length} /${updateCost?.cards || 0}`
        if (this.needDnaNumLb) this.needDnaNumLb.string = `${this.gweiToNum(updateCost?.dna_gwei || 0)}`
        if (this.needDggNumLb) this.needDggNumLb.string = `${this.gweiToNum(updateCost?.dgg_gwei || 0)}`
        if (this.needJxsNumLb) this.needJxsNumLb.string = `${jxsNum} /${updateCost?.jxs || 0}`
        this.setNodeActive(this.needCardNumLb.node.parent, updateCost?.cards ?? 0);
        this.setNodeActive(this.needDnaNumLb.node.parent, updateCost?.dna_gwei ?? 0);
        this.setNodeActive(this.needDggNumLb.node.parent, updateCost?.dgg_gwei ?? 0);
        this.setNodeActive(this.needJxsNumLb.node.parent, updateCost?.jxs ?? 0);

        this.upBtnStatus()
    }

    setNodeActive(node: Node, num: number) {
        node.active = new BigNumber(num).gt(0);
    }

    private gweiToNum(gwei) {
        const bb = CommonUtil.gweiToNum(gwei)
        return Number(bb)
    }

    private selectIds: number[] = []
    private itemClick(ind: number) {
        const maxLen = this.cardCfg?.upgrade_cost?.cards || 0
        const hasInd = this.selectIds.indexOf(ind)
        if (hasInd != -1) {
            this.selectIds.splice(hasInd, 1)
            this._cardKV[ind]?.setSelect(false)
        } else {
            if (maxLen <= this.selectIds.length) return
            this.selectIds.push(ind)
        }
        this._cardKV[ind]?.setSelect(hasInd == -1)
        if (this.needCardNumLb) this.needCardNumLb.string = `${this.selectIds.length}/${maxLen}`
        this.upBtnStatus()
    }

    private upBtnStatus() {
        if (this.hasCd) {
            const countDown = this.playCard.getUpgradeCd(this.params.cardId)
            if (countDown > 0) {
                let d = CommonUtil.countDownDays(this.playCard.getUpgradeCd(this.params.cardId));
                let str = "";
                if (d.d > 0) str += `${d.d} `
                str += `${d.h}:${d.m}:${d.s}`;
                this.countDownLb.string = str
            } else {
                this.unschedule(this.upBtnStatus.bind(this))
                this.hasCd = false
                this.upBtnStatus()
                this.upgradeCd.active = false
                this.confimBtm.node.active = true
            }
        } else {
            let jxsNum = PlayerManger.getInstance().playerSelfInfo.getMaterialCount(core.NftMaterialType.MaterialAwakeningStone);
            const jxs = this.cardCfg?.upgrade_cost?.jxs || 0
            const enoughJxs = jxsNum >= jxs;
            const maxLen = this.cardCfg?.upgrade_cost?.cards || 0
            const selectLen = this.selectIds.length
            const canNext = selectLen != 0 && selectLen == maxLen && enoughJxs
            if (this.confimBtm) {
                this.confimBtm.interactable = canNext
                this.confimBtm.getComponent(Sprite).grayscale = !canNext
            }
        }
    }


    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }

    private get cardName() {
        return LanguageData.getLangByIDAndParams(this.cardCfg.name, [])
    }

    private async confirm() {
        const maxLen = this.cardCfg?.upgrade_cost?.cards || 0
        const dgg = this.cardCfg?.upgrade_cost?.dgg_gwei || 0
        const dna = this.cardCfg?.upgrade_cost?.dna_gwei || 0
        const jxs = this.cardCfg?.upgrade_cost?.jxs || 0
        const selectLen = this.selectIds.length
        if (!this.cardCfg || !this.params || maxLen != selectLen) return
        const args: ETUseTipPopConfig = { okFunc: () => this._onUpgrade() }
        if (dgg != 0) args.dggNum = this.gweiToNum(dgg)
        if (dna != 0) args.dnaNum = this.gweiToNum(dna)
        if (jxs != 0) args.stoneNum = jxs
        if (maxLen != 0) args.cardNum = maxLen
        const argReqs = pkgcs.CsCardUpgradeReq.create()
        argReqs.costCards = this.selectIds
        argReqs.mainCardId = this.params.cardId
        argReqs['jxs'] = jxs
        const ret = await HttpHome.queryGas1(EGasType.CARD_UPGRADE, argReqs)
        if (!ret) return
        args.gas = ret.gas
        oops.gui.open(UIID.ETConsumeTip, args)
    }

    private async _onUpgrade() {
        const args = pkgcs.CsCardUpgradeReq.create()
        args.costCards = this.selectIds
        args.mainCardId = this.params.cardId
        args.nextLevel = this.cardCfg.level + 1
        // const oldCardData =  
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardUpgradeReq, opcode.OpCode.ScCardUpgradeResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScCardUpgradePush>({
                closeEventName: `${opcode.OpCode.ScCardUpgradePush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                this.onCancel()
                oops.audio.playEffect(AudioSoundRes.cardLevelUp);
                oops.gui.open(UIID.CardSysUpGradeOkPop, { card: _d.card })
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'tip_card_upgrade_fail_title',
            content: 'tip_card_upgrade_fail_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'key',
                    value: `${this.cardName}`
                },
            ],
        })
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
        this.unschedule(this.upBtnStatus.bind(this))
    }

      
    private addEvent() {
        Message.on(GameEvent.CardDataRefresh, this.upViews, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.CardDataRefresh, this.upViews, this);
    }
}
