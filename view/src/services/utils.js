﻿import { Modal, Toast } from "antd-mobile";
import Logger from "cordova-logger"
import { updateToken } from "../ducks/login";
import { CONSTANT } from "../constants/enumeration";
import { HTTP_URL } from "../constants/httpRoute"
import { updateDownloadingFileList, updateFileList, updateDownloadedMusicList, updateDownloadingMusicItems, updateDownloadedFileList } from "../ducks/fileServer"
import { calcSize, checkFilePath, reconnectSocket, logActivity } from "../logic/common";
import { addDataFromIndexDB, removeDataByIndexFromIndexDB } from "./indexDB"
import { addMusicDataFromIndexDB, removeMusicDataByIndexFromIndexDB } from "./indexDBMusic"

export const alertDialog = (title, text, button="确定", cb) => {
	Modal.alert(title, text, [
		{
			text: button,
			onPress: () => {
				window.logger.info(`alertDialog confirm enter title, text`, title, text);
				if(cb instanceof Function){
					cb()
				}
			}
		},
	]);
}

export const confirm = function(title, text, button="确定", cb, cancelFunc=false){
	Modal.alert(title, text, [
		{ text: '取消', onPress: () => {
			window.logger.info(`confirm cancel title, text`, title, text);
			if(cancelFunc){
				cancelFunc();
			}
		} },
		{
			text: button,
			onPress: () => {
				window.logger.info(`confirm enter title, text`, title, text);
				return new Promise((resolve) => resolve(cb()))
			}
		},
	]);
}

export const networkErr = function(err, originTip){
	logger.error("networkErr window.getRoute()", window.getRoute())
	if(originTip){
		logger.error("networkErr originTip", originTip)
	}
	if(err === undefined){
		logger.warn("network err 请检查网络连接")
		if(window.showToastFail){
			return
		} else {
			window.showToastFail = true
			setTimeout(() => {
				window.showToastFail = false
			}, 1000)
			return Toast.fail("请检查网络连接", CONSTANT.toastTime);
		}
	} else {
		if(Object.prototype.toString.call(err) === '[object Error]'){
			alertDebug("[object Error]: 请检查网络连接: " + err.stack || err.toString());
			logger.warn("networkErr" , err.stack || err.toString())
		} else if(Object.prototype.toString.call(err) === '[object Object]') {
			alertDebug("[object Object]: 请检查网络连接: " + err);
			logger.warn("networkErr" , err)
		} else {
			alertDebug("请检查网络连接: " + JSON.stringify(err));
			logger.warn("networkErr" , err)
		}
	}
}

export const writeFile = function (dataObj = "", filename = "sign.txt", isAppend) {
	return new Promise(function (res) {
			window.resolveLocalFileSystemURL(
				window.cordova.file.externalApplicationStorageDirectory,
				function (fs) {
					fs.getFile(filename, {
							create: true,
							exclusive: false
						},
						function (fileEntry) {
							//创建一个写入对象
							fileEntry.createWriter(function (fileWriter) {
								//文件写入成功
								fileWriter.onwriteend = function () {
									// window.logger.info(`文件写入成功`, dataObj);
									res(dataObj)
								};
								//文件写入失败
								fileWriter.onerror = function (e) {
									window.logger.error(`文件写入失败`, JSON.stringify(e));
								};
								if(isAppend) fileWriter.seek(fileWriter.length);
								//写入文件
								fileWriter.write(dataObj);
							});
						}, onErrorCreateFile);
				}, onErrorLoadFs);
	})
}

export const isEmptyFileFunc =  async function (filename = "sign.txt", hasToken) {
	let content = await getAndReadFile(filename, true)
	return new Promise(function (res) {
		if (hasToken) {
			if (content && content.token) {
				window.logger.info(`含有token`);
				res(false)
			} else {
				window.logger.info(`不含有token`);
				res(true)
			}
		} else {
			if (content.length) {
				window.logger.info(`含有内容`);
				res(false)
			} else {
				window.logger.info(`没有内容`);
				res(true)
			}
		}
	})
}

