import React, { useEffect, useState, useRef } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import { Player, BigPlayButton, ControlBar } from 'video-react';
import 'video-react/dist/video-react.css'
import { CONSTANT } from "../constants/enumeration"
import { HTTP_URL } from "../constants/httpRoute"
import Loading from "./child/loading"
import { hideMusicController, pauseMusic } from "../logic/common"
import NavBar from "./child/navbar"
import { networkErr, saveFileToLocal, updateDownloadingStatus } from "../services/utils"

const MusicMvPlayer = ({ location, userId }) => {
	const [getMvLink, setGetMvLink] = useState(false)
	const [mvLink, setMvLink] = useState(null)
	const playerRef = useRef()
	const history = useHistory()

	useEffect(() => {
		if(!location || !location.query) {
			alertDebug("no location.query")
			history.push("/main/myInfo")
		}
		document.addEventListener("deviceready", listenBackButton, false);
		hideMusicController()
		pauseMusic()
		const { mvId, original } = location.query;
		let getMvLinkUrl = ""
		if(original === CONSTANT.musicOriginal.netEaseCloud){
			getMvLinkUrl = HTTP_URL.getNetEaseCloudMvLink
		} else if(original === CONSTANT.musicOriginal.qqMusic){
			getMvLinkUrl = HTTP_URL.getQQMvLink
		}
		axios.get(getMvLinkUrl.format({id: mvId, userId}))
			.then((response) => {
				const result = response.data.result
				if(result.response){
					setGetMvLink(true)
					setMvLink(result.response)
					playerRef && playerRef.current.subscribeToStateChange(listenVideoState)
				} else {
					alertDialog("没有视频链接")
					backToMainPage("nav")
				}
			})
			.catch(err => {
				networkErr(err, "MusicMvPlayer")
			})
		return () => {
			portrait()
        	document.removeEventListener("deviceready", listenBackButton);
        	document.removeEventListener("backbutton", backToMainPage);
		}
	}, [])

	const listenBackButton = () => {
		window.plugins.insomnia.keepAwake()
		document.addEventListener("backbutton", backToMainPage, false)
    }

	const backToMainPage = (origin) => {
		if(origin === "nav") window.history.back()
		setTimeout(() => {
			document.querySelector("#root .container .main-content").style.height = "calc(100vh - 66px)"
			window.musicControllerRef && window.musicControllerRef.current.style && (window.musicControllerRef.current.style.display = "flex")
		}, 100)
	}

	const landscape = () => {
		if(window.isCordova){
			StatusBar.overlaysWebView(true);
			screen.orientation.lock('landscape');
		}
	}

	const portrait = () => {
		if(window.isCordova){
			StatusBar.overlaysWebView(false);
			StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
			screen.orientation.lock('portrait');
			window.plugins.insomnia.allowSleepAgain()
		}
	}

	const listenVideoState = (state, prevState) => {
		if(state.isFullscreen !== prevState.isFullscreen){
			let filename = "MV"
			if(location && location.query && location.query.filename){
				filename = location.query.filename
			}
			logger.info("listenVideoState state.isFullscreen, filename", state.isFullscreen, filename)
			logger.info("listenVideoState prevState.isFullscreen, filename", prevState.isFullscreen, filename)
			if(state.isFullscreen){
				landscape()
			} else {
				portrait()
			}
		}
	}

	const downloadMv = () => {
		const { original, filename } = location.query;
		const uploadUsername = original === CONSTANT.musicOriginal.netEaseCloud ? "网易云" : original === CONSTANT.musicOriginal.qqMusic ? "qq音乐" : "未知"
		const filenameOrigin = filename + ".mp4"
		alert(`开始下载${filename}`)
		updateDownloadingStatus(filenameOrigin, '准备中', uploadUsername, "未知", true, mvLink, filenameOrigin, false, {})
		saveFileToLocal(filenameOrigin, mvLink, "download", filenameOrigin, uploadUsername, true, "未知", false)
	}

	let filename = "MV"
	if(location && location.query && location.query.filename){
		filename = location.query.filename
	}
    return (
		<div className="music-mv-player-container">
			<NavBar centerText={filename} backToPreviousPage={backToMainPage.bind(this, 'nav')}
				rightText="下载" rightTextFunc={downloadMv}
			/>
			<div className="music-mv-player-content">
				{
					getMvLink
					? 	<Player ref={playerRef} autoPlay>
							<ControlBar autoHide={true} />
							<source src={mvLink} />
							<BigPlayButton position="center" />
						</Player>
					:	<Loading />
				}
			</div>
		</div>
	)
}

const mapStateToProps = state => {
    return {
		userId: state.login.userId,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MusicMvPlayer);
