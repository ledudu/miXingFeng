import React from 'react';
import { connect } from "react-redux";
import UpdateUserInfoComponent from "./updateUserInfoComponent";
import { updateSetMobile } from "../../ducks/myInfo";
import NavBar from "../child/navbar";

class SetMobile extends React.Component {

    backToMainPage = () => {
        window.goRoute(this, "/user_profile");
    }

    render() {
        let { setMobile } = this.props;
        setMobile = setMobile ? setMobile : "请输入手机号"
        return (
            <div>
                <NavBar centerText='填写手机号' backToPreviousPage={this.backToMainPage} />
                <UpdateUserInfoComponent pageTitle="填写手机号" placeholder={setMobile} infoLength={13} infoErrorTip="手机号错误，请检查" updateUserInfoDispatch={updateSetMobile} name="mobile" backToMainPage={this.backToMainPage}/>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setMobile: state.myInfo.setMobile
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SetMobile);
