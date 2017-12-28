/** @format */
/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionHeader from 'client/extensions/woocommerce/components/action-header';
import Button from 'client/components/button';
import { clearOrderEdits, editOrder } from 'client/extensions/woocommerce/state/ui/orders/actions';
import { saveOrder } from 'client/extensions/woocommerce/state/sites/orders/actions';
import { errorNotice, successNotice } from 'client/state/notices/actions';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import {
	getCurrentlyEditingOrderId,
	getOrderEdits,
	getOrderWithEdits,
} from 'client/extensions/woocommerce/state/ui/orders/selectors';
import { isOrderUpdating } from 'client/extensions/woocommerce/state/sites/orders/selectors';
import Main from 'client/components/main';
import OrderCustomerCreate from './order-customer/create';
import OrderDetails from './order-details';
import { ProtectFormGuard } from 'client/lib/protect-form';

class Order extends Component {
	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.editOrder( siteId, {} );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( this.props.siteId !== newProps.siteId ) {
			this.props.editOrder( newProps.siteId, {} );
		}
	}

	componentWillUnmount() {
		// Removing this component should clear any pending edits
		this.props.clearOrderEdits( this.props.siteId );
	}

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { site, siteId, order, translate } = this.props;
		const onSuccess = ( dispatch, orderId ) => {
			dispatch(
				successNotice( translate( 'Order created.' ), { duration: 5000, displayOnNextPage: true } )
			);
			page.redirect( getLink( `/store/order/:site/${ orderId }`, site ) );
		};
		const onFailure = dispatch => {
			dispatch( errorNotice( translate( 'Unable to create order.' ), { duration: 5000 } ) );
		};

		this.props.saveOrder( siteId, order, onSuccess, onFailure );
	};

	render() {
		const { className, hasOrderEdits, isSaving, orderId, site, translate } = this.props;
		if ( ! orderId ) {
			return null;
		}

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>{ translate( 'New Order' ) }</span>,
		];

		return (
			<Main className={ className } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button
						key="save"
						primary
						onClick={ this.saveOrder }
						busy={ isSaving }
						disabled={ ! hasOrderEdits || isSaving }
					>
						{ translate( 'Save Order' ) }
					</Button>
				</ActionHeader>

				<div className="order__container">
					<ProtectFormGuard isChanged={ hasOrderEdits } />
					<OrderDetails orderId={ orderId } />
					<OrderCustomerCreate orderId={ orderId } />
				</div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = getCurrentlyEditingOrderId( state );
		const isSaving = isOrderUpdating( state, orderId );
		const hasOrderEdits = ! isEmpty( getOrderEdits( state ) );
		const order = getOrderWithEdits( state );

		return {
			hasOrderEdits,
			isSaving,
			order,
			orderId,
			site,
			siteId,
		};
	},
	dispatch => bindActionCreators( { clearOrderEdits, editOrder, saveOrder }, dispatch )
)( localize( Order ) );
