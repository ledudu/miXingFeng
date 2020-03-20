import React from 'react';
import NavBar from "./child/navbar";
import { Button } from "antd-mobile";
import { searchShellCommand } from "../logic/myInfo"

export default class TypeShell extends React.Component {

	constructor(props){
		super(props)
		this.state={
			isSearching: false,
			value: props.token ? "tail -100 miXingFeng.log" : "",
			shellResponse: ""
		}
	}

	componentDidMount(){
		const { token } = $getState().login;
		if(token) {
			this.search()
		}
	}

    backToMainPage = () => {
        window.goRoute(this, "/my_games");
	}

	updateValue = (e) => {
		this.setState({
			value: e.target.value
		})
	}

    search = () => {
		const command = this.state.value;
		searchShellCommand(this, command)
    }

    render() {
		const { value, shellResponse, isSearching } = this.state;
        return (
            <div className="shell-container">
                <NavBar centerText="RPC Shell" backToPreviousPage={this.backToMainPage} />
                <div className="shell-content">
                    <textarea className="shell-textarea" placeholder="请输入shell命令" value={value} onChange={this.updateValue} />
                    <div className="submit-shell">
                        <Button type="primary" className="button" onClick={this.search}>{isSearching ? '查询中...' : '查询'}</Button>
                    </div>
					<div className="shell-tips">普通用户只可以输入'free -h'或'tail -100 server.log'或‘cat error.log’或'tail -100 miXingFeng.log'</div>
					{shellResponse && <div className="line-out"></div>}
					<div className="shell-response" dangerouslySetInnerHTML={{ __html: shellResponse }}></div>
                </div>
            </div>
        );
    }
}

