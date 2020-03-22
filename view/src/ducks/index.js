/**
 * 使用Map合并Reducer
 */
import {
	combineReducers
} from "redux";

import sign from "./sign";
import login from "./login";
import common from "./common";
import fileServer from "./fileServer";
import myInfo from "./myInfo";

let reducersMap = {
	sign: {
		sign
	},
	login: {
		login
	},
	common: {
		common
	},
	fileServer: {
		fileServer
	},
	myInfo: {
		myInfo
	}
};

export default combineReducers({
	...Object.keys(reducersMap).reduce(
		(item, total) =>
		Object.assign({}, item, {
			[total]: (state, action) => {
				if (!state) {
					return Object.keys(reducersMap[total])
						.map(i => reducersMap[total][i](state, action))
						.reduce((prev, next) => Object.assign({}, prev, next), {});
				} else {
					Object.keys(reducersMap[total]).map(i => {
						return state = Object.assign({}, state, reducersMap[total][i](state, action));
					});
					return state;
				}
			}
		}), {}
	)
});
