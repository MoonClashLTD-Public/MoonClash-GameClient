import { _decorator, Component, Node, sp, random } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimComp')
export class AnimComp extends Component {
    @property(Node)
    flashNode: Node = null;
    start() {
        for (let index = 0; index < this.flashNode.children.length; index++) {
            const node = this.flashNode.children[index];
            node.active = false;
            let t = Math.random() * 10 + index;
            this.scheduleOnce(() => {
                node.active = true;
            }, t);
        }
    }

    update(deltaTime: number) {

    }
}

