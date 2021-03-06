import axios from 'axios';
import { Toast } from "antd-mobile";
import { HTTP_URL } from "../../constants/httpRoute";
import { replaceSocketLink } from "../../services/utils";
import { updatePassword,
	updateUsername,
	updateToken,
	updateIsFromLoginPage,
	updateLogOutFlag,
	updateForgetPasswordToken,
	updateForgetPasswordTokenOrigin,
	updateUserId,
	updateRetryLoginTimes
} from "../../ducks/login";
import {
	networkErr, confirm
} from "../../services/utils";
import {
	updateSetNickname,
	updateSetMobile,
	updateSignature,
	updateSetSex,
	updateSetBirthday,
	updateSetHeadPic,
	updateSetAddress,
	updateSetRole,
	updateSetEmail,
	updateCarrierOperator
} from "../../ducks/myInfo";
import { CONSTANT } from "../../constants/enumeration";
import { logoutApp, checkPassword } from "../common";
import { updateDeviceInfo, updateAllowShareMyNickname } from "../../ducks/common";
import { saveHeadPicToLocal } from "../myInfo";
import { updateMusicCollection } from "../../ducks/fileServer";

let loginFlag = false
export const loginApp = (username, password, self) => {
	if(loginFlag) return;
    if (!username) {
        alert("用户名不能为空");
        return;
    } else if (!password) {
        alert("密码不能为空");
        return;
	}
	loginFlag = true;
	username = username.trim()
	password = password.trim()
	let { retryLoginTimes } = $getState().login
	let continueToNext = true
	if(retryLoginTimes >= 7){
		continueToNext = false
		loginFlag = false
		if(retryLoginTimes === 7){
			setTimeout(() => {
				$dispatch(updateRetryLoginTimes(0))
			}, 1000 * 60 * 5)
		}
		return confirm("提示", "密码输入的错误次数过多，建议找回密码或稍后再试", "去找回", () => {
			return window.goRoute(self, "/forget_password")
		})
	}
	if(!continueToNext) return
	self.setState({
		loginStatus: "登录中..."
	})
	const data = Object.assign({}, { username }, { pwd: password })
    Toast.loading('加载中...', CONSTANT.toastLoadingTime, () => {});
    axios.post(HTTP_URL.loginVerify ,(data))
        .then(async (response) => {
			self.setState({
				loginStatus: "登录"
			})
            if (response.data.result.response === "error_username" || response.data.result.response === "error_password") {
				Toast.hide();
				retryLoginTimes++
				if(retryLoginTimes === 5){
					alert("密码已输错5次，还有3次机会")
				} else if(retryLoginTimes === 6){
					alert("密码已输错6次，还有2次机会")
				} else if(retryLoginTimes === 7){
					alert("密码已输错7次，还有1次机会")
				} else if(retryLoginTimes < 5){
					alert("用户名或密码错误");
				}
				$dispatch(updateRetryLoginTimes(retryLoginTimes))
                return;
            } else if (response.data.result.response === "empty_username") {
                Toast.hide();
                alert("用户名不能为空");
                return;
            } else if(response.data.result.token){
				$dispatch(updateRetryLoginTimes(0))
                const result = response.data.result;
				$dispatch(updateIsFromLoginPage(true));
				dealtWithLogin(result)
				Toast.hide();
            } else {
				alertDebug("unknown error")
				logger.error("loginApp loginVerify response", response.data)
            }
		})
        .catch(err => {
            logger.error(`login  catch`, err);
			self.setState({
				loginStatus: "登录"
			})
            Toast.hide();
            networkErr(err, `loginVerify data: ${data}`);
		})
		.finally(() => {
			loginFlag = false;
		})
}

export const dealtWithLogin = (result) => {
	const userProfile = result.userProfile || {}
	const favoriteSongs = result.favoriteSongs || []
	const shareNickname = userProfile.shareNickname !== false ? true : false
	localStorage.setItem("userProfile", JSON.stringify(userProfile))
	localStorage.setItem("favoriteSongs", JSON.stringify(favoriteSongs.slice(0, 50)))
	localStorage.setItem("role", result.role || "")
	$dispatch(updateUsername(result.username || ""));
	$dispatch(updatePassword(result.password));
	$dispatch(updateToken(result.token));
	$dispatch(updateSetNickname(userProfile.nickname));
	$dispatch(updateSetMobile(userProfile.mobile));
	$dispatch(updateSignature(userProfile.signature));
	$dispatch(updateSetSex(userProfile.sex));
	$dispatch(updateSetBirthday(userProfile.birthday));
	$dispatch(updateSetHeadPic(userProfile.user_pic));
	$dispatch(updateSetAddress(userProfile.address));
	$dispatch(updateAllowShareMyNickname(shareNickname));
	$dispatch(updateSetEmail(userProfile.email));
	$dispatch(updateCarrierOperator(userProfile.mobileCarrierOperator));
	$dispatch(updateMusicCollection(favoriteSongs));
	if($getState().login.logOutFlag) $dispatch(updateLogOutFlag(false));
	$dispatch(updateSetRole(result.role));
	if(userProfile.user_pic  && window.isCordova){
		saveHeadPicToLocal(userProfile.user_pic, result.username, 'loginApp');
	}
	window.eventEmit.$emit("hasLogin")

	favoriteSongs.forEach(item => {
		delete item.getNewestPath
	})

	document.addEventListener('deviceready', function(){
		window.$dispatch(updateDeviceInfo(device))
		logger.info('device', device);
		if(!localStorage.getItem("device")){
			const info = { deviceInfo: device, token: result.token }
			axios.post(HTTP_URL.uploadDeviceInfo, info)
				.then((response) => {
					localStorage.setItem("device", device || "")
					logger.info('uploadDeviceInfo', response.data)
				})
				.catch(err => {
					logger.error("loginApp uploadDeviceInfo", err)
				})
		}
	},false);

	const original = localStorage.getItem("oldUserId") || "";
	const newOne = (result.username || result.mobile)
	$dispatch(updateUserId(newOne))
	if(!result.autoLogin){
		const data = { original, newOne }
		if(original !== newOne && original){
			replaceSocketLink(data, "login success")
		}
	}
	if(window.getRoute() !== "/main/sign"){
		window.goRoute(null, "/main/sign");
	}
}

