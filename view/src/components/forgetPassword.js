import React, { Component } from 'react';
import { Button, Toast } from "antd-mobile";
import { networkErr } from "../services/utils";
import { CONSTANT } from "../constants/enumeration";
import { HTTP_URL } from "../constants/httpRoute";
import { updateSetTempEmail } from "../ducks/myInfo";
import { updateUsername, updateHasForgetPassword } from "../ducks/login"
import NavBar from "./child/navbar"
import { checkEmail } from "../logic/common"

export default class ForgetPassword extends Component {

    componentDidMount(){
        document.addEventListener("deviceready", this.listenBackButton, false);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMain);
    }

    listenBackButton = () => {
        setTimeout(() => {
            StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
        }, 300)
        document.addEventListener("backbutton", this.backToMain, false)
    }

    backToMain = () => {
        window.goRoute(this, "/login")
    }

    forgetPasswordKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			const usernameValue = this.usernameInput.value
			const emailValue = this.emailInput.value
			if(!usernameValue){
				return alert("用户名不能为空")
			}
			if(!emailValue){
				return alert("邮箱不能为空")
			}
            this.forgetPasswordFunc()
        }
	}

	forgetPasswordFunc = () => {
		const usernameValue = this.usernameInput.value
		const emailValue = this.emailInput.value
		if(checkEmail(emailValue) === false){
			return alert("邮箱格式不正确")
		} else {
			if(!this.startToSubmit){
				this.startToSubmit = true
				const data = {
					username: usernameValue,
					email: emailValue
				}
				Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
				axios.post(HTTP_URL.forgetPassword, data)
					.then((response) => {
						this.startToSubmit = false
						Toast.hide();
						const {result} = response.data
						if(result.response === "no_username_or_email"){
							return alert("用户名或密码不能为空")
						} else if(result.response === "no_such_username"){
							return alert("没有此用户名")
						} else if(result.response === "no_such_email"){
							return alert("此用户没有这个邮箱")
						} else if(result.response === "send_email_success"){
							window.forgetPasswordToken = result.token
							alert("验证码已发送邮箱，请注意查收")
							$dispatch(updateSetTempEmail(emailValue));
							$dispatch(updateUsername(usernameValue));
							$dispatch(updateHasForgetPassword(true));
							window.goRoute(this, "/check_email")
						}
					})
					.catch(err => {
						this.startToSubmit = false
						return networkErr(err);
					})
			}
		}
	}

    render(){
        return(
            <div className="forget-password-area">
                <NavBar centerText="忘记密码" backToPreviousPage={this.backToMain} />
                <div className="input-content" style={{marginTop: "10px"}}>
					<div className="content">
                        <input type="text" ref={ref => this.usernameInput = ref} className="reset-password-username1 form" placeholder="请输入用户名"
                            onKeyDown={(event) => this.forgetPasswordKeyDownEvent(event)} />
						<div className="new-password-text">用户名</div>
					</div>
                </div>
				<div className="input-content">
					<div className="content">
                        <input type="text" ref={ref => this.emailInput = ref} className="reset-password-email form" placeholder="请输入邮箱"
                            onKeyDown={(event) => this.forgetPasswordKeyDownEvent(event)} />
						<div className="new-password-text">邮箱</div>
					</div>
                </div>
                <div className="reset-password-btn">
                    <Button type="primary" className="button" value="提交" onClick={this.forgetPasswordFunc}>提交</Button>
                </div>
            </div>
        )
    }
}
