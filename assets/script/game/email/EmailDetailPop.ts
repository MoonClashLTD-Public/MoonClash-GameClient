import { _decorator, Component, Node, instantiate, Label } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LangLabelParamsItem, LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import HttpHome from '../common/net/HttpHome';
const { ccclass, property } = _decorator;

@ccclass('EmailDetailPop')
export class EmailDetailPop extends Component {
    @property(LanguageLabel)
    title: LanguageLabel = null;
    @property(LanguageLabel)
    content: LanguageLabel = null;
    @property(LanguageLabel)
    countDownLbl: LanguageLabel = null;
    @property(Label)
    dataLbl: Label = null;
    @property(Node)
    cardLayout: Node = null

    async onAdded(mailId: number) {
        if (!this.cardLayout) return
        this.content.dataID = '';
        let data = await HttpHome.mailQuery(mailId);
        if (data) {
            let mail = data.mail;
            this.title.dataID = mail.title;
            this.content.dataID = mail.text;
            let param: LangLabelParamsItem[] = [];
            for (const key in mail.args) {
                if (key.endsWith("_Wei")) {
                    param.push({
                        key: key,
                        value: CommonUtil.weiToEther(mail.args[key]).toFixed(6),
                    })
                } else {
                    param.push({
                        key: key,
                        value: LanguageData.getLangByID(mail.args[key]) ?? mail.args[key],
                    })
                }
            }

            this.content.params = param;
            let d = new Date(mail.createdAt * 1000);
            this.dataLbl.string = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`

            this.countDownLbl.params = [{
                key: "num",
                value: `${Math.floor((mail.expireAt - new Date().getTime() / 1000) / 60 / 60 / 24)}`
            }];
        }
    }

    private onClose() {
        oops.gui.removeByNode(this.node)
    }
}

