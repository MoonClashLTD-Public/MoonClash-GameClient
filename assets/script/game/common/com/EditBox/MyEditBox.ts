import { _decorator, Component, Node, EditBox, log, Enum, Label, find, Sprite, EventTouch, CCString } from 'cc';
import { EDITOR } from 'cc/env';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { MySmsCodeItem } from './MySmsCodeItem';
const { ccclass, property, executeInEditMode } = _decorator;
enum EMyEditBoxType {
    None = 0,
    PASSWORD = 1,
    EMAIL = 2,
    SMSCODE = 3,
    LOGIN_PASSWORD = 4,
    GOOGLE_CODE = 5,
}
const defNodeList: EMyEditBoxType[] = [
    EMyEditBoxType.None,
    EMyEditBoxType.EMAIL,
    EMyEditBoxType.GOOGLE_CODE
]
Enum(EMyEditBoxType)

@ccclass('MyEditBox')
@executeInEditMode(true)
export class MyEditBox extends Component {
    @property({ type: EMyEditBoxType, serializable: true, visible: false })
    private _editBoxType: EMyEditBoxType = EMyEditBoxType.None;
    @property({ type: EMyEditBoxType })
    set editBoxType(val: EMyEditBoxType) {
        this._editBoxType = val;
        this.updView();
    }
    get editBoxType() {
        return this._editBoxType;
    }

    @property(CCString)
    private showtitle: string = ''
    @property(CCString)
    private placeholder: string = ""
    @property(Node)
    private defNode: Node = null;
    @property(Node)
    private passwordNode: Node = null;
    @property(Node)
    private smsCodeNode: Node = null;


    @property(LanguageLabel)
    private okTitle: LanguageLabel = null;
    @property(Node)
    private errNode: Node = null;
    @property(LanguageLabel)
    private errTitle: LanguageLabel = null;
    @property(LanguageLabel)
    private errDesc: LanguageLabel = null;
    private inputBox: EditBox = null;
    private placeholderLb: LanguageLabel = null;
      
    private showPwdIcon: Node = null;
    private hidePwdIcon: Node = null;

    private smsCodeItem: MySmsCodeItem = null

    onLoad() {
        this.updView()
    }

    private textChange: Function
    addListener(textChange: Function,) {
        this.textChange = textChange
    }
    addListeners(params: { textChange: Function, btnClick?: IMyEditBoxSendCode }) {
        this.textChange = params?.textChange
        if (params?.btnClick && this.smsCodeItem) {
            this.smsCodeItem.init(params?.btnClick)
        }
    }

    private updView() {
        this.defNode.active = defNodeList.indexOf(this._editBoxType) != -1
        this.passwordNode.active = this._editBoxType == EMyEditBoxType.PASSWORD
            || this._editBoxType == EMyEditBoxType.LOGIN_PASSWORD;
        this.smsCodeNode.active = this._editBoxType == EMyEditBoxType.SMSCODE;
        let showEditbox: EditBox
        if (defNodeList.indexOf(this._editBoxType) != -1) {
            showEditbox = this.defNode.getComponentInChildren(EditBox);
        } else if (this._editBoxType == EMyEditBoxType.PASSWORD || this._editBoxType == EMyEditBoxType.LOGIN_PASSWORD) {
            showEditbox = this.passwordNode.getComponentInChildren(EditBox);
            this.showPwdIcon = find('Buttom_universal_b/icon_visual', this.passwordNode)
            this.hidePwdIcon = find('Buttom_universal_b/icon_invisible', this.passwordNode)
        } else if (this._editBoxType == EMyEditBoxType.SMSCODE) {
            showEditbox = this.smsCodeNode.getComponentInChildren(EditBox);
            this.smsCodeItem = this.smsCodeNode.getComponent(MySmsCodeItem)
        }
        if (showEditbox) {
            this.inputBox = showEditbox
            this.placeholderLb = showEditbox?.placeholderLabel?.getComponent(LanguageLabel);
            this.tooglePwd(null, "true");
        }
        this.setShowTitle()
        this.setPlaceholder()
        this.hideTip()
        const regMap = this.matherMap[this._editBoxType]
        if (regMap?.maxLen) {
            this.inputBox.maxLength = regMap.maxLen
        } else {
            this.inputBox.maxLength = 30
        }
    }

      
    private tooglePwd(event: EventTouch, b?: string) {
        if ((this._editBoxType != EMyEditBoxType.PASSWORD
            && this._editBoxType != EMyEditBoxType.LOGIN_PASSWORD) || !this.inputBox) return
        let currB: boolean
        if (b) {
            currB = Boolean(b)
        } else {
            currB = !(this.inputBox.inputFlag == EditBox.InputFlag.PASSWORD)
        }
        this.inputBox.inputFlag = currB ? EditBox.InputFlag.PASSWORD : EditBox.InputFlag.DEFAULT
        if (this.showPwdIcon) this.showPwdIcon.active = !currB
        if (this.hidePwdIcon) this.hidePwdIcon.active = currB
    }

