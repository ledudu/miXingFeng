import React from 'react';
import { connect } from "react-redux";
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import { updateSetTempEmail } from "../../ducks/myInfo";
import NavBar from "../child/navbar";

class SetEmail extends React.Component {

    backToMainPage = () => {
        let { token } = this.props;
        if(token){
            window.goRoute(this, "/user_profile");
        } else {
            window.goRoute(this, "/main/myInfo");
        }
    }

    gotoLoginPage = () => {
        window.goRoute(this, "/login")
    }

    render() {
        let { setEmail } = this.props;
		setEmail = setEmail ? setEmail : "请输入邮箱";
		const self = this;
        return (
            <div>
                <NavBar centerText="填写邮箱" backToPreviousPage={this.backToMainPage} />
				<UpdateUserInfoComponent
					pageTitle="填写邮箱"
					placeholder={setEmail}
					infoLength={32}
					infoErrorTip="邮箱不允许超过32位"
					updateUserInfoDispatch={updateSetTempEmail}
					name="email"
					backToMainPage={this.backToMainPage}
					gotoLoginPage={this.gotoLoginPage}
					self={self}
				/>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setEmail: state.myInfo.setEmail,
		token: state.login.token
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SetEmail);
