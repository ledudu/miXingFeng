import React from 'react';
import MyInfoMiddlePageComponent from "./child/myInfoMiddlePageComponent";

const itemColumns = [
	{
		displayName: "旅游相册",
		routeName: "/browser_link",
		name: '旅游相册',
		src: "https://www.zhoushoujian.com"
	},
	{
		displayName: "守俭的博客",
		routeName: "/package_iframe",
		name: '守俭的博客',
		src: "http://blog.zhoushoujian.com"
	},
	{
		displayName: "2019回忆录",
		routeName: "/package_iframe",
		name: '2019回忆录',
		src: "http://www.zhoushoujian.com/2019/",
	},
	{
		displayName: "2018回忆录",
		routeName: "/package_iframe",
		name: '2018回忆录',
		src: "http://www.zhoushoujian.com/2018/",
	},
	{
		displayName: "2017回忆录",
		routeName: "/package_iframe",
		name: '2017回忆录',
		src: "https://h.eqxiu.com/s/5LW4219f"
	},
	{
		displayName: "2016回忆录",
		routeName: "/package_iframe",
		name: '2016回忆录',
		src: "http://b.eqxiu.com/s/M1yuCsTv?eqrcode=1"
	},
]

export default class MySite extends React.Component {

    render() {
        return (
            <div className="sites-container">
				<MyInfoMiddlePageComponent
					pageName="站点"
					itemColumns={itemColumns}
					self={this}
					backToPage="about"
				/>
            </div>
        );
	}

}
