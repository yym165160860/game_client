/*
 * @Author: Y*Y*M
 * @Date: 2021-12-22 15:28:37
 * @Description: 弹框提示
 * @FilePath: \ludo\assets\script\common\popup.ts
 */
import { _decorator, Node, Component, Label, Button, RichText } from 'cc';

import { poolManager } from '../framework/poolManager';
import { i18n } from '../i18nMaster/runtime-scripts/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('popup')
export class popup extends Component {

    @property(Label)
    contentLabel: Label = null!;

    @property({type:Node})
    okButtonNode:Node|null = null;

    @property(Node)
    cancelButtonNode:Node|null = null;

    _okBtnTxtLabel: Label|null = null!;
    _cancelBtnTxtLabel: Label|null = null!;


    nCountDown: number = 10;
    btnSourceText: string = null!;
    callback: Function|null = null!;

    onLoad() {
        this._okBtnTxtLabel = this.okButtonNode!.getChildByName("Label")!.getComponent(Label);
        this._cancelBtnTxtLabel = this.cancelButtonNode!.getChildByName("Label")!.getComponent(Label);
    }

    show(content: string, btnText?: Array<string|null>|null, nSeconds?: number, cb?: Function) {
        this.cancelButtonNode!.active = false;

        this.contentLabel.string = content;

        if (btnText) {
            this._okBtnTxtLabel!.string = btnText[0] || i18n.t("common.ok");
            this._cancelBtnTxtLabel!.string = btnText[1] || i18n.t("common.cancel");

            if (btnText.length >= 2) {
                this.cancelButtonNode!.active = true;
            }
        }
        else {
            this._okBtnTxtLabel!.string = i18n.t("common.ok");
        }


        this.unschedule(this.intervalHandle);

        if (nSeconds && nSeconds > 0) {
            this.nCountDown = nSeconds;
            this.schedule(this.intervalHandle, 1, nSeconds - 1);
        }

        if (cb) {
            this.callback = cb;
        } else {
            this.callback = null;
        }
    }

    intervalHandle() {
        this.nCountDown--;

        this._okBtnTxtLabel!.string = `${this.btnSourceText} (${this.nCountDown})`;

        if (this.nCountDown <= 0) {
            this.closePopup(1);
        }
    }

    public clickOkButton() {
        this.closePopup(1);
    }

    public clickCancelButton() {
        this.closePopup(2);
    }

    // 关闭弹框，index(1==ok, 其它==cancel)
    private closePopup(index:number) {
        this.unschedule(this.intervalHandle);

        this.callback && this.callback(index);
        poolManager.instance.putNode(this.node);
    }
}
