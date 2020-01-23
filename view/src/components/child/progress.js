import React from 'react';
import { Progress } from 'antd-mobile';
import { calcSize } from "../../logic/common";

class MyProgress extends React.Component {

	render() {
		let { percent, appSize, appTotalSize, checkingPackage } = this.props;
		appSize = calcSize(appSize);
		appTotalSize = calcSize(appTotalSize);
		return (
			<div className="progress-area">
				<div className="progress-container">
					<div className="updating">正在更新</div>
					<div className="show-info">
						<div className="number" aria-hidden="true">{percent}%</div>
						<div className="progress"><Progress percent={percent} position="normal" /></div>
						{
							checkingPackage
							?	<div className="check-package">正在校验安装包...</div>
							:	<div className="process-size" aria-hidden="true">{appSize}/{appTotalSize}</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default MyProgress;
