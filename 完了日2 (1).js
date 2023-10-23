
(function () {

"use strict";

var events = ['app.record.edit.change.ドロップダウン',
 'app.record.create.change.ドロップダウン',
 'app.record.index.edit.change.ドロップダウン'];

kintone.events.on(events, function(event) {

 var record = event.record;

//現在の日時を取得し変数dateに格納
var date = new Date(); 

 //年月日時分秒のフォーマットに編集
var datetime = moment(date).format('YYYY/MM/DD HH:mm:ss');

switch (record['ドロップダウン']['value']){
 case "★ 完了":
 //日時フィールド用のフォーマットに編集し日時フィールドにセット
record['作業完了日']['value'] = moment(datetime).toISOString();
 break;

 case "△ 未処理":
 //日時フィールド用のフォーマットに編集し日時フィールドにセット
record['作業完了日']['value'] = moment(datetime).toISOString();
 break;
 
  case "○ 処理中":
 //日時フィールド用のフォーマットに編集し日時フィールドにセット
record['作業完了日']['value'] = moment(datetime).toISOString();
 break;




 }
 return event;

 });

})();