import React from 'react';
import { connect } from "react-redux";
import { DatePicker, List, Picker, WingBlank, Button, ActionSheet } from 'antd-mobile';
import NavBar from "./child/navbar";
import { getPhotoFunc, saveUserInfoFunc, showHeadPic } from "../logic/myInfo";
import { onBackKeyDown } from "../services/utils";
import address from "../services/address";

const sexData = [
	{   value: "男",
		label: "男"
	},
	{   value: "女",
		label: "女"
	},
];
const minDate = new Date(1919, 1, 1, 0, 0, 0);
const maxDate = new Date(2019, 1, 1, 0, 0, 0);

class UserProfile extends React.Component {

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
        document.removeEventListener("backbutton", onBackKeyDown, false);
		document.addEventListener("deviceready", this.listenBackButton, false);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackButton = () => {
        document.addEventListener("backbutton", this.backToMainPage, false)
    }

    backToMainPage = () => {
		if(this.props.isFromSignPage){
			window.goRoute(this, "/main/sign");
		} else {
			window.goRoute(this, "/main/myInfo");
		}
    }

    setNicknameFunc = () => {
        window.goRoute(this, "/set_nickname");
	}

	setEmailFunc = () => {
		window.goRoute(this, "/set_email");
	}

    setMobileFunc = () => {
        window.goRoute(this, "/set_mobile");
    }

    setSignatureFunc = () => {
        window.goRoute(this, "/set_signature");
    }

    saveUserInfo = (name, info) => {
        saveUserInfoFunc(name, info, this)
    }

	showHeadPicOptions = () => {
		if(window.isCordova){
			const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
			let wrapProps;
			if (isIPhone) {
				wrapProps = {
					onTouchStart: e => e.preventDefault(),
				};
			}
			const BUTTONS = ['相机', '图库', '取消'];
			ActionSheet.showActionSheetWithOptions({
				options: BUTTONS,
				cancelButtonIndex: BUTTONS.length - 1,
				message: '选择图片',
				maskClosable: true,
				'data-seed': 'logId',
				wrapProps,
			},
			(buttonIndex) => {
				if(buttonIndex === 2) return;
				getPhotoFunc(buttonIndex)
			});
		} else {
			alert("暂不支持浏览器上传头像")
		}
	}

	lookBigPic = (e) => {
		e.stopPropagation();
		window.goRoute(this, "/look_head_pic");
	}

    render() {
		let { headPicAddress } = this.state;
        let { username, setNickname, setMobile, setSignature, setSex, setBirthday, setHeadPic, token, setAddress, replaceHeadPic, setEmail } = this.props;
		username = (username && token) ? username : "";
		if(replaceHeadPic){
			headPicAddress = window.serverHost + "/" + setHeadPic
		}
        return (
            <div className="user-profile-container">
                <NavBar centerText="个人信息" backToPreviousPage={this.backToMainPage} />
                <div className="user-profile-content">
                    <List>
						<List.Item style={{height: "60px"}} className="user-profile-header">
							<WingBlank>
								<Button onClick={this.showHeadPicOptions}>头像</Button>
								{setHeadPic ? <img className="user-profile-head-pic" src={headPicAddress} onClick={this.lookBigPic} /> : null}
							</WingBlank>
						</List.Item>
                        <List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.setNicknameFunc} extra={setNickname} >
                            <span style={{ marginLeft: 12 }}>昵称</span>
                        </List.Item>
                        <List.Item style={{height: "60px"}} extra={username} >
                            <span style={{ marginLeft: 12 }}>账号</span>
                        </List.Item>
						<List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.setEmailFunc} extra={setEmail} >
                            <span style={{ marginLeft: 12 }}>邮箱</span>
                        </List.Item>
                        <Picker data={sexData} cols={1} extra={setSex} onOk={sex => this.saveUserInfo("sex", sex)}>
                            <List.Item className="select-sex">性别</List.Item>
                        </Picker>
                        <List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.setMobileFunc} extra={setMobile} >
                            <span style={{ marginLeft: 12 }}>手机号</span>
                        </List.Item>
                        <DatePicker mode="date" title="选择日期" extra={setBirthday} minDate={minDate} maxDate={maxDate} onChange={date => this.saveUserInfo("birthday", date)} >
                            <List.Item className="select-birthday">生日</List.Item>
                        </DatePicker>
                        <List.Item style={{height: "60px"}} arrow="horizontal" onClick={this.setSignatureFunc} extra={setSignature} >
                            <span style={{ marginLeft: 12 }}>个性签名</span>
                        </List.Item>
                        <Picker extra={setAddress}
                            data={address}
                            title="我的地址"
                            onOk={address => this.saveUserInfo('address', address)}
                        >
                            <List.Item className="select-address">我的地址</List.Item>
                        </Picker>
                    </List>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        username: state.login.username,
        setNickname: state.myInfo.setNickname,
        setMobile: state.myInfo.setMobile,
        setSignature: state.myInfo.setSignature,
        setSex: state.myInfo.setSex,
        setBirthday: state.myInfo.setBirthday,
        setHeadPic: state.myInfo.setHeadPic,
        token: state.login.token,
		setAddress: state.myInfo.setAddress,
		isFromSignPage: state.common.isFromSignPage,
		setHeadPicName: state.myInfo.setHeadPicName,
		replaceHeadPic: state.myInfo.replaceHeadPic,
		setEmail: state.myInfo.setEmail,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);

