import React from 'react';
import { connect } from "react-redux";
import { Toast } from 'antd-mobile';
import MyInfoMiddlePageComponent from "./child/myInfoMiddlePageComponent";
import { networkErr } from "../services/utils";
import UpdateBody from "./child/updateBody";
import { updateSetSystemSetupDot } from "../ducks/myInfo";
import { CONSTANT } from "../constants/enumeration";
import { HTTP_URL } from "../constants/httpRoute";
import { confirm } from "../services/utils";
import { updateHasDownloadedPackage, updateAppUpdating, updateAppSize, updateUpgradeProgressPercent } from "../ducks/common"
import { previewNew, checkDownloadedOrNot, checkAppMD5 } from "../logic/common";

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
		Toast.loading('正在检查更新', CONSTANT.toastLoadingTime, () => {});
        axios.get(HTTP_URL.checkUpdate)
            .then(response => {
				const result = response.data
                if(!result){
					Toast.hide();
					Toast.success('已是最新版本', CONSTANT.toastTime);
                    return;
				}
				if(result.disableUpdate) return Toast.success('已是最新版本', CONSTANT.toastTime);
                const remoteAppVersion = result.version,
					appSize = result.appSize,
					MD5 = result.MD5,
                    newAppVersionContent = result.content
                window.logger.info(`remote appVersion, ${remoteAppVersion}`);
				window.logger.info(`local appVersion, ${appVersion}`);
				if(remoteAppVersion > appVersion){
					window.logger.info("发现新版本");
					Toast.hide();
					$dispatch(updateAppSize(appSize))
					confirm(`发现新版本`, <UpdateBody list={newAppVersionContent} remoteAppVersion={remoteAppVersion} appSize={appSize}/>, "立即下载", function(){
						checkDownloadedOrNot(HTTP_URL.appRelease ,"miXingFeng.apk", MD5, self.downloadAppFunc, self.preview);
					})
				} else {
					window.logger.info("已是最新版本");
					Toast.success('已是最新版本', CONSTANT.toastTime);
				}
            })
            .catch(err => {
                networkErr(err, `checkUpdate`);
            })
	}

	downloadAppFunc = (fileUrl, appName, MD5) => {
		const self = this;
		const { appSize } = this.props;
		return new Promise((resolve, reject) => {
			cordova.plugins.notification.local.hasPermission(function (granted) {
				logger.info("downloadAppFunc hasPermission granted", granted)
				if(!granted){
					cordova.plugins.notification.local.requestPermission(function (granted) {
						logger.info("downloadAppFunc requestPermission granted", granted)
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
										$dispatch(updateUpgradeProgressPercent(progressPercent + "%"))
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
												checkAppMD5(fileEntry, MD5, entry, res, true, self.preview)
												$dispatch(updateUpgradeProgressPercent(0))
											})
										}
									},
									function (error) {
										cordova.plugins.notification.local.clearAll()
										$dispatch(updateHasDownloadedPackage(true))
										$dispatch(updateAppUpdating(false))
										logger.error(`下载失败`, error);
										alertDialog("下载失败");
									}
								);
							},
							function (error) {
								$dispatch(updateAppUpdating(false))
								logger.error(`升级文件下载错误`, error);
							}
						);
					},
					function (error) {
						logger.error(`文件系统加载失败！`, error);
						alertDialog("文件系统加载失败！");
					}
				);
			})
		})
		.catch(err => {
			logger.error("SystemSetup downloadAppFunc err", err)
			alertDialog("catch err");
		})
	}



	preview = (fileEntry, mineType = 'application/vnd.android.package-archive') => {
		previewNew(fileEntry, mineType)
	}

	render() {
		const { appVersion, setSystemSetupDot, upgradeProgressPercent } = this.props;
        return (
            <div className="sites-container">
				<MyInfoMiddlePageComponent
					pageName="关于"
					itemColumns={itemColumns}
					self={this}
					backToPage="system_setup"
					callback1={this.checkUpdateFunc}
					setSystemSetupDot={setSystemSetupDot}
					upgradeProgressPercent={upgradeProgressPercent}
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
		upgradeProgressPercent: state.common.upgradeProgressPercent,
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(About);
