import React from 'react';
import { connect } from "react-redux";
import MusicPlayer from "./musicPlayer"
import NavBar from "./child/navbar";
import { CONSTANT } from "../constants/enumeration"
import { checkSongSavedFunc } from "../logic/common"

class RecentMusicPlayed extends React.Component {

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

	clearAllRecentRecords = () => {
		window.eventEmit.$emit("clearAllMusicRecentRecords")
	}

    render() {
		let { recentMusicList } = this.props
		checkSongSavedFunc(recentMusicList, CONSTANT.musicOriginal.musicRecent)
		recentMusicList = _.orderBy(recentMusicList, ['date'], ['desc'])
		return (
			<div className="recent-play-container">
				<NavBar
					centerText="最近播放"
					backToPreviousPage={this.backToMainPage}
					rightText="清空"
					rightTextFunc={this.clearAllRecentRecords}
				/>
				<div className="recent-play-content">
					<MusicPlayer musicDataList={recentMusicList} original={CONSTANT.musicOriginal.musicRecent} pageType={CONSTANT.musicOriginal.musicRecent} />
				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {
		recentMusicList: state.fileServer.recentMusicList,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RecentMusicPlayed);
