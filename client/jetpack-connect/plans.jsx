/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'client/components/logged-out-form/links';
import Placeholder from './plans-placeholder';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import QueryPlans from 'client/components/data/query-plans';
import QuerySitePlans from 'client/components/data/query-site-plans';
import { addItem } from 'client/lib/upgrades/actions';
import { clearPlan, isCalypsoStartedConnection, retrievePlan } from './persistence-utils';
import { completeFlow, goBackToWpAdmin } from 'client/state/jetpack-connect/actions';
import { getCurrentUser } from 'client/state/current-user/selectors';
import { getPlanBySlug } from 'client/state/plans/selectors';
import { getSelectedSite } from 'client/state/ui/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'client/state/sites/selectors';
import { mc } from 'client/lib/analytics';
import { PLAN_JETPACK_FREE } from 'client/lib/plans/constants';
import { recordTracksEvent } from 'client/state/analytics/actions';
import {
	canCurrentUser,
	hasInitializedSites,
	isRtl,
	isSiteAutomatedTransfer,
} from 'client/state/selectors';

const CALYPSO_PLANS_PAGE = '/plans/';
const CALYPSO_REDIRECTION_PAGE = '/posts/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	static propTypes = {
		queryRedirect: PropTypes.string,

		// Connected props
		hasPlan: PropTypes.bool, // null indicates unknown
		isAutomatedTransfer: PropTypes.bool, // null indicates unknown
	};

	redirecting = false;

	componentDidMount() {
		this.maybeRedirect();
		if ( ! this.redirecting ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId,
			} );
		}
	}

	componentDidUpdate() {
		if ( ! this.redirecting ) {
			this.maybeRedirect();
		}
	}

	maybeRedirect() {
		if ( this.props.isAutomatedTransfer ) {
			this.props.goBackToWpAdmin( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
		}
		if ( this.props.selectedPlan ) {
			this.selectPlan( this.props.selectedPlan );
		}
		if ( this.props.hasPlan || this.props.notJetpack ) {
			this.redirect( CALYPSO_PLANS_PAGE );
		}
		if ( ! this.props.selectedSite && this.props.isSitesInitialized ) {
			// Invalid site
			this.redirect( '/jetpack/connect/plans' );
		}
		if ( ! this.props.canPurchasePlans ) {
			if ( this.props.calypsoStartedConnection ) {
				this.redirect( CALYPSO_REDIRECTION_PAGE );
			} else {
				this.redirectToWpAdmin();
			}
		}
	}

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.selectFreeJetpackPlan();
	};

	handleHelpButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	redirectToWpAdmin() {
		const { queryRedirect } = this.props;
		if ( queryRedirect ) {
			this.props.goBackToWpAdmin( queryRedirect );
			this.redirecting = true;
			this.props.completeFlow();
		} else if ( this.props.selectedSite ) {
			this.props.goBackToWpAdmin( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
			this.redirecting = true;
			this.props.completeFlow();
		}
	}

	redirect( path ) {
		page.redirect( path + this.props.selectedSiteSlug );
		this.redirecting = true;
		this.props.completeFlow();
	}

	selectFreeJetpackPlan() {
		clearPlan();
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_free' );

		if ( this.props.calypsoStartedConnection ) {
			this.redirect( CALYPSO_REDIRECTION_PAGE );
		} else {
			this.redirectToWpAdmin();
		}
	}

	selectPlan = cartItem => {
		clearPlan();

		if ( ! cartItem || cartItem.product_slug === PLAN_JETPACK_FREE ) {
			return this.selectFreeJetpackPlan();
		}

		if ( cartItem.product_slug === get( this.props, 'selectedSite.plan.product_slug', null ) ) {
			return this.redirect( CALYPSO_PLANS_PAGE );
		}

		this.props.recordTracksEvent( 'calypso_jpc_plans_submit', {
			user: this.props.userId,
			product_slug: cartItem.product_slug,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', cartItem.product_slug );

		addItem( cartItem );
		this.props.completeFlow();
		this.redirect( '/checkout/' );
	};

	shouldShowPlaceholder() {
		return (
			this.redirecting ||
			this.props.selectedPlanSlug ||
			false !== this.props.notJetpack ||
			! this.props.canPurchasePlans ||
			false !== this.props.hasPlan ||
			false !== this.props.isAutomatedTransfer
		);
	}

	render() {
		const { interval, isRtlLayout, selectedSite, translate } = this.props;

		if ( this.shouldShowPlaceholder() ) {
			return (
				<Fragment>
					<QueryPlans />
					<Placeholder />
				</Fragment>
			);
		}

		const helpButtonLabel = translate( 'Need help?' );

		return (
			<Fragment>
				<QueryPlans />
				{ selectedSite && <QuerySitePlans siteId={ selectedSite.ID } /> }
				<PlansGrid
					basePlansPath={ '/jetpack/connect/plans' }
					onSelect={ this.selectPlan }
					hideFreePlan={ true }
					isLanding={ false }
					interval={ interval }
					selectedSite={ selectedSite }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } isRtl={ isRtlLayout } />
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton
							label={ helpButtonLabel }
							eventName="calypso_jpc_plans_chat_initiated"
						>
							<HelpButton onClick={ this.handleHelpButtonClick } label={ helpButtonLabel } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</Fragment>
		);
	}
}

export { Plans as PlansTestComponent };

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteSlug = selectedSite ? selectedSite.slug : '';

		const selectedPlanSlug = retrievePlan();
		const selectedPlan = getPlanBySlug( state, selectedPlanSlug );

		return {
			calypsoStartedConnection: isCalypsoStartedConnection( selectedSiteSlug ),
			canPurchasePlans: selectedSite
				? canCurrentUser( state, selectedSite.ID, 'manage_options' )
				: true,
			hasPlan: selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null,
			isAutomatedTransfer: selectedSite ? isSiteAutomatedTransfer( state, selectedSite.ID ) : null,
			isRtlLayout: isRtl( state ),
			isSitesInitialized: hasInitializedSites( state ),
			notJetpack: selectedSite ? ! isJetpackSite( state, selectedSite.ID ) : null,
			selectedPlan,
			selectedPlanSlug,
			selectedSite,
			selectedSiteSlug,
			userId: user ? user.ID : null,
		};
	},
	{
		completeFlow,
		goBackToWpAdmin,
		recordTracksEvent,
	}
)( localize( Plans ) );
