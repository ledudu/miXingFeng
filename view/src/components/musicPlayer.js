import React from 'react';
import { connect } from "react-redux";
import { Howl, Howler } from 'howler';
import { ActionSheet } from 'antd-mobile';
import { HTTP_URL } from "../constants/httpRoute";
import {
	updateSoundPlaying,
	updateSoundInstance,
	updateSoundInstanceId,
	updateCurrentPlayingSong,
	updateCurrentSongTime,
	updatePauseWhenOver,
	updatePlayByOrder,
	updateMusicMenuBadge,
	updateMusicNodeList,
	updateCurrentPlayingMusicList,
	updatePlayByRandom,
	updateLastMusicSearchResult,
	updateLastSearchAllMusicResult,
	updateCurrentPlayingSongOriginal,
	updateIsMusicPlayerPage,
	updateCurrentPlayingSongOriginalExceptWindow,
	updateCurrentPlayingSongDuration,
} from "../ducks/fileServer";
import { confirm, networkErr, saveFileToLocal, updateDownloadingStatus } from "../services/utils";
import { updateToken } from "../ducks/login";
import {
	calcSize,
	removeDuplicateObjectList,
	removeFileFromDownload,
	checkSongSavedFunc,
	removePrefixFromFileOrigin,
	saveSongFunc,
	playPreviousSong,
	playNextSong,
	getMusicCurrentPlayProcess
} from "../logic/common";
import { CON } from '../constants/enumeration';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
	wrapProps = {
		onTouchStart: e => e.preventDefault(),
	};
}

class MusicPlayer extends React.Component {

	constructor(props){
		super(props);
		this.currentMusicNodeListNew = {}
		this.state = {
			musicDataList: props.musicDataList
		}
	}

	componentDidMount(){
		Howler.volume(0.8);
		this.checkSongSaved()

		const { musicNodeList, currentPlayingSongOriginal, original } = this.props
		if(original !== CON.musicOriginal.musicDownloading && original !== CON.musicOriginal.window){
			if(currentPlayingSongOriginal === original){
				$dispatch(updateIsMusicPlayerPage(true))
				getMusicCurrentPlayProcess()
			} else if(currentPlayingSongOriginal) {
				// 当切出正在播放的音乐页面时会触发window来源的音乐页面
				// 所以不需要在unmount里更新，直接在这更新就可以了
				$dispatch(updateIsMusicPlayerPage(false))
			}
		}

		this.currentMusicNodeListOld = musicNodeList
		this.updateMusicDomNodeList()

		window.eventEmit.$on("musicRemoved", (musicDataList) => {
			if(original === CON.musicOriginal.musicFinished){
				this.setState({
					musicDataList
				})
			}
		})
		window.eventEmit.$on("downloadingMusicItems", (musicDataList) => {
			if(original === CON.musicOriginal.musicDownloading){
				this.setState({
					musicDataList
				})
			}
		})
		window.eventEmit.$on("downloadMusicFinished", (downloadedMusicList) => {
			if(original === CON.musicOriginal.musicFinished){
				downloadedMusicList = _.orderBy(downloadedMusicList, ['date'], ['asc'])
				this.setState({
					musicDataList: downloadedMusicList
				})
			}
		})
	}

	componentWillReceiveProps(nextProps){
		this.checkSongSaved()
		this.setState({
			musicDataList: nextProps.musicDataList
		})
	}

	componentWillUnmount(){
		const { original, isMusicPlayerPage } = this.props
		if(original !== CON.musicOriginal.window) {
			$dispatch(updateIsMusicPlayerPage(false))
			if(isMusicPlayerPage){
				$dispatch(updateCurrentPlayingSongOriginalExceptWindow(original))
			}
		}
		window.eventEmit.$off("musicRemoved")
		window.eventEmit.$off("downloadingMusicItems")
		window.eventEmit.$off("downloadMusicFinished")
	}

