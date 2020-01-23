import React from 'react';
import { connect } from "react-redux";
import MusicPlayer from "./musicPlayer"
import NavBar from "./child/navbar";
import { CON } from "../constants/enumeration"
import { checkSongSavedFunc } from "../logic/common"

class MyFinishedMusics extends React.Component {

	componentDidMount(){
		document.addEventListener("deviceready", this.listenBackFunc);
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackFunc);
		document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackFunc = () => {
        document.addEventListener("backbutton", this.backToMainPage, false);
	}

	backToMainPage = () => {
		window.goRoute(this, "/my_download_middle_page")
	}

    render() {
		const { downloadedMusicList, downloadingMusicItems } = this.props
		checkSongSavedFunc(downloadedMusicList, CON.musicOriginal.musicFinished)
		return (
			<div className="my-download-container">
				<NavBar centerText="音乐" backToPreviousPage={this.backToMainPage} />
				<div className="my-download-content">
					<div className="downloading-file-container">
						<div className="downloading-file-title">正在下载</div>
						{ window.isCordova && <MusicPlayer musicDataList={downloadingMusicItems} original={CON.musicOriginal.musicDownloading} /> }
					</div>
					<div className="interval-line"></div>
					<div className="downloaded-file-container">
						<div className="downloaded-file-title">已完成</div>
						{ window.isCordova && <MusicPlayer musicDataList={downloadedMusicList} original={CON.musicOriginal.musicFinished} /> }
					</div>
				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {
		downloadedMusicList: state.fileServer.downloadedMusicList,
		downloadingMusicItems: state.fileServer.downloadingMusicItems
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MyFinishedMusics);
