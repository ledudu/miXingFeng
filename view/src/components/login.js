import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { loginApp, dealtWithLoginIn} from "../logic/login";
import { HTTP_URL } from "../constants/httpRoute";
import { reconnectSocket } from "../logic/common"
import { updateIsFromLoginPage, updateRegisterFromLogin } from "../ducks/login"

class Login extends Component {

    constructor(props){
        super(props);
        this.state = {
            usernamePlaceholder: "用户名/手机号/邮箱",
			passwordPlaceholder: "请输入登录密码",
			username: this.props.username || "",
			password: this.props.password || "",
			showAsPassword: "password"
		}
		window.$dispatch(updateIsFromLoginPage(true));
		if (this.props.logOutFlag) {
			//  为了加快注销速度，把更换websocket id的任务放在注销后跳往登录的逻辑里
			const original = window.localStorage.getItem("userId");
			const newOne = window.localStorage ?
				"ls" + Math.random().toString(36).slice(2, 6) :
				"no_ls" + Math.random().toString(36).slice(2, 6)
			window.localStorage.removeItem("userId");
			window.localStorage.setItem("userId", newOne);
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
        if(window.isCordova){
			StatusBar.overlaysWebView(false);
        }
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMain);
    }

    listenBackButton = () => {
		StatusBar.overlaysWebView(true);
        document.addEventListener("backbutton", this.backToMain, false);
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

    backToMain = () => {
        window.goRoute(this, "/main/sign")
    }

    focus = (elem) => {
        if(elem === 'username'){
			if(this.state.username) $("i.fa-times-circle-o").fadeIn()
            this.setState({
                usernamePlaceholder: ""
			});
        } else {
			if(this.state.password) $("i.fa-eye").fadeIn()
            this.setState({
                passwordPlaceholder: ""
			});
        }
    }

    blur = (elem) => {
        if(elem === 'username'){
            this.setState({
                usernamePlaceholder: "用户名/手机号/邮箱"
			});
			// $("i.fa-times-circle-o").fadeOut()
        } else {
            this.setState({
                passwordPlaceholder: "请输入登录密码"
			});
			// $("i.fa-eye").fadeOut()
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
		$dispatch(updateRegisterFromLogin(true))
		window.goRoute(this, "/set_mobile")
	}

    render() {
        let { usernamePlaceholder, passwordPlaceholder, username, password, showAsPassword } = this.state;
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
									placeholder={usernamePlaceholder} className="form" size="26" value={username}
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
									placeholder={passwordPlaceholder} className="form" value={password}
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
                            注册用户名
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
		logOutFlag: state.login.logOutFlag
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
