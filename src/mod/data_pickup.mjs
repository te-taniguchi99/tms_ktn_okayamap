import trance_master from "./trance_master.mjs";
import check_regidata from "./check_regidata.mjs";

/**
 * 登録前のデータ取得とチェック　onClickイベント時とkintone.eventで処理分ける
 * @param {*} eve Eventオブジェクト
 * @returns 0->uidが存在しない -1->何かしらのエラー
 */
export async function DataPickUp(eve) {
    // console.log(eve)

    //登録用　mixture_idはuidとsnのobj配列
    //exp. [{unique_id: xxxxxxxx, serial_number:xxxxxx}, .... ]
    let registData = {
        mixture_id: [], product_name: '', model_number: '', manufacturer_code: '1',
        major_division: '', middle_division: '', production_date: '', order_number: '', size: '',
        weight: '', quantity: ''
    };

    //現在のフィールド内容取得　イベント発生元で処理分岐
    //「TMS採番」押下：typeは"app.record.edit.show"
    //  引数は、イベント登録時時点のレコード情報になる
    //「保存」押下：typeは"app.record.edit.submit.success"
    //　引数は、保存押下時時点のレコード情報になる
    let record = "";
    let myEveType;
    //TMS採番なので、レコード情報再取得
    if (eve.type === "app.record.edit.show" || eve.type === "app.record.create.show") {
        // console.log('Get record');
        record = kintone.app.record.get().record;
        myEveType = 'getNumber';
    } else {
        record = eve.record;
        myEveType = 'save';
    }

    // console.log(record);

    //数量
    registData.quantity = record['数量'].value;
    if (!registData.quantity) {
        notification.text = 'TMS採番 「数量」が指定されていません。';
        notification.open();
        return -1;
    }

    //「保存」時は数量がテーブル行数を超過している時はエラー(TMS採番時は処理継続)
    // 但し、テーブルに入力されているUIDの数を基準とする。
    if (eve.type === "app.record.edit.submit" || eve.type === "app.record.create.submit") {    //保存時
        //UIDの数を取得
        let uidCount = eve.record.tms_table.value.map(e => {
            let val = e.value.tms_uid.value;
            return (val == '' || val == undefined) ? false : true;
        });

        // console.log(uidCount);

        //trueが返ると、UIDが1つ以上存在する事になる
        if (!uidCount.includes(true)) {
            return 0;
        }
        //UIDが1つ以上あるので、TMSエラーチェック
        // console.log(registData.quantity);
        // console.log(record.tms_table.value.length);

        if (registData.quantity != record.tms_table.value.length) {
            console.log(record);
            notification.text = 'TMS採番 テーブルの行数が「数量」を上回っています。1';
            notification.open();
            return -1;
        }
    } else {

        //「TMS採番」押下時は、テーブルの行数が数量を上回っていた場合、エラー
        if (registData.quantity < record.tms_table.value.length) {
            console.log(record);
            notification.text = 'TMS採番 テーブルの行数が「数量」を上回っています。2';
            notification.open();
            return -1;
        }
    }

    //共通フィールﾄﾞデータをobjへ変換していく
    registData.product_name = record['商品名'].value;

    //マスタ変換---------------------------------------
    //
    let master = await trance_master(record['文字列__1行__2'].value);
    console.log(master);
    if (master !== -1) {    //マスタに存在する時のみ
        registData.model_number = master.model_number.value;  //型番
        registData.weight = master.weight.value;              //使用荷重
        registData.size = master.size.value;                  //サイズ
        registData.jan_code = master.jan_code.value;          //JANコード
        //マスタから取得したデータをフォームに表示 
        console.log(record);
        record.model_number.value = master.model_number.value;
        record.weight.value = master.weight.value;
        record.size.value = master.size.value;
        //TMS採番ボタンならset　保存ボタンならset不要(というかエラーでる)
        if (myEveType === 'getNumber') kintone.app.record.set({ record });

    }
    //-------------------------------------------------
    registData.major_division = ChangeMajor(record['大分類'].value);
    registData.middle_division = record['中分類'].value;
    registData.production_date = record['tms_mfd'].value;
    registData.order_number = record['文字列__1行__0'].value;

    //テーブル行データ取得(同時に不足分の行も作成)
    let tableData = AdjustTableRow(record);

    //登録データuidとsnを含めて作成(tableから)
    registData.mixture_id = tableData;

    //必須チェック
    if (check_regidata(registData, record) === -1) {
        return -1;
    };

    return registData;
}

/**
 * 大分類名をコードへ変換して返す
 * 戻り値：-1でエラー
 * @param {*} name 
 */
function ChangeMajor(name) {
    switch (name) {
        case '繊維スリング':
            return 5;
        case 'スリングセット':
            return 9;
        default:
            return -1;
    }
}

/**
 * テーブル行数調整 TMS採番ボタン押下時のみ
 * @param {*} num 数量
 * @param {*} table テーブルobj
 */
function AdjustTableRow(record) {
    //現在のテーブル行数と比較 同じなら終了
    let nowTableRowCount = record.tms_table.value.length;
    let num = record['数量'].value;
    let defCount = num - nowTableRowCount;
    // console.log(defCount);

    //テーブル行数が不足している時追加
    if (defCount !== 0) {

        const addObj = {
            id: null,
            value: {
                'tms_sn': {
                    value: "",
                    type: "SINGLE_LINE_TEXT"
                },
                //uidは編集不可に
                'tms_uid': {
                    disabled: true,
                    value: "",
                    type: "SINGLE_LINE_TEXT"
                }
            }
        };
        //table構造をpush
        for (let i = 0; i < defCount; i++) {
            record.tms_table.value.push(addObj);
        }

        // console.log(record);
        kintone.app.record.set({ record });
    }

    //テーブルのデータを取得して配列へ
    // record = kintone.app.record.get().record;

    let tableData = [];
    record.tms_table.value.map(e => {
        tableData.push({
            unique_id: e.value.tms_uid.value,
            serial_number: e.value.tms_sn.value
        })
    })

    return tableData;

}

/**画面上部エラー表示用 */
const notification = new Kuc.Notification({
    text: '',
    type: 'danger',
    className: 'options-class',
    duration: 2000,
    container: document.body
});