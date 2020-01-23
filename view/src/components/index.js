import React, { Component } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { TabBar } from "antd-mobile";
import MyLoadable from '../Loadable';

const Sign = MyLoadable({
	loader: () => import("./sign")
});
const FileServer = MyLoadable({
	loader: () => import("./fileServer")
});
const Music = MyLoadable({
	loader: () => import("./music")
});
const MyInfo = MyLoadable({
	loader: () => import("./myInfo")
});

class MainFrame extends Component {

	componentDidMount() {
		if (window.getRoute() === "/main") {
			this.props.menuList[0] && window.goRoute(this, "/main/" + this.props.menuList[0]);
		}
	}

	render() {
		let { match, menuList, hideNavBar } = this.props;
		return (
			<div>
				<Route path={`${match.url}/sign`} component={Sign} />
				<Route path={`${match.url}/file`} component={FileServer} />
				<Route path={`${match.url}/music`} component={Music} />
				<Route path={`${match.url}/myInfo`} component={MyInfo} />
				<span className={`mainframe-menu ${hideNavBar && "hide-nav-bar"}`}>
					<TabBar unselectedTintColor="#7d7d7e" tintColor="#4876FF" barTintColor="white" >
						{this.renderTabs(match, menuList)}
					</TabBar>
				</span>
			</div>
		);
	}

	renderTabs(match, matchMenuList) {
		return matchMenuList
			.map(menuItem => {
				let { title, selectedTitle, icon, selectedIcon, badge, isDot, route } = menuItem;
				return (
					<TabBar.Item
						title={<span className={selectedTitle}>{title}</span>}
						key={route}
						icon={<i className={icon} />}
						selectedIcon={<i className={selectedIcon} />}
						selected={window.getRoute() === `${match.url}/${route}`}
						badge={badge}
						dot={isDot}
						onPress={() => {
							window.goRoute(this, `${match.url}/${route}`);
						}}
						data-seed="logId"
					/>
				);
	    	});
	}
}

const mapStateToProps = (state) => ({
	menuList: state.common.menuList,
	hideNavBar: state.common.hideNavBar,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MainFrame);
