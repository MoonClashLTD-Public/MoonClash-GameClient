import { _decorator, Component, Node, UITransform, Size, Layout, instantiate, Button, Enum, Event, Vec3, v3, tween, NodeEventType, Input, EventTouch, v2, ScrollView, find, Widget, log } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { CardInfoPos } from './CardInfoPos';
import { CardPrefab, CardPrefabParam, CardPrefabType } from './CardPrefab';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('CardInfoPrefab')
export class CardInfoPrefab extends Component {
    @property(Layout)
    btnLayout: Layout = null;

    @property(CardPrefab)
    cardInfo: CardPrefab = null;

    @property([Node])
    btns: Node[] = [];
    @property(Node)
    touchHide: Node = null;   

    curBtns: Node[] = [];
    param: CardInfoPrefabParam;
    tagetNode: Node = null;   
    sv: ScrollView = null;
    get cardInfoPos() {
        return this.node.getComponent(CardInfoPos);
    }
    start() {
          
          
          
        let node = this.node.parent
        // let node = this.touchHide;
        // node.on(Input.EventType.TOUCH_START, this.onStartEnd, this);
        // node.on(Input.EventType.TOUCH_MOVE, this.onMoveEnd, this);
        node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this, true);
        node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
        this.hide();
    }
    // onStartEnd(event: EventTouch) { event.preventSwallow = true; }
    // onMoveEnd(event: EventTouch) { event.preventSwallow = true; }
    onTouchEnd(event: EventTouch) {
        // event.preventSwallow = true;
        if (!this.node.active) return
        if (!this.node.getComponent(UITransform).hitTest(event.getLocation()))
            this.hide();
    }
    update(deltaTime: number) {
    }

    onDestroy() {
        this.clear();
    }

      
    show(param: CardInfoPrefabParam, tagetNode?: Node, sv?: ScrollView) {
        this.clear();
        let cardParam: CardPrefabParam = {
            cardPrefabType: param?.cardPrefabType ?? CardPrefabType.None,
        }
        if (param.cardProtoId || param.cardId || param.id || param.card) {
            cardParam = {
                cardProtoId: param.cardProtoId,
                cardId: param.cardId,
                id: param.id,
                card: param.card,
                cardPrefabType: param?.cardPrefabType ?? CardPrefabType.CardInfo,
                userOtherGroup: param?.userOtherGroup ?? false,
                friendCard: param?.friendCard
            }
        }
        this.cardInfo.clearCardSprate();
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

        this.cardInfoPos.init();
    }

    hide() {
        this.clear();
        this.node.active = false;
        this.param?.hideCB && this.param.hideCB();
    }

    clear() {
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
            find('/bgNode/Select_glow', this.node).getComponent(Widget).updateAlignment();
        }, 0)
    }
}

  
export enum CardInfoPrefabBtnColor {
    Blue,
    Green,
    Red,
    Yellow,
}

export interface CardInfoBtnPrefabInfo {
      
    i18nKey: string;
    btnColor?: CardInfoPrefabBtnColor
    cbFlag?: string
}

type CbFunc = (event: Event, cbFlag: string) => void;

  
export interface CardInfoPrefabParam {
      
    id?: number
      
    cardId?: number
      
    cardProtoId?: number
      
    btns: CardInfoBtnPrefabInfo[]
      
    cb?: CbFunc
      
    hideCB?: Function
    cardPrefabType?: CardPrefabType
      
    userOtherGroup?: boolean
    card?: core.ICard
    friendCard?: wafriend.IFriend
}