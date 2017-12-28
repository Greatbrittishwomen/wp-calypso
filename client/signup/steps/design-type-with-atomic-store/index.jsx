/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { includes, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'client/signup/step-wrapper';
import Tile from 'client/components/tile-grid/tile';
import TileGrid from 'client/components/tile-grid';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'client/state/analytics/actions';
import { abtest } from 'client/lib/abtest';
import SignupActions from 'client/lib/signup/actions';
import { setDesignType } from 'client/state/signup/steps/design-type/actions';
import { DESIGN_TYPE_STORE } from 'client/signup/constants';
import PressableStoreStep from '../design-type-with-store/pressable-store';
import QueryGeo from 'client/components/data/query-geo';
import { getGeoCountryShort } from 'client/state/geo/selectors';
import { getCurrentUserCountryCode } from 'client/state/current-user/selectors';
import { getThemeForDesignType } from 'client/signup/utils';

class DesignTypeWithAtomicStoreStep extends Component {
	state = {
		showStore: false,
		pendingStoreClick: false,
	};
	setPressableStore = ref => ( this.pressableStore = ref );

	getChoices() {
		const { translate } = this.props;
		const blogText = translate(
			'To share your ideas, stories, and photographs with your followers.'
		);
		const siteText = translate(
			'To promote your business, organization, or brand and connect with your audience.'
		);
		const gridText = translate( 'To present your creative projects in a visual showcase.' );
		const storeText = translate( 'To sell your products or services and accept payments.' );

		return [
			{
				type: 'blog',
				label: translate( 'Start with a blog' ),
				description: blogText,
				image: '/calypso/images/illustrations/type-blog.svg',
			},
			{
				type: 'page',
				label: translate( 'Start with a website' ),
				description: siteText,
				image: '/calypso/images/illustrations/type-website.svg',
			},
			{
				type: 'grid',
				label: translate( 'Start with a portfolio' ),
				description: gridText,
				image: '/calypso/images/illustrations/type-portfolio.svg',
			},
			{
				type: 'store',
				label: translate( 'Start with an online store' ),
				description: storeText,
				image: '/calypso/images/illustrations/type-e-commerce.svg',
			},
		];
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	handleStoreBackClick = () => {
		this.setState( { showStore: false }, this.scrollUp );
	};

	handleChoiceClick = type => event => {
		event.preventDefault();
		event.stopPropagation();
		this.handleNextStep( type );
	};

	handleNextStep = designType => {
		if ( designType === DESIGN_TYPE_STORE && ! this.props.countryCode ) {
			// if we don't know the country code, we can't proceed. Continue after the code arrives
			this.setState( { pendingStoreClick: true } );
			return;
		}

		this.setState( { pendingStoreClick: false } );

		const themeSlugWithRepo = getThemeForDesignType( designType );

		this.props.setDesignType( designType );

		this.props.recordTracksEvent( 'calypso_triforce_select_design', { category: designType } );

		const isCountryAllowed =
			includes( [ 'US', 'CA' ], this.props.countryCode ) || process.env.NODE_ENV === 'development';

		if (
			designType === DESIGN_TYPE_STORE &&
			( abtest( 'signupAtomicStoreVsPressable' ) === 'pressable' || ! isCountryAllowed )
		) {
			this.scrollUp();

			this.setState( {
				showStore: true,
			} );

			invoke( this, 'pressableStore.focus' );

			return;
		}

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			designType,
			themeSlugWithRepo,
		} );

		// If the user chooses `store` as design type, redirect to the `store-nux` flow.
		// For other choices, continue with the current flow.
		const nextFlowName = designType === DESIGN_TYPE_STORE ? 'store-nux' : this.props.flowName;
		this.props.goToNextStep( nextFlowName );
	};

	renderChoice = choice => {
		const buttonClassName = classNames( {
			'is-busy': choice.type === DESIGN_TYPE_STORE && this.state.pendingStoreClick,
		} );

		return (
			<Tile
				buttonClassName={ buttonClassName }
				buttonLabel={ choice.label }
				description={ choice.description }
				href="#"
				image={ choice.image }
				key={ choice.type }
				onClick={ this.handleChoiceClick( choice.type ) }
			/>
		);
	};

	renderChoices() {
		const { countryCode, translate } = this.props;
		const disclaimerText = translate(
			'Not sure? Pick the closest option. You can always change your settings later.'
		); // eslint-disable-line max-len

		const storeWrapperClassName = classNames( 'design-type-with-store__store-wrapper', {
			'is-hidden': ! this.state.showStore,
		} );

		const designTypeListClassName = classNames( 'design-type-with-store__list', {
			'is-hidden': this.state.showStore,
		} );

		return (
			<div className="design-type-with-atomic-store__substep-wrapper design-type-with-store__substep-wrapper">
				{ this.state.pendingStoreClick && ! countryCode && <QueryGeo /> }
				<div className={ storeWrapperClassName }>
					<PressableStoreStep
						{ ...this.props }
						onBackClick={ this.handleStoreBackClick }
						setRef={ this.setPressableStore }
					/>
				</div>
				<div className={ designTypeListClassName }>
					<TileGrid>{ this.getChoices().map( this.renderChoice ) }</TileGrid>

					<p className="design-type-with-store__disclaimer design-type-with-atomic-store__disclaimer">
						{ disclaimerText }
					</p>
				</div>
			</div>
		);
	}

	getHeaderText() {
		const { translate } = this.props;

		if ( this.state.showStore ) {
			return translate( 'Create your WordPress Store' );
		}

		return translate( 'Hello! Let’s create your new site.' );
	}

	getSubHeaderText() {
		const { translate } = this.props;

		return translate( 'What kind of site do you need? Choose an option below:' );
	}

	componentDidUpdate( prevProps ) {
		// If geoip data arrived, check if there is a pending click on a "store" choice and
		// process it -- all data are available now to proceed.
		if ( this.state.pendingStoreClick && ! prevProps.countryCode && this.props.countryCode ) {
			this.handleNextStep( DESIGN_TYPE_STORE );
		}
	}

	render() {
		const headerText = this.getHeaderText();
		const subHeaderText = this.getSubHeaderText();

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderChoices() }
				shouldHideNavButtons={ this.state.showStore }
			/>
		);
	}
}

export default connect(
	state => ( {
		countryCode: getCurrentUserCountryCode( state ) || getGeoCountryShort( state ),
	} ),
	{
		recordTracksEvent,
		setDesignType,
	}
)( localize( DesignTypeWithAtomicStoreStep ) );
