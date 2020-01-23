import React from 'react';
import { connect } from "react-redux";
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import { updateSignature } from "../../ducks/myInfo";
import NavBar from "../child/navbar";

class SetSignature extends React.Component {

    backToMainPage = () => {
        window.goRoute(this, "/user_profile");
    }

    render() {
        let { setSignature } = this.props;
        setSignature = setSignature ? setSignature : "请输入签名";
        return (
            <div>
                <NavBar centerText='设置签名' backToPreviousPage={this.backToMainPage} />
                <UpdateUserInfoComponent pageTitle="设置签名" placeholder={setSignature} infoLength={35} infoErrorTip="签名不允许超过35个字" updateUserInfoDispatch={updateSignature} name="signature" backToMainPage={this.backToMainPage} />
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setSignature: state.myInfo.setSignature
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SetSignature);
