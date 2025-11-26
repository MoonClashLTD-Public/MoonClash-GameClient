import { Node, Quat, toRadian, Vec3 } from "cc";
import { Vec3Util } from "./Vec3Util";

export class RotateUtil {
    /**
       
  
  
  
     */
    public static rotateAround(target: Node, axis: Vec3, rad: number) {
        var quat = new Quat();
        Quat.rotateAround(quat, target.getRotation(), axis.normalize(), rad);
        target.setRotation(quat);
    }

    /**
       
  
  
  
  
  
  
  
  
     */
    public static rotateAroundTarget(lookAt: Node, target: Node, axis: Vec3, rad: number) {
          
        var point_lookAt = lookAt.worldPosition;                 
        var point_target = target.worldPosition;                 
        var quat = new Quat();
        var vec3 = new Vec3();

          
        Quat.fromAxisAngle(quat, axis, rad);
          
        Vec3.subtract(vec3, point_target, point_lookAt);
          
        Vec3.transformQuat(vec3, vec3, quat);
          
        Vec3.add(vec3, point_lookAt, vec3);
        target.setWorldPosition(vec3);

          
        Quat.rotateAround(quat, target.worldRotation, axis, rad);
        Quat.normalize(quat, quat);
        target.setWorldRotation(quat);
    }

    /**
       
  
  
  
  
     */
    public static circularEdgePosition(center: Vec3, radius: number, angle: number): Vec3 {
        let edge = Vec3Util.z.multiplyScalar(radius);                    
        let dir = Vec3Util.sub(edge, center);                            
        let vec3 = new Vec3();
        var quat = new Quat();

          
        Quat.fromAxisAngle(quat, Vec3.UP, toRadian(angle));
          
        Vec3.transformQuat(vec3, dir, quat);
          
        Vec3.add(vec3, center, vec3);

        return vec3;
    }
}