import React, { Component } from 'react';
import { connect } from "react-redux";
import SearchResourceComponent from './child/searchResourceComponent'

class SearchFile extends Component{

	render(){
		const { fileList, lastFileSearchResult, lastFileSearchString } = this.props;
		return 	(
			<SearchResourceComponent
				fileDatalist={fileList}
				navbarText="搜索文件"
				placeholder='搜索'
				type="file"
				self={this}
				lastSearchResult={lastFileSearchResult}
				lastSearchString={lastFileSearchString}
			/>
		)
	}
}

const mapStateToProps = state => {
	return {
		fileList: state.fileServer.fileList,
		lastFileSearchResult: state.fileServer.lastFileSearchResult,
		lastFileSearchString: state.fileServer.lastFileSearchString,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchFile);
