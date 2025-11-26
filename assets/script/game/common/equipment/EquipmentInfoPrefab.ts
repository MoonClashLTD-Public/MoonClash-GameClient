import { _decorator, Component, Node, UITransform, Size, Layout, instantiate, Button, Enum, Event, Vec3, v3, tween, NodeEventType, Input, EventTouch, v2, ScrollView, find, Widget } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { EquipmentInfoPos } from './EquipmentInfoPos';
import { EquipmentPrefab, EquipPrefabType, EquipPrefabParam } from './EquipmentPrefab';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('EquipmentInfoPrefab')
export class EquipmentInfoPrefab extends Component {
    @property(Layout)
    btnLayout: Layout = null;

    @property(EquipmentPrefab)
    cardInfo: EquipmentPrefab = null;

    @property([Node])
    btns: Node[] = [];

    curBtns: Node[] = [];
    @property(Node)
    touchHide: Node = null;   
    param: EquipInfoPrefabParam;
    tagetNode: Node = null;   
    sv: ScrollView = null;
    get equipmentInfoPos() {
        return this.node.getComponent(EquipmentInfoPos);
    }
      
    autoHidden = true

      
    offsetH = 0

    start() {
        let node = this.node.parent
        node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this, true);
        node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
        this.hide();
    }
    onTouchEnd(event: EventTouch) {
        if (!this.node.active) return
        if (!this.autoHidden) return
        if (!this.node.getComponent(UITransform).hitTest(event.getLocation()))
            this.hide();
    }

    update(deltaTime: number) {
    }

    onDestroy() {
        this.clear();
    }

      
    show(param: EquipInfoPrefabParam, tagetNode?: Node, sv?: ScrollView) {
        this.clear();

        let cardParam: EquipPrefabParam = {
            id: param.id,
            equipPrefabType: param.equipPrefabType ?? EquipPrefabType.Info,
            userOtherGroup: param?.userOtherGroup ?? false
        }
        this.cardInfo.init(cardParam);

        this.param = param;
        for (const btnInfo of param.btns) {
            let btn = instantiate(this.btns[btnInfo.btnColor]);
            btn.active = true;
            this.btnLayout.node.addChild(btn);
            btn.getComponentInChildren(LanguageLabel).dataID = btnInfo.i18nKey;
            btn.getComponent(Button).clickEvents[0].customEventData = btnInfo.cbFlag
            this.curBtns.push(btn);
        }

        if (tagetNode) {
            this.tagetNode = tagetNode;
        }
        if (sv) {
            this.sv = sv;
        }

        this.node.active = true;

        this.updCardInfoSize();

        this.equipmentInfoPos.init();
    }

    hide() {
        this.clear();
        this.node.active = false;
    }

    clear() {
        this.param = null
        this.tagetNode = null;
        this.sv = null;
        this.btns.forEach(btn => btn.active = false);
        this.curBtns.forEach(btn => btn.destroy());
        this.curBtns.length = 0;
    }

    btnClick(event: Event, customEventData: string) {
        this.param?.cb && this.param.cb(event, customEventData);
    }

    updCardInfoSize() {
        this.node.getChildByName("Layout").getComponent(Layout).updateLayout();
        this.node.getComponent(Layout).updateLayout();
        this.scheduleOnce(() => {
            find('/bgNode/bg', this.node).getComponent(Widget).updateAlignment();
            find('/bgNode/Select_glow', this.node).getComponent(Widget).updateAlignment();
        }, 0)
    }
}

  
export enum EquipInfoPrefabBtnColor {
    Blue,
    Green,
    Red,
    Yellow,
}

export interface EquipInfoBtnPrefabInfo {
      
    i18nKey: string;
    btnColor?: EquipInfoPrefabBtnColor
    cbFlag?: string
}

type CbFunc = (event: Event, cbFlag: string) => void;

  
export interface EquipInfoPrefabParam {
      
    id?: number
      
    btns: EquipInfoBtnPrefabInfo[]
      
    cb?: CbFunc
    userOtherGroup?: boolean
    equipPrefabType?: EquipPrefabType
}