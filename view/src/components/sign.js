import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { confirm, getAndReadFile, writeFile, onBackKeyDown, checkPreviousLogin, isEmptyFileFunc, alertDialog } from "../services/utils";
import { HTTP_URL } from "../constants/httpRoute";
import MyProgress from "./child/progress";
import { updateToken, updateIsFromLoginPage } from "../ducks/login";
import { retrieveLastLoginTime, signInApp, signed, downloadAdPic } from "../logic/sign";
import {
	retrieveOthers,
	getUserPosition,
	getLocation,
	previewNew,
	getGreeting,
	autoLogin,
	reconnectAndSend,
	requestPositionPermission,
	checkOnlinePersons
} from "../logic/common";
import { updateDirectShowSignPage, updateFromResume } from "../ducks/sign";
import StatusBar from "./child/statusBar";
import UpdateBody from "./child/updateBody";
import { CONSTANT } from "../constants/enumeration";
import { updateSetSystemSetupDot } from "../ducks/myInfo";
import { updateFileList, updateMusicList, updateDownloadedMusicList, updateDownloadingMusicItems  } from "../ducks/fileServer";
import { updateIsFromSignPage, updateSavedCurrentRoute, updateHideNavBar, updateIsFromSystemSetup, updateAdPicSrc } from "../ducks/common"
import { readAllDataFromIndexDB } from "../services/indexDB"
import { readAllMusicDataFromIndexDB } from "../services/indexDBMusic"

class Sign extends Component {

	constructor(props) {
		super(props);
		const { adsTime, adNumber, isFromSignPage, fromResume, adPicSrc } = this.props;
		if(isFromSignPage) $dispatch(updateIsFromSignPage(false))
		// 如果在localStorage里有相应的值说明广告下载好了
		const adsName = localStorage.getItem("adsName")
		const isWiFiNetwork = localStorage.getItem("isWiFiNetwork")
		let loadedInWifi = "", adPicSrcState = adPicSrc
		if(adsName && isWiFiNetwork && fromResume){
			if(fromResume) $dispatch(updateFromResume(false))
			localStorage.removeItem("adsName")
			localStorage.removeItem("isWiFiNetwork")
			// 重新计时下载广告
			if(!window.downloadAdPicTimer){
				downloadAdPic()
			}
			if(isWiFiNetwork === "yes"){
				loadedInWifi = "已wifi预加载"
			}
			adPicSrcState = `/storage/emulated/0/miXingFeng/adPics/${adsName}`
			$dispatch(updateAdPicSrc(adPicSrcState))
		}
		this.state = {
			skipTime: adsTime || 4,
			progress: 0,
			appSize: 100,
			appTotalSize: 100,
			showProgress: false,
			fileTransfer: {},
			showUpdateConfirm: false,
			checkingPackage: false,
			loadedInWifi,
			adPicSrc: adPicSrcState || `./ads/ad${adNumber}.png`
		}
	}

