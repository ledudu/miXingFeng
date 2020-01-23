﻿import { Modal, Toast } from "antd-mobile";
import { updateToken } from "../ducks/login";
import { CON } from "../constants/enumeration";
import { updateDownloadingFileItems, updateFileList, updateDownloadedMusicList, updateDownloadingMusicItems } from "../ducks/fileServer"
import { calcSize } from "../logic/common";
import { addDataFromIndexDB, readAllDataFromIndexDB,readDataFromIndexDB, removeDataFromIndexDB } from "./indexDB"
import { addMusicDataFromIndexDB, readMusicDataFromIndexDB, removeMusicDataFromIndexDB } from "./indexDBMusic"

export const alert = (text) => {
	if(window.isCordova){
		window.plugins.toast.showShortCenter(text)
	} else {
		Toast.info(text, 2, null, false);
	}
}

export const alertDialog = (title, text, button="确定") => {
	Modal.alert(title, text, [
		{
			text: button,
			onPress: () => {
				window.logger.info(`alertDialog confirm enter`);
			}
		},
	]);
}

export const confirm = function(title, text, button="确定", cb, cancelFunc=false){
	Modal.alert(title, text, [
		{ text: '取消', onPress: () => {
			window.logger.info(`confirm cancel`);
			if(cancelFunc){
				cancelFunc();
			}
		} },
		{
			text: button,
			onPress: () => {
				window.logger.info(`confirm enter`);
				return new Promise((resolve) => resolve(cb()))
			}
		},
	]);
}

