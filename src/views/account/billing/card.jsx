/***
*
*   BILLING 
*   Update card details
*
**********/

import React, { useState, useEffect } from 'react';
import { Card, PaymentForm } from 'components/lib';

export function BillingCard(props){

  const [card, setCard] = useState(null);

  useEffect(() => {

    setCard(props.datas)

  }, [props.datas])

  return (
    <Card restrictWidth loading={ props.loading } className={ `${props.className} px-0` }>
      {
        !props.loading &&
        <PaymentForm
          className='restrict-width'
          inputs={{
            credit_card_name: {
              label: props.t('account.billing.card.form.name_on_card'),
              type: 'text',
              required: true,
              labelClassname: 'font-normal',
              className: '!max-w-[30em]',
              value: card?.name
            },
            token: {
              label: props.t('account.billing.card.form.token'),
              type: 'creditcard',
              required: false,
              labelClassname: 'font-normal',
              className: '!max-w-[30em]',
              editable: true,
              existing_card: `**** **** **** ${card?.last4 || '****'}`,
              existing_exp_month: card?.exp_month,
              existing_exp_year: card?.exp_year
            },
            prefer_payment_method: {
              type: 'radio',
              required: false,
              labelClassname: 'font-normal',
              isRow: true,
              checked: card?.prefer_payment_method,
              customName: 'prefer_payment_method_card',
              options: [{
                value: true,
                label: props.t('account.billing.card.form.prefer_payment_method')
              }]
            },
          }}
          url='/api/account/card'
          method='PATCH'
          callback={ res => {
            props.reload()
            props.close()
          } }
          buttonText={ props.t('account.billing.card.form.button') }
          card={{
            existing_card: `**** **** **** ${card?.last4 || '****'}`,
            existing_exp_month: card?.exp_month,
            existing_exp_year: card?.exp_year
          }}
          isEdit={true}
          section="payment_method"
        />
      }

    </Card>
  )
}