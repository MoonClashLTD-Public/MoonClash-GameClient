import { _decorator, Component, Node, Label, Slider, log, find, Sprite, Color, UITransform, Input, EventTouch, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KProgressBar')
export class KProgressBar extends Component {
    @property(Label)
    private needPropLb: Label = null
    @property(Node)
    private sliders: Node = null;
    @property(Node)
    private moveNode: Node = null;
    @property(Node)
    private tagNode: Node = null
    @property([Color])
    private colors: Color[] = []
    private cCount = 0
    private _progress = 0
    private _moveTfm: UITransform
    private canMove = false
    private seekBgs: Node[] = []
    private seekSprites: Sprite[] = []
    private minNum = 0;   
    private maxNum = 60;   
    private curNum = 60;   
    private changeCB: (curNum: number) => void = null;   

    init(param: IInitKProgressBar) {
        this.minNum = param.minNum ?? 0;
        this.maxNum = param.maxNum ?? 60;
        this.curNum = param.curNum ?? this.minNum;
        this.changeCB = param.changeCB;
        this.setProgressPer(this.curNum / this.maxNum);
    }
    onLoad() {
        this.moveNode?.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.moveNode?.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.moveNode?.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.moveNode?.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.cCount = this.sliders?.children?.length || 0
        this.sliders?.children.forEach((c, ind) => {
            const _ccbg = find('ccbg', c)
            const _seek = find('seek', c)?.getComponent(Sprite)
            if (_ccbg) this.seekBgs.push(_ccbg)
            if (_seek) this.seekSprites.push(_seek)
        });
        this._moveTfm = this.moveNode?.getComponent(UITransform)

        this.setProgressPer(1)
    }
    onDestroy() {
        // this.moveNode?.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        // this.moveNode?.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.moveNode?.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.moveNode?.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    protected onTouchStart(event: EventTouch) {
        if (this._moveTfm) this.canMove = true
    }
    protected onTouchMove(event: EventTouch) {
        if (this.canMove && this._moveTfm) {
            const _moveTfm = this._moveTfm
            const _pos = event.getUILocation();
            const _cPos = _moveTfm.convertToNodeSpaceAR(v3(_pos.x, _pos.y))
            const x = Math.min(Math.max(_cPos.x, 0), _moveTfm.width)
            let _currInd = Math.ceil(x / _moveTfm.width * this.cCount)
            if (this._progress != _currInd) {
                this._progress = _currInd
                this.setProgress(this._progress)
            }
            if (this.tagNode) this.tagNode.setPosition(v3(x, this.tagNode.getPosition().y))
        }
    }
    protected onTouchEnd(event: EventTouch) {
        if (this.canMove && this._moveTfm) {
            this.canMove = false
            const _moveTfm = this._moveTfm
            const _pos = event.getUILocation();
            const _cPos = _moveTfm.convertToNodeSpaceAR(v3(_pos.x, _pos.y))
            const x = Math.min(Math.max(_cPos.x, 0), _moveTfm.width)
            let _currInd = Math.ceil(x / _moveTfm.width * this.cCount)
            this._progress = _currInd
            this.setProgress(this._progress)
        } else {
            this.canMove = false
        }
    }

    setProgressPer(progress: number) {
        if (progress > 1 || progress < 0) return
        this._progress = Math.floor(progress * this.cCount)
        this.setProgress(this._progress)
    }

      
    private setProgress(progress: number) {
        this.seekSprites.forEach((seek, idx) => {
            const currInd = idx + 1
            const actived = progress != 0 && progress >= currInd
            seek.color = actived ? this.colors[0] : this.colors[1]
            if (this.seekBgs.length > idx) this.seekBgs[idx].active = actived
        })
        if (!this.canMove && this.tagNode) {
            if (progress == 0) {
                this.tagNode.setPosition(v3(0, this.tagNode.getPosition().y))
            } else {
                if (this.cCount >= progress) {
                    const node = this.sliders.children[progress - 1]
                    const trfm = node.getComponent(UITransform)
                    this.tagNode.setWorldPosition(node.getWorldPosition().add(new Vec3(trfm.width / 2, trfm.height / 2)))
                }
            }
        }
        let diff = this.maxNum - this.minNum;
        this.curNum = this.minNum + Math.ceil(diff * progress / this.cCount);
        if (this.needPropLb) this.needPropLb.string = `${this.curNum}`;
        this.changeCB && this.changeCB(this.curNum);
    }

    getCurNum() {
        return this.curNum;
    }

    getCurPer() {
        return this._progress / this.cCount;
    }
}

export interface IInitKProgressBar {
      
    curNum?: number
      
    minNum?: number
      
    maxNum?: number
      
    changeCB?: (curNum: number) => void
}

