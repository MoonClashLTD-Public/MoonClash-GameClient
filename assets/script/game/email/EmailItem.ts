import { _decorator, Component, Node, SpriteFrame, Color, Sprite, Label, EventTouch } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
const { ccclass, property } = _decorator;

@ccclass('EmailItem')
export class EmailItem extends Component {
    @property(Sprite)
    private mainBg: Sprite = null
    @property(LanguageLabel)
    private titleLb: LanguageLabel = null
    @property(Label)
    private dateLb: Label = null
    @property([SpriteFrame])
    private bgFrames: SpriteFrame[] = []
    @property([Color])
    private dateColors: Color[] = []


    mail: wamail.IMail = null;
    init(mail: wamail.IMail) {
        this.mail = mail;
        if (mail.state == core.MailState.MailNew) {
            this.mainBg.spriteFrame = this.bgFrames[0]
            this.dateLb.color = this.dateColors[0];
        } else {
            this.mainBg.spriteFrame = this.bgFrames[1]
            this.dateLb.color = this.dateColors[1];
        }

        this.titleLb.dataID = mail.title;
        let d = new Date(mail.createdAt * 1000);
        this.dateLb.string = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
    }

    async itemClick(e: EventTouch, ind: string) {
        oops.gui.open(UIID.EmailDetailPop, this.mail.id)
        if (this.mail.state == core.MailState.MailNew) {
            let d = await HttpHome.mailOp(this.mail.id, 0);
            if (d) {
                this.mail.state = core.MailState.MailRead;
                this.init(this.mail);
            }
        }
    }
}

