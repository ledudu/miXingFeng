import React, { Component } from 'react';
import { Button } from "antd-mobile";
import { resetPasswordFunc} from "../logic/login";
import NavBar from "./child/navbar";
import { updateForgetPasswordToken } from "../ducks/login"

class resetPasswordSys extends Component {

    backToMain = () => {
		const { forgetPasswordToken } = $getState().login
		if(forgetPasswordToken){
			$dispatch(updateForgetPasswordToken(""))
			window.goRoute(this, "/forget_password")
		} else {
			window.goRoute(this, "/system_setup")
		}
    }

    resetPasswordKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			this.resetPassword1Ref.blur()
			this.resetPassword2Ref.blur()
            this.resetPassword()
        }
    }

    resetPassword = () => {
		const newPwd1 = this.resetPassword1Ref.value
		const newPwd2 = this.resetPassword2Ref.value
        resetPasswordFunc(this, newPwd1, newPwd2);
    }

    render(){
        return(
        	<div className="reset-password-area">
        	    <NavBar centerText="重置密码" backToPreviousPage={this.backToMain} />
        	    <div className="input-content" style={{marginTop: "10px"}}>
        	        <div className="content">
						<input
							type="password"
							className="form"
							placeholder="请输入新密码"
							size="16"
							onKeyDown={(event) => this.resetPasswordKeyDownEvent(event)}
							ref={ref => this.resetPassword1Ref = ref}
						/>
						<div className="new-password-text">新密码</div>
        	        </div>
        	    </div>
				<div className="input-content">
					<div className="content">
						<input
							type="password"
							className="form"
							placeholder="请再次输入新密码"
							size="16"
							onKeyDown={(event) => this.resetPasswordKeyDownEvent(event)}
							ref={ref => this.resetPassword2Ref = ref}
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
