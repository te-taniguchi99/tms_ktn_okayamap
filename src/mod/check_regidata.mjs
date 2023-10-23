
/**
 * TMSボタン押下時、登録内容チェック
 * 引数：必須項目の連想配列
 * 正常→0が返る　NG→ -1が返る
 * @param {object} obj 
 */
export default function (obj, record) {
    /**
     * 必須項目
     * 製品名：product_name,
     * 大分類：major_division,
     */
    // console.log(obj);
    // let record = kintone.app.record.get().record;

    //商品名必須
    if (!obj.product_name) {
        record['商品名'].error = '[TMS]製品名は必須項目です。';
        kintone.app.record.set({ record });
        return -1;
    } else if (obj.major_division === -1) {
        record['大分類'].error =
            '[TMS]設定されてない、又は誤った名称です。使用出来る大分類は「繊維スリング」「スリングセット」のみです。';
        kintone.app.record.set({ record });
        return -1;
    }

    //桁数チェック
    //uidとSN
    let checkUid = true;
    obj.mixture_id.map(e => {
        //UIDが空白(undefined)では無い時、10文字であること
        if (e.unique_id !== undefined) {
            if (e.unique_id.length !== 10 && e.unique_id.length !== 0) {
                notification.text = "[TMS] UIDの桁数が異常。空白又は半角数字10文字のみ許可されます。";
                notification.open();
                checkUid = false;
            } else {
                //数値かどうかチェック
                if (isNaN(e.unique_id)) {
                    notification.text = "[TMS] UIDは数値のみ許可されます。";
                    notification.open();
                    checkUid = false;
                }
            }
        }

        //SNチェック　20文字英数のみ
        if (e.serial_number !== undefined) {
            //英数かどうか
            if (e.serial_number.match(/^[A-Za-z0-9]*$/)) {
                //英数字である
                if (e.serial_number.length > 20) {
                    notification.text = "[TMS] SNは20文字以内です。";
                    notification.open();
                    checkUid = false;
                }
            } else {
                notification.text = "[TMS] SNは英数のみ使用出来ます。";
                notification.open();
                checkUid = false;
            }
        }

    });

    //型番桁数 20文字英数
    if (obj.model_number !== undefined) {
        //英数かどうか
        if (obj.model_number.match(/^[a-zA-Z0-9-_\.]*$/)) {
            //英数字である
            if (obj.model_number.length > 20) {
                notification.text = "[TMS] 型番は20文字以内です。";
                notification.open();
                checkUid = false;
            }
        } else {
            notification.text = "[TMS] 型番は英数のみ使用出来ます。";
            notification.open();
            checkUid = false;
        }
    }

    //チェックでエラーの時は抜ける
    if (checkUid === false) {
        return -1;
    }

    //製品名長さチェック
    if (obj.product_name.length > 50) {
        record['商品名'].error = '[TMS]製品名の長さは50文字までです。';
        kintone.app.record.set({ record });
        return -1;
    }

    return 0;
}


/**画面上部エラー表示用 */
const notification = new Kuc.Notification({
    text: '',
    type: 'danger',
    className: 'options-class',
    duration: 5000,
    container: document.body
});