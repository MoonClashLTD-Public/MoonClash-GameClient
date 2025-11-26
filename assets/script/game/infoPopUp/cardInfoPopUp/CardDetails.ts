import { _decorator, Component, Node, Sprite, Label, find, instantiate, PageView } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { CSCardDispositionItem } from '../../card/com/dispostion/CSCardDispositionItem';
import TableBornAddrs from '../../common/table/TableBornAddrs';
import TableCards, { CardCfg } from '../../common/table/TableCards';
import TableJobs from '../../common/table/TableJobs';
import { CardUtils } from '../../common/utils/CardUtils';
import { ResManger } from '../../data/resManger';
const { ccclass, property, type } = _decorator;

@ccclass('CardDetails')
export class CardDetails extends Component {
    @type(PageView)
    pv: PageView = null;
    // page 1
    @property(Node)
    private attrNode: Node = null
    // page 2
    @property(Node)
    private disposNode: Node = null
    // page 3
    @property(Node)
    private descNode: Node = null;
    cardInfo: core.ICard = null;
    start() {

    }

    update(deltaTime: number) {

    }

    init(param: {
        cardInfo?: core.ICard,   
        cardCfg?: CardCfg,   
    }) {
        if (param.cardCfg) {
            param.cardInfo = core.Card.create({
                protoId: param.cardCfg.proto_id,
                level: 1,
            })
        }
        this.cardInfo = param.cardInfo;
        this.updInfo();
    }

    private updInfo() {
        this.updPage1();
        this.updPage2();
        this.updPage3();
    }

    pageEvent(event: Event, customEventData: string) {
        // this.pv.curPageIdx;
    }

    private async updPage1() {
        const attrCfgs = CardUtils.getCardAttrItems({ netCard: this.cardInfo })
        let idx = 0;
        for (const attr of attrCfgs) {
            if (attr.num1 == '0') continue
            let item: Node = null;
            if (idx == 0) {
                item = this.attrNode.children[0];
            } else {
                item = instantiate(this.attrNode.children[0]);
                this.attrNode.addChild(item)
            }
            let icon = find('lBg/iconbg/icon', item).getComponent(Sprite);
            let nameLb = find('rBg/NameLayout/name', item).getComponent(LanguageLabel);
            let nameAddStrLb = find('rBg/NameLayout/nameAddStr', item).getComponent(LanguageLabel);
            let num1 = find('rBg/Layout/num1', item).getComponent(Label);
            let num2 = find('rBg/Layout/num2', item).getComponent(Label);
            let sec = find('rBg/Layout/time', item);

            icon.spriteFrame = await ResManger.getInstance().getCardAttrSpriteFrame(attr.icon);
            nameLb.dataID = attr.name;
            num1.string = `${attr?.num1}`;

            if (attr.nameAddStr) {
                nameAddStrLb.node.active = true
                nameAddStrLb.dataID = attr.nameAddStr;
            } else {
                nameAddStrLb.node.active = false
            }

            if (attr.showNum2) {
                num2.node.active = true
                num2.string = `${attr.num2}`
            } else {
                  
                num2.node.active = false

                  
                // if (attr.showAdd && attr?.num2 != attr?.num1 && attr?.num2 && !attr.isMaxLevel) {
                //     num2.node.active = true;
                //     num2.string = `+ ${Number(attr.num2) - Number(attr.num1)}`
                // } else {
                //     num2.node.active = false
                // }
            }

            if (attr.attrType == core.PropType.PropTypeBornCastMs
                || attr.attrType == skill.EffectType.EffectTypeAtk) {
                sec.active = true
            } else {
                sec.active = false
            }
            idx++;
        }
    }

    private updPage2() {
        const disposCfgs = CardUtils.getDispostionItems({ netCard: this.cardInfo })
        let idx = 0;
        for (const key in disposCfgs) {
            let item: Node = null;
            if (idx == 0) {
                item = this.disposNode.children[0];
            } else {
                item = instantiate(this.disposNode.children[0]);
                this.disposNode.addChild(item)
            }
            idx++;
            const attr = disposCfgs[key]
            // let nameLbl = item.getChildByName('nameLbl').getComponent(LanguageLabel);
            // let numLbl = item.getChildByName('numLbl').getComponent(Label);
            // let descLbl = item.getChildByName('descLbl').getComponent(RichText);
            // numLbl.string = `${idx++}`
            // nameLbl.dataID = attr.name || ''
            // descLbl.string = attr.desc;
            item.getComponent(CSCardDispositionItem)?.init(idx, attr)
        }
        this.disposNode.active = idx > 0;
    }

    private async updPage3() {
        let cardCfg = TableCards.getInfoByProtoIdAndLv(this.cardInfo.protoId, this.cardInfo.level);

        let descLbl = find('desc', this.descNode).getComponent(LanguageLabel);
        let layoutNode = find('Layout', this.descNode);
        let jobNode = layoutNode.children[0];
        let bornNode = layoutNode.children[1];
        if (this.cardInfo.bornAddrId) {
            let descLbl = bornNode.getChildByName('desc').getComponent(LanguageLabel);
            descLbl.dataID = TableBornAddrs.getInfoById(this.cardInfo.bornAddrId)?.display_name;
        }
        bornNode.active = this.cardInfo.bornAddrId > 0;

        if (this.cardInfo.jobId) {
            let jobIcon = jobNode.getChildByName("icon").getComponent(Sprite);
            let jobDesc = jobNode.getChildByName('desc').getComponent(LanguageLabel);
            jobIcon.spriteFrame = await ResManger.getInstance().getCardJobSpriteFrame(this.cardInfo.jobId);
            jobDesc.dataID = TableJobs.getInfoById(this.cardInfo.jobId)?.display_name
        }
        jobNode.active = this.cardInfo.jobId > 0;

        descLbl.dataID = cardCfg?.desc || ''
    }
}

