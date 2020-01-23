import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchOnlineMusic extends Component{


	render(){
		const { lastNetEaseCloudSearchResult, lastQQMusicSearchResult, lastKuGouMusicSearchResult, lastOnlineMusicSearchString } = this.props;
		const lastSearchResult = []
		lastSearchResult.push({
			lastNetEaseCloudSearchResult
		})
		lastSearchResult.push({
			lastQQMusicSearchResult
		})
		lastSearchResult.push({
			lastKuGouMusicSearchResult
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
		lastOnlineMusicSearchString: state.fileServer.lastOnlineMusicSearchString,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchOnlineMusic);