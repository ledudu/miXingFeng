import React from 'react';
import { connect } from "react-redux";
import { saveSongFunc, removePrefixFromFileOrigin, playPreviousSong, playNextSong, pauseMusic, resumeMusic, getFilenameWithoutExt } from "../../logic/common"
import { CONSTANT } from '../../constants/enumeration';
import HearSvg from "./heartSvg"

class MusicController extends React.Component{

	componentDidMount(){
		window.eventEmit.$on("listenMusicSaved", () => {
			// redux更新已收藏的数据,但视图没更新,这里强制更新下
			this.forceUpdate()
		})
	}

	componentWillUnmount(){
		window.eventEmit.$off("listenMusicSaved")
	}

	pause = (e) => {
		if(e) e.stopPropagation();
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController pause currentPlayingSong", currentPlayingSong)
		pauseMusic(soundInstance, soundInstanceId, currentPlayingSong)
	}

	resume = (e) => {
		if(e) e.stopPropagation();
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId) return alert('请选择一首歌播放')
		logger.info("MusicController resume currentPlayingSong", currentPlayingSong)
		resumeMusic(soundInstance, soundInstanceId, currentPlayingSong)
	}

	gotoPlayingMusicPage = () => {
		const { musicPageType } = this.props
		const urlHash =  window.getRoute()
		switch(musicPageType){
			case CONSTANT.musicOriginal.musicShare:
				if(urlHash !== "/main/music") window.goRoute(null, "main/music")
				break
			case CONSTANT.musicOriginal.savedSongs:
				if(urlHash !== "/saved_songs") window.goRoute(null, "saved_songs")
				break
			case CONSTANT.musicOriginal.musicFinished:
				if(urlHash !== "/my_finished_musics") window.goRoute(null, "my_finished_musics")
				break
			case CONSTANT.musicOriginal.musicRecent:
				if(urlHash !== "/recent_music_played") window.goRoute(null, "recent_music_played")
				break
			case "onlySearchShareMusic":
				if(urlHash !== "/search_music") window.goRoute(null, "search_music")
				break
			case "onlineMusic":
				if(urlHash !== "/search_online_music") window.goRoute(null, "search_online_music")
				break
			case "onlineMusicSearchALl":
				if(urlHash !== "/onlineMusicSearchALl") window.goRoute(null, "search_all")
				break
			default:
				break
		}
	}

	render(){
		const {
			currentPlayingSong,
			currentPlayingMusicList=[],
			musicCollection=[],
			currentPlayingSongOriginal,
			soundPlaying,
			musicPageType,
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
		const songIsSaved = currentSongInfo.saved || currentPlayingSongOriginal === "savedSongs"
		const currentSongFilename = currentSongInfo.filename ? getFilenameWithoutExt(currentSongInfo.filename) : "当前没有播放歌曲"
		return (
			<div className="window-music-controller"  ref={ref => window.musicController = ref} onClick={this.gotoPlayingMusicPage} >
				<div className="song-pic" >{currentSongInfo.filename && currentSongInfo.filename.slice(0, 1).toUpperCase() || ""}</div>
				<div className="song-info">
					<div className="song-name">{currentSongFilename}</div>
					<div className="singer-name">{currentSongInfo.uploadUsername || "无"}</div>
				</div>
				<div className={`${songIsSaved ? 'save-song-svg' : ""}`}
					onClick={(e) => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal, e, musicPageType, this)}>
					<HearSvg />
				</div>
				<div className="fa fa-step-backward play-previous"
					onClick={(e) => playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, this)}>
				</div>
				<div className="play-or-pause">
					<svg width="32" height="32" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
						<circle r="50" cx="50" cy="50" fill="transparent" className="progress-background"></circle>
						<circle r="50" cx="50" cy="50" fill="transparent" ref={ref => window.circleControlRef = ref}
							strokeDasharray={314.1592653589793} strokeDashoffset={314.1592653589793}
							className="progress-bar"></circle>
    				</svg>
					{
						soundPlaying
						?	<div className="fa fa-pause" onClick={this.pause}></div>
						:	<div className="fa fa-play" onClick={this.resume}></div>
					}
				</div>
				<div className="fa fa-step-forward play-next"
					onClick={(e) => playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e, this)}>

				</div>
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
		musicCollection: state.fileServer.musicCollection,
		currentPlayingSongOriginal: state.fileServer.currentPlayingSongOriginal,
		currentPlayingMusicList: state.fileServer.currentPlayingMusicList,
		musicPageType: state.fileServer.musicPageType,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicController);

