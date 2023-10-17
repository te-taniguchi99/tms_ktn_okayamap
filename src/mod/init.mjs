/**
 * 初期化処理
 */

export function Init(e) {
    TableInit(e);
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