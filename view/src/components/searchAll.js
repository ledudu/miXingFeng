import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

const SearchAll = ({
	lastSearchAllNetEaseCloudResult,
	lastSearchAllQQMusicSearchResult,
	lastSearchAllKuGouMusicSearchResult,
	lastSearchAllKuWoMusicSearchResult,
	lastSearchAllSearchString,
	lastSearchAllFileResult,
	lastSearchAllMusicResult,
	musicList,
	fileList
}) => {
	const lastSearchResult = []
	lastSearchResult.push({
		lastSearchAllFileResult
	})
	lastSearchResult.push({
		lastSearchAllMusicResult
	})
	lastSearchResult.push({
		lastQQMusicSearchResult: lastSearchAllQQMusicSearchResult
	})
	lastSearchResult.push({
		lastNetEaseCloudSearchResult: lastSearchAllNetEaseCloudResult
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
				lastSearchResult={lastSearchResult}
				lastSearchString={lastSearchAllSearchString}
				musicDatalist={musicList}
				fileDatalist={fileList}
			/>
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
