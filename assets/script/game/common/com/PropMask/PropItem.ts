import { _decorator, Component, Node, Sprite, EventTouch } from 'cc'
import { Message } from '../../../../core/common/event/MessageManager'
import { LanguageData } from '../../../../core/gui/language/LanguageData'
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel'
import { tips } from '../../../../core/gui/prompt/TipsManager'
import { oops } from '../../../../core/Oops'
import { DataEvent } from '../../../data/dataEvent'
import { PlayerManger } from '../../../data/playerManager'
import { ResManger } from '../../../data/resManger'
import { UIID } from '../../config/GameUIConfig'
import TableNfts, { NftCfg } from '../../table/TableNfts'
import { IPropTipMaskCfg } from './PropTipMask'
const { ccclass, property } = _decorator

@ccclass('PropItem')
export class PropItem extends Component {
    @property(Sprite)
    private propIcon: Sprite = null
    @property(LanguageLabel)
    private propNum: LanguageLabel = null

    private propType: core.NftMaterialType
    private cfg: NftCfg
      
    private defCost = 0
      
    private showCost = 0

    get useCost() {
        return this.defCost || 0
    }

    async upData(propType: core.NftMaterialType, cost = 0) {
        if (propType == core.NftMaterialType.MaterialNone) return
        this.propType = propType
        const nftCfg = TableNfts.getInfoByMaterialType(propType)
        this.propNum.params[0].value = `${cost}`
        this.propNum.params[1].value = `${nftCfg.count || 0}`
        this.cfg = nftCfg
        this.defCost = cost
        this.showCost = cost
        this.propIcon.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(nftCfg.Id)
    }

    upCost(cost: number) {
        this.showCost = cost
        this.propNum.params[0].value = `${cost}`
        this.propNum.forceUpdate()
    }

    private upHasNum() {
        const nftCfg = TableNfts.getInfoByMaterialType(this.propType)
        this.propNum.params[1].value = `${nftCfg.count || 0}`
        this.propNum.forceUpdate()
        this.cfg = nftCfg
    }

    private openMask(event: EventTouch, customEventData: string) {
        oops.gui.open<IPropTipMaskCfg>(UIID.PropTipMask, {
            clickNode: event.currentTarget,
            type: this.propType,
            cost: this.showCost
        })
    }

    get propName() {
        return LanguageData.getLangByID(this.cfg.display_name)
    }

    private get canUse() {
        const maxCount = this.cfg.count || 0
        return this.showCost <= maxCount && this.showCost > 0
    }

    get usePropNum() {
        return this.showCost
    }

    checkCanUseAndTip() {
        return new Promise<boolean>((resolve, reject) => {
            if (this.canUse) return resolve(true)
            if (this.showCost > 0) tips.errorTip(LanguageData.getLangByIDAndParams('prop_user_err', [{ key: 'propName', value: this.propName }]))
            return resolve(false)
        })
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(DataEvent.DATA_MATERIALS_CHANGE, this.upHasNum, this);
    }

    private removeEvent() {
        Message.off(DataEvent.DATA_MATERIALS_CHANGE, this.upHasNum, this);
    }

    get currPropType() {
        return this.propType
    }
}


