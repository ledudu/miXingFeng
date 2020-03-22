import React, { Fragment } from 'react';
import { connect } from "react-redux";
import { Toast } from "antd-mobile";
import NavBar from "../child/navbar";
import { networkErr } from "../../services/utils";
import { HTTP_URL } from "../../constants/httpRoute";
import { updateSetEmail, updateSetMobile } from "../../ducks/myInfo";
import { updateToken, updateHasForgetPassword, updateRegisterFromLogin, updateForgetPasswordToken, updateUserId } from "../../ducks/login";
import { CONSTANT } from "../../constants/enumeration";

const keyCode = [
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57,  //数字键
	96, 97, 98, 99, 100, 101, 102, 103, 104, 105,// 数字键盘上的键
	229 //手机键盘
]

class CheckEmailOrMobile extends React.Component {

	constructor(props){
		super(props)
		this.isEmail = props.type === "email"
		this.isMobile = props.type === "mobile"
	}

	componentDidMount(){
		this[`inputValueRef1`].style.borderBottom = "1px solid red"
		this.inputValueRef1.focus()
	}

    backToMainPage = () => {
		const { forgetPasswordToken, registerFromLogin, self } = this.props
		if(this.isEmail){
			if(forgetPasswordToken){
				$dispatch(updateForgetPasswordToken(""))
				window.goRoute(self, "/forget_password");
			} else {
				window.goRoute(self, "/set_email");
			}
		} else if(this.isMobile) {
			if(forgetPasswordToken){  // 忘记密码场景
				$dispatch(updateForgetPasswordToken(""))
				window.goRoute(self, "/forget_password");
			} else if(registerFromLogin){  //注册场景
				window.goRoute(self, "/set_mobile");
			} else {  // 个人中心更改手机号场景
				window.goRoute(self, "/set_mobile");
			}
		}
	}

	switchNextInput = (e, number) => {
		if(e.keyCode === 8) {
			if(!this[`inputValueRef${number}`].value & number !== 1) {
				const previous = --number
				this[`inputValueRef${previous}`].value = ""
				this[`inputValueRef${previous}`].focus()
				this.clearInputColor()
				this[`inputValueRef${previous}`].style.borderBottom = "1px solid red"
			}
			return;
		}
		const value1 = this.inputValueRef1.value
		const value2 = this.inputValueRef2.value
		const value3 = this.inputValueRef3.value
		const value4 = this.inputValueRef4.value
		if(value1 && value2 && value3 && value4){
			this.submit()
		} else if(number !== 4 && keyCode.includes(e.keyCode)) {
			//  输入框获取到值比这个事件要迟一点，所以为了取到刚刚输入的值，这里需要一个延迟
			setTimeout(() => {
				const value1 = this.inputValueRef1.value
				const value2 = this.inputValueRef2.value
				const value3 = this.inputValueRef3.value
				const value4 = this.inputValueRef4.value
				if(value1 && value2 && value3 && value4){
					this.submit()
				} else {
					this[`inputValueRef${++number}`].focus()
					this.clearInputColor()
					this[`inputValueRef${number}`].style.borderBottom = "1px solid red"
				}
			}, 10)
		} else {
			setTimeout(() => {
				const value1 = this.inputValueRef1.value
				const value2 = this.inputValueRef2.value
				const value3 = this.inputValueRef3.value
				const value4 = this.inputValueRef4.value
				if(value1 && value2 && value3 && value4){
					this.submit()
				}
			}, 10)
		}
	}

	clearInputColor = () => {
		this.inputValueRef1.style.borderBottom = "1px solid #000"
		this.inputValueRef2.style.borderBottom = "1px solid #000"
		this.inputValueRef3.style.borderBottom = "1px solid #000"
		this.inputValueRef4.style.borderBottom = "1px solid #000"
	}

