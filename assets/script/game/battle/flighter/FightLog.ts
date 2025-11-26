import { _decorator } from 'cc';
import { Logger } from '../../../core/common/log/Logger';
import { HeroCfg } from '../../common/table/TableHeroes';
import { FlighterGameObjcet } from '../utils/FlighterGameObject';

export class FighterLog {

    static log2(heroInfo: HeroCfg, oGo: FlighterGameObjcet, nGo: FlighterGameObjcet) {


        let propName = [
            "None",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "X",
            "Y",
            "",
            "ID",
            "",
            "ID",
            "",
            "ID",
            "",
            "",
            "",
            "ID",
            "1",
            "2",
            "",
            "",
            "",
            "",
            "CardProtoId",
            "ID",
            "DieAfterMs",
            "SepEnd"
        ];

        let fliter = [
            core.PropType.PropTypePosX,
            core.PropType.PropTypePosY,
            core.PropType.PropTypeState,
            core.PropType.PropTypeOrientation,
            core.PropType.PropTypeTargetId,
        ];

        if (oGo == undefined || nGo == undefined) {
            return;
        }

        let isChanged = false;

        let out = [{
            name: heroInfo.inn_name,
            oldV: 0,
            newV: 0,
            value: 0,
        }];

        // out.push({ N: "Name", V: heroInfo.inn_name });

        for (let p = core.PropType.PropTypeNone; p < core.PropType.PropTypeSepEnd; p++) {

            if (fliter.indexOf(p) >= 0) {
                continue;
            }

            let ov = oGo.props.GetValue(p).i32;
            let nv = nGo.props.GetValue(p).i32;

            if (ov != nv) {
                out.push({ name: propName[p], oldV: ov, newV: nv, value: nv - ov });
                isChanged = true;
            }
        }

        if (isChanged) {
            out.push({
                name: "time", oldV: 0,
                newV: 0, value: (new Date).getTime()
            });
            out.push({
                name: "", oldV: 0,
                newV: 0, value: 0
            });
            Logger.table(out);
        }
    }

    static log3(heroInfo: HeroCfg, fGo: FlighterGameObjcet) {


        let propName = [
            "None",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "X",
            "Y",
            "",
            "ID",
            "",
            "ID",
            "",
            "ID",
            "",
            "",
            "",
            "ID",
            "1",
            "2",
            "",
            "",
            "",
            "",
            "CardProtoId",
            "ID",
            "DieAfterMs",
            "SepEnd"
        ];

        let fliter = [
            core.PropType.PropTypePosX,
            core.PropType.PropTypePosY,
            core.PropType.PropTypeState,
            core.PropType.PropTypeOrientation,
            core.PropType.PropTypeTargetId,
            core.PropType.PropTypeCardProtoId,
        ];

        if (fGo == undefined) {
            return;
        }


        let out = [{
            name: heroInfo.inn_name,
            V: 0,
        }];

        // out.push({ N: "Name", V: heroInfo.inn_name });

        for (let p = core.PropType.PropTypeNone; p < core.PropType.PropTypeSepEnd; p++) {

            if (fliter.indexOf(p) >= 0) {
                continue;
            }

            let v = fGo.props.GetValue(p).i32;
            out.push({ name: propName[p], V: v, });
        }
        Logger.table(out);
    }

    // static log(heroInfo: HeroCfg, fGo: FlighterGameObjcet, fChange?: core.IFighter) {
    //     let changeHp = 0;
    //     let changeHp1 = 0;
    //     let changeMotionSpeed = 0;
    //     let changeAtkSpeed = 0;
    //     let changeCastMs = 0;

    //     let isChange = false;
    //     if (fChange) {
      
    //         for (const prop of fChange.props) {
    //             let fighterType = prop.t;
    //             let i32 = prop.i32;
    //             switch (fighterType) {
    //                 case core.PropType.PropTypeHp:
    //                     changeHp = i32;
    //                     isChange = true;
    //                     break;
    //                 case core.PropType.PropTypeHp1:
    //                     changeHp1 = i32;
    //                     isChange = true;
    //                     break;
    //                 case core.PropType.PropTypeMotionSpeed:
    //                     changeMotionSpeed = i32;
    //                     isChange = true;
    //                     break;
    //                 case core.PropType.PropTypeAtkSpeed:
    //                     changeAtkSpeed = i32;
    //                     isChange = true;
    //                     break;
    //                 case core.PropType.PropTypeBornCastMs:
    //                     changeCastMs = i32;
    //                     isChange = true;
    //                     break;
    //             }
    //             // if (fighterType == core.PropType.PropTypeState) {
    //             //     // if (i32 == core.FighterState.FighterBorn) { }
    //             // } else if (fighterType == core.PropType.PropTypeHp1) {
    //             //     changeHp1 = i32;
    //             // }
    //         }
    //     }

    //     // enum PropType {
    //     //     PropTypeNone        = 0;
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
    //     //     PropTypeBornCastMs  = 25;
      
      
      
    //     //   }
    //     FighterLog.getIdLog(heroInfo.Id);
    //     FighterLog.getNameLog(heroInfo.inn_name);
    //     FighterLog.getLevelLog(heroInfo.level);
    //     FighterLog.getMaxHpLog(fGo.props.GetValue(core.PropType.PropTypeHp).i32);
    //     FighterLog.getDHpLog(changeHp);
    //     FighterLog.getMaxHp1Log(fGo.props.GetValue(core.PropType.PropTypeHp1).i32);
    //     FighterLog.getDHp1Log(changeHp1);
    //     FighterLog.gerAtkSpeedLog(fGo.props.GetValue(core.PropType.PropTypeAtkSpeed).i32);
    //     FighterLog.gerMoveSpeedLog(fGo.props.GetValue(core.PropType.PropTypeMotionSpeed).i32);
    //     FighterLog.gerCastMs(fGo.props.GetValue(core.PropType.PropTypeBornCastMs).i32);
    //     if (isChange) {
    //         FighterLog.printLog();
    //         isChange = false;
    //     }
    // }

      
    // static logTable = new Array(10);

    // static getIdLog(id: number) {
    //     this.logTable[0] = { name: "ID", fileExtension: id };
    // }

    // static getNameLog(name: string) {
      
    // }

    // static getLevelLog(lv: string) {
      
    // }

    // static getMaxHpLog(maxHp: number) {
      
    // }

    // static getDHpLog(dHp: number) {
      
    // }

    // static getMaxHp1Log(maxHp1: number) {
      
    // }

    // static getDHp1Log(dHp1: number) {
      
    // }

    // static gerAtkSpeedLog(atkSpeed: number) {
      
    // }

    // static gerMoveSpeedLog(moveSpeed: number) {
      
    // }

    // static gerCastMs(castMs: number) {
      
    // }


      
    // static printLog() {
    //     console.table(this.logTable);
    // }
}

