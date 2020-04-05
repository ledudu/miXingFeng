import React, { useEffect, useState, useRef, Fragment } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import { Player, BigPlayButton, ControlBar } from 'video-react';
import 'video-react/dist/video-react.css'
import { CONSTANT } from "../constants/enumeration"
import { HTTP_URL } from "../constants/httpRoute"
import Loading from "./child/loading"
import { hideMusicController, pauseMusic, dealWithThirdPartVisit, saveFileToLocalFunc } from "../logic/common"
import NavBar from "./child/navbar"
import { networkErr, shareVideoToWeChat, saveFileToLocal, comeFromWeChat } from "../services/utils"
import "../themes/css/fileServer.less"

let filename = "MV"
, 	isFromThirdPart = false
, 	mvId=""
, 	original=""

const MusicMvPlayer = ({ location, userId }) => {
	const [getMvLink, setGetMvLink] = useState(false)
	const [mvLink, setMvLink] = useState(null)
	const playerRef = useRef()
	const history = useHistory()

	if(location && location.query && location.query){
		filename = location.query.filename
		mvId = location.query.mvId
		original = location.query.original
	}

	useEffect(() => {
		isFromThirdPart = !!location.search
		if(isFromThirdPart){
			const queryParams = dealWithThirdPartVisit()
			if(queryParams.mvId){
				mvId = queryParams.mvId
				filename = queryParams.filename
				original = queryParams.original
				userId = "weChatUser" + Math.random().toString(36).slice(-5)
			} else {
				return alertDialog("视频播放失败, 请稍候再试")
			}
		} else {
			if(!location || !location.query) {
				alertDebug("no location.query")
				history.push("/main/myInfo")
			}
			document.addEventListener("deviceready", listenBackButton, false);
			hideMusicController()
			pauseMusic()
		}
		let getMvLinkUrl = HTTP_URL.getQQMvLink
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
					playerRef.current && playerRef.current.subscribeToStateChange(listenVideoState)
				} else {
					alertDialog("没有视频链接")
					if(!isFromThirdPart) backToMainPage("nav")
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
		if(!isFromThirdPart){
			if(origin === "nav") window.history.back()
			setTimeout(() => {
				document.querySelector("#root .container .main-content").style.height = "calc(100vh - 66px)"
				window.musicControllerRef && window.musicControllerRef.current.style && (window.musicControllerRef.current.style.display = "flex")
			}, 100)
		} else {
			alert("请手动关闭页面")
		}
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
		if(!isFromThirdPart){
			const { original, filename } = location.query;
			const uploadUsername = original === CONSTANT.musicOriginal.netEaseCloud ? "网易云" : original === CONSTANT.musicOriginal.qqMusic ? "qq音乐" : "未知"
			const filenameOrigin = filename + ".mp4"
			saveFileToLocalFunc(filename, uploadUsername, "未知", mvLink, false, filenameOrigin, history, null)
		} else {
			downloadApp()
		}
	}

	const shareToWeChat = () => {
		const mvInfo = {
			filename,
			mvId,
			original,
			isFromThirdPart: "weChat"
		}
		let videoUrl = `${CONSTANT.appStaticDirectory}#/music_mv_Player`
		const arr = []
		for (let key in mvInfo) {
			arr.push(`${key}=${mvInfo[key]}`)
		}
		videoUrl = `${videoUrl}?${arr.join('&')}`
		return shareVideoToWeChat({
			title: "MV: " + filename,
			description: "觅星峰，一的集qq音乐，网易云音乐，酷狗音乐和酷我音乐为一身的音乐播放器",
			thumb: `${CONSTANT.appStaticDirectory}logo.png`,
			videoUrl
		})
	}

	const downloadApp = () => {
		if(comeFromWeChat()){
			// setShowDownloadHeaderTip(true)
			window.alertOld("链接打不开?请点击右上角...,选择在浏览器打开")
		} else {
			saveFileToLocal({
				filenameOrigin: "shareMVFromThirdPart",
				fileUrl: CONSTANT.appDownloadUrl,
				folder: CONSTANT.downloadAppFromPage
			})
		}
	}

    return (
		<div className="music-mv-player-container">
			<NavBar
				centerText={filename}
				backToPreviousPage={backToMainPage.bind(this, 'nav')}
			/>
			<div className="music-mv-player-content">
				{
					getMvLink
					? 	<Fragment>
							<Player ref={playerRef} autoPlay>
								<ControlBar autoHide={true} />
								<source src={mvLink} />
								<BigPlayButton position="center" />
							</Player>
							{
								isFromThirdPart
								?	<div className="weChat-tips">
										<div className="open" onClick={downloadApp} >打开</div>
										<div className="download" onClick={downloadApp} >下载</div>
									</div>
								:	<div className="mv-menu">
										{ window.isCordova ? <i className="fa fa-share share" aria-hidden="true" onClick={shareToWeChat} ></i> : null }
										<i className="fa fa-download download-song" aria-hidden="true" onClick={downloadMv}></i>
									</div>
							}

						</Fragment>
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
