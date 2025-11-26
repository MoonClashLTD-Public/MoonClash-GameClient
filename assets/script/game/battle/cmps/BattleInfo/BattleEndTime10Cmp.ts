import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../core/Oops';
const { ccclass, property } = _decorator;

@ccclass('BattleEndTime10Cmp')
export class BattleEndTime10Cmp extends Component {
    curTime = -1;
    start() {

    }

    update(deltaTime: number) {

    }

    show(time: number) {
        this.node.active = true;
        this.node.children.forEach(e => e.active = false);
        let n = this.node.getChildByName(`Battle_number${time}`)
        if (this.curTime != time && time > 0 && time <= 10)
            oops.audio.playEffect('audios/battle/' + time + '_cd');
        this.curTime = time;
        if (n)
            n.active = true;
    }
    hide() {
        this.curTime = -1;
        this.node.active = false;
    }
}

