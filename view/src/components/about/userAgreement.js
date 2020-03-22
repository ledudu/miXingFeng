import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class UserAgreement extends React.Component {

	state = {
		bodyContent: ""
	}

    componentDidMount(){
        window.axios.get(HTTP_URL.getUserAgreement)
            .then((response) => {
				this.setState({
					bodyContent: response.data.result.response
				})
            })
    }

    backToMainPage = () => {
        window.goRoute(this, "/about");
    }

    render() {
		const { bodyContent } = this.state
        return (
            <div id="user-agreement">
                <NavBar centerText="用户协议" backToPreviousPage={this.backToMainPage} />
                <div className="user-agreement-content" dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
            </div>
        );
    }
}

export default UserAgreement;
