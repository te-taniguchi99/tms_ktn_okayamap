//レコード保存時処理

import { DataPickUp } from "./data_pickup.mjs";
import tms_api from "./tms_api.mjs";

export default async function (e) {

    let myData = await DataPickUp(e);
    //DataPickupでエラートラップ
    if (myData === -1) return -1;
    if (myData === 0) return 0; //保存押下かつUIDが無い場合はTMS_API処理無し

    let result = await tms_api(myData);
    // console.log(result);

}

