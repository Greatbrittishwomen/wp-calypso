/** @format */

/**
 * Internal dependencies
 */
import { POST_REVISIONS_REQUEST } from 'client/state/action-types';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
} from 'client/state/posts/revisions/actions';

/**
 * Dispatches returned error from post revisions request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Object} rawError from HTTP request
 * @returns {Object} the dispatched action
 */
export const receiveError = ( { dispatch }, { siteId, postId }, rawError ) =>
	dispatch( receivePostRevisionsFailure( siteId, postId, rawError ) );

/**
 * Dispatches returned post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Object} response from the server
 * @param {Object} response.diffs raw data containing a set of diffs for the site & post
 */
export const receiveSuccess = ( { dispatch }, { siteId, postId }, response ) => {
	dispatch( receivePostRevisionsSuccess( siteId, postId ) );
	dispatch( receivePostRevisions( { siteId, postId, ...response } ) );
};

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchPostRevisionsDiffs = ( { dispatch }, action ) => {
	const { siteId, postId, postType, comparisons } = action;
	dispatch(
		http(
			{
				apiVersion: '1.1',
				path: `/sites/${ siteId }/${ postType }/${ postId }/diffs`,
				method: 'GET',
				query: { comparisons },
			},
			action
		)
	);
};

const dispatchPostRevisionsDiffsRequest = dispatchRequest(
	fetchPostRevisionsDiffs,
	receiveSuccess,
	receiveError
);

export default {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsDiffsRequest ],
};
