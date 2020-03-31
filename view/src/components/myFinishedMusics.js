import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import MusicPlayer from "./musicPlayer"
import NavBar from "./child/navbar";
import { CONSTANT } from "../constants/enumeration"
import { checkSongSavedFunc } from "../logic/common"
import { specialBackFunc } from "../services/utils"
import { updateShowMusicPlayingFromMusicControl } from "../ducks/fileServer"

const MyFinishedMusics = ({ downloadedMusicList, downloadingMusicItems }) => {

	const history = useHistory()

	useEffect(() => {
		document.addEventListener("deviceready", listenBackButton, false);
		return () => {
			$dispatch(updateShowMusicPlayingFromMusicControl(false))
			document.removeEventListener("deviceready", listenBackButton, false);
			document.removeEventListener("backbutton", handleMusicBackEventFunc, false)
		}
	}, [])

	const listenBackButton = () => {
		document.addEventListener("backbutton", handleMusicBackEventFunc, false)
	}

	const handleMusicBackEventFunc = (isNav) => {
		if(!window.cancelMenuFirst){
			if(isNav !== "nav") specialBackFunc()
			history.push("/my_download_middle_page")
		}
	}

	checkSongSavedFunc(downloadedMusicList, CONSTANT.musicOriginal.musicFinished)
	return (
		<div className="my-download-container">
			<NavBar centerText="音乐" backToPreviousPage={handleMusicBackEventFunc.bind(null, "nav")} />
			<div className="my-download-content">
				<div className="downloading-file-container">
					<div className="downloading-file-title">正在下载</div>
					{ window.isCordova && <MusicPlayer musicDataList={downloadingMusicItems} original={CONSTANT.musicOriginal.musicDownloading} noShowMusicPlaying={true} /> }
				</div>
				<div className="interval-line"></div>
				<div className="downloaded-file-container">
					<div className="downloaded-file-title">已完成</div>
					{ window.isCordova && <MusicPlayer musicDataList={downloadedMusicList} original={CONSTANT.musicOriginal.musicFinished} pageType={CONSTANT.musicOriginal.musicFinished} /> }
				</div>
			</div>
		</div>
	)

}

const mapStateToProps = state => {
    return {
		downloadedMusicList: state.fileServer.downloadedMusicList,
		downloadingMusicItems: state.fileServer.downloadingMusicItems
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MyFinishedMusics);
