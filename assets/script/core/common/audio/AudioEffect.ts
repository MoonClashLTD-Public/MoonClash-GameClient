import { AudioClip, AudioSource, error, _decorator } from 'cc';
import { resLoader } from '../loader/ResLoader';
const { ccclass, menu } = _decorator;

/**
   
 */

  
@ccclass('AudioEffect')
export class AudioEffect extends AudioSource {
    private effects: Map<string, AudioClip> = new Map<string, AudioClip>();

    public load(url: string, volumeScale: number = 1, callback?: Function) {
        resLoader.load(url, AudioClip, (err: Error | null, data: AudioClip) => {
            if (err) {
                error(err);
                return;
            }

            this.effects.set(url, data);
            this.playOneShot(data, volumeScale);
            callback && callback(data);
        });
    }

    release() {
        for (let key in this.effects) {
            resLoader.release(key);
        }
        this.effects.clear();
    }
}
