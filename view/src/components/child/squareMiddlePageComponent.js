import React from 'react';
import NavBar from "./navbar";
import { openBrowserLink, backToPreviousPage } from "../../services/utils";
import { hideMusicController } from "../../logic/common"

export default class SquareMiddlePageComponent extends React.Component {

    componentDidMount(){
		document.addEventListener("deviceready", this.listenBackButton, false);
		hideMusicController()
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backKeyDownToPrevious);
    }

    listenBackButton = () => {
		document.addEventListener("backbutton", this.backKeyDownToPrevious, false)
	}

	backKeyDownToPrevious = () => {
		backToPreviousPage(this.props.self, "/main/myInfo", {specialBack: true});
	}

    backToMainPage = () => {
		backToPreviousPage(this.props.self, "/main/myInfo");
    }

    goNextRoute = (route, name, src) => {
		if(route === "/browser_link"){
			openBrowserLink(src)
		} else if(route && route !== "/package_iframe"){
			window.goRoute(this.props.self, route);
		} else if(route){
			this.props.self.props.history.push({ pathname: '/package_iframe', query: { name, src }})
		}
    }

    render() {
		const { pageName, itemColumns } = this.props
        return (
            <div className="square-middle-page-container">
				<NavBar
					centerText={pageName}
					backToPreviousPage={this.backToMainPage}
				/>
                <div className="square-middle-page-content">
						{itemColumns.map(item => (
							<div key={item.displayName} className="square-item" onClick={() => this.goNextRoute(item.routeName, item.name, item.src)} >
								<i className={`fa ${item.fa}`} aria-hidden="true"></i>
								<span className="square-item-text">{item.displayName}</span>
							</div>
						))}
                </div>
            </div>
        );
    }
}
