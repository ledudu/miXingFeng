import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "俄罗斯方块",
		routeName: "/package_iframe",
		name: '俄罗斯方块',
		src: "./games/teris/index.html",
	},
	{
		displayName: "五子棋",
		routeName: "/package_iframe",
		name: '五子棋',
		src: "./games/gobang/index.html",
	},
	{
		displayName: "2048",
		routeName: "/package_iframe",
		name: '2048小游戏',
		src: "./games/js_game_2048/index.html",
	},
	{
		displayName: "spacecraft",
		routeName: "/package_iframe",
		name: 'spacecraft',
		src: "./games/spacecraft/index.html",
	},
	{
		displayName: "SSR",
		routeName: "/package_iframe",
		name: '摘苹果-SSR',
		src: "http://129.226.77.79:8002/"
	},
	{
		displayName: "RPC",
		routeName: "/type_shell"
	}
]

class SearchColumn extends React.Component {

	render() {
        return (
            <div className="sites-container">
				<SquareMiddlePageComponent
					pageName="游戏"
					itemColumns={itemColumns}
					self={this}
				/>
				<div className="teteris-info">俄罗斯方块开源地址: <br/>
				https://github.com/chvin/react-tetris</div>
            </div>
        );
	}
}

export default SearchColumn;
