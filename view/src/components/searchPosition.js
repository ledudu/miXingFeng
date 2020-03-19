import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { searchFunc } from "../logic/searchUserHistory/index";
import NavBar from "./child/navbar";
import { HTTP_URL } from "../constants/httpRoute";
import AutoSuggest from "./child/autoSuggest"
import { networkErr } from "../services/utils"

class SearchPosition extends Component {
	constructor(props){
        super(props)
        this.state = {
			positionText: props.currentLocation || '位置不可用',
			positionXY: props.currentXYPosition || [0, 0],
			oppositePositionText: "",
			oppositeXYPosition: [0, 0],
			searchString: props.token ? props.username : "",
			autoSuggestList: [],
			isSearching: false,
			status: "在线",
			typedUsername: ""
        }
    }

    componentDidMount(){
        if(this.props.username){
			this.searchPosition()
		} else {
			this.setState({
				positionText: "",
				status: ""
			})
		}
    }

    searchPosition = () => {
		if(!this.props.token) return alert("请先登录")
		const { searchString } = this.state
		this.setState({
			isSearching: true
		})
		const username = searchString || this.props.username
        return searchFunc(username)
            .then(result => {
				this.setState({
					positionText: result.positionText || "位置不可用",
					oppositeXYPosition: result.currentXYPosition || [0, 0],
					isSearching: false,
					status: result.status,
					typedUsername: username
				}, () => {
					if(this.props.username === searchString) {
						this.updateBaiduMap()
					} else {
						if(result.positionText && result.positionText !== "位置不可用" && result.currentXYPosition && result.currentXYPosition[0] !== 0){
							this.updateBaiduMap()
						}
					}
				})
			})
			.catch(err => {
                networkErr(err, `searchPosition searchString:${searchString}`);
            })
    }

    keyDownEvent = (evt) => {
        var e = evt;
        if (e.keyCode === 13) {
			if(!this.props.token) return alert("请先登录")
			window.$('.search-input-content')[0].blur();
            return this.searchPosition()
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
        }, 500);
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
					logger.error("SearchPosition getAutoSuggest error", err.stack || err.toString())
					return networkErr(err, `SearchPosition getAutoSuggest query: ${query}`);
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
			searchString: item
		}, this.searchPosition);
	}

	updateBaiduMap = () => {
		let {positionText, positionXY, searchString, oppositeXYPosition} = this.state;
		let {username, currentProvince} = this.props;
		if(positionXY[0] === 0 && positionXY[1] === 0) {
			if(oppositeXYPosition[0] !== 0 && oppositeXYPosition[1] !== 0){  //user has no position, opposite has position
				username = searchString
				positionXY = oppositeXYPosition
			} else {
				return  //both have no position or user has no location
			}
		}
		if(positionXY[0] !== 0 && positionXY[1] !== 0 && oppositeXYPosition[0] !== 0 && oppositeXYPosition[1] !== 0){  // if distance is not far,just use one position
			if((Math.abs(positionXY[0] - oppositeXYPosition[0]) < 0.0001) || (Math.abs(positionXY[1] - oppositeXYPosition[1]) < 0.00005)){
				username = searchString
				positionXY = oppositeXYPosition
			}
		}
		let map = new BMap.Map('map_canvas');
		map.enableScrollWheelZoom();
		if(searchString === username){
			const point = new BMap.Point(positionXY[0], positionXY[1]);
			map.centerAndZoom(point, 12);
			var myGeo = new BMap.Geocoder();
			myGeo.getPoint(positionText, function (point) {
				if (point) {
					map.centerAndZoom(point, 16);
					map.addOverlay(new BMap.Marker(point));
				} else {
					alert("您选择地址没有解析到结果!");
				}
			}, currentProvince);
		} else {
    		let drv = new BMap.DrivingRoute(currentProvince, {
    		    onSearchComplete: function(res) {
    		        if (drv.getStatus() == BMAP_STATUS_SUCCESS) {
    		            let plan = res.getPlan(0);
    		            let arrPois =[];
    		            for(let j=0; j<plan.getNumRoutes(); j++){
    		                let route = plan.getRoute(j);
    		                arrPois= arrPois.concat(route.getPath());
    		            }
    		            map.addOverlay(new BMap.Polyline(arrPois, {strokeColor: '#111'}));
    		            map.setViewport(arrPois);
    		        }
    		    }
    		});
    		let start=new BMap.Point(positionXY[0], positionXY[1]);
			let end=new BMap.Point(oppositeXYPosition[0], oppositeXYPosition[1]);
			drv.search(start, end);
		}
	}

    render(){
		let { positionText, isSearching, searchString, autoSuggestList, status, typedUsername} = this.state;
		let { username, token } = this.props;
        return (
            <div className="search-history-container">
                <NavBar centerText="搜索地理位置"  backToPreviousPage={this.backToMainPage} />
                <div className="search-header">
                    <div className="search-input">
                        <input className="search-input-content" value={searchString} autoComplete="off" placeholder={token ? username : "请输入您要搜索的用户名"}
                            onBlur={this.blur}  onKeyDown={(event) => this.keyDownEvent(event)} onChange={this.updateValue}/>
						<div className="ul">
							{autoSuggestList.length ? autoSuggestList.map((item, key) => <AutoSuggest key={key} item={item} query={searchString} select={this.select} />) : null}
						</div>
						<i className="fa fa-search" aria-hidden="true"></i>
                    </div>
                </div>
                <div className="search-position-container">
					{isSearching
					? searchString && <div className="searching">正在查询...</div>
					: <div className="search-position-content">
						<div className="search-string">用户名：{typedUsername}</div>
						<div className="user-status">状态：{status}</div>
						<div className="position-text">位置：{positionText}</div>
					</div>}
                </div>
				{!isSearching && <Fragment><div id="map_canvas"></div><div id="result"></div></Fragment>}
            </div>
        )
    }
};

const mapStateToProps = state => {
	return {
		searchString: state.searchUserHistory.searchString,
		username: state.login.username,
		token: state.login.token,
		currentLocation: state.common.currentLocation,
		currentXYPosition: state.common.currentXYPosition,
		currentProvince: state.common.currentProvince
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchPosition);
