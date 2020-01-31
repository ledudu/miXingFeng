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

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
	//  backgroundMode
	cordova.plugins.backgroundMode.enable();
	cordova.plugins.backgroundMode.on('activate', function() {
		cordova.plugins.backgroundMode.disableWebViewOptimizations();
	});
	// cordova.plugins.backgroundMode.excludeFromTaskList();

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
				$dispatch(updateAdsTime(4))
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
				logger.info("checkPermission status", status)
				if (status.hasPermission && localStorage.getItem('usePosition') === 'no') {
					localStorage.setItem("usePosition", "yes")
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
