import { _decorator, Component, Node, ParticleSystem2D } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { DefBottonCom } from '../../common/com/DefBottonCom';
import { PropItem } from '../../common/com/PropMask/PropItem';
import { MySlider } from '../../common/com/Slider/MySlider';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../common/pop/CommonAlert';
import { PlayerManger } from '../../data/playerManager';
import { AudioSoundRes } from '../../data/resManger';
import { CSCardBanner, IInitCardBannner } from '../com/CSCardBanner';

const { ccclass, property } = _decorator;

@ccclass('CSGroupDurablePop')
export class CSGroupDurablePop extends Component {
    @property(CSCardBanner)
    private bboxBanner: CSCardBanner = null
    @property(MySlider)
    private mSlider: MySlider = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(DefBottonCom)
    private useBtn: DefBottonCom = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null
    private config: IInitCardGroupDurbleCfg
    onAdded(params: IInitCardGroupDurbleCfg) {
        this.config = params
        this.upViews()
    }

    private upViews() {
        const param: IInitCardBannner = { groupId: this.config.groupTypeId, hasBtm: false }
        this.bboxBanner.init(param)
        this.mPropItem.upData(this.bboxBanner?.materialId)
        this.mSlider?.upData({
            minPower: this.bboxBanner.minCost,
            progress: (num: number) => {
                let diff = this.bboxBanner.getNeedPropNum(num)
                this.mSlider.setShowLabel(`${diff}`)
                this.mPropItem.upCost(diff)
            }
        })
        this.useBtn.setEnable(this.bboxBanner.canClick)
    }

    private async confirm() {
        if (!this.config) return
        const ok = await this.showConfirmTip()
        if (!ok) return
        const args = pkgcs.CsCardResetPowerReq.create()
        args.groupId = this.config.groupTypeId
          
        args.targetPower = this.mSlider.getCurNum()
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardResetPowerReq, opcode.OpCode.ScCardResetPowerResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScCardResetPowerPush>({
                closeEventName: `${opcode.OpCode.ScCardResetPowerPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                oops.audio.playEffect(AudioSoundRes.cardRecover);
                this.particeSys2D.resetSystem()
                tips.okTip()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }

    private async showConfirmTip() {
        const ok = await this.mPropItem.checkCanUseAndTip()
        if (!ok) return
        let diff = this.bboxBanner.getNeedPropNum(this.mSlider.getCurNum())
        let _propNum: core.IIdCount[] = [{ id: this.mPropItem.currPropType, cnt: diff }];
        const ret = await HttpHome.queryGas1(EGasType.USE_MATERIALS, _propNum)
        if (!ret) return
        return new Promise<boolean>((resolve, reject) => {
            oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
                content: `tip_card_group_power_content`,
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
            title: 'tip_card_group_reset_power_fail_title',
            content: 'tip_card_group_reset_power_fail_content',
            okWord: 'common_prompt_ok',
        })
    }

    onLoad() {
        Message.on(GameEvent.CardDataRefresh, this.upViews, this);
    }

    onDestroy() {
        Message.off(GameEvent.CardDataRefresh, this.upViews, this);
    }
}

export interface IInitCardGroupDurbleCfg {
    groupTypeId: number
}