	async componentDidMount() {
		try {
			const { skipTime } = this.state
			const { directShowSignPage, alwaysShowAdsPage, username, isFromLoginPage, isSignedUp, setSystemSetupDot, fromResume, isFromSystemSetup } = this.props;
			checkOnlinePersons()
			if(isFromSystemSetup) return
			if(alwaysShowAdsPage){
				logger.info("directShowSignPage", directShowSignPage)

				const adsName = localStorage.getItem("adsName")
				const isWiFiNetwork = localStorage.getItem("isWiFiNetwork")
				logger.info("adsName", adsName, 'isWiFiNetwork', isWiFiNetwork, 'fromResume', fromResume)
				//  启动app的时候先计时下载广告；翻页过来的时候如果已经下载好但是还没使用的情况下，不要再次下载广告
				if(!window.downloadAdPicTimer && !adsName && !isWiFiNetwork){
					downloadAdPic()
				}

				if(!directShowSignPage){
					if(window.isCordova){
						if(!window.localStorage.getItem('everLaunched')){
							window.localStorage.setItem('everLaunched', 'true');
							Loadable.preloadAll()
							$dispatch(updateDirectShowSignPage(true))
							$dispatch(updateHideNavBar(false))
							await this.gettingPermissions();
							document.addEventListener("deviceready", this.backgroundColorByHexString);
						} else {
							$(".ads-container").hide()
							Loadable.preloadAll()
							try {
								window.navigator.splashscreen.hide();
								setTimeout(() => {
									$(".ads-container").fadeIn('fast');
									$('.rect-box .left .circle').css("-webkit-animation", `left ${skipTime - 0.9}s linear`)
									$('.rect-box .right .circle').css("-webkit-animation", `right ${skipTime - 0.9}s linear`)
									logger.info("start ad page this.getAdsConfig skipTime", skipTime)
									this.getAdsConfig();
								}, 10)
							} catch (err) {
								if(window.logger){
									window.logger.error("splashscreen err", err.stack || err.toString())
								} else {
									console.error("splashscreen err", err.stack || err.toString())
								}
							}
						}
					} else {
						$(".ads-container").hide()
						setTimeout(() => {
							$(".ads-container").fadeIn();
							$('.rect-box .left .circle').css("-webkit-animation", `left ${skipTime - 0.9}s linear`)
							$('.rect-box .right .circle').css("-webkit-animation", `right ${skipTime - 0.9}s linear`)
							this.getAdsConfig();
							$('.top-ads').css("width", "auto");
						}, 500)
						Loadable.preloadAll()
					}
				}
			} else {
				logger.info("componentDidMount alwaysShowAdsPage", alwaysShowAdsPage);
				Loadable.preloadAll()
				document.addEventListener("deviceready", this.backgroundColorByHexString);
				setTimeout(() => {
					if(window.isCordova){
						window.navigator.splashscreen.hide();
					}
				}, 500)
			}
			getGreeting();  // go to this page from other page
			document.addEventListener("deviceready", this.listenBackKeyDown);
			if(!setSystemSetupDot && !directShowSignPage){
				setTimeout(() => {
					document.addEventListener("deviceready", this.checkUpdateSign, false);  //check update
				}, 5000);
			}
			if(!window.logger) window.logger = console;
			// if no network when launch app, username will be empty string
			if(username && !isFromLoginPage){
				if(isSignedUp){
					signed();
				}
			} else {  //  从别的页面切到这个页面不会进入这个else的逻辑
				if(!isFromLoginPage){
					// get file list
					axios.get(HTTP_URL.getList.format({fileType: 'file'}))
						.then(async function(response) {
							const array = response.data.result.response;
							if (!array.length) return;
							const indexDBData = await readAllDataFromIndexDB()
							indexDBData.forEach((item1) => {
								//  处理已下载文件的逻辑,这里只给了一个已下载的标识，在进入文件已下载的页面时读取indexDB显示已下载的文件
								array.forEach((item2) => {
									if(item1.filenameOrigin === item2.filenameOrigin){
										item2.downloaded = true
									}
								})
							})
							array.forEach((item) => {
								item.filePath = window.serverHost + item.filePath
							})
							$dispatch(updateFileList(array));
						})

					axios.get(HTTP_URL.getList.format({fileType: 'music'}))
						.then(async function(response) {
							const array = response.data.result.response;
							array.forEach(item => {
								item.filePath = window.serverHost + item.filePath
							})
							if (!array.length) return;
							$dispatch(updateMusicList(array));
							let downloadedMusicArr = [], downloadingMusicArr = []
							const indexDBData = await readAllMusicDataFromIndexDB()
							indexDBData.forEach(item => {
								if(!item.status || item.status === "downloaded"){
									downloadedMusicArr.push(item)
								} else if(item.status === "downloading"){
									downloadingMusicArr.push(item)
								}
							})
							downloadedMusicArr = _.orderBy(downloadedMusicArr, ['date'], ['asc'])
							downloadingMusicArr = _.orderBy(downloadingMusicArr, ['date'], ['asc'])
							$dispatch(updateDownloadedMusicList(downloadedMusicArr))
							$dispatch(updateDownloadingMusicItems(downloadingMusicArr))
						})

					if (window.isCordova) {
						document.addEventListener("deviceready", this.checkLoginInfo);
						document.addEventListener("deviceready", this.getPositionPermission);
					} else {
						const token = window.localStorage.getItem('tk');
						$dispatch(updateToken(token));
						if (token) {
							await autoLogin(token);
						}
						retrieveOthers();  //retrieve others status
						retrieveLastLoginTime();  //get last sign time
					}
				} else {
					retrieveOthers();
					retrieveLastLoginTime();
					window.$dispatch(updateIsFromLoginPage(false));
				}
			}
			await this.dealWithOthersWhenDidMount();
			setTimeout(() => {
				reconnectAndSend("homeSocket check")
			}, 5000)
			if(window.homeSocketInterval) clearInterval(homeSocketInterval)
			window.homeSocketInterval = setInterval(() => {
				reconnectAndSend("homeSocketInterval")
			}, 30000)
		} catch (err) {
			logger.error("sign componentDidMount", err.stack || err.toString())
		}
	}

