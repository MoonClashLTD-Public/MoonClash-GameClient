import { Button, CCInteger, color, Color, Enum, Node, Renderable2D, Sprite, UIOpacity, _decorator } from 'cc';
import { VM } from './ViewModel';
import VMBase from './VMBase';

const { ccclass, property, menu, help } = _decorator;

  
enum CONDITION {
    "==",          
    "!=",          
    ">",           
    ">=",          
    "<",           
    "<=",          
    "range"        
}

enum ACTION {
    NODE_ACTIVE,              
    NODE_VISIBLE,             
    NODE_OPACITY,             
    NODE_COLOR,               
    COMPONENT_CUSTOM,         
    SPRITE_GRAYSCALE,         
    BUTTON_INTERACTABLE,      
}

enum CHILD_MODE_TYPE {
    NODE_INDEX,
    NODE_NAME
}

/**
 * [VM-State]
   
 */
@ccclass
@menu('ModelViewer/VM-State ()')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMState.md')
export default class VMState extends VMBase {
    @property
    watchPath: string = "";

    @property({
        tooltip: ''
    })
    foreachChildMode: boolean = false;

    @property({
        type: Enum(CONDITION),
    })
    condition: CONDITION = CONDITION["=="];

    @property({
        type: Enum(CHILD_MODE_TYPE),
        tooltip: '',
        visible: function () { return this.foreachChildMode === true }
    })
    foreachChildType: CHILD_MODE_TYPE = CHILD_MODE_TYPE.NODE_INDEX;

    @property({
        displayName: 'Value: a',
        visible: function () { return this.foreachChildMode === false }
    })
    valueA: number = 0;

    @property({
        displayName: 'Value: b',
        visible: function () { return this.foreachChildMode === false && this.condition === CONDITION.range }
    })
    valueB: number = 0;

    @property({
        type: Enum(ACTION),
        tooltip: ''
    })
    valueAction: ACTION = ACTION.NODE_ACTIVE;

    @property({
        visible: function () { return this.valueAction === ACTION.NODE_OPACITY },
        range: [0, 255],
        type: CCInteger,
        displayName: 'Action Opacity'
    })
    valueActionOpacity: number = 0;

    @property({
        visible: function () { return this.valueAction === ACTION.NODE_COLOR },
        displayName: 'Action Color'
    })
    valueActionColor: Color = color(155, 155, 155);

    @property({
        visible: function () { return this.valueAction === ACTION.COMPONENT_CUSTOM },
        displayName: 'Component Name'
    })
    valueComponentName: string = '';

    @property({
        visible: function () { return this.valueAction === ACTION.COMPONENT_CUSTOM },
        displayName: 'Component Property'
    })
    valueComponentProperty: string = '';

    @property({
        visible: function () { return this.valueAction === ACTION.COMPONENT_CUSTOM },
        displayName: 'Default Value'
    })
    valueComponentDefaultValue: string = '';

    @property({
        visible: function () { return this.valueAction === ACTION.COMPONENT_CUSTOM },
        displayName: 'Action Value'
    })
    valueComponentActionValue: string = '';

    @property({
        type: [Node],
        tooltip: ''
    })
    watchNodes: Node[] = [];

    onLoad() {
        super.onLoad();
          
        if (this.watchNodes.length == 0) {
            if (this.valueAction !== ACTION.NODE_ACTIVE && this.foreachChildMode === false) {
                this.watchNodes.push(this.node);
            }
            this.watchNodes = this.watchNodes.concat(this.node.children);
        }
    }

    start() {
        if (this.enabled) {
            this.onValueInit();
        }
    }

      
    protected onValueInit() {
        let value = VM.getValue(this.watchPath);
        this.checkNodeFromValue(value);
    }

      
    protected onValueChanged(newVar: any, oldVar: any, pathArr: any[]) {
        this.checkNodeFromValue(newVar);
    }

      
    private checkNodeFromValue(value: any) {
        if (this.foreachChildMode) {
            this.watchNodes.forEach((node, index) => {
                let v = (this.foreachChildType === CHILD_MODE_TYPE.NODE_INDEX) ? index : node.name;
                let check = this.conditionCheck(value, v);
                  
                this.setNodeState(node, check);
            })
        }
        else {
            let check = this.conditionCheck(value, this.valueA, this.valueB);
            this.setNodesStates(check);
        }
    }

      
    private setNodesStates(checkState?: boolean) {
        let nodes = this.watchNodes;
        let check = checkState;
        nodes.forEach((node) => {
            this.setNodeState(node, check);
        })
    }

      
    private setNodeState(node: Node, checkState?: boolean) {
        let n = this.valueAction;
        let check = checkState;
        switch (n) {
            case ACTION.NODE_ACTIVE:
                node.active = check ? true : false;
                break;
            case ACTION.NODE_VISIBLE: {
                let opacity = node.getComponent(UIOpacity);
                if (opacity == null)
                    opacity = node.addComponent(UIOpacity);

                if (opacity) {
                    opacity.opacity = check ? 255 : 0;
                    break;
                }
            }
            case ACTION.NODE_OPACITY: {
                let opacity = node.getComponent(UIOpacity);
                if (opacity == null)
                    opacity = node.addComponent(UIOpacity);

                if (opacity) {
                    opacity.opacity = check ? this.valueActionOpacity : 255;
                    break;
                }
            }
            case ACTION.NODE_COLOR: {
                let renderable2D = node.getComponent(Renderable2D);
                if (renderable2D) {
                    renderable2D.color = check ? this.valueActionColor : color(255, 255, 255);
                    break;
                }
            }
            case ACTION.COMPONENT_CUSTOM:
                let comp: any = node.getComponent(this.valueComponentName);
                if (comp == null) return;
                if (this.valueComponentProperty in comp) {
                    comp[this.valueComponentProperty] = check ? this.valueComponentActionValue : this.valueComponentDefaultValue;
                }
                break;
            case ACTION.SPRITE_GRAYSCALE: {
                let sprite = node.getComponent(Sprite);
                if (sprite) {
                    sprite.grayscale = check!;
                    break;
                }
            }
            case ACTION.BUTTON_INTERACTABLE: {
                let sprite = node.getComponent(Button);
                if (sprite) {
                    sprite.interactable = check!;
                    break;
                }
            }
            default:
                break;
        }
    }

      
    private conditionCheck(v: any, a: any, b?: any): boolean {
        let cod = CONDITION;
        switch (this.condition) {
            case cod["=="]:
                if (v == a) return true;
                break;
            case cod["!="]:
                if (v != a) return true;
                break;
            case cod["<"]:
                if (v < a) return true;
                break;
            case cod[">"]:
                if (v > a) return true;
                break;
            case cod[">="]:
                if (v >= a) return true;
                break;
            case cod["<"]:
                if (v < a) return true;
                break;
            case cod["<="]:
                if (v <= a) return true;
                break;
            case cod["range"]:
                if (v >= a && v <= b) return true;
                break;
            default:
                break;
        }

        return false;
    }
}
