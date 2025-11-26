import { Node } from "cc";
import { BattleZIndex } from "./cmps/BattleZIndex";

enum BATTLEZINDEX {   
    skillUp = -10,   
    skillDown = 10,   
    underground = 1000,   
    floor = 0,
    fly = -1000,   
    magic = -10000,
    fighterTop = -100000,
}

export class BattleZIndexManager {
    private static instance: BattleZIndexManager;
    public static getInstance(): BattleZIndexManager {
        if (!BattleZIndexManager.instance) {
            BattleZIndexManager.instance = new BattleZIndexManager();
        }
        return BattleZIndexManager.instance;
    }

    baseNode: Node

    init(node: Node) {
        this.baseNode = node;
    }
    reset() {
        if (this.baseNode)
            this.baseNode.destroyAllChildren();
    }
    destroy() {
        this.baseNode = null;
    }
      
    addFighterTop(node: Node, isFly: boolean) {
          
        this.baseNode.addChild(node);
        let z = node.getComponent(BattleZIndex) || node.addComponent(BattleZIndex);
        z.zIndex = isFly ? BATTLEZINDEX.fighterTop - 1 : BATTLEZINDEX.fighterTop + 1;
    }
    delFighterTop(node: Node, isFly: boolean) {
          
        node.destroy();
    }

      
    addFighter(node: Node, isFly: boolean, isMagic: boolean) {
          
        this.baseNode.addChild(node);
        let z = node.getComponent(BattleZIndex) || node.addComponent(BattleZIndex);
        z.zIndex = isFly ? BATTLEZINDEX.fly : BATTLEZINDEX.floor;
        if (isMagic) {
            z.zIndex = BATTLEZINDEX.magic;
        }
    }
    delFighter(node: Node, isFly: boolean) {
          
        node.destroy();
    }

      
    addSkill(node: Node, defY: number, isUp: boolean, isUndergrond: boolean) {
          
        this.baseNode.addChild(node);
        let z = node.getComponent(BattleZIndex) || node.addComponent(BattleZIndex);
        if (isUndergrond) {
            z.zIndex = BATTLEZINDEX.underground;
        } else {
            z.zIndex = isUp ? BATTLEZINDEX.skillUp : BATTLEZINDEX.skillDown;
        }
        z.defY = defY;
    }

    delSkill(node: Node) {
        node.destroy();
    }

    update(dt: number) {
        this.setChildrenNodeSortByZIndex(this.baseNode);
    }

      
    private setChildrenNodeSortByZIndex(parent: Node): void {
        if (!parent) {
            return;
        }

        let children = parent.children.concat();
        children.sort((a, b): number => {
            let az = a.getComponent(BattleZIndex);
            let bz = b.getComponent(BattleZIndex);
            let zIndexA = 0;
            let zIndexB = 0;
            if (az.defY >= 0) {
                zIndexA = Number(az.defY * 10 + az.zIndex);
            } else {
                zIndexA = Number(a.position.y * 10 + az.zIndex);
            }
            if (bz.defY >= 0) {
                zIndexB = Number(bz.defY * 10 + bz.zIndex);
            } else {
                zIndexB = Number(b.position.y * 10 + bz.zIndex);
            }
            if (isNaN(zIndexA)) zIndexA = 0;
            if (isNaN(zIndexB)) zIndexB = 0;
            return zIndexB - zIndexA;
        });
        let maxIndex = children.length;
        for (const node of children) {
            node.setSiblingIndex(maxIndex);
        }
    }
}