$('#save').on('click', function(){
	window.location.href = "../popup.html";
	localStorage["notifTime1"] = $('#notifTime1').val();
	localStorage["notifTime2"] = $('#notifTime2').val();
	localStorage["notifTime3"] = $('#notifTime3').val();
});
$('#cancel').on('click', function() {
	window.location.href = "../popup.html";
});
$(function(){
	if (localStorage["notifTime1"]) {
		var time1 = localStorage["notifTime1"]
		$("#notifTime1 option[value=" + time1 + "]").attr("selected", true);
	} else {
		var defaultTime1 = 60;
		$("#notifTime1 option[value="+ defaultTime1 + "]").attr("selected", true);
		localStorage["notifTime1"] = $('#notifTime1').val();
	}
	if (localStorage["notifTime2"]) {
		var time2 = localStorage["notifTime2"]
		$("#notifTime2 option[value=" + time2 + "]").attr("selected", true);
	} else {
		var defaultTime2 = 30;
		$("#notifTime2 option[value=" + defaultTime2 + "]").attr("selected", true);
		localStorage["notifTime2"] = $('#notifTime2').val();
	}
	if (localStorage["notifTime3"]) {
		var time3 = localStorage["notifTime3"]
		$("#notifTime3 option[value=" + time3 + "]").attr("selected", true);
	} else {
		var defaultTime3 = 10;
		$("#notifTime3 option[value=" + defaultTime3 + "]").attr("selected", true);
		localStorage["notifTime3"] = $('#notifTime3').val();
	}
});