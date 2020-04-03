import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { NoticeBar } from "antd-mobile"
import {
	confirm,
	getAndReadFile,
	writeFile,
	onBackKeyDown,
	alertDialog,
	networkErr,
	debounce,
	saveFileToLocal,
	exitApp,
	openBrowserLink
} from "../services/utils";
import { HTTP_URL } from "../constants/httpRoute";
import MyProgress from "./child/progress";
import { updateToken, updateIsFromLoginPage } from "../ducks/login";
import { retrieveLastLoginTime, signInApp, signed, downloadAdPic } from "../logic/sign";
import {
	retrieveOthers,
	getUserPosition,
	getLocation,
	previewNew,
	autoLogin,
	reconnectAndSend,
	checkOnlinePersons,
	logActivity,
	removePrefixFromFileOrigin,
	checkDownloadedOrNot
} from "../logic/common";
import {
	updateDirectShowSignPage,
	updateFromResume,
	updateJustOpenApp,
	updateShowUpdateConfirm,
	updateNeedRetryRequestWhenLaunch,
	updateShowDownloadAppTip
} from "../ducks/sign";
import StatusBar from "./child/statusBar";
import UpdateBody from "./child/updateBody";
import { updateSetSystemSetupDot } from "../ducks/myInfo";
import {
	updateFileList,
	updateMusicList,
	updateDownloadedMusicList,
	updateDownloadingMusicItems,
	updateRecentMusicList,
	updateDownloadedFileList,
	updateDownloadingFileList
} from "../ducks/fileServer";
import {
	updateIsFromSignPage,
	updateSavedCurrentRoute,
	updateHideNavBar,
	updateIsFromSystemSetup,
	updateAdPicSrc,
	updateLoadedInWifi
} from "../ducks/common"
import { readAllDataFromIndexDB } from "../services/indexDB"
import { readAllMusicDataFromIndexDB } from "../services/indexDBMusic"
import { readAllRecentMusicDataFromIndexDB } from "../services/indexDBRecentMusic"
import { CONSTANT } from "../constants/enumeration"

class Sign extends Component {

	constructor(props) {
		super(props);
		const { adsTime, adNumber, isFromSignPage, fromResume, adPicSrc, loadedInWifi } = this.props;
		if(isFromSignPage) $dispatch(updateIsFromSignPage(false))
		// 如果在localStorage里有相应的值说明广告下载好了
		const adsName = localStorage.getItem("adsName")
		const isWiFiNetwork = localStorage.getItem("isWiFiNetwork")
		let loadedInWifiState = loadedInWifi, adPicSrcState = adPicSrc
		// 只有从fromResume过来的才会走下面的逻辑
		if(adsName && isWiFiNetwork && fromResume){
			if(fromResume) $dispatch(updateFromResume(false))
			localStorage.removeItem("adsName")
			localStorage.removeItem("isWiFiNetwork")
			// 重新计时下载广告
			if(!window.downloadAdPicTimer){
				downloadAdPic()
			}
			if(isWiFiNetwork === "yes"){
				loadedInWifiState = "已wifi预加载"
			} else {
				loadedInWifiState = ""
			}
			adPicSrcState = `/storage/emulated/0/miXingFeng/adPics/${adsName}`
			$dispatch(updateAdPicSrc(adPicSrcState))
			$dispatch(updateLoadedInWifi(loadedInWifiState))
		}
		this.state = {
			skipTime: adsTime || 4,
			progress: 0,
			appSize: 100,
			appTotalSize: 100,
			showProgress: false,
			fileTransfer: {},
			checkingPackage: false,
			loadedInWifi: loadedInWifiState,
			adPicSrc: adPicSrcState || `./ads/ad${adNumber}.png`,
			greetingsWord: "",
			hour: "",
			minute: "",
			colon: ":"
		}
	}

