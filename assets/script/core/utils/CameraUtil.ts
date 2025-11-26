import { Camera, Vec3, view } from "cc";

export class CameraUtil {
    /**
       
  
  
     * @returns 
     */
    public static isInView(camera: Camera, worldPos: Vec3) {
        var cameraPos = camera.node.getWorldPosition();
        var viewPos = camera.worldToScreen(worldPos);
        var dir = Vec3.normalize(new Vec3(), worldPos.subtract(cameraPos));
        var forward = camera.node.forward;
        var dot = Vec3.dot(forward, dir);

        const viewportRect = view.getViewportRect();

          
        if (dot > 0
              
            && (viewPos.x <= viewportRect.width) && (viewPos.x >= 0)
            && (viewPos.y <= viewportRect.height) && (viewPos.y >= 0))
            return true;
        else
            return false;
    }
}