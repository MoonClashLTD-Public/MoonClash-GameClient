import { _decorator, Component, Node, Sprite, ParticleSystem2D, Label } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { tips } from '../../../../core/gui/prompt/TipsManager';
import { oops } from '../../../../core/Oops';
import { PropItem } from '../../../common/com/PropMask/PropItem';
import { UIID } from '../../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../../common/net/HttpHome';
import { netChannel } from '../../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../../common/pop/CommonAlert';
import { PlayerManger } from '../../../data/playerManager';
import { AudioSoundRes } from '../../../data/resManger';
import { EquipAttrCom } from '../../com/EquipAttrCom';
import { IEquipResetAttrPopCfg } from '../../utils/enum';
import { ETNameLevelItem } from '../cardInfo/ETNameLevelItem';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import WalletUtil, { CurrType } from '../../../walletUI/WalletUtil';

const { ccclass, property } = _decorator;

@ccclass('ETResetAttrPop')
export class ETResetAttrPop extends Component {
    @property(ETNameLevelItem)
    private nameLevelItem: ETNameLevelItem = null
    @property(EquipAttrCom)
    private equipAttrCom: EquipAttrCom = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(Label)
    private needDnaNumLb: Label = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null

    private config: IEquipResetAttrPopCfg
    private isSingle = false
    private funName: string
    private isChecks = {
        "onResetSingle": true,
        "onResetAll": false,
        "onRefined": true,
    }
    private contents = {
        "onResetSingle": "tip_equip_prop_content2",
        "onResetAll": "tip_equip_prop_content",
        "onRefined": "tip_equip_prop_content2",
    }
    private materials = {
        "onResetSingle": "reset_attr_cost",
        "onResetAll": "reset_all_cost",
        "onRefined": "reset_attr_val_cost",
    }
    onAdded(params: IEquipResetAttrPopCfg) {
        if (!params?.id) throw new Error(`equip id is null ${params?.id}`);
        this.config = params
        this.isSingle = this.isChecks[params.funName]
        this.initViews()
    }

    private initViews() {
        this.nameLevelItem.init(this.config)
        this.equipAttrCom.init([this.config.id], this.isSingle)

        const equipCfg = this.nameLevelItem.equipInfoCom?.equipCfg
        if (equipCfg) {
            const material = equipCfg[this.materials[this.config.funName]].materials[0]
            this.mPropItem.upData(material?.id, material?.cnt || 0)
        }
        this.updInfo();
    }

    updInfo() {
        const updateCost = this.nameLevelItem.equipInfoCom?.equipCfg[this.materials[this.config.funName]];
        if (this.needDnaNumLb) this.needDnaNumLb.string = `${this.gweiToNum(updateCost?.dna_gwei || 0)}`
        this.setNodeActive(this.needDnaNumLb.node.parent, updateCost?.dna_gwei ?? 0);
    }

    setNodeActive(node: Node, num: number) {
        node.active = new BigNumber(num).gt(0);
    }

    canEnough() {
        const updateCost = this.nameLevelItem.equipInfoCom?.equipCfg[this.materials[this.config.funName]];
        let allDNA = WalletUtil.getTotalCurrByType(CurrType.DNA);
        let dna = CommonUtil.gweiToEther(updateCost?.dna_gwei ?? 0);
        if (dna.gt(0) && dna.gt(CommonUtil.weiToEther(allDNA))) {
            tips.errorTip("not_enough_nda", true);
            return false;
        } else {
            return true;
        }
    }

    private gweiToNum(gwei) {
        const bb = CommonUtil.gweiToNum(gwei)
        return Number(bb)
    }

    private async useAction() {
        if (!this.canEnough()) return;
        const ok = await this.mPropItem.checkCanUseAndTip()
        if (!ok) return
        let _propNum: core.IIdCount[] = [{ id: this.mPropItem.currPropType, cnt: 1 }];
        const ret = await HttpHome.queryGas1(EGasType.USE_MATERIALS, _propNum)
        if (!ret) return
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            content: this.contents[this.config.funName],
            contentParams: [
                {
                    key: 'prop',
                    value: `${this.mPropItem.propName}`
                },
                {
                    key: 'name',
                    value: `${this.nameLevelItem.getEquipName}`
                }
            ],
            okFunc: () => this["_" + this.config.funName](),
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
        const args = pkgcs.CsEquipResetAllReq.create()
        args.equipId = this.config.id
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipResetAllReq, opcode.OpCode.ScEquipResetAllResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipResetAllPush>({
                closeEventName: `${opcode.OpCode.ScEquipResetAllPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.equipRecast);
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
        const attrId = this.equipAttrCom.getSelectAttrId()
        if (!attrId) {
            tips.alert('equipment_no_select_attr')
            return
        }
        const args = pkgcs.CsEquipResetAttrReq.create()
        args.equipId = this.config.id
        args.attrId = attrId
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipResetAttrReq, opcode.OpCode.ScEquipResetAttrResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipResetAttrPush>({
                closeEventName: `${opcode.OpCode.ScEquipResetAttrPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.equipCleanUp);
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
        const attrId = this.equipAttrCom.getSelectAttrId()
        if (!attrId) {
            tips.alert('equipment_no_select_attr')
            return
        }
        const args = pkgcs.CsEquipResetAttrValReq.create()
        args.equipId = this.config.id
        args.attrId = attrId
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipResetAttrValReq, opcode.OpCode.ScEquipResetAttrValResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipResetAttrValPush>({
                closeEventName: `${opcode.OpCode.ScEquipResetAttrValPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.equipRecast);
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
            title: 'tip_equip_reset_fail_title',
            content: 'tip_equip_reset_fail_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'key',
                    value: ``
                },
            ],
        })
    }
}

