import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingMask')
export class LoadingMask extends Component {
    @property(Node)
    private loading: Node | null = null;

    private loading_rotate: number = 0;
    public onAdded(params: any = {}) {
    }
    
    public onRemoved() {
    }

    update(dt: number) {
        this.loading_rotate += dt * 220;
        this.loading!.setRotationFromEuler(0, 0, -this.loading_rotate % 360)
        if (this.loading_rotate > 360) {
            this.loading_rotate -= 360;
        }
    }
}

