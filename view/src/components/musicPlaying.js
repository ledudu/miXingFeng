import React from 'react';
import { connect } from "react-redux";
import NavBar from "./child/navbar";
import {
	saveSongFunc,
	removePrefixFromFileOrigin,
	playPreviousSong,
	playNextSong,
	pauseMusic,
	resumeMusic,
	getFilenameWithoutExt,
	saveMusicToLocal,
	secondsToTime,
	hideMusicController,
	touchDirection,
	removeTouchDirection
} from "../logic/common"
import { updateCurrentSongTime, updateIsHeadPhoneView } from "../ducks/fileServer"
import { backToPreviousPage,IsPC } from "../services/utils"
import AmazingBaby from "./child/amazingBaby"
import { CONSTANT } from '../constants/enumeration';
import HearSvg from "./child/heartSvg"

class MusicPlaying extends React.Component {

	constructor(props){
		super(props)
		this.ifBool = false
		this.touchDirectionObj = {
			debounceTimer: null,
			firstTimeRun: false
		}
	}

	componentDidMount(){
		document.addEventListener("deviceready", this.listenBackButton, false);
		if(window.isCordova) StatusBar.overlaysWebView(true);
		this.playRef && (this.playRef.style.paddingLeft = "5px")
		this.pauseRef && (this.pauseRef.style.paddingLeft = "0px")
		this.progressRef.addEventListener("touchstart", this.start);
		this.progressRef.addEventListener("mousedown", this.start);
		this.progressRef.addEventListener("touchmove",  this.move);
		this.progressRef.addEventListener("mousemove",  this.move);
		this.progressRef.addEventListener("click", this.move);
		window.addEventListener("touchend", this.end);
		window.addEventListener("mouseup", this.end);
		const { currentSongTime } = this.props
		this.updateProgressLine(currentSongTime)
		if(!window.isCordova){
			$("#root .music-playing-container .top-status-bar").css("height", "15px")
			$("#root .music-playing-container .music-playing-content").css("height", "calc(100vh - 50px)")
			$("#root .music-playing-container .music-playing-content .top").css("height", "calc(100vh - 190px)")
		}
		hideMusicController()
		window.eventEmit.$on("listenMusicSaved", () => {
			this.forceUpdate()
		})
		touchDirection(this.musicPlayingTop, ['swipeLeft', 'swipeRight'], this.touchDirectionCallback, this.touchDirectionObj)
	}

	componentWillReceiveProps(nextProps){
		const { currentSongTime } = this.props
		if(currentSongTime !== nextProps.currentSongTime){
			this.updateProgressLine(nextProps.currentSongTime)
		}
	}

	componentWillUnmount(){
		document.removeEventListener("deviceready", this.listenBackButton, false);
		document.removeEventListener("backbutton", this.backKeyDownToPrevious, false)
		this.progressRef.removeEventListener("touchstart", this.start);
		this.progressRef.removeEventListener("mousedown", this.start);
		this.progressRef.removeEventListener("touchmove", this.move);
		this.progressRef.removeEventListener("mousemove", this.move);
		this.progressRef.removeEventListener("click", this.move);
		window.removeEventListener("touchend", this.end);
		window.removeEventListener("mouseup", this.end);
		if(window.isCordova) {
			StatusBar.overlaysWebView(false);
			StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
		}
		removeTouchDirection(this.musicPlayingTop)
	}

	touchDirectionCallback = (direction) => {
		const { isHeadPhoneView } = this.props
		logger.info('touchDirectionCallback direction, isHeadPhoneView', direction, isHeadPhoneView)
		if(direction === 'left'){
			if(!isHeadPhoneView){
				$dispatch(updateIsHeadPhoneView(true))
				this.musicPlayingContainerRef.style.animation = "opacityChange 0.8s ease-out  1 alternate forwards"
				setTimeout(() => {
					this.musicPlayingContainerRef.style.animation = null
				}, 800)
			}

		} else if(direction === 'right'){
			if(isHeadPhoneView){
				$dispatch(updateIsHeadPhoneView(false))
				this.musicPlayingContainerRef.style.animation = "opacityChange 0.8s ease-out  1 alternate forwards"
				setTimeout(() => {
					this.musicPlayingContainerRef.style.animation = null
				}, 800)
			}
		}
	}

	listenBackButton = () => {
		document.addEventListener("backbutton", this.backKeyDownToPrevious, false)
	}

	updateProgressLine = (currentSongTime) => {
		const percent = (currentSongTime / this.currentSongInfo.duration)
		const progressWidth= (window.innerWidth - 124)
		this.progressPlayedRef.style.width = (progressWidth * percent) + "px"
		this.progressUnplayedRef.style.width = (progressWidth * (1 - percent)) + "px"
		this.progressUnplayedRef.style.left = (progressWidth * percent + 14) + "px"
		this.progressOutPoint.style.left = (progressWidth * percent) + "px"
		this.progressInnerPoint.style.left = (progressWidth * percent + 3) + "px"
	}

