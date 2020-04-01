import React from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import MusicPlayer from "./musicPlayer"
import NavBar from "./child/navbar";
import { CONSTANT } from "../constants/enumeration"

const MyFinishedMusics = ({ downloadedMusicList, downloadingMusicItems }) => {

	const history = useHistory()

	const handleMusicBackEventFunc = () => {
		if(!window.cancelMenuFirst){
			history.push("/my_download_middle_page")
		}
	}

	return (
		<div className="my-download-container">
			<NavBar centerText="音乐" backToPreviousPage={handleMusicBackEventFunc} />
			<div className="my-download-content">
				<div className="downloading-file-container">
					<div className="downloading-file-title">正在下载</div>
					{ window.isCordova && <MusicPlayer
							musicDataList={downloadingMusicItems}
							original={CONSTANT.musicOriginal.musicDownloading}
							noShowMusicPlaying={true}
						/>
					}
				</div>
				<div className="interval-line"></div>
				<div className="downloaded-file-container">
					<div className="downloaded-file-title">已完成</div>
					{ window.isCordova && <MusicPlayer
							musicDataList={downloadedMusicList}
							original={CONSTANT.musicOriginal.musicFinished}
							pageType={CONSTANT.musicOriginal.musicFinished}
							myMusicPage={true}
						/>
					}
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
