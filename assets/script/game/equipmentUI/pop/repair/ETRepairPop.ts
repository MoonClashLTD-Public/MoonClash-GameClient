import { _decorator, Component, Node, Sprite, ParticleSystem2D } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { LanguageData } from '../../../../core/gui/language/LanguageData';
import { tips } from '../../../../core/gui/prompt/TipsManager';
import { oops } from '../../../../core/Oops';
import { PropItem } from '../../../common/com/PropMask/PropItem';
import { MySlider } from '../../../common/com/Slider/MySlider';
import { GameEvent } from '../../../common/config/GameEvent';
import { UIID } from '../../../common/config/GameUIConfig';
import { EquipmentPrefab, EquipPrefabType } from '../../../common/equipment/EquipmentPrefab';
import HttpHome, { EGasType } from '../../../common/net/HttpHome';
import { netChannel } from '../../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../../common/pop/CommonAlert';
import { PlayerManger } from '../../../data/playerManager';
import { AudioSoundRes } from '../../../data/resManger';
import { IEquipCardPopCfg } from '../../utils/enum';
const { ccclass, property } = _decorator;

@ccclass('ETRepairPop')
export class ETRepairPop extends Component {
    @property(EquipmentPrefab)
    private equipPrefab: EquipmentPrefab = null
    @property(MySlider)
    private mSlider: MySlider = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null
    private get propName() {
        return this.mPropItem.propName
    }
    private config: IEquipCardPopCfg
    private curPowerNum = 0
    onAdded(params: IEquipCardPopCfg) {
        if (!params?.id) throw new Error("params.id is null");
        this.config = params
        this.upViews()
    }

    private upViews() {
        this.equipPrefab?.init({
            id: this.config.id,
            equipPrefabType: EquipPrefabType.NumInfoHasPower
        })
        this.curPowerNum = this.equipPrefab.equipInfoCom.equipData?.durability || 0
        const material = this.equipPrefab.equipInfoCom.equipRepairCostCfg?.cost?.materials[0]
        this.mPropItem.upData(material?.id, material?.cnt)
        this.mSlider.upData({
            minPower: this.curPowerNum,
            progress: (num: number) => {
                const power = this.curPowerNum
                let costProp = num - power
                if (costProp < 0) {
                    costProp = 0
                } else {
                    costProp = costProp * this.mPropItem.useCost
                }
                this.mSlider.setShowLabel(`${costProp}`)
                this.mPropItem.upCost(costProp)
            }
        })
    }

    private async confirm() {
        const ok = await this.showConfirmTip()
        if (!ok) return
        const args = pkgcs.CsEquipRepairEquipReq.create()
        args.equipId = this.config.id
        args.durability = this.mSlider.getCurNum()
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipRepairEquipReq, opcode.OpCode.ScEquipRepairEquipResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipRepairEquipPush>({
                closeEventName: `${opcode.OpCode.ScEquipRepairEquipPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.equipFix);
                this.particeSys2D.resetSystem()
                tips.okTip()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private async showConfirmTip() {
        const ok = await this.mPropItem.checkCanUseAndTip()
        if (!ok) return
        const power = this.curPowerNum
        let costProp = this.mSlider.getCurNum() - power
        if (costProp < 0) {
            costProp = 0
        } else {
            costProp = costProp * this.mPropItem.useCost
        }
        let _propNum: core.IIdCount[] = [{ id: this.mPropItem.currPropType, cnt: costProp }];
        const ret = await HttpHome.queryGas1(EGasType.USE_MATERIALS, _propNum)
        if (!ret) return
        return new Promise<boolean>((resolve, reject) => {
            oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
                content: `tip_equip_power_content`,
                contentParams: [
                    {
                        key: 'prop',
                        value: `${this.mPropItem.usePropNum} ${this.propName}`
                    },
                    {
                        key: 'num',
                        value: `${this.mSlider.getCurNum()}`
                    }
                ],
                okFunc: () => resolve(true),
                closeFunc: () => resolve(false),
                okWord: 'common_prompt_ok',
                needCancel: true,
                gas: ret.gas
            })
        })
    }

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'tip_equip_reset_power_fail_title',
            content: 'tip_equip_reset_power_fail_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'key',
                    value: `${this.showCardName}`
                },
            ],
        })
    }

    private get showCardName() {
        const tableCfg = this.equipPrefab.equipInfoCom.equipCfg
        return LanguageData.getLangByID(tableCfg.name)
    }

    onLoad() {
        Message.on(GameEvent.EquipDataRefresh, this.upViews, this);
    }

    onDestroy() {
        Message.off(GameEvent.EquipDataRefresh, this.upViews, this);
    }
}

