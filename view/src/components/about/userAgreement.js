import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { HTTP_URL } from "../../constants/httpRoute";
import NavBar from "../child/navbar";

const UserAgreement = (() => {
	const history = useHistory()
	function backToMainPage(){
		history.push("/about")
	}
	const [ bodyContent, setBodyContent ] = useState("")
	useEffect(() => {
		axios.get(HTTP_URL.getUserAgreement)
			.then((response) => {
				setBodyContent(response.data.result.response)
			})
	}, [])
    return (
        <div id="user-agreement">
            <NavBar centerText="用户协议" backToPreviousPage={backToMainPage} />
            <div className="user-agreement-content" dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
        </div>
    );

})

export default UserAgreement;