	checkSongSaved = () => {
		const {  musicDataList=[] } = this.state;
		const { original } = this.props;
		checkSongSavedFunc(musicDataList, original)
	}

	secondsToTime = ( secs ) => {
		let hours = Math.floor( secs / 3600 )
		,   minutes = Math.floor( secs % 3600 / 60 )
		,   seconds = Math.ceil( secs % 3600 % 60 );
		return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' )
			+ ( minutes.toString().length < 2 ? '0'+minutes : minutes )
			+ ':' + (seconds.toString().length < 2 ? '0'+seconds : seconds );
	}

	updateMusicDomNodeList = () => {
		for(let i in this.currentMusicNodeListNew){
			Object.assign(this.currentMusicNodeListOld, { [i]: this.currentMusicNodeListNew[i] })
		}
		$dispatch(updateMusicNodeList(this.currentMusicNodeListOld))
	}

	checkStatus = (filePath, filename, filenameOrigin, uploadUsername, fileSize, duration, songOriginal) => {
		try {
			const { soundPlaying, currentPlayingSong, original, downloadingMusicItems } = this.props;
			this.updateMusicDomNodeList()
			if(original === CON.musicOriginal.musicDownloading){
				downloadingMusicItems.some((item) => {
					if(item.filenameOrigin === filenameOrigin) {
						logger.info("checkStatus musicDownloading filenameOrigin", filenameOrigin)
						filenameOrigin = removePrefixFromFileOrigin(filenameOrigin)
						if(item.progress === "失败" || item.progress === "已取消"){
							alert(`重新下载${filename}`)
							updateDownloadingStatus(filename, '准备中', uploadUsername, fileSize, true, filePath, filenameOrigin, true, duration)
							saveFileToLocal(filenameOrigin, filePath, "music", filename, uploadUsername, true, fileSize, true, {duration, songOriginal})
						} else {
							window.eventEmit.$emit(`FileTransfer-${filenameOrigin}`, 'abort')
						}
						return true
					} else {
						return false
					}
				})
				return
			}
			getMusicCurrentPlayProcess()
			logger.info("music checkStatus currentPlayingSong", currentPlayingSong)
			if(!soundPlaying){
				if(!currentPlayingSong){
					// first play case
					this.play(filePath, filenameOrigin, duration)
				} else {
					// pause case
					if(filenameOrigin === currentPlayingSong){
						this.resume()
					} else {
						// stop current song and switch to another song case and then initial play current time
						$dispatch(updateCurrentSongTime(0))
						this.stop()
						this.play(filePath, filenameOrigin, duration)
					}
				}
			} else {
				if(filenameOrigin !== currentPlayingSong){
					// stop current song and switch to another song case and initial play current time
					$dispatch(updateCurrentSongTime(0))
					this.stop()
					this.play(filePath, filenameOrigin, duration)
				} else {
					// pause current song
					this.pause()
				}
			}
		} catch (err){
			logger.error("checkStatus err", err)
		}
	}

