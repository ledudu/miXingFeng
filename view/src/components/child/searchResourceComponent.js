import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import NavBar from "../child/navbar";
import FileManage from "../fileManage"
import MusicPlayer from "../musicPlayer"
import { HTTP_URL } from "../../constants/httpRoute";
import {
	updateLastFileSearchResult,
	updateLastFileSearchString,
	updateLastMusicSearchResult,
	updateLastMusicSearchString,
	updateLastNetEaseCloudSearchResult,
	updateLastQQMusicSearchResult,
	updateLastKuGouMusicSearchResult,
	updateLastKuWoMusicSearchResult,
	updateLastOnlineMusicSearchString,
	updateNoMoreNetEaseCloudResults,
	updateNoMoreQQMusicResults,
	updateNoMoreKuGouMusicResults,
	updateNoMoreKuWoMusicResults,
	updateLastSearchAllSearchString,
	updateLastSearchAllFileResult,
	updateLastSearchAllMusicResult,
	updateLastSearchAllNetEaseCloudResult,
	updateLastSearchAllQQMusicSearchResult,
	updateLastSearchAllKuGouMusicSearchResult,
	updateLastSearchAllKuWoMusicSearchResult,
	updateNoMoreSearchAllFileResults,
	updateNoMoreSearchAllMusicSearchResult,
	updateNoMoreSearchAllNetEaseCloudResults,
	updateNoMoreSearchAllQQMusicResults,
	updateNoMoreSearchAllKuGouMusicResults,
	updateNoMoreSearchAllKuWoMusicResults,
} from "../../ducks/fileServer"
import { networkErr } from "../../services/utils"
import { CONSTANT } from "../../constants/enumeration"
import { removePrefixFromFileOrigin } from "../../logic/common"

class SearchResourceComponent extends Component {

	constructor(props){
        super(props)
        this.state = {
			isSearching: false,
			makeUpSearchString: props.lastSearchResult.length ? true : false,  //用来表示只有真的搜不到结果时才显示没有结果
			moreNetEaseCloudSearch: false,  //用来搜索过程中不可以重复点击
			moreQQMusicSearch: false,
			moreKuGouMusicSearch: false,
			moreKuWoMusicSearch: false,
			moreFileSearch: false,
			moreMusicSearch: false
        }
	}

    backToMainPage = () => {
        window.goRoute(this.props.self, "/search_column");
	}

	generateOnlineMusicFilenameOrigin = (songInfo ) => {
		const { type } = this.props
		if(type === "searchAll"){
			return `searchAll_${songInfo.filenameOrigin ? songInfo.filenameOrigin : (songInfo.filename + "_" + songInfo.md5 + ".mp3")}`
		} else if(type === "onlineMusic") {
			return "onlineMusic_" + songInfo.filename + "_" + songInfo.md5 + ".mp3"
		} else if(type === "music"){
			return "searchMusic_" + songInfo.filenameOrigin
		}
	}

