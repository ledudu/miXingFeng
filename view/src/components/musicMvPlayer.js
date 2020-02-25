import React from 'react';
import { Player, BigPlayButton } from 'video-react';
import 'video-react/dist/video-react.css'
import { CONSTANT } from "../constants/enumeration"
import { HTTP_URL } from "../constants/httpRoute"
import Loading from "./child/loading"
import { hideMusicController, pauseMusic } from "../logic/common"
import NavBar from "./child/navbar"

export default class MusicMvPlayer extends React.Component {

	state = {
		getMvLink: false,
		mvLink: null
	}

    componentDidMount(){
		if(!this.props.location || !this.props.location.query) {
			alertDebug("no location.query")
			return window.goRoute(this, "/main/myInfo")
		}
		document.addEventListener("deviceready", this.listenBackButton, false);
		hideMusicController()
		pauseMusic()
		const { mvId, original } = this.props.location.query;
		let getMvLinkUrl = ""
		if(original === CONSTANT.musicOriginal.netEaseCloud){
			getMvLinkUrl = HTTP_URL.getNetEaseCloudMvLink
		} else if(original === CONSTANT.musicOriginal.qqMusic){
			getMvLinkUrl = HTTP_URL.getQQMvLink
		} else {
			return
		}
		return axios.get(getMvLinkUrl.format({id: mvId, userId: localStorage.getItem("userId")}))
			.then((response) => {
				const result = response.data.result
				if(result.response){
					this.setState({
						getMvLink: true,
						mvLink: result.response
					}, () => {
						this.player && this.player.subscribeToStateChange(this.listenVideoState)
					})
				} else {
					alertDialog("没有视频链接")
					this.backToMainPage()
				}
			})
	}

	componentDidCatch(err){
		alertDebug("componentDidCatch err")
		logger.error("MusicMvPlayer componentDidCatch err", err)
		return window.goRoute(this, "/main/myInfo")
	}

	componentWillUnmount(){
		this.portrait()
        document.removeEventListener("deviceready", this.listenBackButton);
        document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackButton = () => {
		document.addEventListener("backbutton", this.backToMainPage, false)
    }

	backToMainPage = () => {
		window.history.back()
		setTimeout(() => {
			$("#root .container .main-content").css("height", "calc(100vh - 66px)")
			window.musicController && window.musicController.style && (window.musicController.style.display = "flex")
		}, 50)
	}

	landscape = () => {
		if(window.isCordova){
			StatusBar.overlaysWebView(true);
			screen.orientation.lock('landscape');
		}
	}

	portrait = () => {
		if(window.isCordova){
			StatusBar.overlaysWebView(false);
			StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
			screen.orientation.lock('portrait');
		}
	}

	listenVideoState = (state, prevState) => {
		if(state.isFullscreen !== prevState.isFullscreen){
			let filename = "MV"
			if(this.props.location && this.props.location.query && this.props.location.query.filename){
				filename = this.props.location.query.filename
			}
			logger.info("listenVideoState state.isFullscreen, filename", state.isFullscreen, filename)
			logger.info("listenVideoState prevState.isFullscreen, filename", prevState.isFullscreen, filename)
			if(state.isFullscreen){
				this.landscape()
			} else {
				this.portrait()
			}
		}
	}

    render() {
		const { getMvLink, mvLink } = this.state
		let filename = "MV"
		if(this.props.location && this.props.location.query && this.props.location.query.filename){
			filename = this.props.location.query.filename
		}
        return (
			<div className="music-mv-player-container">
				<NavBar centerText={filename} backToPreviousPage={this.backToMainPage} />
				<div className="music-mv-player-content">
					{
						getMvLink
						? 	<Player ref={ref => this.player = ref}>
								<source src={mvLink} />
								<BigPlayButton position="center" />
							</Player>
						:	<Loading />
					}
				</div>
			</div>
		)
    }
}