	play = (filePath, filenameOrigin, duration) => {
		try {
			let { musicDataList=[] } = this.state
			const { pauseWhenOver, playByOrder, soundInstance, soundInstanceId, playByRandom, original, currentPlayingSongOriginalExceptWindow } = this.props;
			const self = this;
			musicDataList = removeDuplicateObjectList(musicDataList, 'filenameOrigin')
			logger.info("music play filenameOrigin", filenameOrigin)
			if(soundInstance && soundInstanceId){
				soundInstance.unload()
			}
			$dispatch(updateCurrentPlayingMusicList(musicDataList))
			$dispatch(updateCurrentSongTime(0))
			$dispatch(updateIsMusicPlayerPage(true))
			$dispatch(updateSoundPlaying(true))
			$dispatch(updateCurrentPlayingSong(filenameOrigin))
			$dispatch(updateCurrentPlayingSongDuration(duration))
			$dispatch(updateCurrentPlayingSongOriginal(original === CON.musicOriginal.window ? currentPlayingSongOriginalExceptWindow : original))
			filePath = removePrefixFromFileOrigin(filePath)
			const soundInstanceModel = new Howl({
				src: [filePath],
				loop: !pauseWhenOver,
				rate: 1.0,
				html5: true,
				onend: function() {
					logger.info("onend playByOrder", playByOrder)
					if(playByOrder){
						setTimeout(() => {
							self.autoPlayNextOne("playByOrder", filenameOrigin)
						}, 3000)
					} else if(playByRandom){
						setTimeout(() => {
							self.autoPlayNextOne("playByRandom", filenameOrigin)
						}, 3000)
					} else if(pauseWhenOver){
						$dispatch(updateSoundPlaying(false))
						clearInterval(window.currentTimeInterval)
					}
				}
			});
			const soundInstanceModelId = soundInstanceModel.play();
			$dispatch(updateSoundInstance(soundInstanceModel))
			$dispatch(updateSoundInstanceId(soundInstanceModelId))
		} catch(err){
			$dispatch(updateSoundPlaying(false))
			logger.error("play() fail err", err)
			alert('播放失败')
		}
	}

	pause = () => {
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props;
		logger.info("music pause currentPlayingSong", currentPlayingSong)
		clearInterval(window.currentTimeInterval)
		soundInstance.pause(soundInstanceId);
		$dispatch(updateSoundPlaying(false))
	}

	resume = () => {
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props;
		logger.info("music resume currentPlayingSong", currentPlayingSong)
		getMusicCurrentPlayProcess()
		soundInstance.play(soundInstanceId)
		$dispatch(updateSoundPlaying(true))
	}

	stop = () => {
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props;
		logger.info("music stop currentPlayingSong", currentPlayingSong)
		soundInstance.stop(soundInstanceId)
		$dispatch(updateSoundPlaying(false))
	}

