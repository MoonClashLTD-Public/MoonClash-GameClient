import { _decorator, Component, ParticleSystem2D } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { PropItem } from '../../common/com/PropMask/PropItem';
import { MySlider } from '../../common/com/Slider/MySlider';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../common/pop/CommonAlert';
import { PlayerManger } from '../../data/playerManager';
import { AudioSoundRes } from '../../data/resManger';
import { ICSCardPopNetCfg } from '../utils/enum';

const { ccclass, property } = _decorator;

@ccclass('CSDurablePop')
export class CSDurablePop extends Component {
    @property(CardPrefab)
    private cardPrefab: CardPrefab = null
    @property(MySlider)
    private mSlider: MySlider = null
    @property(PropItem)
    private mPropItem: PropItem = null
    @property(ParticleSystem2D)
    private particeSys2D: ParticleSystem2D = null

    private get cardManager() {
        return PlayerManger.getInstance().cardManager.playCard
    }

    private get showCardName() {
        const tableCfg = this.cardPrefab.cardInfoCom.getCardCfg()
        return LanguageData.getLangByID(tableCfg.name)
    }

    private get propName() {
        return this.mPropItem.propName
    }

    private config: ICSCardPopNetCfg
    private curPowerNum = 0
    onAdded(params: ICSCardPopNetCfg) {
        if (!params) throw new Error("params is null");
        this.config = params
        this.upViews()
    }

    private upViews() {
        const params = this.config
        this.cardPrefab?.init({
            cardPrefabType: !!!params.cardId ? CardPrefabType.None : CardPrefabType.NumInfoHasPower,
            id: params?.cardId,
        })
        this.curPowerNum = this.cardManager.getNetCardById(this.config?.cardId)?.power || 0
        const material = this.cardPrefab.cardInfoCom.getCardCfg().reset_power_cost.materials[0]
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
        const args = pkgcs.CsCardResetPowerReq.create()
        args.cardId = this.config.cardId
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
                content: `tip_card_power_content`,
                contentParams: [
                    {
                        key: 'prop',
                        value: `${this.mPropItem.usePropNum} ${this.propName}`
                    },
                    {
                        key: 'name',
                        value: `${this.showCardName}`
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

    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'tip_card_reset_power_fail_title',
            content: 'tip_card_reset_power_fail_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'key',
                    value: `${this.showCardName}`
                },
            ],
        })
    }

    onLoad() {
        Message.on(GameEvent.CardDataRefresh, this.upViews, this);
    }

    onDestroy() {
        Message.off(GameEvent.CardDataRefresh, this.upViews, this);
    }
}