	checkSongSaveOrNot = (songInfo) => {
		const { musicCollection } = this.props
		musicCollection.forEach(item => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(songInfo.filenameOrigin)){
				songInfo.saved = true
			}
		})
	}

	dispatchSearchResult = (type, result) => {
		result = JSON.parse(JSON.stringify(result))
		if(type !== "file" & type !== "fileSearchAll"){
			result.forEach(item => {
				item.filenameOrigin = this.generateOnlineMusicFilenameOrigin(item)
				this.checkSongSaveOrNot(item)
			})
		}
		switch(type){
			case "file":
				$dispatch(updateLastFileSearchResult(result))
				break;
			case "music":
				$dispatch(updateLastMusicSearchResult(result))
				break;
			case CONSTANT.musicOriginal.netEaseCloud:
				$dispatch(updateLastNetEaseCloudSearchResult(result))
				break;
			case CONSTANT.musicOriginal.qqMusic:
				$dispatch(updateLastQQMusicSearchResult(result))
				break;
			case CONSTANT.musicOriginal.kuGouMusic:
				$dispatch(updateLastKuGouMusicSearchResult(result))
				break;
			case CONSTANT.musicOriginal.kuWoMusic:
				$dispatch(updateLastKuWoMusicSearchResult(result))
				break;
			case "onlineMusic":
				$dispatch(updateLastNetEaseCloudSearchResult([]))
				$dispatch(updateLastQQMusicSearchResult([]))
				$dispatch(updateLastKuGouMusicSearchResult([]))
				$dispatch(updateLastKuWoMusicSearchResult([]))
				break;
			case "searchAll":
				$dispatch(updateLastSearchAllFileResult([]))
				$dispatch(updateLastSearchAllMusicResult([]))
				$dispatch(updateLastSearchAllNetEaseCloudResult([]))
				$dispatch(updateLastSearchAllQQMusicSearchResult([]))
				$dispatch(updateLastSearchAllKuGouMusicSearchResult([]))
				$dispatch(updateLastSearchAllKuWoMusicSearchResult([]))
				break;
			case "netEaseCloudSearchAll":
				$dispatch(updateLastSearchAllNetEaseCloudResult(result))
				break;
			case "qqMusicSearchAll":
				$dispatch(updateLastSearchAllQQMusicSearchResult(result))
				break;
			case "kuGouMusicSearchAll":
				$dispatch(updateLastSearchAllKuGouMusicSearchResult(result))
				break
			case "kuWoMusicSearchAll":
				$dispatch(updateLastSearchAllKuWoMusicSearchResult(result))
				break
			case "fileSearchAll":
				$dispatch(updateLastSearchAllFileResult(result))
				break;
			case "musicSearchAll":
				$dispatch(updateLastSearchAllMusicResult(result))
				break;
			default:
				break;
		}
	}

	dispatchSearchString = (type, query) => {
		switch(type){
			case "file":
				$dispatch(updateLastFileSearchString(query))
				break;
			case "music":
				$dispatch(updateLastMusicSearchString(query))
				break;
			case "onlineMusic":
				$dispatch(updateLastOnlineMusicSearchString(query))
				break;
			case "searchAll":
				$dispatch(updateLastSearchAllSearchString(query))
				break;
			default:
				break;
		}
	}

	pressEnter = (e) => {
		if(e.keyCode === 13){
			logger.info("this.props.lastSearchString", this.props.lastSearchString)
			this.getAutoSuggest(this.props.lastSearchString)
		}
	}

	updateValue = (e) => {
		try {
			const { type } = this.props
			this.setState({
				makeUpSearchString: false
			});
			const query = e ? e.target.value : ""
			this.dispatchSearchString(type, query)
			if(!query) {
				this.setState({
					moreNetEaseCloudSearch: false,
					moreQQMusicSearch: false,
					moreKuGouMusicSearch: false,
					moreKuWoMusicSearch: false,
					moreFileSearch: false,
					moreMusicSearch: false
				})
				return
			}
			if (this.timer) clearTimeout(this.timer);
			let debounceTime = 100;
			if(type === "onlineMusic" || type === "searchAll"){
				debounceTime = 800;
			}
			this.timer = setTimeout(() => this.getAutoSuggest(query), debounceTime);
		} catch(err){
			logger.error("SearchResourceComponent updateValue type", this.props.type, "err", err)
			alertDebug("SearchResourceComponent updateValue err")
		}
	}

	getAutoSuggest = (query) => {
		logger.info("SearchResourceComponent getAutoSuggest query", query)
		const { lastSearchString } = this.props;
		if(!query || !lastSearchString) return;
		const { type } = this.props
		this.setState({
			isSearching: true,
			moreNetEaseCloudSearch: false,
			moreQQMusicSearch: false,
			moreKuGouMusicSearch: false,
			moreKuWoMusicSearch: false,
			moreFileSearch: false,
			moreMusicSearch: false
		})
		if(type === "onlineMusic"){
			$dispatch(updateNoMoreNetEaseCloudResults(false))
			$dispatch(updateNoMoreQQMusicResults(false))
			$dispatch(updateNoMoreKuGouMusicResults(false))
			$dispatch(updateNoMoreKuWoMusicResults(false))
			return this.fetchOnlineSongs(query, CONSTANT.musicOriginal.netEaseCloud, CONSTANT.musicOriginal.qqMusic, CONSTANT.musicOriginal.kuGouMusic, CONSTANT.musicOriginal.kuWoMusic)
		} else if(type === "file" || type === "music") {
			this.dealWithLocalSearch(query, type)
		} else if(type === "searchAll"){
			$dispatch(updateNoMoreSearchAllNetEaseCloudResults(false))
			$dispatch(updateNoMoreSearchAllQQMusicResults(false))
			return this.fetchOnlineSongs(query, "netEaseCloudSearchAll", "qqMusicSearchAll", "kuGouMusicSearchAll", "kuWoMusicSearchAll")
				.then(() => {
					this.dealWithLocalSearch(query, "fileSearchAll", 5)
					this.dealWithLocalSearch(query, "musicSearchAll", 5)
				})
		}
	}

	dealWithLocalSearch = (query, type, slice) => {
		const { fileDatalist=[], musicDatalist=[] } = this.props
		let result = []
		if(type === "file" || type === "fileSearchAll"){
			fileDatalist.forEach(item => {
				if(item.filename.toLowerCase().indexOf(query.toLowerCase()) === 0){
					result.push(item)
				}
			})
		} else if(type === "music" || type === "musicSearchAll"){
			musicDatalist.forEach(item => {
				if(item.filename.toLowerCase().indexOf(query.toLowerCase()) === 0){
					result.push(item)
				}
			})
		}
		if(slice){
			if(result.length <= slice){
				if(type === "fileSearchAll"){
					$dispatch(updateNoMoreSearchAllFileResults(true))
				} else if(type === "musicSearchAll"){
					$dispatch(updateNoMoreSearchAllMusicSearchResult(true))
				}
			} else {
				if(type === "fileSearchAll"){
					$dispatch(updateNoMoreSearchAllFileResults(false))
				} else if(type === "musicSearchAll"){
					$dispatch(updateNoMoreSearchAllMusicSearchResult(false))
				}
			}
			result = result.slice(0, slice)
		} else {
			if(type === "fileSearchAll"){
				$dispatch(updateNoMoreSearchAllFileResults(true))
			} else if(type === "musicSearchAll"){
				$dispatch(updateNoMoreSearchAllMusicSearchResult(true))
			}
		}
		this.dispatchSearchResult(type, result)
		this.setState({
			isSearching: false,
			makeUpSearchString: true
		})
	}

	fetchOnlineSongs = (query, netEaseCloudType, qqMusicType, kuGouMusicType, kuWoMusicType) => {
		if(!query) return;
		return axios.get(HTTP_URL.getOnlineMusicLists.format({query}))
			.then((response) => {
				const result = response.data.result.response;
				this.setState({
					isSearching: false
				})
				this.dispatchSearchResult(netEaseCloudType, result.netEaseCloud)
				this.dispatchSearchResult(qqMusicType, result.qqMusic)
				this.dispatchSearchResult(kuGouMusicType, result.kuGouMusic)
				this.dispatchSearchResult(kuWoMusicType, result.kuWoMusic)
			})
			.catch((err) => {
				this.setState({
					isSearching: false
				})
				return networkErr(err);
			})
	}

	showMoreSearchResult = (original) => {
		const { moreNetEaseCloudSearch, moreQQMusicSearch, moreKuGouMusicSearch, moreKuWoMusicSearch, moreFileSearch, moreMusicSearch } = this.state;
		const { lastSearchString } = this.props;
		let fetchMoreMusicUrl
		if(original === CONSTANT.musicOriginal.netEaseCloud || original === "netEaseCloudSearchAll"){
			if(moreNetEaseCloudSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getNetEaseCloudMusicLists
			this.setState({
				moreNetEaseCloudSearch: true
			})
		} else if(original === CONSTANT.musicOriginal.qqMusic || original === "qqMusicSearchAll"){
			if(moreQQMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getQQMusicLists
			this.setState({
				moreQQMusicSearch: true
			})
		} else if(original === CONSTANT.musicOriginal.kuGouMusic || original === "kuGouMusicSearchAll"){
			if(moreKuGouMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getKuGouMusicLists
			this.setState({
				moreKuGouMusicSearch: true
			})
		} else if(original === CONSTANT.musicOriginal.kuWoMusic || original === "kuWoMusicSearchAll"){
			if(moreKuWoMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getKuWoMusicLists
			this.setState({
				moreKuWoMusicSearch: true
			})
		} else if(original === "file"){
			if(moreFileSearch) return;
			this.setState({
				moreFileSearch: true
			})
			this.dealWithLocalSearch(lastSearchString, "fileSearchAll")
			return
		} else if(original === "music"){
			if(moreMusicSearch) return;
			this.setState({
				moreMusicSearch: true
			})
			this.dealWithLocalSearch(lastSearchString, "musicSearchAll")
			return
		}
		if(!lastSearchString) {
			return this.dispatchOnlineSongResults(original)
		}
		return axios.get(fetchMoreMusicUrl.format({query: lastSearchString}))
			.then((response) => {
				const result = response.data.result.response;
				this.dispatchOnlineSongResults(original, result)
			})
			.catch(err => {
				this.dispatchOnlineSongResults(original)
				return networkErr(err);
			})
	}

	dispatchOnlineSongResults = (original, result) => {
		if(original === CONSTANT.musicOriginal.netEaseCloud || original === "netEaseCloudSearchAll"){
			if(result) this.dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.netEaseCloud){
				$dispatch(updateNoMoreNetEaseCloudResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllNetEaseCloudResults(true))
			}
			this.setState({
				moreNetEaseCloudSearch: false
			})
		} else if(original === CONSTANT.musicOriginal.qqMusic || original === "qqMusicSearchAll"){
			if(result) this.dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.qqMusic){
				$dispatch(updateNoMoreQQMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllQQMusicResults(true))
			}
			this.setState({
				moreQQMusicSearch: false
			})
		} else if(original === CONSTANT.musicOriginal.kuGouMusic || original === "kuGouMusicSearchAll"){
			if(result) this.dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.kuGouMusic){
				$dispatch(updateNoMoreKuGouMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllKuGouMusicResults(true))
			}
			this.setState({
				moreQQMusicSearch: false
			})
		} else if(original === CONSTANT.musicOriginal.kuWoMusic || original === "kuWoMusicSearchAll"){
			if(result) this.dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.kuWoMusic){
				$dispatch(updateNoMoreKuWoMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllKuWoMusicResults(true))
			}
			this.setState({
				moreQQMusicSearch: false
			})
		}
	}

	onlineMusicComponent = (
		origin,
		lastSearchResult,
		noMoreNetEaseCloudResults,
		moreNetEaseCloudSearch,
		noMoreQQMusicResults,
		moreQQMusicSearch,
		noMoreKuGouMusicResults,
		moreKuGouMusicSearch,
		noMoreKuWoMusicResults,
		moreKuWoMusicSearch,
	) => {
		return (
			<Fragment>
				{
					lastSearchResult[3]['lastQQMusicSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line"></div>
						<div className="online-music-header">QQ音乐</div>
						<MusicPlayer musicDataList={lastSearchResult[3]['lastQQMusicSearchResult']} original={CONSTANT.musicOriginal.qqMusic} pageType={origin} />
						<div className="online-music-more-btn last-one" onClick={() => this.showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.qqMusic : "qqMusicSearchAll")}>
							{!noMoreQQMusicResults && <i className={`fa fa-search ${moreQQMusicSearch && "searching-status"}`} aria-hidden="true"></i>}
							{
								(moreQQMusicSearch && !noMoreQQMusicResults)
								?	<span className="searching-text">正在查询...</span>
								:	noMoreQQMusicResults
								?	null
								:	<span className="more-results-text">更多结果</span>
							}
						</div>
					</div>
				}
				{
					lastSearchResult[2]['lastNetEaseCloudSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line first-line"></div>
						<div className="online-music-header">网易云</div>
						<MusicPlayer musicDataList={lastSearchResult[2]['lastNetEaseCloudSearchResult']} original={CONSTANT.musicOriginal.netEaseCloud} pageType={origin} />
						<div className="online-music-more-btn" onClick={() => this.showMoreSearchResult(origin === "onlineMusic" ? CONSTANT.musicOriginal.netEaseCloud : "netEaseCloudSearchAll")}>
							{!noMoreNetEaseCloudResults && <i className={`fa fa-search ${moreNetEaseCloudSearch && "searching-status"}`} aria-hidden="true"></i>}
							{
								(moreNetEaseCloudSearch && !noMoreNetEaseCloudResults)
								?	<span className="searching-text">正在查询...</span>
								:	noMoreNetEaseCloudResults
								?	null
								:	<span className="more-results-text">更多结果</span>
							}
						</div>
					</div>
				}
				{
					lastSearchResult[4]['lastKuGouMusicSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line"></div>
						<div className="online-music-header">酷狗音乐</div>
						<MusicPlayer musicDataList={lastSearchResult[4]['lastKuGouMusicSearchResult']} original={CONSTANT.musicOriginal.kuGouMusic} pageType={origin} />
						<div className="online-music-more-btn last-one" onClick={() => this.showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.kuGouMusic : "kuGouMusicSearchAll")}>
							{!noMoreKuGouMusicResults && <i className={`fa fa-search ${moreKuGouMusicSearch && "searching-status"}`} aria-hidden="true"></i>}
							{
								(moreKuGouMusicSearch && !noMoreKuGouMusicResults)
								?	<span className="searching-text">正在查询...</span>
								:	noMoreKuGouMusicResults
								?	null
								:	<span className="more-results-text">更多结果</span>
							}
						</div>
					</div>
				}
				{
					lastSearchResult[5]['lastKuWoMusicSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line"></div>
						<div className="online-music-header">酷我音乐</div>
						<MusicPlayer musicDataList={lastSearchResult[5]['lastKuWoMusicSearchResult']} original={CONSTANT.musicOriginal.kuWoMusic} pageType={origin} />
						<div className="online-music-more-btn last-one" onClick={() => this.showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.kuWoMusic : "kuWoMusicSearchAll")}>
							{!noMoreKuWoMusicResults && <i className={`fa fa-search ${moreKuWoMusicSearch && "searching-status"}`} aria-hidden="true"></i>}
							{
								(moreKuWoMusicSearch && !noMoreKuWoMusicResults)
								?	<span className="searching-text">正在查询...</span>
								:	noMoreKuWoMusicResults
								?	null
								:	<span className="more-results-text">更多结果</span>
							}
						</div>
					</div>
				}
			</Fragment>
		)
	}

    render(){
		const { isSearching, makeUpSearchString, moreFileSearch, moreMusicSearch, moreNetEaseCloudSearch, moreQQMusicSearch, moreKuGouMusicSearch, moreKuWoMusicSearch } = this.state;
		const {
			navbarText,
			placeholder,
			type,
			lastSearchString,
			lastSearchResult,
			noMoreNetEaseCloudResults,
			noMoreQQMusicResults,
			noMoreKuGouMusicResults,
			noMoreKuWoMusicResults,
			noMoreSearchAllFileResults,
			noMoreSearchAllMusicResults,
			noMoreSearchAllNetEaseCloudResults,
			noMoreSearchAllQQMusicResults,
			noMoreSearchAllKuGouMusicResults,
			noMoreSearchAllKuWoMusicResults,
		} = this.props;
        return (
            <div className="search-component-container">
                <NavBar centerText={navbarText}  backToPreviousPage={this.backToMainPage} />
                <div className="search-header">
                    <div className="search-input">
						<input className="search-input-content" value={lastSearchString} onKeyDown={this.pressEnter}
							autoComplete="off" placeholder={placeholder} onChange={this.updateValue}/>
						<i className="fa fa-search" aria-hidden="true"></i>
						{lastSearchString && <i className="fa fa-times-circle-o" aria-hidden="true" onClick={() => this.updateValue()}></i>}
                    </div>
                </div>
                <div className={`search-result-container net-ease-cloud-container`}>
					{
						isSearching
						? 	<div className="searching">正在查询...</div>
						: 	lastSearchResult.length
						?	<div className="search-result-content">
								{
									type === "file"
									?	<FileManage fileDataList={lastSearchResult} original="fileSearch" type="file" />
									:	type === 'music'
									?	<MusicPlayer musicDataList={lastSearchResult} original={CONSTANT.musicOriginal.musicSearch} pageType="onlySearchShareMusic" />
									:	type === 'onlineMusic'
									?	this.onlineMusicComponent("onlineMusic", lastSearchResult, noMoreNetEaseCloudResults, moreNetEaseCloudSearch, noMoreQQMusicResults, moreQQMusicSearch, noMoreKuGouMusicResults, moreKuGouMusicSearch, noMoreKuWoMusicResults, moreKuWoMusicSearch)
									:	type === "searchAll"
									?	<Fragment>
											{
												lastSearchResult[0]['lastSearchAllFileResult'].length !==0 && <div className="online-music-container">
													<div className="online-music-header">文件</div>
													<FileManage fileDataList={lastSearchResult[0]['lastSearchAllFileResult']} original="fileSearch" type="searchAll" />
													<div className="online-music-more-btn last-one" onClick={() => this.showMoreSearchResult("file")}>
														{!noMoreSearchAllFileResults && <i className={`fa fa-search ${moreFileSearch && "searching-status"}`} aria-hidden="true"></i>}
														{
															(moreFileSearch && !noMoreSearchAllFileResults)
															?	<span className="searching-text">正在查询...</span>
															:	noMoreSearchAllFileResults
															?	null
															:	<span className="more-results-text">更多结果</span>
														}
													</div>
												</div>
											}
											{
												lastSearchResult[1]['lastSearchAllMusicResult'].length !==0 && <div className="online-music-container">
													<div className="interval-line"></div>
													<div className="online-music-header">音乐</div>
													<MusicPlayer musicDataList={lastSearchResult[1]['lastSearchAllMusicResult']} original={CONSTANT.musicOriginal.musicSearch} pageType="onlineMusicSearchALl" />
													<div className="online-music-more-btn last-one" onClick={() => this.showMoreSearchResult("music")}>
														{!noMoreSearchAllMusicResults && <i className={`fa fa-search ${moreMusicSearch && "searching-status"}`} aria-hidden="true"></i>}
														{
															(moreMusicSearch && !noMoreSearchAllMusicResults)
															?	<span className="searching-text">正在查询...</span>
															:	noMoreSearchAllMusicResults
															?	null
															:	<span className="more-results-text">更多结果</span>
														}
													</div>
												</div>
											}
											{this.onlineMusicComponent("onlineMusicSearchALl", lastSearchResult, noMoreSearchAllNetEaseCloudResults, moreNetEaseCloudSearch, noMoreSearchAllQQMusicResults, moreQQMusicSearch, noMoreSearchAllKuGouMusicResults, moreKuGouMusicSearch, noMoreSearchAllKuWoMusicResults, moreKuWoMusicSearch,)}
										</Fragment>
									:	null
								}
							</div>
						:	(makeUpSearchString && <div className="no-result">没有结果</div>)
					}
                </div>
            </div>
        )
    }
};

const mapStateToProps = state => {
	return {
		noMoreNetEaseCloudResults: state.fileServer.noMoreNetEaseCloudResults,
		noMoreQQMusicResults: state.fileServer.noMoreQQMusicResults,
		noMoreKuGouMusicResults: state.fileServer.noMoreKuGouMusicResults,
		noMoreKuWoMusicResults: state.fileServer.noMoreKuWoMusicResults,
		noMoreSearchAllFileResults: state.fileServer.noMoreSearchAllFileResults,
		noMoreSearchAllMusicResults: state.fileServer.noMoreSearchAllMusicResults,
		noMoreSearchAllNetEaseCloudResults: state.fileServer.noMoreSearchAllNetEaseCloudResults,
		noMoreSearchAllQQMusicResults: state.fileServer.noMoreSearchAllQQMusicResults,
		noMoreSearchAllKuGouMusicResults: state.fileServer.noMoreSearchAllKuGouMusicResults,
		noMoreSearchAllKuWoMusicResults: state.fileServer.noMoreSearchAllKuWoMusicResults,
		musicCollection: state.fileServer.musicCollection,
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchResourceComponent);

