$('#create').on('click', function(){

	// 現在開いているタブのURLを取得する
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
		if(tabs[0] === undefined){
			console.log("URL Undefined.");
			return;
	}
	var url = tabs[0].url;
	var liveIdAr = url.split("v=");
	reqUrl += liveIdAr[1] + "&part=" + part + "&key=" + api;

	// JSON取得
	ajaxDataYoutube(reqUrl).done(function(jsondata){
		var status = jsondata.items[0].snippet.liveBroadcastContent;
		if(status != "upcoming"){
			console.log("LiveStatus is Not 'upcoming'");
			return;
		}

		// JSONから、ライブ開始時刻、チャンネル名、タイトルを取得
		var time = new Date(jsondata.items[0].liveStreamingDetails.scheduledStartTime);
		var channel = jsondata.items[0].snippet.channelTitle;
		var title = jsondata.items[0].snippet.title;
		time = convertTime(time);

		// DOMを生成
		tagArray = createTag(channel, title, time, liveIdAr[1], url);

		isKey = false;

		(async ()=>{

		    	await checkKey(tagArray[1]);

		    	if(!isKey){

		    		saveChromeStorage(tagArray);
		    		var tobackground = channel + "," + time;

		    		// background.jsにチャンネル名と開始時刻を送信
		    		chrome.runtime.sendMessage({
		    			text: tobackground
		    		});

		    		// 現在時刻から開始時刻までのカウントを付与
		    		tagArray[0] = setTimeLeft(tagArray[1], tagArray[0]);

		    		// ライブ情報の表示
		    		dispTag(tagArray[0]);
		    	}
		    }).call();
		});
	})
});

$('#option').on('click', function() {
	window.location.href = "../options.html";
});

$('#share').on('click', function() {
	window.open('http://twitter.com/share?url=http://urx.space/EU2V&text=YouTubeライブの開始時間を記録・通知できるChrome拡張、「YouTubeLive Scheduler」を使っています。&hashtags=YouTubeLiveScheduler')
})

$('#removeAll').on('click', function(){
	if (confirm('全て削除しますか？')) {
		removeAllChromeStorage();
		$('section').remove();
		chrome.alarms.clearAll();
	}
})

$('#remove').on('click', function(){
	var key =  $('section:last').attr('id');
	chrome.storage.local.remove(key, function(){
		console.log("deleted: " + key);
	});
	$('section:last').remove();
})

function ajaxDataYoutube(reqUrl){
	return $.ajax({
		type: 'GET',
		url: reqUrl,
		dataType: 'json',
		error: function() {
			console.log("Cannot connect Youtube Data API.")
		}
	})
}

function convertTime(iso8601){
	time = iso8601.toLocaleString();
	return time;
}

function dispTag(tag){
	$('.main').append(tag);
}

function createTag(channel, title, time, liveid, url){
	var tag = new Array(2);
    tag[0] = '<section id="' + liveid + '">'
    		+ 'Channel: <p id="channel">' + channel + '</p><br>'
    		+ 'LiveTitle: <p id="title"><a href="'+ url + '" target="_blank">' + title
    		+ ' <i class="fas fa-external-link-alt"></i></a></p><br>'
    		+ 'StartTime: <p id="time">' + time + '</p><br>'
    		+ 'TimeLeft: <p id="timeleft"></p>'
    		+ '</section>';
    tag[1] = liveid + "," + time;
	return tag;
}

function setTimeLeft(key, tag){
	var timeAr = key.split(",");
	var start = new Date(timeAr[1]);
	var now = new Date();
	var duration = (start.getTime() - now.getTime()) / 1000;

	if(duration <= 0){
		var addTag = "<p id=\"hour\">00 </p>hours "
						+ "<p id=\"min\">00 </p>minutes "
						+ "<p id=\"sec\">00 </p>seconds";

		var tagAr = tag.split("<p id=\"timeleft\">");
		var tag = tagAr[0] + addTag + tagAr[1];
		return tag;
	}

	var hour = Math.floor(duration / 3600);
	var min = Math.floor((duration % 3600) / 60);
	var sec = Math.floor((duration % 3600) % 60);

	hour = zeroPadding(hour, 2);
	min = zeroPadding(min, 2);
	sec = zeroPadding(sec, 2);

	var addTag = "<p id=\"hour\">" + hour +" </p>hours "
					+ "<p id=\"min\">" + min + " </p>minutes "
					+ "<p id=\"sec\">" + sec + " </p>seconds";

	var tagAr = tag.split("<p id=\"timeleft\">");
	var tag = tagAr[0] + addTag + tagAr[1];

	return tag;
}

function zeroPadding(num, length){
	return ('00' + num).slice(-length);
}

$(function(){
	getChromeStorage();
});

function getChromeStorage() {
	chrome.storage.local.get(function(items) {
		if(items !== undefined) {
			$.each(items, function(key, tag) {

				tag = setTimeLeft(key, tag);

				dispTag(tag);
			})
		}
	})
}

function saveChromeStorage(tagArray) {
	chrome.storage.local.set({[`${tagArray[1]}`]:tagArray[0]}, function() {
		console.log("saved: " + tagArray[1]);
	});
}

function checkKey(newKey){
	return new Promise(function(resolve, reject){
		chrome.storage.local.get(function(items) {
			if(items !== undefined) {
				$.each(items,async function(key, tag) {
					if(key === newKey){
						isKey = true;
						resolve(true);
						console.log("Already Exist. End Process.")
						return false;
					}
				});
				if(!isKey){
					resolve(false);
				}
			}
		});
	});
}

function removeAllChromeStorage() {
	chrome.storage.local.clear();
	console.log("Erase ChromeStorage.")
}
