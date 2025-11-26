import { _decorator, Component, AudioClip, AudioSource, error } from 'cc';
import { Logger } from '../../../../core/common/log/Logger';
import { oops } from '../../../../core/Oops';
import { BattleManger } from '../../BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleAudio')
export class BattleAudio extends Component {
    @property(AudioSource)
    audioSource: AudioSource = null;

    clipInfos: { [key: string]: { clip: AudioClip, num: number, maxNum: number, duration: number, curDuration: number } } = {};
    onLoad() {
        for (const key in BattleManger.getInstance().audioClips) {
            let clip = BattleManger.getInstance().audioClips[key];
            let duration = clip.getDuration();
            this.clipInfos[clip.name] = { clip, num: 0, maxNum: 3, duration, curDuration: duration };
        }
    }
    start() {

    }

    update(deltaTime: number) {
        for (const key in this.clipInfos) {
            let clipInfo = this.clipInfos[key];
            if (clipInfo.num > 0) {
                if (clipInfo.curDuration > 0) {
                    clipInfo.curDuration -= deltaTime;
                }

                if (clipInfo.curDuration <= 0) {
                    clipInfo.num -= 1;
                    clipInfo.curDuration = clipInfo.duration;
                }
            }

        }
    }

    stopAll() {
        this.audioSource.stop();
    }

    getClipByName(name: string) {
        // return this.audioClips.find(v => v.name == name);
        return this.clipInfos[name];
    }

    playSkill(name: string, volumeScale: number) {
        this.playEffect(name, volumeScale);
    }

    playRole(name: string, volumeScale: number) {
        this.playEffect(name, volumeScale);
    }

    playEffect(name: string, volumeScale: number) {
        let clipInfo = this.getClipByName(name);
        if (clipInfo) {
            if (oops.audio.effectVolume > 0) {
                if (BattleManger.getInstance().gameState >= core.BattleState.BattleSettle) return;
                if (clipInfo.num > clipInfo.maxNum) return;
                this.audioSource.playOneShot(clipInfo.clip, volumeScale);
                clipInfo.num++;
            }
        } else {
            Logger.erroring('not have battle audio clip:' + name);
        }
    }
}

