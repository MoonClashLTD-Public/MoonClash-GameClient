import {
    Color,
    color,
    Component,
    error,
    mat4,
    Mat4,
    Node,
    Rect,
    Renderable2D,
    ScrollView,
    UIOpacity,
    UITransform,
    _decorator,
} from "cc";

const { ccclass, property, menu } = _decorator;

  
@ccclass
@menu("tool/ListOptimize")
export default class ListOptimize extends Component {
    /* ***************private*************** */
    private _scroll_view: ScrollView;
    private _ui_transform: UITransform;
    private _temp1_color = color();
    private _temp1_m4 = mat4();
    private _temp2_m4 = mat4();
    /* --------------------------------segmentation-------------------------------- */
    onLoad() {
        this._scroll_view = this.node.getComponent(ScrollView);
        this._ui_transform = this.node.getComponent(UITransform);
        if (!this._scroll_view) {
            error("");
            return;
        }
        this._event_update_opacity();
          
        {
            this.node.on(ScrollView.EventType.SCROLLING, this._event_update_opacity, this);
            this._scroll_view.content.on(
                Node.EventType.CHILD_REMOVED,
                this._event_update_opacity,
                this
            );
            this._scroll_view.content.on(
                Node.EventType.CHILD_ADDED,
                this._event_update_opacity,
                this
            );
        }
    }
      
      
    private _get_bounding_box_to_world(node_: Node): Rect {
        node_.getWorldMatrix(this._temp2_m4);
        Mat4.fromRTS(
            this._temp1_m4,
            this.node.getRotation(),
            this.node.getPosition(),
            this.node.getScale()
        );
        let width = this._ui_transform.contentSize.width;
        let height = this._ui_transform.contentSize.height;
        let rect = new Rect(
            -this._ui_transform.anchorPoint.x * width,
            -this._ui_transform.anchorPoint.y * height,
            width,
            height
        );
        Mat4.multiply(this._temp2_m4, this._temp2_m4, this._temp1_m4);
        rect.transformMat4(this._temp2_m4); // query child's BoundingBox
        return rect;
    }
      
    private _check_collision(node_: Node): boolean {
        let rect1 = this._get_bounding_box_to_world(this._scroll_view.content.parent);
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
        this._scroll_view.content.children.forEach(v1 => {
            this.set_node_opacity(v1, this._check_collision(v1) ? 255 : 0);
        });
    }
}