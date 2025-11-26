/*
 * @Author: dgflash
 * @Date: 2021-08-16 09:34:56
 * @LastEditors: H.Joeson
 * @LastEditTime: 2021-10-27 11:16:29
 */
import { Animation, AnimationClip, EventTouch, instantiate, Node, Prefab, Size, UITransform, v3, Vec3 } from "cc";
import { resLoader } from "../common/loader/ResLoader";

export class ViewUtil {
    /**
       
  
  
  
  
     */
    public static nodeTreeInfoLite(parent: Node, obj?: Map<string, Node>): Map<string, Node> | null {
        let map: Map<string, Node> = obj || new Map();
        let items = parent.children;
        for (let i = 0; i < items.length; i++) {
            let _node = items[i];
            if (_node.name.indexOf(" ") < 0) {
                map.set(_node.name, _node);
            }
            ViewUtil.nodeTreeInfoLite(_node, map);
        }
        return map;
    }

    /**
       
  
  
  
     */
    public static findNodes(reg: RegExp, parent: Node, _nodes?: Array<Node>): Array<Node> {
        let nodes: Array<Node> = _nodes || [];
        let items: Array<Node> = parent.children;
        for (let i = 0; i < items.length; i++) {
            let _name: string = items[i].name;
            if (reg.test(_name)) {
                nodes.push(items[i]);
            }
            ViewUtil.findNodes(reg, items[i], nodes);
        }
        return nodes;
    };

      
    public static calculateASpaceToBSpacePos(a: Node, b: Node, aPos: Vec3): Vec3 {
        var world: Vec3 = a.getComponent(UITransform)!.convertToWorldSpaceAR(aPos);
        var space: Vec3 = b.getComponent(UITransform)!.convertToNodeSpaceAR(world);
        return space;
    }

      
    public static calculateScreenPosToSpacePos(event: EventTouch, space: Node): Vec3 {
        let uil = event.getUILocation();
        let worldPos: Vec3 = v3(uil.x, uil.y);
        let mapPos: Vec3 = space.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
        return mapPos;
    }

      
    public static uniformScale(targetWidth: number, targetHeight: number, defaultWidth: number, defaultHeight: number) {
        var widthRatio = defaultWidth / targetWidth;
        var heightRatio = defaultHeight / targetHeight;
        var ratio;
        widthRatio < heightRatio ? ratio = widthRatio : ratio = heightRatio;
        var size = new Size(Math.floor(targetWidth * ratio), Math.floor(targetHeight * ratio));
        return size;
    }

      
    public static createPrefabNode(name: string): Node {
        var p: Prefab = resLoader.get(name, Prefab)!;
        var n = instantiate(p);
        return n;
    }

      
    public static addNodeAnimation(name: string, node: Node, onlyOne: boolean = true, isDefaultClip: boolean = false) {
        if (!node || !node.isValid) {
            return;
        }

        var anim = node.getComponent(Animation);
        if (anim == null) {
            anim = node.addComponent(Animation);
        }

        var clip = resLoader.get(name, AnimationClip) as AnimationClip;
        if (!clip) {
            return;
        }
        if (onlyOne && anim.getState(clip!.name) && anim.getState(clip!.name).isPlaying) {
            return;
        }

        if (isDefaultClip) {
            anim.defaultClip = clip;
            anim!.play();
            return;
        }

          
        anim.once(Animation.EventType.FINISHED, () => {
            if (anim!.defaultClip) {
                anim!.play();
            }
        }, this);

        if (anim.getState(clip!.name)) {
            anim.play(clip!.name);
            return
        }
        anim.createState(clip, clip!.name);
        anim.play(clip!.name);
    }
}