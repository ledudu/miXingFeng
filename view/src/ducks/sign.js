//actionType
const IS_SIGNED_UP = "sign/isSignedUp";
const LAST_SIGN_UP_TIME = "sign/lastSignUpTime";
const ALREADY_SIGN_UP_PERSONS = "sign/alreadySignUpPersons";
const NOT_SIGN_UP_PERSONS = "sign/notSignUpPersons";
const ONLINE_PERSONS = "sign/onlinePersonsNum"
const SIGNED_FLAG = "sign/signedFlag";
const ONLINE_PERSONS_NAME = "sign/onlinePersonsName";
const DIRECT_SHOW_SIGN_PAGE = "sign/directShowSignPage";
const AD_NUMBER = "sign/adNumber";
const FROM_RESUME = "sign/fromResume"
const JUST_OPEN_APP = "sign/justOpenApp"
const SHOW_UPDATE_CONFIRM = "sign/showUpdateConfirm"
const NEED_RETRY_REQUEST_WHEN_LAUNCH = "sign/needRetryRequestWhenLaunch"
const SHOW_DOWNLOAD_APP_TIP = "sign/showDownloadAppTip"

let alreadySignUpPersons=[], notSignUpPersons=[]
try{alreadySignUpPersons = localStorage.getItem("alreadySignUpPersons") ? JSON.parse(localStorage.getItem("alreadySignUpPersons")) : []}catch(err){alreadySignUpPersons=[]}
try{notSignUpPersons = localStorage.getItem("notSignUpPersons") ? JSON.parse(localStorage.getItem("notSignUpPersons")) : []}catch(err){notSignUpPersons=[]}
const lastSignUpTime = localStorage.getItem("lastSignUpTime") || ""

// initialSate
const initialState = () => ({
	isSignedUp: false,
	lastSignUpTime,
	alreadySignUpPersons,
	notSignUpPersons,
	onlinePersonsNum: 0,
	signedFlag: "",
	onlinePersonsName: "",
	directShowSignPage: false,
	adNumber: 0,
	fromResume: false,
	justOpenApp: true,
	showUpdateConfirm: false,
	needRetryRequestWhenLaunch: true,
	showDownloadAppTip: !window.isDevModel
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case IS_SIGNED_UP:
			return Object.assign({}, state, {
				isSignedUp: action.data
			});
		case LAST_SIGN_UP_TIME:
			return Object.assign({}, state, {
				lastSignUpTime: action.data
			});
		case ALREADY_SIGN_UP_PERSONS:
			return Object.assign({}, state, {
				alreadySignUpPersons: action.data
			});
		case NOT_SIGN_UP_PERSONS:
			return Object.assign({}, state, {
				notSignUpPersons: action.data
			});
		case ONLINE_PERSONS:
			return Object.assign({}, state, {
				onlinePersonsNum: action.data
			});
		case SIGNED_FLAG:
			return Object.assign({}, state, {
				signedFlag: action.data
			});
		case ONLINE_PERSONS_NAME:
			return Object.assign({}, state, {
				onlinePersonsName: action.data
			});
		case DIRECT_SHOW_SIGN_PAGE:
			return Object.assign({}, state, {
				directShowSignPage: action.data
			});
		case AD_NUMBER:
			return Object.assign({}, state, {
				adNumber: action.data
			});
		case FROM_RESUME:
			return Object.assign({}, state, {
				fromResume: action.data
			});
		case JUST_OPEN_APP:
			return Object.assign({}, state, {
				justOpenApp: action.data
			});
		case SHOW_UPDATE_CONFIRM:
			return Object.assign({}, state, {
				showUpdateConfirm: action.data
			});
		case NEED_RETRY_REQUEST_WHEN_LAUNCH:
			return Object.assign({}, state, {
				needRetryRequestWhenLaunch: action.data
			});
		case SHOW_DOWNLOAD_APP_TIP:
			return Object.assign({}, state, {
				showDownloadAppTip: action.data
			});
		default:
			return state;
	}
}

export const updateSignUpStatus = data => ({
	type: IS_SIGNED_UP,
	data
});

export const updateLastSignUpTime = data => ({
	type: LAST_SIGN_UP_TIME,
	data
});
export const updateAlreadySignUpPersons = data => ({
	type: ALREADY_SIGN_UP_PERSONS,
	data
});

export const updateNotSignUpPersons = data => ({
	type: NOT_SIGN_UP_PERSONS,
	data
});

export const updateOnlinePersons = data => ({
	type: ONLINE_PERSONS,
	data
});

export const updateSignedFlag = data => ({
	type: SIGNED_FLAG,
	data
});

export const updateOnlinePersonsName = data => ({
	type: ONLINE_PERSONS_NAME,
	data
})

export const updateDirectShowSignPage = data => ({
	type: DIRECT_SHOW_SIGN_PAGE,
	data
})

export const updateAdNumber = data => ({
	type: AD_NUMBER,
	data
})

export const updateFromResume = data => ({
	type: FROM_RESUME,
	data
})

export const updateJustOpenApp = data => ({
	type: JUST_OPEN_APP,
	data
})

export const updateShowUpdateConfirm = data => ({
	type: SHOW_UPDATE_CONFIRM,
	data
})

export const updateNeedRetryRequestWhenLaunch = data => ({
	type: NEED_RETRY_REQUEST_WHEN_LAUNCH,
	data
})

export const updateShowDownloadAppTip = data => ({
	type: SHOW_DOWNLOAD_APP_TIP,
	data
})
