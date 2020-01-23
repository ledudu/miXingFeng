import React from 'react';
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";
import PackageLists from "../child/packageLists";

class Licence extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            packageList: []
        }
    }

    componentDidMount(){
        window.axios.get(HTTP_URL.getLicence)
            .then((response) => {
                this.setState({
                    packageList: response.data.result.response.licence
                })
            })
    }

    backToMainPage = () => {
        window.goRoute(this, "/about");
    }

    render() {
        let { packageList } = this.state;
        return (
            <div id="licence-id">
				<NavBar
					centerText="开源声明"
					backToPreviousPage={this.backToMainPage}
				/>
                <div className="licence-content">
                    <div className="header">
                        <div className='header-item1'>名称</div>
                        <div className='header-item2'>许可证</div>
                        <div className='header-item3'>经过修改</div>
                    </div>
                    {packageList.map((item, index) => <PackageLists key={index} name={item.name} src={item.src} licence={item.licence} modified={item.modified} self={this}/>)}
                    <div className="licence-footer"><span>______________</span>我是有底线的<span>______________</span></div>
                </div>
            </div>
        );
    }
}

export default Licence