export const getAndReadFile = async function (filename, needDecrypt=true) {
	return new Promise(function (res) {
			window.resolveLocalFileSystemURL(
			window.cordova.file.externalApplicationStorageDirectory,
			function (fs) {
				fs.getFile(filename, {
					create: true,
					exclusive: false
				}, function (fileEntry) {
					fileEntry.file(function (file) {
						var reader = new FileReader();
						reader.onloadend = function () {
							// window.logger.info(`读取文件的内容`, this.result);
							if (this.result) {
								if(needDecrypt){
									var b = new window.Base64();
									var str = b.decode(this.result);
								} else {
									str = this.result;
								}
								try {
									var readData = JSON.parse(str);
									res(readData);
								} catch (e) {
									window.logger.error(`getAndReadFile, 解析文件内容是出错`, e.stack || e.message || e.toString());
									res();
								}
							} else {
								res();
							}
						};
						reader.readAsText(file);
					}, onErrorReadFile);
				}, onErrorCreateFile);
			}, onErrorLoadFs);
		})
		.catch(e => {
			window.logger.error(`读取文件的内容发生了错误`, e);
		})
}

export const checkPreviousLogin = async function (filename="sign.txt", isEmptyFile) {
	let content = await getAndReadFile(filename, true)
	return new Promise(function (res) {
		if (content) {
			window.$dispatch(updateToken(content.token));
			if (!isEmptyFile) {
				window.logger.info('has login');
			}
		} else {
			window.logger.info('never login');
		}
		res()
	})
	.catch(e => {
		window.logger.error(`解析上次登录文件时出现错误`, e.stack || e.toString());
	})
}

//文件创建失败回调
function onErrorCreateFile(error) {
	window.logger.error(`文件创建失败！`, error);
}
//FileSystem加载失败回调
function onErrorLoadFs(error) {
	// navigator.splashscreen.hide();
	window.logger.error(`文件系统加载失败！`, error);
}
//文件读取失败回调
function onErrorReadFile(error) {
	window.logger.error(`读取错误!:`, error);
}

export const specialBackFunc = () => {
	// 统一处理物理按键的返回逻辑
	window.specialBack = true
}

export const backToPreviousPage = (self, route, options={}) => {
	if(options.specialBack) {
		logger.info("backToPreviousPage route, options", route, options)
		specialBackFunc()
	}
	window.goRoute(self, route);
}

export const onBackKeyDown = () => {
	const pageName = window.getRoute();
	const { isFromSystemSetup } = $getState().common
	const { showUpdateConfirm } = $getState().sign
	if(isFromSystemSetup) return window.history.back();
	if(showUpdateConfirm) return;
	logger.info("onBackKeyDown pageName, isFromSystemSetup, showUpdateConfirm", pageName, isFromSystemSetup, showUpdateConfirm)
	if (pageName === "/main/sign" || pageName === "/main/file" || pageName === "/main/music" || pageName === "/main/myInfo"){
		window.plugins.toast.showShortCenter('再按一次离开')
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.addEventListener("backbutton", backToDesktop, false); //绑定退出事件
		setTimeout(function () {  // 2秒后重新注册
			document.removeEventListener("backbutton", backToDesktop, false); // 注销返回键
			document.addEventListener("backbutton", onBackKeyDown, false); // 返回键
		}, 2000);
	} else {
		setTimeout(() => {
			if(!window.specialBack){
				window.history.back();
			} else {
				window.specialBack = false
			}
		}, 50)
	}
}

export const backToDesktop = () => {
	logger.info("backToDesktop goHome")
	navigator.Backbutton.goHome();
}

export const exitApp = () => {
	if(window.ws && ws.readyState ===1){
		window.ws.close(1000)
	}
	window.navigator.app.exitApp();
}

