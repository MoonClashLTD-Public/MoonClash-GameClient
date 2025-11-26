/*
 * @Author: dgflash
 * @Date: 2021-10-12 14:00:43
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 19:06:51
 */

import { Component, Node, NodePool, Vec3 } from 'cc';
import { ViewUtil } from '../../utils/ViewUtil';

class EffectData extends Component {
    type: string = null!;
}

  
export class EffectSingleCase {
    private static _instance: EffectSingleCase;
    public static get instance(): EffectSingleCase {
        if (this._instance == null) {
            this._instance = new EffectSingleCase();
        }
        return this._instance;
    }

    private effects: Map<string, NodePool> = new Map();

    /** 
       
  
  
  
     */
    show(name: string, parent: Node, pos?: Vec3): Node {
        var np = this.effects.get(name);
        if (np == null) {
            np = new NodePool();
            this.effects.set(name, np);
        }

        var node: Node;
        if (np.size() == 0) {
            node = ViewUtil.createPrefabNode(name);
            node.addComponent(EffectData).type = name;
        }
        else {
            node = np.get()!;
        }
        node.parent = parent;
        if (pos) node.position = pos;

        return node;
    }

    /**
       
  
  
     */
    put(node: Node) {
        var name = node.getComponent(EffectData)!.type;
        var np = this.effects.get(name);
        if (np) {
            np.put(node);
        }
    }

    /**
       
  
     */
    clear(name?: string) {
        if (name) {
            var np = this.effects.get(name)!;
            np.clear();
        }
        else {
            this.effects.forEach(np => {
                np.clear();
            });
            this.effects.clear();
        }
    }
}