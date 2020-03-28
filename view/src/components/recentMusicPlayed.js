import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import MusicPlayer from "./musicPlayer"
import NavBar from "./child/navbar";
import { CONSTANT } from "../constants/enumeration"
import { stopMusic, } from "../logic/common"
import { removeRecentMusicDataByIndexFromIndexDB } from "../services/indexDBRecentMusic"
import { confirm, specialBackFunc } from "../services/utils"
import { updateRecentMusicList, updateCurrentMusicItemInfo } from "../ducks/fileServer"

const RecentMusicPlayed = ({ recentMusicList, musicPageType }) => {
	const history = useHistory()

	useEffect(() => {
		document.addEventListener("deviceready", listenBackButton, false);
		return () => {
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

	const clearAllRecentRecords = () => {
		confirm(`提示`, `确定要移除所有播放记录吗`, "确定", () => {
			$dispatch(updateRecentMusicList([]))
			recentMusicList.forEach(item => {
				removeRecentMusicDataByIndexFromIndexDB(item.filenameOrigin)
					.catch((err) => {
						logger.error("clearAllMusicRecentRecords removeRecentMusicDataByIndexFromIndexDB file err", err)
					})
			})
			if(musicPageType === CONSTANT.musicOriginal.musicRecent){
				// 假如正在播放的歌曲在最近播放页,停止播放
				stopMusic()
				$dispatch(updateCurrentMusicItemInfo({}))
				localStorage.removeItem('lastPlaySongInfo')
				localStorage.removeItem('lastPlaySongPageType')
				localStorage.removeItem('lastPlaySongMusicDataList')
			}
			if(recentMusicList.length){
				alert("删除成功")
			} else {
				alert("没有记录可以删除")
			}
		})
	}

	let recentMusicListCopy = JSON.parse(JSON.stringify(recentMusicList))
	recentMusicListCopy = _.orderBy(recentMusicListCopy, ['date'], ['desc'])
	return (
		<div className="recent-play-container">
			<NavBar
				centerText="最近播放"
				backToPreviousPage={handleMusicBackEventFunc.bind(null, "nav")}
				rightText="清空"
				rightTextFunc={clearAllRecentRecords}
			/>
			<div className="recent-play-content">
				<MusicPlayer musicDataList={recentMusicListCopy} original={CONSTANT.musicOriginal.musicRecent} pageType={CONSTANT.musicOriginal.musicRecent} />
			</div>
		</div>
	);
}

const mapStateToProps = state => {
    return {
		recentMusicList: state.fileServer.recentMusicList,
		musicPageType: state.fileServer.musicPageType,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RecentMusicPlayed);