export const stopPropagation = (e) => {
	if(Object.type(e) === Object.type.EVENT){
		if(e.stopPropagation){
			e.stopPropagation();
		}
	} else if (Object.type(e) === Object.type.OBJECT || Object.type(e) === Object.type.PROXYOBJECT){
		//Object.type(e) === Object.type.PROXYOBJECT兼容ios10，ios中获取react的事件对象解析为proxyobject，而不是object
		if(e.stopPropagation){
			e.stopPropagation();
		}
		if(e.nativeEvent&&e.nativeEvent.stopImmediatePropagation){
			if(e.nativeEvent.stopPropagation){
				e.nativeEvent.stopPropagation();
			}
			if(e.nativeEvent.stopImmediatePropagation){
				e.nativeEvent.stopImmediatePropagation();
			}
		}
	}
}

export const saveFileToLocal = async({
	filenameOrigin,
	fileUrl,
	folder,
	filename,
	uploadUsername,
	needSaveToDownloadBox = false,
	fileSize,
	fromMusic,
	options={}
}) => {
	if(!filenameOrigin) return
	if(fromMusic){
		fileUrl = await checkFilePath(fileUrl, options.original, options.musicId, options.musicDataList, filenameOrigin, false)
		if(!fileUrl) return alert("音乐链接获取失败")
	}
	logger.info("saveFileToLocal fileUrl, filenameOrigin", fileUrl, filenameOrigin)
	if(!window.isCordova) {
		if(folder === CONSTANT.downloadAppFromPage) logActivity({msg: filenameOrigin})
		window.open(fileUrl)
		return;
	}
	const fileTransfer = new FileTransfer();
	let progressPercent = 0, throttleTimer=null, firstTime = true, cancelDownload = false
	// 取消下载，移除下载
	if(needSaveToDownloadBox){
		window.eventEmit.$on(`FileTransfer-${filenameOrigin}`, (type, param) => {
			logger.info("saveFileToLocal FileTransfer type", type, "param", param)
			if(type === "abort"){
				logger.info('saveFileToLocal cancel download')
				cancelDownload = true;
				fileTransfer.abort()
			}
			if(param){
				setTimeout(() => {
					// window.eventEmit.$off(`FileTransfer-${filenameOrigin}`)
					const { downloadingFileList, downloadingMusicItems } = $getState().fileServer
					if(param[0] === "file"){
						const downloadingFileListCopy = JSON.parse(JSON.stringify(downloadingFileList))
						for(let index in downloadingFileList){
							if(downloadingFileListCopy[index].filenameOrigin === param[1]){
								downloadingFileListCopy.splice(index, 1)
								$dispatch(updateDownloadingFileList(downloadingFileListCopy))
								removeDataByIndexFromIndexDB(param[1])
								break;
							}
						}
					} else if(param[0] === "music"){
						const downloadingMusicItemsCopy = JSON.parse(JSON.stringify(downloadingMusicItems))
						for(let index in downloadingMusicItems){
							if(downloadingMusicItems[index].filenameOrigin === param[1]){
								downloadingMusicItemsCopy.splice(index, 1)
								$dispatch(updateDownloadingMusicItems(downloadingMusicItemsCopy))
								removeMusicDataByIndexFromIndexDB(param[1])
								break;
							}
						}
					}
					logger.info("saveFileToLocal param, downloadingMusicItems", param, downloadingMusicItems)
				}, 1100)
			}
		})
	}
	return new Promise(function (res) {
		logger.info("saveFileToLocal prepare to download filenameOrigin", filenameOrigin)
		let fileSizeCopy = fileSize
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getDirectory('miXingFeng', {
				create: true
			}, function (dirEntry) {
				dirEntry.getDirectory(folder, {
					create: true
				}, function (subDirEntry) {
					//持久化数据保存
                    subDirEntry.getFile(
                        filenameOrigin, {create: true, exclusive: false},
                        function (fileEntry) {
                            fileTransfer.onprogress = async function (e) {
								if(!filename) return
                                if (e.lengthComputable) {
                                    const progressLine = e.loaded / e.total;
									progressPercent = (progressLine * 100).toFixed(0);
									if(throttleTimer) return;
									if(firstTime){
										logger.info("saveFileToLocal start to download onprogress firstTime filenameOrigin", filenameOrigin)
										firstTime = false;
										fileSizeCopy = (fileSize && fileSize !== "未知") ? fileSize : e.total
										const { username } = $getState().login
										const downloadingFileOrigin = `downloading_${filenameOrigin}`
										const downloadingDataToSaveIndexedDBObj = {
											filename,
											username,
											fileSize: fileSizeCopy,
											uploadUsername,
											date: Date.now(),
											filenameOrigin: downloadingFileOrigin,
											status: "downloading",
											progress: "已取消",
											filePath: fileUrl,
										}
										if(fromMusic){
											downloadingDataToSaveIndexedDBObj.isMusic = true
											downloadingDataToSaveIndexedDBObj.duration = options.duration
											downloadingDataToSaveIndexedDBObj.id = options.fileId || "downloading"  //只有下载到本地的共享音乐才有id，且id只能是downloaded
											downloadingDataToSaveIndexedDBObj.original = options.original
											// await removeMusicDataByIndexFromIndexDB(downloadingFileOrigin)
											addMusicDataFromIndexDB(downloadingDataToSaveIndexedDBObj)
										} else {
											addDataFromIndexDB(downloadingDataToSaveIndexedDBObj)
										}
										updateDownloadingStatus(filename, `${calcSize(e.loaded)}/${calcSize(e.total)}`, uploadUsername, e.total, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options)
									} else {
										throttleTimer = setTimeout(() => {
											clearTimeout(throttleTimer)
											updateDownloadingStatus(filename, `${calcSize(e.loaded)}/${calcSize(e.total)}`, uploadUsername, e.total, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options)
											throttleTimer = null;
										}, 1000)
									}
                                }
                            };
                            fileTransfer.download(
                                encodeURI(fileUrl),
                                fileEntry.nativeURL,
                                async function (entry) {
									logger.info("saveFileToLocal filename", filename, 'fileUrl', fileUrl, 'folder', folder)
									if(!filename) return res()
                                    if (progressPercent >= 1) {
										logger.info("saveFileToLocal download complete wait for next to success filenameOrigin", filenameOrigin)
										window.eventEmit.$off(`FileTransfer-${filenameOrigin}`)
										if(needSaveToDownloadBox){
											const { username } = $getState().login
											const downloadingFileOrigin = `downloading_${filenameOrigin}`
											const downloadedFileOrigin = `downloaded_${filenameOrigin}`
											const downloadedDataToSaveIndexedDBObj = {
												filename,
												username,
												fileSize: fileSizeCopy,
												uploadUsername,
												date: Date.now(),
												filenameOrigin: downloadedFileOrigin,
												status: "downloaded"
											}
											let addDataFromIndexDBPromise = Promise.resolve()
											if(fromMusic){
												downloadedDataToSaveIndexedDBObj.isMusic = true
												downloadedDataToSaveIndexedDBObj.filePath = `cdvfile://localhost/sdcard/miXingFeng/music/${downloadedFileOrigin}`
												downloadedDataToSaveIndexedDBObj.fileUrl = fileUrl
												downloadedDataToSaveIndexedDBObj.duration = options.duration
												downloadedDataToSaveIndexedDBObj.id = options.fileId || "downloaded"
												downloadedDataToSaveIndexedDBObj.original = options.original
												await removeMusicDataByIndexFromIndexDB(downloadingFileOrigin)
												// await removeMusicDataByIndexFromIndexDB(downloadedFileOrigin)
												addDataFromIndexDBPromise = addMusicDataFromIndexDB(downloadedDataToSaveIndexedDBObj)
											} else {
												await removeDataByIndexFromIndexDB(downloadingFileOrigin)
												// await removeDataByIndexFromIndexDB(downloadedFileOrigin)
												addDataFromIndexDBPromise = addDataFromIndexDB(downloadedDataToSaveIndexedDBObj)
											}

											addDataFromIndexDBPromise
												.then(() => {
													setTimeout(() => {
														alert(`${filename}下载完成`)
														const { downloadingFileList, downloadingMusicItems, fileList, downloadedMusicList, downloadedFileList } = $getState().fileServer
														if(fromMusic){
															const downloadedMusicListCopy = JSON.parse(JSON.stringify(downloadedMusicList))
															const downloadingMusicItemsCopy = JSON.parse(JSON.stringify(downloadingMusicItems))
															downloadedMusicListCopy.push(downloadedDataToSaveIndexedDBObj)
															$dispatch(updateDownloadedMusicList(downloadedMusicListCopy))
															for(let index in downloadingMusicItems){
																if(downloadingMusicItems[index].filenameOrigin === `downloading_${filenameOrigin}`){
																	downloadingMusicItemsCopy.splice(index, 1)
																	logger.info("downloadingMusicItems 下载完成")
																	$dispatch(updateDownloadingMusicItems(downloadingMusicItemsCopy))
																}
															}
														} else {
															const fileListCopy = JSON.parse(JSON.stringify(fileList))
															const downloadedFileListCopy = JSON.parse(JSON.stringify(downloadedFileList))
															const downloadingFileListCopy = JSON.parse(JSON.stringify(downloadingFileList))
															fileListCopy.forEach((item) => {
																if(item.filenameOrigin === filenameOrigin){
																	item.downloaded = true
																}
															})
															$dispatch(updateFileList(fileListCopy));
															downloadedFileListCopy.push(downloadedDataToSaveIndexedDBObj)
															$dispatch(updateDownloadedFileList(downloadedFileListCopy));
															for(let index in downloadingFileList){
																if(downloadingFileList[index].filenameOrigin === `downloading_${filenameOrigin}`){
																	downloadingFileListCopy.splice(index, 1)
																	logger.info("downloadingFileList 下载完成", downloadingFileListCopy)
																	$dispatch(updateDownloadingFileList(downloadingFileListCopy))
																	break;
																}
															}
														}
														logger.info("saveFileToLocal download complete success filenameOrigin", filenameOrigin)
													}, 1010)
												})
												.catch(err => {
													logger.error("download fail", err)
													alert("下载失败")
												})
										}
                                        res()
                                    }
                                },
                                function (error) {
									setTimeout(() => {
										// window.eventEmit.$off(`FileTransfer-${filenameOrigin}`)
										if(cancelDownload){
											window.logger.info(`error callback cancel download`);
											logger.info("saveFileToLocal download 已取消 filenameOrigin", filenameOrigin)
											updateDownloadingStatus(filename, '已取消', uploadUsername, fileSizeCopy, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options)
										} else {
											window.logger.error(`下载失败`, error, 'fileUrl', fileUrl);
											if(error.body === "Not Found"){
												window.logger.error("saveFileToLocal download 文件已删除 filenameOrigin", filenameOrigin);
												alert("文件已删除")
												return;
											}
											alert(`${filename}下载失败`)
											window.logger.error("saveFileToLocal download 下载失败 filenameOrigin", filenameOrigin);
											updateDownloadingStatus(filename, '失败', uploadUsername, fileSizeCopy, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options)
										}
									}, 1010)
                                    res()
                                }
							);
                        },
                        function (error) {
							window.logger.error("saveFileToLocal 获取文件失败", error.stack||error.toString());
                            res()
                        }
                	);
                },function (error) {
					alert("文件系统加载失败！")
                    window.logger.error(`saveFileToLocal 文件系统加载失败！`, error);
                })
            });
		})
    })
}

