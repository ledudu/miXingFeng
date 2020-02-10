import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchOnlineMusic extends Component{

	componentDidMount(){
		document.addEventListener("deviceready", this.listenBackFunc);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackFunc);
		document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackFunc = () => {
        document.addEventListener("backbutton", this.backToMainPage, false);
	}

	backToMainPage = () => {
		window.goRoute(this, "/search_column");
	}

	render(){
		const { lastNetEaseCloudSearchResult, lastQQMusicSearchResult, lastKuGouMusicSearchResult, lastKuWoMusicSearchResult, lastOnlineMusicSearchString } = this.props;
		const lastSearchResult = ["", ""]
		lastSearchResult.push({
			lastNetEaseCloudSearchResult
		})
		lastSearchResult.push({
			lastQQMusicSearchResult
		})
		lastSearchResult.push({
			lastKuGouMusicSearchResult
		})
		lastSearchResult.push({
			lastKuWoMusicSearchResult
		})
		return 	<SearchResourceComponent
					navbarText="搜索在线音乐"
					placeholder='搜索'
					type="onlineMusic"
					self={this}
					lastSearchResult={lastSearchResult}
					lastSearchString={lastOnlineMusicSearchString}
				/>
	}
}

const mapStateToProps = state => {
	return {
		lastNetEaseCloudSearchResult: state.fileServer.lastNetEaseCloudSearchResult,
		lastQQMusicSearchResult: state.fileServer.lastQQMusicSearchResult,
		lastKuGouMusicSearchResult: state.fileServer.lastKuGouMusicSearchResult,
		lastKuWoMusicSearchResult: state.fileServer.lastKuWoMusicSearchResult,
		lastOnlineMusicSearchString: state.fileServer.lastOnlineMusicSearchString,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchOnlineMusic);
