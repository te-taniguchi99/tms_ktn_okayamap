
/**
 * 2023/10/23　moment.jsからluxon.jsへ変更した　te-taniguchi
 */
(function () {

    "use strict";

    let events = ['app.record.edit.change.ドロップダウン',
        'app.record.create.change.ドロップダウン',
        'app.record.index.edit.change.ドロップダウン'];

    kintone.events.on(events, function (event) {

        luxon.Settings.defaultLocale = 'ja';
        let record = event.record;

        //年月日時分秒のフォーマットに編集
        let datetime = luxon.DateTime.local().toISO();
        let date = luxon.DateTime.local().toFormat('yyyy-MM-dd');
        // console.log(luxon.DateTime.local().toFormat('yyyy-MM-dd'));

        switch (record['ドロップダウン']['value']) {
            case "★ 完了":
                //日時フィールド用のフォーマットに編集し日時フィールドにセット
                record['作業完了日']['value'] = datetime;
                record.tms_mfd.value = date;
                break;

            case "△ 未処理":
                //日時フィールド用のフォーマットに編集し日時フィールドにセット
                record['作業完了日']['value'] = datetime;
                record.tms_mfd.value = date;
                break;

            case "○ 処理中":
                //日時フィールド用のフォーマットに編集し日時フィールドにセット
                record['作業完了日']['value'] = datetime;
                record.tms_mfd.value = date;
                break;


        }
        return event;

    });

})();