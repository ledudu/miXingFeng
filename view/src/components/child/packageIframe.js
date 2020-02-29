import React from 'react';
import { connect } from "react-redux";
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "./navbar";
import { CONSTANT } from "../../constants/enumeration";
import Loading from "./loading"

class packageIframe extends React.Component {

	constructor(props){
		super(props);
        this.state = {
            isLoading: true
		}
    }

	componentDidMount(){
		const { token } = this.props
		if(token) localStorage.setItem("hasLoginIn", true)
		const iframe = this.iframe, self = this;
        if (iframe.attachEvent) {
            iframe.attachEvent("onload", function () {
                self.setState({
					isLoading: false
				})
            });
        } else {
            iframe.onload = function () {
                self.setState({
					isLoading: false
				})
            };
		}
		axios.get(HTTP_URL.heartBeat)
			.catch(err => {
				if(err.message === 'Network Error'){
					return Toast.fail("请检查网络连接", CONSTANT.toastTime);
				}
			})
    }

    backToMainPage = () => {
		const hasLoginIn = localStorage.getItem("hasLoginIn")
		if(hasLoginIn){
			const token = this.props.token
			if(token){
				window.history.back()
			} else {
				window.goRoute(this, "/main/sign");
			}
		} else {
			window.history.back()
		}
	}

    render() {
		let { isLoading } = this.state;
		let name, src;
		if(this.props.location && this.props.location.query){
			name = this.props.location.query.name;
			src = this.props.location.query.src;
		}
		if(!name && !src) window.goRoute(this, "/main/sign");
        return (
            <div className="framework-container">
                <NavBar centerText={name} backToPreviousPage={this.backToMainPage} />
                <div className="framework-content">
					{isLoading && <Loading />}
                    <iframe ref={(iframe => this.iframe = iframe)} id='iframe-id' src={src} frameBorder="0" height="100%" width="100%" name='iframe' />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		token: state.login.token,
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(packageIframe);
