import React from 'react';
import { connect } from "react-redux";
import { HTTP_URL } from "../constants/httpRoute";
import NavBar from "./child/navbar";
import { updateOnlinePersonsName, updateOnlinePersons } from "../ducks/sign"
import { networkErr } from "../services/utils"
import { checkOnlinePersons } from "../logic/common"

class ShowOnlinePersons extends React.Component {

	constructor(props){
		super(props)
		this.state={
			onlinePersonsName: this.props.onlinePersonsName || [],
			isSearching: true
		}
	}

    componentDidMount(){
		checkOnlinePersons()
		return axios.get(HTTP_URL.getOnlinePersons)
			.then(response => {
				let result = response.data.result.response;
				this.setState({
					onlinePersonsName: result
				})
				$dispatch(updateOnlinePersonsName(result))
				$dispatch(updateOnlinePersons(result.length));
				this.setState({
					isSearching: false
				})
			})
			.catch(function(error) {
        	    networkErr(error);
        	})
    }

    backToMainPage = () => {
        window.goRoute(this, "/main/sign");
    }

    render() {
		const { onlinePersonsName, isSearching } = this.state
        return (
            <div className="online-persons-name-container">
                <NavBar centerText="在线成员" backToPreviousPage={this.backToMainPage} />
                <div className="online-persons-name-content">
					{isSearching
					? <div className="searching">正在查询...</div>
					: onlinePersonsName.map((item, index) => <span key={item.username} className={item.origin || 'h5'}>{item.username + (index === onlinePersonsName.length-1 ? "" : `, `)}</span>)}
				</div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		onlinePersonsName: state.sign.onlinePersonsName
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ShowOnlinePersons);