	showMenu = (filename, fileSize, fileId, filenameOrigin, uploadUsername, duration, songOriginal) => {
		try {
			const {
				pauseWhenOver,
				playByOrder,
				musicCollection=[],
				musicMenuBadge,
				soundInstance,
				username,
				token,
				original,
				soundPlaying,
				playByRandom,
				currentPlayingSong,
			} = this.props
			const savedMusicFilenameOriginalArr = musicCollection.map(item => removePrefixFromFileOrigin(item.filenameOrigin))
			const hasSaved = savedMusicFilenameOriginalArr.indexOf(removePrefixFromFileOrigin(filenameOrigin));
			const buttons = ['播放', (hasSaved !== -1) ? '已收藏' : "收藏", '单曲播放', '单曲循环', '顺序播放', '随机播放', '播放上一首', '播放下一首', '下载', '删除', '取消'];
			if(soundPlaying && filenameOrigin === currentPlayingSong){
				buttons[0] = "暂停"
			}
			const showActionSheetWithOptionsConfig = {
				options: buttons,
				cancelButtonIndex: buttons.length - 1,
				destructiveButtonIndex:  buttons.length - 2,
				badges: musicMenuBadge,
				message: fileSize ? `大小: ${calcSize(fileSize)}` : "",
				title: filename,
				maskClosable: true,
				'data-seed': 'logId',
				wrapProps,
			}
			if(original === CON.musicOriginal.musicFinished){
				//  已下载页面的菜单没有下载功能，原来下载的位置要换成删除本地音乐的函数
				buttons.splice(8, 1);
				showActionSheetWithOptionsConfig.destructiveButtonIndex = buttons.length - 2
			} else if(original === CON.musicOriginal.savedSongs || (fileId && fileId !== "downloaded")){
				// 收藏页面和搜索在线音乐页面的菜单没有删除功能
				buttons.splice(9, 1);
				delete showActionSheetWithOptionsConfig.destructiveButtonIndex
			}
			ActionSheet.showActionSheetWithOptions(
				showActionSheetWithOptionsConfig,
				(buttonIndex) => {
					logger.info("music player showMenu buttonIndex", buttonIndex)
					const { musicDataList } = this.state
					const currentMusicFilenameOriginalArr = musicDataList.map(item => item.filenameOrigin)
					let currentFileIndex = currentMusicFilenameOriginalArr.indexOf(filenameOrigin)
					if(currentFileIndex === -1){
						logger.error("showActionSheetWithOptions currentFileIndex === -1 filename", filename)
						return alert(filename + "已被删除")
					}
					const filePath = musicDataList[currentFileIndex]['filePath']
					switch(buttonIndex){
						case 0:
							this.checkStatus(filePath, filename, filenameOrigin, uploadUsername, fileSize, duration, songOriginal)
							break;
						case 1:
							saveSongFunc(savedMusicFilenameOriginalArr, filenameOrigin, musicCollection, musicDataList, currentFileIndex, original)
							break;
						case 2:
							if(!pauseWhenOver || playByOrder || playByRandom){
								soundInstance && soundInstance.loop(false)
								$dispatch(updatePauseWhenOver(true))
								$dispatch(updatePlayByOrder(false))
								$dispatch(updatePlayByRandom(false))
								localStorage.setItem("pauseWhenOver", 'yes')
								localStorage.setItem("playByOrder", "no")
								localStorage.setItem("playByRandom", 'no')
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
								localStorage.setItem("pauseWhenOver", 'no')
								localStorage.setItem("playByOrder", 'no')
								localStorage.setItem("playByRandom", 'no')
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
								localStorage.setItem("pauseWhenOver", 'yes')
								localStorage.setItem("playByOrder", 'yes')
								localStorage.setItem("playByRandom", 'no')
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
								localStorage.setItem("pauseWhenOver", 'yes')
								localStorage.setItem("playByOrder", 'no')
								localStorage.setItem("playByRandom", 'yes')
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
							logger.info("播放上一首 currentFileIndex", currentFileIndex)
							// 更新dom到store,用于在其他页面直接点击播放上一首
							this.updateMusicDomNodeList()
							playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, this.currentMusicNodeListOld, currentPlayingSong, soundPlaying)
							break;
						case 7:
							logger.info("播放下一首 currentFileIndex", currentFileIndex)
							// 更新dom到store
							this.updateMusicDomNodeList()
							playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, this.currentMusicNodeListOld, currentPlayingSong, soundPlaying)
							break;
						case 8:
							if(original === CON.musicOriginal.musicFinished){
								confirm(`提示`, `确定从本地删除${filename}吗`, "确定", () => {
									return removeFileFromDownload(removePrefixFromFileOrigin(filenameOrigin), "music")
										.catch(error => {
											logger.error("删除音乐过程中发生了错误 isFileFinished", error.stack||error.toString());
											networkErr(error);
										})
								})
							} else {
								if(!username || !token) return alert("请先登录")
								const musicSrc = filePath
								//  下载觅星峰服务器上的音乐，保存的文件名为filenameOrigin,
								//  filenameOrigin由上传者用户名加文件名加时间戳构成，filenameOrigin是文件的id，唯一且不可变
								//  下载网易云或qq音乐，保存的文件名为filename+_+fileMD5+后缀名
								//  因为共享音乐列表可能存在秒传音乐，所以列表可能存在两个相同md5的音乐，
								//  为了唯一的辨别每一个音乐，觅星峰服务器上的音乐md5由客户端随机生成，是不可靠的
								//  所以在保存觅星峰服务器上的音乐时，保存的文件名特意为以上格式，
								//  如果将要下载的音乐信息和已下载的音乐名称相同，则认为这个音乐已经下载了
								this.saveMusicToLocal(filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal)
							}
							break;
						case 9:
							if(!username || !token) return alert("请先登录")
							const dataInfo = {
								username,
								token,
								filename,
								type: "default-music"
							}
							if(original === CON.musicOriginal.savedSongs || original === CON.musicOriginal.netEaseCloud || original === CON.musicOriginal.qqMusic) return;
							confirm('提示', `确定要从服务器删除${filename}吗`, "确定", () => {
								if(!this.startToDelete){
									this.startToDelete = true
									return axios.delete(HTTP_URL.delFile, {data: dataInfo})
										.then((result) => {
											this.startToDelete = false
											if(result.data.result.result === 'success'){
												$dispatch(updateToken(result.data.result.token))
												//  实时更新搜索列表里被删除的音乐
												alert('删除成功')
												return this.updateSearchList(original, filenameOrigin)
											}  else if (result.data.result.result === 'file_deleted') {
												alert("文件已删除!");
												return this.updateSearchList(original, filenameOrigin)
										    } else {
												logger.error("HTTP_URL.saveSong result", result)
											}
										})
										.catch(err => {
											this.startToDelete = false
											logger.error("HTTP_URL.saveSong err", err)
											networkErr(err);
										})
								}
							})
							break;
						default:
							break;
					}
				}
			);
		} catch(err){
			logger.error("showMenu err", err)
		}
	}

	saveMusicToLocal = (filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal) => {
		const { downloadingMusicItems, downloadedMusicList } = this.props;
		let isDownload = false, musicDownloaded=false
		filenameOrigin = removePrefixFromFileOrigin(filenameOrigin)
		// 先判断音乐是否正在下载，再判断音乐是否已下载
		downloadingMusicItems.some((item) => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin){
				isDownload = true
				confirm(`提示`, `${filename}正在下载`, "去查看", () => {
					window.goRoute(null, "/my_finished_musics")
				})
				return true
			} else {
				return false
			}
		})
		downloadedMusicList.some((item) => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin){
				musicDownloaded = true
				alertDialog(`${filename}已下载`)
				return true
			} else {
				return false
			}
		})
		if(!isDownload && !musicDownloaded){
			alert(`开始下载${filename}`)
			updateDownloadingStatus(filename, '准备中', uploadUsername, fileSize, true, musicSrc, filenameOrigin, true, duration)
			saveFileToLocal(filenameOrigin, musicSrc, "music", filename, uploadUsername, true, fileSize, true, {duration, original: songOriginal})
		}
	}

	updateSearchList = (original, filenameOrigin) => {
		if(original === CON.musicOriginal.musicSearch){
			const { lastMusicSearchResult=[], lastSearchAllMusicResult=[], type } = this.props;
			let lastMusicSearchResultIndex, lastSearchAllMusicResultIndex
			lastMusicSearchResult.some((item, index) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin)){
					lastMusicSearchResultIndex = index
					return true
				}
			})
			lastMusicSearchResult.splice(lastMusicSearchResultIndex, 1)
			lastSearchAllMusicResult.some((item, index) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin)){
					lastSearchAllMusicResultIndex = index
					return true
				}
			})
			lastSearchAllMusicResult.splice(lastSearchAllMusicResultIndex, 1)
			$dispatch(updateLastMusicSearchResult(lastMusicSearchResult))
			$dispatch(updateLastSearchAllMusicResult(lastSearchAllMusicResult))
			if(type === "music"){
				this.setState({
					musicDataList: lastMusicSearchResult
				})
			} else if(type === "searchAllMusic"){
				this.setState({
					musicDataList: lastSearchAllMusicResult
				})
			}
		}
	}

	getRandomFileIndex = (currentMusicFilenameOriginalArr, currentFileIndex) => {
		const randomFileIndex = parseInt(Math.random() * currentMusicFilenameOriginalArr.length)
		if(currentFileIndex === randomFileIndex){
			logger.warn("getRandomFileIndex repeat randomFileIndex", randomFileIndex, 'currentFileIndex', currentFileIndex)
			return this.getRandomFileIndex(currentMusicFilenameOriginalArr, currentFileIndex)
		} else {
			return randomFileIndex
		}
	}

	autoPlayNextOne = (type, filenameOrigin) => {
		const { musicDataList } = this.state
		const { musicNodeList } = this.props;
		try {
			const currentMusicFilenameOriginalArr = musicDataList.map(item => item.filenameOrigin)
			let currentFileIndex = currentMusicFilenameOriginalArr.indexOf(filenameOrigin)
			if(currentFileIndex === (currentMusicFilenameOriginalArr.length - 1)){
				currentFileIndex = -1
			}
			logger.info("autoPlayNextOne filenameOrigin", filenameOrigin, 'type', type)
			if(type === "playByRandom" && currentMusicFilenameOriginalArr.length !== 1){
				currentFileIndex = this.getRandomFileIndex(currentMusicFilenameOriginalArr, currentFileIndex)
			}
			const currentElement = musicNodeList[currentMusicFilenameOriginalArr[currentFileIndex + 1]];
			logger.debug("autoPlayNextOne musicNodeList", musicNodeList)
			logger.info("autoPlayNextOne currentMusicFilenameOriginalArr[currentFileIndex + 1]", currentMusicFilenameOriginalArr[currentFileIndex + 1], "filenameOrigin", filenameOrigin)
			logger.debug("autoPlayNextOne currentElement", currentElement)
			setTimeout(() => {
				if(currentElement){
					currentElement.click()
					setTimeout(() => {
						const { currentPlayingSong, soundPlaying } = this.props;
						if(soundPlaying && currentPlayingSong !== filenameOrigin){

						} else {
							logger.info("autoPlayNextOne setTimeout click soundPlaying filenameOrigin again", filenameOrigin)
							currentElement.click();
						}
					}, 50)
				} else {
					logger.debug("autoPlayNextOne warn currentMusicFilenameOriginalArr",  currentMusicFilenameOriginalArr, 'currentFileIndex + 1', currentFileIndex + 1)
				}
			}, 50)
		} catch(err){
			alert("歌曲文件异常, 暂停播放");
			logger.error("play onEnd err", err)
		}
	}

	getFilenameWithoutExt = (filename) => {
		let singleFilenameArr = filename.split(".");
		if(singleFilenameArr.length !== 1) singleFilenameArr.pop();
		const filenameWithoutExt = singleFilenameArr.join("");
		return filenameWithoutExt;
	}

	removeDownloadItem = (filename, filenameOrigin) => {
        confirm('提示', `确定要移除下载${filename}吗`, "确定", () => {
			window.eventEmit.$emit(`FileTransfer-${removePrefixFromFileOrigin(filenameOrigin)}`, 'abort', ["music", filenameOrigin])
		})
	}

	playingComponent = (filePath, currentSongTime, duration) => {
		return (
			<div className="audio-player" >
				<audio preload="auto" className="audio-selector" >
					<source src={filePath} />
				</audio>
				<div className="audio-player-time audio-player-time-current">{this.secondsToTime(currentSongTime)}</div>
				<div className="audio-player-bar">
					<div className="audio-player-bar-loaded" style={{"width": "100%"}}></div>
					<div className="audio-player-bar-played" style={{"width": (currentSongTime / duration * 100) + "%"}}></div>
				</div>
				<div className="audio-player-time audio-player-time-duration">{this.secondsToTime(duration)}</div>
			</div>
		)
	}

	render() {
		let { currentPlayingSong, currentSongTime, soundPlaying, original, currentPlayingSongOriginal } = this.props;
		let { musicDataList=[] } = this.state
		musicDataList = removeDuplicateObjectList(musicDataList, 'filenameOrigin')
		return (
			<div className="music-list-container">
				{
					musicDataList.map((item, index) =>
						<div className="music-list" key={item.filenameOrigin}>
							<div className="music-content" onClick={() => this.checkStatus(item.filePath, item.filename, item.filenameOrigin, item.uploadUsername, item.fileSize, item.duration, item.original)} >
								<div className="num">{index + 1}</div>
								<div className="music-info" ref={ref => this['currentMusicNodeListNew'][item.filenameOrigin] = ref}>
									<div className={`info ${item.saved ? 'song-saved' : ""}`}>
										<div className="filename">{this.getFilenameWithoutExt(item.filename)}</div>
										{item.saved && <i className="fa fa-heart saved-song-flag" aria-hidden="true"></i>}
										{
											(original === CON.musicOriginal.savedSongs || original === CON.musicOriginal.musicFinished) && (
												item.original === CON.musicOriginal.netEaseCloud
												?	<div className="net-ease-source-flag">网易云</div>
												:	item.original === CON.musicOriginal.qqMusic
												?	<div className="qq-music-source-flag">QQ音乐</div>
												: 	item.original === CON.musicOriginal.kuGouMusic
												?	<div className="ku-gou-music-source-flag">酷狗音乐</div>
												:	null
											)
										}
									</div>
									{
										(currentPlayingSong === item.filenameOrigin && original === currentPlayingSongOriginal)
										? 	this.playingComponent(item.filePath, currentSongTime, item.duration, item.id)
										:	<div className="upload-duration">
												<div className="upload-user">{item.uploadUsername || "未知"}</div>
												{
													original !== CON.musicOriginal.musicDownloading
													?	<div className="song-duration-time">{this.secondsToTime(item.duration)}</div>
													:	<div className="song-duration-time">{item.progress}</div>
												}
											</div>
									}
								</div>
								{
									!soundPlaying && original !== CON.musicOriginal.musicDownloading && currentPlayingSong === item.filenameOrigin && (<div className="pause-button-overlay">
										<div className="pause-button">
											<div className="triangle"></div>
										</div>
									</div>)
								}
							</div>
							{
								original !== CON.musicOriginal.musicDownloading
								?	<div className="menu" onClick={this.showMenu.bind(this, item.filename, item.fileSize, item.id, item.filenameOrigin, item.uploadUsername, item.duration, item.original)}>
										<div className="dot"></div>
										<div className="dot"></div>
										<div className="dot"></div>
									</div>
								:	<div className="move-downloading-item fa fa-remove" onClick={this.removeDownloadItem.bind(this, item.filename, item.filenameOrigin)}></div>
							}
						</div>
					)
				}
			</div>
		)
	}
}

