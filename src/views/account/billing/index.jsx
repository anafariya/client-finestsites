/***
*
*   BILLING
*   Change subscription, update card details or view past invoices.
*
**********/

import { Fragment, useContext, useState, useEffect } from 'react';
import { AuthContext, Tabs, TabsList, TabsTrigger, TabsContent, Alert, Animate, useAPI } from 'components/lib';

import { BillingPlan } from './plan';
import { PaymentMethodForm } from './payment_method';
// import { BillingInvoices } from './invoices';

export function Billing({ t, ...props }){
  
  // context
  const authContext = useContext(AuthContext);

  // state
  const [showMessage, setShowMessage] = useState(false);

  // fetch subscription
  // const subscription = useAPI('/api/account/subscription');
  // // const isPaid = authContext.user.plan !== 'free';
  
  // useEffect(() => {

  //   // subscription did load - show message?
  //   if (subscription.data && !['active', 'trialing'].includes(subscription.data.status)) 
  //     setShowMessage(true);

  // }, [subscription.data])

  return (
    <Animate>

      {/* { showMessage &&
        <Alert 
          variant={ subscription.data.status === 'requires_action' ? 'warning' : 'error' }
          title={ t(`account.billing.message.${subscription.data.status}.title`) }
          description={ t(`account.billing.message.${subscription.data.status}.description`) }
        /> } */}

      <BillingPlan 
        {...props }
        t={ t }
        // subscription={ subscription } 
        onUpdate={ () => setShowMessage(false) }/>

      {/* <PaymentMethodForm t={ t } /> */}
    </Animate>
  );
}
