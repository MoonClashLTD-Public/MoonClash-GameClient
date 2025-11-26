import { _decorator, Component, Node, Label, EditBox, find } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableUrls from '../common/table/TableUrls';
import { PlayerManger } from '../data/playerManager';
import { STORAGE_ENUM } from '../homeUI/HomeEvent';
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
import { ShareCodePopUpParam } from './ShareCodePopUp';
const { ccclass, property, type } = _decorator;

@ccclass('SharePopUp')
export class SharePopUp extends Component {
    @type(List)
    list: List = null;
    @type(Label)
    codeLbl: Label = null;
    @type(Label)
    codeLbl1: Label = null;
    @type(Node)
    explainNode: Node = null;

    @type(Label)
    totalScoresLbl: Label = null;   
    @type(Label)
    registrarLbl: Label = null;   
    @type(Label)
    consumerLbl: Label = null;   
    @type(EditBox)
    editBox: EditBox = null;   

    data: invite.IInviteQueryResp = null;
    start() {
        this.shareEditBox();
    }

    update(deltaTime: number) {

    }

    async onAdded() {
        this.list.numItems = 0;
        this.updInfo();
    }

    async updInfo() {
        let d = await HttpHome.inviteQuery();
        if (d) {
            // this.totalScoresLbl.string = `${Math.floor(d.commission * 100) / 100}`
            let dgg = WalletUtil.getCurrByType(CurrType.GDGG);
            this.totalScoresLbl.string = `${CommonUtil.weiToEtherStr(dgg)}`
            this.registrarLbl.string = `${d.registrar}`
            this.consumerLbl.string = `${d.consumer}`
            this.data = d;
            this.codeLbl.string = d.inviteCode;

              
            this.codeLbl1.string = d.parentCode ? d.parentCode : LanguageData.getLangByID("share_code_none");

            this.list.numItems = d.commissionLogs.length;
        }
    }

    writeInviteCodeClick() {
          
        if (!!!this.data?.parentCode)
            oops.gui.open(UIID.ShareParentCodePopUp, {
                cb: () => {
                    this.updInfo();
                },
            });
    }

      
    detailedClick() {
        if (this.data) {
            oops.gui.open(UIID.ShareDetailPopUp, this.data.commissionLogs ?? []);
        }

    }

      
    inviteCodeClick() {
        if (this.data)
            oops.gui.open<ShareCodePopUpParam>(UIID.ShareCodePopUp, {
                shareContent: this.editBox.string,
                data: this.data.commissionLogs ?? []
            });
    }

    async copyClick() {
        let d = await HttpHome.inviteDo();
        if (d) {
            PlayerManger.getInstance().playerSelfInfo.updData();
            oops.gui.toast("share_copy", true)
            CommonUtil.copyToClipboard(this.data.inviteCode);
        }
    }

      
    async keyShareClick() {
        let d = await HttpHome.inviteDo();
        if (d) {
            PlayerManger.getInstance().playerSelfInfo.updData();
            oops.gui.toast("share_copy_succ", true)
            CommonUtil.copyToClipboard(this.getShareStr());
        }
    }

      
    async withdrawClick() {
        oops.gui.toast("share_desc_0_1", true)
    }

    getShareStr() {
        let str = this.editBox.string;
        let urls = TableUrls.getUrlsByType(core.UrlType.UrlInvite).map(e => { return e.url });
        let url = "";
        if (urls.length > 0) {
            url = urls[0];
            url = url.replace(`%{${"affCode"}}`, this.data.inviteCode)
        }

        let str2 = LanguageData.getLangByIDAndParams("share_invitation_2", [
            {
                key: 'desc',
                value: str,
            },
            {
                key: 'code',
                value: this.data.inviteCode,
            },
            {
                key: 'url',
                value: url,
            },
        ])
        return str2;
    }

    shareEditBox() {
        let str = oops.storage.get(STORAGE_ENUM.invitation, null)
        let editBox = this.editBox;
        if (str == null) {
            editBox.string = LanguageData.getLangByID("share_invitation_1");
        } else {
            editBox.string = str;
        }
        editBox.node.on(EditBox.EventType.EDITING_DID_ENDED, this.editingDidEnded, this);
    }

    editingDidEnded() {
        let len = CommonUtil.getBytesLength(this.editBox.string);
        if (this.editBox.string == "") {
            this.editBox.string = LanguageData.getLangByID("share_invitation_1");
        } else if (len > this.editBox.maxLength - 20) {
            oops.gui.toast("share_editbox_tips", true);
        } else {
            oops.storage.set(STORAGE_ENUM.invitation, this.editBox.string)
        }
    }

      
    explainClick() {
        this.explainNode.active = !this.explainNode.active;
    }

    renderEvent(item: Node, idx: number) {
        let info = this.data.commissionLogs[idx];

        let lbl = find('Label', item);
        // let codeLbl = find('codeLbl', item);

        let name = info.fromNickname;
        let date = info.createAt;
        let num = CommonUtil.weiToEther(info.award).toFixed();

        let dataId = info.isFirstConsume ? "share_desc1" : "share_desc2";

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
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}
