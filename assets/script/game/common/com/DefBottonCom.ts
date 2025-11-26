import { _decorator, Component, Node, CCInteger, Widget, CCBoolean, UITransform, SpriteFrame, Sprite, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DefBottonCom')
export class DefBottonCom extends Component {
    @property(Button)
    private btn: Button = null;
    @property(Sprite)
    private btnBg: Sprite = null;

      
    setEnable(enable: boolean) {
        this.btn.interactable = enable;
        this.btnBg.grayscale = !enable
        this.node.getComponentsInChildren(Sprite).forEach(e => e.grayscale = !enable);
    }

    get interactable() {
        return this.btn.interactable
    }
}

