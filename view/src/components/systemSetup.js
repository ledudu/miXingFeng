import React, { Fragment } from 'react';
import { connect } from "react-redux";
import { List, Button, Badge } from 'antd-mobile';
import NavBar from "./child/navbar";
import { logoutApp } from "../logic/common/index";
import { exitApp, backToPreviousPage } from "../services/utils"
import { updateDirectShowSignPage } from "../ducks/sign";
import { updateHideNavBar, updateSavedCurrentRoute, updateIsFromSystemSetup } from "../ducks/common"

class SystemSetup extends React.Component {

	componentDidMount(){
		$dispatch(updateHideNavBar(false))
		$dispatch(updateDirectShowSignPage(true))
        document.addEventListener("deviceready", this.listenBackButton, false);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backKeyDownToPrevious);
    }

    listenBackButton = () => {
        document.addEventListener("backbutton", this.backKeyDownToPrevious, false)
	}

	backKeyDownToPrevious = () => {
		backToPreviousPage(this, "/main/myInfo", {specialBack: true});
	}

    backToMainPage = () => {
        backToPreviousPage(this, "/main/myInfo");
    }

    logoutApp = async() => {
        await logoutApp(this);
    }

    quitApp = () => {
        exitApp()
    }



	gotoAdsPage = () => {
		$dispatch(updateIsFromSystemSetup(true))
		$dispatch(updateSavedCurrentRoute(window.getRoute()))
		$dispatch(updateHideNavBar(true))
		$dispatch(updateDirectShowSignPage(false))
		window.goRoute(this, "/main/sign");
	}

	resetPassword = () => {
		if(this.props.token){
			window.goRoute(this, "/reset_password_sys");
		} else {
			window.goRoute(this, "/reset_password");
		}
	}

	loginRecord = () => {
		window.goRoute(this, "/login_record");
	}

	notification = () => {
		window.goRoute(this, "/notification");
	}

	gotoAboutPage = () => {
        window.goRoute(this, "/about");
	}

	gotoFeedbackPage = () => {
		window.goRoute(this, "/feedback");
	}

    render() {
		let { token, setSystemSetupDot } = this.props;
		setSystemSetupDot = setSystemSetupDot ? "new" : "";
        return (
            <div className="system-container">
                <NavBar centerText="设置" backToPreviousPage={this.backToMainPage} />
                <div className="system-content">
					<List>
						<List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.gotoAdsPage}>
							<span style={{ marginLeft: 12 }}>查看封面</span>
                        </List.Item>
						{window.isCordova
						? 	<Fragment>
								{token && <List.Item style={{height: "60px"}} onClick={this.loginRecord} className="special-badge" arrow="horizontal" >
									<span style={{ marginLeft: 12 }}>登录记录</span>
								</List.Item>}
							</Fragment>
						: null}
						<List.Item style={{height: "60px"}} onClick={this.notification} className="special-badge" arrow="horizontal" >
							<span style={{ marginLeft: 12 }}>通知和权限</span>
						</List.Item>
						<List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.gotoAboutPage} >
                        	<span style={{ marginLeft: 12 }}>关于</span>
							&nbsp;&nbsp;
							<Badge text={setSystemSetupDot && 'new'}/>
                        </List.Item>
						<List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.gotoFeedbackPage}>
                        	<span style={{ marginLeft: 12 }}>反馈</span>
                        </List.Item>
						{
							token && <List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.resetPassword}>
								<span style={{ marginLeft: 12 }}>重置密码</span>
                        	</List.Item>
						}
                        {token ? <List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.logoutApp}>
							<span style={{ marginLeft: 12 }}>退出登录</span>
                        </List.Item> : null}
                    </List>
                    {window.isCordova ? <div className="quit-button" onClick={this.quitApp}>
                        <Button type="warning" className="button" value="退出">退出</Button>
                    </div> : null}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		token: state.login.token,
		setSystemSetupDot: state.myInfo.setSystemSetupDot,
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SystemSetup);
