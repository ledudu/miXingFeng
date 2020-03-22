import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class Privacy extends React.Component {

	state = {
		bodyContent: ""
	}

    componentDidMount(){
        window.axios.get(HTTP_URL.getPrivacy)
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
            <div id="privacy-statement">
                <NavBar centerText="隐私声明" backToPreviousPage={this.backToMainPage} />
				<div className="privacy-statement-content" dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
            </div>
        );
    }
}

export default Privacy;
