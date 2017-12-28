/** @format */
/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'client/state/action-types';
import { createReduxStore, reducer } from 'client/state';

describe( 'persistence', () => {
	test( 'initial state should serialize and deserialize without errors or warnings', () => {
		const consoleErrorSpy = jest
			.spyOn( global.console, 'error' )
			.mockImplementation( () => () => {} );
		const consoleWarnSpy = jest
			.spyOn( global.console, 'warn' )
			.mockImplementation( () => () => {} );

		const initialState = createReduxStore().getState();

		reducer( reducer( initialState, { type: SERIALIZE } ), { type: DESERIALIZE } );

		expect( consoleErrorSpy ).not.toHaveBeenCalled();
		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );
} );
