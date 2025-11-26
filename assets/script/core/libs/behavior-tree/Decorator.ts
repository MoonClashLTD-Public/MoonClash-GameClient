import { BehaviorTree } from './BehaviorTree';
import { BTreeNode } from './BTreeNode';
import { IControl } from './IControl';

/** 
   
   
 */
export class Decorator extends BTreeNode implements IControl {
    public node!: BTreeNode;

    constructor(node?: string | BTreeNode) {
        super()

        if (node)
            this.node = BehaviorTree.getNode(node);
    }

    protected setNode(node: string | BTreeNode) {
        this.node = BehaviorTree.getNode(node)
    }

    public start() {
        this.node.setControl(this);
        this.node.start();
        super.start();
    }

    public end() {
        this.node.end();
    }

    public run(blackboard: any) {
        this.node.run(blackboard);
    }
}
