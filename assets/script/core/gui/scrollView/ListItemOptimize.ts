import {
    Color,
    color,
    Component,
    Node,
    NodeEventType,
    Rect,
    Renderable2D,
    UIOpacity,
    UITransform,
    Vec3,
    _decorator,
} from "cc";
import { oops } from "../../Oops";

const { ccclass, property, menu } = _decorator;

  
@ccclass
@menu("tool/ListItemOptimize")
export default class ListItemOptimize extends Component {
    /* ***************private*************** */
    private _temp1_color = color();
    private _worldPos = new Vec3();
    /* --------------------------------segmentation-------------------------------- */
    onLoad() {
        // this._event_update_opacity();
        // this._worldPos = this.node.getWorldPosition();
          
        // {
        //     // this.node.on(NodeEventType.TRANSFORM_CHANGED, this._event_update_opacity, this);
        // }
    }
    update() {
        if (!this._worldPos.equals(this.node.getWorldPosition())) {
            this._worldPos = this.node.getWorldPosition();
            this._event_update_opacity();
        }
    }

    onEnable() {
        this._event_update_opacity();
        this._worldPos = this.node.getWorldPosition();
    }

      
      
    private _get_bounding_box_to_world(node_: Node): Rect {
        let _ui_transform = node_.getComponent(UITransform);
        let width = _ui_transform.contentSize.width;
        let height = _ui_transform.contentSize.height;
        let rect = new Rect(
            node_.getWorldPosition().x - _ui_transform.anchorPoint.x * width,
            node_.getWorldPosition().y - _ui_transform.anchorPoint.y * height,
            width,
            height
        );
        return rect;
    }
      
    private _check_collision(node_: Node): boolean {
        // let rect1 = this._get_bounding_box_to_world(this.node.parent.parent);
        let rect1 = this._get_bounding_box_to_world(oops.gui.guide);   
        let rect2 = this._get_bounding_box_to_world(node_);
          
        {
            rect1.width += rect1.width * 0.5;
            rect1.height += rect1.height * 0.5;
            rect1.x -= rect1.width * 0.25;
            rect1.y -= rect1.height * 0.25;
        }
        return rect1.intersects(rect2);
    }
      
    private set_node_opacity(node_: Node, opacity_n_: number): void {
        let rander_comp = node_.getComponent(Renderable2D);
        if (rander_comp) {
            Color.copy(this._temp1_color, rander_comp.color);
            this._temp1_color.a = opacity_n_;
            rander_comp.color = this._temp1_color;
        } else {
            (node_.getComponent(UIOpacity) || node_.addComponent(UIOpacity)).opacity = opacity_n_;
        }
    }
      
    private _event_update_opacity(): void {
        this.set_node_opacity(this.node, this._check_collision(this.node) ? 255 : 0);
    }
}

  
Renderable2D.prototype.updateAssembler = function updateAssembler(render: any) {
    if (this._renderDataFlag) {
        this._assembler!.updateRenderData(this, render);
        this._renderDataFlag = false;
    }
    if (render._pOpacity > 0 && this._renderFlag) {
        this._render(render);
    }
}