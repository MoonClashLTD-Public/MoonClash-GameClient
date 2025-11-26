import { _decorator, Component, Node, find, RichText, Label } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import HttpHome from '../common/net/HttpHome';
const { ccclass, property, type } = _decorator;

@ccclass('FriendAssistedRecordPopUp')
export class FriendAssistedRecordPopUp extends Component {
    @type(List)
    list: List = null;
    private count = 0;
    hasMore = false;

    @type(LanguageLabel)
    explain: LanguageLabel = null;

    records: wafriend.IFriendshipAssistedRecord[] = [];
    start() {
    }

    update(deltaTime: number) {

    }

    async onAdded() {
        let d = await HttpHome.friendshipAssistedRecords(0, 10);
        if (d) {
            this.hasMore = d.hasMore;
            this.count = d.records.length;
            this.records = d.records;
            this.list.numItems = this.count;
        }
        this.explain.node.active = this.count <= 0;
    }

    renderEvent(item: Node, idx: number) {
        let record = this.records[idx];

        let title = find('RichText', item).getComponent(LanguageLabel);
        let numLbl = find('numLbl', item).getComponent(Label);
        title.params = [
            {
                key: 'time',
                value: `${CommonUtil.dateFormat(new Date(record.createdAt * 1000), 'yyyy/MM/dd HH:mm:ss')}`,
            },
            {
                key: 'name',
                value: `#${record.recipientId}`,
            }
        ]

        let dgg = new BigNumber((record.dggWei));
        let dna = new BigNumber((record.dnaWei));
        let isShow = dgg.gt(0);
        find('Dgg_icon', item).active = isShow;
        find('Dna_icon', item).active = !isShow;
        if (dgg.gt(0)) {
            numLbl.string = `${CommonUtil.weiToEther(record.dggWei).toFixed(6)}`;
        } else if (dna.gt(0)) {
            numLbl.string = `${CommonUtil.weiToEther(record.dnaWei).toFixed(6)}`;
        } else {
            numLbl.string = `${0}`
        }

        if (this.count - 1 == idx && this.hasMore) {
            this.pageRecord(record.id);
        }
    }

      
    async pageRecord(id: number = 0) {
        let records = await HttpHome.friendshipAssistedRecords(id, 10);
        if (records) {
            this.count += records.records.length;
            this.records = this.records.concat(records.records);
            this.hasMore = records.hasMore;
            this.list.numItems = this.count;
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node);
    }
}

