import { CCFloat, Component, game, Game, Graphics, Mask, UITransform, _decorator } from 'cc';
const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = _decorator;

@ccclass('RoundRectMask')
@executeInEditMode(true)
@disallowMultiple(true)
@requireComponent(Mask)
@menu('')
export class RoundRectMask extends Component {
      
    @property({ type: CCFloat, tooltip: '' })
    private propRadius: number = 50;

    mask: Mask | null = null;

    public get radius(): number {
        return this.propRadius;
    }

    public set radius(r: number) {
        this.propRadius = r;
        this.updateMask(r);
    }

    protected onEnable(): void {
        this.mask = this.getComponent(Mask);
        this.updateMask(this.radius);
    }

    private updateMask(r: number) {
        let _radius = r >= 0 ? r : 0;
        if (_radius < 1) {
            const uiTransform = this.node.getComponent(UITransform);

            _radius = Math.min(uiTransform?.width || 0, uiTransform?.width || 0) * _radius;
        }

        if (this.mask) {
            // @ts-ignore.
            this.mask['radius'] = _radius;
            // @ts-ignore.
            this.mask['onDraw'] = this.onDraw.bind(this.mask);
            this.mask['_updateGraphics'] = this._updateGraphics.bind(this.mask);
            this.mask.type = Mask.Type.RECT;
        }
    }

    private _updateGraphics() {
        // @ts-ignore.
        let graphics = this._graphics;
        if (!graphics) {
            return;
        }
        this.onDraw(graphics);
    }

    /**
  
  
     * @param graphics
     */
    protected onDraw(graphics: Graphics) {
        const uiTransform = this.node.getComponent(UITransform) as UITransform;

        graphics.clear();
        let width = uiTransform.width;
        let height = uiTransform.height;
        let x = -width * uiTransform.anchorX;
        let y = -height * uiTransform.anchorY;
        graphics.roundRect(x, y, width, height, this.radius || 0);
        if (game.renderType === Game.RENDER_TYPE_CANVAS) {
            graphics.stroke();
        }
        else {
            graphics.fill();
        }
    }
}
