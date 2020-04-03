import React, { useEffect, useState, Fragment } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import { Howler } from 'howler';
import { ActionSheet } from 'antd-mobile';
import { HTTP_URL } from "../constants/httpRoute";
import MusicPlaying from "./musicPlaying"
import {
	updatePauseWhenOver,
	updatePlayByOrder,
	updateMusicMenuBadge,
	updatePlayByRandom,
	updateLastMusicSearchResult,
	updateLastSearchAllMusicResult,
	updateRecentMusicList,
} from "../ducks/fileServer";
import {
	confirm,
	networkErr,
	onBackKeyDown,
	specialBackFunc,
	shareLinkToWeChat
} from "../services/utils";
import { updateToken } from "../ducks/login";
import {
	calcSize,
	optimizeLoadPerformance,
	removeFileFromDownload,
	removePrefixFromFileOrigin,
	saveSongFunc,
	playNextSong,
	getMusicCurrentPlayProcess,
	checkStatus,
	getFilenameWithoutExt,
	saveMusicToLocal,
	secondsToTime,
	checkSongSavedFunc
} from "../logic/common";
import { CONSTANT } from '../constants/enumeration';
import { removeRecentMusicDataByIndexFromIndexDB } from "../services/indexDBRecentMusic"

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
	wrapProps = {
		onTouchStart: e => e.preventDefault(),
	};
}

