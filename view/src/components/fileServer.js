import React, { useState, useRef, useEffect } from 'react';
import { connect } from "react-redux";
import StatusBar from "./child/statusBar";
import { confirm } from "../services/utils";
import FileManage from "./fileManage"
import { HTTP_URL } from "../constants/httpRoute";
import { updateFileSubmitStatus, updateFileUploadProgress } from "../ducks/fileServer"
import { checkFileMD5Func, calcFileMD5, logActivity } from "../logic/common"

const FileServer = ( { fileList, fileSubmitStatus, fileUploadProgress, token, username, setMobile } ) => {

	const [MD5Value, setMD5Value] = useState("")
	const [MD5ValueError, setMD5ValueError] = useState(null)
	const fileToUploadRef = useRef()
	let getMD5Time = 0, startToUpload = false

	useEffect(() => {
		const handleMD5 = (e) => {
			setMD5Value("")
			setMD5ValueError(null)
			return calcFileMD5(e.target.files[0])
				.then((resultObj) => {
					const { MD5Value, MD5ValueError } = resultObj
					logger.info("fileServer handleMD5 MD5Value", MD5Value)
					if(MD5Value && !MD5ValueError){
						setMD5Value(MD5Value)
					} else {
						setMD5ValueError(MD5ValueError)
					}
				})
		}
		fileToUploadRef.current.addEventListener('change', handleMD5, false);
		return () => {
			getMD5Time = null
			fileToUploadRef.current.removeEventListener('change', handleMD5, false);
		}
	}, [])

	const submitFile = () => {
		if(!token){
			return window.goRoute(this, "/login")
		}
		if(!startToUpload){  //forbid upload more times
			startToUpload = true;
			const filename = fileToUploadRef.current.files[0].name;
			let overwriteSameFilename = false
			for(let item of fileList){
				if(item.filename === filename){
					overwriteSameFilename = true
					confirm(`提示`, `已经存在${filename}，上传将覆盖原文件`, "确定", () => {
						logger.info("overwrite file true", item.filename);
						uploadFile()
					}, () => {
						logger.info("submitFile overwrite file false", item.filename);
						startToUpload = false;
						return;
					})
				}
			}
			if(!overwriteSameFilename){
				uploadFile()
			}
		} else {
			alert("一次只能上传一个文件，请勿重复上传")
		}
	}

	const uploadFile = async() => {
		const files = fileToUploadRef.current.files;
		const filename = fileToUploadRef.current.files[0].name;
		const fileSize = fileToUploadRef.current.files[0].size;
		if (/#|%/g.test(filename)) {
			alertDialog("文件名不能包含%或#");
			startToUpload = false;
			return
		} else if (fileSize > 100 * 1024 * 1024) {
			alertDialog('文件大小不可以超过100MB');
			startToUpload = false;
			return
		} else if(getMD5Time > 100 && !MD5Value){
			$dispatch(updateFileSubmitStatus("上传"))
			logger.warn("too long loop to generate md5")
			startToUpload = false;
			return alertDialog("文件不可读，请更换文件重试")
		}
		logger.info("fileServer uploadFile MD5Value", MD5Value)
		$dispatch(updateFileSubmitStatus("上传中"))
		if(MD5Value){
			const checkResult = await checkFileMD5Func(filename, (username || setMobile), MD5Value, "default-file", "file")
			if(checkResult === "缺少字段") {
				startToUpload = false;
				return  alertDialog('缺少字段')
			}
			if(checkResult === "上传成功"){
				$dispatch(updateFileSubmitStatus("上传"))
				startToUpload = false;
				logActivity({
					msg: "second upload file success"
				})
				return  alertDialog('秒传成功')
			}
			if(checkResult === "没有匹配"){
				const formData = new FormData();
				formData.append('files', files[0]);
				formData.append("username", username || setMobile);
				formData.append("type", 'file');
				formData.append("md5", MD5Value);
				formData.append("registrationID", localStorage.getItem("registrationID") || "");
				const xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", uploadProgress, false);
				xhr.addEventListener("error", uploadFailed, false);
				xhr.open('POST', HTTP_URL.uploadFile);
				xhr.onreadystatechange = function () {
					startToUpload = false;
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
							logActivity({
								msg: "upload file success"
							})
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
				startToUpload = false;
				$dispatch(updateFileSubmitStatus("上传"))
				alert("文件不可读，请更换文件重试");
				return
			} else {
				getMD5Time++
				setTimeout(uploadFile, 300)
			}
		}
	}

	const uploadProgress = (evt) => {
		if (evt.lengthComputable) {
			const percentComplete = Math.round(evt.loaded * 100 / evt.total);
			$dispatch(updateFileUploadProgress(`${percentComplete.toString()}%`))
		} else {
			startToUpload = false;
			$dispatch(updateFileUploadProgress(``))
			$dispatch(updateFileSubmitStatus("上传"))
		}
	}

	const uploadFailed = (evt) => {
		alert("上传失败");
		startToUpload = false;
		$dispatch(updateFileUploadProgress(``))
		$dispatch(updateFileSubmitStatus("上传"))
		logger.error("上传失败", evt);
	}

	return (
		<div className="file-server">
			<StatusBar />
			<h2 className='head'> 文件列表 </h2>
			<div className="upload-area">
				<input type="file" className="file-to-upload" ref={fileToUploadRef} style={{"backgroundImage": "none"}} />
				<div className="upload">
					<input type="button" name="submit" value={fileSubmitStatus} onClick={submitFile} />
					<div className='file-progress'>{fileUploadProgress}</div>
				</div>
			</div>
			<div className="file-container">
				<FileManage fileDataList={fileList} original="fileShare" />
			</div>
		</div>
	);
}

const mapStateToProps = state => {
    return {
		fileList: state.fileServer.fileList,
		username: state.login.username,
		token: state.login.token,
		fileSubmitStatus: state.fileServer.fileSubmitStatus,
		fileUploadProgress: state.fileServer.fileUploadProgress,
		setMobile: state.myInfo.setMobile,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FileServer);
