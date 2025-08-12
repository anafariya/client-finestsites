/***
*
*   FORM
*   Self-validating form that accepts an object for inputs
*
*   DOCS
*   https://docs.usegravity.app/gravity-web/components/form
*   https://ui.shadcn.com/docs/components/form
*
*   PROPS
*   buttonText: submit button text (string, required)
*   callback: function executed on successful submit (function, optional)
*   cancel: cancel callback - renders a cancel button (boolean, optional)
*   className: custom styling (SCSS or tailwind style, optional)
*   destructive: set submit button color to red (boolean, optional)
*   inputs: object containing the form inputs (object, required)
*   method: HTTP request type (string, optional)
*   onChange: callback function executed on change in ...props (boolean, optional)
*   redirect: url to redirect to after a successful submit (string, optional)
*   submitOnChange: submit the form on each change (boolean, optional)
*   url: url to post the form to (string, optional)
*
**********/

import { useState, useEffect, useContext, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Axios from 'axios';

import { Label, Error, Description, Icon, Button, 
  ViewContext, useNavigate, cn, useTranslation } from 'components/lib'

import { CardElement, IbanElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Inputs from './input/map'

function Form({ inputs, url, method, submitOnChange, callback, redirect, className, buttonText, 
  destructive, cancel, ...props }){

  const { control, handleSubmit, setValue, setError, trigger, unregister, watch,
    formState: { errors, touchedFields } 
  } = useForm({ mode: 'onBlur' });  

  const viewContext = useContext(ViewContext);
  const [loading, setLoading] = useState(false);
  const [fileStore, setFileStore] = useState([]);
  const [form, setForm] = useState(null);
  const [initialised, setInitialised] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    function init() {

      let data = {...props.inputs };
      
      // form has not been set - init
      if (!initialised){
        setInitialised(true);
        setForm(data);
  
      }
      else if (initialised){
  
        setForm(f => {
          const data = { ...f, ...props.inputs };
  
          if(f){
            // cleanup inputs that were removed
            for (const key in f){
              if(props.isEdit){
                if(f[key]?.value !== undefined && (f[key]?.value !== props.inputs[key]?.value)){
                  data[key].value = f[key].value
                }
              }
              if (!props.inputs.hasOwnProperty(key))
                delete data[key];
    
            }
          }
          return data;
  
        });
      }
    }

    const timer = setTimeout(() => {
      init()
    }, 20);

    return () => clearTimeout(timer);
    
  }, [props, initialised, props.inputs]);

  // init default values
  useEffect(() => {

    inputs && Object.keys(inputs).length &&
    Object.keys(inputs).forEach(key => {

      const input = inputs[key];

      if (!watch(key)) {
        setValue(key, input.defaultValue || input.value);
      }

    });
  }, [setValue, inputs]);

  // handle external inputs prop change
  useEffect(() => {

    inputs && Object.keys(inputs).length &&
    Object.keys(inputs).forEach(key => {

      // unregister input if it's hidden
      if (inputs[key].type === null)
        unregister(key);

    });
  }, [inputs]);

  // watch for changes
  useEffect(() => {

    const subscription = watch(async (data) => {

      // uncomment me to watch changes
      // console.log('watch', data);
      
      if (submitOnChange)
        handleSubmit(submit)();

    });

    return () => subscription.unsubscribe();
      
  }, [handleSubmit, watch]);

    useEffect(() => {
    if(props.customBtnTrigger > 0){
      const submitButton = document.getElementsByClassName('submit-form')[0];
      submitButton?.click();
    }
  }, [props.customBtnTrigger])

  const onChange = useCallback(async (e, field) => {
    // internal handler
    field.onChange(e) 
    
    // external handler to react to input changes
    if (props.onChange){

      const valid = await trigger(field.name); // validate field
      props.onChange({ input: field.name, value: e.target.value, valid: valid });

    }
  }, [props.onChange]);

  const submit = useCallback(async (data) => {
    let data2 = {...form };
    console.log('submit.data', data, data2)
    const valid = await trigger();
    let ibanElement, cardElement;
    console.log(valid, 'valid');
    
    // validate
    if (!valid){

      setLoading(false);
      return false;

    }

    // no url - use callback instead of action
    if (!url)
      return callback?.(null, data);

    // start loading
    setLoading(true);
  
    try {

      let headers, payload;

      // generate a credit card token 
      if (data.token){

        cardElement = props.elements.getElement(CardElement);
        const { token } = await props.stripe.createToken(cardElement);
        data.token = token

      }

      // handle files
      if (Object.values(data).some(value => value instanceof FileList)){

        // prepare form data for file upload
        headers = { 'Content-Type': 'multipart/form-data' };
        payload = new FormData();

        Object.keys(data).forEach(key => {

          data[key] instanceof FileList ? 
            Array.from(data[key]).forEach(file => payload.append(key, file)) : 
            payload.append(key, data[key]);

        });
      } 
      else {

        // prepare json payload for non file forms
        headers = { 'Content-Type': 'application/json' };
        if(props.account){
          data.account = true
        }
        payload = JSON.stringify(data);

      }

      let currentToken;
      let attach;
      if(props.sepaForm){
        payload = JSON.parse(payload)
        payload.sepaForm = true
        const useExisting = document.querySelector('.exist-iban-number');
        if(useExisting){
          payload.useExisting = true;
          payload.billing_details = {
            email: form.email?.value,
            name: form.account_holder_name?.value,
            address: {
              line1: form.street?.value,
              city: form.city?.value,
              postal_code: form.state_2?.value,
              country: form.country?.value,
              state: form.state?.value,
            }
          }
        } else {
          ibanElement = await props.elements.getElement(IbanElement);
          
          const { token, error: stripeError } = await props.stripe.createToken(ibanElement, {
            type: 'sepa_debit',
            currency: 'eur',
            owner: {
              email: props.isEmail || '',
              name: payload.account_holder_name,
            },
          });
          
          currentToken = token;
          if (stripeError) {
            throw new Error(stripeError.message);
          }
          // formData.append('token', JSON.stringify(token));
          // formData.append('email', JSON.stringify(props.isEmail));
          payload.token = token;
          payload.email = props.isEmail
          // if(props.name){
          //   payload.account_holder_name = props.name
          //   payload.upgrade = props.isUpgrade
          // }
        }
        payload = JSON.stringify(payload);
      }

      if(props.section){
        payload.section = props.section;
        if(props.section === 'payment_method'){
          payload.prefer_payment_method = document.getElementsByName(`prefer_payment_method_${!props.sepaForm ? 'card' : 'sepa_debit'}`)?.[0]?.checked
        }
      }

      let res = await Axios({ method, url, data: payload, headers });

      // let res = await Axios({

      //   method: props.method,
      //   url: props.url,
      //   data: data

      // });
      
      // check for 2-factor payment requirement
      if (res.data.requires_payment_action){
        
        if (res.data.method === 'card'){
          
          // const { error } = await props.stripe.handleCardPayment(res.data.client_secret);
          const { data, error } = await props.stripe.confirmCardPayment(res.data.client_secret, {
            payment_method: {
              card: cardElement,
              billing_details: res.data.billing_details || {
                name: res.data.account_holder_name,
                email: res.data.email
              },
            },
          });
          console.log(data, error, 'card');
          if (error){
            props.customDisabled && props.customDisabled()
            viewContext.handleError(error.message);
            return false;

          }
        }
        else if (res.data.method === 'directdebit'){

          const confirmIntent = res.data.type === 'setup' ? 
            props.stripe.confirmSepaDebitSetup : props.stripe.confirmSepaDebitPayment;

          const iban = await props.elements.getElement(IbanElement);

          const { setupIntent, error } = await confirmIntent(
            res.data.client_secret, {
            payment_method: {
              sepa_debit: iban, 
              billing_details: res.data.billing_details || {
                name: res.data.account_holder_name,
                email: res.data.email
              },
            },
          });
          console.log(setupIntent, error, 'error');
          
          if(res.data.type === 'setup' && setupIntent.id){
            attach = await Axios({

              method: 'POST',
              url: '/api/sepa-attach',
              data: {
                token: currentToken,
                paymentId: setupIntent.payment_method,
                prefer_payment_method: true,
                transaction: res.data.transaction
              }
            });

          }
          
          if (error){
            props.customDisabled && props.customDisabled()
            console.error(error), 'error';
            viewContext.handleError(error.message);
            return false;

          }
        }

  
        // re-send the form
        data.stripe = res.data;
        if(props.isUpgrade && props.sepaForm){
          
          if(attach.data.data.requires_payment_action){
            
            res = await Axios({
    
              method: attach.data.data.method,
              url: attach.data.data.url,
              data: {...attach.data.data.data, plan: attach.data.data.data.plan.value}
    
            });
          }
        } else if (attach?.data?.requires_payment_action && props.sepaForm) {
          const confirmIntent = props.stripe.confirmSepaDebitPayment;

          const iban = await props.elements.getElement(IbanElement);

          const { paymentIntent, error } = await confirmIntent(
            attach.data.client_secret, {
            payment_method: {
              sepa_debit: iban, 
              billing_details: res.data.billing_details || {
                name: res.data.account_holder_name,
                email: res.data.email
              },
            },
          });

          if (error){
            props.customDisabled && props.customDisabled()
            console.error(error), 'error';
            viewContext.handleError(error.message);
            return false;

          } else {
            if(attach.data.transaction){
              res = await Axios({
    
                method: 'POST',
                url: `/api/${props.account ? 'transaction' : 'event'}/success`,
                data: {
                  transaction: attach.data.transaction
                }
      
              });
            }
          }
        } else if (res?.data?.requires_payment_action && data.token) {
          if(res.data.transaction){
              res = await Axios({
    
                method: 'POST',
                url: `/api/${props.account ? 'transaction' : 'event'}/success`,
                data: {
                  transaction: res.data.transaction
                }
      
              });
            }
        } else {
          res = await Axios({
  
            method: props.method,
            url: props.url,
            data: data
  
          });
        }
      }

      // handle stripe callback?
      if (res.data.requires_payment_action){

        // res = await props.stripeCallback({ formData: data, resData: res.data });

      }

      // client sideupload
      if (res.data.files_to_upload?.length){

        // warning notification
        // context.notification.show(res.data.message, 'warning', false);
        const uploadPromises = res.data.files_to_upload.map(async (fileToUpload) => {
          const file = getFile(fileToUpload.name);
      
          if (file) {
            return fetch(fileToUpload.url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file.data,
            });
          }
        });
      
        // Wait for all uploads to finish
        await Promise.all(uploadPromises);
      }

      setLoading(false);

      if (!res) 
        return false; // end execution – error was handled 

      // show message
      if (res.data.message)
        viewContext.notification({ description: res.data.message });

      // execute callback (send res and local data)
      callback?.(res, data);

      // redirect
      if (redirect)
        navigate(redirect);

    }
    catch (err){
      props.customDisabled && props.customDisabled();
      // handle error
      setLoading(false);
      console.error(err);
      

      // input or generic error
      if (err.response?.data) {
        const input = err.response.data.inputError;
        const message = err.response.data.message;

        if(message) {
          viewContext.notification({
            description: message,
            variant: "error"
          });
          return;
        }

        input
          ? setError(input, { type: "server", message: message })
          : viewContext.handleError(err);
      }
    }
  }, [callback, viewContext.notification, navigate, trigger, url, method, redirect, props.stripeCallback, form]);

  function getFile(name) {
    // iterate over all keys in the fileStore object
    for (let key in fileStore) {
      if (fileStore.hasOwnProperty(key)){
        // find the file in the array of files under each key
        let file = fileStore[key].find(file => file.name === name);
        if (file) return file;  

      }
    }

    return null; 

  }

  function validate(){

    // loop over each input and check it's valid
    // show error if input is required and value is
    // blank, input validation will be executed on blur

    let errors = [];
    let data = {...form };

    // loop the inputs
    for (let input in data){

      // validate credit card
      if (input === 'token'){
        if(!document.querySelector('.feather-edit')){
          data.token.valid = data.token.value ? true : false;
          if (!data.token.valid) errors.push(false);
        }

      }
      else if (input === 'iban'){
      
        // can't valid it client side so set to true
        data.iban.valid = true;

      }
      else {

        // standard input
        let inp = data[input];

        if(inp.type === 'group'){
          inp.items.map((childs, i) => {
            childs.map((child, j) => {
              if (child.value === undefined && child.default){

                data[input].items[i][j].value = child.default
      
              }
      
              if (child.required){
                if(child.type === 'file'){
                  if(!child.preview && !child.value){
                    errors.push(false);
                  }
                } else if (!child.value || child.value === 'unselected'){
                  inp.items[i][j].valid = false;
                  errors.push(false);
      
                }
              }
      
              if (child.valid === false){
                if(child.type === 'file'){
                  if(!child.preview && !child.value){
                    errors.push(false);
                  }
                } else {
                  errors.push(false);
                }
      
              }
            })
          })
        } else {

          if (inp.value === undefined && inp.default){
  
            data[input].value = inp.default;
  
          }
  
          if (inp.required){
            if (!inp.value || inp.value === 'unselected'){
              console.log(inp, '!inp.value || inp.value === unselected');
              inp.valid = false;
              errors.push(false);
  
            }
          }
  
          if (inp.valid === false){
            console.log(inp, 'inp.valid === false');
            errors.push(false);
  
          }
        }
      }
    }
    console.log(errors, errors.length, 'errors.length');
    
    if (errors.length){

      // form isn't valid
      valid = false;
      setForm(data);
      return false;

    }
    else {

      // form is valid
      return true;

    }
  }

  const update = useCallback((input, value, isValid, parentName, indexParent, indexChild) => {
    let data = {...form }
    if(props.card?.existing_exp_month){
      data.token = {
        ...form.token,
        existing_card: props.card?.existing_card,
        existing_exp_month: props.card?.existing_exp_month,
        existing_exp_year: props.card?.existing_exp_year
      }
    }

     // is it a file?
     if (value.length && value[0].name && value[0].type && value[0].size){
      if (!fileStore[input]?.length)
        fileStore[input] = [];

      const newFiles = {...fileStore }
      const labelImg = parentName ? `${parentName}_${(value[0].name).replaceAll('/', '').replaceAll('/', '').replaceAll(' ', '')}_${Date.now()}` : input;
      value.forEach(file => {
          // add or delete the file
          if (file.data && !fileStore[labelImg].find(x => x.name === file.name)){

            newFiles[labelImg].push(file);


          }
          else if (!file.data) {

            newFiles[labelImg].splice(newFiles[labelImg].findIndex(x => x.name === file.name), 1);

          }
      })

        if(parentName){
          data[parentName].items[indexParent][indexChild].value = newFiles[labelImg]
          data[parentName].items[indexParent][indexChild].valid = isValid
        } else {
          data[input].value = newFiles[labelImg];
          data[input].valid = isValid;
        }
        setFileStore(newFiles);

      }
    else {
      // update input value & valid state
      if(parentName){
        let parent = {...data[parentName]}
        parent.items[indexParent][indexChild].value = value;
        parent.items[indexParent][indexChild].default = value;
        parent.items[indexParent][indexChild].valid = isValid;
        setForm(prevForm => ({
          ...prevForm,
          [parentName]: parent
        }));
      } else {
        data[input].value = value;
        data[input].valid = isValid;
        

        setForm(prevForm => ({
          ...prevForm,
          [input]: data[input]
        }));
      }

    }
    
    props.updateOnChange && props.onChange({ input: input, value: value, valid: valid });

    props.submitOnChange && submit();

  }, [form])

  return (
    <form onSubmit={ handleSubmit(submit) } className={ cn(loading && 'opacity-50 pointer-events-none', className)} noValidate>

      { inputs && Object.keys(inputs).length &&
        Object.keys(inputs).map(name => {

          const { type, required, label, errorMessage, min, max, 
            minLength, maxLength, placeholder, description, value, 
            defaultValue, options, disabled, validation, accept, readonly } = inputs[name];

          // ignore null input type
          if (inputs[name].type === null)
            return false;

          // input type to render or default generic input
          // imported from ./input/map.js file
          const Input = Inputs[type] ? Inputs[type] : Inputs.default;

          return (
            <div className={ cn(type !== 'hidden' && 'mb-4 last:mb-0') } key={ name }>

              { label && Input.showLabel && type !== 'hidden' &&
                <Label htmlFor={ name } required={ required }>{ label }</Label> }

              <div className='relative'>
                <Controller
                  name={ name }
                  control={ control }
                  defaultValue={ value || defaultValue || '' }
                  rules={{

                    // validation
                    required: required ? 
                      (errorMessage || t('global.form.input.error.required', 
                      { label: label || 'Field' })) : undefined,

                    min: min ? 
                      { value: min, message: (errorMessage || t('global.form.input.error.min', 
                      { min }))} : undefined,

                    max: max ? 
                      { value: max, message: (errorMessage || t('global.form.input.error.max', 
                      { label, max }))}: undefined,

                    minLength: minLength ? 
                      { value: minLength, message: (errorMessage || t('global.form.input.error.min_length', 
                      { label, minLength }))} : undefined,

                    maxLength: maxLength ? 
                      { value: maxLength, message: (errorMessage || t('global.form.input.error.max_length', 
                      { label, maxLength }))} : undefined,

                    // input specific default
                    ...Input.validation ?
                      { pattern: { value: Input.validation.default, message: errorMessage || t(`global.form.${type}.error.invalid`,
                      { label, type })}} : {},

                    // input specific passed as prop
                    ...Object.keys(validation || {}).reduce((acc, key) => {

                      if (validation[key] === true && Input.validation?.[key]) {
                        acc.pattern = { value: Input.validation[key], message: errorMessage || t(`global.form.${type}.error.invalid`, 
                        { label, type })};
                      }

                      return acc;
                      }, {}
                    )
                  }}
                  render={({ field }) => (
                    <Input.component
                      {...field }
                      id={ name }
                      options={ options }
                      label={ label }
                      type={ type }
                      accept={ accept }
                      readOnly={ readonly }
                      disabled={ disabled }
                      placeholder={ placeholder }
                      onChange={ e => onChange(e, field) }
                      defaultChecked={ defaultValue }
                      defaultValue={ defaultValue }
                      value={ field.value }
                      aria-describedby={ errors[name] ? `${name}-helper ${name}-error` : `${name}-helper` }
                      aria-invalid={ !!errors[name] }
                    />
                  )}
                />

                { /* success/error icon */ }
                { touchedFields[name] && Input.showIcon &&
                  <Icon 
                    size={ 14 }
                    className='absolute top-1/2 transform -translate-y-1/2 right-2'
                    name={ errors[name] ? 'x' : 'check' }
                    color={ errors[name] ? 'red' : 'green' } 
                  /> 
                }

              </div>

              { /* error message */ }
              { errors[name] && type != 'hidden' &&
                <Error id={ `${name}-error` }>{ errors[name].message }</Error> 
              }

              {  /* description helper */ }
              { description && !errors[name] &&
                <Description id={ `${name}-helper` } className={"text-xs"}>
                  { description }
                </Description> 
              }

            </div>
          )
        }) 
      }
  
      { /* submit button */ }
      { (buttonText || props.customBtnTrigger) ?
        <Button
          type='submit'
          loading={ loading }
          text={ buttonText }
          color={ destructive ? 'red' : 'primary' }
          className={`w-[49%] mr-[2%] last:mr-0 submit-form ${props.customBtnTrigger ? 'hidden' : ''}`}
          size={ cancel ? 'default' : 'full' }
        /> : null
      }

      { /* cancel button */ }
      { cancel &&
        <Button 
          variant='outline' 
          text='Cancel' 
          className='w-[49%] mr-[2%] last:mr-0'
          action={ cancel } 
        />
      }

    </form>
  );
}

function PaymentForm(props){

  const stripe = useStripe();
  const elements = useElements();
  const viewContext = useContext(ViewContext);

  async function handleStripeCallback({ formData, resData }){

    // check for 2-factor payment requirement
    if (resData.requires_payment_action){

      try {

        const { error } = await stripe.handleCardPayment(resData.client_secret);
        if (error) throw error;

        return await Axios({ 
          
          method: props.method,
          url: props.url, 
          data: { ...formData, ...{ stripe: resData }}

        });
      }
      catch (err){

        viewContext.handleError(err);

      }
    }
  }

  return (
    <Form 
      {...props } 
      stripe={ stripe } 
      elements={ elements }
      stripeCallback={ handleStripeCallback }
    />
  );
}

export { Form, PaymentForm }