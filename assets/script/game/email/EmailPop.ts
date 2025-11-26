import { _decorator, Component, Node, Label } from 'cc';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import HttpHome from '../common/net/HttpHome';
import { EmailItem } from './EmailItem';
const { ccclass, property } = _decorator;

@ccclass('EmailPop')
export class EmailPop extends Component {
    @property(List)
    private list: List = null
    @property(Label)
    private totalLbl: Label = null
    @property(Node)
    private noData: Node = null
    private count = 0;
    private total = 0;
    private mails: wamail.IMail[] = [];
    onAdded() {
        if (!this.list || !this.noData) return
        this.init();
    }

    async init() {
        let mails = await HttpHome.mailList(0);
        if (mails) {
            this.totalLbl.string = `${mails.total}/${100}`;
            this.total = mails.total;
            this.count = mails.mails.length;
            this.mails = mails.mails;
        }
        if (this.count == 0) {
            this.noData.active = true
            this.list.node.active = false
        } else {
            this.noData.active = false
            this.list.node.active = true
        }
        this.list.numItems = this.count;
    }

    private onListRender(item: Node, idx: number) {
        let mail = this.mails[idx];
        const emailItem = item.getComponent(EmailItem)
        emailItem?.init(mail)

        if (this.count - 1 == idx && this.count < this.total) {
            this.pageMail(mail.id);
        }
    }

      
    async pageMail(mailId: number = 0) {
        let mails = await HttpHome.mailList(mailId);
        if (mails) {
            this.count += mails.mails.length;
            this.total = mails.total;
            this.mails = this.mails.concat(mails.mails);
            this.list.numItems = this.count;
        }
    }

    private onListPageChange(pageNum: number) {
    }

    private onClose() {
        oops.gui.removeByNode(this.node)
    }

    async opClick(e: Event, custom: string) {
        let d: wamail.MailOpResp = null;
        switch (Number(custom)) {
            case 0:   
                d = await HttpHome.mailOp(0, 0);
                break;
            case 1:   
                d = await HttpHome.mailOp(0, 1);
                break;
            case 2:   
                d = await HttpHome.mailOp(0, 2);
                break;
            default:
                break;
        }
        if (d) {
            this.init();
        }
    }
}

