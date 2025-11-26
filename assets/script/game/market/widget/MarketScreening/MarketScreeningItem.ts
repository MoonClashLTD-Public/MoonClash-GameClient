import { _decorator, Component, Slider, log, find, SpriteFrame, Sprite, Node, instantiate, Layout, v3, ScrollView, v2 } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { MarketScreeningConf, MarketScreeningItemType, MarketScreeningPopUp } from '../../MarketScreeningPopUp';
import { MarketScreeningItemSliding } from './MarketScreeningItemSliding';
import { MarketScreeningItemMultiple } from './MarketScreeningItemMultiple';
import { MarketScreeningItemSingle } from './MarketScreeningItemSingle';
import { MarketScreeningItemRangeSliding } from './MarketScreeningItemRangeSliding';
const { ccclass, property, type } = _decorator;

@ccclass('MarketScreeningItem')
export class MarketScreeningItem extends Component {
    @type([SpriteFrame])
    icons: SpriteFrame[] = [];
    @type(Node)
    expandNode: Node = null;
    @type([Node])
    btnsNode: Node[] = [];

    @type(MarketScreeningItemSliding)
    itemSliding: MarketScreeningItemSliding = null;   
    @type(MarketScreeningItemRangeSliding)
    itemRangeSliding: MarketScreeningItemRangeSliding = null;   
    @type(MarketScreeningItemMultiple)
    itemMultiple: MarketScreeningItemMultiple = null;   
    @type(MarketScreeningItemSingle)
    itemSingle: MarketScreeningItemSingle = null;   
    start() {

    }

    update(deltaTime: number) {

    }

    init(marketScreeningPopUp: MarketScreeningPopUp, param: MarketScreeningConf) {
        this.node.children.forEach(e => e.active = e.name == 'line');
        this.btnsNode.forEach(e => e.destroyAllChildren());
        this.initTitle(param);
        this.initSmallTitle(param);
        this.updExpandNode(param.isExpand);
        if (param.type == MarketScreeningItemType.Single) {   
            this.itemSingle.init(marketScreeningPopUp, param);
        } else if (param.type == MarketScreeningItemType.Multiple) {   
            this.itemMultiple.init(marketScreeningPopUp, param);
        } else if (param.type == MarketScreeningItemType.Sliding) {   
            this.itemSliding.init(marketScreeningPopUp, param);
        } else if (param.type == MarketScreeningItemType.RangeSliding) {   
            this.itemRangeSliding.init(marketScreeningPopUp, param);
        }
    }

      
    initTitle(param: MarketScreeningConf) {
        let titleNode = find('titleNode', this.node)
        if (param.titleId) {
            titleNode.active = true;
            find('titleNode/Label', this.node).getComponent(LanguageLabel).dataID = param.titleId;
            find('titleNode/icon', this.node).getComponent(Sprite).spriteFrame = this.icons.find(e => e.name == param.icon);
        } else {
            titleNode.active = false;
        }
    }

      
    initSmallTitle(param: MarketScreeningConf) {
        let smallTitleNode = find('smallTitleNode', this.node)
        if (param.smallTitleId) {
            smallTitleNode.active = true;
            find('smallTitleNode/Label', this.node).getComponent(LanguageLabel).dataID = param.smallTitleId;
        } else {
            smallTitleNode.active = false;
        }
    }

    updExpandNode(bf: boolean) {
        this.expandNode.active = bf;
        let btn = this.expandNode.getChildByName('expandBtn');
        let s = btn.children[0].getScale();
        btn.children[0].setScale(v3(s.x, s.y * -1, s.z))

        this.btnsNode.forEach(e => e.active = s.y > 0);

        let sv = this.node.parent.parent.parent.getComponent(ScrollView);
        sv.scrollToOffset(v2(sv.getScrollOffset().x, sv.getScrollOffset().y + 1));
    }

      
    expandClick(e: Event, customEventData: string) {
        // find('expandNode/expandBtn', this.node).active = true;
        this.updExpandNode(true);
    }
}

