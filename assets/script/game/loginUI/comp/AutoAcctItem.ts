import { _decorator, Component, log, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AutoAcctItem')
export class AutoAcctItem extends Component {
    @property(Label)
    email: Label = null
    private config: IInitAutoAccItem
    init(params: IInitAutoAccItem) {
        this.email.string = params?.email ?? ''
        this.config = params
    }

    deleteClick() {
        this.config && this.config.delCb && this.config.delCb()
    }

    chooseClick() {
        this.config && this.config.cb && this.config.cb()
    }
}

export interface IInitAutoAccItem {
    idx: number,
    email: string,
    delCb: Function,
    cb: Function
}

