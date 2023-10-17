import { DataPickUp } from "./data_pickup.mjs";
import tms_api from "./tms_api.mjs";

export default async function (eve) {

    //ボタン作成
    const addObj = new Kuc.Button({
        text: 'TMS採番',
        type: 'submit',
        // className: 'options-class',
        id: 'qrAddBtn'
    });

    //描画
    const btnSpace = kintone.app.record.getSpaceElement('tms_btn_space');
    addObj.onclick = async function () {

        //regiDataには登録用データが格納される。異常値がある場合は-1が入る。
        let regiData = await DataPickUp(eve);
        if (regiData == -1 ) return;

        //API実行
        let res = await tms_api(regiData);

        //最終処理
        finalDisposal(res);
    }
    btnSpace.appendChild(addObj);

}

//最終処理
function finalDisposal(res) {
    // console.log(res);
    if (res === -99) return; //POSTでエラー

    //status 0以外はTMS側からのエラー
    if (res.status !== "0") {
        notification.text = 'TMS登録時にエラーが発生しました。';
        notification.open();
        return -98;
    }

    //戻ったUIDをTableへ描画
    let record = kintone.app.record.get().record;
    let tables = record.tms_table.value;
    // console.log(tables);
    //TMSから返ってきたUIDでmap
    res.list.map((elm, index) => {
        //kintone上のテーブル、uidにデータを入れていく
        tables[index].value.tms_uid.value = elm.unique_id;
    });
    //レコード反映
    kintone.app.record.set({ record });

}

/**画面上部エラー表示用 */
const notification = new Kuc.Notification({
    text: '',
    type: 'danger',
    className: 'options-class',
    duration: 2000,
    container: document.body
});