	start = (e) => {
		e.stopPropagation();
		this.ifBool = true;
		logger.info("鼠标按下")
	}

	move = (e) => {
		e.stopPropagation();
		const { soundInstance, soundInstanceId } = this.props
		if (this.ifBool) {
			const progressRestWidth = this.progressRef.offsetWidth - 14
			const x = e.clientX || e.touches[0].pageX
			let minDivLeft = ((x - 55) > progressRestWidth) ? progressRestWidth : (x - 55)
			minDivLeft = ((x - 55) < 0) ? 0 : minDivLeft
			const percent = (minDivLeft / progressRestWidth).toFixed(2)
			const seekTime = this.currentSongInfo.duration * percent
			logger.info("move music progress move percent, seekTime", percent, seekTime)
			$dispatch(updateCurrentSongTime(seekTime))
			if(soundInstance && soundInstanceId) {
				soundInstance.seek(seekTime, soundInstanceId);
			}
		} else {
			if(e.clientX && !IsPC()){
				const percent = ((e.clientX - 55) / (this.progressRef.offsetWidth - 14)).toFixed(2)
				const seekTime = this.currentSongInfo.duration * percent
				logger.info("move music progress click percent, seekTime", percent, seekTime)
				$dispatch(updateCurrentSongTime(seekTime))
				if(soundInstance && soundInstanceId) {
					soundInstance.seek(seekTime, soundInstanceId);
				}
			}
		}
	}

	end = (e) => {
		e.stopPropagation();
		logger.info("鼠标弹起")
		this.ifBool = false;
	}

	backKeyDownToPrevious = () => {
		backToPreviousPage(this, "/my_download_middle_page", {specialBack: true});
	}

	backToMainPage = () => {
		backToPreviousPage(this, "/my_download_middle_page")
	}

