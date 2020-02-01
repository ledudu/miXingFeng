import React, { Component } from 'react';
import { connect } from "react-redux";
import { HashRouter as Router, Route, Switch  } from 'react-router-dom';
import MyLoadable from './Loadable';
import { updateAppVersion, updateAlwaysShowAdsPage, updateHideNavBar, updateAllowGetPosition, updateAllowOthersGetPosition } from "./ducks/common"
import { updateDirectShowSignPage } from "./ducks/sign";
import { updatePauseWhenOver, updatePlayByOrder, updateMusicMenuBadge, updateSoundPlaying, updatePlayByRandom } from "./ducks/fileServer"
import { CONSTANT } from "./constants/enumeration"

const Login = MyLoadable({
    loader: () => import('./components/login')
});
const SearchUserHistory = MyLoadable({
    loader: () => import('./components/searchUserHistory')
});
const About = MyLoadable({
    loader: () => import("./components/about")
});
const Feedback = MyLoadable({
    loader: () => import("./components/feedback")
});
const SetNickname = MyLoadable({
    loader: () => import("./components/updateUserInfo/setNickname")
});
const SetMobile = MyLoadable({
    loader: () => import("./components/updateUserInfo/setMobile")
});
const SetSignature = MyLoadable({
    loader: () => import("./components/updateUserInfo/setSignature"),
});
const UserProfile = MyLoadable({
    loader: () => import("./components/userProfile")
});
const SystemSetup = MyLoadable({
    loader: () => import("./components/systemSetup")
});
const Licence = MyLoadable({
    loader: () => import("./components/about/licence")
});
const ServiceList = MyLoadable({
    loader: () => import("./components/about/serviceList")
});
const UserAgreement = MyLoadable({
    loader: () => import("./components/about/userAgreement")
});
const Privacy = MyLoadable({
    loader: () => import("./components/about/privacy")
});
const PackageIframe = MyLoadable({
    loader: () => import("./components/child/packageIframe")
});
const ResetPasswordSys = MyLoadable({
    loader: () => import("./components/resetPasswordSys")
})
const MainFrame = MyLoadable({
    loader: () => import("./components/index")
});

const Entry = MyLoadable({
    loader: () => import("./components/entry")
});

const LookHeadPic = MyLoadable({
    loader: () => import("./components/lookHeadPic")
});

const SearchColumn = MyLoadable({
    loader: () => import("./components/searchColumn")
});

const SearchPosition = MyLoadable({
    loader: () => import("./components/searchPosition")
});

const ShowOnlinePersons = MyLoadable({
    loader: () => import("./components/showOnlinePersons")
});

const MySites = MyLoadable({
	loader: () => import("./components/mySites")
})

const TypeShell = MyLoadable({
	loader: () => import("./components/typeShell")
})

const LoginRecord = MyLoadable({
	loader: () => import("./components/loginRecord")
})

const Notification = MyLoadable({
	loader: () => import("./components/notification")
})

const SavedSongs = MyLoadable({
	loader: () => import("./components/savedSongs")
})

const MyFinishedFiles = MyLoadable({
	loader: () => import("./components/myFinishedFiles")
})

const MyFinishedMusics = MyLoadable({
	loader: () => import("./components/myFinishedMusics")
})

const MyGames = MyLoadable({
	loader: () => import("./components/myGames")
})

const MusicPlayer = MyLoadable({
	loader: () => import("./components/musicPlayer")
})

const MyDownloadMiddlePage = MyLoadable({
	loader: () => import("./components/myDownloadMiddlePage")
})

const NicknamePage = MyLoadable({
	loader: () => import("./components/nicknamePage")
})

const SetEmail = MyLoadable({
	loader: () => import("./components/updateUserInfo/setEmail")
})

const CheckEmail = MyLoadable({
	loader: () => import("./components/updateUserInfo/checkEmail")
})

const ForgetPassword = MyLoadable({
	loader: () => import("./components/forgetPassword")
})

