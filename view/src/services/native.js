import { updateBackToDesktopTime,
	updateSavedCurrentRoute,
	updateAdsTime,
	updateHideNavBar,
	updateAllowGetPosition,
	updatePowerRun,
	updateAppUpdating,
	updateAdPicSrc
} from '../ducks/common'
import { updateDirectShowSignPage, updateAdNumber, updateFromResume } from "../ducks/sign"
import { reconnectAndSend } from "../logic/common"
import { updateSoundPlaying } from "../ducks/fileServer";
import { updateAppVersion } from "../ducks/common"

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
	//  backgroundMode
	cordova.plugins.backgroundMode.enable();
	cordova.plugins.backgroundMode.on('activate', function() {
		cordova.plugins.backgroundMode.disableWebViewOptimizations();
	});
	// cordova.plugins.backgroundMode.excludeFromTaskList();
	// 检查获取位置和文件读写的权限
	window.permissions = cordova.plugins.permissions;
	// 使用浏览器打开外部链接
	window.open = cordova.InAppBrowser.open;
	// 点击通知安装app
	cordova.plugins.notification.local.on('click', installPackage);
	// 监听耳机拔插事件
	window.HeadsetDetection && window.HeadsetDetection.registerRemoteEvents(function(status) {
		logger.info("HeadsetDetection status", status)
		switch (status) {
			case 'headsetAdded':
				logger.info('Headset was added');
				break;
			case 'headsetRemoved':
				logger.info('Headset was removed');
				const { soundPlaying, soundInstance, soundInstanceId } = $getState().fileServer
				if(soundPlaying){
					soundInstance.pause(soundInstanceId);
					$dispatch(updateSoundPlaying(false))
				}
				break;
		};
	});
	// 更新版本信息
	cordova.getAppVersion.getVersionNumber().then(function (version){
		$dispatch(updateAppVersion(version));
	});

	// pause resume
	document.addEventListener("pause", () => {
		$dispatch(updateBackToDesktopTime(Date.now()))
		$dispatch(updateSavedCurrentRoute(window.getRoute()))
		logger.info("pause backToDesktop", new Date().format("yyyy-MM-dd hh:mm:ss"))
		const soundPlaying = $getState().fileServer.soundPlaying;
		logger.info("pause soundPlaying", soundPlaying)
		if(soundPlaying){
			setSilentDefaults(false)
		} else {
			setSilentDefaults(true)
		}
		// cordova.plugins.notification.local.clearAll()
		$dispatch(updateAppUpdating(false))
		$dispatch(updatePowerRun(soundPlaying))
	})
	document.addEventListener("resume", () => {
		try {
			const { backToDesktopTime, alwaysShowAdsPage } = $getState().common
			logger.info('resume backToApp', backToDesktopTime, new Date().format("yyyy-MM-dd hh:mm:ss"));
			logger.info('Date.now() - backToDesktopTime 1800000', Date.now() - backToDesktopTime)
			if((backToDesktopTime && (Date.now() - backToDesktopTime) > 300000) && alwaysShowAdsPage){  //more than 5 minutes
				const adsName = localStorage.getItem("adsName")
				const isWiFiNetwork = localStorage.getItem("isWiFiNetwork")
				if(!adsName && !isWiFiNetwork){
					const adNumber = parseInt(Math.random() * 7)
					$dispatch(updateAdNumber(adNumber))
					$dispatch(updateAdPicSrc(`./ads/ad${adNumber}.png`))
				}
				$dispatch(updateBackToDesktopTime(0))
				$dispatch(updateAdsTime(3))
				logger.info('time(minutes)', parseInt((Date.now() - backToDesktopTime) / 60000), 'going to ads page')
				$dispatch(updateDirectShowSignPage(false))
				$dispatch(updateHideNavBar(true))
				$dispatch(updateFromResume(true))
				window.goRoute(null, '/')
			} else if(backToDesktopTime){
				logger.info("resume backToDesktopTime", backToDesktopTime)
				$dispatch(updateBackToDesktopTime(0))
				$dispatch(updateSavedCurrentRoute(""))
			}
			setTimeout(() => reconnectAndSend('resume reconnect check'), 200)
			window.permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
				if (status.hasPermission && localStorage.getItem('usePosition') === 'no') {
					$dispatch(updateAllowGetPosition(true))
				}
			})
		} catch(err){
			logger.error("resume catch err", err)
		}
	})
}

export const setSilentDefaults = (bool) => {
	logger.info("setSilentDefaults", bool)
	cordova.plugins.backgroundMode.setDefaults({ silent: bool });
}

const installPackage  = () => {
	const { hasDownloadedPackage, appSize } = $getState().common;
	logger.info("installPackage hasDownloadedPackage", hasDownloadedPackage)
	if(!hasDownloadedPackage) {
		logger.info("downloading, can't install")
		cordova.plugins.notification.local.schedule({
			title: '正在更新',
			text: `安装包大小:${appSize}，请稍后`,
		});
		return;
	}
	logger.info("cordova.plugins.fileOpener2.open  installPackage")
	cordova.plugins.fileOpener2.open(
		'cdvfile://localhost/sdcard/Android/data/com.szhou.mixingfeng/sign_release.apk', // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Downloads/starwars.pdf
		'application/vnd.android.package-archive',
		{
			error : function(e) {
				logger.error('installPackage  Error status: ' + e.status + ' - Error message: ' + e.message);
			},
			success : function () {
				logger.info('installPackage  file opened successfully');
			}
		}
	);
}
