import { _decorator, Component, Node, Label, Vec3, tween, isValid, UITransform, Animation, Overflow } from 'cc';
import { poolManager } from '../framework/poolManager';


const { ccclass, property } = _decorator;

@ccclass('tips')
export class tips extends Component {
    @property(Label)
    lbTips: Label = null!;
    targetPos: any;
    anim: Animation = null!;
    callback: Function = null!;

    onLoad () {
        // Your initialization goes here.
        this.anim = this.node.getComponent(Animation);
    }

    onEnable() {
        this.anim.on(Animation.EventType.FINISHED, this.playFinished, this);
    }

    onDisable() {
        this.anim.off(Animation.EventType.FINISHED, this.playFinished, this);
    }

    show (content: string, callback?: Function) {
        this.targetPos = new Vec3(0, 200, 0);
        this.node.setPosition(this.targetPos);
        // this.node.getComponent(Sprite).color = new Color(255, 255, 255, 255);

        // this.lbTips.maxWidth = 0;
        // this.lbTips.string = '<color=#001D34>'+ content +'</color>';

        // //修改底图大小
        // let width = this.lbTips._linesWidth;
        // if (width.length && width[0] < 500) {
        //     this.lbTips.maxWidth = width[0];
        // } else {
        //     this.lbTips.maxWidth = 500;
        //     this.lbTips.node.setContentSize(500, this.lbTips.node.getContentSize().height);
        // }
        this.lbTips.string = content;
        this.lbTips.overflow = Overflow.NONE
        this.lbTips.updateRenderData(true)
        const lbTipTrans = this.lbTips.node.getComponent(UITransform)!;
        let size = lbTipTrans.contentSize;
        if (!isValid(size)) {//size不存在，自我销毁
            // tipsNode.destroy();
            poolManager.instance.putNode(this.node);
            return;
        }

        const uiTrans = this.node.getComponent(UITransform)!;
        uiTrans.setContentSize(size.width + 100 < 240 ? 240 : size.width + 100, size.height + 30);
        this.callback = callback;

        this.anim.play();
/*
        this.scheduleOnce(()=>{
            tween(this.targetPos)
                .by(0.8, new Vec3(0, 150, 0))
                .call(()=>{
                    callback && callback();
                    poolManager.instance.putNode(this.node);
                })
                .start();
        }, 0.8);*/
    }

    playFinished() {
        this.callback && this.callback();
        poolManager.instance.putNode(this.node);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
