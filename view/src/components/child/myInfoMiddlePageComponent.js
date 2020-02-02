import React, { Fragment } from 'react';
import { List, Badge } from 'antd-mobile';
import NavBar from "./navbar";
import { openBrowserLink } from "../../services/utils";

export default class MyInfoMiddlePageComponent extends React.Component {

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
		const { backToPage } = this.props;
		logger.info("MyInfoMiddlePageComponent backToPage", backToPage)
		switch(backToPage){
			case 'about':
				window.goRoute(this.props.self, "/about");
				break;
			case "system_setup":
				window.goRoute(this.props.self, "/system_setup");
				break;
			default:
				window.goRoute(this.props.self, "/main/myInfo");
				break;
		}
    }

    goNextRoute = (route, name, src) => {
		if(route === "/browser_link"){
			openBrowserLink(src)
		} else if(route && route !== "/package_iframe"){
			window.goRoute(this.props.self, route);
		} else if(route){
			this.props.self.props.history.push({ pathname: '/package_iframe', query: { name, src }})
		} else if(!route){
			return this.props.callback1()
		}
    }

    render() {
		const { pageName, itemColumns, setSystemSetupDot } = this.props
        return (
            <div className="middle-page-container">
				<NavBar
					centerText={pageName}
					backToPreviousPage={this.backToMainPage}
				/>
                <div className="middle-page-content">
                	<List>
						{itemColumns.map(item => (
							<Fragment key={item.displayName}>
								{
									item.displayName === '检查更新'
									?	<List.Item style={{height: "60px"}}
											onClick={() => this.goNextRoute(null, item.name)}
										>
											<span style={{ marginLeft: 12 }}>{item.displayName}</span>
											&nbsp;&nbsp;
											<Badge text={setSystemSetupDot && 'new'}/>
										</List.Item>
									:	<List.Item style={{height: "60px"}}  arrow="horizontal"
											onClick={() => this.goNextRoute(item.routeName, item.name, item.src)}
										>
											<span style={{ marginLeft: 12 }}>{item.displayName}</span>
										</List.Item>
								}
							</Fragment>
						))}
                	</List>
                </div>
            </div>
        );
    }
}
