import React, { Component } from 'react';
import { Button } from "antd-mobile";
import { registerUsername} from "../logic/login";
import NavBar from "./child/navbar";
import { onBackKeyDown } from "../services/utils";
import { CON } from "../constants/enumeration";

export default class Register extends Component {

    componentDidMount(){
        document.removeEventListener("backbutton", onBackKeyDown, false);
        document.addEventListener("deviceready", this.listenBackButton, false);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMain);
    }

    listenBackButton = () => {
        setTimeout(() => {
            StatusBar.backgroundColorByHexString(CON.statusBarColor);
        }, 300)
        document.addEventListener("backbutton", this.backToMain, false)
    }

    backToMain = () => {
        window.goRoute(this, "/login")
    }

    registerKeyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
            window.$('#register-username').blur();
            window.$('#register-password1').blur();
            window.$('#register-password2').blur();
            this.register();
        }
    }

    register = () => {
        registerUsername(this);
    }

    render() {
        return (
            <div className="register-area">
                <NavBar centerText="注册新用户" backToPreviousPage={this.backToMain} />
                <div className="input-content" style={{marginTop: "10px"}}>
                    <div className="content">
                        <input type="text" id="register-username" name="register-username" placeholder="请输入用户名" className="form" size="26" onKeyDown={(event) => this.registerKeyDownEvent(event)} />
						<div className="new-password-text">用户名</div>
                    </div>
                </div>
                <div className="input-content">
                    <div className="content">
                        <input name="register-password" id="register-password1" type="password" size="16" placeholder="请输入密码，至少包含一个数字和字母" className="form" onKeyDown={(event) => this.registerKeyDownEvent(event)} />
						<div className="new-password-text">密码</div>
                    </div>
                </div>
                <div className="input-content">
                    <div className="content">
                        <input name="register-password-again" id="register-password2" type="password" size="16" placeholder="请再次输入密码，至少包含一个数字和字母" className="form" onKeyDown={(event) => this.registerKeyDownEvent(event)} />
						<div className="new-password-text">密码</div>
                    </div>
                </div>
                <div className="register-btn">
                    <Button type="primary" className="button" onClick={this.register}>提交</Button>
                </div>
            </div>
        )
    }
}
