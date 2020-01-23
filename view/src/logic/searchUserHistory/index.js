import axios from 'axios';
import { HTTP_URL } from "../../constants/httpRoute";
import { networkErr } from "../../services/utils";
import { updateSearchString } from "../../ducks/searchUserHistory";

export const searchFunc = (username="", slice) => {
    if(!username) return Promise.resolve();
    window.logger.info("userClick searchString", username);
	window.$dispatch(updateSearchString(username));
	let url = ""
	if(!slice){
		url =  HTTP_URL.searchPosition + username + `&positiveUsername=${window.localStorage.getItem("userId")}`;
		if(username === $getState().login.username){
			const obj = {
				positionText: $getState().common.currentLocation,
				status: "在线"
			}
			return Promise.resolve(obj);
		}
	} else {
		url = HTTP_URL.searchRecord + username + '&slice=' + slice
	}
    return axios.get(url)
        .then(response => {
			if(response.data.result && response.data.result.signData){
				window.logger.info("searchRecord  response.data", response.data.result.signData.length);
			}
            return Promise.resolve(response.data.result);
        })
        .catch(err => {
            networkErr(err);
        })
}

export const checkLogFunc = () => {
    return axios.get(HTTP_URL.checkLog)
        .then((response) => {
            window.$('#check-log').html(response.data);
        })
}
