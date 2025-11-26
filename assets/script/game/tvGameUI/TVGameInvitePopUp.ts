import { _decorator, Component, EditBox } from 'cc';
import { oops } from '../../core/Oops';
import { netChannel } from '../common/net/NetChannelManager';
const { ccclass, property, type } = _decorator;

@ccclass('TVGameInvitePopUp')
export class TVGameInvitePopUp extends Component {
    @type(EditBox)
    editBox: EditBox = null;
    isHost: boolean = false;   
    team: core.Team
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: { isHost: boolean, team?: core.Team }) {
        this.isHost = param?.isHost ?? false;
        this.team = param?.team ?? core.Team.Blue;
    }

    async confimClick() {
        let playerId = this.editBox.string;
        if (!!!playerId) {
            return
        }

        if (this.isHost) {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsTVGameInviteSayerReq, opcode.OpCode.ScTVGameInviteSayerResp, pkgcs.CsTVGameInviteSayerReq.create({ sayerId: Number(playerId) }));
            if (d?.code == errcode.ErrCode.Ok) {
                // oops.gui.toast("tip_ok", true);
                this.closeClick();
            }
        } else {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsTVGameInvitePlayerReq, opcode.OpCode.ScTVGameInvitePlayerResp, pkgcs.CsTVGameInvitePlayerReq.create({ playerId: Number(playerId), team: this.team }));
            if (d?.code == errcode.ErrCode.Ok) {
                // oops.gui.toast("tip_ok", true);
                this.closeClick();
            }
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}