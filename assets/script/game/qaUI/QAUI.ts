import { _decorator, Button, Component, EditBox, instantiate, Label, Node } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { BattleEvent } from '../battle/utils/BattleEnum';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import { AudioSoundRes } from '../data/resManger';
import HttpHome from '../common/net/HttpHome';
import { DataEvent } from '../data/dataEvent';
const { ccclass, property } = _decorator;

@ccclass('QAUI')
export class QAUI extends Component {
    @property(Node)
    topicNode: Node = null;
    @property(Node)
    optionsNode: Node = null;
    @property(EditBox)
    editBox: EditBox = null;
    data: sgame.GetQuestionResp = null;
    selIdx = -1;
    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        this.removeEvent();
    }

    public onRemoved() {
    }

    public async onAdded(data: sgame.GetQuestionResp) {
        this.data = data;

        this.optionsNode.children[0].active = false;
        let tmp = this.optionsNode.children[0];

        this.topicNode.getChildByName("content").getComponent(Label).string = data.title;
        // this.topicNode.getChildByName("content").getComponent(Label).string = data.;
        // for (let index = 0; index < this.data.options.length; index++) {
        //     let content = this.data.options[index];
        //     let node = instantiate(tmp);
        //     node.active = true;
        //     node.getChildByName("content").getComponent(Label).string = content;
        //     node.getComponent(Button).clickEvents[0].customEventData = `${index}`;
        //     this.optionsNode.addChild(node);
        // }
    }

    itemClick(event: Event, customEventData: string) {
        this.optionsNode.children.forEach(e => {
            e.getChildByName("Toggle").getChildByName("Checkmark").active = e.getComponent(Button).clickEvents[0].customEventData == customEventData;
        });
        this.selIdx = Number(customEventData);
    }

    async okClick() {
        if (this.editBox.string == "") {
            oops.gui.toast('qa_tips_edit', true);
            return;
        }

        // let pattern = /[^a-zA-Z0-9]/,

        HttpHome.answerQuestion(this.data.id, this.editBox.string)
            .then((d: sgame.AnswerQuestionResp) => {
                oops.gui.toast('_err_4001', true);
                Message.dispatchEvent(DataEvent.HIDE_QA_BTN);
                this.close();
            }).catch(async (e: { code: errcode.ErrCode, data: sgame.AnswerQuestionResp }) => {
                if (e.code == errcode.ErrCode.QuestionAnswerTrue) {
                    Message.dispatchEvent(DataEvent.HIDE_QA_BTN);
                    this.close();
                } else if (e.code == errcode.ErrCode.QuestionAnswerFailed) {
                    Message.dispatchEvent(DataEvent.HIDE_QA_BTN);
                    this.close();
                } else if (e.code == errcode.ErrCode.QuestionTodayCompleted) {
                    oops.gui.toast('_err_4000', true);
                    Message.dispatchEvent(DataEvent.HIDE_QA_BTN);
                    this.close();
                } else if (e.code == errcode.ErrCode.QuestionNoQuestions) {
                }
            });
    }


    private addEvent() {
        Message.on(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.on(BattleEvent.ENTER, this.BattleEnter, this);
        // Message.on(BattleEvent.QUIT, this.BattleQuit, this);
    }
    private removeEvent() {
        Message.off(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.off(BattleEvent.ENTER, this.BattleEnter, this);
    }

    BattleEnter() {
        this.close();
    }

    ScBattleEnterPush(event: string, data: pkgsc.ScBattleEnterPush) {
          
        if (data.code != errcode.ErrCode.Ok) {
            oops.audio.playEffect(AudioSoundRes.matchSucc);
            this.close();
        }
    }

    close() {
        oops.gui.remove(UIID.QAUI);
    }
}