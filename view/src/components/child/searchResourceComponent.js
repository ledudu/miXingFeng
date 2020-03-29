import React, { Fragment, useRef, useEffect, useState } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import NavBar from "../child/navbar";
import InputComponent from "../child/inputComponent"
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
import { networkErr, specialBackFunc } from "../../services/utils"
import { CONSTANT } from "../../constants/enumeration"
import { removePrefixFromFileOrigin, logActivity } from "../../logic/common"

const SearchResourceComponent = ({
	lastSearchResult,
	lastSearchString,
	type,
	musicCollection,
	fileDatalist,
	musicDatalist,
	navbarText,
	placeholder,
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
}) => {
	const [ isSearching, setIsSearching ] = useState(false)
	const [ makeUpSearchString, setMakeUpSearchString ] = useState(false) //用来表示只有真的搜不到结果时才显示没有结果
	const [ moreNetEaseCloudSearch, setMoreNetEaseCloudSearch ] = useState(false)  //用来搜索过程中不可以重复点击
	const [ moreQQMusicSearch, setMoreQQMusicSearch ] = useState(false)
	const [ moreKuGouMusicSearch, setMoreKuGouMusicSearch ] = useState(false)
	const [ moreKuWoMusicSearch, setMoreKuWoMusicSearch ] = useState(false)
	const [ moreFileSearch, setMoreFileSearch ] = useState(false)
	const [ moreMusicSearch, setMoreMusicSearch ] = useState(false)
	const searchResourceInputRef = useRef()
	const history = useHistory()

	useEffect(() => {
		setMakeUpSearchString(lastSearchResult.length ? true : false)
		document.addEventListener("deviceready", listenBackButton, false);
		if(!lastSearchString && searchResourceInputRef.current){
			searchResourceInputRef.current.focus()
		}
		return () => {
			document.removeEventListener("deviceready", listenBackButton, false);
			document.removeEventListener("backbutton", backKeyDownToPrevious, false)
		}
	}, [])

	const listenBackButton = () => {
		document.addEventListener("backbutton", backKeyDownToPrevious, false)
	}

	const backKeyDownToPrevious = () => {
		if(!window.cancelMenuFirst){
			specialBackFunc()
			history.push("/search_column")
		}
	}

    const backToMainPage = () => {
		if(!window.cancelMenuFirst){
			history.push("/search_column")
		}
	}

	const generateOnlineMusicFilenameOrigin = (songInfo ) => {
		if(type === "searchAll"){
			return `searchAll_${songInfo.filenameOrigin ? songInfo.filenameOrigin : (songInfo.filename + "_" + songInfo.md5 + ".mp3")}`
		} else if(type === "onlineMusic") {
			return "onlineMusic_" + songInfo.filename + "_" + songInfo.md5 + ".mp3"
		} else if(type === "music"){
			return "searchMusic_" + songInfo.filenameOrigin
		}
	}

	const checkSongSaveOrNot = (songInfo) => {
		musicCollection.forEach(item => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(songInfo.filenameOrigin)){
				songInfo.saved = true
			}
		})
	}

	const dispatchSearchResult = (type, result) => {
		result = JSON.parse(JSON.stringify(result))
		if(type !== "file" & type !== "fileSearchAll"){
			result.forEach(item => {
				item.filenameOrigin = generateOnlineMusicFilenameOrigin(item)
				checkSongSaveOrNot(item)
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

	const dispatchSearchString = (type, query) => {
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

	const pressEnter = (e) => {
		if(e.keyCode === 13){
			logger.info("lastSearchString", lastSearchString)
			getAutoSuggest(lastSearchString)
		}
	}

	const updateValue = (e) => {
		try {
			setMakeUpSearchString(false)
			const query = e ? e.target.value : ""
			dispatchSearchString(type, query)
			if(!query) {
				setMoreNetEaseCloudSearch(false)
				setMoreQQMusicSearch(false)
				setMoreKuGouMusicSearch(false)
				setMoreKuWoMusicSearch(false)
				setMoreFileSearch(false)
				setMoreMusicSearch(false)
				return
			} else if(type === "music" || type === "file") {
				getAutoSuggest(query)
			}
		} catch(err){
			logger.error("SearchResourceComponent updateValue type", type, "err", err)
			alertDebug("SearchResourceComponent updateValue err")
		}
	}

	const getAutoSuggest = (query) => {
		logger.info("SearchResourceComponent getAutoSuggest query", query)
		if(!query) return;
		setIsSearching(true)
		setMoreNetEaseCloudSearch(false)
		setMoreQQMusicSearch(false)
		setMoreKuGouMusicSearch(false)
		setMoreKuWoMusicSearch(false)
		setMoreFileSearch(false)
		setMoreMusicSearch(false)
		if(type === "onlineMusic"){
			$dispatch(updateNoMoreNetEaseCloudResults(false))
			$dispatch(updateNoMoreQQMusicResults(false))
			$dispatch(updateNoMoreKuGouMusicResults(false))
			$dispatch(updateNoMoreKuWoMusicResults(false))
			return fetchOnlineSongs(query, CONSTANT.musicOriginal.netEaseCloud, CONSTANT.musicOriginal.qqMusic, CONSTANT.musicOriginal.kuGouMusic, CONSTANT.musicOriginal.kuWoMusic)
		} else if(type === "file" || type === "music") {
			dealWithLocalSearch(query, type)
		} else if(type === "searchAll"){
			$dispatch(updateNoMoreSearchAllNetEaseCloudResults(false))
			$dispatch(updateNoMoreSearchAllQQMusicResults(false))
			return fetchOnlineSongs(query, "netEaseCloudSearchAll", "qqMusicSearchAll", "kuGouMusicSearchAll", "kuWoMusicSearchAll")
				.then(() => {
					dealWithLocalSearch(query, "fileSearchAll", 5)
					dealWithLocalSearch(query, "musicSearchAll", 5)
				})
		}
	}

	const dealWithLocalSearch = (query, type, slice) => {
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
		dispatchSearchResult(type, result)
		setIsSearching(false)
		setMakeUpSearchString(true)
	}

	const fetchOnlineSongs = (query, netEaseCloudType, qqMusicType, kuGouMusicType, kuWoMusicType) => {
		if(!query) return;
		logger.info("SearchResourceComponent fetchOnlineSongs query", query)
		return axios.get(HTTP_URL.getOnlineMusicLists.format({query}))
			.then((response) => {
				const result = response.data.result.response;
				logger.info("SearchResourceComponent fetchOnlineSongs result")
				setIsSearching(false)
				dispatchSearchResult(netEaseCloudType, result.netEaseCloud)
				dispatchSearchResult(qqMusicType, result.qqMusic)
				dispatchSearchResult(kuGouMusicType, result.kuGouMusic)
				dispatchSearchResult(kuWoMusicType, result.kuWoMusic)
				logActivity({
					msg: ('search online music query: ' + query)
				})
			})
			.catch((err) => {
				setState({
					isSearching: false
				})
				return networkErr(err, `fetchOnlineSongs ${query}`);
			})
	}

	const showMoreSearchResult = (original) => {
		let fetchMoreMusicUrl
		if(original === CONSTANT.musicOriginal.netEaseCloud || original === "netEaseCloudSearchAll"){
			if(moreNetEaseCloudSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getNetEaseCloudMusicLists
			setMoreNetEaseCloudSearch(true)
		} else if(original === CONSTANT.musicOriginal.qqMusic || original === "qqMusicSearchAll"){
			if(moreQQMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getQQMusicLists
			setMoreQQMusicSearch(true)
		} else if(original === CONSTANT.musicOriginal.kuGouMusic || original === "kuGouMusicSearchAll"){
			if(moreKuGouMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getKuGouMusicLists
			setMoreKuGouMusicSearch(true)
		} else if(original === CONSTANT.musicOriginal.kuWoMusic || original === "kuWoMusicSearchAll"){
			if(moreKuWoMusicSearch) return;
			fetchMoreMusicUrl = HTTP_URL.getKuWoMusicLists
			setMoreKuWoMusicSearch(true)
		} else if(original === "file"){
			if(moreFileSearch) return;
			setMoreFileSearch(true)
			dealWithLocalSearch(lastSearchString, "fileSearchAll")
			return
		} else if(original === "music"){
			if(moreMusicSearch) return;
			setMoreMusicSearch(true)
			dealWithLocalSearch(lastSearchString, "musicSearchAll")
			return
		}
		if(!lastSearchString) {
			return dispatchOnlineSongResults(original)
		}
		logger.info("SearchResourceComponent showMoreSearchResult original, lastSearchString", original, lastSearchString)
		return axios.get(fetchMoreMusicUrl.format({query: lastSearchString}))
			.then((response) => {
				const result = response.data.result.response;
				logger.info("SearchResourceComponent showMoreSearchResult original, result.length", original, result.length)
				dispatchOnlineSongResults(original, result)
			})
			.catch(err => {
				dispatchOnlineSongResults(original)
				return networkErr(err, `showMoreSearchResult axios ${original}`);
			})
	}

	const dispatchOnlineSongResults = (original, result) => {
		if(original === CONSTANT.musicOriginal.netEaseCloud || original === "netEaseCloudSearchAll"){
			if(result) dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.netEaseCloud){
				$dispatch(updateNoMoreNetEaseCloudResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllNetEaseCloudResults(true))
			}
			setMoreNetEaseCloudSearch(false)
		} else if(original === CONSTANT.musicOriginal.qqMusic || original === "qqMusicSearchAll"){
			if(result) dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.qqMusic){
				$dispatch(updateNoMoreQQMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllQQMusicResults(true))
			}
			setMoreQQMusicSearch(false)
		} else if(original === CONSTANT.musicOriginal.kuGouMusic || original === "kuGouMusicSearchAll"){
			if(result) dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.kuGouMusic){
				$dispatch(updateNoMoreKuGouMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllKuGouMusicResults(true))
			}
			setMoreKuGouMusicSearch(false)
		} else if(original === CONSTANT.musicOriginal.kuWoMusic || original === "kuWoMusicSearchAll"){
			if(result) dispatchSearchResult(original, result)
			if(original === CONSTANT.musicOriginal.kuWoMusic){
				$dispatch(updateNoMoreKuWoMusicResults(true))
			} else {
				$dispatch(updateNoMoreSearchAllKuWoMusicResults(true))
			}
			setMoreKuWoMusicSearch(false)
		}
	}

	const onlineMusicComponent = ({
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
	}) => {
		console.log('lastSearchResult', lastSearchResult)
		return (
			<Fragment>
				{
					lastSearchResult[2]['lastQQMusicSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line"></div>
						<div className="online-music-header">QQ音乐</div>
						<MusicPlayer musicDataList={lastSearchResult[2]['lastQQMusicSearchResult']} original={CONSTANT.musicOriginal.qqMusic} pageType={origin} />
						<div className="online-music-more-btn last-one" onClick={() => showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.qqMusic : "qqMusicSearchAll")}>
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
					lastSearchResult[3]['lastNetEaseCloudSearchResult'].length !==0 && <div className="online-music-container">
						<div className="interval-line first-line"></div>
						<div className="online-music-header">网易云</div>
						<MusicPlayer musicDataList={lastSearchResult[3]['lastNetEaseCloudSearchResult']} original={CONSTANT.musicOriginal.netEaseCloud} pageType={origin} />
						<div className="online-music-more-btn" onClick={() => showMoreSearchResult(origin === "onlineMusic" ? CONSTANT.musicOriginal.netEaseCloud : "netEaseCloudSearchAll")}>
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
						<div className="online-music-more-btn last-one" onClick={() => showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.kuGouMusic : "kuGouMusicSearchAll")}>
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
						<div className="online-music-more-btn last-one" onClick={() => showMoreSearchResult(origin === "onlineMusic" ?  CONSTANT.musicOriginal.kuWoMusic : "kuWoMusicSearchAll")}>
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

    return (
        <div className="search-component-container">
            <NavBar centerText={navbarText}  backToPreviousPage={backToMainPage} />
            <div className="search-header">
                <div className="search-input">
					<InputComponent
						value={lastSearchString}
						placeholder={placeholder}
						handleChange={updateValue}
						handleKeyDown={pressEnter}
						className="search-input-content"
						ref={searchResourceInputRef}
					/>
					<i className="fa fa-search" aria-hidden="true"></i>
					{lastSearchString && <i className="fa fa-times-circle-o" aria-hidden="true" onClick={updateValue}></i>}
                </div>
            </div>
            <div className={`search-result-container ${type === "file" && 'isFileSearchColumn'}`}>
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
								? 	onlineMusicComponent({
									origin: "onlineMusic",
									lastSearchResult,
									noMoreNetEaseCloudResults,
									moreNetEaseCloudSearch,
									noMoreQQMusicResults,
									moreQQMusicSearch,
									noMoreKuGouMusicResults,
									moreKuGouMusicSearch,
									noMoreKuWoMusicResults,
									moreKuWoMusicSearch,
								})
								:	type === "searchAll"
								?	<Fragment>
										{
											lastSearchResult[0]['lastSearchAllFileResult'].length !==0 && <div className="online-music-container">
												<div className="online-music-header">文件</div>
												<FileManage fileDataList={lastSearchResult[0]['lastSearchAllFileResult']} original="fileSearch" type="searchAll" />
												<div className="online-music-more-btn last-one" onClick={() => showMoreSearchResult("file")}>
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
												< MusicPlayer musicDataList = {lastSearchResult[1]['lastSearchAllMusicResult']}
													original = {CONSTANT.musicOriginal.musicSearch}
													pageType = "onlineMusicSearchALl"
												/>
												<div className="online-music-more-btn last-one" onClick={() => showMoreSearchResult("music")}>
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
										{
											onlineMusicComponent({
												origin: "onlineMusicSearchALl",
												lastSearchResult,
												noMoreNetEaseCloudResults: noMoreSearchAllNetEaseCloudResults,
												moreNetEaseCloudSearch,
												noMoreQQMusicResults: noMoreSearchAllQQMusicResults,
												moreQQMusicSearch,
												noMoreKuGouMusicResults: noMoreSearchAllKuGouMusicResults,
												moreKuGouMusicSearch,
												noMoreKuWoMusicResults: noMoreSearchAllKuWoMusicResults,
												moreKuWoMusicSearch,
											})
										}
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
