import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchAll extends Component{

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
		const {
			lastSearchAllNetEaseCloudResult,
			lastSearchAllQQMusicSearchResult,
			lastSearchAllKuGouMusicSearchResult,
			lastSearchAllSearchString,
			lastSearchAllFileResult,
			lastSearchAllMusicResult,
			musicList,
			fileList
		} = this.props;
		const lastSearchResult = []
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
			lastSearchAllFileResult
		})
		lastSearchResult.push({
			lastSearchAllMusicResult
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
		lastSearchAllSearchString: state.fileServer.lastSearchAllSearchString,
		lastSearchAllFileResult: state.fileServer.lastSearchAllFileResult,
		lastSearchAllMusicResult: state.fileServer.lastSearchAllMusicResult,
		musicList: state.fileServer.musicList,
		fileList: state.fileServer.fileList,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchAll);
