export class AStarNode {
    public x: number;      
    public y: number;      
    public f: number;      
    public g: number;      
    public h: number;      
    public walkable: boolean = true;
    public parent: AStarNode;
    public costMultiplier: number = 1.0;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class AStarGrid {
    private _startNode: AStarNode;      
    private _endNode: AStarNode;        
    private _nodes: Array<Array<AStarNode>>;    
    private _numCols: number;      
    private _numRows: number; // y

    public constructor(numCols: number, numRows: number) {
        this._numCols = numCols;
        this._numRows = numRows;
        this._nodes = [];

        for (let i: number = 0; i < numCols; i++) {
            this._nodes[i] = [];
            for (let j: number = 0; j < numRows; j++) {
                this._nodes[i][j] = new AStarNode(i, j);
            }
        }
    }

    public getNode(x: number, y: number): AStarNode {
        return this._nodes[x][y];
    }

    public setEndNode(x: number, y: number) {
        this._endNode = this._nodes[x][y];
    }

    public setStartNode(x: number, y: number) {
        this._startNode = this._nodes[x][y];
    }

    public setWalkable(x: number, y: number, value: boolean) {
        this._nodes[x][y].walkable = value;
    }

    public get endNode() {
        return this._endNode;
    }

    public get numCols() {
        return this._numCols;
    }

    public get numRows() {
        return this._numRows;
    }

    public get startNode() {
        return this._startNode;
    }
}

export class AStar {
    private _open: Array<AStarNode>;                 
    private _closed: Array<AStarNode>;               
    private _grid: AStarGrid;                 
    private _endNode: AStarNode;                    
    private _startNode: AStarNode;                  
    private _path: Array<AStarNode>;                 
    private _heuristic: Function;              
    private _straightCost: number = 1.0;       
    private _diagCost: number = Math.SQRT2;    
    private _useSlant: boolean = true;		  


    public constructor() {
        this._heuristic = this.manhattan;
        // this._heuristic = this.euclidian;
        // this._heuristic = this.diagonal;
    }

      
    public findPath(grid: AStarGrid): boolean {
        this._grid = grid;
        this._open = [];
        this._closed = [];

        this._startNode = this._grid.startNode;
        this._endNode = this._grid.endNode;

        this._startNode.g = 0;
        this._startNode.h = this._heuristic(this._startNode);
        this._startNode.f = this._startNode.g + this._startNode.h;

        return this.search();
    }

      
    public search(): boolean {
        var node: AStarNode = this._startNode;
        while (node != this._endNode) {
            var startX = Math.max(0, node.x - 1);
            var endX = Math.min(this._grid.numCols - 1, node.x + 1);
            var startY = Math.max(0, node.y - 1);
            var endY = Math.min(this._grid.numRows - 1, node.y + 1);

            for (var i = startX; i <= endX; i++) {
                for (var j = startY; j <= endY; j++) {
                      
                    if (i != node.x && j != node.y && !this._useSlant) {
                        continue;
                    }

                    var test: AStarNode = this._grid.getNode(i, j);
                    if (test == node ||
                        !test.walkable ||
                        !this._grid.getNode(node.x, test.y).walkable ||
                        !this._grid.getNode(test.x, node.y).walkable) {
                        continue;
                    }

                    var cost: number = this._straightCost;
                    if (!((node.x == test.x) || (node.y == test.y))) {
                        cost = this._diagCost;
                    }
                    var g = node.g + cost * test.costMultiplier;
                    var h = this._heuristic(test);
                    var f = g + h;
                    if (this.isOpen(test) || this.isClosed(test)) {
                        if (test.f > f) {
                            test.f = f;
                            test.g = g;
                            test.h = h;
                            test.parent = node;
                        }
                    }
                    else {
                        test.f = f;
                        test.g = g;
                        test.h = h;
                        test.parent = node;
                        this._open.push(test);
                    }
                }
            }
            this._closed.push(node);
            if (this._open.length == 0) {
                console.log("AStar >> no path found");
                return false
            }

            // let openLen = this._open.length;
            // for (let m = 0; m < openLen; m++) {
            //     for (let n = m + 1; n < openLen; n++) {
            //         if (this._open[m].f > this._open[n].f) {
            //             let temp = this._open[m];
            //             this._open[m] = this._open[n];
            //             this._open[n] = temp;
            //         }
            //     }
            // }
            this._open.sort((a, b) => {
                return a.f - b.f;
            })

            node = this._open.shift() as AStarNode;
        }
        this.buildPath();
        return true;
    }

      
    private buildPath(): void {
        this._path = new Array();
        var node: AStarNode = this._endNode;
        this._path.push(node);
        while (node != this._startNode) {
            node = node.parent;
            this._path.unshift(node);
        }
    }

    public get path() {
        return this._path;
    }

      
    private isOpen(node: AStarNode): boolean {
        for (var i = 0; i < this._open.length; i++) {
            if (this._open[i] == node) {
                return true;
            }
        }
        return false;
    }

      
    private isClosed(node: AStarNode): boolean {
        for (var i = 0; i < this._closed.length; i++) {
            if (this._closed[i] == node) {
                return true;
            }
        }
        return false;
    }

      
    private manhattan(node: AStarNode) {
        return Math.abs(node.x - this._endNode.x) * this._straightCost + Math.abs(node.y + this._endNode.y) * this._straightCost;
    }

      
    private euclidian(node: AStarNode) {
        var dx = node.x - this._endNode.x;
        var dy = node.y - this._endNode.y;
        return Math.sqrt(dx * dx + dy * dy) * this._straightCost;
    }

      
    private diagonal(node: AStarNode) {
        var dx = Math.abs(node.x - this._endNode.x);
        var dy = Math.abs(node.y - this._endNode.y);
        var diag = Math.min(dx, dy);
        var straight = dx + dy;
        return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
    }

    public get visited() {
        return this._closed.concat(this._open);
    }
}
