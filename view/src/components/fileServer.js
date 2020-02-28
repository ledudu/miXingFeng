import React from 'react';
import { connect } from "react-redux";
import StatusBar from "./child/statusBar";
import { onBackKeyDown, confirm } from "../services/utils";
import FileManage from "./fileManage"
import { HTTP_URL } from "../constants/httpRoute";
import { updateFileSubmitStatus, updateFileUploadProgress } from "../ducks/fileServer"
import { checkFileMD5Func, calcFileMD5  } from "../logic/common"

class FileServer extends React.Component {

	state = {
		MD5Value: "",
		MD5ValueError: null
	}

    componentDidMount(){
		this.el = document.getElementsByClassName('file-to-upload')[0];
		this.el.addEventListener('change', this.handleMD5, false);
		this.getMD5Time = 0
    }

    componentWillUnmount(){
		this.el.removeEventListener('change', this.handleMD5, false);
		this.getMD5Time = null
    }

    listenBackFunc = () => {
        document.addEventListener("backbutton", onBackKeyDown, false);
	}

	handleMD5 = (e) => {
		this.setState({
			MD5Value: "",
			MD5ValueError: null
		})
		return calcFileMD5(e.target.files[0])
			.then((resultObj) => {
				const { MD5Value, MD5ValueError } = resultObj
				logger.info("fileServer handleMD5 MD5Value", MD5Value)
				if(MD5Value && !MD5ValueError){
					this.setState({
						MD5Value
					})
				} else {
					this.setState({
						MD5ValueError
					})
				}
			})
	}

	uploadFiles = () => {
		const fileNum = this.el.files && this.el.files.length;
		if (fileNum) {
			this.submitFile(fileNum)
		}
	}

	submitFile = (fileNum) => {
		const { fileList, username, token } = this.props;
		if(!username || !token){
			alert("请先登录");
			return;
		}
		if(!this.startToUpload){  //forbid upload more times
			this.startToUpload = true;
			if(this.currentUploadFileNum === undefined || this.currentUploadFileNum === NaN){
				this.currentUploadFileNum = 0
			}
			const filename = $('.file-to-upload')[0].files[this.currentUploadFileNum].name;
			let overwriteSameFilename = false
			for(let item of fileList){
				if(item.filename === filename){
					overwriteSameFilename = true
					confirm(`提示`, `已经存在${filename}，上传将覆盖原文件`, "确定", () => {
						logger.info("overwrite file true", item.filename);
						this.uploadFile(fileNum)
					}, () => {
						logger.info("overwrite file false", item.filename);
						this.startToUpload = false;
						return;
					})
				}
			}
			if(!overwriteSameFilename){
				this.uploadFile(fileNum)
			}
		} else {
			alert("一次只能上传一个文件，请勿重复上传")
		}
	}

	uploadFile = async(fileNum) => {
		const self = this;
		const { MD5Value, MD5ValueError } = this.state
		const { username } = this.props;
		const files = this.el.files;
		const filename = this.el.files[this.currentUploadFileNum].name;
		const fileSize = this.el.files[this.currentUploadFileNum].size;
		if (/#|%/g.test(filename)) {
			alert("文件名不能包含%或#");
			this.startToUpload = false;
			return
		} else if (fileSize > 100 * 1024 * 1024) {
			alert('文件大小不可以超过100MB');
			this.startToUpload = false;
			return
		} else if(this.getMD5Time > 100 && !MD5Value){
			$dispatch(updateFileSubmitStatus("上传"))
			logger.warn("too long loop to generate md5")
			this.startToUpload = false;
			return alert("文件不可读，请更换文件重试")
		}
		logger.info("fileServer uploadFile MD5Value", MD5Value)
		$dispatch(updateFileSubmitStatus("上传中"))
		if(MD5Value){
			const checkResult = await checkFileMD5Func(filename, username, MD5Value, "default-file", "file")
			if(checkResult === "缺少字段") {
				this.startToUpload = false;
				return  alert('缺少字段')
			}
			if(checkResult === "上传成功"){
				$dispatch(updateFileSubmitStatus("上传"))
				this.startToUpload = false;
				return  alert('秒传成功')
			}
			if(checkResult === "没有匹配"){
				const formData = new FormData();
				formData.append('files', files[self.currentUploadFileNum]);
				formData.append("username", username);
				formData.append("type", 'file');
				formData.append("md5", MD5Value);
				formData.append("registrationID", localStorage.getItem("registrationID") || "");
				const xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", self.uploadProgress, false);
				xhr.addEventListener("error", self.uploadFailed, false);
				xhr.open('POST', HTTP_URL.uploadFile);
				xhr.onreadystatechange = function () {
					self.startToUpload = false;
					if (xhr.status === 200) {
						let responseText = {
							result: {
								response: ""
							}
						}
						try{
							responseText = JSON.parse(xhr.responseText)
						} catch (err){
							// todo
						}
						$dispatch(updateFileUploadProgress(""))
						$dispatch(updateFileSubmitStatus("上传"))
						if (responseText.result.response === "illegal_filetype") {
							alert('非法的文件名');
						} else if (responseText.result.response === "more_than_100mb") {
							alert('文件大小超过100MB');
						} else {
							alert('上传成功！');
							// 依靠websocket来更新文件列表
							delete self.currentUploadFileNum
						}
					} else {
						logger.error("xhr.onreadystatechange not 200, xhr.status", xhr.status, 'xhr.responseText', xhr.responseText)
						alert("上传失败")
					}
				};
				xhr.send(formData);
			}
		} else {
			if(MD5ValueError){
				this.startToUpload = false;
				$dispatch(updateFileSubmitStatus("上传"))
				alert("文件不可读，请更换文件重试");
				return
			} else {
				this.getMD5Time++
				setTimeout(() => this.uploadFile(fileNum), 300)
			}
		}

	}

	uploadProgress = (evt) => {
		if (evt.lengthComputable) {
			const percentComplete = Math.round(evt.loaded * 100 / evt.total);
			$dispatch(updateFileUploadProgress(`${percentComplete.toString()}%`))
		} else {
			this.startToUpload = false;
			$dispatch(updateFileUploadProgress(``))
			$dispatch(updateFileSubmitStatus("上传"))
		}
	}

	uploadFailed = (evt) => {
		alert("上传失败");
		this.startToUpload = false;
		$dispatch(updateFileUploadProgress(``))
		$dispatch(updateFileSubmitStatus("上传"))
		window.logger.error("上传失败", evt);
	}


    render() {
        let { fileList, fileSubmitStatus, fileUploadProgress } = this.props;
        return (
            <div className="file-server">
                <StatusBar />
                <h2 className='head'> 文件列表 </h2>
                <div className="upload-area">
                    <input type="file" className="file-to-upload" style={{"backgroundImage": "none"}} />
                    <div className="upload">
                        <input type="button" name="submit" value={fileSubmitStatus} onClick={this.uploadFiles} />
                        <div className='file-progress'>{fileUploadProgress}</div>
                    </div>
                </div>
                <div className="file-container">
					<FileManage fileDataList={fileList} original="fileShare" />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
		fileList: state.fileServer.fileList,
		username: state.login.username,
		token: state.login.token,
		fileSubmitStatus: state.fileServer.fileSubmitStatus,
		fileUploadProgress: state.fileServer.fileUploadProgress,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FileServer);