export const updateDownloadingStatus = (filename, result, uploadUsername, fileSize, needSaveToDownloadBox, filePath, filenameOrigin, fromMusic, options) => {
	if(!needSaveToDownloadBox) return;
	const { downloadingFileList, downloadingMusicItems } = $getState().fileServer
	filenameOrigin = `downloading_${filenameOrigin}`
	const obj = {
		filename,
		progress: result,
		uploadUsername,
		filePath,
		fileSize,
		filenameOrigin
	}
	if(fromMusic){
		obj.duration = options.duration
		const downloadingMusicItemsCopy = JSON.parse(JSON.stringify(downloadingMusicItems))
		for(let index in downloadingMusicItemsCopy){
			if(downloadingMusicItemsCopy[index].filenameOrigin === filenameOrigin){
				downloadingMusicItemsCopy[index].progress = result;
				$dispatch(updateDownloadingMusicItems(downloadingMusicItemsCopy))
				return
			}
		}
		downloadingMusicItemsCopy.push(obj)
		$dispatch(updateDownloadingMusicItems(downloadingMusicItemsCopy))
	} else {
		const downloadingFileListCopy = JSON.parse(JSON.stringify(downloadingFileList))
		for(let index in downloadingFileListCopy){
			if(downloadingFileListCopy[index].filenameOrigin === filenameOrigin){
				downloadingFileListCopy[index].progress = result;
				$dispatch(updateDownloadingFileList(downloadingFileListCopy))
				return
			}
		}
		downloadingFileListCopy.push(obj)
		$dispatch(updateDownloadingFileList(downloadingFileListCopy))
	}
	logger.info("updateDownloadingStatus fromMusic, obj", fromMusic, obj)
}