	async componentDidMount() {
		try {
			const { skipTime } = this.state
			const {
				directShowSignPage,
				alwaysShowAdsPage,
				token,
				isFromLoginPage,
				isSignedUp,
				justOpenApp,
				fromResume,
				isFromSystemSetup,
				needRetryRequestWhenLaunch
			} = this.props;
			checkOnlinePersons()
			if(isFromSystemSetup) return
			if(alwaysShowAdsPage){
				logger.info("directShowSignPage", directShowSignPage)
				const adsName = localStorage.getItem("adsName")
				const isWiFiNetwork = localStorage.getItem("isWiFiNetwork")
				logger.info("adsName", adsName, 'isWiFiNetwork', isWiFiNetwork, 'fromResume', fromResume)
				//  启动app的时候先计时下载广告；翻页过来的时候如果已经下载好但是还没使用的情况下，不要再次下载广告
				if(!window.downloadAdPicTimer && !adsName && !isWiFiNetwork) downloadAdPic()
				if(!directShowSignPage){
					if(!window.localStorage.getItem('everLaunched')){
						window.localStorage.setItem('everLaunched', 'true');
						window.StatusBar && window.StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor)
						Loadable.preloadAll()
						$dispatch(updateDirectShowSignPage(true))
						$dispatch(updateHideNavBar(false))
						setTimeout(() => {
							window.navigator.splashscreen && window.navigator.splashscreen.hide();
						}, 800)
					} else {
						Loadable.preloadAll()
						try {
							window.navigator.splashscreen && window.navigator.splashscreen.hide();
							this.leftRectRef.style.animation = `left ${skipTime - 0.9}s linear`
							this.rightRectRef.style.animation = `right ${skipTime - 0.9}s linear`
							this.leftRectRef.style['-webkit-animation'] = `left ${skipTime - 0.9}s linear`
							this.rightRectRef.style['-webkit-animation'] = `right ${skipTime - 0.9}s linear`
							logger.info("start ad page this.getAdsConfig skipTime", skipTime)
							this.getAdsConfig();
						} catch (err) {
							window.logger.error("splashscreen err", err.stack || err.toString())
						}
					}
				}
			} else {
				logger.info("componentDidMount alwaysShowAdsPage", alwaysShowAdsPage);
				Loadable.preloadAll()
				if(window.isCordova){
					setTimeout(() => {
						window.StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor)
						document.addEventListener("deviceready", this.checkUpdateSign, false);  //check update
						window.navigator.splashscreen.hide();
					}, 800)
				}
			}
			this.getGreeting();  // go to this page from other page
			document.addEventListener("deviceready", this.listenBackKeyDown);
			// if no network when launch app, username will be empty string
			if(token && !isFromLoginPage && !needRetryRequestWhenLaunch){
				if(isSignedUp){
					signed();
				}
			} else {  //  从别的页面切到这个页面不会进入这个else的逻辑
				if(justOpenApp || needRetryRequestWhenLaunch){
					if(new Date().getHours() < 6){
						setTimeout(() => alert("夜深了,请注意休息"), (skipTime-1) * 1000);
					}
					$dispatch(updateJustOpenApp(false))
					// get file list
					axios.get(HTTP_URL.getList.format({fileType: 'file'}))
						.then(async function(response) {
							const array = response.data.result.response || [];
							let downloadedFileArr = [], downloadingFileArr = []
							const indexDBData = await readAllDataFromIndexDB()
							indexDBData.forEach((item1) => {
								if(!item1.status || item1.status === "downloaded"){
									downloadedFileArr.push(item1)
									//  处理已下载文件的逻辑,这里只给了一个已下载的标识，在进入文件已下载的页面时读取indexDB显示已下载的文件
									array.forEach((item2) => {
										if(removePrefixFromFileOrigin(item1.filenameOrigin) === removePrefixFromFileOrigin(item2.filenameOrigin)){
											item2.downloaded = true
										}
									})
								} else if(item1.status === "downloading"){
									downloadingFileArr.push(item1)
								}
							})
							array.forEach((item) => {
								item.filePath = window.serverHost + item.filePath
							})
							$dispatch(updateFileList(array));
							downloadedFileArr = _.orderBy(downloadedFileArr, ['date'], ['asc'])
							downloadingFileArr = _.orderBy(downloadingFileArr, ['date'], ['asc'])
							$dispatch(updateDownloadedFileList(downloadedFileArr))
							$dispatch(updateDownloadingFileList(downloadingFileArr))
						})
						.catch(err => {
							return networkErr(err, `sign getList fileType file`);
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
							$dispatch(updateNeedRetryRequestWhenLaunch(false))
						})
						.catch(err => {
							return networkErr(err, `sign getList fileType music`);
						})

					//加载最近播放列表
					readAllRecentMusicDataFromIndexDB()
						.then((result) => {
							result.forEach(item => delete item.getNewestPath)
							result = _.orderBy(result, ['date'], ['desc'])
							$dispatch(updateRecentMusicList(result))
						})

					const token = window.localStorage.getItem('tk');
					if (token) {
						$dispatch(updateToken(token));
						await autoLogin(token);
						retrieveOthers();  //retrieve others status
						retrieveLastLoginTime();  //get last sign time
					}
				}
				logger.info("sign isFromLoginPage", isFromLoginPage)
				if(isFromLoginPage){
					retrieveOthers();
					retrieveLastLoginTime();
					window.$dispatch(updateIsFromLoginPage(false));
				}
			}
			this.dealWithLocation();
			setTimeout(() => {
				reconnectAndSend("homeSocket check")
			}, 3500)
			if(window.homeSocketInterval) clearInterval(homeSocketInterval)
			window.homeSocketInterval = setInterval(() => {
				reconnectAndSend("homeSocketInterval")
			}, 30000)
		} catch (err) {
			logger.error("sign componentDidMount", err.stack || err.toString())
		}
	}

	componentWillUnmount(){
		if(this.clockIntervalTimer) clearInterval(this.clockIntervalTimer)
		if(this.checkUpdateSignTimer) clearTimeout(this.checkUpdateSignTimer)
		document.removeEventListener("deviceready", this.listenBackKeyDown, false);
		document.removeEventListener("backbutton", this.onBackKeyDownSign, false);
		document.removeEventListener("deviceready", this.checkUpdateSign, false);
		if(this.props.isFromSystemSetup) $dispatch(updateIsFromSystemSetup(false))
	}

	getGreeting = () => {
		//update clock time
		this.clockFunc()
		this.clockIntervalTimer = setInterval(() => {
			this.clockFunc()
		}, 1000)
	}

	clockFunc = () => {
		let minute = new Date().getMinutes(), hour = new Date().getHours();
		if (minute < 10) minute = "0" + minute;
		if (hour < 10) hour = "0" + hour;
		const { colon } = this.state
		let nextColon = "", greetingsWord = ""
		if(colon === "") nextColon = ":"
		if (hour < 6) {
			greetingsWord = "凌晨好！"
		} else if (hour < 8) {
			greetingsWord = "早上好！"
		} else if (hour < 11) {
			greetingsWord = "上午好！"
		} else if (hour < 14) {
			greetingsWord = "中午好！"
		} else if (hour < 17) {
			greetingsWord = "下午好！"
		} else if (hour < 19) {
			greetingsWord = "傍晚好！"
		} else if (hour < 24) {
			greetingsWord = "晚上好！"
		}
		this.setState({
			greetingsWord,
			hour,
			minute,
			colon: nextColon
		})
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
		if(window.isCordova){
			setTimeout(() => {
				window.StatusBar.backgroundColorByHexString(CONSTANT.statusBarColor)
			}, 1)
		}
		$dispatch(updateHideNavBar(false))
		// 刚安装app时打开不要检查更新
		if(!this.checkUpdateFlag){
			this.checkUpdateFlag = true
			document.addEventListener("deviceready", this.checkUpdateSign, false);  //check update
		}
		if(savedCurrentRoute){
			$dispatch(updateSavedCurrentRoute(""))
			window.goRoute(this, savedCurrentRoute);
		}
	}

	prepareSkip = () => {
		this.skip()
	}

	listenBackKeyDown = () => {
		logger.info("this.props.isFromLoginPage", this.props.isFromLoginPage)
		document.addEventListener("backbutton", this.onBackKeyDownSign, false); //back button logic
	}

	dealWithLocation = () => {
		if(window.isCordova){
			this.props.allowGetPosition && document.addEventListener("deviceready", getUserPosition, false)
		} else {
			this.props.allowGetPosition && getLocation(this)
		}
	}

    onBackKeyDownSign = () => {
        const self = this;
        const { showUpdateConfirm } = this.props;
        if(!showUpdateConfirm){
            onBackKeyDown();
        } else {
            this.setState({
                showProgress: false
			});
			confirm("提示","确定要取消下载吗","确定", function(){
				self.setState({
					showProgress: false
				}, () => {
					self.state.fileTransfer.abort && self.state.fileTransfer.abort();
					if(self.forceUpgrade){
						exitApp()
					}
				});
			},() => {
				self.setState({
					showProgress: true
				});
				$dispatch(updateShowUpdateConfirm(true)) //点击取消后继续显示下载进度条
			});
			new Promise(res => res())
				.then(() => {
					$dispatch(updateShowUpdateConfirm(false))
				})

        }
    }

	checkUpdateSign = async (outOfDate) => {
		const self = this;
		const date = Date.now();
		const content = await getAndReadFile("last_close_update.txt", true)
		return axios.get(HTTP_URL.checkUpdate.format({appVersion: this.props.appVersion || false, notCheckOutOfDateVersion: (outOfDate===true ? "yes" : "no")}))
			.then(async response => {
				if(!response.data) return
				const result = response.data;
				if(result.result && result.result.outOfDate){
					return confirm(`提示`, "当前app版本过低，必须升级才能继续使用", "立即更新", function(){
						const date = Date.now() - (1000 * 3600 * 24 * 3)
						self.writeFileFunc(date)
						self.forceUpgrade = true
						self.tooOldVersion = true
						return self.checkUpdateSign(true)
					}, exitApp)
				}
				const remoteAppVersion = result.version,
					appSize = result.appSize,
					MD5 = result.MD5,
					newAppVersionContent = result.content,
					forceUpgradeText =  result.forceUpgradeText || "因系统接口重大升级,必须更新app才能使用",
					alertNotice = result.alertNotice,
					confirmNotice = result.confirmNotice,
					{ appVersion } = this.props;
				if(!this.forceUpgrade) this.forceUpgrade = result.forceUpgrade,
				window.logger.info(`remote appVersion, ${remoteAppVersion}`);
				window.logger.info(`local appVersion, ${appVersion}`);
				if(alertNotice && alertNotice.enable){
					await new Promise((res => {
						alertDialog("公告", alertNotice.content, "我知道了", res)
					}))
				} else if(confirmNotice && confirmNotice.enable){
					return confirm(`提示`, confirmNotice.content, confirmNotice.confirmButton, function(){
						openBrowserLink(confirmNotice.link)
					})
				}
				if(result.disableUpdate) return logger.info('disableUpdate')
				if((remoteAppVersion > appVersion) || this.forceUpgrade){
					logger.info("发现新版本 remoteAppVersion", remoteAppVersion, "appVersion", appVersion);
					content && logger.info("(date - content.closeUpdateDate) / (1000 * 3600 * 24))", (date - content.closeUpdateDate) / (1000 * 36 * 24))
					window.$dispatch(updateSetSystemSetupDot(true));
					if((this.forceUpgrade || !content || ((date - content.closeUpdateDate) / (1000 * 3600 * 24)) >  2) && window.getRoute() === "/main/sign"){
						if(this.forceUpgrade && !this.tooOldVersion){
							// 告诉用户为什么这次要强制升级
							alertDialog("提示", forceUpgradeText, "知道了", () => {
								confirm(`发现新版本`, <UpdateBody list={newAppVersionContent} remoteAppVersion={remoteAppVersion} appSize={appSize}/>, "立即下载", function(){
									self.checkUpdate(HTTP_URL.appRelease ,"miXingFeng.apk", MD5);
								}, exitApp)
							})
						} else {
							//两天内不提醒
							confirm(`发现新版本`, <UpdateBody list={newAppVersionContent} remoteAppVersion={remoteAppVersion} appSize={appSize}/>, "立即下载", function(){
								self.checkUpdate(HTTP_URL.appRelease ,"miXingFeng.apk", MD5);
							}, () => {
								if(self.forceUpgrade){
									exitApp()
								}
							})
						}
						const date = Date.now()
						this.writeFileFunc(date)
					}
				} else {
					window.logger.info("已是最新版本")
				}
			})
			.catch(err => {
				logger.error("checkUpdateSign err", err)
			})
	}

	writeFileFunc = (date) => {
		let data = Object.assign({}, {"closeUpdateDate": date});
		data = JSON.stringify(data);
		let b = new window.Base64();
		data = b.encode(data);
		writeFile(data, 'last_close_update.txt', false);
	}

    signIn = () => {
		signInApp(this);
	}

	checkUpdate = (fileUrl, appName, MD5) => {
		checkDownloadedOrNot(fileUrl, appName, MD5, this.downloadAppFunc, this.preview, { exit: exitApp, forceUpgrade: this.forceUpgrade });
	}

	downloadAppFunc = (fileUrl, appName, MD5) => {
		const self = this;
		logActivity({
			msg: "start to upgrade app in sign page"
		})
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
							$dispatch(updateShowUpdateConfirm(true))
							self.setState({
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
								const debounceFunc =  debounce(() => {
									self.setState({
										progress: progressPercent,
										appSize: e.loaded,
										appTotalSize: e.total,
										fileTransfer: fileTransfer
									})
								}, 200)
								debounceFunc()
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
														checkingPackage: false
													});
													$dispatch(updateShowUpdateConfirm(false))
													confirm("提示","下载完成","立即安装", function(){
														entry.file(data => {
															logActivity({
																msg: "start to install app in sign page"
															})
															res(self.preview(fileEntry, data.type));
															// 此处data.type可以直接得到文件的MIME-TYPE类型
														});
													}, () => {
														if(self.forceUpgrade){
															exitApp()
														}
													})
												} else{
													logger.error("sign page MD5", MD5)
													self.setState({
														showProgress: false,
														checkingPackage: false
													});
													$dispatch(updateShowUpdateConfirm(false))
													alertDialog("提示", "安装包已损坏，请重新安装")
												}
											}
											function fail(error){
												logger.error("sign page Error-Message: " + error);
												self.setState({
													showProgress: false,
													checkingPackage: false
												});
												$dispatch(updateShowUpdateConfirm(false))
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
		if(this.forceUpgrade) setTimeout(exitApp, 1000)
		previewNew(fileEntry, mineType)
	}

	getOnlinePersons = () => {
		if(!this.props.token) return window.goRoute(this, "/login")
		window.goRoute(this, "/show_online_persons")
	}

	gotoUserProfile = () => {
		$dispatch(updateIsFromSignPage(true))
		window.goRoute(this, "/user_profile")
	}

	downloadApp = () => {
		if(this.cancelTips) return
		$dispatch(updateShowDownloadAppTip(false))
		saveFileToLocal("browser begin to download app", 'http://192.144.213.72:2000/Images/app-release.apk')
	}

	cancelShowTip = (e) => {
		this.cancelTips = true
		$dispatch(updateShowDownloadAppTip(false))
	}

	render (){
        const { showProgress, skipTime, progress, appSize, appTotalSize, checkingPackage, loadedInWifi, adPicSrc, greetingsWord, hour, minute, colon } = this.state;
		const {
			currentLocation,
			username,
			token,
			alreadySignUpPersons,
			notSignUpPersons=[],
			lastSignUpTime,
			onlinePersonsNum,
			signedFlag,
			setNickname,
			directShowSignPage,
			isFromSystemSetup,
			showDownloadAppTip,
			setMobile=""
		} = this.props;
		return (
			<Fragment>
				{
					directShowSignPage
					?	<div className="sign-main">
							<StatusBar />
        					<div className="header">
								<span className="greetings">{greetingsWord}</span>
								<span className="user" onClick={this.gotoUserProfile}>{token ? setNickname ? setNickname : username ? username : setMobile: ""}</span>
							</div>
							<div className="body">
        						<div className="sign-area">
									{
										(!window.isCordova && showDownloadAppTip)
										?	<div className="show-download-app-tips" onClick={this.downloadApp}>
												<NoticeBar mode="closable" onClick={(e) => this.cancelShowTip(e)}>
													app打开体验更佳
												</NoticeBar>
											</div>
										: null
									}

        							<div className={`sign ${!signedFlag && 'flick-animation'} ${signedFlag}`} onClick={this.signIn}>
										<div className="sign-text">{signedFlag ? "已签到" : "签到"}</div>
										<div id="now-time">
											<span className="hour">{hour}</span>
											<span className="middle">{colon}</span>
											<span className="minute">{minute}</span>
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
					: 	<div className="ads-container" ref={ref => this.adsContainerRef = ref}>
							<div className="top-ads" ref={ref => this.topAdsRef = ref}>
								<div className="tip-text">{loadedInWifi}</div>
								{
									isFromSystemSetup
									? <div className="skip-ads" onClick={this.prepareSkip}>跳过</div>
									: <div className="rect-box" onClick={this.prepareSkip}>
										<div className="rect left">
											<div className="circle" ref={ref => this.leftRectRef = ref}></div>
										</div>
										<div className="rect right">
											<div className="circle" ref={ref => this.rightRectRef = ref}></div>
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
		alwaysShowAdsPage: state.common.alwaysShowAdsPage,
		allowGetPosition: state.common.allowGetPosition,
		adNumber: state.sign.adNumber,
		fromResume: state.sign.fromResume,
		isFromSignPage: state.common.isFromSignPage,
		isFromSystemSetup: state.common.isFromSystemSetup,
		adPicSrc: state.common.adPicSrc,
		loadedInWifi: state.common.loadedInWifi,
		justOpenApp: state.sign.justOpenApp,
		showUpdateConfirm: state.sign.showUpdateConfirm,
		needRetryRequestWhenLaunch: state.sign.needRetryRequestWhenLaunch,
		showDownloadAppTip: state.sign.showDownloadAppTip,
		setMobile: state.myInfo.setMobile,
		appVersion: state.common.appVersion,
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Sign);

