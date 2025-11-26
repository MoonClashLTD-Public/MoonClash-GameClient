/*
 * @Author: dgflash
 * @Date: 2022-02-10 09:50:41
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-08 17:22:27
 */

import { Component, gfx, macro, Material, MeshRenderer, utils, Vec3, _decorator } from 'cc';
const { ccclass, property } = _decorator;

  
@ccclass('DrawSectorMesh')
export class DrawMeshSector extends Component {
    @property({ type: Material })
    public mat: Material | null = null;

    @property({
        tooltip: ""
    })
    public radius: number = 5;

    @property({
        tooltip: ""
    })
    public innerRadius: number = 1;

    @property({
        tooltip: ""
    })
    public angledegree: number = 60;

    start() {
        this.createMesh()
    }

    createMesh() {
        const model = this.addComponent(MeshRenderer)!;
        const segments: number = Math.floor(this.angledegree / 4) + 1;                          

        var positions: number[] = [];                                                           

          
        var vertices_count: number = segments * 2 + 2;                                          
        var vertices: Array<Vec3> = new Array<Vec3>(vertices_count);
        var angleRad: number = this.angledegree * macro.RAD;                                    
        var angleCur: number = angleRad;
        var angledelta: number = angleRad / segments;                                           
        for (var i = 0; i < vertices_count; i += 2) {                                           
            var cosA: number = Math.cos(angleCur);
            var sinA: number = Math.sin(angleCur);

            vertices[i] = new Vec3(this.radius * cosA, 0, this.radius * sinA);                  
            vertices[i + 1] = new Vec3(this.innerRadius * cosA, 0, this.innerRadius * sinA);    
            angleCur -= angledelta;

            positions.push(vertices[i].x);
            positions.push(vertices[i].y);
            positions.push(vertices[i].z);
            positions.push(vertices[i + 1].x);
            positions.push(vertices[i + 1].y);
            positions.push(vertices[i + 1].z);
        }


          
        var indice_count: number = segments * 6;                                                 
        var indices: Array<number> = new Array<number>(indice_count);
        for (var i = 0, vi = 0; i < indice_count; i += 6, vi += 2) {                             
            indices[i] = vi;
            indices[i + 1] = vi + 3;
            indices[i + 2] = vi + 1;
            indices[i + 3] = vi + 2;
            indices[i + 4] = vi + 3;
            indices[i + 5] = vi;
        }

          
        var uvs: number[] = [];
        for (var i = 0; i < vertices_count; i++) {
            var u = vertices[i].x / this.radius / 2 + 0.5
            var v = vertices[i].z / this.radius / 2 + 0.5
            uvs.push(u, v);
        }

        const primitiveMode = gfx.PrimitiveMode.TRIANGLE_FAN;
        const attributes: any[] = [{
            name: gfx.AttributeName.ATTR_NORMAL,
            format: gfx.Format.RGB32F,
        }];

        var IGeometry = {
            positions: positions,
            indices: indices,
            uvs: uvs,
            primitiveMode: primitiveMode,             
            attributes: attributes                    
        }

        const mesh = utils.createMesh(IGeometry);
        model.mesh = mesh;
        model.material = this.mat;
    }
}
