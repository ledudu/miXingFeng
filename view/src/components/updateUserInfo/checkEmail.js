import React from 'react';
import { connect } from "react-redux";
import { Toast } from "antd-mobile";
import NavBar from "../child/navbar";
import { networkErr } from "../../services/utils";
import { HTTP_URL } from "../../constants/httpRoute";
import { updateSetEmail } from "../../ducks/myInfo";
import { updateToken, updateHasForgetPassword } from "../../ducks/login";
import { CONSTANT } from "../../constants/enumeration";

const keyCode = [
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57,  //数字键
	96, 97, 98, 99, 100, 101, 102, 103, 104, 105,// 数字键盘上的键
	229 //手机键盘
]

class CheckEmail extends React.Component {

	componentDidMount(){
		this.inputValueRef1.focus()
		window.self1 = this;
	}

    backToMainPage = () => {
		if(window.forgetPasswordToken){
			window.goRoute(this, "/forget_password");
		} else {
			window.goRoute(this, "/set_email");
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
			//  输入框获取到值和这个比这个事件要迟一点，所以为了取到刚刚输入的值，这里需要一个延迟
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
		const { username, setTempEmail, hasForgetPassword } = this.props
		logger.info("checkEmail submit value", value)
		if(!this.startToSubmit){
			this.startToSubmit = true
			Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
			axios.get(HTTP_URL.checkEmailValid.format({value, username, email: setTempEmail}))
				.then((response) => {
					Toast.hide();
					const result = response.data.result
					if(result.response === "modify_success"){
						$dispatch(updateSetEmail(setTempEmail))
						$dispatch(updateToken(result.token));
						alert("设置成功")
						if(hasForgetPassword){
							$dispatch(updateHasForgetPassword(false))
							window.goRoute(this, "/reset_password_sys")
						} else {
							window.goRoute(this, "/user_profile")
						}
					} else if(result.response === "no_username_or_value"){
						return alert("没有用户名或验证码")
					} else if(result.response === "code_wrong"){
						return alert("验证码错误")
					} else {
						return alert("设置失败")
					}
				})
				.catch(err => {
					Toast.hide();
					return networkErr(err);
				})
				.finally(() => {
					this.startToSubmit = false
				})
		}

	}

    render() {
		const { setTempEmail } = this.props;
        return (
            <div className="check-email-input-container">
                <NavBar centerText="填写邮箱验证码" backToPreviousPage={this.backToMainPage} />
				<div className="check-email-input-content">
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef1 = ref} onKeyDown={(e) => this.switchNextInput(e, 1)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef2 = ref} onKeyDown={(e) => this.switchNextInput(e, 2)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef3 = ref} onKeyDown={(e) => this.switchNextInput(e, 3)} />
					<input className="check-email-input" maxLength={1} ref={ref => this.inputValueRef4 = ref} onKeyDown={(e) => this.switchNextInput(e, 4)} />
				</div>
				<div className="tips">提示：设置邮箱可用于找回密码,10分钟有效;
				<br/>
				您刚输入的邮箱：<strong>{setTempEmail}</strong>
				<br/>
				如果收件箱找不到邮件，请检查邮件是否被邮箱拦截。 </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setTempEmail: state.myInfo.setTempEmail,
		username: state.login.username,
		hasForgetPassword: state.login.hasForgetPassword
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CheckEmail);
