
// const vec3_temps: Vec3[] = [];
// for (let i = 0; i < 4; i++) {
//     vec3_temps.push(new Vec3());
// }

import { IAssembler, IRenderData, Renderable2D, RenderData, Sprite, SpriteFrame, v2, Vec2, _decorator } from "cc";

const { ccclass, property, executeInEditMode } = _decorator;

/**
 * @internal
 */
export class StaticVBChunk {
    // public ib: Uint16Array;
    constructor(
        public vertexAccessor: any, //StaticVBAccessor,
        public bufferId: number,
        public vertexOffset: number,
        public vb: Float32Array,
        indexCount: number,
    ) {
        // this.ib = new Uint16Array(indexCount);
    }
    // setIndexBuffer (indices: ArrayLike<number>) {
    //     assertIsTrue(indices.length === this.ib.length);
    //     for (let i = 0; i < indices.length; ++i) {
    //         const vid = indices[i];
    //         this.ib[i] = this.vertexOffset + vid;
    //     }
    // }
}


/**
  
   
 */
class ShadowAssembler implements IAssembler {

    createData(sprite: Sprite) {
        const renderData = sprite.requestRenderData();
        renderData.dataLength = 2;
        renderData.resize(4, 6);
        return renderData;
    }

    updateRenderData(sprite: Sprite) {
        const frame = sprite.spriteFrame;

        // TODO: Material API design and export from editor could affect the material activation process
        // need to update the logic here
        // if (frame) {
        //     if (!frame._original && dynamicAtlasManager) {
        //         dynamicAtlasManager.insertSpriteFrame(frame);
        //     }
        //     if (sprite._material._texture !== frame._texture) {
        //         sprite._activateMaterial();
        //     }
        // }
        // dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        this.updateUVs(sprite);

        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame);
        }
    }

    updateWorldVerts(sprite: Sprite, chunk: StaticVBChunk) {
        const renderData = sprite.renderData!;
        const vData = chunk.vb;

        const dataList: IRenderData[] = renderData.data;
        const node = sprite.node;

        const data0 = dataList[0];
        const data3 = dataList[1];
        const matrix = node.worldMatrix;
        const a = matrix.m00; const b = matrix.m01;
        const c = matrix.m04; const d = matrix.m05;

        const justTranslate = a === 1 && b === 0 && c === 0 && d === 1;

        const tx = matrix.m12; const ty = matrix.m13;
        const vl = data0.x; const vr = data3.x;
        const vb = data0.y; const vt = data3.y;

        if (justTranslate) {
            const vltx = vl + tx;
            const vrtx = vr + tx;
            const vbty = vb + ty;
            const vtty = vt + ty;

            // left bottom
            vData[0] = vltx;
            vData[1] = vbty;
            // right bottom
            vData[9] = vrtx;
            vData[10] = vbty;
            // left top
            vData[18] = vltx;
            vData[19] = vtty;
            // right top
            vData[27] = vrtx;
            vData[28] = vtty;
        } else {
            const al = a * vl; const ar = a * vr;
            const bl = b * vl; const br = b * vr;
            const cb = c * vb; const ct = c * vt;
            const db = d * vb; const dt = d * vt;

            const cbtx = cb + tx;
            const cttx = ct + tx;
            const dbty = db + ty;
            const dtty = dt + ty;

            // left bottom
            vData[0] = al + cbtx;
            vData[1] = bl + dbty;
            // right bottom
            vData[9] = ar + cbtx;
            vData[10] = br + dbty;
            // left top
            vData[18] = al + cttx;
            vData[19] = bl + dtty;
            // right top
            vData[27] = ar + cttx;
            vData[28] = br + dtty;
        }
    }

    fillBuffers(sprite: Sprite, /**renderer: IBatcher*/) {
        if (sprite === null) {
            return;
        }
        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
        }

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;
        ib[indexOffset++] = vid;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 3;
        meshBuffer.indexOffset += 6;

        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    }

    updateVertexData(sprite: Sprite) {
        const renderData: RenderData | null = sprite.renderData;
        if (!renderData) {
            return;
        }

        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const dataList: IRenderData[] = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        let l = 0;
        let b = 0;
        let r = 0;
        let t = 0;
        if (sprite.trim) {
            l = -appX;
            b = -appY;
            r = cw - appX;
            t = ch - appY;
        } else {
            const frame = sprite.spriteFrame!;
            const originSize = frame.originalSize;
            const rect = frame.rect;
            const ow = originSize.width;
            const oh = originSize.height;
            const rw = rect.width;
            const rh = rect.height;
            const offset = frame.offset;
            const scaleX = cw / ow;
            const scaleY = ch / oh;
            const trimLeft = offset.x + (ow - rw) / 2;
            const trimRight = offset.x - (ow - rw) / 2;
            const trimBottom = offset.y + (oh - rh) / 2;
            const trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appX;
            b = trimBottom * scaleY - appY;
            r = cw + trimRight * scaleX - appX;
            t = ch + trimTop * scaleY - appY;
        }

        dataList[0].x = l;
        dataList[0].y = b;

        dataList[1].x = r;
        dataList[1].y = t;

        // dataList[0].x = l;
        // dataList[0].y = b;

        // dataList[1].x = r;
        // dataList[1].y = t;

        renderData.vertDirty = true;
    }

    updateUVs(sprite: Sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;
        vData[3] = uv[0];
        vData[4] = uv[1];
        vData[12] = uv[2];
        vData[13] = uv[3];
        vData[21] = uv[4];
        vData[22] = uv[5];
        vData[30] = uv[6];
        vData[31] = uv[7];
    }

    updateColor(sprite: Sprite) {
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    }
};



