import React, { Component } from 'react';
import { connect } from "react-redux";
import { searchFunc, updateValueFromAutosuggest } from "../logic/common";
import NavBar from "./child/navbar";
import AutoSuggest from "./child/autoSuggest"

class SearchUserHistory extends Component {
	constructor(props){
        super(props)
        this.state = {
			recordList: [],
			searchString: props.token ? (props.username || props.setMobile) : "",
			autoSuggestList: [],
			clickShowMoreCount: 1,
			showMoreText: "查看更多",
			ulPadding: "0",
			ulDisplay: "block"
        }
    }

    componentDidMount(){
		const { token } = this.props
        if(token){
            this.setState({
                recordList: [{date: '正在查询...'}]
			})
			this.searchRecord()
        }
    }

    searchRecord = (slice=30) => {
		if(!this.props.token) return alert("请先登录")
		const { searchString } = this.state
        return searchFunc(searchString, slice)
            .then(result => {
				if(!result){
					this.setState({
						recordList: [{date: '无历史记录'}]
					})
					return;
				}
				this.signDataCount = result.totalCount
                if(this.signDataCount){
                    result = _.orderBy(result.signData, ['date'], ['desc'])
                    this.setState({
						recordList: result || [],
						showMoreText: "查看更多"
					}, () => {
						if(this.checkBottomText){
							this.checkBottomText = false;
							if(this.signDataCount <= (30*this.state.clickShowMoreCount)){
								setTimeout(() => {
									this.historyBottom.style.display = "flex"
								})
							}
						}
					})
                } else {
					this.setState({
						recordList: [{date: '无历史记录'}]
					})
				}
            })
    }

    keyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			this.blur()
			if(!this.props.token) return alert("请先登录")
			this.setState({
				clickShowMoreCount: 1
			})
            return this.searchRecord()
        }
    }

    backToMainPage = () => {
        window.goRoute(this, "/search_column");
	}

	blur = () => {
		//  hack first auto suggest is not clickable
		setTimeout(() => {
			this.setState({
				ulPadding: "0",
				ulDisplay: "none"
			});
		}, 300)
	}

	select = (item) => {
		this.setState({
			searchString: item,
			clickShowMoreCount: 1,
			ulPadding: "0",
			ulDisplay: "none"
		}, this.searchRecord); // 先更新searchString后才能搜索，否则取不到点击autosuggest的值
	}

	showMore = () => {
		let { clickShowMoreCount } = this.state;
		this.setState({
			clickShowMoreCount: ++clickShowMoreCount,
			showMoreText: "正在查询..."
		})
		this.searchRecord(clickShowMoreCount*30)
		this.checkBottomText = true;
	}

    render(){
		const { recordList, searchString, autoSuggestList, clickShowMoreCount, showMoreText, ulPadding, ulDisplay } = this.state;
        const recordListLength = recordList.length;
		const { username, token } = this.props;
        return (
            <div className="search-history-container">
                <NavBar centerText="搜索签到历史" backToPreviousPage={this.backToMainPage} />
                <div className="search-header">
                    <div className="search-input">
						<input
							className="search-input-content"
							value={searchString}
							autoComplete="off"
							placeholder={token ? username : "请输入您要搜索的用户名"}
							onBlur={this.blur}
							onKeyDown={this.keyDownEvent}
							onChange={(e) => updateValueFromAutosuggest(e.target.value, this)}
						/>
						<div className="ul" style={{padding: ulPadding, display: ulDisplay}}>
							{autoSuggestList.length ? autoSuggestList.map((item, key) => <AutoSuggest key={key} item={item} query={searchString} select={this.select} />) : null}
						</div>
						<i className="fa fa-search" aria-hidden="true"></i>
                    </div>
                </div>
                <div className="record-list-container">
					{recordListLength ? recordList.map((item, index) => <UserRecordList item={item} key={index}/>)  : null}
					{
						this.signDataCount > (30*clickShowMoreCount)
						? <div className="show-more" onClick={this.showMore}>{showMoreText}</div>
						: <div className="show-more bottom" ref={ref => this.historyBottom = ref}><span>______________</span>我是有底线的<span>______________</span></div>
					}
                </div>
            </div>
        )
    }
};

class UserRecordList extends Component {
    render() {
        const { item } = this.props;
        return (
            <div className="record-container">
                <div className="date-record">{item.date}</div>
                <div className="location-record">{item.location}</div>
            </div>
        )
    }
}


const mapStateToProps = state => {
	return {
		username: state.login.username,
		token: state.login.token,
		setMobile: state.myInfo.setMobile
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SearchUserHistory);
