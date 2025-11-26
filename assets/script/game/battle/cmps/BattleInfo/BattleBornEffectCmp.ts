import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleBornEffectCmp')
export class BattleBornEffectCmp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    show(cb: Function) {
        this.scheduleOnce(() => {
            cb && cb();
        }, 3)
    }
}

