export namespace AStar16 {
    export class Node {
        public x: number;      
        public y: number;      
        public f: number;      
        public g: number;      
        public h: number;      
        public walkable: boolean = true;
        public parent: Node;
        public costMultiplier: number = 1.0;

        public constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    export class Grid {
        private _startNode: Node;      
        private _endNode: Node;        
        private _nodes: Array<Array<Node>>;    
        private _numRows: number; // x
        private _numCols: number;      

        public constructor(numRows: number, numCols: number) {
            this._numRows = numRows;
            this._numCols = numCols;
            this._nodes = [];

            for (let i: number = 0; i < numRows; i++) {
                this._nodes[i] = [];
                for (let j: number = 0; j < numCols; j++) {
                    this._nodes[i][j] = new Node(i, j);
                }
            }
        }

        public getNode(x: number, y: number): Node {
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
        public setCostMultiplier(x: number, y: number, value: number) {
            this._nodes[x][y].costMultiplier = value;
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
        private _open: Array<Node>;                 
        private _closed: Array<Node>;               
        private _grid: Grid;                        
        private _endNode: Node;                    
        private _startNode: Node;                  
        private _path: Array<Node>;                 
        private _heuristic: Function;              
        private _straightCost: number = 1.0;       
        private _diagCost: number = Math.SQRT2;    
        private _diagCost2: number = 2.236;    
        private _useSlant: boolean = true;		  


        public constructor() {
            this._heuristic = this.manhattan;
            // this._heuristic = this.euclidian;
            // this._heuristic = this.diagonal;
        }

          
        public findPath(grid: Grid): boolean {
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
            var node: Node = this._startNode;
            while (node != this._endNode) {
                let surroundNodes = this.getSurroundNodes(node);
                for (let index = 0; index < surroundNodes.length; index++) {
                    let test = surroundNodes[index];
                    if (test == node ||
                        !test.walkable ||
                        !this._grid.getNode(node.x, test.y).walkable ||
                        !this._grid.getNode(test.x, node.y).walkable) {
                        continue;
                    }

                    var cost: number = this._straightCost;
                    if (!((node.x == test.x) || (node.y == test.y))) {
                        if ((node.x + 2 == test.x) || (node.y + 2 == test.y) || (node.x - 2 == test.x) || (node.y - 2 == test.y)) {
                            cost = this._diagCost2;
                        } else {
                            cost = this._diagCost;
                        }
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

                this._closed.push(node);
                if (this._open.length == 0) {
                    console.log("AStar >> no path found");
                    return false
                }

                this._open.sort((a, b) => {
                    return a.f - b.f;
                })

                node = this._open.shift() as Node;
            }
            this.buildPath();
            return true;
        }

          
        private getSurroundNodes(node: Node): Array<Node> {
            let surround: Array<Node> = new Array<Node>();
            let x: number = 0;
            let y: number = 0;

              
            let up: Node = null;
            x = node.x;
            y = node.y - 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                up = this._grid.getNode(x, y);
                if (up.walkable && !this.isClosed(up)) {
                    surround.push(up);
                }
            }
              
            let down: Node = null;
            x = node.x;
            y = node.y + 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                down = this._grid.getNode(x, y);
                if (down.walkable && !this.isClosed(down)) {
                    surround.push(down);
                }
            }
              
            let left: Node = null;
            x = node.x - 1;
            y = node.y;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left = this._grid.getNode(x, y);
                if (left.walkable && !this.isClosed(left)) {
                    surround.push(left);
                }
            }
              
            let right: Node = null;
            x = node.x + 1;
            y = node.y;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right = this._grid.getNode(x, y);
                if (right.walkable && !this.isClosed(right)) {
                    surround.push(right);
                }
            }

            if (!this._useSlant) return surround;

              
            let left_up: Node = null;
            x = node.x - 1;
            y = node.y - 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_up = this._grid.getNode(x, y);
                if (left_up.walkable && this._grid.getNode(node.x, node.y - 1).walkable && this._grid.getNode(node.x - 1, node.y).walkable && !this.isClosed(left_up)) {
                    surround.push(left_up);
                }
            }
              
            let right_up: Node = null;
            x = node.x + 1;
            y = node.y - 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_up = this._grid.getNode(x, y);
                if (right_up.walkable && this._grid.getNode(node.x, node.y - 1).walkable && this._grid.getNode(node.x + 1, node.y).walkable && !this.isClosed(right_up)) {
                    surround.push(right_up);
                }
            }
              
            let left_down: Node = null;
            x = node.x - 1;
            y = node.y + 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_down = this._grid.getNode(x, y);
                if (left_down.walkable && this._grid.getNode(node.x, node.y + 1).walkable && this._grid.getNode(node.x - 1, node.y).walkable && !this.isClosed(left_down)) {
                    surround.push(left_down);
                }
            }
              
