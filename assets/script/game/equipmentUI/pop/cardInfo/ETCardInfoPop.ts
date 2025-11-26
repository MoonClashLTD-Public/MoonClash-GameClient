import { _decorator, Component, Node, EventTouch, Widget, Label } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { tips } from '../../../../core/gui/prompt/TipsManager';
import { oops } from '../../../../core/Oops';
import { DefBottonCom } from '../../../common/com/DefBottonCom';
import { GameEvent } from '../../../common/config/GameEvent';
import { UIID } from '../../../common/config/GameUIConfig';
import HttpHome, { EGasType } from '../../../common/net/HttpHome';
import { netChannel } from '../../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../../common/pop/CommonAlert';
import TableEquipBurn from '../../../common/table/TableEquipBurn';
import { PlayerManger } from '../../../data/playerManager';
import { WalletSellPopUpParam } from '../../../walletUI/WalletSellPopUp';
import WalletUtil from '../../../walletUI/WalletUtil';
import { EquipAttrCom } from '../../com/EquipAttrCom';
import { IEquipCardPopCfg, IEquipInfoPopCfg, IEquipResetAttrPopCfg } from '../../utils/enum';
import { EquipSystemUtils } from '../../utils/equipSystemUtils';
import { ETNameLevelItem } from './ETNameLevelItem';


const { ccclass, property } = _decorator;
@ccclass('ETCardInfoPop')
export class ETCardInfoPop extends Component {
    @property(ETNameLevelItem)
    private nameLevelItem: ETNameLevelItem = null
    @property(Label)
    private equipId: Label = null
    @property([DefBottonCom])
    private btns: DefBottonCom[] = []
    @property(DefBottonCom)
    private useBtn: DefBottonCom = null
    @property(DefBottonCom)
    private marketBtn: DefBottonCom = null
    @property(EquipAttrCom)
    private equipAttrCom: EquipAttrCom = null
    @property(Label)
    private repairValue: Label = null

    private config: IEquipInfoPopCfg

    /**
  
     * {
  
  
     * }
     */
    public onAdded(params: IEquipInfoPopCfg) {
        if (!params.id) throw new Error(`equip id is null ${params?.id}`);
        this.config = params
        this.node.active = true
        this.setCardInfo()
    }

    private setCardInfo() {
        if (this.useBtn) this.useBtn.setEnable(!(this.config?.isGroup ?? false))
        const _equipData = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(this.config.id)
        if (this.marketBtn) this.useBtn.setEnable((_equipData?.durability ?? 0) > 0)
        if (this.equipAttrCom) this.equipAttrCom.init([this.config.id])
        this.upViews()
    }

    private upViews() {
        if (this.nameLevelItem) this.nameLevelItem.init(this.config)
        const _equipData = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(this.config.id)
        const _equipBurnCfg = TableEquipBurn.getInfoByEquipIdAndRarity(_equipData?.protoId, _equipData?.equipRarity)
        // const dgg = _equipBurnCfg?.showDgg || '0'
        const dna = _equipBurnCfg?.showDna || '0'
        // let num = ''
        // num += ` ${dgg} DGG`
        // num += `、${dna} DNA`
        this.equipId.string = `#${_equipData?.nftId || 0}`
        if (this.repairValue) this.repairValue.string = dna.toString()
        this.upBtnStatus()
    }

    private upBtnStatus() {
        let canClick = EquipSystemUtils.canClickBtn({ cardId: this.config.id })
        this.btns.forEach(btn => {
            btn.setEnable(canClick)
        })
    }

    btnClick(event: EventTouch, ind: string) {
        const args: IEquipCardPopCfg = { id: this.config.id }
        const args2: IEquipResetAttrPopCfg = { id: this.config.id }
        switch (Number(ind)) {
            case 0:  
                args2.funName = "onRefined"
                oops.gui.open(UIID.EquipResetAttrPop, args2)
                break;
            case 1:  
                args2.funName = "onResetSingle"
                oops.gui.open(UIID.EquipResetAttrPop, args2)
                break;
            case 2:  
                args2.funName = "onResetAll"
                oops.gui.open(UIID.EquipResetAttrPop, args2)
                break;
            case 3:  
                if (this.nameLevelItem.equipInfoCom.canAddDurability) {
                    oops.gui.open(UIID.EquipmentRepairPop, args)
                } else {
                    tips.errorTip('tip_err_full_durability', true)
                }
                break;
            case 4:  
                args.cb = () => this.btnClose()
                oops.gui.open(UIID.EquipmentCompositePop, args)
                break;
            case 5:  
                this.config.equipClick && this.config.equipClick(this.config.id)
                this.btnClose()
                break;
            case 6:  
                this.onRepair()
                break;
            case 7:
                let param: WalletSellPopUpParam = {
                    equipment: PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(this.config.id)
                }
                WalletUtil.openWalletInfo(param);
                // Message.dispatchEvent(GameEvent.HomeTurnPages,
                //     <HomeTurnPagesParam>{ page: HOMEPAGEENUM.MARKETPAGE });
                break;
            default:
                break;
        }
    }


    private async onRepair() {
        const ok = await this.confimTip()
        if (!ok) return
        const args = pkgcs.CsEquipBurnReq.create()
        args.equipId = this.config.id
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipBurnReq, opcode.OpCode.ScEquipBurnResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipBurnPush>({
                closeEventName: `${opcode.OpCode.ScEquipBurnPush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                tips.okTip()
                this.btnClose()
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private btnClose() {
        oops.gui.removeByNode(this.node, true)
    }

    private async confimTip() {
        const argReqs = pkgcs.CsEquipBurnReq.create()
        argReqs.equipId = this.config.id
        const ret = await HttpHome.queryGas1(EGasType.EQUIP_BURN, argReqs)
        if (!ret) return
        return new Promise<boolean>((resolve, reject) => {
            oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
                gas: ret.gas,
                content: 'equip_repair_confim_content',
                needCancel: true,
                okWord: "common_prompt_confirm",
                contentParams: [
                    {
                        key: 'name',
                        value: this.equipName
                    },
                    {
                        key: 'num',
                        value: `${this.repairValue?.string || '0'} DNA`
                    }
                ],
                closeFunc: () => resolve(false),
                okFunc: () => resolve(true),
            })
        })
    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'equip_repair_err_name',
            content: 'equip_repair_err_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'name',
                    value: `${this.equipName}`
                },
            ],
        })
    }

    private get equipName() {
        return this.nameLevelItem.equipInfoCom?.equipCfg?.showName || ''
    }

    onLoad() {
        Message.on(GameEvent.EquipSingleRefresh, this.upViews, this);
        Message.on(GameEvent.EquipDataRefresh, this.upViews, this);
    }

    onDestroy() {
        this.config = null
        Message.off(GameEvent.EquipSingleRefresh, this.upViews, this);
        Message.off(GameEvent.EquipDataRefresh, this.upViews, this);
    }
}

