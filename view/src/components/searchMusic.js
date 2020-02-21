import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchMusic extends Component{

	render(){
		const { musicList, lastMusicSearchResult, lastMusicSearchString } = this.props;
		return 	<SearchResourceComponent
					musicDatalist={musicList}
					navbarText="搜索音乐"
					placeholder='搜索'
					type="music"
					self={this}
					lastSearchResult={lastMusicSearchResult}
					lastSearchString={lastMusicSearchString}
				/>
	}
}

const mapStateToProps = state => {
	return {
		musicList: state.fileServer.musicList,
		lastMusicSearchResult: state.fileServer.lastMusicSearchResult,
		lastMusicSearchString: state.fileServer.lastMusicSearchString,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchMusic);
