import React from 'react';
import { connect } from "react-redux";
import StatusBar from "./child/statusBar";
import { List, Badge } from 'antd-mobile';
import { onBackKeyDown } from "../services/utils";
import { showHeadPic } from "../logic/myInfo"
import { hideMusicController } from "../logic/common"

const marginLeft = 12;

class MyInfo extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			headPicAddress: ""
		}
	}

    componentDidMount(){
		let { headPicAddress } = this.state;
		const { setHeadPic, setHeadPicName } = this.props;
		headPicAddress = showHeadPic(setHeadPic, headPicAddress, setHeadPicName);
		this.setState({
			headPicAddress
		})
		document.addEventListener("deviceready", this.listenBackFunc);
		if(this.signatureRef.offsetHeight < 80){
			this.signatureRef.style.display = 'none'
		}
		hideMusicController()
    }

    listenBackFunc = () => {
		document.addEventListener("backbutton", onBackKeyDown, false);
    }

    componentWillUnmount(){
		document.removeEventListener("deviceready", this.listenBackFunc);
		document.removeEventListener("backbutton", onBackKeyDown);
	}

	searchColumn = () => {
        window.goRoute(this, "/search_column");
    }

    gotoSystemSetup = () => {
        window.goRoute(this, "/system_setup");
    }

    setNickname = () => {
		window.goRoute(this, "/set_nickname");
    }

    gotoGamePage = () => {
		window.goRoute(this, "/my_games");
	}

    gotoUserProfile = () => {
		window.goRoute(this, "/user_profile");
    }

    gotoLoginPage = () => {
		window.goRoute(this, "/login");
	}

	gotoNicknamePage = () => {
		window.goRoute(this, '/nickname_page')
	}

	gotoFileDownloadPage = () => {
		window.goRoute(this, '/my_finished_files')
	}

	gotoMusicPage= () => {
		window.goRoute(this, '/my_download_middle_page')
	}

    render() {
		let { headPicAddress } = this.state;
		let { username, token, nickname, signature, setHeadPic, setSystemSetupDot, replaceHeadPic } = this.props;
		const avatarText = nickname || username;
		nickname = nickname || "昵称未设置";
		setSystemSetupDot = setSystemSetupDot ? "inline-block" : "none";
		if(replaceHeadPic){
			headPicAddress = window.serverHost + "/" + setHeadPic
		}
        return (
            <div className="myInfo-container">
                <StatusBar />
				{token
				? <div className="user-info" onClick={this.gotoUserProfile}>
                    <div className="user-pic">
						{setHeadPic
						? 	<img className="user-info-head-pic" src={headPicAddress} />
						:  	<span className="user-head-text">{avatarText.slice(0,1).toUpperCase()}</span>}
                    </div>
                    <div className="user-name">
                        <div className="nickname">{nickname}</div>
                        <div className="username">账号: {username}</div>
                    </div>
                    <div className="right-arrow" onClick={this.backToMainPage}>
                        <i className="fa fa-angle-right" aria-hidden="true"></i>
                    </div>
                </div>
                : <div className="not-login-user" onClick={this.gotoLoginPage}>
                    <div className="not-login-circus">
                        <div className="not-login-inner-circus"></div>
                        <div className="not-login-text">登录</div>
                    </div>
                </div>}
                <div className="user-menu">
                    <List>
                        <List.Item arrow="horizontal" onClick={this.searchColumn}>
							<i className="fa fa-search" aria-hidden="true"></i>
							<span style={{ marginLeft }}>搜索</span>
                        </List.Item>
                    </List>
					<div className="interval"></div>
					<List>
                        <List.Item arrow="horizontal" onClick={this.gotoFileDownloadPage}>
							<i className="fa fa-file" aria-hidden="true"></i>
                        	<span style={{ marginLeft }}>文件</span>
                        </List.Item>
					</List>
					<List>
						<List.Item arrow="horizontal" onClick={this.gotoMusicPage}>
							<i className="fa fa-music" aria-hidden="true"></i>
                    	    <span style={{ marginLeft }}>音乐</span>
                    	</List.Item>
                    </List>
					<div className="interval"></div>
                    <List>
                        <List.Item arrow="horizontal" onClick={this.gotoNicknamePage}>
							<i className="fa fa-quote-right" aria-hidden="true"></i>
                        	<span style={{ marginLeft }}>昵称</span>
                        </List.Item>
					</List>
                    <List>
                        <List.Item arrow="horizontal" onClick={this.gotoGamePage}>
							<i className="fa fa-gamepad" aria-hidden="true"></i>
                        	<span style={{ marginLeft }}>游戏</span>
                        </List.Item>
					</List>
					<div className="interval"></div>
					<List>
						<List.Item arrow="horizontal" onClick={this.gotoSystemSetup} >
                        	<Badge dot style={{display: setSystemSetupDot}}>
                            	<i className="fa fa-cogs" aria-hidden="true"></i>
                        	</Badge>
                        	<span style={{ marginLeft }}>设置</span>
                        </List.Item>
                    </List>
                </div>
                <div className="signature-show-container" ref={ref => this.signatureRef = ref}>
                    <div className="signature-show">{signature}</div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        username: state.login.username,
        token: state.login.token,
        nickname: state.myInfo.setNickname,
        signature: state.myInfo.setSignature,
		setHeadPic: state.myInfo.setHeadPic,
		setSystemSetupDot: state.myInfo.setSystemSetupDot,
		setHeadPicName: state.myInfo.setHeadPicName,
		replaceHeadPic: state.myInfo.replaceHeadPic,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MyInfo);