export const networkErr = function(err){
	logger.info("networkErr", window.getRoute())
	if(err === undefined){
		logger.warn("network err 请检查网络连接")
		return Toast.fail("请检查网络连接", CON.toastTime);
	} else {
		if(Object.prototype.toString.call(err) === '[object Error]'){
			alertDebug("[object Error]: 请检查网络连接: " + err.stack || err.toString());
			logger.warn("networkErr" , err.stack || err.toString())
		} else if(Object.prototype.toString.call(err) === '[object Object]') {
			alertDebug("[object Object]: 请检查网络连接: " + err);
			logger.warn("networkErr" , err)
		} else {
			alertDebug("请检查网络连接: " + JSON.stringify(err));
			logger.warn("networkErr" , JSON.stringify(err))
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

export const onBackKeyDown = () => {
	let strUrl = window.location.href;
	let pageName = strUrl.split("html#/")[strUrl.split("html#/").length - 1];
	if (pageName === "main/sign" || pageName === "main/file" || pageName === "main/music" || pageName === "main/myInfo"){
		window.plugins.toast.showShortCenter('再按一次离开')
		document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
		document.addEventListener("backbutton", backToDesktop, false); //绑定退出事件
		setTimeout(function () {  // 3秒后重新注册
			document.removeEventListener("backbutton", backToDesktop, false); // 注销返回键
			document.addEventListener("backbutton", onBackKeyDown, false); // 返回键
		}, 2000);
	} else {
		window.history.back();
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

export const saveFileToLocal = (filenameOrigin, fileUrl, folder, filename, uploadUsername, needSaveToDownloadBox = false, fileSize, fromMusic, options={}) => {
	if(!window.isCordova) {
		window.open(fileUrl)
		return;
	}
	return new Promise(function (res, rej) {
		logger.info("saveFileToLocal filenameOrigin", filenameOrigin)
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
                            const fileTransfer = new FileTransfer();
							let progressPercent = 0, throttleTimer=null, firstTime = true, cancelDownload = false
                            fileTransfer.onprogress = function (e) {
								if(!filename) return
                                if (e.lengthComputable) {
                                    const progressLine = e.loaded / e.total;
									progressPercent = (progressLine * 100).toFixed(0);
									if(throttleTimer) return;
									if(firstTime){
										firstTime = false;
										updateDownloadingStatus(filename, `${calcSize(e.loaded)}/${calcSize(e.total)}`, uploadUsername, e.total, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options.duration)
										// 这里的filenameOrigin到后面会改变，是为了区分正在下载和已下载
										// 取消下载，移除下载
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
													const { downloadingFileItems, downloadingMusicItems } = $getState().fileServer
													if(param[0] === "file"){
														for(let index in downloadingFileItems){
															if(downloadingFileItems[index].filenameOrigin === param[1]){
																downloadingFileItems.splice(index, 1)
																window.eventEmit.$emit("downloadingFileItems", downloadingFileItems)
																$dispatch(updateDownloadingFileItems(downloadingFileItems))
															}
														}
													} else if(param[0] === "music"){
														for(let index in downloadingMusicItems){
															if(downloadingMusicItems[index].filenameOrigin === param[1]){
																downloadingMusicItems.splice(index, 1)
																window.eventEmit.$emit("downloadingMusicItems", downloadingMusicItems)
																$dispatch(updateDownloadingMusicItems(downloadingMusicItems))
															}
														}
													}
												}, 1100)
											}
										})
									} else {
										throttleTimer = setTimeout(() => {
											clearTimeout(throttleTimer)
											updateDownloadingStatus(filename, `${calcSize(e.loaded)}/${calcSize(e.total)}`, uploadUsername, e.total, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options.duration)
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
										window.eventEmit.$off(`FileTransfer-${filenameOrigin}`)
										if(needSaveToDownloadBox){
											const { username } = $getState().login
											const downloadedFileOrigin = `downloaded_${filenameOrigin}`
											const dataToSaveIndexedDBObj = {
												filename,
												username,
												fileSize,
												uploadUsername,
												date: Date.now(),
												filenameOrigin: downloadedFileOrigin
											}
											let addDataFromIndexDBPromise = Promise.resolve()
											if(fromMusic){
												dataToSaveIndexedDBObj.isMusic = true
												dataToSaveIndexedDBObj.filePath = `cdvfile://localhost/sdcard/miXingFeng/music/${downloadedFileOrigin}`
												dataToSaveIndexedDBObj.duration = options.duration
												dataToSaveIndexedDBObj.id = options.fileId || "downloaded"  //只有下载到本地的共享音乐才有id，且id只能是downloaded
												dataToSaveIndexedDBObj.original = options.original
												const getFieldFromIndexDB = await readMusicDataFromIndexDB(downloadedFileOrigin)
												if(getFieldFromIndexDB !== "未获得数据记录"){
													// 错误兜底，同时log这个错误
													alertDebug(`music已存在${downloadedFileOrigin}`)
													logger.error("saveFileToLocal music dataToSaveIndexedDBObj", dataToSaveIndexedDBObj)
													await removeMusicDataFromIndexDB(downloadedFileOrigin)
												}
												addDataFromIndexDBPromise = addMusicDataFromIndexDB(dataToSaveIndexedDBObj)
											} else {
												const getFieldFromIndexDB = await readDataFromIndexDB(downloadedFileOrigin)
												if(getFieldFromIndexDB !== "未获得数据记录"){
													alertDebug(`file已存在${downloadedFileOrigin}`)
													logger.error("saveFileToLocal file dataToSaveIndexedDBObj", dataToSaveIndexedDBObj)
													await removeDataFromIndexDB(downloadedFileOrigin)
												}
												addDataFromIndexDBPromise = addDataFromIndexDB(dataToSaveIndexedDBObj)
											}

											addDataFromIndexDBPromise
												.then(() => {
													setTimeout(() => {
														alert(`${filename}下载完成`)
														const { downloadingFileItems, downloadingMusicItems, fileList, downloadedMusicList } = $getState().fileServer
														if(fromMusic){
															downloadedMusicList.push(dataToSaveIndexedDBObj)
															window.eventEmit.$emit("downloadMusicFinished", downloadedMusicList)
															$dispatch(updateDownloadedMusicList(downloadedMusicList))
															for(let index in downloadingMusicItems){
																if(downloadingMusicItems[index].filenameOrigin === `downloading_${filenameOrigin}`){
																	downloadingMusicItems.splice(index, 1)
																	logger.info("downloadingMusicItems 下载完成", downloadingMusicItems)
																	window.eventEmit.$emit("downloadingMusicItems", downloadingMusicItems)
																	$dispatch(updateDownloadingMusicItems(downloadingMusicItems))
																}
															}
														} else {
															window.eventEmit.$emit("downloadFinished")
															// readAllDataFromIndexDB()
															// 	.then((indexDBData) => {
															// 		indexDBData.forEach((item1) => {
																		fileList.forEach((item) => {
																			if(item.filename === filename){
																				item.downloaded = true
																			}
																		})
																	// })
																	$dispatch(updateFileList(fileList));
																// })
															for(let index in downloadingFileItems){
																if(downloadingFileItems[index].filenameOrigin === `downloading_${filenameOrigin}`){
																	downloadingFileItems.splice(index, 1)
																	logger.info("downloadingFileItems 下载完成", downloadingFileItems)
																	window.eventEmit.$emit("downloadingFileItems", downloadingFileItems)
																	$dispatch(updateDownloadingFileItems(downloadingFileItems))
																}
															}
														}
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
											updateDownloadingStatus(filename, '已取消', uploadUsername, fileSize, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options.duration)
										} else {
											window.logger.error(`下载失败`, error, 'fileUrl', fileUrl);
											if(error.body === "Not Found"){
												window.logger.error("文件已删除");
												alert("文件已删除")
												return;
											}
											alert(`${filename}下载失败`)
											updateDownloadingStatus(filename, '失败', uploadUsername, fileSize, needSaveToDownloadBox, fileUrl, filenameOrigin, fromMusic, options.duration)
										}
									}, 1010)
                                    res()
                                }
							);
                        },
                        function (error) {
							window.logger.error("获取文件失败", error.stack||error.toString());
							alert("获取文件失败")
                            rej()
                        }
                );
                },function (error) {
					alert("文件系统加载失败！")
                    window.logger.error(`文件系统加载失败！`, error);
                })
            });
		})
    })
}

export const updateDownloadingStatus = (filename, result, uploadUsername, fileSize, needSaveToDownloadBox, filePath, filenameOrigin, fromMusic, duration) => {
	if(!needSaveToDownloadBox) return;
	const { downloadingFileItems, downloadingMusicItems } = $getState().fileServer
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
		obj.duration = duration
		for(let index in downloadingMusicItems){
			if(downloadingMusicItems[index].filenameOrigin === filenameOrigin){
				downloadingMusicItems[index].progress = result;
				window.eventEmit.$emit("downloadingMusicItems", downloadingMusicItems)
				return
			}
		}
		downloadingMusicItems.push(obj)
		window.eventEmit.$emit("downloadingMusicItems", downloadingMusicItems)
	} else {
		for(let index in downloadingFileItems){
			if(downloadingFileItems[index].filenameOrigin === filenameOrigin){
				downloadingFileItems[index].progress = result;
				window.eventEmit.$emit("downloadingFileItems", downloadingFileItems)
				return
			}
		}
		downloadingFileItems.push(obj)
		window.eventEmit.$emit("downloadingFileItems", downloadingFileItems)
	}
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
	let debounceTimer = null;
	return function(){
		let context = this;
		if(debounceTimer){
			clearTimeout(debounceTimer)
			debounceTimer = setTimeout(() => {
				fn(context, arguments)
				debounceTimer = null
			}, t)
		} else {
			debounceTimer = setTimeout(() => {
				fn(context, arguments)
				debounceTimer = null;
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