            let right_down: Node = null;
            x = node.x + 1;
            y = node.y + 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_down = this._grid.getNode(x, y);
                if (right_down.walkable && this._grid.getNode(node.x, node.y + 1).walkable && this._grid.getNode(node.x + 1, node.y).walkable && !this.isClosed(right_down)) {
                    surround.push(right_down);
                }
            }

              
              
            let left_up1: Node = null;
            x = node.x - 2;
            y = node.y - 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_up1 = this._grid.getNode(x, y);
                if (left_up1.walkable && this._grid.getNode(node.x - 1, node.y - 1).walkable && this._grid.getNode(node.x - 1, node.y).walkable && !this.isClosed(left_up1)) {
                    surround.push(left_up1);
                }
            }
              
            let left_up2: Node = null;
            x = node.x - 1;
            y = node.y - 2;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_up2 = this._grid.getNode(x, y);
                if (left_up2.walkable && this._grid.getNode(node.x - 1, node.y - 1).walkable && this._grid.getNode(node.x, node.y - 1).walkable && !this.isClosed(left_up2)) {
                    surround.push(left_up2);
                }
            }
              
            let right_up1: Node = null;
            x = node.x + 1;
            y = node.y - 2;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_up1 = this._grid.getNode(x, y);
                if (right_up1.walkable && this._grid.getNode(node.x, node.y - 1).walkable && this._grid.getNode(node.x + 1, node.y - 1).walkable && !this.isClosed(right_up1)) {
                    surround.push(right_up1);
                }
            }
              
            let right_up2: Node = null;
            x = node.x + 2;
            y = node.y - 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_up2 = this._grid.getNode(x, y);
                if (right_up2.walkable && this._grid.getNode(node.x + 1, node.y - 1).walkable && this._grid.getNode(node.x + 1, node.y).walkable && !this.isClosed(right_up2)) {
                    surround.push(right_up2);
                }
            }
              
            let right_down1: Node = null;
            x = node.x + 2;
            y = node.y + 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_down1 = this._grid.getNode(x, y);
                if (right_down1.walkable && this._grid.getNode(node.x + 1, node.y + 1).walkable && this._grid.getNode(node.x + 1, node.y).walkable && !this.isClosed(right_down1)) {
                    surround.push(right_down1);
                }
            }
              
            let right_down2: Node = null;
            x = node.x + 1;
            y = node.y + 2;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                right_down2 = this._grid.getNode(x, y);
                if (right_down2.walkable && this._grid.getNode(node.x + 1, node.y + 1).walkable && this._grid.getNode(node.x, node.y + 1).walkable && !this.isClosed(right_down2)) {
                    surround.push(right_down2);
                }
            }
              
            let left_down1: Node = null;
            x = node.x - 1;
            y = node.y + 2;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_down1 = this._grid.getNode(x, y);
                if (left_down1.walkable && this._grid.getNode(node.x - 1, node.y + 1).walkable && this._grid.getNode(node.x, node.y + 1).walkable && !this.isClosed(left_down1)) {
                    surround.push(left_down1);
                }
            }
              
            let left_down2: Node = null;
            x = node.x - 2;
            y = node.y + 1;
            if (x >= 0 && x < this._grid.numRows && y >= 0 && y < this._grid.numCols) {
                left_down2 = this._grid.getNode(x, y);
                if (left_down2.walkable && this._grid.getNode(node.x - 1, node.y).walkable && this._grid.getNode(node.x - 1, node.y + 1).walkable && !this.isClosed(left_down2)) {
                    surround.push(left_down2);
                }
            }

            return surround;
        }

          
        private buildPath(): void {
            this._path = new Array();
            var node: Node = this._endNode;
            this._path.push(node);
            while (node != this._startNode) {
                node = node.parent;
                this._path.unshift(node);
            }
        }

        public get path() {
            return this._path;
        }

          
        private isOpen(node: Node): boolean {
            for (var i = 0; i < this._open.length; i++) {
                if (this._open[i] == node) {
                    return true;
                }
            }
            return false;
        }

          
        private isClosed(node: Node): boolean {
            for (var i = 0; i < this._closed.length; i++) {
                if (this._closed[i] == node) {
                    return true;
                }
            }
            return false;
        }


          
        private manhattan(node: Node) {
            return Math.abs(node.x - this._endNode.x) * this._straightCost + Math.abs(node.y + this._endNode.y) * this._straightCost;
        }

          
        private euclidian(node: Node) {
            var dx = node.x - this._endNode.x;
            var dy = node.y - this._endNode.y;
            return Math.sqrt(dx * dx + dy * dy) * this._straightCost;
        }

          
        private diagonal(node: Node) {
            var dx = Math.abs(node.x - this._endNode.x);
            var dy = Math.abs(node.y - this._endNode.y);
            var diag = Math.min(dx, dy);
            var straight = dx + dy;
            return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
        }
    }
}