const MusicPlayer = ({
	original,
	soundInstance,
	currentPlayingSong,
	currentSongTime,
	soundPlaying,
	pageType,
	pauseWhenOver,
	playByOrder,
	musicCollection=[],
	musicMenuBadge,
	username,
	token,
	playByRandom,
	setMobile,
	musicDataList,
	lastMusicSearchResult,
	lastSearchAllMusicResult,
	recentMusicList,
	showMusicPlayingFromMusicControl,
	noShowMusicPlaying=false,
	myMusicPage=false,
	searchMusicPage=false
}) => {

	const history = useHistory()
	const [ firstRender, setFirstRender ] = useState(true)

	useEffect(() => {
		Howler.volume(0.8);
		if(original !== CONSTANT.musicOriginal.musicDownloading){
			if(soundInstance) getMusicCurrentPlayProcess(false)
		}
		document.addEventListener("deviceready", listenBackButton, false);
		return () => {
			document.removeEventListener("deviceready", listenBackButton, false);
			document.removeEventListener("backbutton", handleMusicBackEventFunc, false)
		}
	}, [])

	const listenBackButton = () => {
		document.addEventListener("backbutton", handleMusicBackEventFunc, false);
	}

	const handleMusicBackEventFunc = () => {
		// 统一管理音乐页面的物理返回键
		if(!window.cancelMenuFirst && !$getState().fileServer.showMusicPlayingFromMusicControl){
			if(myMusicPage){
				specialBackFunc()
				history.push("/my_download_middle_page")
			} else if(searchMusicPage){
				specialBackFunc()
				history.push("/search_column")
			}
		} else if($getState().fileServer.showMusicPlayingFromMusicControl){
			// 显示正在播放页的时候按物理返回键取消默认的后退事件,后退事件由正在播放页控制
			specialBackFunc()
		}
	}

	const listenBackFunc = () => {
		window.cancelMenuFirst = true
		document.addEventListener("backbutton", closeShowMenu);
	}

	const removeListenBackFunc = () => {
		if(window.cancelMenuFirst){
			window.cancelMenuFirst = false
			document.removeEventListener("backbutton", closeShowMenu);
			document.removeEventListener("deviceready", listenBackFunc);
			document.addEventListener("backbutton", onBackKeyDown);
		}
	}

	const closeShowMenu = () => {
		const musicMenuExisted = document.querySelector('.am-action-sheet-button-list div:nth-last-child(1)')
		if(musicMenuExisted) musicMenuExisted.click();
	}

	const showMenu = (filename, fileSize, filenameOrigin, uploadUsername, duration, songOriginal, payPlay, payDownload, musicId, date) => {
		document.removeEventListener("backbutton", onBackKeyDown, false);
		document.addEventListener("deviceready", listenBackFunc);
		const musicMenuBadgeCopy = JSON.parse(JSON.stringify(musicMenuBadge))
		const savedMusicFilenameOriginalArr = musicCollection.map(item => removePrefixFromFileOrigin(item.filenameOrigin))
		const hasSaved = savedMusicFilenameOriginalArr.indexOf(removePrefixFromFileOrigin(filenameOrigin));
		const buttons = ['播放', (hasSaved !== -1) ? '已收藏' : "收藏", '单曲播放', '单曲循环', '顺序播放', '随机播放', '下载', '删除', '取消'];
		if(soundPlaying && filenameOrigin === currentPlayingSong){
			buttons[0] = "暂停"
		}
		if(original === CONSTANT.musicOriginal.musicShare || original === CONSTANT.musicOriginal.musicSearch){
			date = ` ${date}`
		} else {
			date = ""
		}
		const showActionSheetWithOptionsConfig = {
			options: buttons,
			cancelButtonIndex: buttons.length - 1,
			destructiveButtonIndex:  buttons.length - 2,
			badges: musicMenuBadgeCopy,
			message: fileSize ? `大小: ${calcSize(fileSize)}${date}` : date,
			title: filename,
			maskClosable: true,
			'data-seed': 'logId',
			wrapProps,
		}
		if(original === CONSTANT.musicOriginal.musicFinished){
			//  已下载页面的菜单没有下载功能，原来下载的位置要换成删除本地音乐的函数
			buttons.splice(6, 1);
			showActionSheetWithOptionsConfig.destructiveButtonIndex = buttons.length - 2
		} else {
			if(payDownload){
				musicMenuBadgeCopy.push({
					index: 6,
					text: '版',
				})
			}
			if(pageType === CONSTANT.musicOriginal.savedSongs || pageType === "onlineMusic" || pageType === "onlineMusicSearchALl"){
				// 收藏页面和搜索在线音乐页面的菜单没有删除功能
				buttons.splice(7, 1);
				delete showActionSheetWithOptionsConfig.destructiveButtonIndex
			}
		}
		ActionSheet.showActionSheetWithOptions(
			showActionSheetWithOptionsConfig,
			(buttonIndex) => {
				logger.info("music player showMenu buttonIndex", buttonIndex)
				const currentMusicFilenameOriginalArr = musicDataList.map(item => item.filenameOrigin)
				let currentFileIndex = currentMusicFilenameOriginalArr.indexOf(filenameOrigin)
				if(currentFileIndex === -1){
					logger.error("showActionSheetWithOptions currentFileIndex === -1 filename", filename)
					return alert(filename + "已被删除")
				}
				const filePath = musicDataList[currentFileIndex]['filePath']
				switch(buttonIndex){
					case 0:
						checkStatus({
							filePath,
							filename,
							filenameOrigin,
							uploadUsername,
							fileSize,
							duration,
							songOriginal,
							original,
							musicDataList,
							pageType,
							payPlay,
							musicId
						})
						break;
					case 1:
						saveSongFunc(savedMusicFilenameOriginalArr, filenameOrigin, musicCollection, musicDataList, currentFileIndex, original, null, pageType)
						break;
					case 2:
						if(!pauseWhenOver || playByOrder || playByRandom){
							soundInstance && soundInstance.loop(false)
							$dispatch(updatePauseWhenOver(true))
							$dispatch(updatePlayByOrder(false))
							$dispatch(updatePlayByRandom(false))
							alert('单曲播放')
							$dispatch(updateMusicMenuBadge([
								{
									index: 2,
									text: '✔️',
								}, {
									index: 3,
									text: '',
								}, {
									index: 4,
									text: '',
								}, {
									index: 5,
									text: '',
								}
							]))
						}
						break;
					case 3:
						if(pauseWhenOver){
							soundInstance && soundInstance.loop(true)
							$dispatch(updatePauseWhenOver(false))
							$dispatch(updatePlayByOrder(false))
							$dispatch(updatePlayByRandom(false))
							alert('单曲循环')
							$dispatch(updateMusicMenuBadge([
								{
									index: 2,
									text: '',
								}, {
									index: 3,
									text: '✔️',
								}, {
									index: 4,
									text: '',
								}, {
									index: 5,
									text: '',
								}
							]))
						}
						break;
					case 4:
						if(!playByOrder){
							if(soundInstance){
								soundInstance.loop(false);
							}
							$dispatch(updatePauseWhenOver(true))
							$dispatch(updatePlayByOrder(true))
							$dispatch(updatePlayByRandom(false))
							alert('顺序播放')
							$dispatch(updateMusicMenuBadge([
								{
									index: 2,
									text: '',
								}, {
									index: 3,
									text: '',
								}, {
									index: 4,
									text: '✔️',
								}, {
									index: 5,
									text: '',
								}
							]))
						}
						break;
					case 5:
						if(!playByRandom){
							if(soundInstance){
								soundInstance.loop(false);
							}
							$dispatch(updatePauseWhenOver(true))
							$dispatch(updatePlayByOrder(false))
							$dispatch(updatePlayByRandom(true))
							alert('随机播放')
							$dispatch(updateMusicMenuBadge([
								{
									index: 2,
									text: '',
								}, {
									index: 3,
									text: '',
								}, {
									index: 4,
									text: '',
								}, {
									index: 5,
									text: '✔️',
								}
							]))
						}
						break;
					case 6:
						if(original === CONSTANT.musicOriginal.musicFinished){
							confirm(`提示`, `确定从本地删除${filename}吗`, "确定", () => {
								return removeFileFromDownload(removePrefixFromFileOrigin(filenameOrigin), "music")
									.then(() => {
										if(filenameOrigin === currentPlayingSong){
											localStorage.removeItem('lastPlaySongInfo')
											localStorage.removeItem('lastPlaySongPageType')
											localStorage.removeItem('lastPlaySongMusicDataList')
											playNextSong(currentFileIndex - 1, currentMusicFilenameOriginalArr, original, musicDataList, null)
										}
									})
									.catch(error => {
										logger.error("删除音乐过程中发生了错误 isFileFinished", error.stack||error.toString());
										networkErr(error, `musicPlayer removeFileFromDownload filenameOrigin: ${filenameOrigin}`);
									})
							})
						} else {
							const musicSrc = filePath
							//  下载觅星峰服务器上的音乐，保存的文件名为filenameOrigin,
							//  filenameOrigin由上传者用户名加文件名加时间戳构成，filenameOrigin是文件的id，唯一且不可变
							//  下载网易云或qq音乐，保存的文件名为filename+_+fileMD5+后缀名
							//  因为共享音乐列表可能存在秒传音乐，所以列表可能存在两个相同md5的音乐，
							//  为了唯一的辨别每一个音乐，觅星峰服务器上的音乐md5由客户端随机生成，是不可靠的
							//  所以在保存觅星峰服务器上的音乐时，保存的文件名特意为以上格式，
							//  如果将要下载的音乐信息和已下载的音乐名称相同，则认为这个音乐已经下载了
							saveMusicToLocal(musicDataList, filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal, musicId, payDownload)
						}
						break;
					case 7:
						removeListenBackFunc()
						if(pageType === "onlineMusic" || pageType === "onlineMusicSearchALl" || original === CONSTANT.musicOriginal.musicFinished){
							return
						}
						if(!token) return window.goRoute(this, "/login")
						const dataInfo = {
							username: username || setMobile,
							token,
							filename,
							type: "default-music"
						}
						if(original === CONSTANT.musicOriginal.musicShare || original === CONSTANT.musicOriginal.musicSearch){
							let startToDelete = false
							confirm('提示', `确定要从服务器删除${filename}吗`, "确定", () => {
								if(!startToDelete){
									startToDelete = true
									return axios.delete(HTTP_URL.delFile, {data: dataInfo})
										.then((result) => {
											startToDelete = false
											if(result.data.result.result === 'success'){
												$dispatch(updateToken(result.data.result.token))
												//  实时更新搜索列表里被删除的音乐
												alert('删除成功')
												return updateSearchList(original, filenameOrigin)
											}  else if (result.data.result.result === 'file_deleted') {
												alert("文件已删除!");
												return updateSearchList(original, filenameOrigin)
											} else {
												logger.error("HTTP_URL.delFile result", result)
											}
										})
										.then(() => {
											if(filenameOrigin === currentPlayingSong){
												localStorage.removeItem('lastPlaySongInfo')
												localStorage.removeItem('lastPlaySongPageType')
												localStorage.removeItem('lastPlaySongMusicDataList')
												playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, original, musicDataList, null)
											}
										})
										.catch(err => {
											startToDelete = false
											logger.error("HTTP_URL.delFile err", err)
											networkErr(err, `musicPlayer delFile filenameOrigin: ${filenameOrigin}`);
										})
								}
							})
						} else if(original === CONSTANT.musicOriginal.musicRecent){
							let startToDelete
							confirm('提示', `确定要删除${filename}的播放记录吗`, "确定", () => {
								if(!startToDelete){
									startToDelete = true
									let currentItemIndex = null
									recentMusicList.some((item, index) => {
										if(item.filenameOrigin === filenameOrigin){
											currentItemIndex = index;
											return true
										}
									})
									if(currentItemIndex !== null){
										const recentMusicListCopy = JSON.parse(JSON.stringify(recentMusicList))
										recentMusicListCopy.splice(currentItemIndex, 1)
										$dispatch(updateRecentMusicList(recentMusicListCopy))
										removeRecentMusicDataByIndexFromIndexDB(filenameOrigin)
										if(filenameOrigin === currentPlayingSong){
											localStorage.removeItem('lastPlaySongInfo')
											localStorage.removeItem('lastPlaySongPageType')
											localStorage.removeItem('lastPlaySongMusicDataList')
											const currentMusicFilenameOriginalArr = recentMusicList.map(item => item.filenameOrigin)
											playNextSong(currentFileIndex-1, currentMusicFilenameOriginalArr, original, recentMusicList, null)
										}
									} else {
										logger.error("确定要删除播放记录吗 filenameOrigin, recentMusicList", filenameOrigin, recentMusicList)
									}
								}
							})
						} else if(original === CONSTANT.musicOriginal.savedSongs){
							return shareLinkToWeChat({
								title: filename,
								description: secondsToTime(duration)
							})
						}
						break;
					default:
						removeListenBackFunc()
						break;
				}
				removeListenBackFunc()
			}
		);
	}

	const updateSearchList = (original, filenameOrigin) => {
		if(original === CONSTANT.musicOriginal.musicSearch){
			let lastMusicSearchResultIndex, lastSearchAllMusicResultIndex
			lastMusicSearchResult.some((item, index) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin)){
					lastMusicSearchResultIndex = index
					return true
				}
			})
			const lastMusicSearchResultCopy = JSON.parse(JSON.stringify(lastMusicSearchResult))
			lastMusicSearchResultCopy.splice(lastMusicSearchResultIndex, 1)
			lastSearchAllMusicResult.some((item, index) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin)){
					lastSearchAllMusicResultIndex = index
					return true
				}
			})
			const lastSearchAllMusicResultCopy = JSON.parse(JSON.stringify(lastSearchAllMusicResult))
			lastSearchAllMusicResultCopy.splice(lastSearchAllMusicResultIndex, 1)
			$dispatch(updateLastMusicSearchResult(lastMusicSearchResultCopy))
			$dispatch(updateLastSearchAllMusicResult(lastSearchAllMusicResultCopy))
		}
	}

	const removeDownloadItem = (filename, filenameOrigin) => {
        confirm('提示', `确定要移除下载${filename}吗`, "确定", () => {
			window.eventEmit.$emit(`FileTransfer-${removePrefixFromFileOrigin(filenameOrigin)}`, 'abort', ["music", filenameOrigin])
		})
	}

	const showSongMv = (e, mvId, original, filename) => {
		e.stopPropagation();
		history.push({ pathname: '/music_mv_Player', query: { mvId, original, filename, lastLocation: window.getRoute() }})
	}

	const playingComponent = (filePath, currentSongTime, duration) => {
		return (
			<div className="audio-player" >
				<audio preload="auto" className="audio-selector" >
					<source src={filePath} />
				</audio>
				<div className="audio-player-time audio-player-time-current">{secondsToTime(currentSongTime)}</div>
				<div className="audio-player-bar">
					<div className="audio-player-bar-loaded" style={{"width": "100%"}}></div>
					<div className="audio-player-bar-played" style={{"width": (currentSongTime / duration * 100) + "%"}}></div>
				</div>
				<div className="audio-player-time audio-player-time-duration">{secondsToTime(duration)}</div>
			</div>
		)
	}

	const dealWithMusicUploadTime = (date) => {
		if(!date) return ""
		if(original === CONSTANT.musicOriginal.musicShare || original === CONSTANT.musicOriginal.musicSearch){
			return " " + date.split(" ")[0]
		} else {
			return ""
		}
	}

	const musicDataListCopy = optimizeLoadPerformance(musicDataList, firstRender, CONSTANT.showMusicNumberPerTime, setFirstRender)
	checkSongSavedFunc(musicDataListCopy, pageType)
	return (
		<Fragment >
			<div className="music-list-container">
				{
					musicDataListCopy.map((item, index) =>
						<div className="music-list" key={item.filenameOrigin}>
						<div className="music-content"
							onClick={() => checkStatus({
								filePath: item.filePath,
								filename: item.filename,
								filenameOrigin: item.filenameOrigin,
								uploadUsername: item.uploadUsername,
								fileSize: item.fileSize,
								duration: item.duration,
								songOriginal: item.original,
								original,
								musicDataList,
								pageType,
								payPlay: Number(item.payPlay),
								musicId:item.id
							})} >
							<div className="num">{index + 1}</div>
							<div className="music-info">
								<div className={`info ${(item.saved && pageType !== CONSTANT.musicOriginal.savedSongs) ? 'song-saved' : ""}`}>
									<div className="filename">{getFilenameWithoutExt(item.filename)}</div>
									{Number(item.payPlay) ? <i className="fa fa-lock copyright-song-flag" aria-hidden="true"></i> : ""}
									{item.saved && pageType !== CONSTANT.musicOriginal.savedSongs && <i className="fa fa-heart saved-song-flag" aria-hidden="true"></i>}
									{
										(original === CONSTANT.musicOriginal.savedSongs || original === CONSTANT.musicOriginal.musicFinished || original === CONSTANT.musicOriginal.musicRecent) && (
											item.original === CONSTANT.musicOriginal.netEaseCloud
											?	<div className="net-ease-source-flag">网易云</div>
											:	item.original === CONSTANT.musicOriginal.qqMusic
											?	<div className="qq-music-source-flag">QQ音乐</div>
											: 	item.original === CONSTANT.musicOriginal.kuGouMusic
											?	<div className="ku-gou-music-source-flag">酷狗音乐</div>
											:	item.original === CONSTANT.musicOriginal.kuWoMusic
											?	<div className="ku-wo-music-source-flag">酷我音乐</div>
											:	null
										)
									}
									{ item.mvId
										&& (pageType === CONSTANT.musicOriginal.savedSongs || pageType === "onlineMusic" || pageType === "onlineMusicSearchALl")
										? <i className="fa fa-youtube-play" aria-hidden="true" onClick={(e) => showSongMv(e, item.mvId, item.original, item.filename)}></i>
										: null
									}
								</div>
								{
									currentPlayingSong === item.filenameOrigin
									? 	playingComponent(item.filePath, currentSongTime, item.duration)
									:	<div className="upload-duration">
											<div className="upload-user">{item.uploadUsername || "未知"}{dealWithMusicUploadTime(item.date)}</div>
											{
												original !== CONSTANT.musicOriginal.musicDownloading
												?	<div className="song-duration-time">{secondsToTime(item.duration)}</div>
												:	<div className="song-duration-time">{item.progress}</div>
											}
										</div>
								}
							</div>
							{
								!soundPlaying && original !== CONSTANT.musicOriginal.musicDownloading && currentPlayingSong === item.filenameOrigin && (<div className="pause-button-overlay">
									<div className="pause-button">
										<div className="triangle"></div>
									</div>
								</div>)
							}
						</div>
						{
							original !== CONSTANT.musicOriginal.musicDownloading
							?	<div className="menu" onClick={showMenu.bind(this, item.filename, item.fileSize, item.filenameOrigin, item.uploadUsername, item.duration, item.original, Number(item.payPlay), Number(item.payDownload), item.id, item.date)}>
									<div className="dot"></div>
									<div className="dot"></div>
									<div className="dot"></div>
								</div>
							:	<div className="move-downloading-item fa fa-remove" onClick={removeDownloadItem.bind(this, item.filename, item.filenameOrigin)}></div>
						}
					</div>
					)
				}
			</div>
			{
				pageType === CONSTANT.musicOriginal.savedSongs && <div className="music-picture"></div>
			}
			{
				!noShowMusicPlaying && showMusicPlayingFromMusicControl && <MusicPlaying fromMusicControl={true} />
			}
		</Fragment>
	)

}

