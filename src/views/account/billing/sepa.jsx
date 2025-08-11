/***
*
*   BILLING 
*   Update card details
*
**********/

import React, { useState, useEffect } from 'react';
import { Card, PaymentForm } from 'components/lib';

export function Sepa(props){

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
            account_holder_name: {
              label: props.t('auth.signup.plan.form.account_holder_name.label'),
              type: 'text',
              required: true,
              labelClassname: 'font-normal',
              className: '!max-w-[30em]',
              value: card?.name
            },
            iban: {
              label: props.t('auth.signup.plan.form.iban.label'),
              type: 'iban',
              required: false,
              labelClassname: 'font-normal',
              className: '!max-w-[30em]',
              editable: true,
              existing_iban: card?.last4 ? `**** **** **** ${card?.last4}` : null,
            },
            prefer_payment_method: {
              type: 'radio',
              required: false,
              labelClassname: 'font-normal',
              isRow: true,
              checked: card?.prefer_payment_method || false,
              customName: 'prefer_payment_method_sepa_debit',
              options: [{
                value: true,
                label: props.t('account.billing.card.form.prefer_payment_method')
              }]
            },
          }}
          url='/api/account/sepa'
          method='PATCH'
          callback={ res => {
            props.reload()
            props.close()
          } }
          buttonText={ props.t('account.billing.card.form.button') }
          sepaForm={true}
          card={{
            existing_iban: `**** **** **** ${card?.last4 || '****'}`,
          }}
          isEdit={true}
          section="payment_method"
          isEmail={props.isEmail}
        />
      }

    </Card>
  )
}