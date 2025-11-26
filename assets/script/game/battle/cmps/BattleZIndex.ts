import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleZIndex')
export class BattleZIndex extends Component {

    defY: number = -1;
    zIndex: number = 0;
    start() {

    }

    update(deltaTime: number) {
    }
}