    private setPlaceholder() {
        if (this.placeholderLb) this.placeholderLb.dataID = this.placeholder;
    }

    private setShowTitle() {
        if (this.okTitle) this.okTitle.dataID = this.showtitle
        if (this.errTitle) this.errTitle.dataID = this.showtitle
    }

    private onEditingBegan() {
        if (this.getInputStr().length == 0) {
            this.openOkTip();
        }
    }
      
    private onEditingEnded() {
        const text = this.getInputStr()
        if (text.length == 0) {
            this.hideTip();
        } else {
            const regMap = this.matherMap[this._editBoxType]
            if (regMap) {
                let ok = true
                const errReg = regMap.errV
                if (errReg) ok = !errReg.test(text)
                if (ok) ok = regMap.v.test(text)
                ok ? this.openOkTip() : this.openErrTip(regMap.errDataID || 'error')
                // if (regMap.v.test(text)) {
                //     this.openOkTip();
                // } else {
                //     this.openErrTip(regMap.errDataID || 'error');
                // }
            }
        }
        this.textChange && this.textChange(text)
    }

    private onTextChange(text: string, editbox, customEventData) {
        // if (this._editBoxType != EMyEditBoxType.None) {
        //     if (text.length == 0) {
        //         this.hideTip()
        //     } else {
        //         const regMap = this.matherMap[this._editBoxType]
        //         if (regMap) {
        //             if (regMap.v.test(text)) {
        //                 this.openOkTip();
        //             } else {
        //                 this.openErrTip(regMap.errDataID || 'error');
        //             }
        //         }
        //     }
        // }
        // this.textChange && this.textChange(text)
    }

    private showErr = false

    private openErrTip(str: string) {
        if (this.okTitle) this.okTitle.node.active = false;
        if (this.errNode) this.errNode.active = true;
        if (this.errDesc) this.errDesc.dataID = str;
        this.showErr = true
    }

    private openOkTip() {
        if (this.okTitle) this.okTitle.node.active = true;
        if (this.errNode) this.errNode.active = false;
        this.showErr = false
    }
    private hideTip() {
        if (this.okTitle) this.okTitle.node.active = false;
        if (this.errNode) this.errNode.active = false;
        this.showErr = false
    }

    isShowErr() {
        return this.showErr
    }

    getInputStr() {
        return this.inputBox?.string || ''
    }

    setInputStr(str: string) {
        let inputStr = str ?? ''
        if (this.inputBox && inputStr.trim().length != 0) {
            this.inputBox.string = str
            this.openOkTip()
        }
    }

    setInputMatherStr(str: string) {
        let inputStr = str ?? ''
        if (this.inputBox && inputStr.trim().length != 0) {
            this.inputBox.string = str
            this.onEditingEnded()
        }
    }

    get isMather() {
        return (this.getInputStr().length > 0 && !this.showErr)
    }

    private matherMap: { [num: number]: IMatherData } = {
        [EMyEditBoxType.EMAIL]:
            { v: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, errDataID: 'input_btm_err_email' },
          
        // [EMyEditBoxType.PASSWORD]:
        //     { v: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-,_./'";:<>{\[}\]|\\~`^()]).{8,15}$/, errDataID: 'input_btm_err_pwd', maxLen: 15 }
          
        // [EMyEditBoxType.PASSWORD]:
        // { v: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,15}$/, errDataID: 'input_btm_err_pwd', maxLen: 15 }

        [EMyEditBoxType.PASSWORD]:
            { v: /^.{8,15}$/, errDataID: 'input_btm_err_pwd', maxLen: 15 },
        [EMyEditBoxType.SMSCODE]:
            { v: /^.{1,8}$/, errDataID: 'input_btm_err_smscode', maxLen: 8, errV: /\x20/g },
        [EMyEditBoxType.GOOGLE_CODE]:
            { v: /^\d{6}$/, errDataID: 'input_btm_err_googlecode', maxLen: 6 }

          
        // [EMyEditBoxType.PASSWORD]:
        //     { v: /^.{8,}$/, errDataID: 'input_btm_err_pwd', errV: /\x20/g }
    }

}
interface IMatherData {
    v: RegExp
    errDataID?: string
    maxLen?: number

    errV?: RegExp
}

export interface IMyEditBoxSendCode {
    canClick?: () => Promise<boolean>
    sendCode?: Function
    autoCode?: boolean
}