export const throttle = (fn, t) => {
	let throttleTimer = null;
	return function(){
		let context = this;
		if(throttleTimer) return;
		throttleTimer = setTimeout(() => {
			clearTimeout(throttleTimer)
			fn.apply(context, arguments)
			throttleTimer = null;
		}, t)
	}
}

export const debounce = (fn ,t) => {
	let debounceTimer = null, firstTimeRun = true
	return function(){
		let context = this;
		if(debounceTimer){
			clearTimeout(debounceTimer)
			debounceTimer = setTimeout(() => {
				fn.apply(context, arguments)
				debounceTimer = null
			}, t)
		} else {
			if(firstTimeRun){
				firstTimeRun = false
				fn.apply(context, arguments)
			} else {
				debounceTimer = setTimeout(() => {
					fn.apply(context, arguments)
					debounceTimer = null;
				}, t)
			}
		}
	}
}

export const debounceOpt = (fn, t, obj={}) => {
	const self = this
	if(obj.debounceTimer){
		clearTimeout(obj.debounceTimer)
		obj.debounceTimer = setTimeout(() => {
			fn.apply(self, arguments)
			obj.debounceTimer = null
		}, t)
	} else {
		if(obj.firstTimeRun){
			obj.firstTimeRun = false
			fn.apply(context, arguments)
		} else {
			obj.debounceTimer = setTimeout(() => {
				fn.apply(self, arguments)
				obj.debounceTimer = null;
			}, t)
		}
	}
}