const mapStateToProps = state => {
    return {
		soundPlaying: state.fileServer.soundPlaying,
		soundInstance: state.fileServer.soundInstance,
		soundInstanceId: state.fileServer.soundInstanceId,
		currentPlayingSong: state.fileServer.currentPlayingSong,
		currentSongTime: state.fileServer.currentSongTime,
		pauseWhenOver: state.fileServer.pauseWhenOver,
		playByOrder: state.fileServer.playByOrder,
		musicCollection: state.fileServer.musicCollection,
		musicMenuBadge: state.fileServer.musicMenuBadge,
		username: state.login.username,
		token: state.login.token,
		musicNodeList: state.fileServer.musicNodeList,
		playByRandom: state.fileServer.playByRandom,
		lastNetEaseCloudSearchResult: state.fileServer.lastNetEaseCloudSearchResult,
		lastMusicSearchResult: state.fileServer.lastMusicSearchResult,
		lastSearchAllMusicResult: state.fileServer.lastSearchAllMusicResult,
		downloadingMusicItems: state.fileServer.downloadingMusicItems,
		downloadedMusicList: state.fileServer.downloadedMusicList,
		currentPlayingSongOriginal: state.fileServer.currentPlayingSongOriginal,
		isMusicPlayerPage: state.fileServer.isMusicPlayerPage,
		currentPlayingSongOriginalExceptWindow: state.fileServer.currentPlayingSongOriginalExceptWindow,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlayer);
