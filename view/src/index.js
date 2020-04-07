import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from "react-redux";

import reducer from "./ducks";
import Routers from './router';
import './themes/css/index.less';

window.serverHost = window.config.debug ? (window.config.domain + ":" + window.config.port) :  window.config.domainUrl
window.isDevModel = window.config.dev
window.logger = console

const middleware = [thunk];
const store = createStore(reducer, compose(applyMiddleware(...middleware)));
window.store = store;
window.$dispatch = store.dispatch;
window.$getState = store.getState;
window.$subscribe = store.subscribe;
window.axios = axios;
window.alertOld = window.alert
window.alertDialog = window.alert


window.getRoute = () => {
	return window.location.href.replace(/.+#/, "");
}


window.addEventListener('rejectionhandled', event => {
	logger.error('rejectionhandled', event.reason)
})

window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error){
	logger.error('onerror errorMessage', errorMessage) // 异常信息
	logger.error('onerror scriptURI: ' + scriptURI); // 异常文件路径
	logger.error('onerror lineNo: ' + lineNo); // 异常行号
	logger.error('onerror columnNo: ' + columnNo); // 异常列号
	logger.error('onerror error: ' + error); // 异常堆栈信息
}

ReactDOM.render(
	<Provider store={store}>
		<Routers />
	</Provider>,
document.getElementById('root'));