@ccclass('ShadowSprite')
@executeInEditMode
export class ShadowSprite extends Renderable2D {
    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;
    @property({ type: SpriteFrame, serializable: true })
    get spriteFrame() {
        return this._spriteFrame;
    }

    set spriteFrame(value) {
        if (!value || this._spriteFrame === value) {
            this._spriteFrame = value;
            return;
        }

        this._spriteFrame = value;

        // let l = -value.width / 2, b = -value.height / 2, t = value.height / 2, r = value.width / 2;
        // this.polygon = [v2(l, b), v2(r, b), v2(r, t), v2(l, t)];

        this.markForUpdateRenderData(false);
        this._applySpriteSize();
    }

    // @property({ type: [Vec2], serializable: true })
    // _polygon: Vec2[] = [];
    // @property({ type: [Vec2], serializable: true })
    // public get polygon() {
    //     return this._polygon;
    // }
    // public set polygon(points: Vec2[]) {
    //     this._polygon = points;
    //     this.markForUpdateRenderData();
    // }

    protected _assembler: IAssembler = null;

    constructor() {
        super();
    }

    onLoad() {
        // this.node['_hitTest'] = this._hitTest.bind(this);
    }

    start() {
        // this.node.on(Node.EventType.TOUCH_START, (e: EventTouch) => {
        //     console.log("click texture plus -");
        // }, this);

        // this.node.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
        //     console.log("click texture plus +");
        //     this.node.setPosition(v3(this.node.position.x + e.getDeltaX(),
        //         this.node.position.y + e.getDeltaY(),
        //         this.node.position.z));
        // }, this);
    }

    // _hitTest(cameraPt: Vec2) {
    //     let node = this.node;
    //     let testPt = _vec2_temp;

    //     node.updateWorldTransform();
    //     // If scale is 0, it can't be hit.
    //     if (!Mat4.invert(_mat4_temp, node.worldMatrix)) {
    //         return false;
    //     }

    //     Vec2.transformMat4(testPt, cameraPt, _mat4_temp);
    //     return SplitHelper.isInPolygon(testPt, this.polygon);
    // }

    private _applySpriteSize() {
        if (this._spriteFrame) {
            const size = this._spriteFrame.originalSize;
            this.node._uiProps.uiTransformComp!.setContentSize(size);
        }

        this._activateMaterial();
    }

    private _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame) {
            if (material) {
                this.markForUpdateRenderData();
            }
        }

        if (this.renderData) {
            this.renderData.material = material;
        }
    }

    protected _render(render: any) {
        render.commitComp(this, this.renderData, this._spriteFrame, this._assembler!);
    }

    protected _canRender() {
        if (!super._canRender()) {
            return false;
        }

        const spriteFrame = this._spriteFrame;
        if (!spriteFrame || !spriteFrame.texture) {
            return false;
        }

        return true;
    }

    protected _flushAssembler(): void {
        if (this._assembler == null) {
            this.destroyRenderData();
            this._assembler = new ShadowAssembler();
        }

        if (!this.renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this.renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                this._updateColor();
            }
        }
    }

    protected updateMaterial() {
        if (this._customMaterial) {
            this.setMaterial(this._customMaterial, 0);
            // this._customMaterial.overridePipelineStates({ priority: 128 }, 0);
            this._blendHash = -1;
            return;
        }
        const mat = this._updateBuiltinMaterial();
        this.setMaterial(mat, 0);
        this._updateBlendFunc();
    }
}