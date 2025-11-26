import { BranchNode } from './BranchNode';

/** 
   
   
 */
export class Selector extends BranchNode {
    public _run(obj?: any) {
        if (this._nodeRunning) {
            this._nodeRunning.run(this._blackboard);
        }
        else {
            super._run();
        }
    }

    public success() {
        super.success()
        this._control.success();
    }

    public fail() {
        super.fail()

        this._actualTask += 1;
        if (this._actualTask < this.children.length) {
            this._run(this._blackboard);
        }
        else {
            this._control.fail();
        }
    }
}
