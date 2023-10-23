/**
 * 初期化処理
 */

export function Init(e) {
    TableInit(e);
    EnabledColumn(e);
}

/**
 * テーブルUIDを編集不可に
 */
function TableInit(elm) {
    elm.record.tms_table.value.map(e => {
        // console.log(e);
        e.value.tms_uid.disabled = true;
    });
}

/**
 * 型番・使用荷重・サイズを編集不可に
 */
function EnabledColumn(elm){
    console.log(elm);
    elm.record.model_number.disabled = true;    //型番
    elm.record.weight.disabled = true;    //使用荷重
    elm.record.size.disabled = true;    //サイズ
}