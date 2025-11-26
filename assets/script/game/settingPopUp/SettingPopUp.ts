import { _decorator, Component, Node, Button, EditBox, logID, find, sys, log, game, Label } from 'cc';
import { OPPO } from 'cc/env';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageEvent, LanguageManager } from '../../core/gui/language/Language';
import { Languages } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { config } from '../common/config/Config';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import TableGlobalConfig from '../common/table/TableGlobalConfig';
import { AwsManger } from '../data/awsManger';
import { DataEvent } from '../data/dataEvent';
import { PlayerManger } from '../data/playerManager';
import { STORAGE_ENUM } from '../homeUI/HomeEvent';
import { IInitVerityPwdCfg } from '../loginUI/VerifyPwdPopUp';
const { ccclass, property, type } = _decorator;

@ccclass('SettingPopUp')
export class SettingPopUp extends Component {
    @type(EditBox)
    nameEditBox: EditBox = null;
    @type(List)
    list: List = null;
    @type(Button)
    musicBtn: Button = null;
    @type(Button)
    soundBtn: Button = null;
    @type(Button)
    languageBtn: Button = null;
    @type(Button)
    changePWD: Button = null;
    @type(Button)
    customerServiceBtn: Button = null;
    @type(Button)
    whitePaper: Button = null;
    @type(Button)
    backToLogin: Button = null;
    @type(Button)
    awsBindBtn: Button = null;
    @type(Label)
    IDLabel: Label = null;

    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        this.removeEvent();
    }

    onAdded() {
        this.initID();
        this.initNickname();
        this.updMusicBtn();
        this.updSoundBtn();
        this.updLanBtn();
        this.updBindAwsBtn();  
    }

    initNickname() {
        let editBox = this.nameEditBox;
        editBox.string = PlayerManger.getInstance().playerSelfInfo.nickname;
        editBox.node.on(EditBox.EventType.EDITING_DID_ENDED, this.callback, this);
    }

    callback(editbox: EditBox) {
        let len = CommonUtil.getBytesLength(editbox.string);
        if (len == 0) {
            editbox.string = PlayerManger.getInstance().playerSelfInfo.nickname;
        } else if (len > editbox.maxLength - 6) {
            editbox.string = PlayerManger.getInstance().playerSelfInfo.nickname;
            oops.gui.toast("setting_editbox_tips", true);
        } else if (!CommonUtil.nickNamePrefixLimit(editbox.string)) {
            editbox.string = PlayerManger.getInstance().playerSelfInfo.nickname;
            oops.gui.toast("friend_tips_limit", true);
        } else {
            this.updNickname();
        }
    }

    initID() {
        let IDLabel = this.IDLabel;
        IDLabel.string = PlayerManger.getInstance().playerId + "";
    }

    async updNickname() {
        let data = pkgcs.CsChangeNicknameReq.create();
        data.nickname = this.nameEditBox.string;
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsChangeNicknameReq, opcode.OpCode.ScChangeNicknameResp, data)
        if (d.code == errcode.ErrCode.Ok) {
            PlayerManger.getInstance().playerSelfInfo.nickname = this.nameEditBox.string;
            log(PlayerManger.getInstance().playerId);

            this.initNickname();
        }
    }

    updBindAwsBtn() {
        let btn = this.awsBindBtn;
        let bf = !AwsManger.getInstance().isSoftMfa;
        btn.node.getChildByName("bg_g").active = bf;
        btn.node.getChildByName("bg_r").active = !bf;
        btn.getComponentInChildren(LanguageLabel).dataID = bf ? "setting_verification_bind2" : "setting_verification_bind3";
    }

    bindAwsClick() {
        let bf = AwsManger.getInstance().isSoftMfa;
        oops.gui.open<IInitVerityPwdCfg>(UIID.VerifyPwdPopUp, { binded: bf })
    }

    updMusicBtn() {
        let btn = this.musicBtn;
        let bf = oops.audio.musicVolume > 0;
        btn.node.getChildByName("bg_g").active = bf;
        btn.node.getChildByName("bg_r").active = !bf;
        btn.getComponentInChildren(LanguageLabel).dataID = bf ? 'setting_open' : 'setting_close';
    }

    musicClick() {
        let bf = !(oops.audio.musicVolume > 0);
        oops.audio.musicVolume = bf ? 1 : 0;
        oops.audio.setSwitchMusic(bf);
        oops.audio.save();
        this.updMusicBtn();
    }

    updSoundBtn() {
        let btn = this.soundBtn;
        let bf = oops.audio.effectVolume > 0;
        btn.node.getChildByName("bg_g").active = bf;
        btn.node.getChildByName("bg_r").active = !bf;
        btn.getComponentInChildren(LanguageLabel).dataID = bf ? 'setting_open' : 'setting_close';
    }


    soundClick() {
        let bf = !(oops.audio.effectVolume > 0);
        oops.audio.effectVolume = bf ? 1 : 0;
        oops.audio.setSwitchEffect(bf);
        oops.audio.save();
        this.updSoundBtn();
    }

    updLanBtn() {
        let lang = oops.storage.get(STORAGE_ENUM.language, Languages.EN);
        this.languageBtn.getComponentInChildren(LanguageLabel).dataID = `setting_${lang}`;
    }


    langClick() {
        this.node.getChildByName("lang").active = true;
        this.onAddedLang();
    }

    onAddedLang() {
        this.list.numItems = config.game.language.length;
        let lang = oops.storage.get(STORAGE_ENUM.language, Languages.EN);
        this.list.selectedId = config.game.language.indexOf(lang);
    }

      
    selectedEvent(item: Node, idx: number) {
        let lang = config.game.language[idx];
        oops.storage.set(STORAGE_ENUM.language, lang);
        LanguageManager.instance.setLanguage(lang, () => { });
    }
      
    renderEvent(item: Node, idx: number) {
        let lang = config.game.language[idx];
        find("/Label", item).getComponent(LanguageLabel).dataID = `setting_${lang}`;
    }
    //closeLangUI
    closeLangClick() {
        this.node.getChildByName("lang").active = false;
    }

    addEvent() {
        Message.on(LanguageEvent.CHANGE, this.updLanBtn, this);
        Message.on(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.updBindAwsBtn, this);
    }

    removeEvent() {
        Message.off(LanguageEvent.CHANGE, this.updLanBtn, this);
        Message.off(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.updBindAwsBtn, this);
    }

    changePWDClick() {
        oops.gui.open(UIID.ChangePwdPopUp)
    }

    customerServiceClick() {
        let str = TableGlobalConfig.cfg.customer_service;
        sys.openURL(str);
    }
    whitePaperClick() {
        let str = TableGlobalConfig.cfg.white_paper;
        sys.openURL(str);
    }

    backToLoginClick() {
        PlayerManger.getInstance().returnToLogin()
    }

    bindClick() {
        if (PlayerManger.getInstance().playerSelfInfo.nickname) {
            oops.gui.open(UIID.PwdResetPopUp1);
        } else {
            oops.gui.open(UIID.PwdResetPopUp1);
        }
    }
    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

