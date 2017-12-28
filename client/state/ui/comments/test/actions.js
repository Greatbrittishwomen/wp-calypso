/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'client/state/action-types';
import { updateCommentsQuery } from 'client/state/ui/comments/actions';

describe( 'actions', () => {
	describe( '#updateCommentsQuery()', () => {
		test( 'should return an update comments pagination action', () => {
			const siteId = 12345678;
			const postId = 1234;
			const comments = [ { ID: 1 }, { ID: 2 }, { ID: 3 }, { ID: 4 }, { ID: 5 } ];
			const query = {
				page: 1,
				postId: postId,
				search: 'foo',
				status: 'all',
			};

			const action = updateCommentsQuery( siteId, comments, query );

			expect( action ).to.eql( {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments,
				query,
			} );
		} );
	} );
} );
