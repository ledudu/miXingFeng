import React from 'react';
import { Button, Toast, InputItem } from "antd-mobile";
import { HTTP_URL } from "../../constants/httpRoute";
import { networkErr, alertDialog, confirm } from "../../services/utils";
import { updateToken } from "../../ducks/login";
import { CONSTANT } from "../../constants/enumeration";
import { checkEmail, checkMobilePhone } from "../../logic/common"

class UpdateUserInfoComponent extends React.Component {

	constructor(props){
		super(props);
		const { placeholder } = this.props
		let inputValue = placeholder
		if(placeholder === "最多10个字" || placeholder === "请输入手机号" || placeholder === "请输入签名" || placeholder === '请输入邮箱' ){
			inputValue = ""
		}
		this.state={
			inputValue
		}
	}

    backToMainPage = () => {
        window.goRoute(this, "/user_profile");
    }

    saveUserInfo = () => {
        let {infoLength, infoErrorTip, updateUserInfoDispatch, pageTitle, name, backToMainPage, self, registerFromLogin} = this.props;
        let value = window.$(".set-user-info-component-content input")[0].value;
        if(value.length > infoLength) {
            return alert(infoErrorTip)
        } else if(!value){
            return;
        } else if (pageTitle === "填写手机号"){
            if(checkMobilePhone(value) === false){
                return alert(infoErrorTip)
            } else if(value === $getState().myInfo.setMobile){
				return;
			} else {
				value = value.replace(/\s/g, "")
			}
        } else if (pageTitle === "填写邮箱"){
            if(checkEmail(value) === false){
                return alert("邮箱格式不正确")
            } else if(value === $getState().myInfo.setEmail){
				return;
			}
        }
        let {username, token} = window.$getState().login;
        if(!token && !registerFromLogin) {
            return alert("没有token")
        }
		const data = Object.assign({}, {username, token, userInfo: { [name]: value }, registerFromLogin })
		if(!this.startToSubmit){
			this.startToSubmit = true
			if(pageTitle === "填写邮箱" || pageTitle === "填写手机号"){
				Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
			}
			axios.post(HTTP_URL.updateUserInfo, data)
            	.then((response) => {
					this.startToSubmit = false
					const {result} = response.data
            	    if(result.response === "modify_success"){
						Toast.success('保存成功', CONSTANT.toastTime);
						$dispatch(updateToken(result.token));
            	        $dispatch(updateUserInfoDispatch(value));
            	        backToMainPage()
            	    } else if(result.response === "lack_fields"){
						Toast.fail('缺少必要的字段', CONSTANT.toastTime);
					} else if(result.response === "more_string_length"){
						Toast.fail('字数超过长度限制', CONSTANT.toastTime);
					} else if(result.response === "wrong_email_format"){
						Toast.fail('错误的邮箱格式', CONSTANT.toastTime);
					} else if(result.response === "email_existed"){
						Toast.hide();
						alertDialog("此邮箱已绑定到其他账号，请更换邮箱后重试")
					} else if(result.response === "send_email_success"){
						Toast.hide();
						alert("验证码已发送邮箱，请注意查收")
						$dispatch(updateToken(result.token));
            	        $dispatch(updateUserInfoDispatch(value));
						window.goRoute(self, "/check_email")
					} else if(result.response === "wrong_mobile_format"){
						Toast.fail('错误的手机号格式', CONSTANT.toastTime);
					} else if(result.response === "mobile_existed"){
						Toast.hide();
						alertDialog("此手机号已绑定到其他账号，请更换手机号重试")
					} else if(result.response === "mobile_existed_from_register"){
						Toast.hide();
						confirm("此手机号已被注册", "", "去登录", () => {
							window.goRoute(null, "/login")
						})
					} else if(result.response === "send_mobile_success"){
						Toast.hide();
						alert("验证码已发送，请注意查收")
						$dispatch(updateToken(result.token));
            	        $dispatch(updateUserInfoDispatch(value));
						window.goRoute(self, "/check_mobile")
					} else {
						logger.error("saveUserInfo updateUserInfo 设置失败 result", result)
            	        Toast.fail('设置失败', CONSTANT.toastTime);
            	    }
            	})
            	.catch(err => {
					this.startToSubmit = false
            	    return networkErr(err, `updateUserInfo data: ${data}`);
            	})
		}
    }

    keyDownEvent = (e) => {
        if (e.keyCode === 13) {
            window.$(".set-user-info-component-content input")[0].blur()
            return this.saveUserInfo();
        }
	}

	updateValue = (e) => {
		this.setState({
			inputValue: e.target.value
		})
	}

    render() {
		const { pageTitle, placeholder } = this.props;
		const { inputValue } = this.state;
		const mobilePhonePlaceholder = placeholder === "请输入手机号" ? "" : placeholder
        return (
            <div className="set-user-info-component-container">
                <div className="set-user-info-component-content">
                    {pageTitle === "填写手机号"
                    ?  <InputItem type="phone" defaultValue={mobilePhonePlaceholder} placeholder={placeholder} onKeyDown={this.keyDownEvent}></InputItem>
					: <input className="set-user-info-input" value={inputValue} placeholder={placeholder} onChange={this.updateValue}
						onKeyDown={this.keyDownEvent}/>}
                    <div className="save-user-info">
                        <Button type="primary" className="button" value="保存" onClick={this.saveUserInfo}>保存</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default UpdateUserInfoComponent;
