import { _decorator, Component, Node, Label } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import TableGlobalConfig from '../common/table/TableGlobalConfig';
import { DataEvent } from '../data/dataEvent';
import { PlayerManger } from '../data/playerManager';
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
import { HOME_EVENT } from './HomeEvent';
import HttpHome from '../common/net/HttpHome';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { netChannel } from '../common/net/NetChannelManager';
const { ccclass, property } = _decorator;

@ccclass('HomeTopCost')
export class HomeTopCost extends Component {
    @property(Label)
    bnbLbl: Label = null;
    @property(Label)
    dnaLbl: Label = null;
    @property(Label)
    dggLbl: Label = null;
    @property(Label)
    jifenLbl: Label = null;
    @property(Node)
    boundBoxRedPoint: Node = null;
    @property(Node)
    affBoxRedPoint: Node = null;
    @property(Node)
    qaRedPoint: Node = null;
    qaData: sgame.GetQuestionResp = null;
    @property(Node)
    tvGameRedPoint: Node = null;
    start() {
        this.updCostInfo();
        this.DATA_BOUNDBOXPTS_CHANGE();
        this.DATA_AFFBOXPTS_CHANGE();
        this.qaUpd();
        this.tvGameUpd();
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }
    update(deltaTime: number) {
    }

    settingClick() {
        oops.gui.open(UIID.SettingPopUp);
    }

    updCostInfo() {
        this.bnbLbl.string = `${CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(CurrType.BNB))}`;
        this.dggLbl.string = `${CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(CurrType.GDGG))}`;
        this.dnaLbl.string = `${CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(CurrType.GDNA))}`;
        this.jifenLbl.string = `${PlayerManger.getInstance().playerSelfInfo.assistPts}`;
    }

    shareClick() {
        oops.gui.open(UIID.SharePopUp);
    }

    qaClick() {
        oops.gui.open(UIID.QAUI, this.qaData);
    }

    boundBoxClick() {
        Message.dispatchEvent(HOME_EVENT.CLICK_BOUNDBOX);
    }

    affBoxClick() {
        Message.dispatchEvent(HOME_EVENT.CLICK_AFFBOX);
    }

    tvGameClick() {
        netChannel.home.reqUnique(opcode.OpCode.CsCreateTVGameReq, opcode.OpCode.ScCreateTVGameResp, pkgcs.CsCreateTVGameReq.create())
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScQuestionResultPush}`, this.ScQuestionResultPush, this);

        Message.on(DataEvent.DATA_ASSISTPTS_CHANGE, this.DATA_ASSISTPTS_CHANGE, this);
        Message.on(DataEvent.DATA_CURRENCY_CHANGE, this.DATA_CURRENCY_CHANGE, this);
        Message.on(DataEvent.DATA_BOUNDBOXPTS_CHANGE, this.DATA_BOUNDBOXPTS_CHANGE, this);
        Message.on(DataEvent.DATA_AFFBOXPTS_CHANGE, this.DATA_AFFBOXPTS_CHANGE, this);
        Message.on(DataEvent.HIDE_QA_BTN, this.HIDE_QA_BTN, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScQuestionResultPush}`, this.ScQuestionResultPush, this);

        Message.off(DataEvent.DATA_ASSISTPTS_CHANGE, this.DATA_ASSISTPTS_CHANGE, this);
        Message.off(DataEvent.DATA_CURRENCY_CHANGE, this.DATA_CURRENCY_CHANGE, this);
        Message.off(DataEvent.DATA_BOUNDBOXPTS_CHANGE, this.DATA_BOUNDBOXPTS_CHANGE, this);
        Message.off(DataEvent.DATA_AFFBOXPTS_CHANGE, this.DATA_AFFBOXPTS_CHANGE, this);
        Message.off(DataEvent.HIDE_QA_BTN, this.HIDE_QA_BTN, this);
    }

    DATA_CURRENCY_CHANGE(event: string) {
        this.updCostInfo();
    }

    DATA_ASSISTPTS_CHANGE(event: string) {
        this.updCostInfo();
    }

    DATA_BOUNDBOXPTS_CHANGE() {
        let _num = PlayerManger.getInstance().playerSelfInfo.boundBoxPts;
        let _pts = TableGlobalConfig.cfg.bound_box_price;   
        let num = Math.floor(_num / _pts);
        this.boundBoxRedPoint.parent.active = num > 0;
        this.boundBoxRedPoint.active = num > 0;
        this.boundBoxRedPoint.getComponentInChildren(Label).string = `${num}`
    }

    DATA_AFFBOXPTS_CHANGE() {
        let _num = PlayerManger.getInstance().playerSelfInfo.affBoxPts;   
        this.affBoxRedPoint.parent.active = _num > 0;
        this.affBoxRedPoint.active = _num > 0;
        this.affBoxRedPoint.getComponentInChildren(Label).string = `${_num}`
    }

    HIDE_QA_BTN() {
        this.qaRedPoint.parent.active = false;
    }

    qaUpd() {
        this.qaData = null;
        this.qaRedPoint.parent.active = false;
        this.qaRedPoint.active = false;
        HttpHome.getQuestion()
            .then((d: sgame.GetQuestionResp) => {
                if (d.state == core.GameQuestionState.GameQuestionStateNone) {
                    this.qaRedPoint.parent.active = d.title != "";
                    this.qaData = d;
                }
                if (d) PlayerManger.getInstance().cardManager.questionArgs = d.args;
            }).catch(async (e: { code: errcode.ErrCode, data: sgame.GetQuestionResp }) => {
                if (e.code == errcode.ErrCode.Ok) {
                } else if (e.code == errcode.ErrCode.QuestionTodayCompleted) {   
                }
                if (e?.data?.args) PlayerManger.getInstance().cardManager.questionArgs = e.data.args;
            });
    }

    ScQuestionResultPush(event: string, data: pkgsc.ScQuestionResultPush) {
        if (data?.args) PlayerManger.getInstance().cardManager.questionArgs = data.args;
        oops.gui.open<AlertParam>(UIID.Alert, {
            content: LanguageData.getLangByIDAndParams("qa_desc_succ", [{
                key: "coin",
                value: `${CommonUtil.weiToEtherStr(data.dna)}`
            },]),
            okCB: () => { }
        })
    }

    tvGameUpd() {
          
        this.tvGameRedPoint.parent.active = PlayerManger.getInstance().playerSelfInfo.isUmpire;;
        this.tvGameRedPoint.active = false;
    }
}

