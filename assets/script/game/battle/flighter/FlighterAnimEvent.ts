import { _decorator, Component, Animation, AnimationClip, v3, AnimationState } from 'cc';
import { oops } from '../../../core/Oops';
import { BattleManger } from '../BattleManger';
import { FlighterAnimType } from '../utils/BattleEnum';
import { Flighter } from './Flighter';
const { ccclass, property } = _decorator;

@ccclass('FlighterAnimEvent')
export class FlighterAnimEvent extends Component {
    flighter: Flighter

    start() {
        // let anim = this.getComponent(Animation);
        // // anim.clips[0].events.push({
        // //     frame: 1,
          
        // //     params: []
        // // })
        // let clip = anim.clips[0];
        // this.addEvent(clip, this.runFun.name, 1);
        // // clip.updateEventDatas();
        // anim.createState(clip, clip.name);
        // anim.play(clip.name);
    }

    update(deltaTime: number) {
    }

    init(f: Flighter) {
        this.flighter = f;
        let anim = this.flighter.roleAnimation;
        for (const clip of anim.clips) {
            if (!this.flighter.heroInfo.sound) continue;
            let frame: number[] = [];
            let funName: string = '';
            if (clip.name.search(FlighterAnimType.RUN) != -1) {
                frame = this.flighter.heroInfo.sound.run_frame;
                funName = 'runSfxFun'; // this.runSfxFun.name;
            } else if (clip.name.search(FlighterAnimType.RUSH) != -1) {
                frame = this.flighter.heroInfo.sound.rush_frame;
                funName = 'rushSfxFun'; // this.rushSfxFun.name;
            } else if (clip.name.search(FlighterAnimType.JUMPING) != -1) {
                frame = this.flighter.heroInfo.sound.jump_frame;
                funName = 'jumpSfxFun'; // this.jumpSfxFun.name;
            } else if (clip.name.search(FlighterAnimType.ATTACK) != -1) {
                frame = this.flighter.heroInfo.sound.atk_frame;
                funName = 'atkSfxFun'; // this.atkSfxFun.name;
            }
            if (funName) {
                frame?.forEach(e => {
                    this.addEvent(clip, funName, e);
                })
                anim.createState(clip, clip.name);   
            }
        }
    }

    /**
       
  
  
  
     */
    addEvent(clip: AnimationClip, eventName: string, frame: number) {
        let t = 1 / clip.sample / clip.speed * frame;   
        clip.events = [...clip.events, {
            frame: t,   
            func: eventName,
            params: []
        }];
        // clip.events.push({
          
        //     func: eventName,
        //     params: []
        // });
    }

    runSfxFun() {
        let sound = this.flighter.heroInfo.sound;
        if (sound?.run_res)
            this.playEffect(sound.run_res, sound.run_volume);
    }

    rushSfxFun() {
        let sound = this.flighter.heroInfo.sound;
        if (sound?.rush_res)
            this.playEffect(sound.rush_res, sound.rush_volume);
    }
    jumpSfxFun() {
        let sound = this.flighter.heroInfo.sound;
        if (sound?.jump_res)
            this.playEffect(sound.jump_res, sound.jump_volume);
    }
    atkSfxFun() {
        let sound = this.flighter.heroInfo.sound;
        if (sound?.atk_res)
            this.playEffect(sound.atk_res, sound.atk_volume);
    }

    playEffect(res: string, volumeScale: number) {
        if (BattleManger.getInstance().gameState == core.BattleState.BattleSettle) return;
        if (res)
            BattleManger.getInstance().Battle.battleAudio.playSkill(res, volumeScale);
    }
}

