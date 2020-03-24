import React, { Component, createRef } from 'react';
import { Button } from "antd-mobile";
import NavBar from "./child/navbar";
import InputComponent from "./child/inputComponent"
import { resetPasswordFunc} from "../logic/login";
import { updateForgetPasswordToken, updateForgetPasswordTokenOrigin } from "../ducks/login"

class resetPasswordSys extends Component {

	constructor(props){
		super(props)
		this.resetPassword1Ref = createRef();
		this.resetPassword2Ref = createRef();
		this.state = {
			password1: "",
			password2: ""
		}
	}

	componentDidMount(){
		const { current } = this.resetPassword1Ref;
		current && current.focus();
	}

    backToMain = () => {
		const { token } = $getState().login
		if(!token){
			$dispatch(updateForgetPasswordToken(""))
			$dispatch(updateForgetPasswordTokenOrigin(""))
			window.goRoute(this, "/forget_password")
		} else {
			window.goRoute(this, "/system_setup")
		}
    }

    resetPasswordKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			this.resetPassword1Ref.current.blur()
			this.resetPassword2Ref.current.blur()
            this.resetPassword()
        }
    }

    resetPassword = () => {
		const newPwd1 = this.resetPassword1Ref.current.value
		const newPwd2 = this.resetPassword2Ref.current.value
        resetPasswordFunc(this, newPwd1, newPwd2);
	}

	updateValue = (e, number) => {
		if(number === 1){
			this.setState({
				password1: e.target.value
			})
		} else {
			this.setState({
				password2: e.target.value
			})
		}
	}

    render(){
		const { password1, password2 } = this.state
        return(
        	<div className="reset-password-area">
        	    <NavBar centerText="重置密码" backToPreviousPage={this.backToMain} />
        	    <div className="input-content" style={{marginTop: "10px"}}>
        	        <div className="content">
						<InputComponent
							type="password"
							placeholder="请输入新密码"
							size="16"
							handleKeyDown={this.resetPasswordKeyDownEvent}
							handleChange={(e) => this.updateValue(e, 1)}
							ref={this.resetPassword1Ref}
							value={password1}
						/>
						<div className="new-password-text">新密码</div>
        	        </div>
        	    </div>
				<div className="input-content">
					<div className="content">
						<InputComponent
							type="password"
							placeholder="请再次输入新密码"
							size="16"
							handleKeyDown={this.resetPasswordKeyDownEvent}
							handleChange={(e) => this.updateValue(e, 2)}
							ref={this.resetPassword2Ref}
							value={password2}
						/>
						<div className="new-password-text">再次输入新密码</div>
        	        </div>
				</div>
        	    <div className="reset-password-btn">
        	        <Button type="primary" className="button" value="提交" onClick={this.resetPassword}>提交</Button>
        	    </div>
        	    <div className="line-out">
        	        <div className="line"></div>
        	    </div>
        	    <div className="tips-container">
        	        <div className="tips">密码至少包含大小写字母和数字中的两种且长度不低于6位</div>
        	    </div>
        	</div>
        )
    }
}

export default resetPasswordSys;
