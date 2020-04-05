import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import InputComponent from "./child/inputComponent"
import { loginApp } from "../logic/login";
import { HTTP_URL } from "../constants/httpRoute";
import { autoLogin } from "../logic/common"
import { updateRegisterFromLogin, updateUserId, updateToken, updatePassword, updateIsFromLoginPage, updateLogOutFlag } from "../ducks/login"
import { backToPreviousPage, generateRandomUserId, replaceSocketLink } from "../services/utils";
import { updateCarrierOperator, updateSetMobile } from "../ducks/myInfo"

class Login extends Component {

    constructor(props){
		super(props);
		const username = localStorage.getItem("username")
		const mobile = localStorage.getItem("mobile")
		const email = localStorage.getItem("email")
        this.state = {
			username: username || mobile || email || "",
			showAsPassword: "password",
			loginStatus: "登录"
		}
		this.loginUsernameRef = createRef();
		this.loginPasswordRef = createRef();
	}

    componentDidMount(){
		document.addEventListener("deviceready", this.listenBackButton, false);
		if (this.props.logOutFlag) {
			//  为了加快注销速度，把更换websocket id的任务放在注销后跳往登录的逻辑里
			const original = this.props.userId || ""
			const newOne = generateRandomUserId()
			$dispatch(updateUserId(newOne))
			localStorage.setItem("oldUserId", newOne)
			logger.info("Login replace userId original, newOne", original, newOne)
			const data = {
				original,
				newOne
			}
			replaceSocketLink(data, 'logout case')
			$dispatch(updateLogOutFlag(false));
		}
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
		document.removeEventListener("backbutton", this.backKeyDownToPrevious);
    }

    listenBackButton = () => {
		if(window.isCordova){
			JGJVerificationPlugin.setDebugMode(true);
			JGJVerificationPlugin.init();
		}
        document.addEventListener("backbutton", this.backKeyDownToPrevious, false);
    }

    keyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			this.loginUsernameRef.current.blur()
			this.loginPasswordRef.current.blur()
            this.login();
        }
    }

    login = () => {
        loginApp(this.state.username, this.props.password, this);
	}

	backKeyDownToPrevious = () => {
		backToPreviousPage(this, "/main/sign", {specialBack: true});
	}

    backToMain = () => {
		backToPreviousPage(this, "/main/sign");
    }

	setUsername = (e) => {
		const username = e ? e.target.value : "";
		this.setState({
			username
		})
		this.loginUsernameRef.current.click()
	}

	setPassword = (e) => {
		$dispatch(updatePassword(e.target.value || ""))
		this.loginPasswordRef.current.click()
	}

	showOrHidePassword = () => {
		if(this.state.showAsPassword === "password"){
			this.setState({
				showAsPassword: "text"
			}, () => {
				this.faEyeRef.style.color = "#fff"
			})
		} else {
			this.setState({
				showAsPassword: "password"
			}, () => {
				this.faEyeRef.style.color = "#000"
			})
		}
	}

	register = () => {
		if(window.isCordova){
			let json = {
				setPrivacyState: true,
				setPrivacyTextSize: 12,
				setPrivacyCheckboxSize: 14,
				setLogBtnText: "本机号码一键登录"
			}
			json = JSON.stringify(json);
			JGJVerificationPlugin.setCustomUIWithConfig(json);
			JGJVerificationPlugin.loginAuth(true, function(response){
				// {"code":6000,"content":"ok","operator":"CM"}
				response = JSON.parse(response)
				logger.info("loginAuth response", response)
				if(response.code !== 6000 && response.code !== 6002){
					logger.warn("一键登录失败 response", response)
					logger.warn("一键登录失败 response.code", response.code)
					// return alertDialog("登录失败，请稍后重试")
					$dispatch(updateRegisterFromLogin(true))
					window.goRoute(this, "/set_mobile")
				} else if(response.code === 6000){
					let mobileCarrierOperator = ""
					if(response.operator === "CM"){
						mobileCarrierOperator = "中国移动"
					} else if(response.operator === "CU"){
						mobileCarrierOperator = "中国联通"
					} else if(response.operator === "CT"){
						mobileCarrierOperator = "中国电信"
					}
					$dispatch(updateCarrierOperator(mobileCarrierOperator))
					const { userId } = $getState().login
					const data = {
						JVerifyToken: response.content,
						userId,
						mobileCarrierOperator
					}
					logger.info("register jiGuangVerify data", data)
					return axios.post(HTTP_URL.jiGuangVerify, data)
						.then((response) => {
							const { result } = response.data
							logger.info("login register jiGuangVerify result", result)
							const { mobile } = result
							$dispatch(updateToken(result.token))
							$dispatch(updateSetMobile(mobile))
							if(result.response === "register_success"){
								$dispatch(updateIsFromLoginPage(true))
								window.goRoute(this, "/register")
							} else if(result.response === "existed"){
								$dispatch(updateIsFromLoginPage(true))
								window.goRoute(this, "/main/sign")
								return autoLogin(result.token)
							} else {
								logger.error("login register jiGuangVerify  not success result", result)
								return alertDialog("登录超时，请稍后重试")
							}
						})
						.catch((err) => {
							logger.error("login register jiGuangVerify  catch error", err)
							return alertDialog("登录超时，请稍后重试")
						})
				}
			}, (result) => {
				// {"code":1,"content":"login activity closed."}
				logger.info("loginAuth result", result)
			})
		} else {
			$dispatch(updateRegisterFromLogin(true))
			window.goRoute(this, "/set_mobile")
		}
	}

    render() {
		const { username, showAsPassword, loginStatus } = this.state;
		const { password } = this.props
        return (
            <div className="first-page">
                <div className="pic-blur"></div>
                <div className="top">
                    <div className="sign-text">签到</div>
                    <div className="record-life">记录生活每一天</div>
                </div>
                <div className="index">
                    <div className="head">欢迎登录觅星峰</div>
                    <div className="main">
                        <div className="input-content">
                            <div className="content">
								<InputComponent
									value={username}
									size="26"
									placeholder="用户名/手机号/邮箱"
									handleChange={this.setUsername}
									handleKeyDown={this.keyDownEvent}
									ref={this.loginUsernameRef}
									className="login-page"
								/>
								<i className="fa fa-user fa-inverse" aria-hidden="true"></i>
                                <div className="login-center-input-text">账号</div>
								<i className="fa fa-times-circle-o" aria-hidden="true" onClick={() => this.setUsername()}></i>
                            </div>
                        </div>
                        <div className="input-content">
                            <div className="content">
								<InputComponent
									type={showAsPassword}
									value={password}
									size="26"
									placeholder="请输入登录密码"
									handleChange={this.setPassword}
									handleKeyDown={this.keyDownEvent}
									ref={this.loginPasswordRef}
									className="login-page"
								/>
								<i className="fa fa-spoon fa-inverse" aria-hidden="true"></i>
                                <div className="login-center-input-text">密码</div>
								<i className="fa fa-eye" ref={ref => this.faEyeRef = ref} aria-hidden="true" onClick={this.showOrHidePassword} ></i>
                            </div>
                        </div>
                        <div className="login-btn">
                            <div className="button" onClick={this.login}>{loginStatus}</div>
                        </div>
                    </div>
                    <div className="foot">
                        <span onClick={this.register}>
                            {window.isCordova ? '一键登录' : "注册"}
                        </span>
                        <Link to="/forget_password">
                            忘记密码
                        </Link>
                    </div>
                </div>
                <div className="back-btn" >
                    <Link to="/main/sign">
                        返回
                    </Link>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
		password: state.login.password,
		token: state.login.token,
		logOutFlag: state.login.logOutFlag,
		userId: state.login.userId,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
