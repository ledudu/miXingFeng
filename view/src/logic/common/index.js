import SparkMD5 from "spark-md5"
import { Howl } from 'howler';
import { HTTP_URL } from "../../constants/httpRoute";
import {
	updateCurrentLocation,
	updateCurrentXYPosition,
	updateCurrentProvince,
	updateAllowGetPosition,
	updateSharedNicknames
} from "../../ducks/common"
import { writeFile, networkErr, alertDialog, saveFileToLocal, updateDownloadingStatus } from "../../services/utils";
import { updateToken, updateLogOutFlag} from "../../ducks/login";
import { updateLastSignUpTime, updateAlreadySignUpPersons, updateNotSignUpPersons, updateSignUpStatus, updateSignedFlag } from "../../ducks/sign";
import { updateSetNickname,
	updateSetMobile,
	updateSignature,
	updateSetSex,
	updateSetBirthday,
	updateSetHeadPic,
	updateSetRole,
} from "../../ducks/myInfo";
import {
	updateFileList,
	updateMusicList,
	updateDownloadedMusicList,
	updateMusicCollection,
	updateCurrentSongTime,
	updateSoundPlaying,
	updateCurrentPlayingMusicList,
	updateCurrentPlayingSong,
	updateCurrentPlayingSongDuration,
	updateCurrentPlayingSongOriginal,
	updateSoundInstance,
	updateSoundInstanceId,
	updateMusicPageType
} from "../../ducks/fileServer";
import { updateOnlinePersons } from "../../ducks/sign";
import { removeDataByIndexFromIndexDB, readAllDataFromIndexDB } from "../../services/indexDB"
import { dealtWithLoginIn } from "../../logic/login"
import { removeMusicDataByIndexFromIndexDB } from "../../services/indexDBMusic"
import { CONSTANT } from "../../constants/enumeration"

const logger = window.logger || console;
let receiveServerSocketPong = false;
let reconnectAndSendTimeout = null;
const callbackFunc = (index) => {
	logger.info("callbackFunc  index", index)
	if(reconnectAndSendTimeout) clearInterval(reconnectAndSendTimeout)
}
let observer1 = null;

export const retrieveOthers = () => {
	const { token } = window.$getState().login;
	if(token){
		const data = Object.assign({}, { token });
		return axios.post(HTTP_URL.retrieveOthers, (data))
			.then((response) => {
				const responseText = response.data;
				window.logger.info(`retrieve_others  response`, responseText.result.response.length);
				$dispatch(updateSharedNicknames(responseText.result.sharedNicknames))
				setOthersSignInfo(responseText.result.response)
			})
			.catch(err => {
				logger.error("retrieveOthers  err", err)
			})
	}
}

export const setOthersSignInfo = (data) => {
	if(!data.length) return;
	let date = new Date().format("yyyy-MM-dd"),
	    info = data,
		signedArray = [],
		unsignedArray = [];
	for (let i = 0, l = info.length; i < l; i++) {
		if (info[i].date && info[i].date.split(' ')[0] === date) {
			signedArray.push({
				username: info[i].username,
				origin: info[i].origin
			});
		} else {
			unsignedArray.push({
				username: info[i].username,
				origin: info[i].origin
			});
		}
	}
	window.logger.info(`setOthersSignInfo signedArray`, signedArray.length);
	window.logger.info(`setOthersSignInfo unsignedArray`, unsignedArray.length);
	window.$dispatch(updateAlreadySignUpPersons(_.orderBy(signedArray, ['username'], ['desc'])))
	window.$dispatch(updateNotSignUpPersons(_.orderBy(unsignedArray, ['username'], ['desc'])))
}

export const getGreeting = () => {
	//update clock time
	if (!window.clockTimer && $('#now-time').length) {
		logger.info("window.clockTimer", window.clockTimer)
		window.clockTimer = true
		clockFunc()
		window.clockIntervalTimer = setInterval(() => {
			clockFunc()
		}, 1000)
	}
}

function clockFunc(){
	let minute = new Date().getMinutes(),
		hour = new Date().getHours();
	if (hour < 6) {
		$(".greetings").html("凌晨好！&nbsp;")
	} else if (hour < 8) {
		$(".greetings").html("早上好！&nbsp;")
	} else if (hour < 11) {
		$(".greetings").html("上午好！&nbsp;")
	} else if (hour < 14) {
		$(".greetings").html("中午好！&nbsp;")
	} else if (hour < 17) {
		$(".greetings").html("下午好！&nbsp;")
	} else if (hour < 19) {
		$(".greetings").html("傍晚好！&nbsp;")
	} else if (hour < 24) {
		$(".greetings").html("晚上好！&nbsp;")
	}
	if (minute < 10) minute = "0" + minute;
	if (hour < 10) hour = "0" + hour;
	$('#now-time .hour').html(hour);
	$('#now-time .minute').html(minute);
	if ($('#now-time .middle').html() === ":") {
		$('#now-time .middle').html("&nbsp;")
	} else {
		$('#now-time .middle').html(":")
	}
}

