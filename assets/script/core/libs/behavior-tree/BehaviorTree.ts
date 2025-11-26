import { log } from 'cc';
import { BTreeNode } from './BTreeNode';
import { IControl } from './IControl';

var countUnnamed = 0;

  
export class BehaviorTree implements IControl {
    private title: string;

      
    private _root: BTreeNode;
      
    private _current!: BTreeNode;
      
    private _started: boolean = false;
      
    private _blackboard: any;

    public get started(): boolean {
        return this._started;
    }

    public constructor(node: BTreeNode, blackboard?: any) {
        countUnnamed += 1;
        this.title = node.constructor.name + '(btree_' + (countUnnamed) + ')';
        this._root = node;
        this._blackboard = blackboard;
    }

    public setObject(obj: any) {
        this._blackboard = obj;
    }

    public run() {
        if (this._started) {
            log('' + this.title + '');
        }

        this._started = true;
        var node = BehaviorTree.getNode(this._root);
        this._current = node;
        node.setControl(this);
        node.start(this._blackboard);
        node.run(this._blackboard);
    }

    public running(node: BTreeNode) {
        this._started = false;
    }

    public success() {
        this._current.end(this._blackboard);
        this._started = false;
    }

    public fail() {
        this._current.end(this._blackboard);
        this._started = false;
    }

    /** ---------------------------------------------------------------------------------------------------- */

    static _registeredNodes: Map<string, BTreeNode> = new Map<string, BTreeNode>();

    static register(name: string, node: BTreeNode) {
        this._registeredNodes.set(name, node);
    }

    static getNode(name: string | BTreeNode): BTreeNode {
        var node = name instanceof BTreeNode ? name : this._registeredNodes.get(name);
        if (!node) {
            throw new Error('The node "' + name + '" could not be looked up. Maybe it was never registered?');
        }
        return node;
    }
}
