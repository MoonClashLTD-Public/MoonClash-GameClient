import { _decorator, Component, Node, find, Label } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property, type } = _decorator;

@ccclass('ShareDetailPopUp')
export class ShareDetailPopUp extends Component {
    @type(List)
    list: List = null;

    @type(LanguageLabel)
    explain: LanguageLabel = null;

    param: invite.ICommissionLog[]
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: invite.ICommissionLog[]) {
          
        this.param = param;
        // console.log(this.param)
        this.list.numItems = param.length;
        this.explain.node.active = param.length <= 0;
    }

    renderEvent(item: Node, idx: number) {
        let info = this.param[idx];

        let lbl = find('Label', item);
        // let codeLbl = find('codeLbl', item);

        let name = info.fromNickname;
        let date = info.createAt;
        let num = CommonUtil.weiToEther(info.award).toFixed();

        let dataId = info.isFirstConsume ? "share_desc0" : "share_desc0";

        let _lbl = lbl.getComponent(LanguageLabel);
        _lbl.dataID = dataId;
        _lbl.params = [
            {
                key: 'date',
                value: `${CommonUtil.dateFormat(new Date(date * 1000), 'yyyy/MM/dd')}`,
            },
            {
                key: 'name',
                value: `${name}`,
            },
            {
                key: 'num',
                value: `${num}`,
            },
        ]

        // switch (info.describe) {
        //     case core.InviteAwardDescribe.InviteBuyBlindBox:
        //         event = LanguageData.getLangByID("share_code_event1")
        //         break;
        //     case core.InviteAwardDescribe.InviteCardUpgrade:
        //         event = LanguageData.getLangByID("share_code_event2")
        //         break;
        //     case core.InviteAwardDescribe.InviteEquipCompose:
        //         event = LanguageData.getLangByID("share_code_event3")
        //         break;
        // }


        // let _lbl = lbl.getComponent(LanguageLabel);
        // _lbl.dataID = LanguageData.getLangByID("share_code_tips1");
        // _lbl.params = [
        //     {
        //         key: 'name',
        //         value: `${name}`,
        //     },
        //     {
        //         key: 'event',
        //         value: `${event}`,
        //     },
        //     {
        //         key: 'date',
        //         value: `${CommonUtil.dateFormat(new Date(date * 1000), 'yyyy/MM/dd')}`,
        //     },
        // ]
        // this.codeLbl.params = params;
        // let _codeLbl = codeLbl.getComponent(LanguageLabel);
        // _codeLbl.dataID = LanguageData.getLangByID("share_code_tips2");
        // _codeLbl.params = [
        //     {
        //         key: 'num',
        //         value: `${num}`,
        //     },
        // ]
    }


    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

