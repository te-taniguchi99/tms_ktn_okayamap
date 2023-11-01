/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/mod/btn_func.mjs":
/*!******************************!*\
  !*** ./src/mod/btn_func.mjs ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_pickup_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data_pickup.mjs */ "./src/mod/data_pickup.mjs");
/* harmony import */ var _tms_api_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tms_api.mjs */ "./src/mod/tms_api.mjs");



/* harmony default export */ async function __WEBPACK_DEFAULT_EXPORT__(eve) {

    //ボタン作成
    const addObj = new Kuc.Button({
        text: 'TMS採番',
        type: 'submit',
        id: 'qrAddBtn'
    });
[]
    //描画
    const btnSpace = kintone.app.record.getSpaceElement('tms_btn_space');
    addObj.onclick = async function () {

        //regiDataには登録用データが格納される。異常値がある場合は-1が入る。
        let regiData = await (0,_data_pickup_mjs__WEBPACK_IMPORTED_MODULE_0__.DataPickUp)(eve);
        if (regiData == -1 ) return;

        //API実行
        let res = await (0,_tms_api_mjs__WEBPACK_IMPORTED_MODULE_1__["default"])(regiData);

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

/***/ }),

/***/ "./src/mod/check_regidata.mjs":
/*!************************************!*\
  !*** ./src/mod/check_regidata.mjs ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * TMSボタン押下時、登録内容チェック
 * 引数：必須項目の連想配列
 * 正常→0が返る　NG→ -1が返る
 * @param {object} obj 
 */
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(obj, record) {
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

/***/ }),

/***/ "./src/mod/data_pickup.mjs":
/*!*********************************!*\
  !*** ./src/mod/data_pickup.mjs ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DataPickUp: () => (/* binding */ DataPickUp)
/* harmony export */ });
/* harmony import */ var _trance_master_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./trance_master.mjs */ "./src/mod/trance_master.mjs");
/* harmony import */ var _check_regidata_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./check_regidata.mjs */ "./src/mod/check_regidata.mjs");



/**
 * 登録前のデータ取得とチェック　onClickイベント時とkintone.eventで処理分ける
 * @param {*} eve Eventオブジェクト
 * @returns 0->uidが存在しない -1->何かしらのエラー
 */
async function DataPickUp(eve) {
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
    let master = await (0,_trance_master_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])(record['文字列__1行__2'].value);
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
    if ((0,_check_regidata_mjs__WEBPACK_IMPORTED_MODULE_1__["default"])(registData, record) === -1) {
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

/***/ }),

/***/ "./src/mod/init.mjs":
/*!**************************!*\
  !*** ./src/mod/init.mjs ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Init: () => (/* binding */ Init)
/* harmony export */ });
/**
 * 初期化処理
 */

function Init(e) {
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

/***/ }),

/***/ "./src/mod/submit.mjs":
/*!****************************!*\
  !*** ./src/mod/submit.mjs ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_pickup_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data_pickup.mjs */ "./src/mod/data_pickup.mjs");
/* harmony import */ var _tms_api_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tms_api.mjs */ "./src/mod/tms_api.mjs");
//レコード保存時処理




/* harmony default export */ async function __WEBPACK_DEFAULT_EXPORT__(e) {

    let myData = await (0,_data_pickup_mjs__WEBPACK_IMPORTED_MODULE_0__.DataPickUp)(e);
    //DataPickupでエラートラップ
    if (myData === -1) return -1;
    if (myData === 0) return 0; //保存押下かつUIDが無い場合はTMS_API処理無し

    let result = await (0,_tms_api_mjs__WEBPACK_IMPORTED_MODULE_1__["default"])(myData);
    console.log(result);

}



/***/ }),

/***/ "./src/mod/tms_api.mjs":
/*!*****************************!*\
  !*** ./src/mod/tms_api.mjs ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
/* harmony default export */ async function __WEBPACK_DEFAULT_EXPORT__(regiData) {
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
        hogetan = await kintone.proxy(param.url_product, 'POST', headers, data);
    } catch (error) {
        let msg = JSON.parse(error).message;
        console.log(msg);
        window.alert('[TMS]TMSへのAPIでPOSTエラー\n' + msg);
        return -99;
    }
    // console.log(hogetan);
    return JSON.parse(hogetan[0]);

}


/***/ }),

/***/ "./src/mod/trance_master.mjs":
/*!***********************************!*\
  !*** ./src/mod/trance_master.mjs ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * TMS_変換マスタ　アプリから商品コードをキーとしてレコードを返す
 * 指定されたコードが存在しない時は、-1を返す
 * @param {*} prodCode 
 */
/* harmony default export */ async function __WEBPACK_DEFAULT_EXPORT__(prodCode) {
    // console.log(prodCode);

    const body = {
        app: 250,
        query: `prod_code = "${prodCode}"`,
        totalCount: true
    }

    let res = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
    // console.log(res);
    //hitしなかった場合、totalCountで判定
    if (res.totalCount === '0') {
        return -1;
    } else {
        return res.records[0];
    }

}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mod_btn_func_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mod/btn_func.mjs */ "./src/mod/btn_func.mjs");
/* harmony import */ var _mod_init_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mod/init.mjs */ "./src/mod/init.mjs");
/* harmony import */ var _mod_submit_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mod/submit.mjs */ "./src/mod/submit.mjs");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }



