import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";
import _ from "lodash";
import axios from 'axios';
import { Toast } from "antd-mobile";
import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import { Provider } from "react-redux";
import Logger from "cordova-logger"

import reducer from "./ducks";
import { updateToken } from "./ducks/login";
import Routers from './router';
import { checkToShowPlayController } from "./logic/common"
import { alertDialog } from "./services/utils"
import "./services/JPush";
import "./services/native";
import './themes/css/index.less';

window.serverHost = window.config.debug ? (window.config.domain + ":" + window.config.port) :  window.config.domainUrl
window.isDevModel = window.config.dev
window.logger = new Logger({
	folder: "miXingFeng",
	column: "log",
	filename: "miXingFeng.txt"
})

//apply Reducer
const middleware = [thunk];
if(window.config && window.isDevModel){
	middleware.push(createLogger({
		collapsed: false,
	}));
}
const store = createStore(reducer, compose(applyMiddleware(...middleware)));
window.store = store;
window.$dispatch = store.dispatch;
window.$getState = store.getState;
window.$subscribe = store.subscribe;
window.$ = $;
window._ = _;
window.axios = axios;
window.alert = (text) => {
	if(window.isCordova){
		window.plugins.toast.showShortCenter(text)
	} else {
		Toast.info(text, 2, null, false);
	}
}
window.alertDebug = (text) => {
	// don't comment this function content in production
	if(window.isDevModel){
		if(window.isCordova){
			// window.plugins.toast.showShortCenter(text)
			alertDialog(text)
		} else {
			alertDialog(text);
		}
	}
	logger.info('alertDebug', text)
}

window.alertDialog = alertDialog

//change router
window.goRoute = ( self, path ) => {
	if(!self && window.SELF) {
		logger.warn("window.goRoute window.SELF path", path)
		self = window.SELF;
	} else if(self){

	} else {
		logger.warn("window.goRoute", window.SELF)
		return
	}
	logger.info("window.goRoute inner func path", path)
	checkToShowPlayController()
	return self.props.history.push(path);
}

window.getRoute = () => {
	return window.location.href.replace(/.+#/, "");
}

axios.interceptors.request.use(function (config) {
	const { token, userId } = window.$getState().login
	logger.info("axios.interceptors.request userId", userId)
    if (token) {
		config.headers.Authorization = token;
	}
	if(config.method === 'get'){
		if(/[?]/.test(config.url)){
			config.url = `${config.url}&userId=${userId}`
		} else {
			config.url = `${config.url}?userId=${userId}`
		}
	}
	if(config.method === "post"){
		config.data.userId = userId
	}
    return config;
}, function (err) {
	logger.error("axios.interceptors.request err", err)
    return Promise.reject(err);
})
axios.interceptors.response.use(
	response => {
		return response
	},
	error => {
		if (error.response) {
			if(!error.response.data) {
				alertDebug(`error.response ${error.response}`)
				return logger.error('axios.interceptors.response.use error.response', error.response)
			} else if(!error.response.data.result){
				alertDebug(`error.response.data ${error.response.data}`)
				return logger.error('axios.interceptors.response.use error.response.data', error.response.data)
			}
			switch (error.response.data.result.errCode) {
				case 401:
					window.$dispatch(updateToken(""));
					if(!window.isCordova){
						window.localStorage.removeItem("tk");
					}
					logger.warn("axios.interceptors.response.use  token已过期")
					alertDebug('token已过期')
				default:
					alertDebug(`error.response.data.result.errCode: ${error.response.data.result.errCode}`)
					logger.error(`error.response.data.result.errCode: ${error.response.data.result.errCode}`)
			}
		}
		return Promise.reject(error.response && error.response.data) // 返回接口返回的错误信息
})

window.addEventListener('rejectionhandled', event => {
	if(!window.logger) {
		console.error('rejectionhandled', event.reason)
	} else {
		logger.error('rejectionhandled', event.reason)
	}
})

window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error){
	if(!window.logger){
		console.log('errorMessage: ' + errorMessage); // 异常信息
   		console.log('scriptURI: ' + scriptURI); // 异常文件路径
   		console.log('lineNo: ' + lineNo); // 异常行号
   		console.log('columnNo: ' + columnNo); // 异常列号
   		console.log('error: ' + error); // 异常堆栈信息
	} else {
		logger.error('onerror errorMessage', errorMessage)
	}
}

ReactDOM.render(
	<Provider store={store}>
		<Routers />
	</Provider>,
document.getElementById('root'));
