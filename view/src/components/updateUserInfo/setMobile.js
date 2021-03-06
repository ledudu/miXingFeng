import React from 'react';
import { connect } from "react-redux";
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import { updateSetTempMobile } from "../../ducks/myInfo";
import NavBar from "../child/navbar";
import { updateRegisterFromLogin } from "../../ducks/login"

class SetMobile extends React.Component {

    backToMainPage = () => {
		const { token } = this.props
		if(!token){
			$dispatch(updateRegisterFromLogin(false))
			window.goRoute(this, "/login")
		} else {
			window.goRoute(this, "/user_profile");
		}
    }

    render() {
        let { setMobile, registerFromLogin } = this.props;
        setMobile = setMobile ? setMobile : "请输入手机号"
        return (
            <div>
                <NavBar centerText='填写手机号' backToPreviousPage={this.backToMainPage} />
				<UpdateUserInfoComponent
					pageTitle="填写手机号"
					placeholder={setMobile}
					infoLength={13}
					infoErrorTip="手机号错误，请检查"
					updateUserInfoDispatch={updateSetTempMobile}
					name="mobile"
					backToMainPage={this.backToMainPage}
					self={this}
					registerFromLogin={registerFromLogin}
				/>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setMobile: state.myInfo.setMobile,
		registerFromLogin: state.login.registerFromLogin,
		token: state.login.token
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SetMobile);
