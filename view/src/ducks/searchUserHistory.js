//actionType
const SEARCH_STRING = "searchUserHistory/searchString";

// initialSate
const initialState = () => ({
	searchString: ""
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case SEARCH_STRING:
			return Object.assign({}, state, {
				searchString: action.data
			});
		default:
			return state;
	}
}

// update
export const updateSearchString = data => ({
	type: SEARCH_STRING,
	data
});
