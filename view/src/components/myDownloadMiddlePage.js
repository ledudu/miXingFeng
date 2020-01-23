import React from 'react';
import NavBar from "./child/navbar";

class MyDownloadMiddlePage extends React.Component {

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
		window.goRoute(this, "/main/myInfo")
	}

	gotoFileDownload = () => {
		window.goRoute(this, "/my_finished_files")
	}

	gotoMusicDownload = () => {
		window.goRoute(this, "/my_finished_musics")
	}

	render() {
        return (
            <div className="my-download-outside-container">
				<NavBar centerText="下载" backToPreviousPage={this.backToMainPage} />
				<div className="my-download-outside-content">
					<div className="file-download-page-btn" onClick={this.gotoFileDownload}>文件</div>
					<div className="music-download-page-btn" onClick={this.gotoMusicDownload}>音乐</div>
				</div>
			</div>
        );
	}
}

export default MyDownloadMiddlePage;
