import BtnFunc from "./mod/btn_func.mjs";
import { Init } from "./mod/init.mjs";
import submit from "./mod/submit.mjs";

const registUser = { 'comp_code': 'taiyo', 'user_id': 'adminuser', 'pass_word': 'AdminPass0' };

(($) => {
    'use strict';
    //新規作成・編集時イベント
    console.log("tms_ktn_get_uid:start");
    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (e) => {

        Init(e);
        // debugInput(e);  //デバッグ用
        BtnFunc(e);
        // return e;

    });

    //レコード追加・編集画面　保存ボタン押下時
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async e => {
        const x = await submit(e);
        if (x === -1) {
            console.log('dataPickupで不正データ');
            e.record['数量'].error = 'TMS採番で不正なデータ';
            console.log(e);
            return e;
        }
        return e;
    })

    //テーブル行作成時イベント
    kintone.events.on(["app.record.create.change.tms_table", "app.record.edit.change.tms_table"], (e) => {
        // console.log(e);
        if (e.changes.row) {
            //uid編集不可へ
            e.changes.row.value.tms_uid.disabled = true;
        }
        return e;
    })

})(jQuery);

function debugInput(e) {
    // console.log(e);
    e.record['商品名'].value = "TEST";
    e.record['大分類'].value = "繊維スリング";
    e.record['数量'].value = 1;
}