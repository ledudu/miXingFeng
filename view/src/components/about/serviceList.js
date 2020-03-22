import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class ServiceList extends React.Component {

	state = {
		bodyContent: ""
	}

    componentDidMount(){
        window.axios.get(HTTP_URL.getServiceList)
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
            <div id="service-list">
                <NavBar centerText="服务条款" backToPreviousPage={this.backToMainPage} />
                <div className="service-list-content"  dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
            </div>
        );
    }
}

export default ServiceList;
