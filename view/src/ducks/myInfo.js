//actionType
const SET_NICKNAME = "myInfo/setNickname";
const SET_MOBILE = "myInfo/setMobile";
const SET_SIGNATURE = "myInfo/setSignature";
const SET_SEX = "myInfo/setSex";
const SET_BIRTHDAY = "myInfo/setBirthday";
const SET_HEAD_PIC = "myInfo/setHeadPic";
const SET_ADDRESS = "myInfo/setAddress";
const SET_SYSTEM_SETUP_DOT = "myInfo/setSystemSetupDot";
const SET_ROLE = "myInfo/setRole";
const SET_HEAD_PIC_NAME = "myInfo/setHeadPicName";
const REPLACE_HEAD_PIC = "myInfo/replaceHeadPic";
const SET_EMAIL = "myInfo/setEmail";
const SET_TEMP_EMAIL = "myInfo/setTempEmail";
const SET_TEMP_MOBILE = "myInfo/setTempMobile";

let userProfile = {}
try {userProfile = localStorage.getItem("userProfile") ? JSON.parse(localStorage.getItem("userProfile")) : {}} catch(err){userProfile = {}}
const setRole = localStorage.getItem("role") || ""
const setHeadPicName = localStorage.getItem("setHeadPicName") || ""

// initialSate
const initialState = () => ({
	setNickname: userProfile.nickname,
	setMobile: userProfile.mobile,
	setSignature: userProfile.signature,
	setSex: userProfile.sex,
	setBirthday: userProfile.birthday,
	setHeadPic: userProfile.user_pic,
	setAddress: userProfile.address,
	setSystemSetupDot: false,
	setRole,
	setHeadPicName,
	replaceHeadPic: false,
	setEmail: userProfile.email,
	setTempEmail: "",
	setTempMobile: ""
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case SET_NICKNAME:
			return Object.assign({}, state, {
				setNickname: action.data
			});
		case SET_MOBILE:
			return Object.assign({}, state, {
				setMobile: action.data
			});
		case SET_SIGNATURE:
			return Object.assign({}, state, {
				setSignature: action.data
			});
		case SET_SEX:
			return Object.assign({}, state, {
				setSex: action.data
			});
		case SET_BIRTHDAY:
			return Object.assign({}, state, {
				setBirthday: action.data
			});
		case SET_HEAD_PIC:
			return Object.assign({}, state, {
				setHeadPic: action.data
			});
		case SET_ADDRESS:
			return Object.assign({}, state, {
				setAddress: action.data
			});
		case SET_SYSTEM_SETUP_DOT:
			return Object.assign({}, state, {
				setSystemSetupDot: action.data
			});
		case SET_ROLE:
			return Object.assign({}, state, {
				setRole: action.data
			});
		case SET_HEAD_PIC_NAME:
			return Object.assign({}, state, {
				setHeadPicName: action.data
			});
		case REPLACE_HEAD_PIC:
			return Object.assign({}, state, {
				replaceHeadPic: action.data
			});
		case SET_EMAIL:
			return Object.assign({}, state, {
				setEmail: action.data
			});
		case SET_TEMP_EMAIL:
			return Object.assign({}, state, {
				setTempEmail: action.data
			});
		case SET_TEMP_MOBILE:
			return Object.assign({}, state, {
				setTempMobile: action.data
			});
		default:
			return state;
	}
}

// update
export const updateSetNickname = data => ({
	type: SET_NICKNAME,
	data
});
export const updateSetMobile = data => ({
	type: SET_MOBILE,
	data
});
export const updateSignature = data => ({
	type: SET_SIGNATURE,
	data
});
export const updateSetSex = data => ({
	type: SET_SEX,
	data
});
export const updateSetBirthday = data => ({
	type: SET_BIRTHDAY,
	data
});
export const updateSetHeadPic = data => ({
	type: SET_HEAD_PIC,
	data
});
export const updateSetAddress = data => ({
	type: SET_ADDRESS,
	data
});
export const updateSetSystemSetupDot = data => ({
	type: SET_SYSTEM_SETUP_DOT,
	data
});
export const updateSetRole = data => ({
	type: SET_ROLE,
	data
});
export const updateSetHeadPicName = data => ({
	type: SET_HEAD_PIC_NAME,
	data
});
export const updateReplaceHeadPic = data => ({
	type: REPLACE_HEAD_PIC,
	data
})
export const updateSetEmail = data => ({
	type: SET_EMAIL,
	data
})
export const updateSetTempEmail = data => ({
	type: SET_TEMP_EMAIL,
	data
})
export const updateSetTempMobile = data => ({
	type: SET_TEMP_MOBILE,
	data
})
