import React from 'react';
import AboutComponent from "./aboutComponent"
import { HTTP_URL } from "../../constants/httpRoute";

const ServiceList = (() => {
    return (
        <AboutComponent  NavbarText="服务条款" AboutUrl={HTTP_URL.getServiceList} />
    );

})

export default ServiceList;
