import { _decorator, Component, Node, Layout } from 'cc';
import HttpHome from '../../common/net/HttpHome';
import { FriendUI } from '../FriendUI';
import { FriendInfoCardType } from '../widget/FriendInfoCard';
const { ccclass, property, type } = _decorator;

@ccclass('FriendSerachCardComp')
export class FriendSerachCardComp extends Component {
    @type(Layout)
    layout: Layout;
    @property(Node)
    searchFriendNode: Node = null;

    get friendUI() {
        return this.node.parent.getComponent(FriendUI)
    }
    start() {

    }

    update(deltaTime: number) {

    }

    async init(key: string) {
        this.layout.node.destroyAllChildren();

        this.searchFriendNode.active = !!! await this.updSerachInfo(key);
    }

    async updSerachInfo(key: string) {
        this.layout.node.active = true;
        this.layout.node.destroyAllChildren();
        if (!key) return;
        // let dx = await HttpHome.friendshipAdd(Number(key));
        let d = await HttpHome.friendshipSearch(key);
        if (!d) return;
        for (let index = 0; index < d.friends.length; index++) {
            let f = d.friends[index];
            this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.FriendSerach, null)
        }
        return d.friends.length > 0;
    }
}

