/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hasNavigated } from 'client/state/selectors';
import { ROUTE_SET } from 'client/state/action-types';

describe( 'hasNavigated()', () => {
	test( 'should return false if only one ROUTE_SET has occurred', () => {
		const state = { ui: { actionLog: [ { type: ROUTE_SET, path: 'a' } ] } };

		expect( hasNavigated( state ) ).to.be.false;
	} );

	test( 'should return true if more than one ROUTE_SET has occurred', () => {
		const state = {
			ui: { actionLog: [ { type: ROUTE_SET, path: 'a' }, { type: ROUTE_SET, path: 'b' } ] },
		};

		expect( hasNavigated( state ) ).to.be.true;
	} );
} );
