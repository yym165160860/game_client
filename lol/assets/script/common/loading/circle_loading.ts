/*
 * @Author: Y*Y*M
 * @Date: 2022-01-04 12:31:40
 * @Description: 菊花加载进度条
 * @FilePath: \ludo\assets\script\framework\loading\circle_loading.ts
 */
import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('CircleLoading')
export class CircleLoading extends Component {
     // [1]
    // dummy = '';

    // [2]
    @property ({type:Label})
    loadProgressText:Label|null = null;

    @property ({type:Label})
    loadTipText:Label|null = null;

    private _targetProgress:number = 0;
    private _curProgress:number = 0;
    private _isPlaying:boolean = false;
    private _changingTime:number = 0;
    private _currTime:number = 0;
    private _callback:Function|null|undefined = null;
    private _backTarget:any = null;
    private _animSpeed:number = 0;


    start () {
        // [3]
    }

    update (deltaTime: number) {
        // [4]
        if(!this._isPlaying) {
            return;
        }

       
        this._currTime += deltaTime;
        if (this._currTime >= this._changingTime) {
            this._curProgress = this._targetProgress;
            this._isPlaying = false;
        }
        else {
            this._curProgress += this._animSpeed * deltaTime;
        }
        this.loadProgressText!.string = Math.floor(this._curProgress).toString() + "%";

        if (!this._isPlaying) {
            if(this._callback) {
                this._callback.call(this._backTarget, this._curProgress);
            }
        }
    }

    public get Visible() {
        return this.node.active;
    }
    
    showLoadProgress (start?: number, tips?: string) {
        if (start) {
            this._targetProgress = Math.min(start, 100);
        } else {
            this._targetProgress = 0;
        }

        if (tips) {
            this.loadTipText!.string = tips;
        }

        this._isPlaying = false;
        this._curProgress = this._targetProgress;
        this.loadProgressText!.string = this._curProgress.toString() + "%";
        this.node.active = true;
    }

    hideLoadProgress() {
        this.node.active = false;
    }

    updateProgress(progress: number, time:number = 1, tips?: string, callback?:Function, target?:any) {
        this._targetProgress = Math.min(progress, 100);
        this._callback = callback;
        this._backTarget = target;

        this.playUpdateValue(this._curProgress, this._targetProgress, time);
    }

    private playUpdateValue(startVal: number, endVal: number, changingTime?: number) {
        
        let diffProgress = (endVal - startVal);
        this._changingTime = changingTime || (this._animSpeed / 20); //1秒加载20%
        this._animSpeed = diffProgress / this._changingTime;
        this._currTime = 0;
        this._isPlaying = true;
    }

}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
