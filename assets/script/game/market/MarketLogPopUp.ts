import { _decorator, Component, Node, find, Label } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property, type } = _decorator;

@ccclass('MarketLogPopUp')
export class MarketLogPopUp extends Component {
    @type(List)
    list: List = null;

    @type(LanguageLabel)
    explain: LanguageLabel = null;

    param: watrade.ITradeLog[]
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded(param: MarketLogPopUpParam) {
        let ret = await HttpHome.queryMyTrades();
        this.param = ret?.trades ?? [];
        this.param = this.param.filter(v => v.buyerId > 0 && v.tokenType == param.nftType);
        this.list.numItems = this.param.length;
        this.explain.node.active = this.param.length <= 0;
    }

    renderEvent(item: Node, idx: number) {
        let info = this.param[idx];

        let lbl = find('Label', item);

        let dataID = ""
        let isMeStr = PlayerManger.getInstance().playerId == info.buyerId ? "_me" : "";
        if (info.tradeType == core.TradeType.Rental) {
            dataID = `market_desc_log${isMeStr}_rental`;
        } else if (info.tradeType == core.TradeType.Trade) {
            dataID = `market_desc_log${isMeStr}_trade`;
        }
        if (info.tokenType == core.NftType.NftTypeCard) {
            dataID += "2";
        } else if (info.tokenType == core.NftType.NftTypeEquipment) {
            dataID += "1";
        }

        let _lbl = lbl.getComponent(LanguageLabel);
        _lbl.dataID = dataID;
        _lbl.params = [
            {
                key: 'pid',
                value: `${info.buyerId}`,
            },
            {
                key: 'num',
                value: `${CommonUtil.weiToEtherStr(info.bnbPrice)}`,
            },
            {
                key: 'id',
                value: `${info.tokenId}`,
            },
        ]
    }


    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type MarketLogPopUpParam = {
    nftType: core.NftType,
}