	playPreviousSongFunc = (currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, self) => {
		this.playRef && (this.playRef.style.paddingLeft = "0px")
		playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, self)
	}

	playNextSongFunc = (currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, self) => {
		this.playRef && (this.playRef.style.paddingLeft = "0px")
		playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, self)
	}

	saveMusicToLocalFunc = (musicDataList, filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal, musicId, payDownload, self) => {
		saveMusicToLocal(musicDataList, filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal, musicId, payDownload, self)
	}

	pause = (e) => {
		if(e) e.stopPropagation();
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController pause currentPlayingSong", currentPlayingSong)
		this.pauseRef.style.paddingLeft = "5px"
		pauseMusic(soundInstance, soundInstanceId, currentPlayingSong)
	}

	resume = (e, self) => {
		if(e) e.stopPropagation();
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId && !currentPlayingSong) return alert('请选择一首歌播放')
		logger.info("MusicController resume currentPlayingSong", currentPlayingSong)
		this.playRef.style.paddingLeft = "0px"
		resumeMusic(self)
	}

	gotoPlayingOrigin = () => {
		const { musicPageType } = this.props
		const urlHash =  window.getRoute()
		switch(musicPageType){
			case CONSTANT.musicOriginal.musicShare:
				if(urlHash !== "/main/music") window.goRoute(this, "main/music")
				break
			case CONSTANT.musicOriginal.savedSongs:
				if(urlHash !== "/saved_songs") window.goRoute(this, "saved_songs")
				break
			case CONSTANT.musicOriginal.musicFinished:
				if(urlHash !== "/my_finished_musics") window.goRoute(this, "my_finished_musics")
				break
			case CONSTANT.musicOriginal.musicRecent:
				if(urlHash !== "/recent_music_played") window.goRoute(this, "recent_music_played")
				break
			case "onlySearchShareMusic":
				if(urlHash !== "/search_music") window.goRoute(this, "search_music")
				break
			case "onlineMusic":
				if(urlHash !== "/search_online_music") window.goRoute(this, "search_online_music")
				break
			case "onlineMusicSearchALl":
				if(urlHash !== "/onlineMusicSearchALl") window.goRoute(this, "search_all")
				break
			default:
				break
		}
	}

    render() {
		const {
			currentPlayingSong,
			currentPlayingMusicList=[],
			musicCollection=[],
			currentPlayingSongOriginal,
			soundPlaying,
			musicPageType,
			currentSongTime,
			isHeadPhoneView
		} = this.props
		let currentSongInfo = {}
		currentPlayingMusicList.some(item => {
			if(item.filenameOrigin === currentPlayingSong){
				currentSongInfo = item;
				return true
			}
		})
		let savedMusicFilenameOriginalArr = []
		let currentMusicFilenameOriginalArr = []
		let currentFileIndex = null
		if(currentPlayingSong){
			savedMusicFilenameOriginalArr = musicCollection.map(item => removePrefixFromFileOrigin(item.filenameOrigin))
			currentMusicFilenameOriginalArr = currentPlayingMusicList.map(item => item.filenameOrigin)
			currentFileIndex = currentMusicFilenameOriginalArr.indexOf(currentPlayingSong)
		}
		const songIsSaved = currentSongInfo.saved
		const currentSongFilename = currentSongInfo.filename ? getFilenameWithoutExt(currentSongInfo.filename) : "当前没有播放歌曲"
		this.currentSongInfo = currentSongInfo
		return (
			<div className={`music-playing-container ${isHeadPhoneView ? "head-phone-view" : "amazing-baby-view"}`} ref={ref => this.musicPlayingContainerRef = ref}>
				<NavBar
					centerText={currentSongFilename}
					backToPreviousPage={this.backToMainPage}
					rightText="源页面"
					rightTextFunc={this.gotoPlayingOrigin}
				/>
				<div className="music-playing-content">
					<div className="top" ref={ref => this.musicPlayingTop = ref}>
						{
							!isHeadPhoneView
							?	<AmazingBaby />
							:	<div className='music'>
									<span className={`line line1 ${soundPlaying ? 'line-animation' : 'line-height'}`}></span>
									<span className={`line line2 ${soundPlaying ? 'line-animation' : 'line-height'}`}></span>
									<span className={`line line3 ${soundPlaying ? 'line-animation' : 'line-height'}`}></span>
									<span className={`line line4 ${soundPlaying ? 'line-animation' : 'line-height'}`}></span>
									<span className={`line line5 ${soundPlaying ? 'line-animation' : 'line-height'}`}></span>
								</div>
						}
						<div className="circle">
							<div className={`dot ${!isHeadPhoneView ? 'dot-fill' : ''}`} onClick={this.touchDirectionCallback.bind(this, "right")}></div>
							<div className={`dot ${isHeadPhoneView ? 'dot-fill' : ''}`} onClick={this.touchDirectionCallback.bind(this, "left")}></div>
						</div>
					</div>
					<div className="play-progress">
						<div className="current-time">{secondsToTime(currentSongTime)}</div>
						<div className="progress" ref={ref => this.progressRef = ref}>
							<div className="progress-played" ref={ref => this.progressPlayedRef = ref}></div>
							<div className="progress-unplayed" ref={ref => this.progressUnplayedRef = ref}></div>
							<div className="progress-out-point" ref={ref => this.progressOutPoint = ref} ></div>
							<div className="progress-inner-point" ref={ref => this.progressInnerPoint = ref} ></div>
						</div>
						<div className="duration-time">{secondsToTime(currentSongInfo.duration)}</div>
					</div>
					<div className="bottom-controller">
						<div className={`save-svg ${songIsSaved ? 'save-song-svg' : ""}`}
							onClick={(e) => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal, e, musicPageType, this)}>
							<HearSvg />
						</div>
						<div className="fa fa-step-backward play-previous"
							onClick={(e) => this.playPreviousSongFunc(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, this)}>
						</div>
						<div className="play-or-pause">
							{
								soundPlaying
								?	<div className="fa fa-pause" ref={ref => this.pauseRef = ref} onClick={this.pause}></div>
								:	<div className="fa fa-play" ref={ref => this.playRef = ref} onClick={(e) => this.resume(e, this)}></div>
							}
						</div>
						<div className="fa fa-step-forward play-next"
							onClick={(e) => this.playNextSongFunc(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, this)}>

						</div>
						<i className="fa fa-download download-song"
							onClick={() => this.saveMusicToLocalFunc(currentPlayingMusicList, currentSongInfo.filename, currentSongInfo.uploadUsername, currentSongInfo.fileSize, currentSongInfo.filePath, currentSongInfo.filenameOrigin, currentSongInfo.duration, currentSongInfo.original, currentSongInfo.id, Number(currentSongInfo.payDownload), this)
						}></i>
					</div>

				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {
		soundPlaying: state.fileServer.soundPlaying,
		soundInstance: state.fileServer.soundInstance,
		soundInstanceId: state.fileServer.soundInstanceId,
		currentPlayingSong: state.fileServer.currentPlayingSong,
		musicCollection: state.fileServer.musicCollection,
		currentPlayingSongOriginal: state.fileServer.currentPlayingSongOriginal,
		currentPlayingMusicList: state.fileServer.currentPlayingMusicList,
		musicPageType: state.fileServer.musicPageType,
		currentSongTime: state.fileServer.currentSongTime,
		isHeadPhoneView: state.fileServer.isHeadPhoneView
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlaying);
