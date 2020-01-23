import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class ServiceList extends React.Component {

    componentDidMount(){
        window.axios.get(HTTP_URL.getServiceList)
            .then((response) => {
                window.$("#service-list .service-list-content").html(response.data.result.response);
            })
    }

    backToMainPage = () => {
        window.goRoute(this, "/about");
    }

    render() {
        return (
            <div id="service-list">
                <NavBar centerText="服务条款" backToPreviousPage={this.backToMainPage} />
                <div className="service-list-content"></div>
            </div>
        );
    }
}

export default ServiceList;
