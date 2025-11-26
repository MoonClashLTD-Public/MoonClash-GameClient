import { BranchNode } from './BranchNode';
import { BTreeNode } from './BTreeNode';

/** 
   
   
 */
export class Sequence extends BranchNode {
    protected _run(obj?: any) {
        if (this._nodeRunning) {
            this._nodeRunning.run(this._blackboard);
        }
        else {
            super._run();
        }
    }

    constructor(nodes: Array<BTreeNode>) {
        super(nodes);
    }

    public success() {
        super.success();

        this._actualTask += 1;
        if (this._actualTask < this.children.length) {
            this._run(this._blackboard);
        }
        else {
            this._control.success();
        }
    }

    public fail() {
        super.fail();
        this._control.fail();
    }
}
