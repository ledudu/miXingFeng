import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { searchFunc, updateValueFromAutosuggest } from "../logic/common";
import NavBar from "./child/navbar";
import AutoSuggest from "./child/autoSuggest"
import InputComponent from "./child/inputComponent"

class SearchPosition extends Component {
	constructor(props){
        super(props)
        this.state = {
			positionText: props.currentLocation || '位置不可用',
			positionXY: props.currentXYPosition || [0, 0],
			oppositePositionText: "",
			oppositeXYPosition: [0, 0],
			searchString: props.token ? (props.username || props.setMobile) : "",
			autoSuggestList: [],
			isSearching: false,
			status: "在线",
			typedUsername: "",
			ulPadding: "0",
			ulDisplay: "block"
        }
    }

    componentDidMount(){
		const { token } = this.props
        if(token){
			this.searchPosition()
		}
    }

    searchPosition = () => {
		const { token, username, setMobile } = this.props
		if(!token) return alert("请先登录")
		const { searchString } = this.state
		this.setState({
			isSearching: true
		})
        return searchFunc(searchString)
            .then(result => {
				this.setState({
					positionText: result.positionText || "位置不可用",
					oppositeXYPosition: result.currentXYPosition || [0, 0],
					isSearching: false,
					status: result.status || "离线",
					typedUsername: searchString
				}, () => {
					if(username === searchString || setMobile === searchString) {
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
			this.blur()
            return this.searchPosition()
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
			ulPadding: "0",
			ulDisplay: "none"
		}, this.searchPosition);
	}

	updateBaiduMap = () => {
		let {positionText, positionXY, searchString, oppositeXYPosition} = this.state;
		let {username, currentProvince, setMobile} = this.props;
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
		if(searchString === username || searchString === setMobile){
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
		let { positionText, isSearching, searchString, autoSuggestList, status, typedUsername, ulPadding, ulDisplay } = this.state;
		let { token } = this.props;
        return (
            <div className="search-history-container">
                <NavBar centerText="搜索地理位置"  backToPreviousPage={this.backToMainPage} />
                <div className="search-header">
                    <div className="search-input">
						<InputComponent
							value={searchString}
							placeholder={token ? searchString : "请输入您要搜索的用户名"}
							handleChange={(e) => updateValueFromAutosuggest(e.target.value, this)}
							handleKeyDown={this.keyDownEvent}
							onBlur={this.blur}
							className="search-input-content"
						/>
						<div className="ul" style={{padding: ulPadding, display: ulDisplay}}>
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
		username: state.login.username,
		token: state.login.token,
		currentLocation: state.common.currentLocation,
		currentXYPosition: state.common.currentXYPosition,
		currentProvince: state.common.currentProvince,
		setMobile: state.myInfo.setMobile
	};
};

const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(SearchPosition);
