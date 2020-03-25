import React from 'react';
import AboutComponent from "./aboutComponent"
import { HTTP_URL } from "../../constants/httpRoute";

const UserAgreement = (() => {

    return (
        <AboutComponent  NavbarText="用户协议" AboutUrl={HTTP_URL.getUserAgreement} />
    );

})

export default UserAgreement;
