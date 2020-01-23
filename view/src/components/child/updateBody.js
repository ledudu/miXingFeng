import React from 'react';

class UpdateBody extends React.Component {

    render (){
		const {list, remoteAppVersion, appSize} = this.props;
		return (
			<div className="update-body">
				<div className="update-version">V{remoteAppVersion}</div>
				<div className="update-net-type">{window.getNetType()}</div>
				<div className="app-update-content-container">
					{list.map((value, key) => <p className="app-update-content" key={key}>{value}</p>)}
				</div>
				<div className="update-app-size">更新包大小：{appSize}</div>
			</div>
		)
	}
}

export default UpdateBody;