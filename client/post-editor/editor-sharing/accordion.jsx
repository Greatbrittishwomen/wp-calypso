/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'client/components/accordion';
import FormTextInput from 'client/components/forms/form-text-input';
import PostMetadata from 'client/lib/post-metadata';
import Sharing from './';
import AccordionSection from 'client/components/accordion/section';
import postUtils from 'client/lib/posts/utils';
import { isMobile } from 'client/lib/viewport';
import QueryPublicizeConnections from 'client/components/data/query-publicize-connections';
import { getCurrentUserId } from 'client/state/current-user/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPostValue } from 'client/state/posts/selectors';
import { isJetpackModuleActive } from 'client/state/sites/selectors';
import { getSiteUserConnections } from 'client/state/sharing/publicize/selectors';
import { hasBrokenSiteUserConnection, isPublicizeEnabled } from 'client/state/selectors';
import { recordGoogleEvent } from 'client/state/analytics/actions';

class EditorSharingAccordion extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		connections: PropTypes.array,
		hasBrokenConnection: PropTypes.bool,
		isPublicizeEnabled: PropTypes.bool,
		isSharingActive: PropTypes.bool,
		isLikesActive: PropTypes.bool,
	};

	getSubtitle = () => {
		const { isPublicizeEnabled, post, connections } = this.props;
		if ( ! isPublicizeEnabled || ! post || ! connections ) {
			return;
		}

		const skipped = PostMetadata.publicizeSkipped( post );

		return reduce(
			connections,
			( memo, connection ) => {
				const { keyring_connection_ID: id, label } = connection;
				if ( ! includes( skipped, id ) && ! includes( memo, label ) ) {
					memo.push( label );
				}

				return memo;
			},
			[]
		).join( ', ' );
	};

	renderShortUrl = () => {
		const classes = classNames( 'editor-sharing__shortlink', {
			'is-standalone': this.hideSharing(),
		} );

		if ( ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return (
			<div className={ classes }>
				<label className="editor-sharing__shortlink-label" htmlFor="shortlink-field">
					{ this.props.translate( 'Shortlink' ) }
				</label>
				<FormTextInput
					className="editor-sharing__shortlink-field"
					id="shortlink-field"
					value={ this.props.post.short_URL }
					size={ this.props.post.short_URL && this.props.post.short_URL.length }
					readOnly
					selectOnFocus
				/>
			</div>
		);
	};

	hideSharing = () => {
		const { isSharingActive, isLikesActive, isPublicizeEnabled } = this.props;
		return ! isSharingActive && ! isLikesActive && ! isPublicizeEnabled;
	};

	render() {
		const hideSharing = this.hideSharing();
		const classes = classNames( 'editor-sharing__accordion', this.props.className, {
			'is-loading': ! this.props.post || ! this.props.connections,
		} );

		// if sharing is hidden, and post is not published (no short URL yet),
		// then do not render this accordion
		if ( hideSharing && ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		let status;
		if ( this.props.hasBrokenConnection ) {
			status = {
				type: 'warning',
				text: this.props.translate( 'A broken connection requires repair', {
					comment: 'Publicize connection deauthorized, needs user action to fix',
				} ),
				url: `/sharing/${ this.props.site.slug }`,
				position: isMobile() ? 'top left' : 'top',
				onClick: this.props.onStatusClick,
			};
		}

		return (
			<Accordion
				title={ this.props.translate( 'Sharing' ) }
				subtitle={ this.getSubtitle() }
				status={ status }
				className={ classes }
				e2eTitle="sharing"
			>
				{ this.props.site && <QueryPublicizeConnections siteId={ this.props.site.ID } /> }
				<AccordionSection>
					{ ! hideSharing && <Sharing site={ this.props.site } post={ this.props.post } /> }
					{ this.renderShortUrl() }
				</AccordionSection>
			</Accordion>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const isSharingActive = false !== isJetpackModuleActive( state, siteId, 'sharedaddy' );
		const isLikesActive = false !== isJetpackModuleActive( state, siteId, 'likes' );

		return {
			connections: getSiteUserConnections( state, siteId, userId ),
			hasBrokenConnection: hasBrokenSiteUserConnection( state, siteId, userId ),
			isSharingActive,
			isLikesActive,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
		};
	},
	{
		onStatusClick: () => recordGoogleEvent( 'Editor', 'Clicked Accordion Broken Status' ),
	}
)( localize( EditorSharingAccordion ) );
