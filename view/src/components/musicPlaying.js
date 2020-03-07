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
	hideMusicController
} from "../logic/common"
import { updateCurrentSongTime } from "../ducks/fileServer"
import { debounce, backToPreviousPage } from "../services/utils"
import AmazingBaby from "./child/amazingBaby"
import { CONSTANT } from '../constants/enumeration';

class MusicPlaying extends React.Component {

	constructor(props){
		super(props)
		this.ifBool = false
		this.random = Math.random()
	}

	componentDidMount(){
		document.addEventListener("deviceready", this.listenBackButton, false);
		if(window.isCordova) StatusBar.overlaysWebView(true);
		if(this.random > 0.5) this.musicPlayingContainer.style.backgroundImage = 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)'
		this.playRef && (this.playRef.style.paddingLeft = "5px")
		this.pauseRef && (this.pauseRef.style.paddingLeft = "0px")
		// this.progressOutPoint.addEventListener("touchstart", this.start);
		// this.progressOutPoint.addEventListener("mousedown", this.start);
		// this.progressOutPoint.addEventListener("touchmove",  this.move);
		// this.progressOutPoint.addEventListener("mousemove",  this.move);
		this.progressRef.addEventListener("click", this.move);
		// this.progressOutPoint.addEventListener("touchend", this.end);
		// this.progressOutPoint.addEventListener("mouseup", this.end);
		const { currentSongTime } = this.props
		this.updateProgressLine(currentSongTime)
		if(!window.isCordova){
			$("#root .music-playing-container .top-status-bar").css("height", "15px")
			$("#root .music-playing-container .music-playing-content").css("height", "calc(100vh - 50px)")
			$("#root .music-playing-container .music-playing-content .top").css("height", "calc(100vh - 190px)")
		}
		hideMusicController()
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
		// this.progressOutPoint.removeEventListener("touchstart", this.start);
		// this.progressOutPoint.removeEventListener("mousedown", this.start);
		// this.progressOutPoint.removeEventListener("touchmove", this.move);
		// this.progressOutPoint.removeEventListener("mousemove", this.move);
		this.progressRef.removeEventListener("click", this.move);
		// this.progressOutPoint.removeEventListener("touchend", this.end);
		// this.progressOutPoint.removeEventListener("mouseup", this.end);
		if(window.isCordova) {
			StatusBar.overlaysWebView(false);
			StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
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
			const percent = (minDivLeft / (progressRestWidth - 14)).toFixed(2)
			logger.info("move music progress move percent", percent)
			const debounceFunc =  debounce(() => {
				$dispatch(updateCurrentSongTime(this.currentSongInfo.duration * percent))
			}, 1000)
			debounceFunc()
		} else {
			if(e.clientX){
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
			currentSongTime
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
			<div className="music-playing-container" ref={ref => this.musicPlayingContainer = ref}>
				<NavBar
					centerText={currentSongFilename}
					backToPreviousPage={this.backToMainPage}
					rightText="源页面"
					rightTextFunc={this.gotoPlayingOrigin}
				/>
				<div className="music-playing-content">
					<div className="top">
						{
							this.random > 0.5
							?	<AmazingBaby />
							:	<div className='music'>
									<span className='line line1'></span>
									<span className='line line2'></span>
									<span className='line line3'></span>
									<span className='line line4'></span>
									<span className='line line5'></span>
								</div>
						}
					</div>
					<div className="play-progress">
						<div className="current-time">{secondsToTime(currentSongTime)}</div>
						<div className="progress" ref={ref => this.progressRef = ref}>
							<div className="progress-played" ref={ref => this.progressPlayedRef = ref}>

							</div>
							<div className="progress-unplayed" ref={ref => this.progressUnplayedRef = ref}>

							</div>
							<div className="progress-out-point" ref={ref => this.progressOutPoint = ref} ></div>
							<div className="progress-inner-point" ref={ref => this.progressInnerPoint = ref} ></div>
						</div>
						<div className="duration-time">{secondsToTime(currentSongInfo.duration)}</div>
					</div>
					<div className="bottom-controller">
						<i className={`fa ${songIsSaved ? 'fa-heart' : 'fa-heart-o'}`} aria-hidden="true"
							onClick={(e) => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal, e, musicPageType, this)}
						></i>
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
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlaying);
