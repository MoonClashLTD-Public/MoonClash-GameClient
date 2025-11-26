import { CCString, Component, Enum, log, Node, _decorator } from "cc";
import { EDITOR } from "cc/env";
import VMBase from "./VMBase";

const { ccclass, property, executeInEditMode, menu, help } = _decorator;

enum ACTION_MODE {
    SEARCH_COMPONENT,
    ENABLE_COMPONENT,
    REPLACE_WATCH_PATH,
    DELETE_COMPONENT
}


/**
   
   
 */
@ccclass
@executeInEditMode
@menu('ModelViewer/Edit-Comps')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMCompsEdit.md')
export default class MVCompsEdit extends Component {
    @property({
        type: [CCString]
    })
    findList: string[] = ["VMBase", "VMParent"];

    @property({
        type: Enum(ACTION_MODE)
    })
    actionType: ACTION_MODE = ACTION_MODE.SEARCH_COMPONENT;

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.SEARCH_COMPONENT }
    })
    public get findTrigger() {
        return false;
    }
    public set findTrigger(v: boolean) {
        this.setComponents(0);
    }

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.ENABLE_COMPONENT }
    })
    public get enableTrigger() {
        return false;
    }
    public set enableTrigger(v: boolean) {
        this.setComponents(1);
    }

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.ENABLE_COMPONENT }
    })
    public get disableTrigger() {
        return false;
    }
    public set disableTrigger(v: boolean) {
        this.setComponents(2);
    }

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.DELETE_COMPONENT }
    })
    allowDelete: boolean = false;

    @property({
        tooltip: '',
        displayName: '[ X DELETE X ]',
        visible: function () { return this.allowDelete && this.actionType === ACTION_MODE.DELETE_COMPONENT }
    })
    public get deleteTrigger() {
        return false;
    }
    public set deleteTrigger(v: boolean) {
        this.setComponents(3);
    }

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH }
    })
    public get replaceTrigger() {
        return false;
    }
    public set replaceTrigger(v: boolean) {
        this.setComponents(4);
    }

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH }
    })
    targetPath: string = 'game';

    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH }
    })
    replacePath: string = '*';


    @property({
        tooltip: '',
        visible: function () { return this.actionType === ACTION_MODE.SEARCH_COMPONENT }
    })
    canCollectNodes: boolean = false;

    @property({
        type: [Node],
        readonly: true,
        tooltip: '',
        visible: function () { return this.canCollectNodes && this.actionType === ACTION_MODE.SEARCH_COMPONENT }
    })
    collectNodes: Node[] = [];

    onLoad() {
          
        if (!EDITOR) {
            let path = this.getNodePath(this.node);
            console.error('you forget delete MVEditFinder,[path]', path);
        }
    }

    setComponents(state: number) {
        let array = this.findList;
        let title = '';
        switch (state) {
            case 0: title = ''; break;
            case 1: title = ''; break;
            case 2: title = ''; break;
            case 3: title = ''; break;
            case 4: title = ''; break;

            default:
                break;
        }
        log(title)
        log('______________________')

        array.forEach(name => {
            this.searchComponent(name, state)
        })

        log('______________________')
    }

    /**
     * 
     * @param className 
  
     */
    searchComponent(className: string, state: number = 0) {
          
        this.collectNodes = [];

        let comps = this.node.getComponentsInChildren(className);
        if (comps == null || comps.length < 1) return;
        log('[' + className + ']:');
        comps.forEach(e => {
            let v = e as VMBase;
            let ext = '';

            if (state <= 3) {
                  
                if (v.templateMode === true) {
                    ext = v.watchPathArr ? ':[Path:' + v.watchPathArr.join('|') + ']' : ''
                } else {
                    ext = v.watchPath ? ':[Path:' + v.watchPath + ']' : ''
                }
            }

            log(this.getNodePath(v.node) + ext);
            switch (state) {
                case 0:  
                    if (this.canCollectNodes) {
                        if (this.collectNodes.indexOf(v.node) === -1) {
                            this.collectNodes.push(v.node);
                        }
                    }
                    break;
                case 1:  
                    v.enabled = true;
                    break;
                case 2:  
                    v.enabled = false;
                    break;
                case 3:  
                    v.node.removeComponent(v);
                    break;
                case 4:  

                    let targetPath = this.targetPath;
                    let replacePath = this.replacePath;
                    if (v.templateMode === true) {
                        for (let i = 0; i < v.watchPathArr.length; i++) {
                            const path = v.watchPathArr[i];
                            v.watchPathArr[i] = this.replaceNodePath(path, targetPath, replacePath);
                        }
                    }
                    else {
                        v.watchPath = this.replaceNodePath(v.watchPath, targetPath, replacePath);
                    }


                default:
                    break;
            }
        });
    }

    replaceNodePath(path: string, search: string, replace: string) {
        let pathArr = path.split('.');
        let searchArr = search.split('.');
        let replaceArr = replace.split('.')

        let match = true;
        for (let i = 0; i < searchArr.length; i++) {
              
            if (pathArr[i] !== searchArr[i]) {
                match = false;
                break;
            }

        }

          
        if (match === true) {
            for (let i = 0; i < replaceArr.length; i++) {
                pathArr[i] = replaceArr[i];
            }
            log(' :', path, '>>>', pathArr.join('.'))
        }

        return pathArr.join('.');
    }

    getNodePath(node: Node) {
        let parent = node;
        let array = [];
        while (parent) {
            let p = parent.getParent();
            if (p) {
                array.push(parent.name);
                parent = p;
            }
            else {
                break;
            }
        }
        return array.reverse().join('/');
    }
}
