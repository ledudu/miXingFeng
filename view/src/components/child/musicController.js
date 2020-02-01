import React from 'react';
import { connect } from "react-redux";
import { saveSongFunc, removePrefixFromFileOrigin, playPreviousSong, playNextSong, getMusicCurrentPlayProcess } from "../../logic/common"
import { updateSoundPlaying } from "../../ducks/fileServer"

class MusicController extends React.Component{

	componentDidMount(){
		window.eventEmit.$on("listenMusicSaved", () => {
			// redux更新已收藏的数据,但视图没更新,这里强制更新下
			this.forceUpdate()
		})
	}

	pause = () => {
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController pause currentPlayingSong", currentPlayingSong)
		clearInterval(window.currentTimeInterval)
		soundInstance.pause(soundInstanceId);
		$dispatch(updateSoundPlaying(false))
	}

	resume = () => {
		const { soundInstance, soundInstanceId, currentPlayingSong } = this.props
		if(!soundInstance && !soundInstanceId) return
		logger.info("MusicController resume currentPlayingSong", currentPlayingSong)
		getMusicCurrentPlayProcess(soundInstance)
		soundInstance.play(soundInstanceId)
		$dispatch(updateSoundPlaying(true))
	}

	render(){
		const {
			currentPlayingSong,
			currentPlayingMusicList=[],
			musicCollection=[],
			currentPlayingSongOriginal,
			musicNodeList,
			soundPlaying,
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
		let currentFileIndex = -1
		if(currentPlayingSong){
			savedMusicFilenameOriginalArr = musicCollection.map(item => removePrefixFromFileOrigin(item.filenameOrigin))
			currentMusicFilenameOriginalArr = currentPlayingMusicList.map(item => item.filenameOrigin)
			currentFileIndex = currentMusicFilenameOriginalArr.indexOf(currentPlayingSong)
		}
		return (
			<div className="window-music-controller"  ref={ref => window.musicController = ref}>
				<div className="song-pic">{currentSongInfo.filename && currentSongInfo.filename.slice(0, 1).toUpperCase() || "没"}</div>
				<div className="song-info">
					<div className="song-name">{currentSongInfo.filename || "当前没有播放歌曲"}</div>
					<div className="singer-name">{currentSongInfo.uploadUsername || "无"}</div>
				</div>
				<div className={`fa fa-heart ${(currentSongInfo.saved) ? "saved" : "no-save"}`}
					onClick={() => saveSongFunc(savedMusicFilenameOriginalArr, currentPlayingSong, musicCollection, currentPlayingMusicList, currentFileIndex, currentPlayingSongOriginal)}>

				</div>
				<div className="fa fa-step-backward play-previous"
					onClick={() => playPreviousSong(currentFileIndex, currentMusicFilenameOriginalArr, musicNodeList, currentPlayingSong, soundPlaying)}>

				</div>}
				<div className="play-or-pause ">
					<div className="rect-box">
						<div className="rect left">
							<div className="circle"></div>
						</div>
						<div className="rect right">
							<div className="circle"></div>
						</div>
						{
							soundPlaying
							?	<div className="fa fa-pause" onClick={this.pause}></div>
							:	<div className="fa fa-play" onClick={this.resume}></div>
						}
					</div>
				</div>
				<div className="fa fa-step-forward play-next"
					onClick={() => playNextSong(currentFileIndex, currentMusicFilenameOriginalArr, musicNodeList, currentPlayingSong, soundPlaying)}>

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
		musicNodeList: state.fileServer.musicNodeList,
		currentPlayingSongOriginal: state.fileServer.currentPlayingSongOriginal,
		currentPlayingMusicList: state.fileServer.currentPlayingMusicList,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicController);