var registUser = {
  'comp_code': 'taiyo',
  'user_id': 'adminuser',
  'pass_word': 'AdminPass0'
};
(function ($) {
  'use strict';

  //新規作成・編集時イベント
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function (e) {
    (0,_mod_init_mjs__WEBPACK_IMPORTED_MODULE_1__.Init)(e);
    debugInput(e); //デバッグ用
    (0,_mod_btn_func_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])(e);
    // return e;
  });

  //レコード追加・編集画面　保存ボタン押下時
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
      var x;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,_mod_submit_mjs__WEBPACK_IMPORTED_MODULE_2__["default"])(e);
          case 2:
            x = _context.sent;
            if (!(x === -1)) {
              _context.next = 8;
              break;
            }
            console.log('dataPickupで不正データ');
            e.record['数量'].error = 'TMS採番で不正なデータ';
            console.log(e);
            return _context.abrupt("return", e);
          case 8:
            return _context.abrupt("return", e);
          case 9:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  //テーブル行作成時イベント
  kintone.events.on(["app.record.create.change.tms_table", "app.record.edit.change.tms_table"], function (e) {
    // console.log(e);
    if (e.changes.row) {
      //uid編集不可へ
      e.changes.row.value.tms_uid.disabled = true;
    }
    return e;
  });
})(jQuery);
function debugInput(e) {
  // console.log(e);
  e.record['商品名'].value = "TEST";
  e.record['大分類'].value = "繊維スリング";
  e.record['数量'].value = 1;
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDOztFQUVGO0VBQ0FILE9BQU8sQ0FBQ0MsTUFBTSxDQUFDQyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxrQ0FBa0MsQ0FBQyxFQUFFLFVBQUNDLENBQUMsRUFBSztJQUNqRztJQUNBLElBQUlBLENBQUMsQ0FBQ08sT0FBTyxDQUFDQyxHQUFHLEVBQUU7TUFDZjtNQUNBUixDQUFDLENBQUNPLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHLElBQUk7SUFDL0M7SUFDQSxPQUFPWCxDQUFDO0VBQ1osQ0FBQyxDQUFDO0FBRU4sQ0FBQyxFQUFFWSxNQUFNLENBQUM7QUFFVixTQUFTWCxVQUFVLENBQUNELENBQUMsRUFBRTtFQUNuQjtFQUNBQSxDQUFDLENBQUNLLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQ0ksS0FBSyxHQUFHLE1BQU07RUFDOUJULENBQUMsQ0FBQ0ssTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDSSxLQUFLLEdBQUcsUUFBUTtFQUNoQ1QsQ0FBQyxDQUFDSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUNJLEtBQUssR0FBRyxDQUFDO0FBQzVCLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2J0bl9mdW5jLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2NoZWNrX3JlZ2lkYXRhLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2RhdGFfcGlja3VwLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2luaXQubWpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2Qvc3VibWl0Lm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL3Rtc19hcGkubWpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2QvdHJhbmNlX21hc3Rlci5tanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFQaWNrVXAgfSBmcm9tIFwiLi9kYXRhX3BpY2t1cC5tanNcIjtcclxuaW1wb3J0IHRtc19hcGkgZnJvbSBcIi4vdG1zX2FwaS5tanNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChldmUpIHtcclxuXHJcbiAgICAvL+ODnOOCv+ODs+S9nOaIkFxyXG4gICAgY29uc3QgYWRkT2JqID0gbmV3IEt1Yy5CdXR0b24oe1xyXG4gICAgICAgIHRleHQ6ICdUTVPmjqHnlaonLFxyXG4gICAgICAgIHR5cGU6ICdzdWJtaXQnLFxyXG4gICAgICAgIGlkOiAncXJBZGRCdG4nXHJcbiAgICB9KTtcclxuW11cclxuICAgIC8v5o+P55S7XHJcbiAgICBjb25zdCBidG5TcGFjZSA9IGtpbnRvbmUuYXBwLnJlY29yZC5nZXRTcGFjZUVsZW1lbnQoJ3Rtc19idG5fc3BhY2UnKTtcclxuICAgIGFkZE9iai5vbmNsaWNrID0gYXN5bmMgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAvL3JlZ2lEYXRh44Gr44Gv55m76Yyy55So44OH44O844K/44GM5qC857SN44GV44KM44KL44CC55Ww5bi45YCk44GM44GC44KL5aC05ZCI44GvLTHjgYzlhaXjgovjgIJcclxuICAgICAgICBsZXQgcmVnaURhdGEgPSBhd2FpdCBEYXRhUGlja1VwKGV2ZSk7XHJcbiAgICAgICAgaWYgKHJlZ2lEYXRhID09IC0xICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL0FQSeWun+ihjFxyXG4gICAgICAgIGxldCByZXMgPSBhd2FpdCB0bXNfYXBpKHJlZ2lEYXRhKTtcclxuXHJcbiAgICAgICAgLy/mnIDntYLlh6bnkIZcclxuICAgICAgICBmaW5hbERpc3Bvc2FsKHJlcyk7XHJcbiAgICB9XHJcbiAgICBidG5TcGFjZS5hcHBlbmRDaGlsZChhZGRPYmopO1xyXG5cclxufVxyXG5cclxuLy/mnIDntYLlh6bnkIZcclxuZnVuY3Rpb24gZmluYWxEaXNwb3NhbChyZXMpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICBpZiAocmVzID09PSAtOTkpIHJldHVybjsgLy9QT1NU44Gn44Ko44Op44O8XHJcblxyXG4gICAgLy9zdGF0dXMgMOS7peWkluOBr1RNU+WBtOOBi+OCieOBruOCqOODqeODvFxyXG4gICAgaWYgKHJlcy5zdGF0dXMgIT09IFwiMFwiKSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSAnVE1T55m76Yyy5pmC44Gr44Ko44Op44O844GM55m655Sf44GX44G+44GX44Gf44CCJztcclxuICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgIHJldHVybiAtOTg7XHJcbiAgICB9XHJcblxyXG4gICAgLy/miLvjgaPjgZ9VSUTjgpJUYWJsZeOBuOaPj+eUu1xyXG4gICAgbGV0IHJlY29yZCA9IGtpbnRvbmUuYXBwLnJlY29yZC5nZXQoKS5yZWNvcmQ7XHJcbiAgICBsZXQgdGFibGVzID0gcmVjb3JkLnRtc190YWJsZS52YWx1ZTtcclxuICAgIC8vIGNvbnNvbGUubG9nKHRhYmxlcyk7XHJcbiAgICAvL1RNU+OBi+OCiei/lOOBo+OBpuOBjeOBn1VJROOBp21hcFxyXG4gICAgcmVzLmxpc3QubWFwKChlbG0sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgLy9raW50b25l5LiK44Gu44OG44O844OW44Or44CBdWlk44Gr44OH44O844K/44KS5YWl44KM44Gm44GE44GPXHJcbiAgICAgICAgdGFibGVzW2luZGV4XS52YWx1ZS50bXNfdWlkLnZhbHVlID0gZWxtLnVuaXF1ZV9pZDtcclxuICAgIH0pO1xyXG4gICAgLy/jg6zjgrPjg7zjg4nlj43mmKBcclxuICAgIGtpbnRvbmUuYXBwLnJlY29yZC5zZXQoeyByZWNvcmQgfSk7XHJcblxyXG59XHJcblxyXG4vKirnlLvpnaLkuIrpg6jjgqjjg6njg7zooajnpLrnlKggKi9cclxuY29uc3Qgbm90aWZpY2F0aW9uID0gbmV3IEt1Yy5Ob3RpZmljYXRpb24oe1xyXG4gICAgdGV4dDogJycsXHJcbiAgICB0eXBlOiAnZGFuZ2VyJyxcclxuICAgIGNsYXNzTmFtZTogJ29wdGlvbnMtY2xhc3MnLFxyXG4gICAgZHVyYXRpb246IDIwMDAsXHJcbiAgICBjb250YWluZXI6IGRvY3VtZW50LmJvZHlcclxufSk7IiwiXHJcbi8qKlxyXG4gKiBUTVPjg5zjgr/jg7PmirzkuIvmmYLjgIHnmbvpjLLlhoXlrrnjg4Hjgqfjg4Pjgq9cclxuICog5byV5pWw77ya5b+F6aCI6aCF55uu44Gu6YCj5oOz6YWN5YiXXHJcbiAqIOato+W4uOKGkjDjgYzov5TjgovjgIBOR+KGkiAtMeOBjOi/lOOCi1xyXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqIFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9iaiwgcmVjb3JkKSB7XHJcbiAgICAvKipcclxuICAgICAqIOW/hemgiOmgheebrlxyXG4gICAgICog6KO95ZOB5ZCN77yacHJvZHVjdF9uYW1lLFxyXG4gICAgICog5aSn5YiG6aGe77yabWFqb3JfZGl2aXNpb24sXHJcbiAgICAgKi9cclxuICAgIC8vIGNvbnNvbGUubG9nKG9iaik7XHJcbiAgICAvLyBsZXQgcmVjb3JkID0ga2ludG9uZS5hcHAucmVjb3JkLmdldCgpLnJlY29yZDtcclxuXHJcbiAgICAvL+WVhuWTgeWQjeW/hemgiFxyXG4gICAgaWYgKCFvYmoucHJvZHVjdF9uYW1lKSB7XHJcbiAgICAgICAgcmVjb3JkWyfllYblk4HlkI0nXS5lcnJvciA9ICdbVE1TXeijveWTgeWQjeOBr+W/hemgiOmgheebruOBp+OBmeOAgic7XHJcbiAgICAgICAga2ludG9uZS5hcHAucmVjb3JkLnNldCh7IHJlY29yZCB9KTtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKG9iai5tYWpvcl9kaXZpc2lvbiA9PT0gLTEpIHtcclxuICAgICAgICByZWNvcmRbJ+Wkp+WIhumhniddLmVycm9yID1cclxuICAgICAgICAgICAgJ1tUTVNd6Kit5a6a44GV44KM44Gm44Gq44GE44CB5Y+I44Gv6Kqk44Gj44Gf5ZCN56ew44Gn44GZ44CC5L2/55So5Ye65p2l44KL5aSn5YiG6aGe44Gv44CM57mK57at44K544Oq44Oz44Kw44CN44CM44K544Oq44Oz44Kw44K744OD44OI44CN44Gu44G/44Gn44GZ44CCJztcclxuICAgICAgICBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvL+ahgeaVsOODgeOCp+ODg+OCr1xyXG4gICAgLy91aWTjgahTTlxyXG4gICAgbGV0IGNoZWNrVWlkID0gdHJ1ZTtcclxuICAgIG9iai5taXh0dXJlX2lkLm1hcChlID0+IHtcclxuICAgICAgICAvL1VJROOBjOepuueZvSh1bmRlZmluZWQp44Gn44Gv54Sh44GE5pmC44CBMTDmloflrZfjgafjgYLjgovjgZPjgahcclxuICAgICAgICBpZiAoZS51bmlxdWVfaWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAoZS51bmlxdWVfaWQubGVuZ3RoICE9PSAxMCAmJiBlLnVuaXF1ZV9pZC5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBVSUTjga7moYHmlbDjgYznlbDluLjjgILnqbrnmb3lj4jjga/ljYrop5LmlbDlrZcxMOaWh+Wtl+OBruOBv+ioseWPr+OBleOCjOOBvuOBmeOAglwiO1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL+aVsOWApOOBi+OBqeOBhuOBi+ODgeOCp+ODg+OCr1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGUudW5pcXVlX2lkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBVSUTjga/mlbDlgKTjga7jgb/oqLHlj6/jgZXjgozjgb7jgZnjgIJcIjtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU07jg4Hjgqfjg4Pjgq/jgIAyMOaWh+Wtl+iLseaVsOOBruOBv1xyXG4gICAgICAgIGlmIChlLnNlcmlhbF9udW1iZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvL+iLseaVsOOBi+OBqeOBhuOBi1xyXG4gICAgICAgICAgICBpZiAoZS5zZXJpYWxfbnVtYmVyLm1hdGNoKC9eW0EtWmEtejAtOV0qJC8pKSB7XHJcbiAgICAgICAgICAgICAgICAvL+iLseaVsOWtl+OBp+OBguOCi1xyXG4gICAgICAgICAgICAgICAgaWYgKGUuc2VyaWFsX251bWJlci5sZW5ndGggPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBTTuOBrzIw5paH5a2X5Lul5YaF44Gn44GZ44CCXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja1VpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSBcIltUTVNdIFNO44Gv6Iux5pWw44Gu44G/5L2/55So5Ye65p2l44G+44GZ44CCXCI7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tVaWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL+Wei+eVquahgeaVsCAyMOaWh+Wtl+iLseaVsFxyXG4gICAgaWYgKG9iai5tb2RlbF9udW1iZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIC8v6Iux5pWw44GL44Gp44GG44GLXHJcbiAgICAgICAgaWYgKG9iai5tb2RlbF9udW1iZXIubWF0Y2goL15bYS16QS1aMC05LV9cXC5dKiQvKSkge1xyXG4gICAgICAgICAgICAvL+iLseaVsOWtl+OBp+OBguOCi1xyXG4gICAgICAgICAgICBpZiAob2JqLm1vZGVsX251bWJlci5sZW5ndGggPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSBcIltUTVNdIOWei+eVquOBrzIw5paH5a2X5Lul5YaF44Gn44GZ44CCXCI7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tVaWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSDlnovnlarjga/oi7HmlbDjga7jgb/kvb/nlKjlh7rmnaXjgb7jgZnjgIJcIjtcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgY2hlY2tVaWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/jg4Hjgqfjg4Pjgq/jgafjgqjjg6njg7zjga7mmYLjga/mipzjgZHjgotcclxuICAgIGlmIChjaGVja1VpZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy/oo73lk4HlkI3plbfjgZXjg4Hjgqfjg4Pjgq9cclxuICAgIGlmIChvYmoucHJvZHVjdF9uYW1lLmxlbmd0aCA+IDUwKSB7XHJcbiAgICAgICAgcmVjb3JkWyfllYblk4HlkI0nXS5lcnJvciA9ICdbVE1TXeijveWTgeWQjeOBrumVt+OBleOBrzUw5paH5a2X44G+44Gn44Gn44GZ44CCJztcclxuICAgICAgICBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gMDtcclxufVxyXG5cclxuXHJcbi8qKueUu+mdouS4iumDqOOCqOODqeODvOihqOekuueUqCAqL1xyXG5jb25zdCBub3RpZmljYXRpb24gPSBuZXcgS3VjLk5vdGlmaWNhdGlvbih7XHJcbiAgICB0ZXh0OiAnJyxcclxuICAgIHR5cGU6ICdkYW5nZXInLFxyXG4gICAgY2xhc3NOYW1lOiAnb3B0aW9ucy1jbGFzcycsXHJcbiAgICBkdXJhdGlvbjogNTAwMCxcclxuICAgIGNvbnRhaW5lcjogZG9jdW1lbnQuYm9keVxyXG59KTsiLCJpbXBvcnQgdHJhbmNlX21hc3RlciBmcm9tIFwiLi90cmFuY2VfbWFzdGVyLm1qc1wiO1xyXG5pbXBvcnQgY2hlY2tfcmVnaWRhdGEgZnJvbSBcIi4vY2hlY2tfcmVnaWRhdGEubWpzXCI7XHJcblxyXG4vKipcclxuICog55m76Yyy5YmN44Gu44OH44O844K/5Y+W5b6X44Go44OB44Kn44OD44Kv44CAb25DbGlja+OCpOODmeODs+ODiOaZguOBqGtpbnRvbmUuZXZlbnTjgaflh6bnkIbliIbjgZHjgotcclxuICogQHBhcmFtIHsqfSBldmUgRXZlbnTjgqrjg5bjgrjjgqfjgq/jg4hcclxuICogQHJldHVybnMgMC0+dWlk44GM5a2Y5Zyo44GX44Gq44GEIC0xLT7kvZXjgYvjgZfjgonjga7jgqjjg6njg7xcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBEYXRhUGlja1VwKGV2ZSkge1xyXG4gICAgLy8gY29uc29sZS5sb2coZXZlKVxyXG5cclxuICAgIC8v55m76Yyy55So44CAbWl4dHVyZV9pZOOBr3VpZOOBqHNu44Gub2Jq6YWN5YiXXHJcbiAgICAvL2V4cC4gW3t1bmlxdWVfaWQ6IHh4eHh4eHh4LCBzZXJpYWxfbnVtYmVyOnh4eHh4eH0sIC4uLi4gXVxyXG4gICAgbGV0IHJlZ2lzdERhdGEgPSB7XHJcbiAgICAgICAgbWl4dHVyZV9pZDogW10sIHByb2R1Y3RfbmFtZTogJycsIG1vZGVsX251bWJlcjogJycsIG1hbnVmYWN0dXJlcl9jb2RlOiAnMScsXHJcbiAgICAgICAgbWFqb3JfZGl2aXNpb246ICcnLCBtaWRkbGVfZGl2aXNpb246ICcnLCBwcm9kdWN0aW9uX2RhdGU6ICcnLCBvcmRlcl9udW1iZXI6ICcnLCBzaXplOiAnJyxcclxuICAgICAgICB3ZWlnaHQ6ICcnLCBxdWFudGl0eTogJydcclxuICAgIH07XHJcblxyXG4gICAgLy/nj77lnKjjga7jg5XjgqPjg7zjg6vjg4nlhoXlrrnlj5blvpfjgIDjgqTjg5njg7Pjg4jnmbrnlJ/lhYPjgaflh6bnkIbliIblspBcclxuICAgIC8v44CMVE1T5o6h55Wq44CN5oq85LiL77yadHlwZeOBr1wiYXBwLnJlY29yZC5lZGl0LnNob3dcIlxyXG4gICAgLy8gIOW8leaVsOOBr+OAgeOCpOODmeODs+ODiOeZu+mMsuaZguaZgueCueOBruODrOOCs+ODvOODieaDheWgseOBq+OBquOCi1xyXG4gICAgLy/jgIzkv53lrZjjgI3mirzkuIvvvJp0eXBl44GvXCJhcHAucmVjb3JkLmVkaXQuc3VibWl0LnN1Y2Nlc3NcIlxyXG4gICAgLy/jgIDlvJXmlbDjga/jgIHkv53lrZjmirzkuIvmmYLmmYLngrnjga7jg6zjgrPjg7zjg4nmg4XloLHjgavjgarjgotcclxuICAgIGxldCByZWNvcmQgPSBcIlwiO1xyXG4gICAgbGV0IG15RXZlVHlwZTtcclxuICAgIC8vVE1T5o6h55Wq44Gq44Gu44Gn44CB44Os44Kz44O844OJ5oOF5aCx5YaN5Y+W5b6XXHJcbiAgICBpZiAoZXZlLnR5cGUgPT09IFwiYXBwLnJlY29yZC5lZGl0LnNob3dcIiB8fCBldmUudHlwZSA9PT0gXCJhcHAucmVjb3JkLmNyZWF0ZS5zaG93XCIpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnR2V0IHJlY29yZCcpO1xyXG4gICAgICAgIHJlY29yZCA9IGtpbnRvbmUuYXBwLnJlY29yZC5nZXQoKS5yZWNvcmQ7XHJcbiAgICAgICAgbXlFdmVUeXBlID0gJ2dldE51bWJlcic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlY29yZCA9IGV2ZS5yZWNvcmQ7XHJcbiAgICAgICAgbXlFdmVUeXBlID0gJ3NhdmUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKHJlY29yZCk7XHJcblxyXG4gICAgLy/mlbDph49cclxuICAgIHJlZ2lzdERhdGEucXVhbnRpdHkgPSByZWNvcmRbJ+aVsOmHjyddLnZhbHVlO1xyXG4gICAgaWYgKCFyZWdpc3REYXRhLnF1YW50aXR5KSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSAnVE1T5o6h55WqIOOAjOaVsOmHj+OAjeOBjOaMh+WumuOBleOCjOOBpuOBhOOBvuOBm+OCk+OAgic7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy/jgIzkv53lrZjjgI3mmYLjga/mlbDph4/jgYzjg4bjg7zjg5bjg6vooYzmlbDjgpLotoXpgY7jgZfjgabjgYTjgovmmYLjga/jgqjjg6njg7woVE1T5o6h55Wq5pmC44Gv5Yem55CG57aZ57aaKVxyXG4gICAgLy8g5L2G44GX44CB44OG44O844OW44Or44Gr5YWl5Yqb44GV44KM44Gm44GE44KLVUlE44Gu5pWw44KS5Z+65rqW44Go44GZ44KL44CCXHJcbiAgICBpZiAoZXZlLnR5cGUgPT09IFwiYXBwLnJlY29yZC5lZGl0LnN1Ym1pdFwiIHx8IGV2ZS50eXBlID09PSBcImFwcC5yZWNvcmQuY3JlYXRlLnN1Ym1pdFwiKSB7ICAgIC8v5L+d5a2Y5pmCXHJcbiAgICAgICAgLy9VSUTjga7mlbDjgpLlj5blvpdcclxuICAgICAgICBsZXQgdWlkQ291bnQgPSBldmUucmVjb3JkLnRtc190YWJsZS52YWx1ZS5tYXAoZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWwgPSBlLnZhbHVlLnRtc191aWQudmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiAodmFsID09ICcnIHx8IHZhbCA9PSB1bmRlZmluZWQpID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh1aWRDb3VudCk7XHJcblxyXG4gICAgICAgIC8vdHJ1ZeOBjOi/lOOCi+OBqOOAgVVJROOBjDHjgaTku6XkuIrlrZjlnKjjgZnjgovkuovjgavjgarjgotcclxuICAgICAgICBpZiAoIXVpZENvdW50LmluY2x1ZGVzKHRydWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1VJROOBjDHjgaTku6XkuIrjgYLjgovjga7jgafjgIFUTVPjgqjjg6njg7zjg4Hjgqfjg4Pjgq9cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZWdpc3REYXRhLnF1YW50aXR5KTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZWNvcmQudG1zX3RhYmxlLnZhbHVlLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGlmIChyZWdpc3REYXRhLnF1YW50aXR5ICE9IHJlY29yZC50bXNfdGFibGUudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlY29yZCk7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gJ1RNU+aOoeeVqiDjg4bjg7zjg5bjg6vjga7ooYzmlbDjgYzjgIzmlbDph4/jgI3jgpLkuIrlm57jgaPjgabjgYTjgb7jgZnjgIIxJztcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8v44CMVE1T5o6h55Wq44CN5oq85LiL5pmC44Gv44CB44OG44O844OW44Or44Gu6KGM5pWw44GM5pWw6YeP44KS5LiK5Zue44Gj44Gm44GE44Gf5aC05ZCI44CB44Ko44Op44O8XHJcbiAgICAgICAgaWYgKHJlZ2lzdERhdGEucXVhbnRpdHkgPCByZWNvcmQudG1zX3RhYmxlLnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWNvcmQpO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24udGV4dCA9ICdUTVPmjqHnlaog44OG44O844OW44Or44Gu6KGM5pWw44GM44CM5pWw6YeP44CN44KS5LiK5Zue44Gj44Gm44GE44G+44GZ44CCMic7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5vcGVuKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/lhbHpgJrjg5XjgqPjg7zjg6vvvoTvvp7jg4fjg7zjgr/jgpJvYmrjgbjlpInmj5vjgZfjgabjgYTjgY9cclxuICAgIHJlZ2lzdERhdGEucHJvZHVjdF9uYW1lID0gcmVjb3JkWyfllYblk4HlkI0nXS52YWx1ZTtcclxuXHJcbiAgICAvL+ODnuOCueOCv+WkieaPmy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy9cclxuICAgIGxldCBtYXN0ZXIgPSBhd2FpdCB0cmFuY2VfbWFzdGVyKHJlY29yZFsn5paH5a2X5YiXX18x6KGMX18yJ10udmFsdWUpO1xyXG4gICAgY29uc29sZS5sb2cobWFzdGVyKTtcclxuICAgIGlmIChtYXN0ZXIgIT09IC0xKSB7ICAgIC8v44Oe44K544K/44Gr5a2Y5Zyo44GZ44KL5pmC44Gu44G/XHJcbiAgICAgICAgcmVnaXN0RGF0YS5tb2RlbF9udW1iZXIgPSBtYXN0ZXIubW9kZWxfbnVtYmVyLnZhbHVlOyAgLy/lnovnlapcclxuICAgICAgICByZWdpc3REYXRhLndlaWdodCA9IG1hc3Rlci53ZWlnaHQudmFsdWU7ICAgICAgICAgICAgICAvL+S9v+eUqOiNt+mHjVxyXG4gICAgICAgIHJlZ2lzdERhdGEuc2l6ZSA9IG1hc3Rlci5zaXplLnZhbHVlOyAgICAgICAgICAgICAgICAgIC8v44K144Kk44K6XHJcbiAgICAgICAgcmVnaXN0RGF0YS5qYW5fY29kZSA9IG1hc3Rlci5qYW5fY29kZS52YWx1ZTsgICAgICAgICAgLy9KQU7jgrPjg7zjg4lcclxuICAgICAgICAvL+ODnuOCueOCv+OBi+OCieWPluW+l+OBl+OBn+ODh+ODvOOCv+OCkuODleOCqeODvOODoOOBq+ihqOekuiBcclxuICAgICAgICBjb25zb2xlLmxvZyhyZWNvcmQpO1xyXG4gICAgICAgIHJlY29yZC5tb2RlbF9udW1iZXIudmFsdWUgPSBtYXN0ZXIubW9kZWxfbnVtYmVyLnZhbHVlO1xyXG4gICAgICAgIHJlY29yZC53ZWlnaHQudmFsdWUgPSBtYXN0ZXIud2VpZ2h0LnZhbHVlO1xyXG4gICAgICAgIHJlY29yZC5zaXplLnZhbHVlID0gbWFzdGVyLnNpemUudmFsdWU7XHJcbiAgICAgICAgLy9UTVPmjqHnlarjg5zjgr/jg7PjgarjgolzZXTjgIDkv53lrZjjg5zjgr/jg7PjgarjgolzZXTkuI3opoEo44Go44GE44GG44GL44Ko44Op44O844Gn44KLKVxyXG4gICAgICAgIGlmIChteUV2ZVR5cGUgPT09ICdnZXROdW1iZXInKSBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG5cclxuICAgIH1cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgcmVnaXN0RGF0YS5tYWpvcl9kaXZpc2lvbiA9IENoYW5nZU1ham9yKHJlY29yZFsn5aSn5YiG6aGeJ10udmFsdWUpO1xyXG4gICAgcmVnaXN0RGF0YS5taWRkbGVfZGl2aXNpb24gPSByZWNvcmRbJ+S4reWIhumhniddLnZhbHVlO1xyXG4gICAgcmVnaXN0RGF0YS5wcm9kdWN0aW9uX2RhdGUgPSByZWNvcmRbJ3Rtc19tZmQnXS52YWx1ZTtcclxuICAgIHJlZ2lzdERhdGEub3JkZXJfbnVtYmVyID0gcmVjb3JkWyfmloflrZfliJdfXzHooYxfXzAnXS52YWx1ZTtcclxuXHJcbiAgICAvL+ODhuODvOODluODq+ihjOODh+ODvOOCv+WPluW+lyjlkIzmmYLjgavkuI3otrPliIbjga7ooYzjgoLkvZzmiJApXHJcbiAgICBsZXQgdGFibGVEYXRhID0gQWRqdXN0VGFibGVSb3cocmVjb3JkKTtcclxuXHJcbiAgICAvL+eZu+mMsuODh+ODvOOCv3VpZOOBqHNu44KS5ZCr44KB44Gm5L2c5oiQKHRhYmxl44GL44KJKVxyXG4gICAgcmVnaXN0RGF0YS5taXh0dXJlX2lkID0gdGFibGVEYXRhO1xyXG5cclxuICAgIC8v5b+F6aCI44OB44Kn44OD44KvXHJcbiAgICBpZiAoY2hlY2tfcmVnaWRhdGEocmVnaXN0RGF0YSwgcmVjb3JkKSA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiByZWdpc3REYXRhO1xyXG59XHJcblxyXG4vKipcclxuICog5aSn5YiG6aGe5ZCN44KS44Kz44O844OJ44G45aSJ5o+b44GX44Gm6L+U44GZXHJcbiAqIOaIu+OCiuWApO+8mi0x44Gn44Ko44Op44O8XHJcbiAqIEBwYXJhbSB7Kn0gbmFtZSBcclxuICovXHJcbmZ1bmN0aW9uIENoYW5nZU1ham9yKG5hbWUpIHtcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICAgIGNhc2UgJ+e5iue2reOCueODquODs+OCsCc6XHJcbiAgICAgICAgICAgIHJldHVybiA1O1xyXG4gICAgICAgIGNhc2UgJ+OCueODquODs+OCsOOCu+ODg+ODiCc6XHJcbiAgICAgICAgICAgIHJldHVybiA5O1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOODhuODvOODluODq+ihjOaVsOiqv+aVtCBUTVPmjqHnlarjg5zjgr/jg7PmirzkuIvmmYLjga7jgb9cclxuICogQHBhcmFtIHsqfSBudW0g5pWw6YePXHJcbiAqIEBwYXJhbSB7Kn0gdGFibGUg44OG44O844OW44Orb2JqXHJcbiAqL1xyXG5mdW5jdGlvbiBBZGp1c3RUYWJsZVJvdyhyZWNvcmQpIHtcclxuICAgIC8v54++5Zyo44Gu44OG44O844OW44Or6KGM5pWw44Go5q+U6LyDIOWQjOOBmOOBquOCiee1guS6hlxyXG4gICAgbGV0IG5vd1RhYmxlUm93Q291bnQgPSByZWNvcmQudG1zX3RhYmxlLnZhbHVlLmxlbmd0aDtcclxuICAgIGxldCBudW0gPSByZWNvcmRbJ+aVsOmHjyddLnZhbHVlO1xyXG4gICAgbGV0IGRlZkNvdW50ID0gbnVtIC0gbm93VGFibGVSb3dDb3VudDtcclxuICAgIC8vIGNvbnNvbGUubG9nKGRlZkNvdW50KTtcclxuXHJcbiAgICAvL+ODhuODvOODluODq+ihjOaVsOOBjOS4jei2s+OBl+OBpuOBhOOCi+aZgui/veWKoFxyXG4gICAgaWYgKGRlZkNvdW50ICE9PSAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZE9iaiA9IHtcclxuICAgICAgICAgICAgaWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAndG1zX3NuJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiU0lOR0xFX0xJTkVfVEVYVFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgLy91aWTjga/nt6jpm4bkuI3lj6/jgatcclxuICAgICAgICAgICAgICAgICd0bXNfdWlkJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiU0lOR0xFX0xJTkVfVEVYVFwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vdGFibGXmp4vpgKDjgpJwdXNoXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlY29yZC50bXNfdGFibGUudmFsdWUucHVzaChhZGRPYmopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVjb3JkKTtcclxuICAgICAgICBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8v44OG44O844OW44Or44Gu44OH44O844K/44KS5Y+W5b6X44GX44Gm6YWN5YiX44G4XHJcbiAgICAvLyByZWNvcmQgPSBraW50b25lLmFwcC5yZWNvcmQuZ2V0KCkucmVjb3JkO1xyXG5cclxuICAgIGxldCB0YWJsZURhdGEgPSBbXTtcclxuICAgIHJlY29yZC50bXNfdGFibGUudmFsdWUubWFwKGUgPT4ge1xyXG4gICAgICAgIHRhYmxlRGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgdW5pcXVlX2lkOiBlLnZhbHVlLnRtc191aWQudmFsdWUsXHJcbiAgICAgICAgICAgIHNlcmlhbF9udW1iZXI6IGUudmFsdWUudG1zX3NuLnZhbHVlXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHRhYmxlRGF0YTtcclxuXHJcbn1cclxuXHJcbi8qKueUu+mdouS4iumDqOOCqOODqeODvOihqOekuueUqCAqL1xyXG5jb25zdCBub3RpZmljYXRpb24gPSBuZXcgS3VjLk5vdGlmaWNhdGlvbih7XHJcbiAgICB0ZXh0OiAnJyxcclxuICAgIHR5cGU6ICdkYW5nZXInLFxyXG4gICAgY2xhc3NOYW1lOiAnb3B0aW9ucy1jbGFzcycsXHJcbiAgICBkdXJhdGlvbjogMjAwMCxcclxuICAgIGNvbnRhaW5lcjogZG9jdW1lbnQuYm9keVxyXG59KTsiLCIvKipcclxuICog5Yid5pyf5YyW5Yem55CGXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIEluaXQoZSkge1xyXG4gICAgVGFibGVJbml0KGUpO1xyXG4gICAgRW5hYmxlZENvbHVtbihlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOODhuODvOODluODq1VJROOCkue3qOmbhuS4jeWPr+OBq1xyXG4gKi9cclxuZnVuY3Rpb24gVGFibGVJbml0KGVsbSkge1xyXG4gICAgZWxtLnJlY29yZC50bXNfdGFibGUudmFsdWUubWFwKGUgPT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIGUudmFsdWUudG1zX3VpZC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWei+eVquODu+S9v+eUqOiNt+mHjeODu+OCteOCpOOCuuOCkue3qOmbhuS4jeWPr+OBq1xyXG4gKi9cclxuZnVuY3Rpb24gRW5hYmxlZENvbHVtbihlbG0pe1xyXG4gICAgY29uc29sZS5sb2coZWxtKTtcclxuICAgIGVsbS5yZWNvcmQubW9kZWxfbnVtYmVyLmRpc2FibGVkID0gdHJ1ZTsgICAgLy/lnovnlapcclxuICAgIGVsbS5yZWNvcmQud2VpZ2h0LmRpc2FibGVkID0gdHJ1ZTsgICAgLy/kvb/nlKjojbfph41cclxuICAgIGVsbS5yZWNvcmQuc2l6ZS5kaXNhYmxlZCA9IHRydWU7ICAgIC8v44K144Kk44K6XHJcbn0iLCIvL+ODrOOCs+ODvOODieS/neWtmOaZguWHpueQhlxyXG5cclxuaW1wb3J0IHsgRGF0YVBpY2tVcCB9IGZyb20gXCIuL2RhdGFfcGlja3VwLm1qc1wiO1xyXG5pbXBvcnQgdG1zX2FwaSBmcm9tIFwiLi90bXNfYXBpLm1qc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKGUpIHtcclxuXHJcbiAgICBsZXQgbXlEYXRhID0gYXdhaXQgRGF0YVBpY2tVcChlKTtcclxuICAgIC8vRGF0YVBpY2t1cOOBp+OCqOODqeODvOODiOODqeODg+ODl1xyXG4gICAgaWYgKG15RGF0YSA9PT0gLTEpIHJldHVybiAtMTtcclxuICAgIGlmIChteURhdGEgPT09IDApIHJldHVybiAwOyAvL+S/neWtmOaKvOS4i+OBi+OBpFVJROOBjOeEoeOBhOWgtOWQiOOBr1RNU19BUEnlh6bnkIbnhKHjgZdcclxuXHJcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdG1zX2FwaShteURhdGEpO1xyXG4gICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuXHJcbn1cclxuXHJcbiIsIi8qKlxyXG4gKiBUTVNfQVBJ5a6f6KGM6YOo44CAXHJcbiAqL1xyXG5cclxuLy/nmbvpjLLnlKhJROetiVxyXG5jb25zdCBwYXJhbSA9IHtcclxuICAgIGlkOiAnZEdGcGVXODZjR1ZuWVhOMWN6RTZjR1Z6ZFNNNU9URT0nLFxyXG4gICAgdXJsX2RldjogJ2h0dHBzOi8vdHN1cmlzY29wZS5qcC9tYW5hZ2VyX3ByZS9BcGlQcm9kdWN0cy9hZGQnLFxyXG4gICAgdXJsX3Byb2R1Y3Q6ICdodHRwczovL3RzdXJpc2NvcGUuanAvbWFuYWdlci9BcGlQcm9kdWN0cy9hZGQnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBcclxuICogQHBhcmFtIHsqfSByZWdpRGF0YSDkuIDlv5zjgqjjg6njg7zjg4Hjgqfjg4Pjgq/jgZXjgozjgZ/nmbvpjLLnlKjjg4fjg7zjgr9cclxuICogQHJldHVybnMgVE1T44GL44KJ44Gu57WQ5p6cXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAocmVnaURhdGEpIHtcclxuICAgIGxldCBwdXREYXRhID0gRm9ybWF0RGF0YShyZWdpRGF0YSk7ICAgLy9yZWdpRGF0YeOBi+OCiWZldGNo55So44OH44O844K/KGpzb27lvaLlvI8p44Gu5L2c5oiQXHJcbiAgICBsZXQgcG9zdFJlcyA9IGF3YWl0IFBvc3RpbmcocHV0RGF0YSk7XHJcbiAgICByZXR1cm4gcG9zdFJlcztcclxufVxyXG5cclxuLy/nmbvpjLLnlKjjg4fjg7zjgr/jgbjmlbTlvaLjgZnjgotcclxuZnVuY3Rpb24gRm9ybWF0RGF0YShkYXRhKSB7XHJcblxyXG4gICAgY29uc3QgdGhyb3dEYXRhID0ge307XHJcbiAgICBjb25zdCBseCA9IGx1eG9uLkRhdGVUaW1lLmxvY2FsKCk7XHJcbiAgICBjb25zdCBmb3JtYXREYXRlID0gbHgudG9Gb3JtYXQoJ3l5eXlNTWRkSEhtbXNzJyk7XHJcblxyXG4gICAgLy/lhbHpgJrml6Xku5jpg6hcclxuICAgIHRocm93RGF0YS5jcmVhdGVkX2RhdGV0aW1lID0gZm9ybWF0RGF0ZTtcclxuXHJcbiAgICAvL+WAi+WIpee5sOOCiui/lOOBl+mDqOOBruS9nOaIkFxyXG4gICAgY29uc3QgcXQgPSBkYXRhLnF1YW50aXR5O1xyXG4gICAgbGV0IG15TGlzdCA9IFtdO1xyXG4gICAgLy/mlbDph4/liIbnubDjgorov5TjgZdcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXQ7IGkrKykge1xyXG4gICAgICAgIG15TGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgXCJ1bmlxdWVfaWRcIjogZGF0YS5taXh0dXJlX2lkW2ldLnVuaXF1ZV9pZCxcclxuICAgICAgICAgICAgXCJwcm9kdWN0X25hbWVcIjogZGF0YS5wcm9kdWN0X25hbWUsXHJcbiAgICAgICAgICAgIFwic2VyaWFsX251bWJlclwiOiBkYXRhLm1peHR1cmVfaWRbaV0uc2VyaWFsX251bWJlcixcclxuICAgICAgICAgICAgXCJtb2RlbF9udW1iZXJcIjogZGF0YS5tb2RlbF9udW1iZXIsXHJcbiAgICAgICAgICAgIFwibWFudWZhY3R1cmVyX2NvZGVcIjogZGF0YS5tYW51ZmFjdHVyZXJfY29kZSxcclxuICAgICAgICAgICAgXCJqYW5fY29kZVwiOiBkYXRhLmphbl9jb2RlLFxyXG4gICAgICAgICAgICBcIm1ham9yX2RpdmlzaW9uXCI6IGRhdGEubWFqb3JfZGl2aXNpb24sXHJcbiAgICAgICAgICAgIFwibWlkZGxlX2RpdmlzaW9uXCI6IGRhdGEubWlkZGxlX2RpdmlzaW9uLFxyXG4gICAgICAgICAgICBcInByb2R1Y3Rpb25fZGF0ZVwiOiBkYXRhLnByb2R1Y3Rpb25fZGF0ZSxcclxuICAgICAgICAgICAgXCJvcmRlcl9udW1iZXJcIjogZGF0YS5vcmRlcl9udW1iZXIsXHJcbiAgICAgICAgICAgIFwiY3VzdG9tZXJfY29kZVwiOiBkYXRhLmN1c3RvbWVyX2NvZGUsXHJcbiAgICAgICAgICAgIFwic2l6ZVwiOiBkYXRhLnNpemUsXHJcbiAgICAgICAgICAgIFwid2VpZ2h0XCI6IGRhdGEud2VpZ2h0LFxyXG4gICAgICAgICAgICBcInByb2R1Y3RfbGlua1wiOiBkYXRhLnByb2R1Y3RfbGlua1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gY29uc29sZS5sb2cobXlMaXN0KTtcclxuICAgIHRocm93RGF0YS5saXN0ID0gbXlMaXN0O1xyXG4gICAgcmV0dXJuIHRocm93RGF0YTtcclxuXHJcbn1cclxuXHJcbi8vVE1T44G4RGF0YeOCklBPU1TjgZnjgotcclxuLyoqXHJcbiAqIERhdGHjgpJUTVPjgbhQT1NU44GZ44KLXHJcbiAqIEBwYXJhbSB7Kn0gZGF0YSDnmbvpjLLnlKjjg4fjg7zjgr9vYmpcclxuICogQHJldHVybnMgICAgIFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gUG9zdGluZyhkYXRhKSB7XHJcbiAgICBjb25zdCBoZWFkZXJzID0ge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgJ1gtSVRGQXV0aCc6IHBhcmFtLmlkLFxyXG4gICAgICAgICdBdXRob3JpemF0aW9uJzogJ0Jhc2ljIGNISmxWR1Z6ZEdWeU9sUkFhWGx2TWpBeU13PT0nXHJcbiAgICB9XHJcblxyXG4gICAgLy9EZWJ1Z+eUqFxyXG4gICAgY29uc3QgdGVzdERhdGEgPSB7XHJcbiAgICAgICAgXCJjcmVhdGVkX2RhdGV0aW1lXCI6IFwiMjAyMzEwMTMwOTAyMDBcIixcclxuICAgICAgICBcImxpc3RcIjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcInByb2R1Y3RfbmFtZVwiOiBcIkhPR0UyXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1hbnVmYWN0dXJlcl9jb2RlXCI6IDEsXHJcbiAgICAgICAgICAgICAgICBcIm1ham9yX2RpdmlzaW9uXCI6IDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGhvZ2V0YW47XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGhvZ2V0YW4gPSBhd2FpdCBraW50b25lLnByb3h5KHBhcmFtLnVybF9wcm9kdWN0LCAnUE9TVCcsIGhlYWRlcnMsIGRhdGEpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBsZXQgbXNnID0gSlNPTi5wYXJzZShlcnJvcikubWVzc2FnZTtcclxuICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydCgnW1RNU11UTVPjgbjjga5BUEnjgadQT1NU44Ko44Op44O8XFxuJyArIG1zZyk7XHJcbiAgICAgICAgcmV0dXJuIC05OTtcclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUubG9nKGhvZ2V0YW4pO1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoaG9nZXRhblswXSk7XHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBUTVNf5aSJ5o+b44Oe44K544K/44CA44Ki44OX44Oq44GL44KJ5ZWG5ZOB44Kz44O844OJ44KS44Kt44O844Go44GX44Gm44Os44Kz44O844OJ44KS6L+U44GZXHJcbiAqIOaMh+WumuOBleOCjOOBn+OCs+ODvOODieOBjOWtmOWcqOOBl+OBquOBhOaZguOBr+OAgS0x44KS6L+U44GZXHJcbiAqIEBwYXJhbSB7Kn0gcHJvZENvZGUgXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAocHJvZENvZGUpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKHByb2RDb2RlKTtcclxuXHJcbiAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgIGFwcDogMjUwLFxyXG4gICAgICAgIHF1ZXJ5OiBgcHJvZF9jb2RlID0gXCIke3Byb2RDb2RlfVwiYCxcclxuICAgICAgICB0b3RhbENvdW50OiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlcyA9IGF3YWl0IGtpbnRvbmUuYXBpKGtpbnRvbmUuYXBpLnVybCgnL2svdjEvcmVjb3JkcycsIHRydWUpLCAnR0VUJywgYm9keSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgLy9oaXTjgZfjgarjgYvjgaPjgZ/loLTlkIjjgIF0b3RhbENvdW5044Gn5Yik5a6aXHJcbiAgICBpZiAocmVzLnRvdGFsQ291bnQgPT09ICcwJykge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcy5yZWNvcmRzWzBdO1xyXG4gICAgfVxyXG5cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IEJ0bkZ1bmMgZnJvbSBcIi4vbW9kL2J0bl9mdW5jLm1qc1wiO1xuaW1wb3J0IHsgSW5pdCB9IGZyb20gXCIuL21vZC9pbml0Lm1qc1wiO1xuaW1wb3J0IHN1Ym1pdCBmcm9tIFwiLi9tb2Qvc3VibWl0Lm1qc1wiO1xuXG5jb25zdCByZWdpc3RVc2VyID0geyAnY29tcF9jb2RlJzogJ3RhaXlvJywgJ3VzZXJfaWQnOiAnYWRtaW51c2VyJywgJ3Bhc3Nfd29yZCc6ICdBZG1pblBhc3MwJyB9O1xuXG4oKCQpID0+IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy/mlrDopo/kvZzmiJDjg7vnt6jpm4bmmYLjgqTjg5njg7Pjg4hcbiAgICBraW50b25lLmV2ZW50cy5vbihbJ2FwcC5yZWNvcmQuY3JlYXRlLnNob3cnLCAnYXBwLnJlY29yZC5lZGl0LnNob3cnXSwgKGUpID0+IHtcblxuICAgICAgICBJbml0KGUpO1xuICAgICAgICBkZWJ1Z0lucHV0KGUpOyAgLy/jg4fjg5Djg4PjgrDnlKhcbiAgICAgICAgQnRuRnVuYyhlKTtcbiAgICAgICAgLy8gcmV0dXJuIGU7XG5cbiAgICB9KTtcblxuICAgIC8v44Os44Kz44O844OJ6L+95Yqg44O757eo6ZuG55S76Z2i44CA5L+d5a2Y44Oc44K/44Oz5oq85LiL5pmCXG4gICAga2ludG9uZS5ldmVudHMub24oWydhcHAucmVjb3JkLmNyZWF0ZS5zdWJtaXQnLCAnYXBwLnJlY29yZC5lZGl0LnN1Ym1pdCddLCBhc3luYyBlID0+IHtcbiAgICAgICAgY29uc3QgeCA9IGF3YWl0IHN1Ym1pdChlKTtcbiAgICAgICAgaWYgKHggPT09IC0xKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGF0YVBpY2t1cOOBp+S4jeato+ODh+ODvOOCvycpO1xuICAgICAgICAgICAgZS5yZWNvcmRbJ+aVsOmHjyddLmVycm9yID0gJ1RNU+aOoeeVquOBp+S4jeato+OBquODh+ODvOOCvyc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0pXG5cbiAgICAvL+ODhuODvOODluODq+ihjOS9nOaIkOaZguOCpOODmeODs+ODiFxuICAgIGtpbnRvbmUuZXZlbnRzLm9uKFtcImFwcC5yZWNvcmQuY3JlYXRlLmNoYW5nZS50bXNfdGFibGVcIiwgXCJhcHAucmVjb3JkLmVkaXQuY2hhbmdlLnRtc190YWJsZVwiXSwgKGUpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZSk7XG4gICAgICAgIGlmIChlLmNoYW5nZXMucm93KSB7XG4gICAgICAgICAgICAvL3VpZOe3qOmbhuS4jeWPr+OBuFxuICAgICAgICAgICAgZS5jaGFuZ2VzLnJvdy52YWx1ZS50bXNfdWlkLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICB9KVxuXG59KShqUXVlcnkpO1xuXG5mdW5jdGlvbiBkZWJ1Z0lucHV0KGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhlKTtcbiAgICBlLnJlY29yZFsn5ZWG5ZOB5ZCNJ10udmFsdWUgPSBcIlRFU1RcIjtcbiAgICBlLnJlY29yZFsn5aSn5YiG6aGeJ10udmFsdWUgPSBcIue5iue2reOCueODquODs+OCsFwiO1xuICAgIGUucmVjb3JkWyfmlbDph48nXS52YWx1ZSA9IDE7XG59Il0sIm5hbWVzIjpbIkJ0bkZ1bmMiLCJJbml0Iiwic3VibWl0IiwicmVnaXN0VXNlciIsIiQiLCJraW50b25lIiwiZXZlbnRzIiwib24iLCJlIiwiZGVidWdJbnB1dCIsIngiLCJjb25zb2xlIiwibG9nIiwicmVjb3JkIiwiZXJyb3IiLCJjaGFuZ2VzIiwicm93IiwidmFsdWUiLCJ0bXNfdWlkIiwiZGlzYWJsZWQiLCJqUXVlcnkiXSwic291cmNlUm9vdCI6IiJ9