//cordova version
export const getUserPosition = (self) => {

	const permissions = cordova.plugins.permissions;
	permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
		logger.info("getUserPosition ACCESS_FINE_LOCATION", status);
		if (status.hasPermission) {
			//定位数据获取成功响应
			var onSuccess = function (position) {
				if (!position) return;
				window.logger.info(`getUserPosition onSuccess position`, position);
				var point = new window.BMap.Point(position.coords.longitude, position.coords.latitude); //纬度,经度
				var gc = new window.BMap.Geocoder();
				var pt = point;
				window.$dispatch(updateCurrentXYPosition([pt.lng, pt.lat]))
				gc.getLocation(pt, function (rs) {
					var addComp = rs.addressComponents;
					window.logger.info(`地理位置信息`, addComp);
					var location = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
					window.$dispatch(updateCurrentProvince(addComp.province))
					window.$dispatch(updateCurrentLocation(location))
				});
			};
			//定位数据获取失败响应
			function onError(error) {
				logger.warn('getUserPosition error code: ', error.code, 'message: ', error.message);
			}

			function onSuccessWatch() {
				logger.debug("avigator.geolocation.watchPosition");
				onSuccess()
			}
			//开始获取定位数据
			logger.info("getting geo location")
			navigator.geolocation.getCurrentPosition(onSuccess, onError, {
				enableHighAccuracy: true
			});
			if (window.watchID) navigator.geolocation.clearWatch(watchID);
			window.watchID = navigator.geolocation.watchPosition(onSuccessWatch, onError, {
				enableHighAccuracy: true
			});
		} else {
			logger.info("ACCESS_FINE_LOCATION no");
		}
	});
}

// h5 version
export const getLocation = () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
		if(window.watchID) navigator.geolocation.clearWatch(watchID);
		window.watchID = navigator.geolocation.watchPosition(showPosition, showError, { enableHighAccuracy: true });
	} else {
		window.logger.info('浏览器不支持地理定位。')
		// $("#position-location").html("浏览器不支持地理定位。");
	}
}

export const requestPositionPermission = () => {
	return new Promise(res => {
		navigator.geolocation.getCurrentPosition(() => {
			logger.info("getCurrentPosition yes")
			localStorage.setItem("usePosition", "yes")
			$dispatch(updateAllowGetPosition(true))
			res(true)
		}, () => {
			logger.info("getCurrentPosition no")
			localStorage.setItem("usePosition", "no")
			$dispatch(updateAllowGetPosition(false))
			res(false)
		}, {
			enableHighAccuracy: true
		});
	})
}

export const previewNew = (fileEntry, mineType = 'application/vnd.android.package-archive') => {
	logger.info("window.cordova.plugins.fileOpener2.open fileEntry.name", fileEntry && fileEntry.name, 'mineType', mineType)
	// 调用cordova-plugin-file-opener2插件实现用第三方app打开文件
	window.cordova.plugins.fileOpener2.open(
		// 此处必须填写cdvfile://地址，不然android7.0+会报文件权限错误
		fileEntry.toInternalURL(), //文件本地地址转cdvfile://地址
		mineType, //文件类型，这里我是写了一个mime-Type类型合集fileTypeArr来调用
		function onSuccess(data) {
			window.logger.info(`成功预览`, data);
		},
		function onError(error) {
			alertDebug('出错！请在' + window.cordova.file.externalApplicationStorageDirectory + '目录下查看')
			window.logger.error('出错！请在' + window.cordova.file.externalApplicationStorageDirectory + '目录下查看');
		}
	);
}

export const openDownloadedFile = (filename, mineType, filenameOrigin) => {
	if(window.isCordova){
		cordova.plugins.fileOpener2.open(
			`cdvfile://localhost/sdcard/miXingFeng/download/${filenameOrigin}`,
			mineType,
			{
				error : function(e) {
					logger.error('openDownloadedFile  Error status: ' + e.status + ' - Error message: ' + e.message);
					if(e.message === "File not found"){
						alertDialog(filename + "已删除")
						removeFileFromDownload(filenameOrigin, "file")
					}
				},
				success : function () {
					logger.info('openDownloadedFile  file opened successfully');
				}
			}
		);
	} else {
		alert("暂不支持浏览器打开文件")
	}
}

export const removeFileFromDownload = (filenameOrigin, type) => {
	let localFileLocation, removeRecordFromIndexedDBPromise = Promise.resolve()
	if(type === "file"){
		localFileLocation = `cdvfile://localhost/sdcard/miXingFeng/download/${filenameOrigin}`
		const { fileList=[] } = $getState().fileServer;
		fileList.some(item => {
			if(item.filenameOrigin === filenameOrigin){
				if(item.downloaded){
					delete item.downloaded
					return true  //终止循环以优化性能
				} else {
					logger.warn("no downloaded to be deleted filenameOrigin", filenameOrigin)
				}
			}
		})
		$dispatch(updateFileList(fileList))
		removeRecordFromIndexedDBPromise = removeDataByIndexFromIndexDB(`downloaded_${filenameOrigin}`)
			.then(() => {
				window.eventEmit.$emit("fileRemoved")
				return "success"
			}).catch((err) => {
				logger.error("removeFileFromDownload file err", err)
			})
	} else if(type === "music"){
		localFileLocation = `cdvfile://localhost/sdcard/miXingFeng/music/${filenameOrigin}`
		removeRecordFromIndexedDBPromise = removeMusicDataByIndexFromIndexDB(`downloaded_${filenameOrigin}`)
			.then(() => {
				const { downloadedMusicList } = $getState().fileServer
				downloadedMusicList.some((item, index) => {
					if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin){
						downloadedMusicList.splice(index, 1)
						return true;
					}
				})
				$dispatch(updateDownloadedMusicList(downloadedMusicList))
				window.eventEmit.$emit("musicRemoved", downloadedMusicList)
				return "success"
			})
			.catch((err) => {
				alertDebug("removeMusicDataByIndexFromIndexDB err")
				logger.error("removeFileFromDownload music err", err)
			})
	}
	const removeFileFromDiskPromise = new Promise((resolve, reject) => {
		window.resolveLocalFileSystemURL(localFileLocation, function (fileEntry) {
			fileEntry.remove(function () {
				logger.info("removeFileFromDownload success")
				resolve('success')
			}, function (err) {
				logger.error('removeFileFromDownload err', err);
				reject(err)
			}, function () {
				logger.warn("removeFileFromDownload file_not_exist")
				resolve('file_not_exist')
			});
		})
	})

	return Promise.all([removeRecordFromIndexedDBPromise, removeFileFromDiskPromise])
		.then((response) => {
			logger.info("removeFileFromDownload response", response)
			return response
		})
		.catch(err => {
			alert("删除失败")
			logger.error("removeFileFromDownload err", err)
		})
}

