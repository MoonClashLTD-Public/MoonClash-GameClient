import { _decorator, Component, Node, find, Label } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import HttpHome from '../common/net/HttpHome';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property, type } = _decorator;

@ccclass('ShareCodePopUp')
export class ShareCodePopUp extends Component {
    @type(List)
    list: List = null;
    @type(Node)
    explainNode: Node = null;
    @type(Node)
    explain: Node = null;

    param: ShareCodePopUpParam = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: ShareCodePopUpParam) {
          
        this.param = param;
        this.list.numItems = param.data.length;
        this.explain.active = param.data.length <= 0;
    }

    selectedEvent(item: Node, idx: number) {

    }

    renderEvent(item: Node, idx: number) {
        // let info = this.param.data[idx];

        // let isUsed = true;
        // find('used', item).active = isUsed;
        // find('unused', item).active = isUsed;
        // let codeLbl = find('codeLbl', item).getComponent(LanguageLabel);

        // let params = [
        //     {
        //         key: 'code',
        //         value: info.code,
        //     }
        // ]
        // if (this.param.data[idx].invitee) {
        //     codeLbl.dataID = 'share_desc_1'
        // } else {
        //     codeLbl.dataID = 'share_desc_2'
        // }
        // codeLbl.params = params;
    }

    async shareBtn() {
        let d = await HttpHome.inviteDo();
        if (d) {
            PlayerManger.getInstance().playerSelfInfo.updData();
            let str = this.param.shareContent;
            let str2 = LanguageData.getLangByIDAndParams("share_invitation_2", [
                {
                    key: 'desc',
                    value: str,
                },
                {
                    key: 'code1',
                    value: d.inviteCode,
                },
                {
                    key: 'code2',
                    value: d.inviteCode,
                },
            ])
            oops.gui.toast("share_copy", true)
            CommonUtil.copyToClipboard(str2);
        }
    }

      
    explainClick() {
        this.explainNode.active = !this.explainNode.active;
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type ShareCodePopUpParam = {
    shareContent: string,
    data: invite.ICommissionLog[],
}