	submit = () => {
		const value1 = this.inputValueRef1.value
		const value2 = this.inputValueRef2.value
		const value3 = this.inputValueRef3.value
		const value4 = this.inputValueRef4.value
		const value = (value1 + value2 + value3 + value4)
		const { username, setTempEmail, setTempMobile, hasForgetPassword, registerFromLogin, self, token, forgetPasswordToken, setMobile } = this.props
		logger.info("checkEmail submit value", value)
		if(!this.startToSubmit){
			this.startToSubmit = true
			Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
			const checkUrl = this.isEmail
				? HTTP_URL.checkEmailValid.format({value, username: username || setMobile, email: setTempEmail, mobile: setMobile})
				: this.isMobile
				? HTTP_URL.checkMobileValid.format({value, username, mobile: setTempMobile || setMobile, registerFromLogin: registerFromLogin || forgetPasswordToken})
				: null
			if(!checkUrl) return
			return axios.get(checkUrl)
				.then((response) => {
					Toast.hide();
					const result = response.data.result
					if(result.response === "modify_success"){
						if(this.isEmail){
							$dispatch(updateSetEmail(setTempEmail))
							if(hasForgetPassword){
								// 忘记密码
								$dispatch(updateHasForgetPassword(false))
								window.goRoute(self, "/reset_password_sys")
							} else {
								// 个人中心设置邮箱，因为可能没有username，所以可能没有token下发
								if(result.token) $dispatch(updateToken(result.token));
								alert("设置成功")
								window.goRoute(self, "/user_profile")
							}
						} else if(this.isMobile){
							const { username } = this.props
							if(!username){
								$dispatch(updateUserId(setTempMobile));
							}
							$dispatch(updateSetMobile(setTempMobile))
							// 手机号可作为token的依据，所以这里一定有token
							$dispatch(updateToken(result.token));
							// 个人中心设置手机号
							alert("设置成功")
							window.goRoute(self, "/user_profile")
						}
					} else if(result.response === "no_username_or_value"){
						return alert("没有用户名或验证码或邮箱")
					} else if(result.response === "code_wrong"){
						return alert("验证码错误")
					} else if(result.response === "check_mobile_success"){
						$dispatch(updateRegisterFromLogin(false))
						$dispatch(updateToken(result.token));
						$dispatch(updateSetMobile(setTempMobile));
						$dispatch(updateUserId(setTempMobile));
						if(forgetPasswordToken){
							// 忘记密码
							window.goRoute(self, "/reset_password_sys")
						} else {
							// 手机号注册
							window.goRoute(self, "/register")
						}
					} else if(result.response === "illegal_mobile"){
						return alert("手机号错误")
					} else if(result.response === "no_username_or_value_or_mobile"){
						return alert("没有用户名或验证码或手机号")
					} else if(result.response === "code_wrong"){
						return alert("验证码错误")
					} else {
						return alert("设置失败")
					}
				})
				.catch(err => {
					Toast.hide();
					return networkErr(err, this.isEmail ? "checkEmailValid" : "checkMobileValid");
				})
				.finally(() => {
					this.startToSubmit = false
				})
		}

	}

    render() {
		const { setTempEmail, setTempMobile } = this.props;
        return (
            <div className="check-email-input-container">
                <NavBar centerText="填写验证码" backToPreviousPage={this.backToMainPage} />
				<div className="check-email-input-content">
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef1 = ref} onKeyDown={(e) => this.switchNextInput(e, 1)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef2 = ref} onKeyDown={(e) => this.switchNextInput(e, 2)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef3 = ref} onKeyDown={(e) => this.switchNextInput(e, 3)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef4 = ref} onKeyDown={(e) => this.switchNextInput(e, 4)} />
				</div>
				{
					this.isEmail
					?	<Fragment>
							<div className="tips">提示：设置邮箱可用于找回密码, 验证码10分钟有效;
							<br/>
							您刚输入的邮箱：<strong>{setTempEmail}</strong>
							<br/>
							如果收件箱找不到邮件，请检查邮件是否被邮箱拦截。 </div>
						</Fragment>
					:	<div className="tips">提示：手机号: {setTempMobile}, 验证码10分钟有效;</div>
				}

            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setTempEmail: state.myInfo.setTempEmail,
		username: state.login.username,
		hasForgetPassword: state.login.hasForgetPassword,
		setTempMobile: state.myInfo.setTempMobile,
		registerFromLogin: state.login.registerFromLogin,
		forgetPasswordToken: state.login.forgetPasswordToken,
		token: state.login.token,
		setMobile: state.myInfo.setMobile
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CheckEmailOrMobile);
