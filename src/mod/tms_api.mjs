/**
 * TMS_API実行部　
 */

//登録用ID等
const param = {
    id: 'dGFpeW86cGVnYXN1czE6cGVzdSM5OTE=',
    url_dev: 'https://tsuriscope.jp/manager_pre/ApiProducts/add',
    url_product: 'https://tsuriscope.jp/manager/ApiProducts/add'
}

/**
 * 
 * @param {*} regiData 一応エラーチェックされた登録用データ
 * @returns TMSからの結果
 */
export default async function (regiData) {
    let putData = FormatData(regiData);   //regiDataからfetch用データ(json形式)の作成
    let postRes = await Posting(putData);
    return postRes;
}

//登録用データへ整形する
function FormatData(data) {

    const throwData = {};
    const lx = luxon.DateTime.local();
    const formatDate = lx.toFormat('yyyyMMddHHmmss');

    //共通日付部
    throwData.created_datetime = formatDate;

    //個別繰り返し部の作成
    const qt = data.quantity;
    let myList = [];
    //数量分繰り返し
    for (let i = 0; i < qt; i++) {
        myList.push({
            "unique_id": data.mixture_id[i].unique_id,
            "product_name": data.product_name,
            "serial_number": data.mixture_id[i].serial_number,
            "model_number": data.model_number,
            "manufacturer_code": data.manufacturer_code,
            "jan_code": data.jan_code,
            "major_division": data.major_division,
            "middle_division": data.middle_division,
            "production_date": data.production_date,
            "order_number": data.order_number,
            "customer_code": data.customer_code,
            "size": data.size,
            "weight": data.weight,
            "product_link": data.product_link
        });
    }
    // console.log(myList);
    throwData.list = myList;
    return throwData;

}

//TMSへDataをPOSTする
/**
 * DataをTMSへPOSTする
 * @param {*} data 登録用データobj
 * @returns     
 */
async function Posting(data) {
    const headers = {
        'Content-Type': 'application/json',
        'X-ITFAuth': param.id,
        'Authorization': 'Basic cHJlVGVzdGVyOlRAaXlvMjAyMw=='
    }

    //Debug用
    const testData = {
        "created_datetime": "20231013090200",
        "list": [
            {
                "product_name": "HOGE2",
                "manufacturer_code": 1,
                "major_division": 1
            }
        ]
    };

    let hogetan;
    try {
        hogetan = await kintone.proxy(param.url_dev, 'POST', headers, data);
    } catch (error) {
        let msg = JSON.parse(error).message;
        console.log(msg);
        window.alert('[TMS]TMSへのAPIでPOSTエラー\n' + msg);
        return -99;
    }
    // console.log(hogetan);
    return JSON.parse(hogetan[0]);

}