	componentDidUpdate(){
		// case that launch app
		getGreeting();
	}

	componentWillUnmount(){
		window.clockTimer = false;
		localStorage.setItem("leaveSignPage", "yes")
		clearInterval(window.clockIntervalTimer)
		document.removeEventListener("deviceready", this.listenBackKeyDown, false);
		document.removeEventListener("deviceready", this.backgroundColorByHexString, false);
		document.removeEventListener("backbutton", this.onBackKeyDownSign, false);
		document.removeEventListener("backbutton", this.checkUpdateSign, false);
		if(this.props.isFromSystemSetup) $dispatch(updateIsFromSystemSetup(false))
	}

	gettingPermissions = () => {
		return new Promise(res => {
			const permissions = cordova.plugins.permissions;
			const list = [
				permissions.ACCESS_COARSE_LOCATION,
				permissions.ACCESS_FINE_LOCATION,
				permissions.ACCESS_LOCATION_EXTRA_COMMANDS,
				permissions.WRITE_EXTERNAL_STORAGE
			];
			logger.info("getting  permissions")
			permissions.requestPermissions(list, success, error);
			function error() {
				logger.warn('permission is not turned on fail');
				window.navigator.splashscreen.hide();
				res()
			}
			function success(status) {
				if (!status.hasPermission) error();
				logger.info("getting  permissions success")
				window.navigator.splashscreen.hide()
				res()
			}
		})
	}

	getPositionPermission = () => {
		if(localStorage.getItem("usePosition") !== "no" && localStorage.getItem("leaveSignPage") === 'yes'){
			requestPositionPermission()
		}
	}

	overlaysWebView = (bool) => {
        StatusBar.overlaysWebView(bool);
	}

	getAdsConfig = () => {
		let { skipTime } = this.state
		logger.info("getAdsConfig skipTime", skipTime)
        this.setState({
			skipTime: --skipTime
		}, () => {
			setTimeout(() => {
				if(skipTime <= 1){
					logger.info("skipTime", skipTime)
					this.prepareSkip()
				} else {
					this.getAdsConfig()
				}
			},1000);
		})
	}

    skip = () => {
		const {savedCurrentRoute} = this.props
		this.setState({
			skipTime: 0
		})
		$dispatch(updateDirectShowSignPage(true))
		$dispatch(updateHideNavBar(false))
		if(window.isCordova) this.backgroundColorByHexString(1)
		if(savedCurrentRoute){
			$dispatch(updateSavedCurrentRoute(""))
			window.goRoute(this, savedCurrentRoute);
		}
	}

	prepareSkip = () => {
		this.skip()
	}

	listenBackKeyDown = () => {
		// from login page, need set StatusBar background
		logger.info("this.props.isFromLoginPage", this.props.isFromLoginPage)
		if(this.props.isFromLoginPage){
			this.backgroundColorByHexString();
		}
		document.addEventListener("backbutton", this.onBackKeyDownSign, false); //back button logic
	}

