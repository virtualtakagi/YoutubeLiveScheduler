//Youtubeから取得したライブ情報とChrome.Storage内の情報の比較に用いる
var isKey;

//動画IDから取得したJSONから要素を取得しHTMLタグを生成する
$('#create').on('click', function(){
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {

		//URLを取得できなかった場合は処理を終了
		if(tabs[0] === undefined){
			console.log("URL Undefined.");
			return;
		}

		//現在のタブからURLを取得
		var url = tabs[0].url;

		//splitでvideoIDを取得
		var liveIdAr = url.split("v=");

		//リクエストURLの生成
		reqUrl += liveIdAr[1] + "&part=" + part + "&key=" + api;

		//jsonデータの取得
		ajaxDataYoutube(reqUrl).done(function(jsondata){

			//ライブステータスを取得
			var status = jsondata.items[0].snippet.liveBroadcastContent;

			//ステータスが"upcoming"以外なら処理を終了
			if(status != "upcoming"){
				console.log("LiveStatus is Not 'upcoming'");
				return;
			}

			//開始時刻、チャンネル名、ライブタイトルを取得
			var time = new Date(jsondata.items[0].liveStreamingDetails.scheduledStartTime);
			var channel = jsondata.items[0].snippet.channelTitle;
			var title = jsondata.items[0].snippet.title;

			//時刻の表記を表示用に変換する
			time = convertTime(time);

			//ライブ情報を元にHTMLを生成し、Chrome.Storageに保存
			tagArray = createTag(channel, title, time, liveIdAr[1], url);

			//初期化
			isKey = false;

			//同期処理をさせる
		    (async ()=>{

		    	//ChromeStorage内のライブ情報と一致するかチェック
		    	//一致したらHTMLタグを出力しない
		    	await checkKey(tagArray[1]);

		    	//一致するライブ情報がなかったら続きの処理を行う
		    	if(!isKey){

		    		//HTMLタグをChrome.Storageへ保存
		    		saveChromeStorage(tagArray);

		    		//HTMLタグに現在の時刻との差分を付与する
		    		tagArray[0] = setTimeLeft(tagArray[1], tagArray[0]);

		    		//表示画面に生成したHTMLタグを追加する
		    		dispTag(tagArray[0]);
		    	}
		    }).call();
		});
	})
});

//ALLDELボタンがクリックされた時の処理
$('#removeAll').on('click', function(){

	//LoacalStorageの全削除
	removeAllChromeStorage();

	//表示中のライブスケジュールを全て消去
	$('section').remove();
})

//DELボタンがクリックされた時の処理
$('#remove').on('click', function(){

	//最後尾の#titleの値を取得
	var key =  $('section:last').attr('id');

	//LiveTitleをキーにstorage内から削除
	chrome.storage.local.remove(key, function(){
		console.log("deleted: " + key);
	});

	//最後尾の<section>を削除
	$('section:last').remove();
})

//Youtube Data APIからJSON取得
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

//ISO 8601形式から見慣れた形に変換する
function convertTime(iso8601){
	time = iso8601.toLocaleString();
	return time;
}

//引数のタグでHTMLを<header>直下に生成
function dispTag(tag){
	$('header').after(tag);
}

//ライブ情報を結合しHTMLタグを返す
function createTag(channel, title, time, liveid, url){

	var tag = new Array(2);

    //HTMLタグを作成
    tag[0] = '<section id="' + liveid + '">'
    		+ 'Channel: <p id="channel">' + channel + '</p><br>'
    		+ 'LiveTitle: <p id="title"><a href="'+ url + '" target="_blank">' + title
    		+ ' <i class="fas fa-external-link-alt"></i></a></p><br>'
    		+ 'StartTime: <p id="time">' + time + '</p><br>'
    		+ 'TimeLeft: <p id="timeleft"></p>'
    		+ '</section>';

    //LocalStorageへ保存するkeyを作成
    tag[1] = liveid + "," + time;

	return tag;
}

//引数のHTMLタグに残り時間を付与する
function setTimeLeft(key, tag){

	//keyから開始時刻を取得する
	var timeAr = key.split(",");

	//開始時刻の文字列をDate型に変換
	var start = new Date(timeAr[1]);

	//現在時刻を取得
	var now = new Date();

	//開始時刻と現在時刻の差を秒へ変換
	var duration = (start.getTime() - now.getTime()) / 1000;

	//現在時刻が開始時刻を上回っていた場合は00hours 00minutesを返す
	if(duration <= 0){

		//残り時間を表示する文字列を作成
		var addTag = "<p id=\"hour\">00 </p>hours "
						+ "<p id=\"min\">00 </p>minutes "
						+ "<p id=\"sec\">00 </p>seconds";

		//HTMLタグに文字列を挿入する
		var tagAr = tag.split("<p id=\"timeleft\">");
		var tag = tagAr[0] + addTag + tagAr[1];

		return tag;
	}

	//時間・分・秒を算出
	var hour = Math.floor(duration / 3600);
	var min = Math.floor((duration % 3600) / 60);
	var sec = Math.floor((duration % 3600) % 60);

	//00:00:00のように0埋めで表記する
	hour = zeroPadding(hour, 2);
	min = zeroPadding(min, 2);
	sec = zeroPadding(sec, 2);

	//残り時間を表示する文字列を作成
	var addTag = "<p id=\"hour\">" + hour +" </p>hours "
					+ "<p id=\"min\">" + min + " </p>minutes "
					+ "<p id=\"sec\">" + sec + " </p>seconds";

	//HTMLタグに文字列を挿入する
	var tagAr = tag.split("<p id=\"timeleft\">");
	var tag = tagAr[0] + addTag + tagAr[1];

	return tag;
}

//引数の数値を0埋めした形で返す
function zeroPadding(num, length){
	return ('00' + num).slice(-length);
}

//初期起動時にChrome.Storageの中身をロードしHTMLとして追加する
$(function(){
	getChromeStorage();
});

//Chrome.StorageからGetしてHTMLタグを生成
function getChromeStorage() {
	chrome.storage.local.get(function(items) {
		//一件以上存在したらタグを読み込む
		if(items !== undefined) {
			$.each(items, function(key, tag) {

				//ライブ開始までの時間をHTMLタグに追加
				tag = setTimeLeft(key, tag);

				//HTMLタグの生成
				dispTag(tag);
			})
		}
	})
}

//引数のタグからキーを作成し、Chrome.Storageに保存する
function saveChromeStorage(tagArray) {
	//LocalStorageへ保存(キー: "videoID,StartTime")
	chrome.storage.local.set({[`${tagArray[1]}`]:tagArray[0]}, function() {
		console.log("saved: " + tagArray[1]);
	});
}

//取得したライブ情報がChromeStorage内にあったらisKeyにtrueをセットする
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

//ChromeStorage内のデータをすべて削除
function removeAllChromeStorage() {
	chrome.storage.local.clear();
	console.log("Erase ChromeStorage.")
}
