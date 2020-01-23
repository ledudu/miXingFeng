import React from 'react';
import { openBrowserLink } from "../../services/utils"

class PackageLists extends React.Component {

    render() {
        let { name, licence, modified, src} = this.props;
        return (
            <div className="licence-line">
                <div className='licence-row1' onClick={openBrowserLink.bind(null, src)}>{name}</div>
                <div className='licence-row2'>{licence}</div>
                <div className='licence-row3'>{modified}</div>
            </div>
        )
    }
}

export default PackageLists;
