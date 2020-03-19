import React from 'react';
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import {updateUsername} from "../../ducks/login";
import NavBar from "../child/navbar";

function backToMainPage(){
	window.goRoute(this, "/user_profile");
}

const SetUsername = function(){
	return (
		<div>
            <NavBar centerText="设置用户名" backToPreviousPage={backToMainPage} />
			<UpdateUserInfoComponent
				pageTitle="设置用户名"
				placeholder="用户名可用于登录，全网唯一，设置后不可修改"
				infoLength={32}
				infoErrorTip="用户名不允许超过32个字"
				updateUserInfoDispatch={updateUsername}
				name="setUsername"
				backToMainPage={backToMainPage}
			/>
        </div>
	)
}

export default SetUsername
