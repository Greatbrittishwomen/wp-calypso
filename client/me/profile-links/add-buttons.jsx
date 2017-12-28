/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

// Internal dependencies
import Button from 'client/components/button';
import PopoverMenu from 'client/components/popover/menu';
import PopoverMenuItem from 'client/components/popover/menu-item';
import { recordGoogleEvent } from 'client/state/analytics/actions';

const AddProfileLinksButtons = createReactClass( {
	displayName: 'AddProfileLinksButtons',

	propTypes: {
		showingForm: PropTypes.bool,
		showPopoverMenu: PropTypes.bool,
	},

	getDefaultProps() {
		return {
			showingForm: false,
		};
	},

	getInitialState() {
		return {
			popoverPosition: 'top',
		};
	},

	recordClickEvent( action ) {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	},

	handleAddWordPressSiteButtonClick() {
		this.recordClickEvent( 'Add a WordPress Site Button' );
		this.props.onShowAddWordPress();
	},

	handleOtherSiteButtonClick() {
		this.recordClickEvent( 'Add Other Site Button' );
		this.props.onShowAddOther();
	},

	render() {
		return (
			<div>
				<PopoverMenu
					isVisible={ this.props.showPopoverMenu }
					onClose={ this.props.onClosePopoverMenu }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem onClick={ this.handleAddWordPressSiteButtonClick }>
						{ this.props.translate( 'Add WordPress Site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.handleOtherSiteButtonClick }>
						{ this.props.translate( 'Add URL' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button
					compact
					ref="popoverMenuButton"
					className="popover-icon"
					onClick={ this.props.onShowPopoverMenu }
				>
					<Gridicon icon="add-outline" />
					{ this.props.translate( 'Add' ) }
				</Button>
			</div>
		);
	},
} );

export default connect( null, {
	recordGoogleEvent,
} )( localize( AddProfileLinksButtons ) );
