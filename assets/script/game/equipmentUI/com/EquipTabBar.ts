import { _decorator, Component, instantiate, Node, EventTouch, Label, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('EquipTabBar')
export class EquipTabBar extends Component {
    @property(SpriteFrame)
    private nomalBg: SpriteFrame = null
    @property(SpriteFrame)
    private chechedBg: SpriteFrame = null
    @property([Sprite])
    private btnGroupBg: Sprite[] = []
    @property(Label)
    private showNum: Label = null
    private _equipType = core.EquipmentType.EquipmentTypeNone
    private btnAction(event: EventTouch, btnMsg: string) {
        let equipType = core.EquipmentType.EquipmentTypeNone
        switch (btnMsg) {
            case '0':
                equipType = core.EquipmentType.EquipmentTypeNone
                break;
            case '1':
                equipType = core.EquipmentType.EquipmentTypeWeapon
                break;
            case '2':
                equipType = core.EquipmentType.EquipmentTypeShield
                break;
            case '3':
                equipType = core.EquipmentType.EquipmentTypeJewelry
                break;

            default:
                break;
        }
        this.prevType = this._equipType
        this._equipType = equipType
        this.itemClick && this.itemClick(equipType)
        this.upBg()
    }

    private init: EquipTabBarFun
    private itemClick: EquipTabBarFun
    addListener(parms: { init: EquipTabBarFun, itemClick: EquipTabBarFun }) {
        this.init = parms.init
        this.itemClick = parms.itemClick
    }

    start() {
        this.init && this.init(this._equipType)
        this.upBg()
    }

    private prevType = this._equipType
    private upBg() {
        if (this._equipType != this.prevType)
            this.btnGroupBg[this.prevType.valueOf()].spriteFrame = this.nomalBg
        this.btnGroupBg[this._equipType.valueOf()].spriteFrame = this.chechedBg
    }

    get equipType() {
        return this._equipType
    }

    setShowNum(num: number) {
        if (this.showNum) this.showNum.string = num.toString()
    }
}

type EquipTabBarFun = (type: core.EquipmentType) => void

