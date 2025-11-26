import { _decorator, Component, Node, CCInteger, Widget, CCBoolean, UITransform, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CCBG')
export class CCBG extends Component {
    @property({
        type: SpriteFrame,
        tooltip: "",
    })
    get glowColorSprite() {
        return this._glowColorSprite;
    }
    set glowColorSprite(val: SpriteFrame) {
        this._glowColorSprite = val;
        this.setOutLineWidth();
    }
    @property({
        type: SpriteFrame,
        tooltip: "",
        visible: false
    })
    _glowColorSprite: SpriteFrame = null

    @property({
        type: CCInteger,
        tooltip: "",
    })
    get outLineWidth() {
        return this._outLineWidth;
    }
    set outLineWidth(val: number) {
        this._outLineWidth = val;
        this.setOutLineWidth();
    }
    @property({
        type: CCInteger,
        tooltip: "",
        visible: false
    })
    _outLineWidth: number = 2

    @property({
        type: CCInteger,
        tooltip: "",
    })
    get glowWidth() {
        return this._glowWidth;
    }
    set glowWidth(val: number) {
        this._glowWidth = val;
        this.setGlowWidth();
    }
    @property({
        type: CCInteger,
        tooltip: "",
        visible: false
    })
    _glowWidth: number = 4

    @property({
        type: CCBoolean,
        tooltip: "",
    })
    get glowTop() {
        return this._glowTop;
    }
    set glowTop(val: boolean) {
        this._glowTop = val;
        this.setGlowWidth()
    }
    @property({
        type: CCBoolean,
        tooltip: "",
        visible: false
    })
    _glowTop = true

    @property({
        type: CCBoolean,
        tooltip: "",
    })
    get glowLeft() {
        return this._glowLeft;
    }
    set glowLeft(val: boolean) {
        this._glowLeft = val;
        this.setGlowWidth()
    }
    @property({
        type: CCBoolean,
        tooltip: "",
        visible: false
    })
    _glowLeft = true

    @property({
        type: CCBoolean,
        tooltip: "",
    })
    get glowRight() {
        return this._glowRight;
    }
    set glowRight(val: boolean) {
        this._glowRight = val;
        this.setGlowWidth()
    }
    @property({
        type: CCBoolean,
        tooltip: "",
        visible: false
    })
    _glowRight = true


    private _defOutLineWidth = 0
    private _defGlowWidth = -9

    setOutLineWidth() {
        const outLineNode = this.node.getChildByName('outline')
        if (outLineNode) {
            if (this._outLineWidth == 0) {
                outLineNode.active = false
            } else {
                outLineNode.active = true
                let w = outLineNode.getComponent(Widget);
                const changeW = this._defOutLineWidth - Math.abs(this._outLineWidth)
                w.left = changeW
                w.right = changeW;
                w.bottom = changeW;
                w.top = changeW
            }
        }

    }

    setGlowWidth() {
        const glowNode = this.node.getChildByName('glow')
        if (glowNode) {
            let w = glowNode.getComponent(Widget);
            if (this.glowColorSprite) {
                const sp = glowNode.getComponent(Sprite)
                if (sp) sp.spriteFrame = this.glowColorSprite
            }
            const changeW = this._glowWidth == 0 ? 0 : this._defGlowWidth - Math.abs(this._glowWidth)
            w.left = this._glowLeft ? changeW : 0
            w.right = this._glowRight ? changeW : -3;
            w.bottom = changeW;
            w.top = this._glowTop ? changeW : 0
        }
    }
}