const Register = MyLoadable({
	loader: () => import("./components/register")
})

const SearchFile = MyLoadable({
	loader: () => import("./components/searchFile")
})

const SearchMusic = MyLoadable({
	loader: () => import("./components/searchMusic")
})

const SearchOnlineMusic = MyLoadable({
	loader: () => import("./components/searchOnlineMusic")
})

const SearchAll = MyLoadable({
	loader: () => import("./components/searchAll")
})

const MusicController = MyLoadable({
	loader: () => import("./components/child/musicController")
})

import { initWebsocket } from "./logic/common" ;

class Routers extends Component {

    componentDidMount(){
		const self = this;
		$("#root").removeClass("loading-text").removeClass("animate-flicker")
		window.serverHost = window.config.debug ? (window.config.domain + ":" + window.config.port) :  window.config.domainUrl
		initWebsocket()
		const url = window.location.href;
		if(url.split("#/")[1]) window.location.href = url.split("#/")[0];

		if(localStorage.getItem("alwaysShowAdsPage") === "no"){
			$dispatch(updateAlwaysShowAdsPage(false))
			$dispatch(updateDirectShowSignPage(true))
			$dispatch(updateHideNavBar(false))
		}
		if(localStorage.getItem("usePosition") === "no"){
			$dispatch(updateAllowGetPosition(false))
		}
		if(localStorage.getItem("allowOthersGetPosition") === "no"){
			$dispatch(updateAllowOthersGetPosition(false))
		}
		if(localStorage.getItem("pauseWhenOver") === "no"){
			$dispatch(updatePauseWhenOver(false))
			$dispatch(updatePlayByOrder(false))
			$dispatch(updatePlayByRandom(false))
			$dispatch(updateMusicMenuBadge([
				{
					index: 2,
					text: '',
				}, {
					index: 3,
					text: '✔️',
				}, {
					index: 4,
					text: '',
				}, {
					index: 5,
					text: '',
				}
			]))
		} else if(localStorage.getItem("playByOrder") === "yes"){
			$dispatch(updatePauseWhenOver(true))
			$dispatch(updatePlayByOrder(true))
			$dispatch(updatePlayByRandom(false))
			$dispatch(updateMusicMenuBadge([
				{
					index: 2,
					text: '',
				}, {
					index: 3,
					text: '',
				}, {
					index: 4,
					text: '✔️',
				}, {
					index: 5,
					text: '',
				}
			]))
		} else if(localStorage.getItem("playByRandom") === "yes"){
			$dispatch(updatePauseWhenOver(true))
			$dispatch(updatePlayByOrder(false))
			$dispatch(updatePlayByRandom(true))
			$dispatch(updateMusicMenuBadge([
				{
					index: 2,
					text: '',
				}, {
					index: 3,
					text: '',
				}, {
					index: 4,
					text: '',
				}, {
					index: 5,
					text: '✔️',
				}
			]))
		}
		document.addEventListener('deviceready',function(){
			window.permissions = cordova.plugins.permissions;
			window.open = cordova.InAppBrowser.open;
			cordova.plugins.notification.local.on('click', self.installPackage, self);
			window.HeadsetDetection && window.HeadsetDetection.registerRemoteEvents(function(status) {
				logger.info("HeadsetDetection status", status)
				switch (status) {
					case 'headsetAdded':
						logger.info('Headset was added');
						break;
					case 'headsetRemoved':
						logger.info('Headset was removed');
						const { soundPlaying, soundInstance, soundInstanceId } = $getState().fileServer
						if(soundPlaying){
							soundInstance.pause(soundInstanceId);
							$dispatch(updateSoundPlaying(false))
						}
						break;
				};
			});

			cordova.getAppVersion.getVersionNumber().then(function (version){
				window.$dispatch(updateAppVersion(version));
			});
		},false);

		logger.info("Router.js window.location.href", window.location.href)
	}

	componentWillUnmount(){
		logger.info("router.js componentWillUnmount will exit app, window.ws && ws.readyState", window.ws && ws.readyState)
		if(window.isCordova) cordova.plugins.notification.local.clearAll()
		if(window.ws && ws.readyState ===1){
			window.ws.close(1000)
		}
	}

	installPackage = () => {
		const { hasDownloadedPackage, appSize } = $getState().common;
		logger.info("installPackage hasDownloadedPackage", hasDownloadedPackage)
		if(!hasDownloadedPackage) {
			logger.info("downloading, can't install")
			cordova.plugins.notification.local.schedule({
				title: '正在更新',
				text: `安装包大小:${appSize}，请稍后`,
			});
			return;
		}
		logger.info("cordova.plugins.fileOpener2.open  installPackage")
		cordova.plugins.fileOpener2.open(
			'cdvfile://localhost/sdcard/Android/data/com.szhou.mixingfeng/sign_release.apk', // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Downloads/starwars.pdf
			'application/vnd.android.package-archive',
			{
				error : function(e) {
					logger.error('installPackage  Error status: ' + e.status + ' - Error message: ' + e.message);
				},
				success : function () {
					logger.info('installPackage  file opened successfully');
				}
			}
		);
	}

    render(){
    	return (
    		<Router>
    			<div className="container">
					<div className="main-content">
    					<Switch>
                    	    <Route path="/register" component={Register} />
    					    <Route path="/forget_password" component={ForgetPassword} />
                    	    <Route path="/login" component={Login} />
    					    <Route path="/search_user_history" component={SearchUserHistory} />
                    	    <Route path="/main" component={MainFrame} />
                    	    <Route path="/about" component={About} />
                    	    <Route path="/feedback" component={Feedback} />
                    	    <Route path="/set_nickname" component={SetNickname} />
                    	    <Route path="/set_mobile" component={SetMobile} />
                    	    <Route path="/set_signature" component={SetSignature} />
                    	    <Route path="/user_profile" component={UserProfile} />
                    	    <Route path="/system_setup" component={SystemSetup} />
                    	    <Route path="/licence" component={Licence} />
                    	    <Route path="/service_list" component={ServiceList} />
                    	    <Route path="/user_agreement" component={UserAgreement} />
                    	    <Route path="/privacy" component={Privacy} />
                    	    <Route path="/package_iframe" component={PackageIframe} />
                    	    <Route path="/reset_password_sys" component={ResetPasswordSys} />
							<Route path="/look_head_pic" component={LookHeadPic} />
							<Route path="/search_column" component={SearchColumn} />
							<Route path="/search_position" component={SearchPosition} />
							<Route path="/show_online_persons" component={ShowOnlinePersons} />
							<Route path="/my_sites" component={MySites} />
							<Route path="/type_shell" component={TypeShell} />
							<Route path="/login_record" component={LoginRecord} />
							<Route path="/notification" component={Notification} />
							<Route path="/saved_songs" component={SavedSongs} />
							<Route path="/my_finished_files" component={MyFinishedFiles} />
							<Route path="/my_finished_musics" component={MyFinishedMusics} />
							<Route path="/my_games" component={MyGames} />
							<Route path="/my_download_middle_page" component={MyDownloadMiddlePage} />
							<Route path="/nickname_page" component={NicknamePage} />
							<Route path="/set_email" component={SetEmail} />
							<Route path="/check_email" component={CheckEmail} />
							<Route path="/search_file" component={SearchFile} />
							<Route path="/search_music" component={SearchMusic} />
							<Route path="/search_online_music" component={SearchOnlineMusic} />
							<Route path="/search_all" component={SearchAll} />
                    	    <Route path="/" component={Entry} />
    					</Switch>
					</div>
					<div className="window-music-container">
						<MusicController />
					</div>
    			</div>
            </Router>
        )
    }
}


const mapStateToProps = state => {
    return {

    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Routers);
