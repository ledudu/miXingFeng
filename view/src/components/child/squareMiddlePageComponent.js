import React from 'react';
import NavBar from "./navbar";
import { openBrowserLink } from "../../services/utils";

export default class SquareMiddlePageComponent extends React.Component {

    componentDidMount(){
        document.addEventListener("deviceready", this.listenBackButton, false);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackButton = () => {
		document.addEventListener("backbutton", this.backToMainPage, false)
    }

    backToMainPage = () => {
		window.goRoute(this.props.self, "/main/myInfo");
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
								<span className="square-item-text">{item.displayName}</span>
							</div>
						))}
                </div>
            </div>
        );
    }
}
