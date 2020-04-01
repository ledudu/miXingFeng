import React, { createRef } from 'react';
import { Button, Toast, InputItem } from "antd-mobile";
import InputComponent from "../child/inputComponent"
import { HTTP_URL } from "../../constants/httpRoute";
import { networkErr, alertDialog, confirm } from "../../services/utils";
import { updateToken } from "../../ducks/login";
import { CONSTANT } from "../../constants/enumeration";
import { checkEmail, checkMobilePhone, setTryMobileOrEmailTimes } from "../../logic/common"

class UpdateUserInfoComponent extends React.Component {

	constructor(props){
		super(props);
		const { placeholder } = this.props
		let inputValue = placeholder
		if(placeholder === "请输入昵称,最多10个字" || placeholder === "请输入手机号" || placeholder === "请输入签名" || placeholder === '请输入邮箱' || placeholder === '用户名可用于登录，全网唯一，设置后不可修改'){
			inputValue = ""
		}
		this.state={
			inputValue
		}
		this.userInfoInputRef = createRef();
	}

	componentDidMount(){
		setTimeout(() => {
			this.userInfoInputRef && this.userInfoInputRef.current &&this.userInfoInputRef.current.focus()
		})
	}

    saveUserInfo = () => {
        const {infoLength, infoErrorTip, updateUserInfoDispatch, pageTitle, name, backToMainPage, self, registerFromLogin} = this.props;
		let value = this.state.inputValue
		let { tryMobileOrEmailTimes=0 } = $getState().common
        if(value.length > infoLength) {
            return alert(infoErrorTip)
        } else if(!value){
            return;
        } else if (pageTitle === "填写手机号"){
            if(checkMobilePhone(value) === false){
                return alert(infoErrorTip)
            } else if(value === $getState().myInfo.setMobile){
				return;
			} else if(tryMobileOrEmailTimes >= 3){
				// 允许每两分钟属发送三次验证码
				return alertDialog("您的操作太频繁，请稍后重试")
			}
        } else if (pageTitle === "填写邮箱"){
            if(checkEmail(value) === false){
                return alert("邮箱格式不正确")
            } else if(value === $getState().myInfo.setEmail){
				return;
			} else if(tryMobileOrEmailTimes >= 3){
				// 允许每两分钟属发送三次验证码
				return alertDialog("您的操作太频繁，请稍后重试")
			}
        } else if (pageTitle === "设置用户名"){
            if(!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(value)){
				logger.info("saveUserInfo 用户名只能由字母,数字或中文组成", value)
				return alertDialog("用户名只能由字母，数字或中文组成");
			} else if(/^[0-9]/i.test(value)){
				logger.info("saveUserInfo 用户名首字母不能是数字", value)
				return alertDialog("用户名首字母不能是数字");
			}
		}
		value = value.replace(/\s/g, "")
		const { username, token } = $getState().login;
		const { setMobile } = $getState().myInfo;
        if(!token && !registerFromLogin) {
            return alertDialog("没有token")
        }
		const data = Object.assign({}, {username: username || setMobile, token, userInfo: { [name]: value }, registerFromLogin })
		if(!this.startToSubmit){
			this.startToSubmit = true
			if(pageTitle === "填写邮箱" || pageTitle === "填写手机号"){
				Toast.loading('请稍后...', CONSTANT.toastLoadingTime, () => {});
			}
			logger.info("UpdateUserInfoComponent saveUserInfo data", data)
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
					} else if(result.response === "username_existed"){
						Toast.hide();
						alertDialog("此用户名已被注册，请更换后重试")
					} else if(result.response === "send_email_success"){
						setTryMobileOrEmailTimes(tryMobileOrEmailTimes)
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
							window.goRoute(self, "/login")
						})
					} else if(result.response === "send_mobile_success"){
						setTryMobileOrEmailTimes(tryMobileOrEmailTimes)
						Toast.hide();
						alert("手机验证码已发送，请注意查收")
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
            return this.saveUserInfo();
        }
	}

	updateValue = (e) => {
		let inputValue = e  // InputItem组件的值
		if(e.target){
			inputValue = e.target.value
		}
		this.setState({
			inputValue
		})
	}

    render() {
		const { pageTitle, placeholder } = this.props;
		const { inputValue } = this.state;
        return (
            <div className="set-user-info-component-container">
                <div className="set-user-info-component-content">
                    {
						pageTitle === "填写手机号"
                    	?  <InputItem type="phone" placeholder={placeholder} onChange={this.updateValue} onKeyDown={this.keyDownEvent}></InputItem>
						: <InputComponent
							value={inputValue}
							placeholder={placeholder}
							handleChange={this.updateValue}
							handleKeyDown={this.keyDownEvent}
							ref={this.userInfoInputRef}
						/>
					}
                    <div className="save-user-info">
                        <Button type="primary" className="button" value="保存" onClick={this.saveUserInfo}>保存</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default UpdateUserInfoComponent;

