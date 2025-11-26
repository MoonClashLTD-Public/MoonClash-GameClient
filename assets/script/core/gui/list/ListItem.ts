/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/12/9
 * @doc     Item    .
 *     ：
 *      1、            List        。（            ..）
 * @end
 ******************************************/
const { ccclass, property, disallowMultiple, menu, executionOrder } = _decorator;
import { Node, Component, Enum, Sprite, SpriteFrame, tween, _decorator, EventHandler, Tween, Button, UITransform, Vec3 } from 'cc';
import { DEV } from 'cc/env';
import List from './List';

enum SelectedType {
    NONE = 0,
    TOGGLE = 1,
    SWITCH = 2,
}

@ccclass
@disallowMultiple()
@menu('ui/list/ListItem')
@executionOrder(-5001)            
export default class ListItem extends Component {
      
    @property({ type: Sprite, tooltip: DEV && '' })
    icon: Sprite = null;
      
    @property({ type: Node, tooltip: DEV && '' })
    title: Node = null;
      
    @property({
        type: Enum(SelectedType),
        tooltip: DEV && ''
    })
    selectedMode: SelectedType = SelectedType.NONE;
      
    @property({
        type: Node, tooltip: DEV && '',
        visible() { return this.selectedMode > SelectedType.NONE }
    })
    selectedFlag: Node = null;
      
    @property({
        type: SpriteFrame, tooltip: DEV && '',
        visible() { return this.selectedMode == SelectedType.SWITCH }
    })
    selectedSpriteFrame: SpriteFrame = null;
      
    _unselectedSpriteFrame: SpriteFrame = null;
      
    @property({
        tooltip: DEV && '',
    })
    adaptiveSize: boolean = false;
      
    _selected: boolean = false;
    set selected(val: boolean) {
        this._selected = val;
        Tween
        if (!this.selectedFlag)
            return;
        switch (this.selectedMode) {
            case SelectedType.TOGGLE:
                this.selectedFlag.active = val;
                break;
            case SelectedType.SWITCH:
                let sp: Sprite = this.selectedFlag.getComponent(Sprite);
                if (sp) {
                    sp.spriteFrame = val ? this.selectedSpriteFrame : this._unselectedSpriteFrame;
                }
                break;
        }
    }
    get selected() {
        return this._selected;
    }
      
    private _btnCom: any;
    get btnCom() {
        if (!this._btnCom)
            this._btnCom = this.node.getComponent(Button);
        return this._btnCom;
    }
      
    public list: List;
      
    private _eventReg = false;
      
    public listId: number;

    onLoad() {
          
        // if (!this.btnCom)
        //     this.selectedMode == SelectedType.NONE;
          
        if (this.selectedMode == SelectedType.SWITCH) {
            let com: Sprite = this.selectedFlag.getComponent(Sprite);
            this._unselectedSpriteFrame = com.spriteFrame;
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
    }

    _registerEvent() {
        if (!this._eventReg) {
            if (this.btnCom && this.list.selectedMode > 0) {
                this.btnCom.clickEvents.unshift(this.createEvt(this, 'onClickThis'));
            }
            if (this.adaptiveSize) {
                this.node.on(Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
            }
            this._eventReg = true;
        }
    }

    _onSizeChange() {
        this.list._onItemAdaptive(this.node);
    }
    /**
     *         
     * @param {cc.Component} component         
     * @param {string} handlerName             
     * @param {cc.Node} node         node（              component.node）
     * @returns cc.Component.EventHandler
     */
    createEvt(component: Component, handlerName: string, node: Node = null) {
        if (!component.isValid)
            return;  
        component['comName'] = component['comName'] || component.name.match(/\<(.*?)\>/g).pop().replace(/\<|>/g, '');
        let evt = new EventHandler();
        evt.target = node || component.node;
        evt.component = component['comName'];
        evt.handler = handlerName;
        return evt;
    }

    showAni(aniType: number, callFunc: Function, del: boolean) {
        let t: any = this;
        let twe: Tween<Node>;
        let ut: UITransform = t.node.getComponent(UITransform);
        switch (aniType) {
            case 0:   
                twe = tween(t.node)
                    .to(.2, { scale: new Vec3(.7, .7) })
                    .by(.3, { position: new Vec3(0, ut.height * 2) });
                break;
            case 1:   
                twe = tween(t.node)
                    .to(.2, { scale: new Vec3(.7, .7) })
                    .by(.3, { position: new Vec3(ut.width * 2, 0) });
                break;
            case 2:   
                twe = tween(t.node)
                    .to(.2, { scale: new Vec3(.7, .7) })
                    .by(.3, { position: new Vec3(0, ut.height * -2) });
                break;
            case 3:   
                twe = tween(t.node)
                    .to(.2, { scale: new Vec3(.7, .7) })
                    .by(.3, { position: new Vec3(ut.width * -2, 0) });
                break;
            default:   
                twe = tween(t.node)
                    .to(.3, { scale: new Vec3(.1, .1) });
                break;
        }

        if (callFunc || del) {
            twe.call(() => {
                if (del) {
                    t.list._delSingleItem(t.node);
                    for (let n: number = t.list.displayData.length - 1; n >= 0; n--) {
                        if (t.list.displayData[n].id == t.listId) {
                            t.list.displayData.splice(n, 1);
                            break;
                        }
                    }
                }
                callFunc();
            });
        }
        twe.start();
    }

    onClickThis() {
        this.list.selectedId = this.listId;
    }

}