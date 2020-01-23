import React from 'react';
import { connect } from "react-redux";
import { Toast } from 'antd-mobile';
import MyInfoMiddlePageComponent from "./child/myInfoMiddlePageComponent";
import { networkErr } from "../services/utils";
import UpdateBody from "./child/updateBody";
import { updateSetSystemSetupDot } from "../ducks/myInfo";
import { CON } from "../constants/enumeration";
import { HTTP_URL } from "../constants/httpRoute";
import { confirm, alertDialog } from "../services/utils";
import { updateHasDownloadedPackage, updateAppUpdating, updateAppSize } from "../ducks/common"
import { previewNew } from "../logic/common/index";

const itemColumns = [
	{
		displayName: "用户协议",
		routeName: "/user_agreement"
	},
	{
		displayName: "服务条款",
		routeName: "/service_list"
	},
	{
		displayName: "隐私条款",
		routeName: "/privacy"
	},
	{
		displayName: "开源声明",
		routeName: "/licence"
	},
	{
		displayName: "我的站点",
		routeName: "/my_sites"
	}
]

if(window.isCordova){
	itemColumns.push({
		displayName: "检查更新"
	})
}

class About extends React.Component {

	checkUpdateFunc = () => {
        const self = this;
		window.logger.info("检查版本更新");
		const { appUpdating, appVersion } = this.props;
		if(appUpdating) return alert("请勿重复下载")
		$dispatch(updateSetSystemSetupDot(false))
		Toast.loading('正在检查更新', CON.toastLoadingTime, () => {});
        axios.get(HTTP_URL.checkUpdate)
            .then(response => {
                window.logger.info(`response`, response.data)
                if(!response.data){
					Toast.hide();
                    return;
                }
                const remoteAppVersion = response.data.version,
					appSize = response.data.appSize,
					MD5 = response.data.MD5,
                    newAppVersionContent = response.data.content
                window.logger.info(`remote appVersion, ${remoteAppVersion}`);
				window.logger.info(`local appVersion, ${appVersion}`);
				if(remoteAppVersion > appVersion){
					window.logger.info("发现新版本");
					Toast.hide();
					$dispatch(updateAppSize(appSize))
					confirm(`发现新版本`, <UpdateBody list={newAppVersionContent} remoteAppVersion={remoteAppVersion} appSize={appSize}/>, "立即下载", function(){
						self.checkUpdate(HTTP_URL.appRelease ,"sign_release.apk", MD5);
					})
				} else {
					window.logger.info("已是最新版本");
					Toast.success('已是最新版本', CON.toastTime);
				}
            })
            .catch(err => {
                networkErr(err);
            })
	}

