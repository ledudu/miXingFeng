import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

class Privacy extends React.Component {

    componentDidMount(){
        window.axios.get(HTTP_URL.getPrivacy)
            .then((response) => {
                window.$("#privacy-statement .privacy-statement-content").html(response.data.result.response);
            })
    }

    backToMainPage = () => {
        window.goRoute(this, "/about");
    }

    render() {
        return (
            <div id="privacy-statement">
                <NavBar centerText="隐私声明" backToPreviousPage={this.backToMainPage} />
                <div className="privacy-statement-content"></div>
            </div>
        );
    }
}

export default Privacy;
