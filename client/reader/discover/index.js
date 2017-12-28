/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import {
	initAbTests,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'client/reader/controller';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	page(
		'/discover',
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		discover,
		makeLayout,
		clientRender
	);
}
