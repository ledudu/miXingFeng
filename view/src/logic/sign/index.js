import axios from 'axios';
import { alert } from "../../services/utils";
import { HTTP_URL } from "../../constants/httpRoute";
import { retrieveOthers } from "../common/index";
import { updateToken } from "../../ducks/login";
import { updateSignUpStatus, updateLastSignUpTime, updateSignedFlag } from "../../ducks/sign";
import { networkErr, saveFileToLocal } from "../../services/utils"

export const retrieveLastLoginTime = () => {
	const { token } = window.$getState().login;
	if(token){
		const data = Object.assign({}, {
			token: token
		});
		return axios.post(HTTP_URL.lastSign, data)
			.then((response) => {
				window.logger.info(`retrieveLastLoginTime  response`, response.data.result.lastDay)
				const date = new Date().format("yyyy-MM-dd");
				let lastSignUpTime = response.data.result.lastDay;
				if(lastSignUpTime.split(" ")[0] === date) signed();
				window.$dispatch(updateLastSignUpTime(lastSignUpTime));
			})
			.catch(err => {
                networkErr(err);
            })
	}
}

export const signInApp = (that) => {
	if(window.$getState().sign.isSignedUp) return;
    let signFlag;
	if (signFlag) return;
    signFlag = true;
    let { currentLocation } = window.$getState().common;
	window.logger.info(`currentLocation`, currentLocation);
	currentLocation = typeof(currentLocation) === 'object' ? currentLocation.formatted_address : currentLocation;
	currentLocation = currentLocation || "";
	const date = new Date().format("yyyy-MM-dd");
	let { token } = window.$getState().login;
	if(token){
		let data = Object.assign({}, {
			token,
			location: currentLocation,
			CurrentTime: date
		});
		window.logger.info("signInApp data",data)
		axios.post(HTTP_URL.goSign, data)
			.then((response) => {
				signFlag = false;
				window.logger.info(`signIn  response`, response.data);
				if (response.data.result.str === "already_signed") {
					alert("已签到");
					signed();
					return;
				} else if (response.data.result.str === "token_expired"){
					window.logger.error(`身份已过期,请重新登录页`);
					window.$dispatch(updateToken(""));
					let { username } = window.$getState().login;
					document.getElementsByName("username")[0] && (document.getElementsByName("username")[0].value = username);
				} else if (response.data.result.str === "no_sign") {
					//更新token
					window.$dispatch(updateToken(response.data.result.token));
					alert("签到成功");
					signed();
					const date = new Date().format("yyyy-MM-dd hh:mm:ss");
					document.getElementsByClassName("last-sign")[0] && (document.getElementsByClassName("last-sign")[0].innerHTML = date);
					retrieveOthers();
					return;
				} else if(response.data.result.str === "error"){
					alert("签到失败");
				} else if(response.data.result.str === "error_in_client_time"){
					alert("签到失败，请检查时间设置");
				} else if(response.data.result.str === "no_exist_username"){
					alert("用户不存在!");
				} else {
					alertDebug(response.data)
				}
			})
			.catch(err => {
				window.logger.error(`signIn, err`, err.stack||err.toString());
				networkErr(err);
			})
	} else {
		window.goRoute(that, "/login");
	}
}

export const signed = () => {
	const { isSignedUp, signedFlag } = $getState().sign
	if(!isSignedUp) $dispatch(updateSignUpStatus(true));
	if(!signedFlag) $dispatch(updateSignedFlag('signed-flag'))
}

export const downloadAdPic = () => {
	if(!window.isCordova) return
	window.downloadAdPicTimer = setTimeout(() => {
		window.downloadAdPicTimer = null
		return axios.get(HTTP_URL.getAdPicture)
			.then((response) => {
				const result = response.data.result.response;
				if(result.message === "no_ad_pics"){
					logger.warn("no ad pics in server")
					return
				}
				const adUrl = window.serverHost + result.url
				const adsName = result.filename
				const isWiFiNetwork = window.getNetType() === "当前为Wi-Fi环境，更新无需移动流量" ? "yes" : "no"
				logger.info("downloadAdPic timer adsName", adsName, 'isWiFiNetwork', isWiFiNetwork, 'adUrl', adUrl)
				return saveFileToLocal(adsName, adUrl, 'adPics')
					.then(() => {
						localStorage.setItem("adsName", adsName)
						localStorage.setItem("isWiFiNetwork", isWiFiNetwork)
					})
					.catch(err => {
						alertDebug("setTimeout saveFileToLocal ad pic err")
						logger.error("setTimeout saveFileToLocal ad pic err", err)
					})
			})
			.catch((err) => {
				alertDebug("setTimeout download ad pic err")
				console.log("setTimeout download ad pic err ", err)
				logger.error("setTimeout download ad pic err", err.stack || err.toString())
			})
	}, 30*1000)
}


Date.prototype.format = function(fmt){
	var o = {
	  "M+" : this.getMonth()+1,                 //月份
	  "d+" : this.getDate(),                    //日
	  "h+" : this.getHours(),                   //小时
	  "m+" : this.getMinutes(),                 //分
	  "s+" : this.getSeconds(),                 //秒
	  "q+" : Math.floor((this.getMonth()+3)/3), //季度
	  "S"  : this.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt))
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("("+ k +")").test(fmt))
	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	return fmt;
}
