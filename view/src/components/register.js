import React, { Component, createRef } from 'react';
import { Button } from "antd-mobile";
import NavBar from "./child/navbar";
import InputComponent from "./child/inputComponent"
import { registerUsername} from "../logic/login";
import { backToPreviousPage} from "../services/utils";

export default class Register extends Component {

	constructor(props){
		super(props)
		this.username = createRef();
		this.password1 = createRef();
		this.password2 = createRef();;
		this.state = {
			usernameValue: "",
			passwordValue1: "",
			passwordValue2: ""
		}
	}

    componentDidMount(){
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
		if($getState().login.token){
			backToPreviousPage(this, "/main/sign", {specialBack: true})
		} else {
			backToPreviousPage(this, "/login", {specialBack: true});
		}
	}


    backToMain = () => {
		if($getState().login.token){
			backToPreviousPage(this, "/main/sign")
		} else {
			backToPreviousPage(this, "/login")
		}
    }

    registerKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
            this.register();
        }
    }

    register = () => {
		const { usernameValue, passwordValue1, passwordValue2 } = this.state
        registerUsername(this, usernameValue, passwordValue1, passwordValue2);
	}

	updateValue = (e, number) => {
		let value = ""
		if(number === 0){
			value = 'usernameValue'
		} else if(number === 1){
			value = 'passwordValue1'
		} else if(number === 2){
			value = 'passwordValue2'
		}
		this.setState({
			[value]: e.target.value
		})
	}

    render() {
		const { usernameValue, passwordValue1, passwordValue2 } = this.state
        return (
            <div className="register-area">
                <NavBar centerText="填写信息" backToPreviousPage={this.backToMain} />
                <div className="input-content" style={{marginTop: "10px"}}>
                    <div className="content">
						<InputComponent
							value={usernameValue}
							size="26"
							placeholder="用户名可用于登录"
							handleChange={(e) => this.updateValue(e, 0)}
							handleKeyDown={this.registerKeyDownEvent}
							ref={this.username}
						/>
						<div className="new-password-text">用户名</div>
                    </div>
                </div>
                <div className="input-content">
                    <div className="content">
						<InputComponent
							type="password"
							value={passwordValue1}
							size="16"
							placeholder="请输入密码，至少包含一个数字和字母"
							handleChange={(e) => this.updateValue(e, 1)}
							handleKeyDown={this.registerKeyDownEvent}
							ref={this.password1}
						/>
						<div className="new-password-text">密码</div>
                    </div>
                </div>
                <div className="input-content">
                    <div className="content">
						<InputComponent
							type="password"
							value={passwordValue2}
							size="26"
							placeholder="请再次输入密码"
							handleChange={(e) => this.updateValue(e, 2)}
							handleKeyDown={this.registerKeyDownEvent}
							ref={this.password2}
						/>
						<div className="new-password-text">确认密码</div>
                    </div>
                </div>
                <div className="register-btn">
                    <Button type="primary" className="button" onClick={this.register}>提交</Button>
                </div>
            </div>
        )
    }
}
