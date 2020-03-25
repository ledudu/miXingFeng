import React from 'react';
import AboutComponent from "./aboutComponent"
import { HTTP_URL } from "../../constants/httpRoute";

const Privacy = (() => {

    return (
        <AboutComponent  NavbarText="隐私声明" AboutUrl={HTTP_URL.getPrivacy} />
    );

})

export default Privacy;
