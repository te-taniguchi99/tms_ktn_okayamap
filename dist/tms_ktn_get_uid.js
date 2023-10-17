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
        // className: 'options-class',
        id: 'qrAddBtn'
    });

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
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(obj,record) {
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
        if (obj.model_number.match(/^[A-Za-z0-9]*$/)) {
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

    //TMS採番なので、レコード情報再取得
    if (eve.type === "app.record.edit.show" || eve.type === "app.record.create.show") {
        // console.log('Get record');
        record = kintone.app.record.get().record;
    } else {
        record = eve.record;
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
    let master = await (0,_trance_master_mjs__WEBPACK_IMPORTED_MODULE_0__["default"])(record['文字列__1行__2'].value);
    // console.log(master);
    if (master !== -1) {    //マスタに存在する時のみ
        registData.model_number = master.model_number.value;  //型番
        registData.weight = master.weight.value;              //使用荷重
        registData.size = master.size.value;                  //サイズ
        registData.jan_code = master.jan_code.value;          //JANコード
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFDZjtNQUNBUixDQUFDLENBQUNPLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHLElBQUk7SUFDL0M7SUFDQSxPQUFPWCxDQUFDO0VBQ1osQ0FBQyxDQUFDO0FBRU4sQ0FBQyxFQUFFWSxNQUFNLENBQUM7QUFFVixTQUFTWCxVQUFVLENBQUNELENBQUMsRUFBRTtFQUNuQjtFQUNBQSxDQUFDLENBQUNLLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQ0ksS0FBSyxHQUFHLE1BQU07RUFDOUJULENBQUMsQ0FBQ0ssTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDSSxLQUFLLEdBQUcsUUFBUTtFQUNoQ1QsQ0FBQyxDQUFDSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUNJLEtBQUssR0FBRyxDQUFDO0FBQzVCLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2J0bl9mdW5jLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2NoZWNrX3JlZ2lkYXRhLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2RhdGFfcGlja3VwLm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL2luaXQubWpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2Qvc3VibWl0Lm1qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kL3Rtc19hcGkubWpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2QvdHJhbmNlX21hc3Rlci5tanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFQaWNrVXAgfSBmcm9tIFwiLi9kYXRhX3BpY2t1cC5tanNcIjtcclxuaW1wb3J0IHRtc19hcGkgZnJvbSBcIi4vdG1zX2FwaS5tanNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChldmUpIHtcclxuXHJcbiAgICAvL+ODnOOCv+ODs+S9nOaIkFxyXG4gICAgY29uc3QgYWRkT2JqID0gbmV3IEt1Yy5CdXR0b24oe1xyXG4gICAgICAgIHRleHQ6ICdUTVPmjqHnlaonLFxyXG4gICAgICAgIHR5cGU6ICdzdWJtaXQnLFxyXG4gICAgICAgIC8vIGNsYXNzTmFtZTogJ29wdGlvbnMtY2xhc3MnLFxyXG4gICAgICAgIGlkOiAncXJBZGRCdG4nXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL+aPj+eUu1xyXG4gICAgY29uc3QgYnRuU3BhY2UgPSBraW50b25lLmFwcC5yZWNvcmQuZ2V0U3BhY2VFbGVtZW50KCd0bXNfYnRuX3NwYWNlJyk7XHJcbiAgICBhZGRPYmoub25jbGljayA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy9yZWdpRGF0YeOBq+OBr+eZu+mMsueUqOODh+ODvOOCv+OBjOagvOe0jeOBleOCjOOCi+OAgueVsOW4uOWApOOBjOOBguOCi+WgtOWQiOOBry0x44GM5YWl44KL44CCXHJcbiAgICAgICAgbGV0IHJlZ2lEYXRhID0gYXdhaXQgRGF0YVBpY2tVcChldmUpO1xyXG4gICAgICAgIGlmIChyZWdpRGF0YSA9PSAtMSApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9BUEnlrp/ooYxcclxuICAgICAgICBsZXQgcmVzID0gYXdhaXQgdG1zX2FwaShyZWdpRGF0YSk7XHJcblxyXG4gICAgICAgIC8v5pyA57WC5Yem55CGXHJcbiAgICAgICAgZmluYWxEaXNwb3NhbChyZXMpO1xyXG4gICAgfVxyXG4gICAgYnRuU3BhY2UuYXBwZW5kQ2hpbGQoYWRkT2JqKTtcclxuXHJcbn1cclxuXHJcbi8v5pyA57WC5Yem55CGXHJcbmZ1bmN0aW9uIGZpbmFsRGlzcG9zYWwocmVzKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgaWYgKHJlcyA9PT0gLTk5KSByZXR1cm47IC8vUE9TVOOBp+OCqOODqeODvFxyXG5cclxuICAgIC8vc3RhdHVzIDDku6XlpJbjga9UTVPlgbTjgYvjgonjga7jgqjjg6njg7xcclxuICAgIGlmIChyZXMuc3RhdHVzICE9PSBcIjBcIikge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gJ1RNU+eZu+mMsuaZguOBq+OCqOODqeODvOOBjOeZuueUn+OBl+OBvuOBl+OBn+OAgic7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICByZXR1cm4gLTk4O1xyXG4gICAgfVxyXG5cclxuICAgIC8v5oi744Gj44GfVUlE44KSVGFibGXjgbjmj4/nlLtcclxuICAgIGxldCByZWNvcmQgPSBraW50b25lLmFwcC5yZWNvcmQuZ2V0KCkucmVjb3JkO1xyXG4gICAgbGV0IHRhYmxlcyA9IHJlY29yZC50bXNfdGFibGUudmFsdWU7XHJcbiAgICAvLyBjb25zb2xlLmxvZyh0YWJsZXMpO1xyXG4gICAgLy9UTVPjgYvjgonov5TjgaPjgabjgY3jgZ9VSUTjgadtYXBcclxuICAgIHJlcy5saXN0Lm1hcCgoZWxtLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIC8va2ludG9uZeS4iuOBruODhuODvOODluODq+OAgXVpZOOBq+ODh+ODvOOCv+OCkuWFpeOCjOOBpuOBhOOBj1xyXG4gICAgICAgIHRhYmxlc1tpbmRleF0udmFsdWUudG1zX3VpZC52YWx1ZSA9IGVsbS51bmlxdWVfaWQ7XHJcbiAgICB9KTtcclxuICAgIC8v44Os44Kz44O844OJ5Y+N5pigXHJcbiAgICBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG5cclxufVxyXG5cclxuLyoq55S76Z2i5LiK6YOo44Ko44Op44O86KGo56S655SoICovXHJcbmNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBLdWMuTm90aWZpY2F0aW9uKHtcclxuICAgIHRleHQ6ICcnLFxyXG4gICAgdHlwZTogJ2RhbmdlcicsXHJcbiAgICBjbGFzc05hbWU6ICdvcHRpb25zLWNsYXNzJyxcclxuICAgIGR1cmF0aW9uOiAyMDAwLFxyXG4gICAgY29udGFpbmVyOiBkb2N1bWVudC5ib2R5XHJcbn0pOyIsIlxyXG4vKipcclxuICogVE1T44Oc44K/44Oz5oq85LiL5pmC44CB55m76Yyy5YaF5a6544OB44Kn44OD44KvXHJcbiAqIOW8leaVsO+8muW/hemgiOmgheebruOBrumAo+aDs+mFjeWIl1xyXG4gKiDmraPluLjihpIw44GM6L+U44KL44CATkfihpIgLTHjgYzov5TjgotcclxuICogQHBhcmFtIHtvYmplY3R9IG9iaiBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvYmoscmVjb3JkKSB7XHJcbiAgICAvKipcclxuICAgICAqIOW/hemgiOmgheebrlxyXG4gICAgICog6KO95ZOB5ZCN77yacHJvZHVjdF9uYW1lLFxyXG4gICAgICog5aSn5YiG6aGe77yabWFqb3JfZGl2aXNpb24sXHJcbiAgICAgKi9cclxuICAgIC8vIGNvbnNvbGUubG9nKG9iaik7XHJcbiAgICAvLyBsZXQgcmVjb3JkID0ga2ludG9uZS5hcHAucmVjb3JkLmdldCgpLnJlY29yZDtcclxuXHJcbiAgICAvL+WVhuWTgeWQjeW/hemgiFxyXG4gICAgaWYgKCFvYmoucHJvZHVjdF9uYW1lKSB7XHJcbiAgICAgICAgcmVjb3JkWyfllYblk4HlkI0nXS5lcnJvciA9ICdbVE1TXeijveWTgeWQjeOBr+W/hemgiOmgheebruOBp+OBmeOAgic7XHJcbiAgICAgICAga2ludG9uZS5hcHAucmVjb3JkLnNldCh7IHJlY29yZCB9KTtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKG9iai5tYWpvcl9kaXZpc2lvbiA9PT0gLTEpIHtcclxuICAgICAgICByZWNvcmRbJ+Wkp+WIhumhniddLmVycm9yID1cclxuICAgICAgICAgICAgJ1tUTVNd6Kit5a6a44GV44KM44Gm44Gq44GE44CB5Y+I44Gv6Kqk44Gj44Gf5ZCN56ew44Gn44GZ44CC5L2/55So5Ye65p2l44KL5aSn5YiG6aGe44Gv44CM57mK57at44K544Oq44Oz44Kw44CN44CM44K544Oq44Oz44Kw44K744OD44OI44CN44Gu44G/44Gn44GZ44CCJztcclxuICAgICAgICBraW50b25lLmFwcC5yZWNvcmQuc2V0KHsgcmVjb3JkIH0pO1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvL+ahgeaVsOODgeOCp+ODg+OCr1xyXG4gICAgLy91aWTjgahTTlxyXG4gICAgbGV0IGNoZWNrVWlkID0gdHJ1ZTtcclxuICAgIG9iai5taXh0dXJlX2lkLm1hcChlID0+IHtcclxuICAgICAgICAvL1VJROOBjOepuueZvSh1bmRlZmluZWQp44Gn44Gv54Sh44GE5pmC44CBMTDmloflrZfjgafjgYLjgovjgZPjgahcclxuICAgICAgICBpZiAoZS51bmlxdWVfaWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAoZS51bmlxdWVfaWQubGVuZ3RoICE9PSAxMCAmJiBlLnVuaXF1ZV9pZC5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBVSUTjga7moYHmlbDjgYznlbDluLjjgILnqbrnmb3lj4jjga/ljYrop5LmlbDlrZcxMOaWh+Wtl+OBruOBv+ioseWPr+OBleOCjOOBvuOBmeOAglwiO1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL+aVsOWApOOBi+OBqeOBhuOBi+ODgeOCp+ODg+OCr1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGUudW5pcXVlX2lkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBVSUTjga/mlbDlgKTjga7jgb/oqLHlj6/jgZXjgozjgb7jgZnjgIJcIjtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU07jg4Hjgqfjg4Pjgq/jgIAyMOaWh+Wtl+iLseaVsOOBruOBv1xyXG4gICAgICAgIGlmIChlLnNlcmlhbF9udW1iZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvL+iLseaVsOOBi+OBqeOBhuOBi1xyXG4gICAgICAgICAgICBpZiAoZS5zZXJpYWxfbnVtYmVyLm1hdGNoKC9eW0EtWmEtejAtOV0qJC8pKSB7XHJcbiAgICAgICAgICAgICAgICAvL+iLseaVsOWtl+OBp+OBguOCi1xyXG4gICAgICAgICAgICAgICAgaWYgKGUuc2VyaWFsX251bWJlci5sZW5ndGggPiAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSBTTuOBrzIw5paH5a2X5Lul5YaF44Gn44GZ44CCXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja1VpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSBcIltUTVNdIFNO44Gv6Iux5pWw44Gu44G/5L2/55So5Ye65p2l44G+44GZ44CCXCI7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tVaWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL+Wei+eVquahgeaVsCAyMOaWh+Wtl+iLseaVsFxyXG4gICAgaWYgKG9iai5tb2RlbF9udW1iZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIC8v6Iux5pWw44GL44Gp44GG44GLXHJcbiAgICAgICAgaWYgKG9iai5tb2RlbF9udW1iZXIubWF0Y2goL15bQS1aYS16MC05XSokLykpIHtcclxuICAgICAgICAgICAgLy/oi7HmlbDlrZfjgafjgYLjgotcclxuICAgICAgICAgICAgaWYgKG9iai5tb2RlbF9udW1iZXIubGVuZ3RoID4gMjApIHtcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gXCJbVE1TXSDlnovnlarjga8yMOaWh+Wtl+S7peWGheOBp+OBmeOAglwiO1xyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24udGV4dCA9IFwiW1RNU10g5Z6L55Wq44Gv6Iux5pWw44Gu44G/5L2/55So5Ye65p2l44G+44GZ44CCXCI7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5vcGVuKCk7XHJcbiAgICAgICAgICAgIGNoZWNrVWlkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v44OB44Kn44OD44Kv44Gn44Ko44Op44O844Gu5pmC44Gv5oqc44GR44KLXHJcbiAgICBpZiAoY2hlY2tVaWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIC8v6KO95ZOB5ZCN6ZW344GV44OB44Kn44OD44KvXHJcbiAgICBpZiAob2JqLnByb2R1Y3RfbmFtZS5sZW5ndGggPiA1MCkge1xyXG4gICAgICAgIHJlY29yZFsn5ZWG5ZOB5ZCNJ10uZXJyb3IgPSAnW1RNU13oo73lk4HlkI3jga7plbfjgZXjga81MOaWh+Wtl+OBvuOBp+OBp+OBmeOAgic7XHJcbiAgICAgICAga2ludG9uZS5hcHAucmVjb3JkLnNldCh7IHJlY29yZCB9KTtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIDA7XHJcbn1cclxuXHJcblxyXG4vKirnlLvpnaLkuIrpg6jjgqjjg6njg7zooajnpLrnlKggKi9cclxuY29uc3Qgbm90aWZpY2F0aW9uID0gbmV3IEt1Yy5Ob3RpZmljYXRpb24oe1xyXG4gICAgdGV4dDogJycsXHJcbiAgICB0eXBlOiAnZGFuZ2VyJyxcclxuICAgIGNsYXNzTmFtZTogJ29wdGlvbnMtY2xhc3MnLFxyXG4gICAgZHVyYXRpb246IDUwMDAsXHJcbiAgICBjb250YWluZXI6IGRvY3VtZW50LmJvZHlcclxufSk7IiwiaW1wb3J0IHRyYW5jZV9tYXN0ZXIgZnJvbSBcIi4vdHJhbmNlX21hc3Rlci5tanNcIjtcclxuaW1wb3J0IGNoZWNrX3JlZ2lkYXRhIGZyb20gXCIuL2NoZWNrX3JlZ2lkYXRhLm1qc1wiO1xyXG5cclxuLyoqXHJcbiAqIOeZu+mMsuWJjeOBruODh+ODvOOCv+WPluW+l+OBqOODgeOCp+ODg+OCr+OAgG9uQ2xpY2vjgqTjg5njg7Pjg4jmmYLjgahraW50b25lLmV2ZW5044Gn5Yem55CG5YiG44GR44KLXHJcbiAqIEBwYXJhbSB7Kn0gZXZlIEV2ZW5044Kq44OW44K444Kn44Kv44OIXHJcbiAqIEByZXR1cm5zIDAtPnVpZOOBjOWtmOWcqOOBl+OBquOBhCAtMS0+5L2V44GL44GX44KJ44Gu44Ko44Op44O8XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gRGF0YVBpY2tVcChldmUpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKGV2ZSlcclxuXHJcbiAgICAvL+eZu+mMsueUqOOAgG1peHR1cmVfaWTjga91aWTjgahzbuOBrm9iaumFjeWIl1xyXG4gICAgLy9leHAuIFt7dW5pcXVlX2lkOiB4eHh4eHh4eCwgc2VyaWFsX251bWJlcjp4eHh4eHh9LCAuLi4uIF1cclxuICAgIGxldCByZWdpc3REYXRhID0ge1xyXG4gICAgICAgIG1peHR1cmVfaWQ6IFtdLCBwcm9kdWN0X25hbWU6ICcnLCBtb2RlbF9udW1iZXI6ICcnLCBtYW51ZmFjdHVyZXJfY29kZTogJzEnLFxyXG4gICAgICAgIG1ham9yX2RpdmlzaW9uOiAnJywgbWlkZGxlX2RpdmlzaW9uOiAnJywgcHJvZHVjdGlvbl9kYXRlOiAnJywgb3JkZXJfbnVtYmVyOiAnJywgc2l6ZTogJycsXHJcbiAgICAgICAgd2VpZ2h0OiAnJywgcXVhbnRpdHk6ICcnXHJcbiAgICB9O1xyXG5cclxuICAgIC8v54++5Zyo44Gu44OV44Kj44O844Or44OJ5YaF5a655Y+W5b6X44CA44Kk44OZ44Oz44OI55m655Sf5YWD44Gn5Yem55CG5YiG5bKQXHJcbiAgICAvL+OAjFRNU+aOoeeVquOAjeaKvOS4i++8mnR5cGXjga9cImFwcC5yZWNvcmQuZWRpdC5zaG93XCJcclxuICAgIC8vICDlvJXmlbDjga/jgIHjgqTjg5njg7Pjg4jnmbvpjLLmmYLmmYLngrnjga7jg6zjgrPjg7zjg4nmg4XloLHjgavjgarjgotcclxuICAgIC8v44CM5L+d5a2Y44CN5oq85LiL77yadHlwZeOBr1wiYXBwLnJlY29yZC5lZGl0LnN1Ym1pdC5zdWNjZXNzXCJcclxuICAgIC8v44CA5byV5pWw44Gv44CB5L+d5a2Y5oq85LiL5pmC5pmC54K544Gu44Os44Kz44O844OJ5oOF5aCx44Gr44Gq44KLXHJcbiAgICBsZXQgcmVjb3JkID0gXCJcIjtcclxuXHJcbiAgICAvL1RNU+aOoeeVquOBquOBruOBp+OAgeODrOOCs+ODvOODieaDheWgseWGjeWPluW+l1xyXG4gICAgaWYgKGV2ZS50eXBlID09PSBcImFwcC5yZWNvcmQuZWRpdC5zaG93XCIgfHwgZXZlLnR5cGUgPT09IFwiYXBwLnJlY29yZC5jcmVhdGUuc2hvd1wiKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0dldCByZWNvcmQnKTtcclxuICAgICAgICByZWNvcmQgPSBraW50b25lLmFwcC5yZWNvcmQuZ2V0KCkucmVjb3JkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZWNvcmQgPSBldmUucmVjb3JkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKHJlY29yZCk7XHJcblxyXG4gICAgLy/mlbDph49cclxuICAgIHJlZ2lzdERhdGEucXVhbnRpdHkgPSByZWNvcmRbJ+aVsOmHjyddLnZhbHVlO1xyXG4gICAgaWYgKCFyZWdpc3REYXRhLnF1YW50aXR5KSB7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLnRleHQgPSAnVE1T5o6h55WqIOOAjOaVsOmHj+OAjeOBjOaMh+WumuOBleOCjOOBpuOBhOOBvuOBm+OCk+OAgic7XHJcbiAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy/jgIzkv53lrZjjgI3mmYLjga/mlbDph4/jgYzjg4bjg7zjg5bjg6vooYzmlbDjgpLotoXpgY7jgZfjgabjgYTjgovmmYLjga/jgqjjg6njg7woVE1T5o6h55Wq5pmC44Gv5Yem55CG57aZ57aaKVxyXG4gICAgLy8g5L2G44GX44CB44OG44O844OW44Or44Gr5YWl5Yqb44GV44KM44Gm44GE44KLVUlE44Gu5pWw44KS5Z+65rqW44Go44GZ44KL44CCXHJcbiAgICBpZiAoZXZlLnR5cGUgPT09IFwiYXBwLnJlY29yZC5lZGl0LnN1Ym1pdFwiIHx8IGV2ZS50eXBlID09PSBcImFwcC5yZWNvcmQuY3JlYXRlLnN1Ym1pdFwiKSB7ICAgIC8v5L+d5a2Y5pmCXHJcbiAgICAgICAgLy9VSUTjga7mlbDjgpLlj5blvpdcclxuICAgICAgICBsZXQgdWlkQ291bnQgPSBldmUucmVjb3JkLnRtc190YWJsZS52YWx1ZS5tYXAoZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWwgPSBlLnZhbHVlLnRtc191aWQudmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiAodmFsID09ICcnIHx8IHZhbCA9PSB1bmRlZmluZWQpID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh1aWRDb3VudCk7XHJcblxyXG4gICAgICAgIC8vdHJ1ZeOBjOi/lOOCi+OBqOOAgVVJROOBjDHjgaTku6XkuIrlrZjlnKjjgZnjgovkuovjgavjgarjgotcclxuICAgICAgICBpZiAoIXVpZENvdW50LmluY2x1ZGVzKHRydWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1VJROOBjDHjgaTku6XkuIrjgYLjgovjga7jgafjgIFUTVPjgqjjg6njg7zjg4Hjgqfjg4Pjgq9cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZWdpc3REYXRhLnF1YW50aXR5KTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZWNvcmQudG1zX3RhYmxlLnZhbHVlLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGlmIChyZWdpc3REYXRhLnF1YW50aXR5ICE9IHJlY29yZC50bXNfdGFibGUudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlY29yZCk7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi50ZXh0ID0gJ1RNU+aOoeeVqiDjg4bjg7zjg5bjg6vjga7ooYzmlbDjgYzjgIzmlbDph4/jgI3jgpLkuIrlm57jgaPjgabjgYTjgb7jgZnjgIIxJztcclxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9wZW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8v44CMVE1T5o6h55Wq44CN5oq85LiL5pmC44Gv44CB44OG44O844OW44Or44Gu6KGM5pWw44GM5pWw6YeP44KS5LiK5Zue44Gj44Gm44GE44Gf5aC05ZCI44CB44Ko44Op44O8XHJcbiAgICAgICAgaWYgKHJlZ2lzdERhdGEucXVhbnRpdHkgPCByZWNvcmQudG1zX3RhYmxlLnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWNvcmQpO1xyXG4gICAgICAgICAgICBub3RpZmljYXRpb24udGV4dCA9ICdUTVPmjqHnlaog44OG44O844OW44Or44Gu6KGM5pWw44GM44CM5pWw6YeP44CN44KS5LiK5Zue44Gj44Gm44GE44G+44GZ44CCMic7XHJcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5vcGVuKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/lhbHpgJrjg5XjgqPjg7zjg6vvvoTvvp7jg4fjg7zjgr/jgpJvYmrjgbjlpInmj5vjgZfjgabjgYTjgY9cclxuICAgIHJlZ2lzdERhdGEucHJvZHVjdF9uYW1lID0gcmVjb3JkWyfllYblk4HlkI0nXS52YWx1ZTtcclxuICAgIC8v44Oe44K544K/5aSJ5o+bLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBsZXQgbWFzdGVyID0gYXdhaXQgdHJhbmNlX21hc3RlcihyZWNvcmRbJ+aWh+Wtl+WIl19fMeihjF9fMiddLnZhbHVlKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKG1hc3Rlcik7XHJcbiAgICBpZiAobWFzdGVyICE9PSAtMSkgeyAgICAvL+ODnuOCueOCv+OBq+WtmOWcqOOBmeOCi+aZguOBruOBv1xyXG4gICAgICAgIHJlZ2lzdERhdGEubW9kZWxfbnVtYmVyID0gbWFzdGVyLm1vZGVsX251bWJlci52YWx1ZTsgIC8v5Z6L55WqXHJcbiAgICAgICAgcmVnaXN0RGF0YS53ZWlnaHQgPSBtYXN0ZXIud2VpZ2h0LnZhbHVlOyAgICAgICAgICAgICAgLy/kvb/nlKjojbfph41cclxuICAgICAgICByZWdpc3REYXRhLnNpemUgPSBtYXN0ZXIuc2l6ZS52YWx1ZTsgICAgICAgICAgICAgICAgICAvL+OCteOCpOOCulxyXG4gICAgICAgIHJlZ2lzdERhdGEuamFuX2NvZGUgPSBtYXN0ZXIuamFuX2NvZGUudmFsdWU7ICAgICAgICAgIC8vSkFO44Kz44O844OJXHJcbiAgICB9XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIHJlZ2lzdERhdGEubWFqb3JfZGl2aXNpb24gPSBDaGFuZ2VNYWpvcihyZWNvcmRbJ+Wkp+WIhumhniddLnZhbHVlKTtcclxuICAgIHJlZ2lzdERhdGEubWlkZGxlX2RpdmlzaW9uID0gcmVjb3JkWyfkuK3liIbpoZ4nXS52YWx1ZTtcclxuICAgIHJlZ2lzdERhdGEucHJvZHVjdGlvbl9kYXRlID0gcmVjb3JkWyd0bXNfbWZkJ10udmFsdWU7XHJcbiAgICByZWdpc3REYXRhLm9yZGVyX251bWJlciA9IHJlY29yZFsn5paH5a2X5YiXX18x6KGMX18wJ10udmFsdWU7XHJcblxyXG4gICAgLy/jg4bjg7zjg5bjg6vooYzjg4fjg7zjgr/lj5blvpco5ZCM5pmC44Gr5LiN6Laz5YiG44Gu6KGM44KC5L2c5oiQKVxyXG4gICAgbGV0IHRhYmxlRGF0YSA9IEFkanVzdFRhYmxlUm93KHJlY29yZCk7XHJcblxyXG4gICAgLy/nmbvpjLLjg4fjg7zjgr91aWTjgahzbuOCkuWQq+OCgeOBpuS9nOaIkCh0YWJsZeOBi+OCiSlcclxuICAgIHJlZ2lzdERhdGEubWl4dHVyZV9pZCA9IHRhYmxlRGF0YTtcclxuXHJcbiAgICAvL+W/hemgiOODgeOCp+ODg+OCr1xyXG4gICAgaWYgKGNoZWNrX3JlZ2lkYXRhKHJlZ2lzdERhdGEsIHJlY29yZCkgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gcmVnaXN0RGF0YTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWkp+WIhumhnuWQjeOCkuOCs+ODvOODieOBuOWkieaPm+OBl+OBpui/lOOBmVxyXG4gKiDmiLvjgorlgKTvvJotMeOBp+OCqOODqeODvFxyXG4gKiBAcGFyYW0geyp9IG5hbWUgXHJcbiAqL1xyXG5mdW5jdGlvbiBDaGFuZ2VNYWpvcihuYW1lKSB7XHJcbiAgICBzd2l0Y2ggKG5hbWUpIHtcclxuICAgICAgICBjYXNlICfnuYrntq3jgrnjg6rjg7PjgrAnOlxyXG4gICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICBjYXNlICfjgrnjg6rjg7PjgrDjgrvjg4Pjg4gnOlxyXG4gICAgICAgICAgICByZXR1cm4gOTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDjg4bjg7zjg5bjg6vooYzmlbDoqr/mlbQgVE1T5o6h55Wq44Oc44K/44Oz5oq85LiL5pmC44Gu44G/XHJcbiAqIEBwYXJhbSB7Kn0gbnVtIOaVsOmHj1xyXG4gKiBAcGFyYW0geyp9IHRhYmxlIOODhuODvOODluODq29ialxyXG4gKi9cclxuZnVuY3Rpb24gQWRqdXN0VGFibGVSb3cocmVjb3JkKSB7XHJcbiAgICAvL+ePvuWcqOOBruODhuODvOODluODq+ihjOaVsOOBqOavlOi8gyDlkIzjgZjjgarjgonntYLkuoZcclxuICAgIGxldCBub3dUYWJsZVJvd0NvdW50ID0gcmVjb3JkLnRtc190YWJsZS52YWx1ZS5sZW5ndGg7XHJcbiAgICBsZXQgbnVtID0gcmVjb3JkWyfmlbDph48nXS52YWx1ZTtcclxuICAgIGxldCBkZWZDb3VudCA9IG51bSAtIG5vd1RhYmxlUm93Q291bnQ7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkZWZDb3VudCk7XHJcblxyXG4gICAgLy/jg4bjg7zjg5bjg6vooYzmlbDjgYzkuI3otrPjgZfjgabjgYTjgovmmYLov73liqBcclxuICAgIGlmIChkZWZDb3VudCAhPT0gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBhZGRPYmogPSB7XHJcbiAgICAgICAgICAgIGlkOiBudWxsLFxyXG4gICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgJ3Rtc19zbic6IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlNJTkdMRV9MSU5FX1RFWFRcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vdWlk44Gv57eo6ZuG5LiN5Y+v44GrXHJcbiAgICAgICAgICAgICAgICAndG1zX3VpZCc6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlNJTkdMRV9MSU5FX1RFWFRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL3RhYmxl5qeL6YCg44KScHVzaFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICByZWNvcmQudG1zX3RhYmxlLnZhbHVlLnB1c2goYWRkT2JqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlY29yZCk7XHJcbiAgICAgICAga2ludG9uZS5hcHAucmVjb3JkLnNldCh7IHJlY29yZCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvL+ODhuODvOODluODq+OBruODh+ODvOOCv+OCkuWPluW+l+OBl+OBpumFjeWIl+OBuFxyXG4gICAgLy8gcmVjb3JkID0ga2ludG9uZS5hcHAucmVjb3JkLmdldCgpLnJlY29yZDtcclxuXHJcbiAgICBsZXQgdGFibGVEYXRhID0gW107XHJcbiAgICByZWNvcmQudG1zX3RhYmxlLnZhbHVlLm1hcChlID0+IHtcclxuICAgICAgICB0YWJsZURhdGEucHVzaCh7XHJcbiAgICAgICAgICAgIHVuaXF1ZV9pZDogZS52YWx1ZS50bXNfdWlkLnZhbHVlLFxyXG4gICAgICAgICAgICBzZXJpYWxfbnVtYmVyOiBlLnZhbHVlLnRtc19zbi52YWx1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiB0YWJsZURhdGE7XHJcblxyXG59XHJcblxyXG4vKirnlLvpnaLkuIrpg6jjgqjjg6njg7zooajnpLrnlKggKi9cclxuY29uc3Qgbm90aWZpY2F0aW9uID0gbmV3IEt1Yy5Ob3RpZmljYXRpb24oe1xyXG4gICAgdGV4dDogJycsXHJcbiAgICB0eXBlOiAnZGFuZ2VyJyxcclxuICAgIGNsYXNzTmFtZTogJ29wdGlvbnMtY2xhc3MnLFxyXG4gICAgZHVyYXRpb246IDIwMDAsXHJcbiAgICBjb250YWluZXI6IGRvY3VtZW50LmJvZHlcclxufSk7IiwiLyoqXHJcbiAqIOWIneacn+WMluWHpueQhlxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBJbml0KGUpIHtcclxuICAgIFRhYmxlSW5pdChlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOODhuODvOODluODq1VJROOCkue3qOmbhuS4jeWPr+OBq1xyXG4gKi9cclxuZnVuY3Rpb24gVGFibGVJbml0KGVsbSkge1xyXG4gICAgZWxtLnJlY29yZC50bXNfdGFibGUudmFsdWUubWFwKGUgPT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIGUudmFsdWUudG1zX3VpZC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICB9KTtcclxufSIsIi8v44Os44Kz44O844OJ5L+d5a2Y5pmC5Yem55CGXHJcblxyXG5pbXBvcnQgeyBEYXRhUGlja1VwIH0gZnJvbSBcIi4vZGF0YV9waWNrdXAubWpzXCI7XHJcbmltcG9ydCB0bXNfYXBpIGZyb20gXCIuL3Rtc19hcGkubWpzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoZSkge1xyXG5cclxuICAgIGxldCBteURhdGEgPSBhd2FpdCBEYXRhUGlja1VwKGUpO1xyXG4gICAgLy9EYXRhUGlja3Vw44Gn44Ko44Op44O844OI44Op44OD44OXXHJcbiAgICBpZiAobXlEYXRhID09PSAtMSkgcmV0dXJuIC0xO1xyXG4gICAgaWYgKG15RGF0YSA9PT0gMCkgcmV0dXJuIDA7IC8v5L+d5a2Y5oq85LiL44GL44GkVUlE44GM54Sh44GE5aC05ZCI44GvVE1TX0FQSeWHpueQhueEoeOBl1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBhd2FpdCB0bXNfYXBpKG15RGF0YSk7XHJcbiAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG5cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIFRNU19BUEnlrp/ooYzpg6jjgIBcclxuICovXHJcblxyXG4vL+eZu+mMsueUqElE562JXHJcbmNvbnN0IHBhcmFtID0ge1xyXG4gICAgaWQ6ICdkR0ZwZVc4NmNHVm5ZWE4xY3pFNmNHVnpkU001T1RFPScsXHJcbiAgICB1cmxfZGV2OiAnaHR0cHM6Ly90c3VyaXNjb3BlLmpwL21hbmFnZXJfcHJlL0FwaVByb2R1Y3RzL2FkZCcsXHJcbiAgICB1cmxfcHJvZHVjdDogJ2h0dHBzOi8vdHN1cmlzY29wZS5qcC9tYW5hZ2VyL0FwaVByb2R1Y3RzL2FkZCdcclxufVxyXG5cclxuLyoqXHJcbiAqIFxyXG4gKiBAcGFyYW0geyp9IHJlZ2lEYXRhIOS4gOW/nOOCqOODqeODvOODgeOCp+ODg+OCr+OBleOCjOOBn+eZu+mMsueUqOODh+ODvOOCv1xyXG4gKiBAcmV0dXJucyBUTVPjgYvjgonjga7ntZDmnpxcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChyZWdpRGF0YSkge1xyXG4gICAgbGV0IHB1dERhdGEgPSBGb3JtYXREYXRhKHJlZ2lEYXRhKTsgICAvL3JlZ2lEYXRh44GL44KJZmV0Y2jnlKjjg4fjg7zjgr8oanNvbuW9ouW8jynjga7kvZzmiJBcclxuICAgIGxldCBwb3N0UmVzID0gYXdhaXQgUG9zdGluZyhwdXREYXRhKTtcclxuICAgIHJldHVybiBwb3N0UmVzO1xyXG59XHJcblxyXG4vL+eZu+mMsueUqOODh+ODvOOCv+OBuOaVtOW9ouOBmeOCi1xyXG5mdW5jdGlvbiBGb3JtYXREYXRhKGRhdGEpIHtcclxuXHJcbiAgICBjb25zdCB0aHJvd0RhdGEgPSB7fTtcclxuICAgIGNvbnN0IGx4ID0gbHV4b24uRGF0ZVRpbWUubG9jYWwoKTtcclxuICAgIGNvbnN0IGZvcm1hdERhdGUgPSBseC50b0Zvcm1hdCgneXl5eU1NZGRISG1tc3MnKTtcclxuXHJcbiAgICAvL+WFsemAmuaXpeS7mOmDqFxyXG4gICAgdGhyb3dEYXRhLmNyZWF0ZWRfZGF0ZXRpbWUgPSBmb3JtYXREYXRlO1xyXG5cclxuICAgIC8v5YCL5Yil57mw44KK6L+U44GX6YOo44Gu5L2c5oiQXHJcbiAgICBjb25zdCBxdCA9IGRhdGEucXVhbnRpdHk7XHJcbiAgICBsZXQgbXlMaXN0ID0gW107XHJcbiAgICAvL+aVsOmHj+WIhue5sOOCiui/lOOBl1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdDsgaSsrKSB7XHJcbiAgICAgICAgbXlMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICBcInVuaXF1ZV9pZFwiOiBkYXRhLm1peHR1cmVfaWRbaV0udW5pcXVlX2lkLFxyXG4gICAgICAgICAgICBcInByb2R1Y3RfbmFtZVwiOiBkYXRhLnByb2R1Y3RfbmFtZSxcclxuICAgICAgICAgICAgXCJzZXJpYWxfbnVtYmVyXCI6IGRhdGEubWl4dHVyZV9pZFtpXS5zZXJpYWxfbnVtYmVyLFxyXG4gICAgICAgICAgICBcIm1vZGVsX251bWJlclwiOiBkYXRhLm1vZGVsX251bWJlcixcclxuICAgICAgICAgICAgXCJtYW51ZmFjdHVyZXJfY29kZVwiOiBkYXRhLm1hbnVmYWN0dXJlcl9jb2RlLFxyXG4gICAgICAgICAgICBcImphbl9jb2RlXCI6IGRhdGEuamFuX2NvZGUsXHJcbiAgICAgICAgICAgIFwibWFqb3JfZGl2aXNpb25cIjogZGF0YS5tYWpvcl9kaXZpc2lvbixcclxuICAgICAgICAgICAgXCJtaWRkbGVfZGl2aXNpb25cIjogZGF0YS5taWRkbGVfZGl2aXNpb24sXHJcbiAgICAgICAgICAgIFwicHJvZHVjdGlvbl9kYXRlXCI6IGRhdGEucHJvZHVjdGlvbl9kYXRlLFxyXG4gICAgICAgICAgICBcIm9yZGVyX251bWJlclwiOiBkYXRhLm9yZGVyX251bWJlcixcclxuICAgICAgICAgICAgXCJjdXN0b21lcl9jb2RlXCI6IGRhdGEuY3VzdG9tZXJfY29kZSxcclxuICAgICAgICAgICAgXCJzaXplXCI6IGRhdGEuc2l6ZSxcclxuICAgICAgICAgICAgXCJ3ZWlnaHRcIjogZGF0YS53ZWlnaHQsXHJcbiAgICAgICAgICAgIFwicHJvZHVjdF9saW5rXCI6IGRhdGEucHJvZHVjdF9saW5rXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLmxvZyhteUxpc3QpO1xyXG4gICAgdGhyb3dEYXRhLmxpc3QgPSBteUxpc3Q7XHJcbiAgICByZXR1cm4gdGhyb3dEYXRhO1xyXG5cclxufVxyXG5cclxuLy9UTVPjgbhEYXRh44KSUE9TVOOBmeOCi1xyXG4vKipcclxuICogRGF0YeOCklRNU+OBuFBPU1TjgZnjgotcclxuICogQHBhcmFtIHsqfSBkYXRhIOeZu+mMsueUqOODh+ODvOOCv29ialxyXG4gKiBAcmV0dXJucyAgICAgXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBQb3N0aW5nKGRhdGEpIHtcclxuICAgIGNvbnN0IGhlYWRlcnMgPSB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAnWC1JVEZBdXRoJzogcGFyYW0uaWQsXHJcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiAnQmFzaWMgY0hKbFZHVnpkR1Z5T2xSQWFYbHZNakF5TXc9PSdcclxuICAgIH1cclxuXHJcbiAgICAvL0RlYnVn55SoXHJcbiAgICBjb25zdCB0ZXN0RGF0YSA9IHtcclxuICAgICAgICBcImNyZWF0ZWRfZGF0ZXRpbWVcIjogXCIyMDIzMTAxMzA5MDIwMFwiLFxyXG4gICAgICAgIFwibGlzdFwiOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwicHJvZHVjdF9uYW1lXCI6IFwiSE9HRTJcIixcclxuICAgICAgICAgICAgICAgIFwibWFudWZhY3R1cmVyX2NvZGVcIjogMSxcclxuICAgICAgICAgICAgICAgIFwibWFqb3JfZGl2aXNpb25cIjogMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaG9nZXRhbjtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaG9nZXRhbiA9IGF3YWl0IGtpbnRvbmUucHJveHkocGFyYW0udXJsX2RldiwgJ1BPU1QnLCBoZWFkZXJzLCBkYXRhKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgbGV0IG1zZyA9IEpTT04ucGFyc2UoZXJyb3IpLm1lc3NhZ2U7XHJcbiAgICAgICAgY29uc29sZS5sb2cobXNnKTtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoJ1tUTVNdVE1T44G444GuQVBJ44GnUE9TVOOCqOODqeODvFxcbicgKyBtc2cpO1xyXG4gICAgICAgIHJldHVybiAtOTk7XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLmxvZyhob2dldGFuKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKGhvZ2V0YW5bMF0pO1xyXG5cclxufVxyXG4iLCIvKipcclxuICogVE1TX+WkieaPm+ODnuOCueOCv+OAgOOCouODl+ODquOBi+OCieWVhuWTgeOCs+ODvOODieOCkuOCreODvOOBqOOBl+OBpuODrOOCs+ODvOODieOCkui/lOOBmVxyXG4gKiDmjIflrprjgZXjgozjgZ/jgrPjg7zjg4njgYzlrZjlnKjjgZfjgarjgYTmmYLjga/jgIEtMeOCkui/lOOBmVxyXG4gKiBAcGFyYW0geyp9IHByb2RDb2RlIFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKHByb2RDb2RlKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhwcm9kQ29kZSk7XHJcblxyXG4gICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICBhcHA6IDI1MCxcclxuICAgICAgICBxdWVyeTogYHByb2RfY29kZSA9IFwiJHtwcm9kQ29kZX1cImAsXHJcbiAgICAgICAgdG90YWxDb3VudDogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCByZXMgPSBhd2FpdCBraW50b25lLmFwaShraW50b25lLmFwaS51cmwoJy9rL3YxL3JlY29yZHMnLCB0cnVlKSwgJ0dFVCcsIGJvZHkpO1xyXG4gICAgLy8gY29uc29sZS5sb2cocmVzKTtcclxuICAgIC8vaGl044GX44Gq44GL44Gj44Gf5aC05ZCI44CBdG90YWxDb3VudOOBp+WIpOWumlxyXG4gICAgaWYgKHJlcy50b3RhbENvdW50ID09PSAnMCcpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiByZXMucmVjb3Jkc1swXTtcclxuICAgIH1cclxuXHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBCdG5GdW5jIGZyb20gXCIuL21vZC9idG5fZnVuYy5tanNcIjtcbmltcG9ydCB7IEluaXQgfSBmcm9tIFwiLi9tb2QvaW5pdC5tanNcIjtcbmltcG9ydCBzdWJtaXQgZnJvbSBcIi4vbW9kL3N1Ym1pdC5tanNcIjtcblxuY29uc3QgcmVnaXN0VXNlciA9IHsgJ2NvbXBfY29kZSc6ICd0YWl5bycsICd1c2VyX2lkJzogJ2FkbWludXNlcicsICdwYXNzX3dvcmQnOiAnQWRtaW5QYXNzMCcgfTtcblxuKCgkKSA9PiB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8v5paw6KaP5L2c5oiQ44O757eo6ZuG5pmC44Kk44OZ44Oz44OIXG4gICAga2ludG9uZS5ldmVudHMub24oWydhcHAucmVjb3JkLmNyZWF0ZS5zaG93JywgJ2FwcC5yZWNvcmQuZWRpdC5zaG93J10sIChlKSA9PiB7XG5cbiAgICAgICAgSW5pdChlKTtcbiAgICAgICAgZGVidWdJbnB1dChlKTsgIC8v44OH44OQ44OD44Kw55SoXG4gICAgICAgIEJ0bkZ1bmMoZSk7XG4gICAgICAgIC8vIHJldHVybiBlO1xuXG4gICAgfSk7XG5cbiAgICAvL+ODrOOCs+ODvOODiei/veWKoOODu+e3qOmbhueUu+mdouOAgOS/neWtmOODnOOCv+ODs+aKvOS4i+aZglxuICAgIGtpbnRvbmUuZXZlbnRzLm9uKFsnYXBwLnJlY29yZC5jcmVhdGUuc3VibWl0JywgJ2FwcC5yZWNvcmQuZWRpdC5zdWJtaXQnXSwgYXN5bmMgZSA9PiB7XG4gICAgICAgIGNvbnN0IHggPSBhd2FpdCBzdWJtaXQoZSk7XG4gICAgICAgIGlmICh4ID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RhdGFQaWNrdXDjgafkuI3mraPjg4fjg7zjgr8nKTtcbiAgICAgICAgICAgIGUucmVjb3JkWyfmlbDph48nXS5lcnJvciA9ICdUTVPmjqHnlarjgafkuI3mraPjgarjg4fjg7zjgr8nO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICB9KVxuXG4gICAgLy/jg4bjg7zjg5bjg6vooYzkvZzmiJDmmYLjgqTjg5njg7Pjg4hcbiAgICBraW50b25lLmV2ZW50cy5vbihbXCJhcHAucmVjb3JkLmNyZWF0ZS5jaGFuZ2UudG1zX3RhYmxlXCIsIFwiYXBwLnJlY29yZC5lZGl0LmNoYW5nZS50bXNfdGFibGVcIl0sIChlKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICBpZiAoZS5jaGFuZ2VzLnJvdykge1xuICAgICAgICAgICAgLy91aWTnt6jpm4bkuI3lj6/jgbhcbiAgICAgICAgICAgIGUuY2hhbmdlcy5yb3cudmFsdWUudG1zX3VpZC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSlcblxufSkoalF1ZXJ5KTtcblxuZnVuY3Rpb24gZGVidWdJbnB1dChlKSB7XG4gICAgLy8gY29uc29sZS5sb2coZSk7XG4gICAgZS5yZWNvcmRbJ+WVhuWTgeWQjSddLnZhbHVlID0gXCJURVNUXCI7XG4gICAgZS5yZWNvcmRbJ+Wkp+WIhumhniddLnZhbHVlID0gXCLnuYrntq3jgrnjg6rjg7PjgrBcIjtcbiAgICBlLnJlY29yZFsn5pWw6YePJ10udmFsdWUgPSAxO1xufSJdLCJuYW1lcyI6WyJCdG5GdW5jIiwiSW5pdCIsInN1Ym1pdCIsInJlZ2lzdFVzZXIiLCIkIiwia2ludG9uZSIsImV2ZW50cyIsIm9uIiwiZSIsImRlYnVnSW5wdXQiLCJ4IiwiY29uc29sZSIsImxvZyIsInJlY29yZCIsImVycm9yIiwiY2hhbmdlcyIsInJvdyIsInZhbHVlIiwidG1zX3VpZCIsImRpc2FibGVkIiwialF1ZXJ5Il0sInNvdXJjZVJvb3QiOiIifQ==