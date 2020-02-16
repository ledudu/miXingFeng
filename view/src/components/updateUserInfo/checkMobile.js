import React from 'react';
import { connect } from "react-redux";
import { Toast } from "antd-mobile";
import NavBar from "../child/navbar";
import { networkErr } from "../../services/utils";
import { HTTP_URL } from "../../constants/httpRoute";
import { updateSetMobile } from "../../ducks/myInfo";
import { updateToken, updateHasForgetPassword, updateRegisterFromLogin, updateForgetPasswordToken } from "../../ducks/login";
import { CONSTANT } from "../../constants/enumeration";

const keyCode = [
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57,  //数字键
	96, 97, 98, 99, 100, 101, 102, 103, 104, 105,// 数字键盘上的键
	229 //手机键盘
]

class CheckMobile extends React.Component {

	componentDidMount(){
		this.inputValueRef1.focus()
	}

    backToMainPage = () => {
		const { registerFromLogin, forgetPasswordToken } = this.props
		if(forgetPasswordToken){  // 忘记密码场景
			$dispatch(updateForgetPasswordToken(""))
			window.goRoute(this, "/forget_password");
		} else if(registerFromLogin){  //注册场景
			window.goRoute(this, "/set_mobile");
		} else {  // 个人中心更改手机号场景
			window.goRoute(this, "/set_mobile");
		}
	}

	switchNextInput = (e, number) => {
		if(e.keyCode === 8) {
			if(!this[`inputValueRef${number}`].value & number !== 1) {
				const previous = --number
				this[`inputValueRef${previous}`].value = ""
				this[`inputValueRef${previous}`].focus()
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

	submit = () => {
		const value1 = this.inputValueRef1.value
		const value2 = this.inputValueRef2.value
		const value3 = this.inputValueRef3.value
		const value4 = this.inputValueRef4.value
		const value = (value1 + value2 + value3 + value4)
		const { username, setTempMobile, hasForgetPassword, registerFromLogin } = this.props
		logger.info("CheckMobile submit value", value)
		if(!this.startToSubmit){
			this.startToSubmit = true
			Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
			axios.get(HTTP_URL.checkMobileValid.format({value, username, mobile: setTempMobile, registerFromLogin}))
				.then((response) => {
					Toast.hide();
					const result = response.data.result
					if(result.response === "modify_success"){
						$dispatch(updateSetMobile(setTempMobile))
						$dispatch(updateToken(result.token));
						alert("设置成功")
						if(hasForgetPassword){
							$dispatch(updateHasForgetPassword(false))
							window.goRoute(this, "/reset_password_sys")
						} else {
							window.goRoute(this, "/user_profile")
						}
					} else if(result.response === "check_mobile_success"){
						$dispatch(updateRegisterFromLogin(false))
						window.goRoute(this, "/register")
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
					return networkErr(err, `checkMobileValid`);
				})
				.finally(() => {
					this.startToSubmit = false
				})
		}

	}

    render() {
        return (
            <div className="check-email-input-container">
                <NavBar centerText="填写手机验证码" backToPreviousPage={this.backToMainPage} />
				<div className="check-email-input-content">
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef1 = ref} onKeyDown={(e) => this.switchNextInput(e, 1)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef2 = ref} onKeyDown={(e) => this.switchNextInput(e, 2)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef3 = ref} onKeyDown={(e) => this.switchNextInput(e, 3)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef4 = ref} onKeyDown={(e) => this.switchNextInput(e, 4)} />
				</div>
				<div className="tips">提示：绑定手机可用于找回密码, 验证码10分钟有效</div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setTempMobile: state.myInfo.setTempMobile,
		username: state.login.username,
		hasForgetPassword: state.login.hasForgetPassword,
		registerFromLogin: state.login.registerFromLogin,
		forgetPasswordToken: state.login.forgetPasswordToken
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CheckMobile);
