import React, { Component, Fragment } from "react"
import { connect } from "react-redux";
import { List, Switch } from 'antd-mobile';
import { createForm } from 'rc-form';
import NavBar from "./child/navbar";
import {
	updateReceiveNotification,
	updateAlwaysShowAdsPage,
	updateAllowGetPosition,
	updateAllowOthersGetPosition,
	updateAllowShareMyNickname
} from "../ducks/common"
import { stopPush, resumePush } from "../services/JPush"
import { requestPositionPermission } from "../logic/common"
import { HTTP_URL } from "../constants/httpRoute"
import { updateToken } from "../ducks/login"
import { networkErr } from "../services/utils"

class Notification extends Component {

	backToMainPage = () => {
		window.goRoute(this, "/system_setup");
	}

	onChangeNotification = (checked) => {
		logger.info("onChangeNotification", checked);
		$dispatch(updateReceiveNotification(checked))
		if(checked){
			resumePush()
		} else {
			stopPush()
		}
		this.props.form.setFieldsValue({
			Switch1: checked,
		});
	}

	onChangeAlwaysShowAdsPage = (checked) => {
		logger.info("onChangeAlwaysShowAdsPage", checked);
		$dispatch(updateAlwaysShowAdsPage(checked))
		this.props.form.setFieldsValue({
			Switch3: checked,
		});
	}

	onAllowGetPosition = (checked) => {
		try{
			logger.info("onAllowGetPosition", checked);
			const self = this;
			if(checked){
				if(window.permissions){
					window.permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
						logger.info("onAllowGetPosition ACCESS_FINE_LOCATION", status);
						if (status.hasPermission) {
							$dispatch(updateAllowGetPosition(true))
							self.props.form.setFieldsValue({
								Switch4: true,
							});
						} else {
							return requestPositionPermission()
								.then((bool) => {
									if(bool === false){
										self.props.form.setFieldsValue({
											Switch4: false,
										});
									} else {
										self.props.form.setFieldsValue({
											Switch4: true,
										});
										$dispatch(updateAllowGetPosition(true))
									}
								})
						}
					})
				} else {
					$dispatch(updateAllowGetPosition(true))
					self.props.form.setFieldsValue({
						Switch4: true,
					});
				}
			} else {
				$dispatch(updateAllowGetPosition(false))
				this.props.form.setFieldsValue({
					Switch4: false,
				});
			}
		} catch(err){
			logger.error("onAllowGetPosition err", err)
		}
	}

	onAllowOthersGetPosition = (checked) => {
		logger.info("onAllowOthersGetPosition", checked);
		$dispatch(updateAllowOthersGetPosition(checked))
		this.props.form.setFieldsValue({
			Switch5: checked,
		});
	}

	onAllowShareMySignature = (checked) => {
		const { username, token } = this.props
		if(!token) {
			alert("请先登录")
			setTimeout(() => {
				this.props.form.setFieldsValue({
					Switch6: !checked,
				})
				$dispatch(updateAllowShareMyNickname(!checked))
			}, 17)
			return
		}
		logger.info("onAllowShareMySignature", checked);
		const data = Object.assign({username, token, userInfo: { shareNickname: checked } })
		axios.post(HTTP_URL.updateUserInfo, data)
			.then((response) => {
				if(response.data.result.response === "modify_success"){
					$dispatch(updateToken(response.data.result.token));
					$dispatch(updateAllowShareMyNickname(checked))
				} else {
					alertDebug("onAllowShareMySignature 设置失败")
					logger.error('onAllowShareMySignature 设置失败', response.data.result);
					this.props.form.setFieldsValue({
						Switch6: !checked,
					});
					$dispatch(updateAllowShareMyNickname(!checked))
				}
			})
			.catch(err => {
				this.props.form.setFieldsValue({
					Switch6: !checked,
				});
				$dispatch(updateAllowShareMyNickname(!checked))
				return networkErr(err, `onAllowShareMySignature`);
			})
		this.props.form.setFieldsValue({
			Switch6: checked,
		});
	}

	render(){
		const { receiveNotification, alwaysShowAdsPage, token, allowGetPosition, allowOthersGetPosition, allowShareMyNickname } = this.props;
		const { getFieldProps } = this.props.form;
		return (
			<div className="notification-run-container">
				<NavBar centerText="通知和权限" backToPreviousPage={this.backToMainPage} />
				<List renderHeader={() => ''} >
					{window.isCordova
					? 	<Fragment>
							{token && <List.Item style={{height: "60px"}}
								extra={<Switch
									{...getFieldProps('Switch1', {
											initialValue: receiveNotification,
									valuePropName: 'checked',
									platform: "ios",
									onChange: (val) => {

									},
									})}
									onClick={this.onChangeNotification}
								/>}
								>接收所有通知
								</List.Item>}
						</Fragment>
					:	null}
					<List.Item style={{height: "60px"}}
						extra={<Switch
							{...getFieldProps('Switch3', {
								initialValue: alwaysShowAdsPage,
								valuePropName: 'checked',
								platform: "ios",
							})}
							onClick={this.onChangeAlwaysShowAdsPage}
						/>}
					>启动app显示广告
					</List.Item>
					<List.Item style={{height: "60px"}}
					extra={<Switch
						{...getFieldProps('Switch4', {
							initialValue: allowGetPosition,
								valuePropName: 'checked',
								platform: "ios",
							})}
							onClick={this.onAllowGetPosition}
						/>}
					>允许程序获取地理位置
					</List.Item>
					<List.Item style={{height: "60px"}}
						extra={<Switch
							{...getFieldProps('Switch5', {
								initialValue: allowOthersGetPosition,
								valuePropName: 'checked',
								platform: "ios",
							})}
							onClick={this.onAllowOthersGetPosition}
						/>}
					>允许别人获取我的位置
					</List.Item>
					<List.Item style={{height: "60px"}}
						extra={<Switch
							{...getFieldProps('Switch6', {
								initialValue: allowShareMyNickname,
								valuePropName: 'checked',
								platform: "ios",
							})}
							onClick={this.onAllowShareMySignature}
						/>}
					>共享我的昵称
					</List.Item>
				</List>
			</div>
		)
	}
}

const NotificationSe = createForm()(Notification);

const mapStateToProps = state => {
    return {
		receiveNotification: state.common.receiveNotification,
		alwaysShowAdsPage: state.common.alwaysShowAdsPage,
		username: state.login.username,
		token: state.login.token,
		allowGetPosition: state.common.allowGetPosition,
		allowOthersGetPosition: state.common.allowOthersGetPosition,
		allowShareMyNickname: state.common.allowShareMyNickname
    };
};

const mapDispatchToProps = () => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSe);