	checkUpdate = (fileUrl, appName, MD5) => {
		const self = this;
		const { appSize } = this.props;
		return new Promise((resolve, reject) => {
			cordova.plugins.notification.local.hasPermission(function (granted) {
				logger.info("checkUpdate hasPermission granted", granted)
				if(!granted){
					cordova.plugins.notification.local.requestPermission(function (granted) {
						logger.info("checkUpdate requestPermission granted", granted)
						if(granted){
							resolve()
						} else {
							reject(granted)
						}
					});
				} else {
					resolve()
				}
			});
		})
		.then(() => {
			cordova.plugins.notification.local.setDefaults({
				id: Math.random(),
				foreground: true,
				sound: false,
				wakeup: true,
				progressBar: false,
				sticky: true,
				clock: true,
				silent: false
			});
			return new Promise(function (res) {
				window.resolveLocalFileSystemURL(
					window.cordova.file.externalApplicationStorageDirectory,
					function (fs) {
						fs.getFile(
							appName,{create: true,exclusive: false},function (fileEntry) {
								$dispatch(updateAppUpdating(true))
								cordova.plugins.notification.local.schedule({
									title: '正在更新',
									text: `安装包大小:${appSize}，请稍后`,
								});
								const fileTransfer = new FileTransfer();
								//监听下载进度
								let progressPercent = 0
								fileTransfer.onprogress = function (e) {
									if (e.lengthComputable) {
										let progressLine = e.loaded / e.total;
										// 显示下载进度
										progressPercent = (progressLine * 100).toFixed(0);
										cordova.plugins.notification.local.update({
											text: `正在下载: ${progressPercent}%`,
											progressBar: { value: progressPercent },
											sound: false,
											silent: true
										});
									}
								};
								// 使用fileTransfer.download开始下载
								fileTransfer.download(
									encodeURI(fileUrl), //uri网络下载路径
									fileEntry.nativeURL, //文件本地存储路径
									function (entry) {
										// 下载完成执行本地预览
										if (progressPercent > 1 || progressPercent === 1) {
											setTimeout(() => {
												function win(md5sum){
													logger.info("about page app package MD5SUM: " + md5sum);
													if(md5sum === MD5){
														$dispatch(updateAppUpdating(false))
														$dispatch(updateHasDownloadedPackage(true))
														cordova.plugins.notification.local.schedule({
															title: '下载完成',
															text: '点击安装',
															progressBar: false
														});
														confirm("提示","下载完成","立即安装", function(){
															entry.file(data => {
																res(self.preview(fileEntry, data.type));
																// 此处data.type可以直接得到文件的MIME-TYPE类型
															});
														})
													} else{
														logger.error("about page MD5", MD5)
														$dispatch(updateAppUpdating(false))
														$dispatch(updateHasDownloadedPackage(true))
														alertDialog('提示', "安装包已损坏，请重新安装")
													}
												}
												function fail(error){
													logger.error("about page Error-Message: " + error);
													$dispatch(updateAppUpdating(false))
													$dispatch(updateHasDownloadedPackage(true))
													alertDialog('提示', "安装包已损坏，请重新安装")
												}
												md5chksum.file(fileEntry, win, fail);
											})
										}
									},
									function (error) {
										cordova.plugins.notification.local.clearAll()
										$dispatch(updateHasDownloadedPackage(true))
										$dispatch(updateAppUpdating(false))
										window.logger.error(`下载失败`, error);
										alertDialog("下载失败");
									}
								);
							},
							function (error) {
								$dispatch(updateAppUpdating(false))
								// 失败回调, 重新读取文件并打开
								fs.getFile(
									"sign_release.apk", {
										create: false
									},
									function (fileEntry) {
										// 成功读取文件后调用cordova-plugin-file-opener2插件打开文件
										res(previewNew(fileEntry));
									},
									function (error) {
										window.logger.error(`升级文件读取错误`, error);
										alertDialog("升级文件读取错误");
									}
								);
							}
						);
					},
					function (error) {
						window.logger.error(`文件系统加载失败！`, error);
						alertDialog("文件系统加载失败！");
					}
				);
			})
		})
		.catch(err => {
			logger.error("SystemSetup checkUpdate err", err)
			alertDialog("catch err");
		})
	}

	preview = (fileEntry, mineType = 'application/vnd.android.package-archive') => {
		previewNew(fileEntry, mineType)
	}

	render() {
		const { appVersion, setSystemSetupDot } = this.props;
        return (
            <div className="sites-container">
				<MyInfoMiddlePageComponent
					pageName="关于"
					itemColumns={itemColumns}
					self={this}
					backToPage="system_setup"
					callback1={this.checkUpdateFunc}
					setSystemSetupDot={setSystemSetupDot}
				/>
				{appVersion ? <div className="show-version">版本号：{appVersion}</div> : null}
            </div>
        );
	}
}

const mapStateToProps = state => {
	return {
		appVersion: state.common.appVersion,
		setSystemSetupDot: state.myInfo.setSystemSetupDot,
		appUpdating: state.common.appUpdating,
		appSize: state.common.appSize,
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(About);