	backgroundColorByHexString = (t=200) => {
		setTimeout(() => {
			logger.info("backgroundColorByHexString #81AFED")
			window.StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor);
		}, t)
	}

	dealWithOthersWhenDidMount = async () => {
		window.SELF = this;
		if(window.isCordova){
			this.props.allowGetPosition && document.addEventListener("deviceready", getUserPosition, false)
		} else {
			this.props.allowGetPosition && getLocation(this)
		}
	}

	checkLoginInfo = async() => {
		await this.checkPreviousLoginApp();
		const { token, isFromLoginPage, logOutFlag } = this.props;
		if (token && !isFromLoginPage && !logOutFlag) {
			window.logger.info('start auto login');
			await autoLogin(token);
		}
		retrieveOthers();
		retrieveLastLoginTime();
	}

	checkPreviousLoginApp = async () => {
        const bool = await isEmptyFileFunc("sign.txt",true);
		return checkPreviousLogin("sign.txt",bool);
	}

    onBackKeyDownSign = () => {
        const self = this;
        const { showUpdateConfirm } = this.state;
        if(!showUpdateConfirm){
            onBackKeyDown();
        } else {
            this.setState({
                showProgress: false,
                showUpdateConfirm: false
            });
            confirm("提示","确定要取消下载吗","确定", function(){
                self.setState({
                    showProgress: false
                }, () => {
                    self.state.fileTransfer.abort && self.state.fileTransfer.abort();
                });
            },() => {
                self.setState({
                    showProgress: true,
                    showUpdateConfirm: true  //点击取消后继续显示下载进度条
                });
            });
        }
    }

	checkUpdateSign = async () => {
		let self = this;
		let date = Date.now();
		let content = await getAndReadFile("last_close_update.txt", true)
		return axios.get(HTTP_URL.checkUpdate)
			.then(response => {
				if(!response.data){
					return;
				}
				let result = response.data;
				let remoteAppVersion = result.version,
					appSize = result.appSize,
					MD5 = result.MD5,
					newAppVersionContent = result.content,
					{ appVersion } = window.$getState().common;
				window.logger.info(`remote appVersion, ${remoteAppVersion}`);
				window.logger.info(`local appVersion, ${appVersion}`);
				if(remoteAppVersion > appVersion){
					logger.info("发现新版本 remoteAppVersion", remoteAppVersion, "appVersion", appVersion);
					content && logger.info("(date - content.closeUpdateDate) / (1000 * 3600 * 24))", (date - content.closeUpdateDate) / (1000 * 36 * 24))
					window.$dispatch(updateSetSystemSetupDot(true));
					if(!content || ((date - content.closeUpdateDate) / (1000 * 3600 * 24)) >  2){
						//两天内不提醒
						confirm(`发现新版本`, <UpdateBody list={newAppVersionContent} remoteAppVersion={remoteAppVersion} appSize={appSize}/>, "立即下载", function(){
							self.checkUpdate(HTTP_URL.appRelease ,"sign_release.apk", MD5);
						})
						let date = Date.now()
						let data = Object.assign({}, {"closeUpdateDate": date});
        				data = JSON.stringify(data);
        				let b = new window.Base64();
        				data = b.encode(data);
						writeFile(data, 'last_close_update.txt', false);
					}
				} else {
					window.logger.info("已是最新版本")
				}
			})
			.catch(err => {
				logger.error("checkUpdateSign err", err)
			})
	}

    signIn = () => {
		signInApp(this);
	}

	checkUpdate = (fileUrl, appName, MD5) => {
		const self = this;
		return new Promise(function (res) {
			window.resolveLocalFileSystemURL(
				window.cordova.file.externalApplicationStorageDirectory,
				function (fs) {
					fs.getFile(
						appName, // 创建的文件名
						{
							create: true,
							exclusive: false
						},
						// create：创建新文件，exclusive:文件已存在时抛出异常
						function (fileEntry) {
							// 创建成功回调下载方法写入文件
							// 初始化进度条并显示
							// 此处采用mint-ui的Progress组件
							const fileTransfer = new FileTransfer();
							self.setState({
								showUpdateConfirm: true,
								showProgress: true
							});
							//监听下载进度
							let progressPercent = 0;
							fileTransfer.onprogress = function (e) {
								if (e.lengthComputable) {
									let progressLine = e.loaded / e.total;
									// 显示下载进度
									progressPercent = (progressLine * 100).toFixed(0);
								}
								self.setState({
									progress: progressPercent,
									appSize: e.loaded,
									appTotalSize: e.total,
									fileTransfer: fileTransfer
								})
							};
							// 使用fileTransfer.download开始下载
							fileTransfer.download(
								encodeURI(fileUrl), //uri网络下载路径
								fileEntry.nativeURL, //文件本地存储路径
								function (entry) {
									// 下载完成执行本地预览
									if (progressPercent > 1 || progressPercent === 1) {
										self.setState({
											checkingPackage: true
										})
										setTimeout(() => {
											function win(md5sum){
												logger.info("sign page app package MD5SUM: " + md5sum);
												if(md5sum === MD5){
													self.setState({
														showProgress: false,
														showUpdateConfirm: false,
														checkingPackage: false
													});
													confirm("提示","下载完成","立即安装", function(){
														entry.file(data => {
															res(self.preview(fileEntry, data.type));
															// 此处data.type可以直接得到文件的MIME-TYPE类型
														});
													})
												} else{
													logger.error("sign page MD5", MD5)
													self.setState({
														showProgress: false,
														showUpdateConfirm: false,
														checkingPackage: false
													});
													alertDialog("提示", "安装包已损坏，请重新安装")
												}
											}
											function fail(error){
												logger.error("sign page Error-Message: " + error);
												self.setState({
													showProgress: false,
													showUpdateConfirm: false,
													checkingPackage: false
												});
												alertDialog("提示", "安装包已损坏，请重新安装")
											}
											md5chksum.file(fileEntry, win, fail);
										}, 2000)
									}
								},
								function (error) {
									window.logger.error(`下载失败`, error);
								}
							);
						},
						function (error) {
							// 失败回调, 重新读取文件并打开
							fs.getFile(
								appName, {
									create: false
								},
								function (fileEntry) {
									// 成功读取文件后调用cordova-plugin-file-opener2插件打开文件
									res(self.preview(fileEntry));
								},
								function (error) {
									window.logger.error(`升级文件读取错误`, error);
								}
							);
						}
					);
				},
				function (error) {
					window.logger.error(`文件系统加载失败！`, error);
				}
			);
		})
	}

	preview = (fileEntry, mineType = 'application/vnd.android.package-archive') => {
		previewNew(fileEntry, mineType)
	}

	getOnlinePersons = () => {
		if(!this.props.token) return alert("请先登录")
		window.goRoute(this, "/show_online_persons")
	}

	gotoUserProfile = () => {
		$dispatch(updateIsFromSignPage(true))
		window.goRoute(this, "/user_profile")
	}

	render (){
        const { showProgress, skipTime, progress, appSize, appTotalSize, checkingPackage, loadedInWifi, adPicSrc } = this.state;
		let {
			currentLocation,
			username,
			token,
			alreadySignUpPersons,
			notSignUpPersons,
			lastSignUpTime,
			onlinePersonsNum,
			signedFlag,
			setNickname,
			directShowSignPage,
			isFromSystemSetup
		} = this.props;
		alreadySignUpPersons = alreadySignUpPersons ? alreadySignUpPersons : [];
		notSignUpPersons = notSignUpPersons ? notSignUpPersons : [];
		return (
			<Fragment>
				{
					directShowSignPage
					?	<div className="sign-main">
							<StatusBar />
        					<div className="header">
								<span className="greetings"></span>
								<span className="user" onClick={this.gotoUserProfile}>{token ? setNickname ? setNickname : username : ""}</span>
							</div>
							<div className="body">
        						<div className="sign-area">
        							<div className={`sign ${!signedFlag && 'flick-animation'} ${signedFlag}`} onClick={this.signIn}>
										<div className="sign-text">{signedFlag ? "已签到" : "签到"}</div>
										<div id="now-time">
											<span className="hour"></span>
											<span className="middle">:</span>
											<span className="minute"></span>
										</div>
									</div>
									{
										currentLocation
										? 	<div id="position-location" style={{"marginTop":"20px"}}>您当前的位置:
												{
													typeof(currentLocation) === 'object'
													? currentLocation.formatted_address
													: currentLocation
												}
											</div>
										: 	""
									}
        							<div className="last-sign-time">上一次签到时间：<span className="last-sign">{lastSignUpTime}</span></div>
									<div className="online-persons" onClick={this.getOnlinePersons}>
										<div className="text">当前</div>
										<div className="persons">{onlinePersonsNum}</div>
										<div className="text">人在线</div>
									</div>
        						</div>
        						<div className="count-area">
        							<div className="signed"><span className="signed-text">已签到:</span>
											<p className="signed-persons">
												{alreadySignUpPersons.map((item, index) => <span key={item.username} className={item.origin || "h5"}>
													{item.username + (index === alreadySignUpPersons.length-1 ? "" : `, `)}
												</span>)}
											</p>
        						  	</div>
        						  	<div className="not-signed"><span className="not-signed-text">未签到:</span>
											<p className="not-signed-persons">
												{notSignUpPersons.map((item, index) => <span key={item.username} className={item.origin || 'h5'}>
													{item.username + (index === notSignUpPersons.length-1 ? "" : `, `)}
												</span>)}
											</p>
        						  	</div>
        						</div>
        					</div>
							{
								showProgress
								? 	<MyProgress
										percent={progress}
										appSize={appSize}
										appTotalSize={appTotalSize}
										checkingPackage={checkingPackage}
									/>
								: 	""
							}
						</div>
					: 	<div className="ads-container">
							<div className="top-ads">
								<div className="tip-text">{loadedInWifi}</div>
								{
									isFromSystemSetup
									? <div className="skip-ads" onClick={this.prepareSkip}>跳过</div>
									: <div className="rect-box" onClick={this.prepareSkip}>
										<div className="rect left">
											<div className="circle"></div>
										</div>
										<div className="rect right">
											<div className="circle"></div>
										</div>
										<div className="skip-text">跳过 {skipTime}</div>
									</div>
								}
								<img src={adPicSrc} />
								<div className='ads-text'>广告</div>
							</div>
							<div className="bottom-info">
								<div className="bottom-content">
										<img className="app-logo" src="logo.png" />
										<div className="app-text">
											<div className="app-name">觅星峰</div>
											<div className="app-description">堪舆倒斗觅星峰</div>
										</div>
								</div>
							</div>
						</div>
				}
			</Fragment>
		)
	}
}

