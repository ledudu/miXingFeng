import React from 'react';
import { connect } from "react-redux";
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import {updateSetNickname} from "../../ducks/myInfo";
import NavBar from "../child/navbar";

class SetNickname extends React.Component {

    backToMainPage = () => {
        let { token } = this.props;
        if(token){
            window.goRoute(this, "/user_profile");
        } else {
            window.goRoute(this, "/main/myInfo");
        }
    }

    render() {
        let { setNickname } = this.props;
        setNickname = setNickname ? setNickname : "最多10个字";
        return (
            <div>
                <NavBar centerText="设置昵称" backToPreviousPage={this.backToMainPage} />
                <UpdateUserInfoComponent pageTitle="设置昵称" placeholder={setNickname} infoLength={10} infoErrorTip="昵称不允许超过10个字" updateUserInfoDispatch={updateSetNickname} name="nickname" backToMainPage={this.backToMainPage} />
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setNickname: state.myInfo.setNickname,
		token: state.login.token
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SetNickname);
