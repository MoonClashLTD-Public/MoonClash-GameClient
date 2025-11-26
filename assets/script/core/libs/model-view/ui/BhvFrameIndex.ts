import { CCInteger, Component, error, Sprite, SpriteFrame, _decorator } from "cc";

const { ccclass, property, executeInEditMode, requireComponent, menu } = _decorator;

@ccclass
@executeInEditMode
@requireComponent(Sprite)
@menu("")
export default class BhvFrameIndex extends Component {
    @property({
        type: [SpriteFrame],
        tooltip: ''
    })
    spriteFrames: Array<SpriteFrame | null> = [null];

    @property({
        type: CCInteger,
        tooltip: ''
    })
    get index() {
        return this._index;
    }
    set index(value: number) {
        if (value < 0) return;
        this._index = value % this.spriteFrames.length;
        let sprite = this.node.getComponent(Sprite)!;
          
        sprite.spriteFrame = this.spriteFrames[this._index];
    }

    @property
    private _index: number = 0;

      
    setName(name: string) {
        let index = this.spriteFrames.findIndex(v => { return v!.name == name });
        if (index < 0) { error('frameIndex:', name) }
        this.index = index || 0;
    }

      
    random(min?: number, max?: number) {
        if (!this.spriteFrames) return;
        let frameMax = this.spriteFrames.length;
        if (min == null || min < 0) min = 0;
        if (max == null || max > frameMax) max = frameMax;

        this.index = Math.floor(Math.random() * (max - min) + min);
    }

    next() {
        this.index++;
    }

    previous() {
        this.index--;
    }
}
