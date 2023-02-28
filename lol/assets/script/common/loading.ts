/*
 * @Author: your name
 * @Date: 2021-09-19 08:37:38
 * @LastEditTime: 2021-09-26 20:25:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cocos_game\assets\script\ui\common\loading.ts
 */
import { _decorator, Component, Node, UITransform, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("loading")
export class loading extends Component {

    @property(UITransform)
    lbProgress: UITransform = null!;

    @property(Label)
    lbTips: Label = null!;

    isPlaying: boolean = false;
    startVal = 0;
    endVal = 0;
    diffVal = 0;
    currTime = 0;
    changingTime = 0;
    maxWidth: number = 0;
    curProgress: number = 0;
    tipValue: string = '';
    callback:Function = null;
    target:any = null;

    targetProgress = 0;

    show (start?: number, tips?: string) {
        if (start) {
            this.targetProgress = start;
        } else {
            this.targetProgress = 0;
        }

        this.maxWidth = this.node.getComponent(UITransform)!.width;
        this.curProgress = this.targetProgress;
        this.playUpdateValue(this.targetProgress, this.targetProgress, 0);
        this.isPlaying = false;
        if (tips) {
            this.tipValue = tips
        }

        if (this.tipValue) {
            this.lbTips.string = `${this.tipValue} (${this.targetProgress.toString()}%)`;
        } else {
            this.lbTips.string = '';
        }
    }

    updateProgress(progress: number, tips?: string, callback?:Function, target?:any) {
        this.targetProgress = progress;
        this.callback = callback;
        this.target = target;

        this.playUpdateValue(this.curProgress, this.targetProgress, (this.targetProgress - this.curProgress) / 20);

        if (tips) {
            this.tipValue = tips
        }
    }

    playUpdateValue(startVal: number, endVal: number, changingTime: number) {
        this.startVal = startVal;
        this.endVal = endVal;

        this.diffVal = this.endVal - this.startVal;

        this.currTime = 0;
        this.changingTime = changingTime;

        this.lbTips.string = `${this.tipValue} (${this.startVal}%)`;
        this.lbProgress.width = this.maxWidth * (this.startVal / 100);

        this.isPlaying = true;
    }

    update(dt: number) {
        if(!this.isPlaying) {
            return;
        }

        if(this.currTime < this.changingTime) {
            this.currTime += dt;

            var currVal = this.startVal + parseInt((this.currTime / this.changingTime * this.diffVal).toString());
            if (currVal < this.startVal) {
                currVal = this.startVal;
            } else if (currVal > this.endVal) {
                currVal = this.endVal;
            }

            this.curProgress = currVal;
            this.lbTips.string = `${this.tipValue} (${currVal}%)`;
            this.lbProgress.width = this.maxWidth * (currVal / 100);
            return;
        }

        this.curProgress = this.endVal;
        this.lbTips.string = `${this.tipValue} (${this.endVal}%)`;
        this.lbProgress.width = this.maxWidth * (this.endVal / 100);
        if (this.callback) {
            this.callback.call(this.target, this.curProgress);
        }
        this.isPlaying = false;
    }
}
