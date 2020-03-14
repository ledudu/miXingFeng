//actionType
const CURRENT_LOCATION = "common/location";
const APP_VERSION = "common/appVersion";
const MENU_LIST = "common/menuList";
const IS_FROM_SIGN_PAGE = "common/isFromSignPage"
const CURRENT_X_Y_POSITION = "common/currentXYPosition"
const CURRENT_PROVINCE = "common/currentProvince"
const ADS_TIME = "common/adsTime"
const BACK_TO_DESKTOP_TIME = "common/backToDesktopTime"
const SAVE_CURRENT_ROUTE = "common/savedCurrentRoute"
const DEVICE_INFO = "common/deviceInfo"
const HIDE_NAV_BAR = "common/hideNavBar"
const RECEIVE_NOTIFICATION = "common/receiveNotification"
const POWER_RUN = "common/powerRun"
const ALWAYS_SHOW_ADS_PAGE = "common/alwaysShowAdsPage"
const ALLOW_GET_POSITION = "common/allowGetPosition"
const HAS_DOWNLOADED_PACKAGE = "common/hasDownloadedPackage"
const ALLOW_OTHERS_GET_POSITION = "common/allowOthersGetPosition"
const ALLOW_SHARE_MY_NICKNAME = "common/allowShareMyNickname"
const SHARED_NICKNAMES = "common/sharedNicknames"
const APP_UPDATING = "common/appUpdating"
const APP_SIZE = "common/appSize"
const IS_FROM_SYSTEM_SETUP = "common/isFromSystemSetup"
const AD_PIC_SRC = "common/adPicSrc"
const LOADED_IN_WIFI = "common/loadedInWifi"
const UPGRADE_PROGRESS_PERCENT = "common/upgradeProgressPercent"

const appVersion = localStorage.getItem("appVersion") || ""

// initialSate
const initialState = () => ({
	currentLocation: "",
	appVersion,
	menuList: [{
			title: "签到",
			icon: "fa fa-home fa-fw",
			selectedIcon: "fa fa-home fa-fw light-blue",
			badge: "",
			isDot: "",
			route: "sign"
		},
		{
			title: "文件",
			icon: "fa fa-file-o",
			selectedIcon: "fa fa-file light-blue",
			badge: "",
			isDot: "",
			route: "file"
		},
		{
			title: "音乐",
			icon: "fa fa-music",
			selectedIcon: "fa fa-music light-blue",
			badge: "",
			isDot: "",
			route: "music"
		},
		{
			title: "我",
			icon: "fa fa-user",
			selectedIcon: "fa fa-user light-blue",
			badge: "",
			isDot: "",
			route: "myInfo"
		},
	],
	isFromSignPage: false,
	currentXYPosition: [0, 0],
	currentProvince: "",
	adsTime: 3,
	backToDesktopTime: 0,
	savedCurrentRoute: "",
	deviceInfo: {},
	hideNavBar: true,
	receiveNotification: true,
	powerRun: false,
	alwaysShowAdsPage: true,
	allowGetPosition: true,
	hasDownloadedPackage: false,
	allowOthersGetPosition: true,
	allowShareMyNickname: true,
	sharedNicknames: [],
	appUpdating: false,
	appSize: 0,
	isFromSystemSetup: false,
	adPicSrc: `./ads/ad0.png`,
	loadedInWifi: "",
	upgradeProgressPercent: ""
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case CURRENT_LOCATION:
			return Object.assign({}, state, {
				currentLocation: action.data
			});
		case APP_VERSION:
			return Object.assign({}, state, {
				appVersion: action.data
			});
		case MENU_LIST:
			return Object.assign({}, state, {
				menuList: action.data
			});
		case IS_FROM_SIGN_PAGE:
			return Object.assign({}, state, {
				isFromSignPage: action.data
			});
		case CURRENT_X_Y_POSITION:
			return Object.assign({}, state, {
				currentXYPosition: action.data
			});
		case CURRENT_PROVINCE:
			return Object.assign({}, state, {
				currentProvince: action.data
			});
		case ADS_TIME:
			return Object.assign({}, state, {
				adsTime: action.data
			});
		case BACK_TO_DESKTOP_TIME:
			return Object.assign({}, state, {
				backToDesktopTime: action.data
			});
		case SAVE_CURRENT_ROUTE:
			return Object.assign({}, state, {
				savedCurrentRoute: action.data
			});
		case DEVICE_INFO:
			return Object.assign({}, state, {
				deviceInfo: action.data
			});
		case HIDE_NAV_BAR:
			return Object.assign({}, state, {
				hideNavBar: action.data
			});
		case RECEIVE_NOTIFICATION:
			return Object.assign({}, state, {
				receiveNotification: action.data
			});
		case POWER_RUN:
			return Object.assign({}, state, {
				powerRun: action.data
			});
		case ALWAYS_SHOW_ADS_PAGE:
			return Object.assign({}, state, {
				alwaysShowAdsPage: action.data
			});
		case ALLOW_GET_POSITION:
			return Object.assign({}, state, {
				allowGetPosition: action.data
			});
		case HAS_DOWNLOADED_PACKAGE:
			return Object.assign({}, state, {
				hasDownloadedPackage: action.data
			});
		case ALLOW_OTHERS_GET_POSITION:
			return Object.assign({}, state, {
				allowOthersGetPosition: action.data
			});
		case ALLOW_SHARE_MY_NICKNAME:
			return Object.assign({}, state, {
				allowShareMyNickname: action.data
			});
		case SHARED_NICKNAMES:
			return Object.assign({}, state, {
				sharedNicknames: action.data
			});
		case APP_UPDATING:
			return Object.assign({}, state, {
				appUpdating: action.data
			});
		case APP_SIZE:
			return Object.assign({}, state, {
				appSize: action.data
			});
		case IS_FROM_SYSTEM_SETUP:
			return Object.assign({}, state, {
				isFromSystemSetup: action.data
			});
		case AD_PIC_SRC:
			return Object.assign({}, state, {
				adPicSrc: action.data
			});
		case LOADED_IN_WIFI:
			return Object.assign({}, state, {
				loadedInWifi: action.data
			});
		case UPGRADE_PROGRESS_PERCENT:
			return Object.assign({}, state, {
				upgradeProgressPercent: action.data
			});
		default:
			return state;
	}
}

