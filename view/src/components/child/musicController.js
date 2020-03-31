import React, { useRef } from 'react';
import { connect } from "react-redux";
import HearSvg from "./heartSvg"
import { updateShowMusicPlayingFromMusicControl } from "../../ducks/fileServer"
import { saveSongFunc, removePrefixFromFileOrigin, playPreviousSong, playNextSong, pauseMusic, resumeMusic, getFilenameWithoutExt } from "../../logic/common"

const MusicController = ({
	currentPlayingSong,
	currentPlayingMusicList=[],
	musicCollection=[],
	currentPlayingSongOriginal,
	soundPlaying,
	musicPageType,
	soundInstance,
	soundInstanceId,
	currentMusicItemInfo,
}) => {
	window.musicControllerRef = useRef()

	const pause = (e) => {
		if(e) e.stopPropagation();
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController pause currentPlayingSong", currentPlayingSong)
		pauseMusic(soundInstance, soundInstanceId, currentPlayingSong)
	}

	const resume = (e) => {
		if(e) e.stopPropagation();
		if(!soundInstance && !soundInstanceId && !currentPlayingSong) return alert('请选择一首歌播放')
		logger.info("MusicController resume currentPlayingSong", currentPlayingSong)
		resumeMusic()
	}

	const gotoPlayingMusicPage = () => {
		$dispatch(updateShowMusicPlayingFromMusicControl(true))
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
		<div className="window-music-controller"  ref={window.musicControllerRef} onClick={gotoPlayingMusicPage} >
			<div className="song-pic" >{currentMusicItemInfo.filename && currentMusicItemInfo.filename.slice(0, 1).toUpperCase() || ""}</div>
			<div className="song-info">
				<div className="song-name">{currentSongFilename}</div>
				<div className="singer-name">{currentMusicItemInfo.uploadUsername || "无"}</div>
			</div>
			<div className={`${songIsSaved ? 'save-song-svg' : "not-save"}`}
				onClick={(e) => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal, e, musicPageType)}>
				<HearSvg />
			</div>
			<div className="fa fa-step-backward play-previous"
				onClick={(e) => playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)}>
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
					?	<div className="fa fa-pause" onClick={pause}></div>
					:	<div className="fa fa-play" onClick={resume}></div>
				}
			</div>
			<div className="fa fa-step-forward play-next"
				onClick={(e) => playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, currentPlayingSongOriginal, currentPlayingMusicList, e)}>

			</div>
		</div>
	)
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
		currentMusicItemInfo: state.fileServer.currentMusicItemInfo,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicController);

