/**
 * TMS_変換マスタ　アプリから商品コードをキーとしてレコードを返す
 * 指定されたコードが存在しない時は、-1を返す
 * @param {*} prodCode 
 */
export default async function (prodCode) {
    // console.log(prodCode);

    const body = {
        app: 250,
        query: `prod_code = "${prodCode}"`,
        totalCount: true
    }

    let res = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
    console.log(res);
    //hitしなかった場合、totalCountで判定
    if (res.totalCount === '0') {
        return -1;
    } else {
        return res.records[0];
    }

}