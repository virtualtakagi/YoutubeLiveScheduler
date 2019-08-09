chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var notifTime = new Array();
	chrome.alarms.create(request.text, { "periodInMinutes": 1 });
	console.log("created alarm: " + request.text);
	chrome.alarms.onAlarm.addListener(function (alarm) {
		var infoArray = alarm.name.split(",");
		var title = infoArray[0];
		var startTime = infoArray[1];
		var remain = getTimeLeft(startTime);
		notifTime[0] = localStorage["notifTime1"] ? localStorage["notifTime1"] : 191844000;
		notifTime[1] = localStorage["notifTime2"] ? localStorage["notifTime2"] : 191844000;
		notifTime[2] = localStorage["notifTime3"] ? localStorage["notifTime3"] : 191844000;
		if((notifTime[2] == remain)
				|| (notifTime[1] == remain)
				|| (notifTime[0] == remain)){
			dispNotification(title, remain);
		} else if(5 > remain){
			chrome.alarms.clear(alarm.name);
		}
	});
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
	function getTimeLeft(startTime){

		var start = new Date(startTime);
		var now = new Date();
		var duration = (start.getTime() - now.getTime()) / 1000;
		var remaining = Math.floor(duration / 60);
		return remaining;
	}
});