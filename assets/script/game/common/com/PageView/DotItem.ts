import { _decorator, Component, Node, CCInteger, Widget, CCBoolean, UITransform, SpriteFrame, Sprite, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DotItem')
export class DotItem extends Component {
    @property(Sprite)
    private glow: Sprite = null;
    @property(Sprite)
    private icon: Sprite = null;
    @property({
        type: [SpriteFrame],
        tooltip: ""
    })
    private dotframes: SpriteFrame[] = []
    @property(Label)
    private numLb: Label = null;
    private fun: (numIdx: string) => void
    init(num: number, fun: (numIdx: string) => void) {
        this.numLb.string = `${num}`
        this.fun = fun
        const btn = this.getComponent(Button)
        if (btn) btn.clickEvents[0].customEventData = `${num}`
    }

    setSelect(isSelect: boolean) {
        this.glow.node.active = isSelect
        this.icon.spriteFrame = this.dotframes[isSelect ? 1 : 0]
    }

    private dotItemClick(event, dotInd: string) {
        this.fun && this.fun(dotInd)
    }
}

