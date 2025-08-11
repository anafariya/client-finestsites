/***
*
*   IBAN INPUT
*   Stripe iban input
*   Props are passed from the form
*
**********/

import { useContext, useState } from 'react';
import { IbanElement } from '@stripe/react-stripe-js';
import { AuthContext, Label, Error, useTranslation, Icon } from 'components/lib';
import Style from './input.tailwind.js';

export function IBANInput(props){

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const error = props.errorMessage || t('global.form.iban.error');
  const darkMode = authContext?.user?.dark_mode;
  const [isEdit, setIsEdit] = useState(false)

  const options = {

    supportedCountries: ['SEPA'],
    placeholderCountry: 'DE',
    style: {
      base: {
        fontFamily: '"Source Sans Pro", sans-serif',
        color: darkMode ? 'white' : '#334155',
        "::placeholder": {
          color: darkMode ? '#94a3b8' : '#64748b',
        },
      },
    },
  };

  return(
    <div className={ Style.input }>
      <div className="flex flex-row">
        <Label
          text={ props.label }
          required={ props.required }
          for={ props.name }
        />
        
      </div>
      <div className="flex flex-row items-center gap-2">
        {
          props.editable && props.existing_iban ? 
            isEdit ? <IbanElement className={ 'w-full' } options={ options } onChange={ e => props.onChange({ target: { name, value: e.empty ? null : {} }, type: 'change' }) } />
            : <div className="flex items-center w-full lg:w-[30em]">
                <input className="relative block w-full px-3 py-2 bg-white border border-l-[#D0D5DD] rounded-l-md focus:bg-slate-50 appearance-none disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 !max-w-[30em]" disabled readOnly value={props.existing_iban}/>
              </div>

          : <IbanElement className={ 'w-full' } options={ options } onChange={ e => props.onChange({ target: { name, value: e.empty ? null : {} }, type: 'change' }) } />
        }
        {
          props.editable && props.existing_iban &&
          <div className="flex justify-center items-center p-2 bg-slate-50 hover:bg-slate-200 rounded-md w-max cursor-pointer" onClick={() => setIsEdit(!isEdit)}>
            <Icon image={isEdit ? 'refresh-cw' : 'edit'} className={ `text-green-600 ${isEdit ? '' : 'exist-iban-number'}` }/>
          </div>
        }
        
      </div>

      {/* <Label
        text={ props.label }
        required={ props.required }
        for={ props.name }
      />

      <IbanElement className={ 'w-full' } options={ options } /> */}

      { props.valid === false && <Error message={ error }/> }

    </div>
  );
}
