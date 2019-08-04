chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	var notifTime = new Array();

	//アラーム作成
	chrome.alarms.create(request.text, { "periodInMinutes": 1 });
	console.log("created alarm: " + request.text);

	// 1分間隔で通知時刻と現在時刻の比較を行う
	chrome.alarms.onAlarm.addListener(function (alarm) {

		var infoArray = alarm.name.split(",");
		var title = infoArray[0];
		var startTime = infoArray[1];
		var remain = getTimeLeft(startTime);

		//開始時刻のX分前に通知を行う（単位：分）
		notifTime[0] = localStorage["notifTime1"] ? localStorage["notifTime1"] : 191844000;
		notifTime[1] = localStorage["notifTime2"] ? localStorage["notifTime2"] : 191844000;
		notifTime[2] = localStorage["notifTime3"] ? localStorage["notifTime3"] : 191844000;

		const minTime = Math.min.apply(null, notifTime);

		//開始までの時間が通知時間と一致したら通知を行う
		if((notifTime[2] == remain)
				|| (notifTime[1] == remain)
				|| (notifTime[0] == remain)){
			dispNotification(title, remain);
		} else if(minTime > remain){
			chrome.alarms.clear(alarm.name);
		}
	});

	//通知処理
	function dispNotification(title, remain){

    	var notifString = new Date().getMinutes();
    	notifString += "_" + title;

    	var message = "ライブ開始 " + remain + " 分前です";
       	chrome.notifications.create(`NOTIFICATION_NAME_${notifString}`, {
   		  type: 'basic',
   		  iconUrl: '../icon/Icon-128.png',
   		  title: title,
   		  message: message,
   		  contextMessage: 'from Youtube Live Scheduler',
   		  priority: 1
   		});

	}

	//通知判定に使用する残り時間を算出する
	function getTimeLeft(startTime){

		//開始時刻の文字列をDate型に変換
		var start = new Date(startTime);

		//現在時刻を取得
		var now = new Date();

		//開始時刻と現在時刻の差を秒へ変換
		var duration = (start.getTime() - now.getTime()) / 1000;

		//分を算出
		var remaining = Math.floor(duration / 60);

		return remaining;
	}

});