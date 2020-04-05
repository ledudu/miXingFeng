import React, { Component } from "react"
import { connect } from "react-redux";
import NavBar from "./child/navbar";
import { HTTP_URL } from "../constants/httpRoute";
import { networkErr } from "../services/utils";

class LoginRecord extends Component {
	constructor(props){
		super(props)
		this.state = {
			records: []
		}
	}

	componentDidMount(){
		const { token, username, setMobile } = this.props;
		axios.get(HTTP_URL.getLoginRecord.format({token, username: username||setMobile}))
			.then((response) => {
				const getLoginRecord = response.data.result.response
				logger.info('getLoginRecord', getLoginRecord)
				if(getLoginRecord === "no_username"){
					return alertDialog("用户不存在")
				} else if(Array.isArray(getLoginRecord)){
					this.setState({
						records: getLoginRecord
					})
				}
			})
			.catch(err => {
				networkErr(err, `getLoginRecord`)
			})
	}

	backToMainPage = () => {
		window.goRoute(this, "/system_setup");
	}

	render(){
		const { records } = this.state
		return (
			<div className="login-record-container">
				<NavBar centerText="登录记录" backToPreviousPage={this.backToMainPage} />
				{records.map(item => (
					(item.manufacturer || item.model) && <div className="record-item-container" key={item.uuid}>
						<div className="item-info">{`${item.manufacturer} ${item.model}`}</div>
						<div className="item-date">{item.date}</div>
					</div>
				))}
			</div>
		)
	}
}

const mapStateToProps = state => {
    return {
        username: state.login.username,
		token: state.login.token,
		setMobile: state.myInfo.setMobile,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LoginRecord);
