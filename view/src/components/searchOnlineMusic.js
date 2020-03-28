import React from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

const SearchOnlineMusic = ({
	lastNetEaseCloudSearchResult,
	lastQQMusicSearchResult,
	lastKuGouMusicSearchResult,
	lastKuWoMusicSearchResult,
	lastOnlineMusicSearchString
}) => {
	const lastSearchResult = ["", ""]
	lastSearchResult.push({
		lastQQMusicSearchResult
	})
	lastSearchResult.push({
		lastNetEaseCloudSearchResult
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
				lastSearchResult={lastSearchResult}
				lastSearchString={lastOnlineMusicSearchString}
			/>
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
