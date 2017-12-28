/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { map, partial, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import {
	recordAction,
	recordTrackWithRailcar,
	recordTracksRailcarRender,
} from 'client/reader/stats';
import Button from 'client/components/button';
import { blockSite } from 'client/state/reader/site-blocks/actions';
import ConnectedSubscriptionListItem from 'client/blocks/reader-subscription-list-item/connected';

export class RecommendedSites extends React.PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		sites: PropTypes.array,
		followSource: PropTypes.string,
	};

	handleSiteDismiss = ( siteId, uiIndex ) => {
		recordTrackWithRailcar( 'calypso_reader_recommended_site_dismissed', this.props.railcar, {
			ui_position: uiIndex,
		} );
		recordAction( 'calypso_reader_recommended_site_dismissed' );
		this.props.blockSite( siteId );
	};

	handleSiteClick = ( siteId, uiIndex ) => {
		recordTrackWithRailcar( 'calypso_reader_recommended_site_clicked', this.props.railcar, {
			ui_position: uiIndex,
			siteId,
		} );
		recordAction( 'calypso_reader_recommended_site_clicked' );
	};

	render() {
		const { followSource } = this.props;
		const placeholders = [ {}, {} ];
		const sites = isEmpty( this.props.sites ) ? placeholders : this.props.sites;

		function recordRecommendationRender( index ) {
			return function( railcar ) {
				recordTracksRailcarRender( 'recommended_site', railcar, {
					ui_algo: 'following_manage_recommended_site',
					ui_position: index,
				} );
			};
		}

		return (
			<div className="reader-recommended-sites">
				<h1 className="reader-recommended-sites__header">
					<Gridicon icon="thumbs-up" size={ 18 } />
					{ this.props.translate( 'Recommended Sites' ) }
				</h1>
				<ul className="reader-recommended-sites__list">
					{ map( sites, ( site, index ) => {
						const siteId = site.siteId || site.blogId;
						return (
							<li
								className="reader-recommended-sites__site-list-item"
								key={ `site-rec-${ index }` }
							>
								<div className="reader-recommended-sites__recommended-site-dismiss">
									<Button
										borderless
										title={ this.props.translate( 'Dismiss this recommendation' ) }
										onClick={ partial( this.handleSiteDismiss, siteId, index ) }
									>
										<Gridicon icon="cross" size={ 18 } />
									</Button>
								</div>
								<ConnectedSubscriptionListItem
									siteId={ siteId }
									railcar={ site.railcar }
									showEmailSettings={ false }
									showLastUpdatedDate={ false }
									followSource={ followSource }
									onComponentMountWithNewRailcar={ recordRecommendationRender( index ) }
								/>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}
}

export default connect( null, { blockSite } )( localize( RecommendedSites ) );
