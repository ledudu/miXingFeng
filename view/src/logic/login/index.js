import axios from 'axios';
import { Toast } from "antd-mobile";
import { HTTP_URL } from "../../constants/httpRoute";
import { alert, writeFile, alertDialog } from "../../services/utils";
import { updatePassword,
	updateUsername,
	updateToken,
	updateIsFromLoginPage,
	updateLogOutFlag,
	updateForgetPasswordToken,
	updateForgetPasswordTokenOrigin,
	updateUserId
} from "../../ducks/login";
import {
	networkErr
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
import { logoutApp, reconnectSocket, checkPassword } from "../common";
import { updateDeviceInfo, updateAllowShareMyNickname } from "../../ducks/common";
import { saveHeadPicToLocal } from "../myInfo";
import { updateMusicCollection } from "../../ducks/fileServer";

export const loginApp = (username, password) => {
    let loginFlag;
    if(loginFlag) return;
    loginFlag = false;
    let data = Object.assign({}, { username }, { pwd: password })
    if (!username) {
        alert("用户名不能为空");
        return;
    } else if (!password) {
        alert("密码不能为空");
        return;
    }
    $('#loginButton').text('登录中...');
    Toast.loading('加载中...', CONSTANT.toastLoadingTime, () => {});
    axios.post(HTTP_URL.loginVerify ,(data))
        .then(async (response) => {
            loginFlag = true;
            $('#loginButton').text('登录');
            if (response.data.result.response === "error_username" || response.data.result.response === "error_password") {
                Toast.hide();
                alert("用户名或密码错误");
                return;
            } else if (response.data.result.response === "empty_username") {
                Toast.hide();
                alert("用户名不能为空");
                return;
            } else if(response.data.result.token){
                const result = response.data.result;
				$dispatch(updateIsFromLoginPage(true));
				dealtWithLoginIn(result, result.userProfile)
				Toast.hide();
            } else {
				alert("")
				logger.error("loginApp loginVerify response", response.data)
            }
		})
        .catch(err => {
            logger.error(`login  catch`, err);
            $('#loginButton').text("登录")
            Toast.hide();
            networkErr(err, `loginVerify data: ${data}`);
        })
}

export const dealtWithLoginIn = (result, userProfile={}) => {
	const favoriteSongs = result.favoriteSongs || []
	const shareNickname = userProfile.shareNickname !== false ? true : false
	localStorage.setItem("userProfile", JSON.stringify(userProfile))
	localStorage.setItem("username", (result.username || ""))
	localStorage.setItem("mobile", result.mobile)
	localStorage.setItem("favoriteSongs", JSON.stringify(favoriteSongs.slice(0, 50)))
	localStorage.setItem("role", result.role)
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
	window.localStorage.setItem("tk", result.token);

	favoriteSongs.forEach(item => {
		delete item.getNewestPath
	})

	document.addEventListener('deviceready',function(){
		window.$dispatch(updateDeviceInfo(device))
		logger.info('device', device);
		const deviceInfo = { deviceInfo: device }
		const info = Object.assign(deviceInfo, { token: result.token })
		axios.post(HTTP_URL.uploadDeviceInfo, info)
			.then((response) => {
				logger.info('uploadDeviceInfo', response.data)
				window.eventEmit.$emit("hasLogin")
			})
			.catch(err => {
				logger.error("loginApp uploadDeviceInfo", err)
			})
	},false);

	const original = $getState().login.userId;
	const newOne = (result.username || result.mobile)
	window.localStorage.setItem("userId", newOne);
	$dispatch(updateUserId(newOne))
	const data = { original, newOne }
	if(window.isCordova){
		logger.info('result1', result)
		let dataSaved = Object.assign({}, {"username": (result.username || result.mobile), "token": result.token});
		dataSaved = JSON.stringify(dataSaved);
		let b = new window.Base64();
		dataSaved = b.encode(dataSaved);
		writeFile(dataSaved, 'sign.txt', false);
	}
	if(original !== newOne){
		axios.post(HTTP_URL.replaceSocketLink, data)
		.then(res => {
			if (res.data.result.response === "success"){
				logger.info("login success and reconnect websocket")
				reconnectSocket()
			} else {
				alertDebug("replaceSocketLink fail")
				logger.error("replaceSocketLink err", res.data.result)
			}
		})
		.catch(err => {
			logger.error("loginApp replaceSocketLink", err.stack || err.toString())
		})
		.finally(() => {
			if(window.getRoute() !== "/main/sign"){
				window.goRoute(null, "/main/sign");
			}
		})
	}

}

export const registerUsername = (that) => {
    let usernameValue = document.getElementsByName("register-username")[0] && document.getElementsByName("register-username")[0].value;
    let pwdValue = document.getElementsByName("register-password")[0] && document.getElementsByName("register-password")[0].value;
    let pwdValueAgain = document.getElementsByName("register-password-again")[0] && document.getElementsByName("register-password-again")[0].value;
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
                document.getElementsByName("register-username")[0] && (document.getElementsByName("register-username")[0].value = "");
                document.getElementsByName("register-password")[0] && (document.getElementsByName("register-password")[0].value = "");
                document.getElementsByName("register-password-again")[0] && (document.getElementsByName("register-password-again")[0].value = "");
				window.$dispatch(updateUsername(usernameValue));
				localStorage.setItem("username", usernameValue)
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

export const resetPasswordFunc = (self) => {
	const { forgetPasswordToken, forgetPasswordTokenOrigin } = $getState().login
    const token =  forgetPasswordToken || $getState().login.token
    let data = {};
    if(!token){
        return;
    } else {
		const newPwd2 = $('.reset-password-password2').val();
        const newPwd3 = $('.reset-password-password3').val();
        if(!newPwd2 || !newPwd3) {
            return alert("请填写密码")
        } else if (checkPassword(newPwd3) === false) { //密码至少包含一个数字和一个字母
            alert("密码至少包含大小写字母和数字中的两种且长度在6-16位之间");
            return;
        } else if(newPwd2 !== newPwd3) {
			return alert("两次密码不一致")
		} else {
			const origin = forgetPasswordTokenOrigin === "email" ? "email" : forgetPasswordTokenOrigin === "mobile" ? "mobile" : "systemSetuo"
			if(origin){
				data = Object.assign({}, {newPwd: newPwd3, token, origin});
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
    	        alert(response.data.response);
    	        logger.error("resetPasswordFunc response.data.response", response.data.response)
    	    }
    	})
    	.catch(err => {
    	    Toast.hide();
    	    networkErr(err, `resetPassword data: ${data}`);
		})
}

