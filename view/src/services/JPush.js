import { HTTP_URL } from "../constants/httpRoute"
import { updateReceiveNotification } from "../ducks/common"

let registrationID=null, receivedMessage;

var onDeviceReady = function () {

	document.addEventListener("jpush.receiveRegistrationId", function (event) {
		logger.info("receiveRegistrationId:" + JSON.stringify(event));

	}, false)

	initiateUI();
};

var getRegistrationID = function () {
	window.JPush.getRegistrationID(onGetRegistrationID);
};

var onGetRegistrationID = function (data) {
	try {
		registrationID = data;
		if (registrationID.length == 0) {
			var t1 = window.setTimeout(getRegistrationID, 1000);
		} else {
			logger.info("JPushPlugin:registrationID is " + data);
			const { token } = $getState().login
			window.JPush.setTags("miXingFengApp")
			window.JPush.setAlias(data)
			if(token){
				uploadRegisterID()
			} else {
				window.eventEmit.$once("hasLogin", uploadRegisterID)
			}
			if(localStorage.getItem("notification") === "no"){
				stopPush()
				$dispatch(updateReceiveNotification(false))
			}
		}
	} catch (exception) {
		logger.error('onGetRegistrationID', exception);
	}
};

var onOpenNotification = function (event) {
	try {
		var alertContent;
		if (device.platform == "Android") {
			alertContent = event.alert;
		} else {
			alertContent = event.aps.alert;
		}
		logger.info("open Notification:" + alertContent, "receivedMessage: " + receivedMessage);
		if(receivedMessage === "file"){
			window.goRoute(null, "/main/file")
		} else if(receivedMessage === "music"){
			window.goRoute(null, "/main/music")
		}
	} catch (exception) {
		logger.error("JPushPlugin:onOpenNotification" + exception);
	}
};

var onReceiveNotification = function (event) {
	try {
		var alertContent;
		if (device.platform == "Android") {
			alertContent = event.alert;
		} else {
			alertContent = event.aps.alert;
		}
		logger.info("onReceiveNotification alertContent", alertContent)
	} catch (exception) {
		logger.error("onReceiveNotification", exception)
	}
};

var onReceiveMessage = function (event) {
	try {
		var message;
		if (device.platform == "Android") {
			message = event.message;
		} else {
			message = event.content;
		}
		logger.info('onReceiveMessage', message);
		receivedMessage = message
	} catch (exception) {
		logger.error("JPushPlugin:onReceiveMessage-->" + exception);
	}
};

var initiateUI = function () {
	try {
		window.JPush.init();
		window.JPush.setDebugMode(true);
		window.setTimeout(getRegistrationID, 1000);

		if (device.platform != "Android") {
			window.JPush.setApplicationIconBadgeNumber(0);
		}
	} catch (exception) {
		logger.error('initiateUI', exception);
	}
};

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("jpush.openNotification", onOpenNotification, false);
document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);

function uploadRegisterID(){
	// upload Registration ID
	const username = $getState().login.username
	const mobile = $getState().myInfo.setMobile
	logger.info(`localStorage.getItem("registrationID")`, localStorage.getItem("registrationID"))
	if (registrationID !== localStorage.getItem("registrationID")) {
		const data = { registrationID, username: username || mobile }
		logger.info("uploadRegistrationID", data)
		axios.post(HTTP_URL.uploadRegistrationID, data)
			.then((response) => {
				localStorage.setItem("registrationID", registrationID)
			})
			.catch(err => {
				logger.error('uploadRegistrationID', err);
			})
	}
}

export const stopPush = () => {
	logger.info("stopPush")
	window.JPush.stopPush()
}

export const resumePush = () => {
	logger.info("resumePush")
	window.JPush.resumePush()
}

export const isPushStopped = () => {
	return window.JPush.isPushStopped((bool => {
		return bool;
	}))
}

export const clearAllNotification = () => window.JPush.clearAllNotification()

//本地通知API
// window.plugins.jPushPlugin.addLocalNotification(builderId,
// 	content,
// 	title,
// 	notificaitonID,
// 	broadcastTime,
// 	extras)
// window.plugins.jPushPlugin.removeLocalNotification(notificationID)
// window.plugins.jPushPlugin.clearLocalNotifications()