function showPosition(position) {
		var latlon = position.coords.latitude + ',' + position.coords.longitude;
		window.logger.info(`latlon`, latlon);
		//baidu
		var url = `http://api.map.baidu.com/geocoder/v2/?ak=p8bpCj4slGspApTOUQsVng7KsPtVI2Bo&callback=renderReverse&location=${latlon}&output=json&pois=0`;
		$.ajax({
			type: "GET",
			dataType: "jsonp",
			url: url,
			beforeSend: function () {
				// $("#position-location").html('正在定位...');
			},
			success: function (json) {
				if (json.status === 0) {
					try{
						window.logger.info(`您当前的位置`, json.result);
						window.$dispatch(updateCurrentXYPosition([json.result.location.lng, json.result.location.lat]))
						window.$dispatch(updateCurrentProvince(json.result.addressComponent.province))
						window.$dispatch(updateCurrentLocation(json.result.formatted_address));
					} catch (err){
						logger.error('showPosition err', err)
					}
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				window.logger.error(`地址位置获取失败`, JSON.stringify(latlon));
				// $("#position-location").html(latlon+"地址位置获取失败");
			}
		});
}

function showError (error) {
	logger.warn(`showPosition showError`, error && (error.message || error));
	switch(error.code) {
		case error.PERMISSION_DENIED:
			window.logger.warn("定位失败,用户拒绝请求地理定位")
			// $("#position-location").html("定位失败,用户拒绝请求地理定位");
			break;
		case error.POSITION_UNAVAILABLE:
			window.logger.warn("定位失败,位置信息是不可用")
			// $("#position-location").html("定位失败,位置信息是不可用");
			break;
		case error.TIMEOUT:
			window.logger.warn("定位失败,请求获取用户位置超时")
			// $("#position-location").html("定位失败,请求获取用户位置超时");
			break;
		case error.UNKNOWN_ERROR:
			window.logger.warn("定位失败,定位系统失效")
			// $("#position-location").html("定位失败,定位系统失效");
			break;
		default:
			window.logger.warn("发生了错误!")
			// $("#position-location").html("发生了错误!");
			break;
	}
}

export const logoutApp = async(self) => {
	let { username } = window.$getState().login;
    let data = Object.assign({}, { username })
    data = JSON.stringify(data)
    let b = new window.Base64();
    data = b.encode(data);
    window.logger.info(`logout`, data);
    let promiseObj = function () {
		let { token } = window.$getState().login;
        return new Promise(res => {
            window.localStorage.removeItem("tk", token);
            res()
        })
    }
    let writeFileSign = window.isCordova ? writeFile(data, "sign.txt", false) : promiseObj();
    return writeFileSign
        .then(() => {
			$dispatch(updateToken(""));
			$dispatch(updateLastSignUpTime(""));
			$dispatch(updateAlreadySignUpPersons(""));
			$dispatch(updateNotSignUpPersons(""));
			$dispatch(updateSignUpStatus(false));
			$dispatch(updateLogOutFlag(true));
			$dispatch(updateSetNickname(""));
			$dispatch(updateSetMobile(""));
			$dispatch(updateSignature(""));
			$dispatch(updateSetSex(""));
			$dispatch(updateSetBirthday(""));
			$dispatch(updateSetHeadPic(""));
			$dispatch(updateSignedFlag(""));
			$dispatch(updateSetRole(""));
			goRoute(self, "/login");
        })
}

export const autoLogin = function(token){
	return new Promise((res,rej) => {
		let data = Object.assign({}, { token })
		return axios.post(HTTP_URL.tokenLogin, data)
			.then((response) => {
				let result = response.data.result;
				if (result.token && result.username) {
					let userProfile = result.userProfile || {};
					dealtWithLoginIn(result, userProfile)
					res()
				} else if (result === 'token_expired') {
					window.logger.warn("身份已过期,请重新登录");
					alert("身份已过期,请重新登录");
					rej()
				} else {
					window.logger.warn("非法登录");
					alert("非法登录");
					rej()
				}
			})
			.catch(err => {
				window.logger.error(`autoLogin err`, err);
				networkErr(err)
			})
	})
}

export const calcSize = (size) => {
	let formatSize = "";
	if(!size || typeof(size) !== 'number'){
		logger.error("calcSize param is not a number size", size)
		return String(size)
	}
	if(size > 1073741824){
		formatSize = (size/1024/1024/1024).toFixed(2) + "GB";
	} else if(size > 1048576){
		formatSize = (size/1024/1024).toFixed(2) + "MB";
	} else if(size > 1024){
		formatSize = (size/1024).toFixed(2) + "KB";
	} else if(size < 1024){
		formatSize = size + "B";
	}
	return formatSize;
}

export const reconnectAndSend = (log="websocket interval check") => {
	try {
		if(window.isCordova){
			const isBackground = cordova.plugins && cordova.plugins.backgroundMode && cordova.plugins.backgroundMode.isActive();
			logger.debug('isBackground', isBackground);
		}
		logger.debug("websocket heart beat reconnectAndSend readyState ping", window.ws.readyState, "log", log)
		if(window.ws.readyState !== 1){
			logger.debug("reconnectAndSend window.ws.readyState !== 1", log)
			reconnectSocket(`heart beat: ${log}`)
		} else {
			let message = Object.assign({},{ type:'check-connect', userId: window.localStorage.getItem("userId"), data: "ping", date: Date.now() });
			window.ws.send(JSON.stringify(message));
			receiveServerSocketPong = false;
			//  10秒超时，如何收不到服务端pong响应则表示服务端已主动断开连接，此时需客户端重新开启websocket连接
			reconnectAndSendTimeout = setTimeout(() => {
				logger.warn("reconnectAndSendTimeout reconnectSocket", log)
				reconnectAndSendTimeout = null
				reconnectSocket('heart beat')
			}, 10000)
		}
	} catch(err){
		logger.error("reconnectAndSend err", err)
	}
}

export const initWebsocket = () => {
	let userId = 'no-ls-' + Math.random().toString(36).slice(2, 6)
	if('localStorage' in window){
		if(window.localStorage.getItem("userId")){
			userId = window.localStorage.getItem("userId")
		} else {
			userId = "ls" + Math.random().toString(36).slice(2, 6)
			window.localStorage.setItem("userId", userId);
		}
	}
	if(window.WebSocket){
		window.ws = new WebSocket(window.config.debug ? `ws://${window.config.host}:${window.config.socketPort}` : `wss://${window.config.socketUrl}`);
		window.ws.onopen = () => {
			openWS(ws.readyState, userId)
		};
		window.ws.onmessage = (data) => incomingMessage(data);
		reconnectNetwork()  // check network
		observer1 = new Observer(callbackFunc)
		window.subjectModel.subscribeObserver(observer1)
	} else {
		logger.warn("不支持webSocket！！！")
	}
}

export const reconnectSocket = (logInfo) => {
	const userId = window.localStorage.getItem("userId")
	if(window.ws && window.ws.close) window.ws.close(1000)
	if(window.websocketHeartBeatInterval) clearInterval(window.websocketHeartBeatInterval)
	logger.debug("正在重新建立websocket连接...", logInfo);
	window.ws = new WebSocket(window.config.debug ? `ws://${window.config.host}:${window.config.socketPort}` : `wss://${window.config.socketUrl}`);
	window.ws.onopen = () => openWS(window.ws.readyState, userId);
	window.ws.onmessage = (data) => incomingMessage(data);
}

export const openWS = (readyState, userId) => {
	logger.info('websocket connected', readyState, "当前用户id", userId);
	const msg = Object.assign({},{
		type:'try-connect',
		userId,
		date: Date.now(),
		data: ""
	})
	window.ws.send(JSON.stringify(msg));
	// websocket heart beat
	window.websocketHeartBeatInterval = setInterval(reconnectAndSend, 60000)
}

export const incomingMessage = async (data) => {
	try {
		const userId = window.localStorage.getItem("userId")
		const logger = window.logger || console;
		data = JSON.parse(data.data);
		switch(data.type){
			case "pong":
				logger.debug('incomingMessage pong', data);
				receiveServerSocketPong = true;
				subjectModel.notifyObserver(observer1)
				break;
			case "socket-heart-beat":
				logger.info('incomingMessage server-socket-heart-beat', data);
				const msg = {
					type:'check-connect',
					userId,
					data: "reply-server-heart-beat",
					date: Date.now()
				}
				window.ws.send(JSON.stringify(msg));
				break;
			case "response-date":
				logger.info(`incomingMessage Roundtrip time: ${Date.now() - data.data} ms`);
				break;
			case "order-string":
				logger.info('incomingMessage 用户加入', data.data);
				break;
			case "online-persons":
				$dispatch(updateOnlinePersons(data.data));
				logger.info(`incomingMessage 当前在线人数: ${data.data}`);
				break;
			case "get-sign-array":
				logger.info('incomingMessage get-sign-array', data.data.length);
				if($getState().login.token){
					setOthersSignInfo(data.data)
				}
				break;
			case "get-files-array":
				const fileDataList = data.data;
				const indexDBData = await readAllDataFromIndexDB()
				indexDBData.forEach((item1) => {
					fileDataList.forEach((item2) => {
						if(removePrefixFromFileOrigin(item1.filenameOrigin) === item2.filenameOrigin){
							item2.downloaded = true
						}
					})
				})
				fileDataList.forEach((item2) => {
					item2.filePath = window.serverHost + item2.filePath
				})
				$dispatch(updateFileList(fileDataList));
				logger.info('incomingMessage get-files-array', fileDataList.length);
				break;
			case "get-musics-array":
				const { musicCollection } = $getState().fileServer
				const musicList = data.data
				musicList.forEach(item => {
					item.filePath = window.serverHost + item.filePath
					delete item.saved
				})
				musicCollection.forEach(item1 => {
					musicList.forEach(item2 => {
						if(removePrefixFromFileOrigin(item1.filenameOrigin) === removePrefixFromFileOrigin(item2.filenameOrigin)){
							item2.saved = true;  //这样做可以修改堆里的值
						}
					})
				})
				$dispatch(updateMusicList(musicList));
				logger.info('incomingMessage get-musics-array', musicList.length);
				break;
			case "get-current-position":
				logger.info('incomingMessage get-current-position', data);
				const { allowOthersGetPosition } = $getState().common
				const info = {
					type:'upload-user-position',
					userId,
					data: {
						info: "available",
						currentLocation: $getState().common.currentLocation,
						currentXYPosition: $getState().common.currentXYPosition
					},
					date: Date.now()
				}
				if(!allowOthersGetPosition){
					info.data.info = "user_not_allowed"
				}
				window.ws.send(JSON.stringify(info));
				alert(`${data.data}获取了你的位置`)
				break;
			case "update-share-nickname":
				logger.info('incomingMessage update-share-nickname length', data.data.length);
				$dispatch(updateSharedNicknames(data.data))
				break;
			default:
				logger.error("incomingMessage default error", data)
				break;
		}
	} catch (err){
		logger.error("onmessage JSON.parse", err.stack || err.toString())
	}
}

function reconnectNetwork(){
	let networkFlag  = false;
	let debounceTimeout = null;
	const logger = window.logger || console;
	document.addEventListener("offline", function(){ // 断开网络
		try{
			window.ws.close(1000)
			logger.warn('addEventListener reconnectNetwork  offline before setTimeout')
			networkFlag = true;
			debounceTimeout = setTimeout(() => {
				logger.warn('reconnectNetwork  offline 无法访问网络')
				window.plugins.toast.showShortBottom('无法访问网络')
			}, 5000)
		} catch(err){
			logger.error("addEventListener offline after setTimeout", err)
		}
	}, false);
	document.addEventListener("online", function(){  // 连接到网络
		try {
			if(networkFlag === true){
				clearTimeout(debounceTimeout);
				logger.info('addEventListener reconnectNetwork  online')
				window.plugins.toast.showShortBottom('网络已恢复')
				networkFlag = false;
				logger.warn("addEventListener online websocket 正在重新建立连接...");
				const userId = localStorage.getItem("userId")
				setTimeout(() => {
					window.ws = new WebSocket(window.config.debug ? `ws://${window.config.host}:${window.config.socketPort}` : `wss://${window.config.socketUrl}`);
					window.ws.onopen = () => openWS(window.ws.readyState, userId);
					window.ws.onmessage = (data) => incomingMessage(data);
				}, 200)
			}
		} catch(err) {
			logger.error("document.addEventListener online", err)
		}
	}, false);
}

export const checkFileMD5Func = (filename, uploadUsername, md5, group, type) => {
	const checkFileMD5Obj = {
		filename,
		uploadUsername,
		md5,
		group,
		type
	}
	return axios.post(HTTP_URL.checkFileMD5, checkFileMD5Obj)
		.then((response) => {
			if(response.data.result.response === 'lack_fields'){
				return "缺少字段"
			} else if(response.data.result.response === 'success'){
				return "上传成功"
			} else if(response.data.result.response === 'no_matches'){
				return "没有匹配"
			}
		})
		.catch(err => {
			return networkErr(err)
		})
}

export const removeDuplicateObjectList = (list=[{}], field="filenameOrigin") => {
	if(!list.length) return list;
	const tempObj = {}
	let willRemoveIndex = null
	for(let i=0; i< list.length; i++){
		if(!list[i][field] || tempObj[list[i][field]]){
			willRemoveIndex = i;
			break
		} else {
			tempObj[list[i][field]] = true
		}
	}
	if(willRemoveIndex !== null){
		logger.error("removeDuplicateObjectList same file field", field, "list[willRemoveIndex]", list[willRemoveIndex])
		list.splice(willRemoveIndex, 1)
		return removeDuplicateObjectList(list, field)
	} else {
		return list
	}
}

export const calcFileMD5 = (file) => {
	return new Promise((resolve, reject) => {
		const blobSlice = BrowserFile.prototype.slice || BrowserFile.prototype.mozSlice || BrowserFile.prototype.webkitSlice,
			chunkSize = 2097152, // Read in chunks of 2MB
			chunks = Math.ceil(file.size / chunkSize),
			spark = new SparkMD5.ArrayBuffer(),
			fileReader = new BrowserFileReader();

		let currentChunk = 0;
		logger.info("SparkMD5 file size, filename", file.size, file.name)
		fileReader.onload = function (e) {
			spark.append(e.target.result); // Append array buffer
			currentChunk++;
			if (currentChunk < chunks) {
				loadNext();
			} else {
				const MD5Value = spark.end()
				logger.info('SparkMD5 computed hash', MD5Value); // Compute hash
				return resolve({
					MD5Value,
					MD5ValueError: null
				})
			}
		};
		fileReader.onerror = function (err) {
			try {
				logger.warn('SparkMD5 oops, something went wrong.', err);
			} catch (err) {
				logger.error("logger SparkMD5 oops, something went wrong.", err)
				alertDebug(err)
			}
			return resolve({
				MD5Value: null,
				MD5ValueError: err
			})
		};

		function loadNext() {
			var start = currentChunk * chunkSize,
				end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
			fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
		}
		loadNext();

	})
}

export const checkPassword = (password) => {
	if(/^(?=(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d))[^]{6,16}$/.test(password)){
		return true
	} else {
		return false
	}
}

export const checkEmail = (email) => {
	if(/^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/g.test(email)){
		return true
	} else {
		return false
	}
}

export const checkSongSavedFunc = (musicDataList, original) => {
	const { musicCollection } = $getState().fileServer
	if(original !== CONSTANT.musicOriginal.savedSongs){
		musicDataList.forEach(item => {
			delete item.saved
		})
		musicCollection.forEach(item1 => {
			musicDataList.some(item2 => {  //  在当前页将搜索已被收藏的歌曲加上标记
				if(removePrefixFromFileOrigin(item1.filenameOrigin) === removePrefixFromFileOrigin(item2.filenameOrigin)){
					item2.saved = true;
					return true
				} else {
					return false
				}
			})
		})
	}
	return musicDataList
}

export const removePrefixFromFileOrigin = (filenameOrigin) => {
	if(!filenameOrigin) return
	return filenameOrigin.replace(/downloading_|downloaded_|saved_|searchAll_|onlineMusic_|searchMusic_/g, "")
}

export const checkOnlinePersons = () => {
	const userId = localStorage.getItem("userId")
	const msg = Object.assign({},{
		type:'try-connect',
		userId,
		date: Date.now(),
		data: ""
	})
	if(window.ws && window.ws.readyState === 1){
		ws.send(JSON.stringify(msg));
	}
}

export const saveSongFunc = (savedMusicFilenameOriginalArr, filenameOrigin, musicCollection, musicDataList, currentFileIndex, original, e) => {
	if(e) e.stopPropagation();
	if(currentFileIndex === -1) return
	const { username, token } = $getState().login
	if (!username || !token) return alert("请先登录")
	const hasSaved = savedMusicFilenameOriginalArr.indexOf(removePrefixFromFileOrigin(filenameOrigin));
	if (hasSaved !== -1) {
		musicCollection.splice(hasSaved, 1)
	} else {
		const willSavedSong = JSON.parse(JSON.stringify(musicDataList[currentFileIndex]))
		willSavedSong.filenameOrigin = `saved_${willSavedSong.filenameOrigin}`
		musicCollection.push(willSavedSong)
	}
	const dataObj = {
		username,
		token,
		musicCollection
	}
	return axios.post(HTTP_URL.saveSong, dataObj)
		.then((result) => {
			if (result.data.result.result === 'success') {
				checkSongSavedFunc(musicDataList, original)
				$dispatch(updateToken(result.data.result.token))
				musicCollection.forEach(item => {
					delete item.saved
				})
				$dispatch(updateMusicCollection(musicCollection))
				window.eventEmit.$emit("listenMusicSaved")
				if (hasSaved !== -1) {
					alert('取消收藏成功')
					return false
				} else {
					alert('收藏成功')
					return true
				}
			} else {
				logger.error("HTTP_URL.saveSong result not success", result)
			}
		})
		.catch(err => {
			logger.error("HTTP_URL.saveSong err", err)
			networkErr(err);
		})
}

export const playPreviousSong = (currentFileIndex, currentMusicFilenameOriginalArr, original, musicDataList, e) => {
	if(e) e.stopPropagation();
	if(currentFileIndex === -1) return
	if(!currentFileIndex){
		currentFileIndex = currentMusicFilenameOriginalArr.length
	}
	currentFileIndex--
	const previousSongInfo = musicDataList[currentFileIndex]
	return playAnotherSong(previousSongInfo, original, musicDataList, null, {type: 'playPreviousSong', currentFileIndex, currentMusicFilenameOriginalArr})
}

export const playNextSong = (currentFileIndex, currentMusicFilenameOriginalArr, original, musicDataList, e) => {
	if(e) e.stopPropagation();
	if(currentFileIndex === -1) return
	if(currentFileIndex === (currentMusicFilenameOriginalArr.length - 1)){
		currentFileIndex = -1
	}
	currentFileIndex++
	const nextSongInfo = musicDataList[currentFileIndex]
	return playAnotherSong(nextSongInfo, original, musicDataList, null, {type: 'playNextSong', currentFileIndex, currentMusicFilenameOriginalArr})
}

export const getMusicCurrentPlayProcess = () => {
	clearInterval(window.currentTimeInterval)
	let lastMusicSeekTime = 0
	window.currentTimeInterval = setInterval(() => {
		try {
			const { soundInstance } = $getState().fileServer
			if(soundInstance && soundInstance.seek && typeof(soundInstance.seek()) === "number" && soundInstance.seek() !== NaN && soundInstance.seek() !== 0){
				const currentMusicSeekTime = soundInstance.seek()
				if(lastMusicSeekTime !== currentMusicSeekTime){
					musicPlayingProgressFunc()
					$dispatch(updateCurrentSongTime(currentMusicSeekTime))
					lastMusicSeekTime = currentMusicSeekTime
				}
			}
		} catch(err){
			clearInterval(window.currentTimeInterval)
			logger.error("checkStatus soundInstance.seek() err", err.stack || err.toString())
		}
	}, 1000)
}

export const musicPlayingProgressFunc = () => {
	const { currentPlayingSongDuration } = $getState().fileServer
	if(!currentPlayingSongDuration || currentPlayingSongDuration === NaN) return
	if (window.circleControlRef.style.strokeDashoffset > 0) {
		window.circleControlRef.style.strokeDashoffset -= (CONSTANT.strokeDashoffset / currentPlayingSongDuration)
	} else {
		window.circleControlRef.style.strokeDashoffset = 314
	}
}

export const pauseMusic = () => {
	const { soundInstance, soundInstanceId, currentPlayingSong } = $getState().fileServer
	logger.info("music pause currentPlayingSong", currentPlayingSong)
	soundInstance.pause(soundInstanceId);
	$dispatch(updateSoundPlaying(false))
}

export const resumeMusic = () => {
	const { soundInstance, soundInstanceId, currentPlayingSong } = $getState().fileServer
	logger.info("music resume currentPlayingSong", currentPlayingSong)
	soundInstance.play(soundInstanceId)
	$dispatch(updateSoundPlaying(true))
}

export const stopMusic = () => {
	const { soundInstance, soundInstanceId, currentPlayingSong } = $getState().fileServer
	logger.info("music stop currentPlayingSong", currentPlayingSong)
	if(soundInstance && soundInstanceId) soundInstance.stop(soundInstanceId)
	$dispatch(updateSoundPlaying(false))
}

export const playMusic = async (filePath, filenameOrigin, duration, original, musicDataList, pageType, filename) => {
	try {
		const { pauseWhenOver, soundInstance, soundInstanceId } = $getState().fileServer;
		if(pageType === CONSTANT.musicOriginal.musicFinished){
			const fileExist = await checkFileExistOrNot(removePrefixFromFileOrigin(filenameOrigin), "music")
			if(!fileExist) {
				alertDialog(`${filename}已被删除`)
				removeFileFromDownload(removePrefixFromFileOrigin(filenameOrigin), "music")
				return
			}
		}
		musicDataList = removeDuplicateObjectList(musicDataList, 'filenameOrigin')
		logger.info("music play filenameOrigin", filenameOrigin)
		if(soundInstance && soundInstanceId){
			soundInstance.unload()
		}
		$dispatch(updateCurrentPlayingMusicList(musicDataList))
		$dispatch(updateCurrentSongTime(0))
		$dispatch(updateSoundPlaying(true))
		$dispatch(updateCurrentPlayingSong(filenameOrigin))
		$dispatch(updateCurrentPlayingSongDuration(duration))
		$dispatch(updateCurrentPlayingSongOriginal(original))
		if(pageType) $dispatch(updateMusicPageType(pageType))
		filePath = removePrefixFromFileOrigin(filePath)
		const soundInstanceModel = new Howl({
			src: [filePath],
			loop: !pauseWhenOver,
			rate: 1.0,
			html5: true,
			onend: function() {
				const { pauseWhenOver, playByOrder, playByRandom } = $getState().fileServer;
				logger.info("onend playByOrder", playByOrder)
				musicPlayingProgressFunc()
				if(playByOrder){
					setTimeout(() => {
						autoPlayNextOne("playByOrder", filenameOrigin, musicDataList, original)
					}, 1500)
				} else if(playByRandom){
					setTimeout(() => {
						autoPlayNextOne("playByRandom", filenameOrigin, musicDataList, original)
					}, 1500)
				} else if(pauseWhenOver){
					$dispatch(updateSoundPlaying(false))
					clearInterval(window.currentTimeInterval)
				}
			}
		});
		const soundInstanceModelId = soundInstanceModel.play();
		$dispatch(updateSoundInstance(soundInstanceModel))
		$dispatch(updateSoundInstanceId(soundInstanceModelId))
		if(window.circleControlRef){
			window.circleControlRef.style.strokeDashoffset = CONSTANT.strokeDashoffset
			window.circleControlRef.style.strokeWidth = "8px"
		}
	} catch(err){
		$dispatch(updateSoundPlaying(false))
		logger.error("play() fail err", err.stack || err.toString())
		alert('播放失败')
	}
}

export const autoPlayNextOne = (type, filenameOrigin, musicDataList, original) => {
	try {
		const currentMusicFilenameOriginalArr = musicDataList.map(item => item.filenameOrigin)
		let currentFileIndex = currentMusicFilenameOriginalArr.indexOf(filenameOrigin)
		if(currentFileIndex === (currentMusicFilenameOriginalArr.length - 1)){
			currentFileIndex = -1
		}
		currentFileIndex++
		logger.info("autoPlayNextOne filenameOrigin", filenameOrigin, 'type', type)
		if(type === "playByRandom" && currentMusicFilenameOriginalArr.length !== 1){
			currentFileIndex = getRandomFileIndex(currentMusicFilenameOriginalArr, currentFileIndex)
		}
		const nextSongInfo = musicDataList[currentFileIndex]
		playAnotherSong(nextSongInfo, original, musicDataList, type)
	} catch(err){
		alert("歌曲文件异常, 暂停播放");
		logger.error("play onEnd err", err)
	}
}

function playAnotherSong(anotherSongInfo, original, musicDataList, type, others){
	$dispatch(updateCurrentSongTime(0))
	stopMusic()
	if(anotherSongInfo.payPlay) {
		alert("尊重版权,人人有责")
		if(type){
			return autoPlayNextOne(type, anotherSongInfo.filenameOrigin, musicDataList, original)
		} else if(others){
			if(others.type === "playPreviousSong"){
				return playPreviousSong(others.currentFileIndex, others.currentMusicFilenameOriginalArr, original, musicDataList)
			} else if(others.type === "playNextSong"){
				return playNextSong(others.currentFileIndex, others.currentMusicFilenameOriginalArr, original, musicDataList)
			}
		}
	} else {
		playMusic(anotherSongInfo.filePath, anotherSongInfo.filenameOrigin, anotherSongInfo.duration, original, musicDataList, $getState().fileServer.musicPageType, anotherSongInfo.filename)
	}
}

export const getRandomFileIndex = (currentMusicFilenameOriginalArr, currentFileIndex) => {
	const randomFileIndex = parseInt(Math.random() * currentMusicFilenameOriginalArr.length)
	if(currentFileIndex === randomFileIndex){
		logger.warn("getRandomFileIndex repeat randomFileIndex", randomFileIndex, 'currentFileIndex', currentFileIndex)
		return getRandomFileIndex(currentMusicFilenameOriginalArr, currentFileIndex)
	} else {
		return randomFileIndex
	}
}

export const checkStatus = (filePath, filename, filenameOrigin, uploadUsername, fileSize, duration, songOriginal, original, musicDataList, pageType, payPlay) => {
	try {
		if(payPlay) return alert("尊重版权,人人有责")
		const { soundPlaying, currentPlayingSong, downloadingMusicItems } = $getState().fileServer;
		if(original === CONSTANT.musicOriginal.musicDownloading){
			downloadingMusicItems.some((item) => {
				if(item.filenameOrigin === filenameOrigin) {
					logger.info("checkStatus musicDownloading filenameOrigin", filenameOrigin)
					filenameOrigin = removePrefixFromFileOrigin(filenameOrigin)
					if(item.progress === "失败" || item.progress === "已取消"){
						alert(`重新下载${filename}`)
						updateDownloadingStatus(filename, '准备中', uploadUsername, fileSize, true, filePath, filenameOrigin, true, duration)
						saveFileToLocal(filenameOrigin, filePath, "music", filename, uploadUsername, true, fileSize, true, {duration, songOriginal})
					} else {
						window.eventEmit.$emit(`FileTransfer-${filenameOrigin}`, 'abort')
					}
					return true
				} else {
					return false
				}
			})
			return
		}
		getMusicCurrentPlayProcess()
		logger.info("music checkStatus currentPlayingSong", currentPlayingSong)
		if(!soundPlaying){
			if(!currentPlayingSong){
				// first play case
				playMusic(filePath, filenameOrigin, duration, original, musicDataList, pageType, filename)
			} else {
				// pause case
				if(filenameOrigin === currentPlayingSong){
					resumeMusic()
				} else {
					// stop current song and switch to another song case and then initial play current time
					$dispatch(updateCurrentSongTime(0))
					stopMusic()
					playMusic(filePath, filenameOrigin, duration, original, musicDataList, pageType, filename)
				}
			}
		} else {
			if(filenameOrigin !== currentPlayingSong){
				// stop current song and switch to another song case and initial play current time
				$dispatch(updateCurrentSongTime(0))
				stopMusic()
				playMusic(filePath, filenameOrigin, duration, original, musicDataList, pageType, filename)
			} else {
				// pause current song
				pauseMusic()
			}
		}
	} catch (err){
		logger.error("checkStatus err", err)
	}
}

export const checkToShowPlayController = () => {
	setTimeout(() => {
		const urlHash =  window.location.href.split("#/")[1]
		const arr = ["search_position", "login", "nickname_page", "type_shell", "user_agreement", "service_list", "privacy"]
		let notDisplay = false
		if(urlHash && !/main/gi.test(urlHash)){
			arr.forEach(item => {
				if(item === urlHash){
					notDisplay = true
				}
			})
			if(notDisplay){
				$("#root .container .main-content").css("height", "100vh")
				window.musicController && window.musicController.style && (window.musicController.style.display = "none")
			} else {
				$("#root .container .main-content").css("height", "calc(100vh - 60px)")
				window.musicController && window.musicController.style && (window.musicController.style.display = "flex")
			}
		} else {
			$("#root .container .main-content").css("height", "100vh")
			window.musicController && window.musicController.style && (window.musicController.style.display = "none")
		}
	})
}

export const checkFileExistOrNot = (filenameOrigin, folder) => {
	return new Promise(function (res) {
		window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getDirectory('miXingFeng', {
				create: true
			}, function (dirEntry) {
				dirEntry.getDirectory(folder, {
					create: true
				}, function (subDirEntry) {
					//持久化数据保存
					subDirEntry.getFile(
						filenameOrigin, {create: false, exclusive: true},
						function (fileEntry) {
							logger.info("file is already exist, filenameOrigin", filenameOrigin)
							res(true)
						}, () => {
							logger.info("file is not exist at all, filenameOrigin", filenameOrigin)
							res(false)
						});
				}, (err) => {logger.error("load file fail", err); res(false)});
			}, (err) => {logger.error("load file directory fail", err); res(false)});
		}, (err) => {logger.error("load file system fail", err); res(false)});
	})
}
