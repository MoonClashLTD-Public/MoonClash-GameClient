import { Component, _decorator } from 'cc';
import { VM } from './ViewModel';

const { ccclass, help, executionOrder } = _decorator;

/**
   
   
  
  
  
 */
@ccclass
@executionOrder(-1)
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMParent.md')
export default class VMParent extends Component {
      
    protected tag: string = '_temp';

      
    protected data: any = {};

      
    public VM = VM;

    /**
  
       
     *   ```ts
     *       onLoad(){
     *           super.onLoad();
     *       }
     *   ``` 
     * 
     */
    protected onLoad() {
        if (this.data == null) return;
        this.tag = '_temp' + '<' + this.node.uuid.replace('.', '') + '>';
        VM.add(this.data, this.tag);
        // log(VM['_mvs'],this.tag)
          
        let comps = this.getVMComponents();
        // console.group();
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            this.replaceVMPath(comp, this.tag)
        }
        // console.groupEnd()

        this.onBind();
    }

      
    protected onBind() {

    }

      
    protected onUnBind() {

    }

    private replaceVMPath(comp: Component, tag: string) {
        // @ts-ignore
        let path: string = comp['watchPath'];
        // @ts-ignore
        if (comp['templateMode'] == true) {
            // @ts-ignore
            let pathArr: string[] = comp['watchPathArr'];
            if (pathArr) {
                for (let i = 0; i < pathArr.length; i++) {
                    const path = pathArr[i];
                    pathArr[i] = path.replace('*', tag);
                }
            }

        }
        else {
            // VMLabel
              
            if (path.split('.')[0] === '*') {
                // @ts-ignore
                comp['watchPath'] = path.replace('*', tag);
            }
        }
    }

      
    private getVMComponents() {
        let comps = this.node.getComponentsInChildren('VMBase');
        let parents = this.node.getComponentsInChildren('VMParent').filter(v => v.uuid !== this.uuid);    

          
        let filters: any[] = [];
        parents.forEach((node: Component) => {
            filters = filters.concat(node.getComponentsInChildren('VMBase'));
        })

        comps = comps.filter((v) => filters.indexOf(v) < 0);
        return comps;
    }

    /**
  
       
     * ```ts
     *   onDestroy(){
     *       super.onDestroy();
     *   }
     * ```
     */
    protected onDestroy() {
        this.onUnBind();
          
        VM.remove(this.tag);
        this.data = null;
    }
}
