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
		const { token, username } = this.props;
		axios.get(HTTP_URL.getLoginRecord.format({token, username}))
			.then((response) => {
				logger.info('getLoginRecord', response.data.response)
				this.setState({
					records: response.data.result.response
				})
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
        token: state.login.token
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LoginRecord);
