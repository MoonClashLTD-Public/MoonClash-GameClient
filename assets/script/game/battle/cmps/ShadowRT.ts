import { _decorator, Component, Node, RenderTexture, Camera, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShadowRT')
export class ShadowRT extends Component {
    // @property(Camera)
    // camara: Camera = null!;
    // @property(Sprite)
    // sprite: Sprite = null!;

    // @property(RenderTexture)
    // private rt: RenderTexture;

    start() {
        // this.refreshRenderTexture(this.node.width, this.node.height);
    }

    update(deltaTime: number) {
    }

      
    refreshRenderTexture(w: number, h: number): void {
        // const colorAttachment = new gfx.ColorAttachment();
        // const depthStencilAttachment = new gfx.DepthStencilAttachment();
        // const pi = new gfx.RenderPassInfo([colorAttachment], depthStencilAttachment, []);

        // this.rt.reset({
        //     width: w,
        //     height: h,
        //     passInfo: pi
        // });

        // let spriteframe: SpriteFrame = this.sprite!.spriteFrame!;
        // let sp: SpriteFrame = new SpriteFrame();
        // sp.reset({
        //     originalSize: spriteframe.originalSize,
        //     rect: spriteframe.rect,
        //     offset: spriteframe.offset,
        //     isRotate: spriteframe.rotated,
        //     borderTop: spriteframe.insetTop,
        //     borderLeft: spriteframe.insetLeft,
        //     borderBottom: spriteframe.insetBottom,
        //     borderRight: spriteframe.insetRight,
        // });

        // this.camera!.targetTexture = this.rt;
        // sp.texture = this.rt;
        // this.sprite!.spriteFrame = sp;
    }
}

