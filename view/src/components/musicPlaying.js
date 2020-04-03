import React, { useEffect, useState, useRef } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import NavBar from "./child/navbar";
import HearSvg from "./child/heartSvg"
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
	touchDirection,
	removeTouchDirection,
	checkToShowPlayController
} from "../logic/common"
import { updateCurrentSongTime, updateIsHeadPhoneView, updateShowMusicPlayingFromMusicControl } from "../ducks/fileServer"
import { IsPC, alert, specialBackFunc } from "../services/utils"
import AmazingBaby from "./child/amazingBaby"
import { CONSTANT } from '../constants/enumeration';

const MusicPlaying = ({
	currentPlayingSong,
	currentPlayingMusicList=[],
	musicCollection=[],
	currentPlayingSongOriginal,
	soundPlaying,
	musicPageType,
	currentSongTime,
	isHeadPhoneView,
	soundInstance,
	soundInstanceId,
	currentMusicItemInfo,
	fromMusicControl,
	showMusicPlayingFromMusicControl
}) => {
	let ifBool = false
		, offsetXValue=window.innerWidth/2
		, offsetYValue=0
		, offsetFirstXValue=0
		, offsetFirstYValue=0
		, movingX=false
		, movingY=false
	const [ showSelectedAnimation, setShowSelectedAnimation ] = useState(false)
	const touchDirectionObj = { debounceTimer: null, firstTimeRun: false, }
	,	windowInnerWidth = window.innerWidth
	,	windowInnerHeight = window.innerHeight
	,	history = useHistory()
	,	playRef = useRef()
	,	pauseRef = useRef()
	,	progressRef = useRef()
	,	musicPlayingTopRef = useRef()
	,	musicPlayingContainerRef = useRef()
	,	progressPlayedRef = useRef()
	,	progressUnplayedRef = useRef()
	,	progressOutPointRef = useRef()
	,	progressInnerPointRef = useRef()

	useEffect(() => {
		if(fromMusicControl) musicPlayingPageXAnimation()
		document.addEventListener("deviceready", listenBackButton, false);
		playRef.current && (playRef.current.style.paddingLeft = "5px")
		pauseRef.current && (pauseRef.current.style.paddingLeft = "0px")
		progressRef.current.addEventListener("touchstart", startProgress, false);
		progressRef.current.addEventListener("mousedown", startProgress, false);
		progressRef.current.addEventListener("touchmove",  moveProgress, false);
		progressRef.current.addEventListener("mousemove",  moveProgress, false);
		progressRef.current.addEventListener("click", moveProgress, false);
		if(fromMusicControl){
			window.addEventListener("touchstart", startPage, false);
			window.addEventListener("touchmove",  movePage, false);
			window.addEventListener("touchend",  endPage, false);
		}
		window.addEventListener("touchend", endProgress);
		window.addEventListener("mouseup", endProgress);
		updateProgressLine(currentSongTime)
		// touchDirection(musicPlayingTopRef.current, ['swipeLeft', 'swipeRight'], touchDirectionCallback, touchDirectionObj)
		return () => {
			document.removeEventListener("deviceready", listenBackButton, false);
			document.removeEventListener("backbutton", backKeyDownToPrevious, false)
			progressRef.current.removeEventListener("touchstart", startProgress);
			progressRef.current.removeEventListener("mousedown", startProgress);
			progressRef.current.removeEventListener("touchmove", moveProgress);
			progressRef.current.removeEventListener("mousemove", moveProgress);
			progressRef.current.removeEventListener("click", moveProgress);
			if(fromMusicControl){
				window.removeEventListener("touchstart", startPage, false);
				window.removeEventListener("touchmove",  movePage, false);
				window.removeEventListener("touchend",  endPage, false);
			}
			window.removeEventListener("touchend", endProgress);
			window.removeEventListener("mouseup", endProgress);
			// removeTouchDirection(musicPlayingTopRef.current)
		}
	}, [])

	useEffect(() => {
		updateProgressLine(currentSongTime)
	}, [currentSongTime])

	const touchDirectionCallback = (direction) => {
		logger.info('touchDirectionCallback direction, isHeadPhoneView', direction, isHeadPhoneView)
		if(direction === 'left'){
			logger.info("switch to head phone")
			$dispatch(updateIsHeadPhoneView(true))
		} else if(direction === 'right'){
			logger.info("switch to amazing baby")
			$dispatch(updateIsHeadPhoneView(false))
		}
	}

	const listenBackButton = () => {
		document.addEventListener("backbutton", backKeyDownToPrevious, false)
	}

	const updateProgressLine = (currentSongTime) => {
		const percent = (currentSongTime / currentMusicItemInfo.duration)
		const progressWidth= (window.innerWidth - 124)
		progressPlayedRef.current.style.width = (progressWidth * percent) + "px"
		progressUnplayedRef.current.style.width = (progressWidth * (1 - percent)) + "px"
		progressUnplayedRef.current.style.left = (progressWidth * percent + 14) + "px"
		progressOutPointRef.current.style.left = (progressWidth * percent) + "px"
		progressInnerPointRef.current.style.left = (progressWidth * percent + 3) + "px"
	}

	const startProgress = (e) => {
		e.stopPropagation();
		ifBool = true;
		logger.info("鼠标按下")
		setShowSelectedAnimation(true)
	}

	const moveProgress = (e) => {
		e.stopPropagation();
		if (ifBool) {
			const progressRestWidth = progressRef.current.offsetWidth - 14
			const x = e.clientX || e.touches[0].pageX
			let minDivLeft = ((x - 55) > progressRestWidth) ? progressRestWidth : (x - 55)
			minDivLeft = ((x - 55) < 0) ? 0 : minDivLeft
			const percent = (minDivLeft / progressRestWidth).toFixed(2)
			const seekTime = currentMusicItemInfo.duration * percent
			logger.info("move music progress move percent, seekTime", percent, seekTime)
			$dispatch(updateCurrentSongTime(seekTime))
			if(soundInstance && soundInstanceId) {
				soundInstance.seek(seekTime, soundInstanceId);
			}
		} else {
			if(e.clientX && !IsPC()){
				const percent = ((e.clientX - 55) / (progressRef.current.offsetWidth - 14)).toFixed(2)
				const seekTime = currentMusicItemInfo.duration * percent
				logger.info("move music progress click percent, seekTime", percent, seekTime)
				$dispatch(updateCurrentSongTime(seekTime))
				if(soundInstance && soundInstanceId) {
					soundInstance.seek(seekTime, soundInstanceId);
				}
			}
		}
	}

	const endProgress = (e) => {
		e.stopPropagation();
		logger.info("鼠标弹起")
		ifBool = false;
		setShowSelectedAnimation(false)
	}

	const startPage = (e) => {
		e.stopPropagation();
		offsetFirstXValue = e.clientX || e.touches[0].pageX
		offsetFirstYValue = e.clientY || e.touches[0].pageY
		logger.info("startPage offsetFirstXValue", offsetFirstXValue, 'offsetFirstYValue', offsetFirstYValue)
	}

	const movePage = (e) => {
		e.stopPropagation();
		const x = e.clientX || e.touches[0].pageX
		const y = e.clientY || e.touches[0].pageY
		offsetXValue = (x - offsetFirstXValue)
		offsetYValue = (y - offsetFirstYValue)
		if(offsetXValue > 0 || offsetYValue > 0){
			if((offsetXValue >= offsetYValue) && movingY !== true){
				movingX = true
				musicPlayingContainerRef.current.style.left = offsetXValue + "px"
			} else if(offsetYValue > 0 && movingX !== true) {
				movingY = true
				musicPlayingContainerRef.current.style.top = offsetYValue + "px"
			}
		}
	}

	const endPage = (e) => {
		e.stopPropagation();
		logger.info("endPage offsetXValue", offsetXValue, 'offsetYValue', offsetYValue)
		if(offsetXValue > 0 || offsetYValue > 0){
			if(offsetXValue >= offsetYValue){
				movingX = false
				musicPlayingPageXAnimation()
			} else {
				movingY = false
				musicPlayingPageYAnimation()
			}
		}
	}

	const musicPlayingPageXAnimation = () => {
		if(offsetXValue > 0 && offsetXValue <= (windowInnerWidth / 2)){
			if(offsetXValue < 15){
				offsetXValue = 0
				musicPlayingContainerRef.current.style.left = 0
			} else {
				offsetXValue -= 15
				musicPlayingContainerRef.current.style.left = (offsetXValue + "px")
				window.requestAnimationFrame(musicPlayingPageXAnimation)
			}
		} else if((offsetXValue > (windowInnerWidth / 2)) && (offsetXValue < windowInnerWidth)){
			musicPlayingContainerRef.current.style.left = (offsetXValue + "px")
			offsetXValue += 15
			window.requestAnimationFrame(musicPlayingPageXAnimation)
		} else if(offsetXValue >= windowInnerWidth){
			offsetXValue = 0
			$dispatch(updateShowMusicPlayingFromMusicControl(false))
		}
	}

	const musicPlayingPageYAnimation = () => {
		if(offsetYValue > 0 && offsetYValue <= (windowInnerHeight / 3)){
			if(offsetYValue < 25){
				offsetYValue = 0
				musicPlayingContainerRef.current.style.top = 0
			} else {
				offsetYValue -= 25
				musicPlayingContainerRef.current.style.top = (offsetYValue + "px")
				window.requestAnimationFrame(musicPlayingPageYAnimation)
			}
		} else if((offsetYValue > (windowInnerHeight / 3)) && (offsetYValue < windowInnerHeight)){
			musicPlayingContainerRef.current.style.top = (offsetYValue + "px")
			offsetYValue += 25
			window.requestAnimationFrame(musicPlayingPageYAnimation)
		} else if(offsetYValue >= windowInnerHeight){
			offsetYValue = 0
			$dispatch(updateShowMusicPlayingFromMusicControl(false))
		}
	}

	const backKeyDownToPrevious = () => {
		specialBackFunc()
		backToMainPage()
	}

	const backToMainPage = () => {
		if(showMusicPlayingFromMusicControl){
			if(offsetXValue >= windowInnerWidth){
				$dispatch(updateShowMusicPlayingFromMusicControl(false))
			} else {
				offsetXValue += 25
				musicPlayingContainerRef.current.style.left = (offsetXValue + "px")
				setTimeout(backToMainPage, 17)
			}
		} else {
			history.push("/my_download_middle_page")
		}
	}

	const playPreviousSongFunc = (currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e) => {
		playRef.current && (playRef.current.style.paddingLeft = "0px")
		playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)
	}

	const playNextSongFunc = (currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e) => {
		playRef.current && (playRef.current.style.paddingLeft = "0px")
		playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)
	}

	const saveMusicToLocalFunc = (musicDataList, filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal, musicId, payDownload) => {
		if(!filename && !filenameOrigin) return alert('请选择一首歌播放')
		saveMusicToLocal(musicDataList, filename, uploadUsername, fileSize, musicSrc, filenameOrigin, duration, songOriginal, musicId, payDownload)
	}

	const pause = (e) => {
		if(e) e.stopPropagation();
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController pause currentPlayingSong", currentPlayingSong)
		pauseRef.current.style.paddingLeft = "5px"
		pauseMusic(soundInstance, soundInstanceId, currentPlayingSong)
	}

	const resume = (e) => {
		if(e) e.stopPropagation();
		if(!soundInstance && !soundInstanceId && !currentPlayingSong) return alert('请选择一首歌播放')
		logger.info("MusicController resume currentPlayingSong", currentPlayingSong)
		playRef.current.style.paddingLeft = "0px"
		resumeMusic()
	}

	const gotoPlayingOrigin = () => {
		// 只有收藏页面才有这个动画
		if(showMusicPlayingFromMusicControl && window.getRoute() === "/saved_songs" && musicPageType == "savedSongs"){
			musicPlayingContainerRef.current.style.top = (offsetYValue + "px")
			offsetYValue += 30
			if(offsetYValue >= windowInnerHeight){
				$dispatch(updateShowMusicPlayingFromMusicControl(false))
			} else {
				setTimeout(gotoPlayingOrigin, 10)
			}
		} else {
			$dispatch(updateShowMusicPlayingFromMusicControl(false))
			gotoPlayingOriginFunc()
		}
	}

	const gotoPlayingOriginFunc = () => {
		const urlHash =  window.getRoute()
		checkToShowPlayController()
		switch(musicPageType){
			case CONSTANT.musicOriginal.musicShare:
				if(urlHash !== "/main/music") history.push("/main/music")
				break
			case CONSTANT.musicOriginal.savedSongs:
				if(urlHash !== "/saved_songs") history.push("/saved_songs")
				break
			case CONSTANT.musicOriginal.musicFinished:
				if(urlHash !== "/my_finished_musics") history.push("/my_finished_musics")
				break
			case CONSTANT.musicOriginal.musicRecent:
				if(urlHash !== "/recent_music_played") history.push("/recent_music_played")
				break
			case "onlySearchShareMusic":
				if(urlHash !== "/search_music") history.push("/search_music")
				break
			case "onlineMusic":
				if(urlHash !== "/search_online_music") history.push("/search_online_music")
				break
			case "onlineMusicSearchALl":
				if(urlHash !== "/onlineMusicSearchALl") history.push("/search_all")
				break
			default:
				alert("当前没有播放的歌曲")
				break
		}
	}

	let savedMusicFilenameOriginalArr = []
	let currentMusicFilenameOriginalArr = []
	let currentFileIndex = null
	if(currentPlayingSong){
		savedMusicFilenameOriginalArr = musicCollection.map(item => removePrefixFromFileOrigin(item.filenameOrigin))
		currentMusicFilenameOriginalArr = currentPlayingMusicList.map(item => item.filenameOrigin)
		currentFileIndex = currentMusicFilenameOriginalArr.indexOf(currentPlayingSong)
	}
	const songIsSaved = currentMusicItemInfo.saved || currentPlayingSongOriginal === "savedSongs"
	const currentSongFilename = currentMusicItemInfo.filename ? getFilenameWithoutExt(currentMusicItemInfo.filename) : "当前没有播放歌曲"
	return (
		<div
			className={`music-playing-container ${isHeadPhoneView ? "head-phone-view" : "amazing-baby-view"} ${fromMusicControl ? 'from-music-control' : ""}`}
			ref={musicPlayingContainerRef}
			style={{left: fromMusicControl ? "calc(100vw / 2)" : "0px"}}
		>
			<NavBar
				centerText={currentSongFilename}
				backToPreviousPage={backToMainPage}
				rightText="源页面"
				rightTextFunc={gotoPlayingOrigin}
			/>
			<div className="music-playing-content">
				<div className="top" ref={musicPlayingTopRef}>
					<div className="music-singer">{currentMusicItemInfo.uploadUsername}</div>
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
						<div className={`dot ${!isHeadPhoneView ? 'dot-fill' : ''}`} onClick={touchDirectionCallback.bind(this, "right")}></div>
						<div className={`dot ${isHeadPhoneView ? 'dot-fill' : ''}`} onClick={touchDirectionCallback.bind(this, "left")}></div>
					</div>
				</div>
				<div className="play-progress">
					<div className="current-time">{secondsToTime(currentSongTime)}</div>
					<div className="progress" ref={progressRef}>
						<div className="progress-played" ref={progressPlayedRef}></div>
						<div className="progress-unplayed" ref={progressUnplayedRef}></div>
						<div className={`progress-out-point ${showSelectedAnimation ? "selected-animation" : ""}`} ref={progressOutPointRef} ></div>
						<div className="progress-inner-point" ref={progressInnerPointRef} ></div>
					</div>
					<div className="duration-time">{secondsToTime(currentMusicItemInfo.duration || 0)}</div>
				</div>
				<div className="bottom-controller">
					<div className={`save-svg ${songIsSaved ? 'save-song-svg' : ""}`}
						onClick={(e) => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal, e, musicPageType, this)}>
						<HearSvg />
					</div>
					<div className="fa fa-step-backward play-previous"
						onClick={(e) => playPreviousSongFunc(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)}>
					</div>
					<div className="play-or-pause">
						{
							soundPlaying
							?	<div className="fa fa-pause" ref={pauseRef} onClick={pause}></div>
							:	<div className="fa fa-play" ref={playRef} onClick={resume}></div>
						}
					</div>
					<div className="fa fa-step-forward play-next"
						onClick={(e) => playNextSongFunc(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)}>
					</div>
					<i className="fa fa-download download-song"
						onClick={() => saveMusicToLocalFunc(currentPlayingMusicList, currentMusicItemInfo.filename, currentMusicItemInfo.uploadUsername, currentMusicItemInfo.fileSize, currentMusicItemInfo.filePath, currentMusicItemInfo.filenameOrigin, currentMusicItemInfo.duration, currentMusicItemInfo.original, currentMusicItemInfo.id, Number(currentMusicItemInfo.payDownload))
					}></i>
				</div>
			</div>
		</div>
	);
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
		isHeadPhoneView: state.fileServer.isHeadPhoneView,
		currentMusicItemInfo: state.fileServer.currentMusicItemInfo,
		showMusicPlayingFromMusicControl: state.fileServer.showMusicPlayingFromMusicControl
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicPlaying);
