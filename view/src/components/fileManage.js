import React from 'react'
import { connect } from "react-redux"
import { ActionSheet } from 'antd-mobile'
import MINE from "mime-types"
import { calcSize } from "../logic/common"
import { networkErr, confirm, saveFileToLocal, updateDownloadingStatus, checkFileWritePriority, requestFileWritePriority, onBackKeyDown } from "../services/utils"
import { HTTP_URL } from "../constants/httpRoute"
import { updateToken } from "../ducks/login"
import { readAllDataFromIndexDB } from "../services/indexDB"
import { openDownloadedFile, removeFileFromDownload, removeDuplicateObjectList, removePrefixFromFileOrigin } from "../logic/common"
import { updateLastFileSearchResult, updateLastSearchAllFileResult } from "../ducks/fileServer"
import { CONSTANT } from "../constants/enumeration"

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
	wrapProps = {
		onTouchStart: e => e.preventDefault(),
	};
}
let currentTime = new Date().getTime()

class FileManage extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			indexDBData: [],
			downloadingFileItems: props.fileDataList,
			searchFileDataList: props.fileDataList,
			showFilesLoadTimes: 1,
		}
	}

    async componentDidMount(){
		await this.getDataFromIndexDB()
		window.eventEmit.$on("downloadFinished", async () => {
			await this.getDataFromIndexDB()
		})
		window.eventEmit.$on("downloadingFileItems", (downloadingFileItems) => {
			this.setState({
				downloadingFileItems
			})
		})
		window.eventEmit.$on("fileRemoved", () => {
			this.getDataFromIndexDB()
		})
		window.clearAllFilesTime = false
		window.eventEmit.$on("clearAllFiles", () => {
			const { indexDBData }  = this.state
			const self = this;
			if(!window.clearAllFilesTime){
				window.clearAllFilesTime = true
				confirm(`提示`, `确定要删除所有文件吗`, "确定", () => {
					self.setState({
						indexDBData: []
					}, () => {
						window.clearAllFilesTime = false
						if(indexDBData.length){
							alert("删除成功")
						} else {
							alert("没有文件需要被清理")
						}
					})
					indexDBData.forEach(item => {
						removeFileFromDownload(removePrefixFromFileOrigin(item.filenameOrigin), "file")
					})
				}, () => {
					window.clearAllFilesTime = false
				})
			}
		})
		if(this.props.original === "fileShare"){
			const scrollDom = document.querySelector('.file-container')
			scrollDom.addEventListener("scroll", this.handleScroll);
		}
	}

	UNSAFE_componentWillReceiveProps (nextProps){
		if(this.props.original === "fileSearch"){
			this.setState({
				searchFileDataList: nextProps.fileDataList
			})
		}
	}

	componentWillUpdate(){
		this.getDataFromIndexDB(true)
		return true
	}

	componentWillUnmount(){
		window.eventEmit.$off("downloadFinished")
		window.eventEmit.$off("fileDownloading")
		window.eventEmit.$off("clearAllFiles")
		window.eventEmit.$off("fileRemoved")
		if(this.props.original === "fileShare"){
			const scrollDom = document.querySelector('.file-container')
			scrollDom.removeEventListener("scroll", this.handleScroll);
		}
	}

	listenBackFunc = () => {
		document.addEventListener("backbutton", this.closeShowMenu, false);
	}

	removeListenBackFunc = () => {
		document.removeEventListener("backbutton", this.closeShowMenu);
		document.removeEventListener("deviceready", this.listenBackFunc);
		const urlLocation = window.location.href
		logger.info("fileManage removeListenBackFunc urlLocation", urlLocation)
		if(urlLocation.indexOf("main/file")){
			document.addEventListener("backbutton", onBackKeyDown, false);
		}
	}

	closeShowMenu = () => {
		const musicMenuExisted = document.querySelector('.am-action-sheet-button-list div:nth-last-child(1)')
		if(musicMenuExisted) musicMenuExisted.click();
		if(musicMenuExisted) musicMenuExisted.click();
	}

	getDataFromIndexDB = async (notRefresh) => {
		const { fileDataList=[] } = this.props;
		let indexDBData = await readAllDataFromIndexDB()
		indexDBData = indexDBData.filter(item => {
			return (!item.status || item.status === "downloaded")
		})
		indexDBData.forEach((item1, index1) => {
			fileDataList.forEach((item2, index2) => {
				if(removePrefixFromFileOrigin(item1.filenameOrigin) === item2.filenameOrigin){
					item2.downloaded = true
				}
			})
		})
		indexDBData = _.orderBy(indexDBData, ['date'], ['asc'])
		if(!notRefresh){
			this.setState({
				indexDBData
			})
		}
	}

	showMenu = async(filename, fileSize, filePath, uploadUsername, filenameOrigin, date) => {
		try {
			const urlLocation = window.location.href
			logger.info("fileManage showMenu urlLocation", urlLocation)
			if(urlLocation.indexOf("main/file")){
				document.removeEventListener("backbutton", onBackKeyDown, false);
			}
			document.addEventListener("deviceready", this.listenBackFunc);

			const { username, token, original, setMobile } = this.props;
			let firstItem = "下载";
			let isFileFinished = (original === "fileFinished")
			if(isFileFinished){
				firstItem = "打开"
			} else if(original === "fileShare" || original === "fileSearch"){
				const indexDBData = await readAllDataFromIndexDB()
				indexDBData.some((item) => {
					if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin) && (!item.status || item.status === "downloaded")){
						firstItem = "打开"
						isFileFinished = true
						return true
					} else {
						return false
					}
				})
			}
			if(original === "fileDownloading" || original === "fileFinished"){
				date = ""
			} else {
				date = ` ${date}`
			}
			let buttons = [firstItem, '删除', '取消'];
			const showActionSheetWithOptionsConfig = {
				options: buttons,
				cancelButtonIndex: buttons.length - 1,
				destructiveButtonIndex:  buttons.length - 2,
				message: `大小: ${calcSize(fileSize)}${date}`,
				title: filename,
				maskClosable: true,
				'data-seed': 'logId',
				wrapProps,
			}
			ActionSheet.showActionSheetWithOptions(
				showActionSheetWithOptionsConfig,
				(buttonIndex) => {
					logger.info("file manage showMenu buttonIndex", buttonIndex)
					switch(buttonIndex){
						case 0:
							if(isFileFinished){
								this.openFileFunc(filename, filenameOrigin)
							} else {
								this.saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, false, filenameOrigin)
							}
							break;
						case 1:
							// 只有在已下载页面的删除才能删除已下载的文件，其他的页面删除都是删除服务器上的文件
							if(original === "fileFinished"){
								confirm(`提示`, `确定从本地删除${filename}吗`, "确定", () => {
									removeFileFromDownload(removePrefixFromFileOrigin(filenameOrigin), "file")
										.catch(error => {
											logger.error("删除文件过程中发生了错误 isFileFinished", error.stack||error.toString());
											networkErr(error, `fileManage removeFileFromDownload filename ${filename}`);
										})
								})
							} else {
								if(!token) return alert("请先登录")
								const dataInfo = {
									username: username || setMobile,
									token,
									filename,
									type: "default-file"
								}
								confirm(`提示`, `确定从服务器删除${filename}吗`, "确定", () => {
									const urlStr = HTTP_URL.delFile
									if(!this.startToDeleteOnline){
										this.startToDeleteOnline = true
										return axios.delete(urlStr, {data: dataInfo})
											.then(response => {
												this.startToDeleteOnline = false
												if (response.data.result.result === 'file_deleted') {
													alert("文件已删除!");
													$dispatch(updateToken(response.data.result.token))
													return this.updateSearchList(original, filenameOrigin)
												} else if (response.data.result.result === 'success'){
													alert("删除成功!");
													$dispatch(updateToken(response.data.result.token))
													return this.updateSearchList(original, filenameOrigin)
												} else {
													alert("删除失败!");
												}
											})
											.catch(error => {
												this.startToDeleteOnline = false
												logger.error("删除文件过程中发生了错误", error.stack||error.toString());
												networkErr(error, `delFile dataInfo: ${JSON.stringify(dataInfo)}`);
											})
									}
								})
							}
							break;
						default:
							logger.warn("buttonIndex default")
							break;
					}
					this.removeListenBackFunc()
				}
			);
		} catch(err){
			logger.error("fileManage showMenu err", err)
		}
	}

	updateSearchList = (original, filenameOrigin) => {
		const { type } = this.props
		if(original === "fileSearch"){
			const { lastFileSearchResult=[], lastSearchAllFileResult=[] } = this.props;
			let lastFileSearchResultIndex, lastSearchAllFileResultIndex
			lastFileSearchResult.some((item, index) => {
				if(item.filenameOrigin === filenameOrigin){
					lastFileSearchResultIndex = index
					return true
				}
			})
			lastFileSearchResult.splice(lastFileSearchResultIndex, 1)
			lastSearchAllFileResult.some((item, index) => {
				if(item.filenameOrigin === filenameOrigin){
					lastSearchAllFileResultIndex = index
					return true
				}
			})
			lastSearchAllFileResult.splice(lastSearchAllFileResultIndex, 1)
			$dispatch(updateLastFileSearchResult(lastFileSearchResult))
			$dispatch(updateLastSearchAllFileResult(lastSearchAllFileResult))
			if(type === "file"){
				this.setState({
					searchFileDataList: lastFileSearchResult
				})
			} else if(type === "searchAll"){
				this.setState({
					searchFileDataList: lastSearchAllFileResult
				})
			}
		}
	}

	downloadOrOpenFile = async (filename, uploadUsername, fileSize, filePath, filenameOrigin) => {
		const { original, downloadingFileItems } = this.props;
		if(original === "fileFinished"){
			this.openFileFunc(filename, filenameOrigin)
		} else if(original === "fileShare" || original === "fileSearch"){
			//只要在这个条件里不要再往下写强依赖逻辑，这里的await可以不加
			await this.saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, false, filenameOrigin)
		} else if(original === "fileDownloading"){
			downloadingFileItems.some((item) => {
				if(item.filenameOrigin === filenameOrigin) {
					filenameOrigin = filenameOrigin.replace(/^downloading_/, "")
					logger.info("downloadOrOpenFile filenameOrigin", filenameOrigin)
					if(item.progress === "失败" || item.progress === "已取消"){
						this.saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, true, filenameOrigin)
					} else {
						window.eventEmit.$emit(`FileTransfer-${filenameOrigin}`, 'abort')
					}
					return true
				} else {
					return false
				}
			})
		}
	}

	openFileFunc = (filename, filenameOrigin) => {
		let fileMine = MINE.lookup(filename)
		if(!fileMine){
			fileMine = 'text/plain';
			alert("不支持打开的的文件类型，请提交反馈")
		}
		openDownloadedFile(filename, fileMine, removePrefixFromFileOrigin(filenameOrigin))
	}

	saveFileToLocalFunc = async (filename, uploadUsername, fileSize, filePath, retry, filenameOrigin) => {
		const { token, downloadingFileItems } = this.props;
		if(!token) return alert("请先登录")
		if(!window.isCordova){
			return saveFileToLocal(filenameOrigin, filePath)
		}
		if((new Date().getTime() - currentTime) < 300){
			// not allow to click frequently
			currentTime = new Date().getTime();
			return;
		}
		let isDownload = false
		const filenameOriginOld = filenameOrigin
		filenameOrigin = removePrefixFromFileOrigin(filenameOrigin)
		if(!retry && window.isCordova){
			downloadingFileItems.some((item) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin){
					isDownload = true
					confirm(`提示`, `${filename}正在下载`, "去查看", () => {
						window.goRoute(null, "/my_finished_files")
					})
					return true
				} else {
					return false
				}
			})
		}
		const indexDBData = await readAllDataFromIndexDB()
		indexDBData.some((item) => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin && (!item.status || item.status === "downloaded")){
				isDownload = true
				this.openFileFunc(filename, filenameOriginOld)
				return true
			} else {
				return false
			}
		})
		if(!isDownload){
			return checkFileWritePriority()
				.then(bool => {
					if(bool){
						if(retry){
							alert(`重新下载${filename}`)
						} else {
							alert(`开始下载${filename}`)
						}
						updateDownloadingStatus(filename, '准备中', uploadUsername, fileSize, true, filePath, filenameOrigin)
						saveFileToLocal(filenameOrigin, filePath, "download", filename, uploadUsername, true, fileSize, false)
					} else {
						return alertDialog("请授予文件读写权限，否则不能下载文件", "", "知道了", requestFileWritePriority)
					}
				})
		}
	}

	removeDownloadItem = (filename, filenameOrigin) => {
        confirm('提示', `确定要移除下载${filename}吗`, "确定", () => {
			logger.info("removePrefixFromFileOrigin(filenameOrigin)", removePrefixFromFileOrigin(filenameOrigin))
			window.eventEmit.$emit(`FileTransfer-${removePrefixFromFileOrigin(filenameOrigin)}`, 'abort', ["file", filenameOrigin])
		})
	}

	handleScroll = (e) => {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer)
			this.debounceTimer = setTimeout(() => {
				let { showFilesLoadTimes } = this.state
				const { fileDataList } = this.props
				if ((showFilesLoadTimes * CONSTANT.showFileNumberPerTime < fileDataList.length)) {
					if (e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight) < 100) {
						this.setState({
							showFilesLoadTimes: ++showFilesLoadTimes
						})
					}
				}
				this.debounceTimer = null
			}, 100)
		} else {
			this.debounceTimer = setTimeout(() => {
				let { showFilesLoadTimes } = this.state
				const { fileDataList } = this.props
				if ((showFilesLoadTimes * CONSTANT.showFileNumberPerTime < fileDataList.length)) {
					if (e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight) < 100) {
						this.setState({
							showFilesLoadTimes: ++showFilesLoadTimes
						})
					}
				}
				this.debounceTimer = null;
			}, 4)
		}
	}

	dealWithFileUploadTime = (date) => {
		const { original } = this.props;
		if(!date) return ""
		if(original === "fileDownloading" || original === "fileFinished") return ""
		return " " + date.split(" ")[0]
	}

    render() {
		let { fileDataList=[], original } = this.props;
		const { indexDBData, downloadingFileItems, searchFileDataList, showFilesLoadTimes } = this.state
		if(original === "fileFinished"){
			fileDataList = indexDBData
		} else if(original === "fileDownloading"){
			fileDataList = downloadingFileItems
		} else if(original === "fileSearch"){
			fileDataList = searchFileDataList
		} else if(original === "fileShare"){
			fileDataList = fileDataList.slice(0, CONSTANT.showFileNumberPerTime * showFilesLoadTimes)
		}
		fileDataList = removeDuplicateObjectList(fileDataList, 'filenameOrigin')
        return (
            <div className={`file-manage-container`}>
				{
					fileDataList.map((item, index) =>
						<div className="file-list" key={item.filenameOrigin}>
							<div className={`file-content ${original === "fileDownloading" && "downloading"}`} onClick={this.downloadOrOpenFile.bind(this, item.filename, item.uploadUsername, item.fileSize, item.filePath, item.filenameOrigin)}>
								<div className="num">{index + 1}</div>
								<div className="file-info">
									<div className={`info ${original === "fileFinished" ? "center" : ""} ${item.downloaded ? "downloaded" : ""}`}>
										<div className="filename">{item.filename}</div>
										{item.downloaded && <div className="downloaded-text">已下载</div>}
									</div>
									{
										original !== "fileFinished" && <div className="upload-info">
											<div className="upload-user">
												{`${item.uploadUsername}${this.dealWithFileUploadTime(item.date)}`}
											</div>
											{
												(original === "fileShare" || original === "fileSearch")
												?	<div className="file-size">{calcSize(item.fileSize)}</div>
												:	<div className="file-size">{item.progress}</div>
											}
										</div>
									}
								</div>
							</div>
							{
								original !== "fileDownloading"
								?   <div className="menu" onClick={this.showMenu.bind(this, item.filename, item.fileSize, item.filePath, item.uploadUsername, item.filenameOrigin, item.date)}>
								    	<div className="dot"></div>
								    	<div className="dot"></div>
								    	<div className="dot"></div>
								    </div>
								:	<div className="move-downloading-item fa fa-remove" onClick={this.removeDownloadItem.bind(this, item.filename, item.filenameOrigin)}></div>
							}
						</div>
					)
				}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
		username: state.login.username,
		token: state.login.token,
		downloadingFileItems: state.fileServer.downloadingFileItems,
		lastFileSearchResult: state.fileServer.lastFileSearchResult,
		lastSearchAllFileResult: state.fileServer.lastSearchAllFileResult,
		setMobile: state.myInfo.setMobile,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FileManage);
