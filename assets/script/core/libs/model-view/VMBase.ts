import { Component, log, _decorator } from 'cc';
import { DEBUG, EDITOR } from 'cc/env';
import { VM } from './ViewModel';

  
  
  
  

const DEBUG_WATCH_PATH: boolean = false;

const { ccclass, property } = _decorator;

/**
 * watchPath    ，                   
 */
@ccclass
export default class VMBase extends Component {
      
    public watchPath: string = '';

      
    public watchPathArr: string[] = [];

      
    public templateMode: boolean = false;

      
    public templateValueArr: any[] = [];

      
    public VM = VM;

    /**
     *       onLoad   ，        super.onLoad()，      
     */
    onLoad() {
        if (EDITOR) return;

          
        let paths = this.watchPath.split('.');
        for (let i = 1; i < paths.length; i++) {
            const p = paths[i];
              
            if (p == '*') {
                let index = this.node.parent!.children.findIndex(n => n === this.node);
                if (index <= 0) index = 0;
                paths[i] = index.toString();
                break;
            }
        }

          
        this.watchPath = paths.join('.');

          
        let pathArr = this.watchPathArr;
        if (pathArr.length >= 1) {
            for (let i = 0; i < pathArr.length; i++) {
                const path = pathArr[i];
                let paths = path.split('.');

                for (let i = 1; i < paths.length; i++) {
                    const p = paths[i];
                    if (p == '*') {
                        let index = this.node.parent!.children.findIndex(n => n === this.node);
                        if (index <= 0) index = 0;
                        paths[i] = index.toString();
                        break;
                    }

                }

                this.watchPathArr[i] = paths.join('.');
            }
        }

          
        if (DEBUG_WATCH_PATH && DEBUG) {
            log('    ', this.watchPath ? [this.watchPath] : this.watchPathArr, '<<', this.node.getParent().name + '.' + this.node.name)
        }

        if (this.watchPath == '' && this.watchPathArr.join('') == '') {
            log('          :', this.node.parent!.name + '.' + this.node.name);
        }
    }

    onEnable() {
        if (EDITOR) return;                       
        if (this.templateMode) {
            this.setMultPathEvent(true);
        }
        else if (this.watchPath != '') {
            this.VM.bindPath(this.watchPath, this.onValueChanged, this);
        }

        this.onValueInit();                       
    }

    onDisable() {
        if (EDITOR) return;  
        if (this.templateMode) {
            this.setMultPathEvent(false);
        }
        else if (this.watchPath != '') {
            this.VM.unbindPath(this.watchPath, this.onValueChanged, this);
        }
    }

      
    private setMultPathEvent(enabled: boolean = true) {
        if (EDITOR) return;
        let arr = this.watchPathArr;
        for (let i = 0; i < arr.length; i++) {
            const path = arr[i];
            if (enabled) {
                this.VM.bindPath(path, this.onValueChanged, this);
            }
            else {
                this.VM.unbindPath(path, this.onValueChanged, this);
            }
        }
    }

    protected onValueInit() {
          
    }

    /**
     *      
     * @param n         
     * @param o         
     * @param pathArr       
     */
    protected onValueChanged(n: any, o: any, pathArr: string[]) {

    }
}