export const registerUsername = (that, usernameValue="", pwdValue="", pwdValueAgain="") => {
	usernameValue = usernameValue.replace(/\s/g, "")
	pwdValue = pwdValue.replace(/\s/g, "")
	pwdValueAgain = pwdValueAgain.replace(/\s/g, "")
    if (!usernameValue) {
        alert("用户名不能为空");
        return;
    } else if(!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(usernameValue)){
		logger.info("用户名只能由字母,数字或中文组成", usernameValue)
		return alertDialog("用户名只能由字母，数字或中文组成");
	} else if(/^[0-9]/i.test(usernameValue)){
		logger.info("用户名首字母不能是数字", usernameValue)
		return alertDialog("用户名首字母不能是数字");
	} else if (usernameValue.length > 32) {
        alertDialog("用户名长度不可超过32位");
        return;
	} else if (!pwdValue) {
        alertDialog("密码不能为空");
        return;
	} else if (checkPassword(pwdValue) === false) { //密码至少包含一个数字和一个字母
		logger.info("密码至少包含大小写字母和数字中的两种且长度在6-16位之间", pwdValue)
        alertDialog("密码至少包含大小写字母和数字中的两种且长度在6-16位之间");
        return;
    } else if (pwdValue !== pwdValueAgain) {
		logger.info("两次输入的密码不一致，请重新输入 pwdValue", pwdValue)
		logger.info("两次输入的密码不一致，请重新输入 pwdValueAgain", pwdValueAgain)
        alertDialog("两次输入的密码不一致，请重新输入");
        return;
	}
	const { setTempMobile, setMobile } = $getState().myInfo
    const data = { username: usernameValue , pwd: pwdValue, mobile: setMobile || setTempMobile }
    Toast.loading('加载中...', CONSTANT.toastLoadingTime, () => {});
    axios.post(HTTP_URL.registerVerify , (data))
        .then((response) => {
            Toast.hide();
            window.logger.info(`register  response`, response.data);
            if (response.data.result.response === "illegal_username") {
                alert("用户名非法");
                return;
            } else if (response.data.result.response === "illegal_password") {
                alert('密码非法');
                return;
            } else if (response.data.result.response === "username_exist") {
                alert('用户名已存在');
                return;
            } else if (response.data.result.response === "modify_success"){
                alert('注册成功')
				window.$dispatch(updateUsername(usernameValue));
                window.$dispatch(updatePassword(pwdValue));
                window.goRoute(that, "/login")
            } else if(response.data.result.response === "register_fail"){
                alert('注册失败');
            } else {
				logger.error("registerUsername response.data.result", response.data.result)
				alert('注册失败');
			}
        })
        .catch(err => {
            Toast.hide();
            networkErr(err, `registerUsername data: ${data}`);
        })
}

export const resetPasswordFunc = (self, newPwd1, newPwd2) => {
	const { forgetPasswordToken, forgetPasswordTokenOrigin } = $getState().login
    const token =  forgetPasswordToken || $getState().login.token
    let data = {};
    if(!token){
		alertDialog("没有token")
        return;
    } else {
        if(!newPwd1 || !newPwd2) {
            return alert("请填写密码")
        } else if (checkPassword(newPwd2) === false) { //密码至少包含一个数字和一个字母
            alert("密码至少包含大小写字母和数字中的两种且长度在6-16位之间");
            return;
        } else if(newPwd1 !== newPwd2) {
			return alert("两次密码不一致")
		} else {
			newPwd1 = newPwd1.trim()
			const origin = forgetPasswordTokenOrigin === "email" ? "email" : forgetPasswordTokenOrigin === "mobile" ? "mobile" : "systemSetup"
			if(origin){  // 这里的token是忘记密码或重置密码，两个token是不一样的
				data = Object.assign({}, {newPwd: newPwd1, token, origin});
			} else {
				return alert('未知来源')
			}
        }
    }

    Toast.loading('加载中...', CONSTANT.toastLoadingTime, () => {});
    axios.post(HTTP_URL.resetPassword, data)
    	.then((response) => {
    	    Toast.hide();
    	    window.logger.info(`reset password response`, response.data);
    	    if (response.data.result === "lack_field") {
    	        alert('缺少字段');
    	        return;
    	    } else if(response.data.result.response === "username_not_exist") {
    	        alert('用户名不存在');
    	    } else if(response.data.result.response === "wrong_password") {
    	        alert('原密码错误');
    	    } else if(response.data.result.response === "reset_fail") {
    	        alert('重置失败');
    	    } else if(response.data.result.response === "token_expired") {
    	        alert('身份已过期，请重新登录');
    	    } else if(response.data.result.result === "reset_success"){
				alert('重置成功');
				if(forgetPasswordToken){
					$dispatch(updateForgetPasswordToken(""))
					$dispatch(updateForgetPasswordTokenOrigin(""))
					$dispatch(updatePassword(""))
					window.goRoute(self, "/login")
				} else {
					logoutApp(self);
				}
    	    } else {
    	        alertDebug(response.data.response);
    	        logger.error("resetPasswordFunc response.data.response", response.data.response)
    	    }
    	})
    	.catch(err => {
    	    Toast.hide();
    	    networkErr(err, `resetPassword data: ${data}`);
		})
}

