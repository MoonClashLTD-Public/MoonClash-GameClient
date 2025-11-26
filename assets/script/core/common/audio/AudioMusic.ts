import { AudioClip, AudioSource, error, _decorator } from 'cc';
import { resLoader } from '../loader/ResLoader';
const { ccclass, menu } = _decorator;

  
@ccclass('AudioMusic')
export class AudioMusic extends AudioSource {
    private _progress: number = 0;
    private _url: string | null = null;

    /**
       
  
     */
    public get progress() {
        this._progress = this.currentTime / this.duration;
        return this._progress;
    }
    public set progress(value: number) {
        this._progress = value;
        this.currentTime = value * this.duration;
    }

    public load(url: string, callback?: Function) {
        if (this._url == url && this.playing) return;
        resLoader.load(url, AudioClip, (err: Error | null, data: AudioClip) => {
            if (err) {
                error(err);
                return;
            }

            if (this.playing) {
                this.stop();
                resLoader.release(this._url!);
            }

            this.clip = data;
            this.currentTime = 0;
            this.loop = true;
            this.play();

            callback && callback(data);

            this._url = url;
        });
    }

    release() {
        if (this._url) {
            resLoader.release(this._url);
            this._url = null;
        }
    }
}
