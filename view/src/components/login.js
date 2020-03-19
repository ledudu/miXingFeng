import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { loginApp, dealtWithLoginIn} from "../logic/login";
import { HTTP_URL } from "../constants/httpRoute";
import { reconnectSocket, autoLogin } from "../logic/common"
import { updateIsFromLoginPage, updateRegisterFromLogin, updateUserId, updateToken } from "../ducks/login"
import { backToPreviousPage, alertDialog } from "../services/utils";
import { updateCarrierOperator, updateSetMobile } from "../ducks/myInfo"

class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
			username: this.props.username || "",
			password: this.props.password || "",
			showAsPassword: "password"
		}
		window.$dispatch(updateIsFromLoginPage(true));
		if (this.props.logOutFlag) {
			//  为了加快注销速度，把更换websocket id的任务放在注销后跳往登录的逻辑里
			const original = this.props.userId;
			const newOne = window.localStorage ?
				"ls" + Math.random().toString(36).slice(2, 6) :
				"no_ls" + Math.random().toString(36).slice(2, 6)
			window.localStorage.removeItem("userId");
			window.localStorage.setItem("userId", newOne);
			$dispatch(updateUserId(newOne))
			logger.info("Login replace userId original, newOne", original, newOne)
			const data = {
				original,
				newOne
			}
			axios.post(HTTP_URL.replaceSocketLink, data)
				.then(response => {
					if (response.data.result.response === "success") {
						logger.info("logout success and reconnect websocket")
						reconnectSocket()
					}
				})
		}
	}

    componentDidMount(){
		document.addEventListener("deviceready", this.listenBackButton, false);
		const { username, password } = this.props;
		this.setState({
			username,
			password
		})
		$('.login-btn .button').on("touchstart", function () {
			$(this).addClass("active");
		});
		$('.login-btn .button').on("touchend", function () {
			$(this).removeClass("active");
		})
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
            $('#login-username').blur();
            $('#login-password').blur();
            this.login();
        }
    }

    login = () => {
        loginApp(this, this.state.username, this.state.password);
	}

	backKeyDownToPrevious = () => {
		backToPreviousPage(this, "/main/sign", {specialBack: true});
	}

    backToMain = () => {
		backToPreviousPage(this, "/main/sign");
    }

    focus = (elem) => {
        if(elem === 'username'){
			if(this.state.username) $("i.fa-times-circle-o").fadeIn()
        } else {
			if(this.state.password) $("i.fa-eye").fadeIn()
        }
    }

    blur = (elem) => {
        if(elem === 'username'){
			$("i.fa-times-circle-o").fadeOut()
        } else {
			$("i.fa-eye").fadeOut()
        }
	}

	setUsername = (e) => {
		const username = e ? e.target.value : "";
		if(username){
			$("i.fa-times-circle-o").fadeIn()
		}
		this.setState({
			username
		}, () => {
			if(!username){
				$("#login-username").click();
				$("i.fa-times-circle-o").fadeOut()
			}
		})
	}

	setPassword = (e) => {
		if(e.target.value){
			$("i.fa-eye").fadeIn()
		}
		this.setState({
			password: e.target.value || ""
		})
	}

	showOrHidePassword = () => {
		if(this.state.showAsPassword === "password"){
			this.setState({
				showAsPassword: "text"
			}, () => {
				$("i.fa-eye").css("color", "#fff")
			})
		} else {
			this.setState({
				showAsPassword: "password"
			}, () => {
				$("i.fa-eye").css("color", "#000")
			})
		}
	}

	wechatLogin = () => {
		//须获得微信开发者认证才可以调用微信登录接口，暂时屏蔽代码片段
		Wechat.isInstalled(function (installed) {
			logger.info("Wechat installed: " + (installed ? "Yes" : "No"));
			var scope = "snsapi_userinfo",
				state = "_" + (+new Date());
			Wechat.auth(scope, state, function (response) {
				logger.info("wechatLogin response", response)
				alert(JSON.stringify(response));
				const data = {code: response.code, env: "weapp", fromApp: true}
				return axios.get(HTTP_URL.thirdLogin.format(data))
					.then((response) => {
						const data = response.data;
						if(data.status === 'SUCCESS'){
							dealtWithLoginIn(data.result, {}, this)
						} else {
							logger.error("HTTP_URL.thirdLogin data", data)
							alert("登录异常，请稍后重试")
						}
					})
			}, function (reason) {
				logger.error("wechatLogin auth Failed response", reason)
    			alert("Failed: " + reason);
		});
		}, function (reason) {
			logger.info("wechatLogin isInstalled Failed reason: " + reason);
			alert("请先安装微信")
		});
	}

	register = () => {
		if(window.isCordova){
			let json = {
				setPrivacyState:true,
				setPrivacyTextSize: 14,
				setPrivacyCheckboxSize: 16
			}
			json = JSON.stringify(json);
			JGJVerificationPlugin.setCustomUIWithConfig(json);
			JGJVerificationPlugin.loginAuth(true, function(response){
				// {"code":6000,"content":"ok","operator":"CM"}
				logger.info("loginAuth response1", response)
				logger.info('typeof(response)', typeof(response))
				// alertDebug(response)
				response = JSON.parse(response)
				logger.info("loginAuth response", response)
				if(response.code !== 6000 && response.code !== 6002){
					logger.warn("一键登录失败 response", response)
					logger.warn("一键登录失败 response.code", response.code)
					return alertDialog("登录失败，请稍后重试")
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
							$dispatch(updateUserId(mobile))
							window.localStorage.setItem("userId", mobile);
							if(result.response === "register_success"){
								window.goRoute(this, "/register")
							} else if(result.response === "existed"){
								window.goRoute(this, "/main/sign")
								return autoLogin(result.token, this)
							} else {
								logger.error("login register jiGuangVerify  not success result", result)
								return alertDialog("登录失败，请稍后重试"+JSON.stringify(result))
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
        let { username, password, showAsPassword } = this.state;
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
								<input type="text" id="login-username" name="username"
									placeholder="用户名/手机号/邮箱" className="form" size="26" value={username}
									onKeyDown={this.keyDownEvent} onFocus={(e) => this.focus(e, "username")}
									onBlur={() => this.blur("username")}
									onChange={this.setUsername}
									autoComplete="off"/>
								<i className="fa fa-user fa-inverse" aria-hidden="true"></i>
                                <div className="login-center-input-text">账号</div>
								<i className="fa fa-times-circle-o" aria-hidden="true" onClick={() => this.setUsername()}></i>
                            </div>
                        </div>
                        <div className="input-content">
                            <div className="content">
								<input name="password" id="login-password" type={showAsPassword}
									placeholder="请输入登录密码" className="form" value={password}
									onKeyDown={this.keyDownEvent}
									onFocus={() => this.focus("password")} onBlur={() => this.blur("password")}
									onChange={this.setPassword}/>
								<i className="fa fa-spoon fa-inverse" aria-hidden="true"></i>
                                <div className="login-center-input-text">密码</div>
								<i className="fa fa-eye" aria-hidden="true" onClick={this.showOrHidePassword} ></i>
                            </div>
                        </div>
                        <div className="login-btn">
                            <div className="button" id="loginButton" value="登录" onClick={this.login}>登录</div>
                        </div>
                    </div>
                    <div className="foot">
                        <span onClick={this.register}>
                            {window.isCordova ? '一键登录' : "注册用户名"}
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
		username: state.login.username,
		password: state.login.password,
		token: state.login.token,
		logOutFlag: state.login.logOutFlag,
		userId: state.login.userId,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
