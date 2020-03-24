import React, { Component, createRef } from 'react';
import { Button, Toast } from "antd-mobile";
import NavBar from "./child/navbar"
import InputComponent from "./child/inputComponent"
import { networkErr, backToPreviousPage} from "../services/utils";
import { CONSTANT } from "../constants/enumeration";
import { HTTP_URL } from "../constants/httpRoute";
import { updateSetTempEmail, updateSetTempMobile } from "../ducks/myInfo";
import { updateHasForgetPassword, updateForgetPasswordToken, updateForgetPasswordTokenOrigin } from "../ducks/login"
import { checkEmail, checkMobilePhone } from "../logic/common"

export default class ForgetPassword extends Component {

	constructor(props){
		super(props)
		this.emailInput = createRef();
		this.state = {
			emailOrMobile: "",
		}
	}

    componentDidMount(){
		this.emailInput.current && this.emailInput.current.focus()
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
		backToPreviousPage(this, "/login", {specialBack: true});
	}

    backToMain = () => {
        backToPreviousPage(this, "/login");
    }

    forgetPasswordKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			const emailValue = this.state.emailOrMobile
			if(!emailValue){
				return alert("手机号或邮箱不能为空")
			}
            this.forgetPasswordFunc()
        }
	}

	forgetPasswordFunc = () => {
		const emailValue = this.state.emailOrMobile
		let isEmail, isMobile
		if(checkEmail(emailValue)) isEmail = true
		if(checkMobilePhone(emailValue)) isMobile = true
		if(!isEmail && !isMobile){
			return alert("手机号或邮箱格式不正确")
		} else {
			if(!this.startToSubmit){
				this.startToSubmit = true
				const data = {
					email: isEmail && emailValue,
					mobile: isMobile && emailValue
				}
				Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
				axios.post(HTTP_URL.forgetPassword, data)
					.then((response) => {
						this.startToSubmit = false
						Toast.hide();
						const {result} = response.data
						if(result.response === "no_mobile_or_email"){
							return alert("手机号或邮箱不能为空")
						} else if(result.response === "no_such_email"){
							return alert("邮箱不存在")
						} else if(result.response === "no_such_mobile"){
							return alert("手机号不存在")
						} else if(result.response === "send_email_success"){
							$dispatch(updateForgetPasswordTokenOrigin("email"))
							alert("验证码已发送邮箱，请注意查收")
							$dispatch(updateSetTempEmail(emailValue));
							$dispatch(updateHasForgetPassword(true));
							logger.info("forgetPassword result.emailToken", result.emailToken)
							$dispatch(updateForgetPasswordToken(result.emailToken))
							window.goRoute(this, "/check_email")
						} else if(result.response === "send_mobile_success"){
							$dispatch(updateForgetPasswordTokenOrigin("mobile"))
							alert("验证码已发送，请注意查收")
							$dispatch(updateSetTempMobile(emailValue));
							$dispatch(updateHasForgetPassword(true));
							$dispatch(updateForgetPasswordToken(result.token))
							window.goRoute(this, "/check_mobile")
						}
					})
					.catch(err => {
						this.startToSubmit = false
						Toast.hide();
						return networkErr(err, `forgetPassword`);
					})
			}
		}
	}

	updateValue = (e) => {
		this.setState({
			emailOrMobile: e.target.value
		})
	}

    render(){
		const { emailOrMobile } = this.state
        return(
            <div className="forget-password-area">
                <NavBar centerText="忘记密码" backToPreviousPage={this.backToMain} />
				<div className="input-content">
					<div className="content">
						<InputComponent
							placeholder="请输入手机号或邮箱"
							handleKeyDown={this.forgetPasswordKeyDownEvent}
							handleChange={this.updateValue}
							ref={this.emailInput}
							value={emailOrMobile}
						/>
					</div>
                </div>
                <div className="reset-password-btn">
                    <Button type="primary" className="button" value="提交" onClick={this.forgetPasswordFunc}>提交</Button>
                </div>
            </div>
        )
    }
}
