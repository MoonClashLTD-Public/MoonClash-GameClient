import { _decorator, Component, Node, EventTouch } from 'cc';
import { oops } from '../../../../core/Oops';
import { EquipAttrCom } from '../../com/EquipAttrCom';
import { IEquipMergeInfoPopCfg } from '../../utils/enum';
import { ETNameLevelItem } from '../cardInfo/ETNameLevelItem';


const { ccclass, property } = _decorator;
@ccclass('ETMCardInfoPop')
export class ETMCardInfoPop extends Component {
    @property(ETNameLevelItem)
    private nameLevelItem: ETNameLevelItem = null
    @property(EquipAttrCom)
    private equipAttrCom: EquipAttrCom = null

    private config: IEquipMergeInfoPopCfg

    /**
  
     * {
  
  
     * }
     */
    public onAdded(params: IEquipMergeInfoPopCfg) {
        if (!params.id) throw new Error(`equip id is null ${params?.id}`);
        this.config = params
        this.node.active = true
        this.setCardInfo()
    }

    private setCardInfo() {
        if (this.nameLevelItem) this.nameLevelItem.init(this.config)
        if (this.equipAttrCom) this.equipAttrCom.init([this.config.id])
    }

    onDestroy() {
        this.config = null
    }

    checkAction() {
        this.btnClose()
        this.config.checkClick && this.config.checkClick(this.config.id)
    }

    btnClose() {
        oops.gui.removeByNode(this.node, true)
    }
}