// update
export const updateCurrentLocation = data => ({
	type: CURRENT_LOCATION,
	data
});

export const updateAppVersion = data => ({
	type: APP_VERSION,
	data
});

export const updateIsFromSignPage = data => ({
	type: IS_FROM_SIGN_PAGE,
	data
})

export const updateCurrentXYPosition = data => ({
	type: CURRENT_X_Y_POSITION,
	data
})

export const updateCurrentProvince = data => ({
	type: CURRENT_PROVINCE,
	data
})

export const updateAdsTime = data => ({
	type: ADS_TIME,
	data
})

export const updateBackToDesktopTime = data => ({
	type: BACK_TO_DESKTOP_TIME,
	data
})

export const updateSavedCurrentRoute = data => ({
	type: SAVE_CURRENT_ROUTE,
	data
})

export const updateDeviceInfo = data => ({
	type: DEVICE_INFO,
	data
})

export const updateHideNavBar = data => ({
	type: HIDE_NAV_BAR,
	data
})

export const updateReceiveNotification= data => ({
	type: RECEIVE_NOTIFICATION,
	data
})

export const updatePowerRun = data => ({
	type: POWER_RUN,
	data
})

export const updateAlwaysShowAdsPage = data => ({
	type: ALWAYS_SHOW_ADS_PAGE,
	data
})

export const updateAllowGetPosition = data => ({
	type: ALLOW_GET_POSITION,
	data
})

export const updateHasDownloadedPackage = data => ({
	type: HAS_DOWNLOADED_PACKAGE,
	data
})

export const updateAllowOthersGetPosition = data => ({
	type: ALLOW_OTHERS_GET_POSITION,
	data
})

export const updateAllowShareMyNickname = data => ({
	type: ALLOW_SHARE_MY_NICKNAME,
	data
})

export const updateSharedNicknames = data => ({
	type: SHARED_NICKNAMES,
	data
})

export const updateAppUpdating = data => ({
	type: APP_UPDATING,
	data
})

export const updateAppSize = data => ({
	type: APP_SIZE,
	data
})

export const updateIsFromSystemSetup = data => ({
	type: IS_FROM_SYSTEM_SETUP,
	data
})

export const updateAdPicSrc = data => ({
	type: AD_PIC_SRC,
	data
})

export const updateLoadedInWifi = data => ({
	type: LOADED_IN_WIFI,
	data
})

export const updateUpgradeProgressPercent= data => ({
	type: UPGRADE_PROGRESS_PERCENT,
	data
})
