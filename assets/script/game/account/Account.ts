/*
 * @Author: dgflash
 * @Date: 2021-11-11 17:45:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-02-28 14:29:06
 */

import { Message } from "../../core/common/event/MessageManager";
import { ecs } from "../../core/libs/ecs/ECS";
import { GameEvent } from "../common/config/GameEvent";
import { AccountNetDataComp, AccountNetDataSystem } from "./bll/AccountNetData";
import { AccountModelComp } from "./model/AccountModelComp";

/**
   
  
  
  
 */
export class Account extends ecs.Entity {
    AccountModel!: AccountModelComp;
    AccountNetData!: AccountNetDataComp;

    protected init() {
        this.addComponents<ecs.Comp>(AccountModelComp);
        this.addEvent();
    }

    destroy(): void {
        this.removeEvent();
        super.destroy();
    }

      
    private addEvent() {
        Message.on(GameEvent.GameServerConnected, this.onHandler, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.GameServerConnected, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.GameServerConnected:
                this.getPlayer();
                break;
        }
    }

      
    connect() {
        // netChannel.gameCreate();
        // netChannel.gameConnect();

          
        Message.dispatchEvent(GameEvent.GameServerConnected)
    }

      
    getPlayer() {
        this.add(AccountNetDataComp);
    }
}

export class EcsAccountSystem extends ecs.System {
    constructor() {
        super();

        this.add(new AccountNetDataSystem());
    }
}