const mapStateToProps = state => {
    return {
		soundPlaying: state.fileServer.soundPlaying,
		soundInstance: state.fileServer.soundInstance,
		currentPlayingSong: state.fileServer.currentPlayingSong,
		currentSongTime: state.fileServer.currentSongTime,
		pauseWhenOver: state.fileServer.pauseWhenOver,
		playByOrder: state.fileServer.playByOrder,
		musicCollection: state.fileServer.musicCollection,
		musicMenuBadge: state.fileServer.musicMenuBadge,
		username: state.login.username,
		token: state.login.token,
		playByRandom: state.fileServer.playByRandom,
		lastMusicSearchResult: state.fileServer.lastMusicSearchResult,
		lastSearchAllMusicResult: state.fileServer.lastSearchAllMusicResult,
		downloadingMusicItems: state.fileServer.downloadingMusicItems,
		downloadedMusicList: state.fileServer.downloadedMusicList,
		currentPlayingSongOriginal: state.fileServer.currentPlayingSongOriginal,
		recentMusicList: state.fileServer.recentMusicList,
		musicPageType: state.fileServer.musicPageType,
		setMobile: state.myInfo.setMobile,
		showMusicPlayingFromMusicControl: state.fileServer.showMusicPlayingFromMusicControl
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayer);
