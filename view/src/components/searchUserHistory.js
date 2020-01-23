import React, { Component } from 'react';
import { connect } from "react-redux";
import { searchFunc } from "../logic/searchUserHistory/index";
import NavBar from "./child/navbar";
import { HTTP_URL } from "../constants/httpRoute";
import AutoSuggest from "./child/autoSuggest"

class SearchUserHistory extends Component {
	constructor(props){
        super(props)
        this.state = {
			recordList: [],
			searchString: this.props.username,
			autoSuggestList: [],
			clickShowMoreCount: 1,
			showMoreText: "查看更多"
        }
    }

    componentDidMount(){
        if(this.props.username){
            this.setState({
                recordList: [{date: '正在查询...'}]
            }, this.searchRecord)
        }
    }

    searchRecord = (slice=30) => {
		if(!this.props.token) return alert("请先登录")
		const username = this.state.searchString ? this.state.searchString : this.props.username
        return searchFunc(username, slice)
            .then(result => {
				if(!result){
					this.setState({
						recordList: [{date: '无历史记录'}]
					})
					return;
				}
				this.signDataCount = result.totalCount
                if(this.signDataCount){
                    result = window._.orderBy(result.signData, ['date'], ['desc'])
                    this.setState({
						recordList: result || [],
						showMoreText: "查看更多"
					}, () => {
						if(this.checkBottomText){
							this.checkBottomText = false;
							if(this.signDataCount <= (30*this.state.clickShowMoreCount)){
								setTimeout(() => {
									$(".bottom").css("display", "flex");
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
			if(!this.props.token) return alert("请先登录")
			window.$('.search-input-content')[0].blur();
			this.setState({
				clickShowMoreCount: 1
			})
            return this.searchRecord()
        }
    }

    backToMainPage = () => {
        window.goRoute(this, "/search_column");
	}

	updateValue = (e) => {
		$('.search-input .ul').css({"padding": "0", "display": "none"})
		this.setState({
			searchString: e.target.value,
			autoSuggestList: []
		});
		if(!this.props.token) return;
		const query = e.target.value;
		if(!query) return;
		let list = [], self = this, timer;
		if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            getAutoSuggest();
        }, 200);
		function getAutoSuggest(){
			axios.get(HTTP_URL.signRecordTypeahead.format({query}))
				.then((msg) => {
					if (msg.data.status == "SUCCESS" && msg.data.result.response.length) {
						logger.info("signRecordTypeahead result.response", msg.data.result.response)
						$.each(msg.data.result.response, function (index, ele) {
							list.push(ele);
						});
						self.setState({
							autoSuggestList: list
						}, () => {
							$('.search-input .ul').css({"padding": "4px 8px", "display": "block"})
						})
					} else {
						if(!msg.data.result.response.length){
							self.setState({
								autoSuggestList: list
							}, () => {
								$('.search-input .ul').css({"padding": "0", "display": "none"})
							})
							return;
						}
						alert(msg.data)
					}
				})
				.catch(err => {
					logger.error("getAutoSuggest error", err.stack || err.toString())
				})
		}
	}

	blur = () => {
		//  hack first auto suggest is not clickable
		setTimeout(() => {
			$('.search-input .ul').css({"padding": "0", "display": "none"})
		}, 300)
	}

	select = (item) => {
		$('.search-input .ul').css({"padding": "0", "display": "none"})
		this.setState({
			searchString: item,
			clickShowMoreCount: 1
		}, this.searchRecord);
	}

	showMore = () => {
		let {clickShowMoreCount} = this.state;
		this.setState({
			clickShowMoreCount: ++clickShowMoreCount,
			showMoreText: "正在查询..."
		}, () => this.searchRecord(clickShowMoreCount*30))
		this.checkBottomText = true;
	}

    render(){
		const { recordList, searchString, autoSuggestList, clickShowMoreCount, showMoreText } = this.state;
        const recordListLength = recordList.length;
		const { username } = this.props;
        return (
            <div className="search-history-container">
                <NavBar centerText="搜索签到历史" backToPreviousPage={this.backToMainPage} />
                <div className="search-header">
                    <div className="search-input">
                        <input className="search-input-content" value={searchString} autoComplete="off" placeholder={username || "请输入您要搜索的用户名"}
                        	onBlur={this.blur}  onKeyDown={(event) => this.keyDownEvent(event)} onChange={this.updateValue}/>
						<div className="ul">
							{autoSuggestList.length ? autoSuggestList.map((item, key) => <AutoSuggest key={key} item={item} query={searchString} select={this.select} />) : null}
						</div>
						<i className="fa fa-search" aria-hidden="true"></i>
                    </div>
                </div>
                <div className="record-list-container">
					{recordListLength ? recordList.map((item, index) => <UserRecordList item={item} key={index}/>)  : null}
					{this.signDataCount > (30*clickShowMoreCount)
						? <div className="show-more" onClick={this.showMore}>{showMoreText}</div>
						: <div className="show-more bottom"><span>______________</span>我是有底线的<span>______________</span></div>}
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
		searchString: state.searchUserHistory.searchString,
		username: state.login.username,
		token: state.login.token
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SearchUserHistory);
