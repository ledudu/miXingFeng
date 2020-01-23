import Loadable from 'react-loadable';
import React from 'react';
import Loading from "./components/child/loading"

export default function MyLoadable(opts) {
	return Loadable(Object.assign({
		loading: LoadingFunc,
		delay: 200,
		timeout: 10000,
	}, opts));
};

function LoadingFunc(props) {
    if (props.error) {
		return <div>Error! <button onClick={ props.retry }>Retry</button></div>;
    } else if (props.timedOut) {
		return <div>Taking a long time... <button onClick={ props.retry }>Retry</button></div>;
    } else if (props.pastDelay) {
		return <Loading />;
    } else {
		return null;
    }
}
