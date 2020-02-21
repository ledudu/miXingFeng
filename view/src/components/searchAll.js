import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchAll extends Component{

	render(){
		const {
			lastSearchAllNetEaseCloudResult,
			lastSearchAllQQMusicSearchResult,
			lastSearchAllKuGouMusicSearchResult,
			lastSearchAllKuWoMusicSearchResult,
			lastSearchAllSearchString,
			lastSearchAllFileResult,
			lastSearchAllMusicResult,
			musicList,
			fileList
		} = this.props;
		const lastSearchResult = []
		lastSearchResult.push({
			lastSearchAllFileResult
		})
		lastSearchResult.push({
			lastSearchAllMusicResult
		})
		lastSearchResult.push({
			lastNetEaseCloudSearchResult: lastSearchAllNetEaseCloudResult
		})
		lastSearchResult.push({
			lastQQMusicSearchResult: lastSearchAllQQMusicSearchResult
		})
		lastSearchResult.push({
			lastKuGouMusicSearchResult: lastSearchAllKuGouMusicSearchResult
		})
		lastSearchResult.push({
			lastKuWoMusicSearchResult: lastSearchAllKuWoMusicSearchResult
		})
		return 	<SearchResourceComponent
					navbarText="全局搜索"
					placeholder='搜索'
					type="searchAll"
					self={this}
					lastSearchResult={lastSearchResult}
					lastSearchString={lastSearchAllSearchString}
					musicDatalist={musicList}
					fileDatalist={fileList}
				/>
	}
}

const mapStateToProps = state => {
	return {
		lastSearchAllNetEaseCloudResult: state.fileServer.lastSearchAllNetEaseCloudResult,
		lastSearchAllQQMusicSearchResult: state.fileServer.lastSearchAllQQMusicSearchResult,
		lastSearchAllKuGouMusicSearchResult: state.fileServer.lastSearchAllKuGouMusicSearchResult,
		lastSearchAllKuWoMusicSearchResult: state.fileServer.lastSearchAllKuWoMusicSearchResult,
		lastSearchAllSearchString: state.fileServer.lastSearchAllSearchString,
		lastSearchAllFileResult: state.fileServer.lastSearchAllFileResult,
		lastSearchAllMusicResult: state.fileServer.lastSearchAllMusicResult,
		musicList: state.fileServer.musicList,
		fileList: state.fileServer.fileList,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchAll);