const mapStateToProps = state => {
	return {
		adsTime: state.common.adsTime,
		currentLocation: state.common.currentLocation,
		username: state.login.username,
		token: state.login.token,
		alreadySignUpPersons: state.sign.alreadySignUpPersons,
		notSignUpPersons: state.sign.notSignUpPersons,
		lastSignUpTime: state.sign.lastSignUpTime,
		onlinePersonsNum: state.sign.onlinePersonsNum,
		signedFlag: state.sign.signedFlag,
		setNickname: state.myInfo.setNickname,
		directShowSignPage: state.sign.directShowSignPage,
		savedCurrentRoute: state.common.savedCurrentRoute,
		isFromLoginPage: state.login.isFromLoginPage,
		isSignedUp: state.sign.isSignedUp,
		logOutFlag: state.login.logOutFlag,
		setSystemSetupDot: state.myInfo.setSystemSetupDot,
		alwaysShowAdsPage: state.common.alwaysShowAdsPage,
		allowGetPosition: state.common.allowGetPosition,
		adNumber: state.sign.adNumber,
		fromResume: state.sign.fromResume,
		isFromSignPage: state.common.isFromSignPage,
		isFromSystemSetup: state.common.isFromSystemSetup,
		adPicSrc: state.common.adPicSrc
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Sign);

