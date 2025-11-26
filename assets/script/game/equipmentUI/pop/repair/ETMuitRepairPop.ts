import { _decorator, Component, Node, Sprite, ParticleSystem2D } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { tips } from '../../../../core/gui/prompt/TipsManager';
import { oops } from '../../../../core/Oops';
import { DefBottonCom } from '../../../common/com/DefBottonCom';
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
import { IEquipGroupPopCfg } from '../../utils/enum';
import { EquipSystemUtils } from '../../utils/equipSystemUtils';
const { ccclass, property } = _decorator;

@ccclass('ETMuitRepairPop')
export class ETMuitRepairPop extends Component {
    @property([EquipmentPrefab])
    private equipPrefabs: EquipmentPrefab[] = []
    @property(MySlider)
    private mSlider: MySlider = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(DefBottonCom)
    private useBtn: DefBottonCom = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null
    private get equipGroup() {
        return PlayerManger.getInstance().equipManager.playEquipGroup
    }

    private config: IEquipGroupPopCfg
    onAdded(params: IEquipGroupPopCfg) {
        if (!params.id) throw new Error("params.id is null");
        this.config = params
        this.upViews()
    }

      
      
    private cardsCosts: { cost: number, power: number }[] = []
    private upViews() {
        const equips = this.equipGroup.getCardGroupById(this.config.id).equipments || []
        let materialId = 0
        this.cardsCosts = []
        let canClick = true
        let minCost = -1
        this.equipPrefabs.forEach((v, i) => {
            let equipId = 0
            if (i < equips.length) equipId = equips[i]?.id ?? 0
            v.init({
                id: equipId,
                equipPrefabType: equipId == 0 ?
                    EquipPrefabType.None : EquipPrefabType.NumInfoHasPower
            })
            if (equipId != 0) {
                const material = v.equipInfoCom.equipRepairCostCfg?.cost.materials[0]
                materialId = material?.id
                const durability = v.equipInfoCom.equipData?.durability || 0
                this.cardsCosts.push({ cost: material?.cnt, power: durability })
                if (minCost == -1) {
                    minCost = durability
                } else {
                    minCost = Math.min(durability, minCost)
                }
                if (canClick) canClick = EquipSystemUtils.canClickBtn({ equip: v.equipInfoCom.equipData })
            }
        })
        this.mPropItem.upData(materialId)
        this.mSlider?.upData({
            minPower: minCost == -1 ? 0 : minCost,
            progress: (num: number) => {
                let diff = this.getNeedPropNum(num)
                this.mSlider.setShowLabel(`${diff}`)
                this.mPropItem.upCost(diff)
            }
        })
        this.useBtn.setEnable(this.cardsCosts.length != 0 && canClick)
    }

    getNeedPropNum(sliderNum: number) {
        let curPropNum = 0
        for (const cardCost of this.cardsCosts) {
            let diff = (sliderNum - cardCost.power)
            if (diff > 0) curPropNum += diff * cardCost.cost
        }
        return curPropNum
    }

    private async confirm() {
        if (!this.config) return
        const ok = await this.showConfirmTip()
        if (!ok) return
        const args = pkgcs.CsEquipRepairEquipGroupReq.create()
        args.equipGroupId = this.config.id
        args.durability = this.mSlider.getCurNum()
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipRepairEquipGroupReq, opcode.OpCode.ScEquipRepairEquipGroupResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipRepairEquipGroupPush>({
                closeEventName: `${opcode.OpCode.ScEquipRepairEquipGroupPush}`,
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

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

    private async showConfirmTip() {
        const ok = await this.mPropItem.checkCanUseAndTip()
        if (!ok) return
        let _propNum: core.IIdCount[] = [{ id: this.mPropItem.currPropType, cnt: this.getNeedPropNum(this.mSlider.getCurNum()) }];
        const ret = await HttpHome.queryGas1(EGasType.USE_MATERIALS, _propNum)
        if (!ret) return
        return new Promise<boolean>((resolve, reject) => {
            oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
                content: `tip_equip_power_group_content`,
                contentParams: [
                    {
                        key: 'prop',
                        value: `${this.mPropItem.usePropNum} ${this.mPropItem.propName}`
                    },
                    {
                        key: 'power',
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

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'tip_equip_reset_power_fail_title',
            content: 'tip_equip_reset_group_power_fail_content',
            okWord: 'common_prompt_ok',
        })
    }

    onLoad() {
        Message.on(GameEvent.EquipDataRefresh, this.upViews, this);
    }

    onDestroy() {
        Message.off(GameEvent.EquipDataRefresh, this.upViews, this);
    }
}