export const openBrowserLink = (link) => {
	if(window.isCordova){
		document.addEventListener("deviceready", () => {
			cordova.InAppBrowser.open(link, '_system', 'location=no');
		}, false);
	} else {
		window.open(link)
	}
}

export const checkFileWritePriority = () => {
	return new Promise(res => {
		if(window.isCordova){
			window.permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
				if(status.hasPermission){
					res(true)
				} else {
					logger.info("saveFileToLocal WRITE_EXTERNAL_STORAGE", status);
					res(false)
				}
			})
		} else {
			res(true)
		}
	})
}

export const requestFileWritePriority = () => {
	return new Promise(res => {
		if(window.isCordova){
			window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
				fs.root.getDirectory('miXingFeng', {
					create: true
				}, function (dirEntry) {
					dirEntry.getDirectory("tmp",
						{create: true},
						function (subDirEntry) {
							//持久化数据保存
							subDirEntry.getFile(
								"tmp",
								{create: true, exclusive: false},
								function (fileEntry) {
									const allowReadAndWriteFile = localStorage.getItem("allowReadAndWriteFile")
									if(!allowReadAndWriteFile){
										localStorage.setItem("allowReadAndWriteFile", "yes")
										window.logger = new Logger({
											folder: "miXingFeng",
											column: "log",
											filename: "miXingFeng.txt"
										})
									}
									res(fileEntry)
								},
								function (error) {
									logger.error("requestFileWritePriority error", error)
									res(error)
								}
							)
						}
					)
				})
			})
		} else {
			res(false)
		}
	})
}

