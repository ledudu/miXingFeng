//actionType
const USERNAME = "login/username";
const PASSWORD = "login/password";
const TOKEN = "login/token";
const IS_FROM_LOGIN_PAGE = "login/isFromLoginPage";
const LOG_OUT_Flag = 'login/logOutFlag';
const HAS_FORGET_PASSWORD = "login/hasForgetPassword"
const REGISTER_FROM_LOGIN = "login/registerFromLogin"
const FORGET_PASSWORD_TOKEN = "login/forgetPasswordToken"
const FORGET_PASSWORD_TOKEN_ORIGIN = "login/forgetPasswordTokenOrigin"

// initialSate
const initialState = () => ({
	username: "",
	password: "",
	token: "",
	isFromLoginPage: false,
	logOutFlag: false,
	hasForgetPassword: false,
	registerFromLogin: false,
	forgetPasswordToken: "",
	forgetPasswordTokenOrigin: "",
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case USERNAME:
			return Object.assign({}, state, {
				username: action.data
			});
		case PASSWORD:
			return Object.assign({}, state, {
				password: action.data
			});
		case TOKEN:
			return Object.assign({}, state, {
				token: action.data
			});
		case IS_FROM_LOGIN_PAGE:
			return Object.assign({}, state, {
				isFromLoginPage: action.data
			});
		case LOG_OUT_Flag:
			return Object.assign({}, state, {
				logOutFlag: action.data
			});
		case HAS_FORGET_PASSWORD:
			return Object.assign({}, state, {
				hasForgetPassword: action.data
			});
		case REGISTER_FROM_LOGIN:
			return Object.assign({}, state, {
				registerFromLogin: action.data
			});
		case FORGET_PASSWORD_TOKEN:
			return Object.assign({}, state, {
				forgetPasswordToken: action.data
			});
		case FORGET_PASSWORD_TOKEN_ORIGIN:
			return Object.assign({}, state, {
				forgetPasswordTokenOrigin: action.data
			});
		default:
			return state;
	}
}

// update
export const updateUsername = data => ({
	type: USERNAME,
	data
});

export const updatePassword = data => ({
	type: PASSWORD,
	data
});

export const updateToken = data => ({
	type: TOKEN,
	data
});

export const updateIsFromLoginPage = data => ({
	type: IS_FROM_LOGIN_PAGE,
	data
})

export const updateLogOutFlag = data => ({
	type: LOG_OUT_Flag,
	data
})

export const updateHasForgetPassword = data => ({
	type: HAS_FORGET_PASSWORD,
	data
})

export const updateRegisterFromLogin = data => ({
	type: REGISTER_FROM_LOGIN,
	data
})

export const updateForgetPasswordToken = data => ({
	type: FORGET_PASSWORD_TOKEN,
	data
})

export const updateForgetPasswordTokenOrigin = data => ({
	type: FORGET_PASSWORD_TOKEN_ORIGIN,
	data
})
