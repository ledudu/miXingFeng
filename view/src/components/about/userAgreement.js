import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class UserAgreement extends React.Component {

    componentDidMount(){
        window.axios.get(HTTP_URL.getUserAgreement)
            .then((response) => {
                window.$("#user-agreement .user-agreement-content").html(response.data.result.response);
            })
    }

    backToMainPage = () => {
        window.goRoute(this, "/about");
    }

    render() {
        return (
            <div id="user-agreement">
                <NavBar centerText="用户协议" backToPreviousPage={this.backToMainPage} />
                <div className="user-agreement-content"></div>
            </div>
        );
    }
}

export default UserAgreement;
