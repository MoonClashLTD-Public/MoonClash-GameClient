import { _decorator, Component, Node, Sprite, ParticleSystem2D, Label } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { PropItem } from '../../common/com/PropMask/PropItem';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../common/pop/CommonAlert';
import { AudioSoundRes } from '../../data/resManger';
import { CSNameLevelItem } from '../com/attrBanner/CSNameLevelItem';
import { CSDispostionCom } from '../com/dispostion/CSDispostionCom';
import { ICSResetAttrPopCfg } from '../utils/enum';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import WalletUtil, { CurrType } from '../../walletUI/WalletUtil';

const { ccclass, property } = _decorator;

@ccclass('CSResetAttrPop')
export class CSResetAttrPop extends Component {
    @property(CSNameLevelItem)
    private nameLevelItem: CSNameLevelItem = null
    @property(CSDispostionCom)
    private dispostionCom: CSDispostionCom = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(Label)
    private needDnaNumLb: Label = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null
    private config: ICSResetAttrPopCfg

    private funName: string
    private isChecks = {
        "onResetSingle": true,
        "onResetAll": false,
        "onRefined": true,
    }
    private contents = {
        "onResetSingle": "tip_prop_content2",
        "onResetAll": "tip_prop_content",
        "onRefined": "tip_prop_content3",
    }
    private materials = {
        "onResetSingle": "reset_attr_cost",
        "onResetAll": "reset_all_cost",
        "onRefined": "reset_attr_val_cost",
    }

    onAdded(params: ICSResetAttrPopCfg) {
        if (!params?.id) throw new Error(`equip id is null ${params?.id}`);
        this.config = params
        this.funName = params.funName ?? "onResetSingle"
        this.initViews()
    }

    private initViews() {
        this.nameLevelItem.init({ netId: this.config.id })
        this.dispostionCom.init(this.config.id, this.isChecks[this.funName])
        const cardCfg = this.nameLevelItem.cardCfg
        const material = cardCfg[this.materials[this.funName]].materials[0];
        this.mPropItem.upData(material?.id, material?.cnt || 0)
        this.updInfo();
    }

    updInfo() {
        const updateCost = this.nameLevelItem.cardCfg[this.materials[this.funName]];
        if (this.needDnaNumLb) this.needDnaNumLb.string = `${this.gweiToNum(updateCost?.dna_gwei || 0)}`
        this.setNodeActive(this.needDnaNumLb.node.parent, updateCost?.dna_gwei ?? 0);
    }

    setNodeActive(node: Node, num: number) {
        node.active = new BigNumber(num).gt(0);
    }

    private gweiToNum(gwei) {
        const bb = CommonUtil.gweiToNum(gwei)
        return Number(bb)
    }

    canEnough() {
        const updateCost = this.nameLevelItem.cardCfg[this.materials[this.config.funName]];
        let allDNA = WalletUtil.getTotalCurrByType(CurrType.DNA);
        let dna = CommonUtil.gweiToEther(updateCost?.dna_gwei ?? 0);
        if (dna.gt(0) && dna.gt(CommonUtil.weiToEther(allDNA))) {
            tips.errorTip("not_enough_nda", true);
            return false;
        } else {
            return true;
        }
    }

    private async useAction() {
        if (!this.canEnough()) return;
        const ok = await this.mPropItem.checkCanUseAndTip()
        if (!ok) return
        let _propNum: core.IIdCount[] = [{ id: this.mPropItem.currPropType, cnt: 1 }];
        const ret = await HttpHome.queryGas1(EGasType.USE_MATERIALS, _propNum)
        if (!ret) return
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            content: this.contents[this.funName],
            contentParams: [
                {
                    key: 'prop',
                    value: `${this.mPropItem.propName}`
                },
                {
                    key: 'name',
                    value: `${this.nameLevelItem.getCardName}`
                }
            ],
            okFunc: () => this["_" + this.funName](),
            okWord: 'common_prompt_ok',
            needCancel: true,
            gas: ret.gas
        })
    }

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

    private async _onResetAll() {
        if (!this.canEnough()) return;
        const args = pkgcs.CsCardResetAllReq.create()
        args.cardId = this.config.id
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardResetAllReq, opcode.OpCode.ScCardResetAllResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScCardResetAllPush>({
                closeEventName: `${opcode.OpCode.ScCardResetAllPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.cardReset);
                this.particeSys2D.resetSystem()
                tips.okTip()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private async _onResetSingle() {
        if (!this.canEnough()) return;
        const attrId = this.dispostionCom.getSelectAttrId()
        if (!attrId) {
            tips.alert('equipment_no_select_attr')
            return
        }
        const args = pkgcs.CsCardResetAttrReq.create()
        args.cardId = this.config.id
        args.attrId = attrId
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardResetAttrReq, opcode.OpCode.ScCardResetAttrResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScCardResetAttrPush>({
                closeEventName: `${opcode.OpCode.ScCardResetAttrPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.cardCleanUp);
                this.particeSys2D.resetSystem()
                tips.okTip()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private async _onRefined() {
        if (!this.canEnough()) return;
        const attrId = this.dispostionCom.getSelectAttrId()
        if (!attrId) {
            tips.alert('equipment_no_select_attr')
            return
        }
        const args = pkgcs.CsCardResetAttrValReq.create()
        args.cardId = this.config.id
        args.attrId = attrId
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardResetAttrValReq, opcode.OpCode.ScCardResetAttrValResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScCardResetAttrValPush>({
                closeEventName: `${opcode.OpCode.ScCardResetAttrValPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.cardReset);
                this.particeSys2D.resetSystem()
                tips.okTip()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'tip_card_reset_fail_title',
            content: 'tip_card_reset_fail_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'key',
                    value: `${this.nameLevelItem.getCardName}`
                },
            ],
        })
    }

    private CardSingleRefresh(event, card: core.ICard) {
        if (this.config?.id == card?.id) {
            this.nameLevelItem.init({ netId: this.config.id })
            this.dispostionCom.init(this.config.id, this.isChecks[this.funName])
        }
    }

    onLoad() {
        Message.on(GameEvent.CardSingleRefresh, this.CardSingleRefresh, this);
    }

    onDestroy() {
        Message.off(GameEvent.CardSingleRefresh, this.CardSingleRefresh, this);
    }

}