export const IsPC = () => {
	const userAgentInfo = navigator.userAgent;
	const Agents = ["Android", "iPhone",
		"SymbianOS", "Windows Phone",
		"iPad", "iPod"
	];
	let flag = true;
	for (let v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}

export const generateRandomUserId = () => "ls" + Math.random().toString(36).slice(2, 6)

export const replaceSocketLink = (data, logInfo="logInfo") => {
	return axios.post(HTTP_URL.replaceSocketLink, data)
		.then(response => {
			if (response.data.result.response === "success") {
				logger.info('replaceSocketLink success', logInfo)
				reconnectSocket()
			} else {
				logger.warn("replaceSocketLink fail", logInfo)
			}
		})
		.catch(err => {
			logger.warn("replaceSocketLink err", logInfo, err)
		})
}

export const checkWeChatInstallOrNot = () => {
	return new Promise(res => {
		Wechat.isInstalled(function (installed) {
			res(true)
		}, function (reason) {
			alertDialog("未安装微信")
			res(false)
			logger.warn('Wechat.isInstalled', "Failed: " + reason);
		});
	})
}

export const shareLinkToWeChat = ({
	title="这是分享的标题",
	description="这是分享的描述",
	thumb="www/assets/imgs/logo.png",
	webpageUrl=CONSTANT.appStaticDirectory,
	scene=Wechat.Scene.SESSION  //Wechat.Scene.TIMELINE
}) => {
	return checkWeChatInstallOrNot()
		.then(bool => {
			if(bool){
				return new Promise(res => {
					Wechat.share({
						message:{
							title,
							description,
							thumb,
							media: {
								type: Wechat.Type.WEBPAGE,
								webpageUrl
							}
						},
						scene
					}, function () {
						logActivity({
							msg: "shareLinkToWeChat",
							LinkTitle: title,
							scene
						})
						res("success")
					}, function (reason) {
						res("fail")
						logger.error("shareLinkToWeChat", "Failed: " + reason);
					});
				})
			} else {
				return bool
			}
		})
}

export const shareVideoToWeChat = ({
	title="这是分享的标题",
	description="这是分享的描述",
	thumb="www/assets/imgs/logo.png",
	videoUrl=CONSTANT.appStaticDirectory
}) => {
	return checkWeChatInstallOrNot()
		.then(bool => {
			if(bool){
				return new Promise(res => {
					Wechat.share({
						message: {
							title,
							description,
							thumb,
							media: {
								type: Wechat.Type.VIDEO,
								videoUrl,
							}
						},
						scene: Wechat.Scene.SESSION
					}, function () {
						logActivity({
							msg: "shareVideoToWeChat",
							videoTitle: title
						})
						res("success")
					}, function (reason) {
						res("fail")
						logger.error("shareVideoToWeChat Failed: " + reason);
					});
				})
			} else {
				return bool
			}
		})
}

export const comeFromWeChat = () => {
	return navigator.userAgent.toLowerCase().includes("micromessenger")
}
