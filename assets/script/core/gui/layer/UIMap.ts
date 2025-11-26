import { LayerManager } from "./LayerManager";

  
class TreeNode {
    public id!: number;
      
    public pid!: number;
      
    public parent: TreeNode | null = null;
      
    public child: Array<TreeNode> = [];
      
    public name!: string;
      
    public panel!: string;
}

  
export class UIMap {
    private manager!: LayerManager;

    private nodes: Map<number, TreeNode> = new Map<number, TreeNode>();

      
    init(manager: LayerManager, data: any) {
        this.manager = manager;

          
        for (var key in data) {
            var d = data[key];
            var n = new TreeNode();
            n.id = parseInt(key);
            n.pid = d.parent;
            n.name = d.name;
            n.panel = d.panel;
            this.nodes.set(n.id, n);
        }

          
        this.nodes.forEach((value: TreeNode, key: number) => {
            value.parent = this.nodes.get(value.pid)!;
            if (value.parent)
                value.parent.child.push(value);
        });
    }

      
    pathFinding(startId: number, endId: number) {
        var start: TreeNode = this.nodes.get(startId)!;
        var end: TreeNode = this.nodes.get(endId)!;

        var close: Array<TreeNode> = this.findUp(start);
        var open: Array<TreeNode> = this.findUp(end);

        close.forEach(value => {
            this.manager.remove(value.id, true);
        });

        open.forEach(value => {
            this.manager.open(value.id);
        });

        return { paths_close: close, paths_open: open };
    }

      
    private findUp(start: TreeNode): TreeNode[] {
        var paths = [];
        var current: TreeNode = start;
        while (current.parent != null) {          
            paths.push(current);
            current = current.parent!;
        }
        return paths;
    }

    release() {
        this.nodes.clear();
    }
}
