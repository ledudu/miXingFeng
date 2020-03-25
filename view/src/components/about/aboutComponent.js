import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import NavBar from "../child/navbar"
import Loading from "../child/loading"
import PackageLists from "../child/packageLists"
import { networkErr } from "../../services/utils"

const AboutComponent = (({ NavbarText, AboutUrl }) => {

	const history = useHistory()
	function backToMainPage(){
		history.push("/about")
	}

	const [ bodyContent, setBodyContent ] = useState("")

	useEffect(() => {
		axios.get(AboutUrl)
			.then((response) => {
				if(NavbarText==="开源声明"){
					setBodyContent(response.data.result.response.licence || [])
				} else {
					setBodyContent(response.data.result.response || "")
				}
			})
			.catch(err => {
				return networkErr(err, "AboutComponent")
			})
	}, [])

    return (
        <div id={NavbarText==="开源声明" ? "licence-id" : "privacy-statement"}>
            <NavBar centerText={NavbarText} backToPreviousPage={backToMainPage} />
			{
				bodyContent
				?	NavbarText==="开源声明"
				?	<div className="licence-content">
						<div className="header">
							<div className='header-item1'>名称</div>
							<div className='header-item2'>许可证</div>
							<div className='header-item3'>经过修改</div>
						</div>
						{bodyContent.map((item, index) => <PackageLists key={index} name={item.name} src={item.src} licence={item.licence} modified={item.modified} self={this}/>)}
						<div className="licence-footer"><span>______________</span>我是有底线的<span>______________</span></div>
					</div>
				:	<div className="user-agreement-content" dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
				:	<Loading/>
			}
        </div>
    );

})

export default AboutComponent;
