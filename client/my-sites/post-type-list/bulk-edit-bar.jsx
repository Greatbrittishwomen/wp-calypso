/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Count from 'client/components/count';
import Button from 'client/components/button';
import Card from 'client/components/card';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import { isMultiSelectEnabled, getSelectedPostsCount } from 'client/state/ui/post-type-list/selectors';
import { toggleMultiSelect } from 'client/state/ui/post-type-list/actions';
import Gridicon from 'gridicons';

class PostTypeBulkEditBar extends React.Component {
	onEdit() {
		alert( 'You clicked the Edit button 😊' );
	}

	onDelete() {
		alert( 'You clicked the Delete button 😊' );
	}

	render() {
		if ( ! isEnabled( 'posts/post-type-list/bulk-edit' ) ) {
			return null;
		}

		const {
			multiSelectEnabled,
			selectedPostsCount,
			translate,
			toggleMultiSelect: onMultiSelectClick,
		} = this.props;

		if ( ! multiSelectEnabled ) {
			return null;
		}

		return (
			<Card className="post-type-list__bulk-edit-bar">
				<Count count={ selectedPostsCount } />
				<Button
					primary
					onClick={ this.onEdit }
					disabled={ selectedPostsCount === 0 }
				>
					{ translate( 'Edit' ) }
				</Button>
				<Button
					scary
					onClick={ this.onDelete }
					disabled={ selectedPostsCount === 0 }
				>
					{ translate( 'Delete' ) }
				</Button>
				<Button
					className="post-type-list__bulk-edit-bar-close"
					borderless
					onClick={ onMultiSelectClick }
				>
					<Gridicon icon="cross" />
				</Button>
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		return {
			multiSelectEnabled: isMultiSelectEnabled( state ),
			selectedPostsCount: getSelectedPostsCount( state ),
		};
	}, { toggleMultiSelect }
)( localize( PostTypeBulkEditBar ) );
