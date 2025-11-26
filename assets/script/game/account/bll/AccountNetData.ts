/*
 * @Author: dgflash
 * @Date: 2021-11-23 15:51:15
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-15 09:47:36
 */

import { v3 } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { storage } from "../../../core/common/storage/StorageManager";
import { ecs } from "../../../core/libs/ecs/ECS";
import { oops } from "../../../core/Oops";
import { GameEvent } from "../../common/config/GameEvent";
import { netConfig } from "../../common/net/NetConfig";
import { Role } from "../../role/Role";
import { Account } from "../Account";
import { AccountModelComp } from "../model/AccountModelComp";

  
@ecs.register('AccountNetData')
export class AccountNetDataComp extends ecs.Comp {
    reset() { }
}

  
export class AccountNetDataSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(AccountNetDataComp, AccountModelComp);
    }

    entityEnter(e: Account): void {
        var params: any = {
            playerId: netConfig.dbid,
            sessionKey: netConfig.sessionKey,
        }

        let onComplete = {
            target: this,
            callback: (data: any) => {
                  
                this.setLocalStorage(data.id);

                  
                this.createRole(e, data);

                  
                Message.dispatchEvent(GameEvent.LoginSuccess);
            }
        }
          
        // netChannel.game.req("LoginAction", "loadPlayer", params, onComplete);

          
        var data = {
            id: 1,
            name: "Oops",
            power: 10,
            agile: 10,
            physical: 10,
            lv: 1,
            jobId: 1
        }
        onComplete.callback(data);
          

        e.remove(AccountNetDataComp);
    }

      
    private createRole(e: Account, data: any) {
        var role = ecs.getEntity<Role>(Role);

          
        role.RoleModel.id = data.id;
        role.RoleModel.name = data.name;

          
        role.RoleModelBase.power = data.power;
        role.RoleModelBase.agile = data.agile;
        role.RoleModelBase.physical = data.physical;

          
        role.upgrade(data.lv);

          
        role.RoleModelJob.id = data.jobId;

          
        role.RoleModel.vmAdd();
          
        role.RoleModelLevel.vmAdd();
          
        role.RoleModelBase.vmAdd();

          
        role.load(oops.gui.game, v3(0, -300, 0));

        e.AccountModel.role = role;
    }

      
    private setLocalStorage(uid: number) {
        storage.setUser(uid);
        storage.set("account", uid);
    }
}