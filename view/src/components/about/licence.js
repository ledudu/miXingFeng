import React from 'react';
import AboutComponent from "./aboutComponent"
import { HTTP_URL } from "../../constants/httpRoute";

const Licence = () => {
	return (
        <AboutComponent NavbarText="开源声明" AboutUrl={HTTP_URL.getLicence} />
    );
}

export default Licence
