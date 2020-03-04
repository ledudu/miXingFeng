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
	secondsToTime
} from "../logic/common"

class MusicPlaying extends React.Component {

	componentDidMount(){
		this.playRef && (this.playRef.style.paddingLeft = "5px")
		this.pauseRef && (this.pauseRef.style.paddingLeft = "0px")
	}

	componentWillReceiveProps(nextProps){
		const { currentSongTime } = this.props
		if(currentSongTime !== nextProps.currentSongTime){
			const percent = (currentSongTime / this.currentSongInfo.duration)
			const progressWidth= (window.innerWidth - 124)
			this.progressPlayedRef.style.width = (progressWidth * percent) + "px"
			this.progressUnplayedRef.style.width = (progressWidth * (1 - percent)) + "px"
			this.progressUnplayedRef.style.left = (progressWidth * percent + 14) + "px"
			this.progressOutPoint.style.left = (progressWidth * percent) + "px"
			this.progressInnerPoint.style.left = (progressWidth * percent + 3) + "px"
		}
	}

	backToMainPage = () => {
		window.goRoute(this, "/my_download_middle_page")
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
			<div className="music-playing-container">
				<NavBar
					centerText={currentSongFilename}
					backToPreviousPage={this.backToMainPage}
				/>
				<div className="music-playing-content">
					<div className="top"></div>
					<div className="play-progress">
						<div className="current-time">{secondsToTime(currentSongTime)}</div>
						<div className="progress">
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
