import { _decorator, AudioSource, clamp01, Component, sys, CCInteger } from "cc";
import { clientEvent } from "./clientEvent";
import { resourceUtil } from "./resourceUtil";
const { ccclass, property } = _decorator;


export const AudioEvent = {
    PlaySound: "PlaySound",
    PlayMusic: "PlayMusic",
    MusicStatus: "MusicStatus",
    SoundStatus: "SoundStatus",
};

@ccclass('AudioManager')
export class AudioManager extends Component  {

    private _audioSource:AudioSource|null = null;
    private _isCloseSound:boolean = false; // 是否关闭音效
    private _isClsoeMusic:boolean = false; // 是否关闭背景音乐
    private musicVolume: number = 1;

    
    onLoad() {

        // 初始化音乐组件和音量
        this._audioSource = this.node.getComponent(AudioSource);
        this.musicVolume = this._audioSource!.volume;

        

        this._isCloseSound = sys.localStorage.getItem("sound") == "true";
        this._isClsoeMusic = sys.localStorage.getItem("music") == "true";
        this.setMusicVolume(this._isClsoeMusic ? 0 : this.musicVolume);

        clientEvent.on(AudioEvent.PlaySound, this.playSound, this);
        clientEvent.on(AudioEvent.PlayMusic, this.playMusic, this);
        clientEvent.on(AudioEvent.MusicStatus, this._onMusicStatus, this);
        clientEvent.on(AudioEvent.SoundStatus, this._onSoundStatus, this);
    }

    onDestroy() {
        clientEvent.off(AudioEvent.PlaySound, this.playSound, this);
        clientEvent.off(AudioEvent.PlayMusic, this.playMusic, this);
        clientEvent.off(AudioEvent.MusicStatus, this._onMusicStatus, this);
        clientEvent.off(AudioEvent.SoundStatus, this._onSoundStatus, this);
    }

    /**
     * 播放音乐
     * @param {JSON} data {name:音乐名称, loop:是否循环， path:二级目录，没有可不传}
     */
    playMusic (data:any) {
        if (!this._audioSource) {
            return;
        }

        if (this._audioSource.playing) {
            this._audioSource.pause();
        }

        let path = 'music/' + (data.path || "");
        resourceUtil.getAudioRes(path + data.name, (err, clip) => {
            if (!err && clip && this._audioSource) {
                this._audioSource.currentTime = 0;
                this._audioSource.loop = data.loop == null ? true : data.loop;
                this._audioSource.clip = clip;
                this._audioSource.play();
            }
        });
    }

    /**
     * 播放音效
     * @param {JSON} data {name:音效名称, path:二级目录，没有可不传}
     */
    playSound (data:any) {
        if (!this._audioSource || this._isCloseSound) {
            return;
        }

        //音效一般是多个的，不会只有一个
        let path = 'sound/' + (data.path || "");
        resourceUtil.getAudioRes(path + data.name, (err, clip)=> {
            if (!err && clip && this._audioSource) {
                this._audioSource.playOneShot(clip, 1);
            }
        });
    }

    setMusicVolume (volume: number) {
        if (!this._audioSource) {
            return;
        }

        this._audioSource.volume = volume;
        if (volume <= 0) {
            this._audioSource.pause();
        } else {
            if (!this._audioSource.playing) {
                this._audioSource.play();    
            }
        }
    }

    // _onUpdateMusicStatus() {

    //     if (!this._audioSource) {
    //         return;
    //     }

    //     this.setMusicVolume(this._isClsoeMusic ? 0 : this.musicVolume);
    //     // if (this._isClsoeMusic) {
    //     //     this.setMusicVolume( 0 );
    //     //     // this._audioSource.pause();
    //     // }
    //     // else {
    //     //     this.setMusicVolume(this.musicVolume);
    //     //     // this._audioSource.volume = this.musicVolume;
    //     //     // this._audioSource.play();
    //     // }
    // }

    _onMusicStatus(closeStatus:boolean) {        
        sys.localStorage.setItem("music", closeStatus ? 'true' : "false");
        this._isClsoeMusic = closeStatus;
        this.setMusicVolume(closeStatus ? 0 : this.musicVolume);
    }



    _onSoundStatus(closeStatus:boolean) {
        // this.setSoundVolume(status ? 1 : 0);
        this._isCloseSound = closeStatus;
        sys.localStorage.setItem('sound', closeStatus ? 'true' : "false");
        // localConfig.instance.setGlobalData('sound', status ? 'true' : "false");
    }
}

