import React from 'react';
import { Button, Toast, ImagePicker, List, Switch } from "antd-mobile";
import { createForm } from 'rc-form';
import NavBar from "./child/navbar";
import { HTTP_URL } from "../constants/httpRoute";
import { alert, networkErr } from "../services/utils";
import { CONSTANT } from "../constants/enumeration";


class Feedback extends React.Component {

	state = {
		files: [],
		uploadLog: true
	}

	onChange = (files, type, index) => {
		this.setState({
			files,
		});
	}

    backToMainPage = () => {
        window.goRoute(this, "/system_setup");
    }

    submitFeedback = () => {
		const { files, uploadLog } = this.state;
		const hasPic = files.length
        const arr = [];
        const feedbackContent = window.$(".feedback-textarea").val();
		if(feedbackContent.length > 1000) return alert("不允许超过1000个字");
		if(!feedbackContent) return alert("请描述您遇到的问题或建议")
        arr.push(new Date().format("yyyy-MM-dd hh:mm:ss"));
		arr.push(feedbackContent);
		let fileExtname = ""
		if(hasPic){
			const extname = files[0]['file']['name'].split('.').pop()
			if(extname){
				fileExtname = extname
			}
		}
        let {username} = window.$getState().login;
		let data = Object.assign({}, { username }, { feedbackContent: arr }, {extname: fileExtname})
		// 提交反馈的文字内容
		if(!this.startToSubmit){
			this.startToSubmit = true
			axios.post(HTTP_URL.feedback, data)
            .then((response) => {
				this.startToSubmit = false
                Toast.success('提交成功, 非常感谢您的反馈', CONSTANT.toastTime);
				return response.data.result.filename
			})
			.then((filename) => {
				if(hasPic){
					// 提交反馈截图
					const fd = new FormData()
					const config = {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					}
					fd.append('files', files[0]['file'])
					fd.append("type", 'feedbackImage');
					fd.append("filename", filename);
					axios.post(HTTP_URL.uploadFile, fd, config)
						.then((result) => {
							logger.info("upload feedback pic result", result.data.result)
						})
						.catch((err) => {
							return Promise.reject(err)
						})
				}
				if(uploadLog && window.isCordova){
					new Promise((res, rej) => {
						window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
							fs.root.getDirectory('miXingFeng', {
								create: true
							}, function (dirEntry) {
								dirEntry.getDirectory("log", {
									create: true
								}, function (subDirEntry) {
									//持久化数据保存
									subDirEntry.getFile(
										"sign_log.log", {create: true, exclusive: false},
										function (fileEntry) {
											const fileURL = fileEntry.toURL();
											const win = function(r) {
												logger.info("upload log success", r)
												res()
											}
											const fail = function(error) {
												// error.code == FileTransferError.ABORT_ERR
												alertDebug("An error has occurred: Code = " + error.code);
												logger.error("upload error source " + error.source);
												logger.error("upload error target " + error.target);
												rej()
											}
											let filename1 = filename.split(".")
											filename1.pop();
											filename1 = filename1.join("")
											logger.info("upload log filename1", filename1)
											const options = new FileUploadOptions();
											options.fileKey = "file";
											options.fileName = filename1;
											options.mimeType = "text/plain";
											// options.headers = {
											// 	Connection: "close"
											// }
											var params = {};
    										params.value1 = "put your params here";
    										options.params = params;
											const ft = new FileTransfer();
											ft.upload(fileURL, encodeURI(HTTP_URL.uploadPic), win, fail, options);
										}
									)
								})
							})
						})
					})
				}
			})
            .catch(err => {
				this.startToSubmit = false
                return networkErr(err);
			})
			.finally(() => {
				//window.goRoute(this, "/system_setup");
			})
		}
	}

	onChangeUploadLog = (checked) => {
		this.props.form.setFieldsValue({
			Switch1: checked,
		});
		this.setState({
			uploadLog: checked
		})
	}

    render() {
		const { files, uploadLog } = this.state;
		const { getFieldProps } = this.props.form;
        return (
            <div className="feedback-container">
                <NavBar centerText="反馈" backToPreviousPage={this.backToMainPage} />
                <div className="feedback-content">
                    <textarea className="feedback-textarea" placeholder="请详细描述你遇到的问题或建议" />
					<ImagePicker
						files={files}
						onChange={this.onChange}
						selectable={files.length < 1}
						accept="image/jpeg,image/jpg,image/png"
					/>
					<div className="upload-log">
						<List.Item
							extra={<Switch
							    {...getFieldProps('Switch1', {
							    	initialValue: uploadLog,
							    	valuePropName: 'checked',
							    })}
								platform="ios"
								onClick={this.onChangeUploadLog}
							/>}
        				>
							上传日志
						</List.Item>
					</div>
                    <div className="submit-feedback">
                        <Button type="primary" className="button" value="提交" onClick={this.submitFeedback}>提交</Button>
                    </div>
                </div>
            </div>
        );
    }
}

const FeedbackSe = createForm()(Feedback);

export default FeedbackSe;
