import { _decorator, Component, Node, find, Button, Label } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { netChannel } from '../common/net/NetChannelManager';
import TableBlindBox, { TableBlindBoxCfg } from '../common/table/TableBlindBox';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property } = _decorator;

@ccclass('BlindBoxItem')
export class BlindBoxItem extends Component {
    @property(Label)
    numLbl: Label = null;
    @property(Label)
    costLbl: Label = null;
    _num = 1;
    cost: string = '0';
    info: TableBlindBoxCfg = null;
    start() {

    }

    update(deltaTime: number) {

    }

    init(idx: number) {
        let item = this.node;
        let titleLbl = find('/titleNode', item).getComponentInChildren(LanguageLabel);
        let cardNode = find('/content/blind box_cards', item);
        let equipmentNode = find('/content/blind box_equipment', item);
        let openBtn = find('/content/openBtn', item).getComponent(Button);
        let buyBtn = find('/content/buyBtn', item).getComponent(Button);

        let box = TableBlindBox.cfg[idx];
        this.info = box;
        if (box.type == core.NftSubType.NftSubBoxCard) {
            titleLbl.dataID = "blind_page_title_0";
        } else if (box.type == core.NftSubType.NftSubBoxEquipment) {
            titleLbl.dataID = "blind_page_title_1";
        }

        cardNode.active = box.type == core.NftSubType.NftSubBoxCard;
        equipmentNode.active = box.type == core.NftSubType.NftSubBoxEquipment;

        // openBtn.clickEvents[0].customEventData = `${box.id}`;
        buyBtn.clickEvents[0].customEventData = `${idx}`;

        this._num = 1;
        this.updNum();
    }

    updNum() {
        let cost = CommonUtil.gweiToEther(`${this.info.cost.dna_gwei * this._num}`).toFixed();
        this.costLbl.string = cost;
        this.cost = cost;
        this.numLbl.string = `${this._num}`;
    }

    addBtn() {
        this._num++;
        this._num = this._num <= 5 ? this._num : 5;
        this.updNum();
    }
    subBtn() {
        this._num--;
        this._num = this._num >= 1 ? this._num : 1;
        this.updNum();
    }
}

