/***
*
*   SIGN UP STEP 2
*   Signup form for account owners
*   Step 1: create account
*   Step 2: verify email address
*   Step 3: select plan
*
**********/

import { useContext, useState, useEffect } from 'react';
import { Animate, AuthContext, Button, Image, PaymentForm, useAPI, Link, Event, useNavigate, Logo, Icon, ViewContext, FloatingModal, useLocation, Card, cn } from 'components/lib';
import Axios from 'axios';
// import CountUp from "react-countup";

export function Payment(props){
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location?.pathname?.split('/');
  const id = path[2];
  
  // state
  const [period, setPeriod] = useState('month');
  const [directDebit, setDirectDebit] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customBtnClick, setCustomBtnClick] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [couponData, setCouponData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const [modal, setModal] = useState({
    title: props.t('auth.signup.payment.checkout.title'),
    subtitle: props.t('auth.signup.payment.checkout.subtitle'),
    info: 'cup'
  })

  const closeModal = () => setIsModalOpen(false);

  // fetch
  const fetch = useAPI(`/api/transaction/${id}`);

  // useEffect(() => {

  //   // set first plan as default
  //   setSelectedPlan(fetch.data?.plans?.[0]);
  // }, [fetch.data]);

  // if (!fetch.data?.plans)
  //   return null;

  const buttonClick = async () => {
 
    setLoading(true);
    try {
      let res = await Axios({
  
        method: 'POST',
        url: '/api/account/coupon',
        data: {
          coupon
        }
  
      });

      const couponInfo = res.data.plan?.coupon || res.data.plan?.coupon?.coupon;
      if (couponInfo) {

        const originalAmount = fetch.data?.amount * 100; // Convert to cents
        const discountAmount = couponInfo.amount_off;
        const finalAmount = Math.max(0, originalAmount - discountAmount);
      }
      
      setCouponData(res.data.plan?.coupon || res.data.plan?.coupon?.coupon)
      setModal({
        title: props.t('auth.signup.payment.coupon.success.title'),
        subtitle: props.t('auth.signup.payment.coupon.success.subtitle'),
        info: 'success'
      })

      setIsModalOpen(true)

      setLoading(false);
      setRedeemed(true)
    } catch (err) {
      
      if(err.response?.data?.message === 'Invalid coupon'){
        setModal({
          title: props.t('auth.signup.payment.coupon.error.title'),
          subtitle: props.t('auth.signup.payment.coupon.error.subtitle'),
          info: 'error'
        })
  
        setIsModalOpen(true)
      } else {
        viewContext.handleError(err);
      }
      setLoading(false);
    }
  }
  
  return (
    <Animate type='pop'>
      <Card restrictWidth className={cn(props.className, "p-4 lg:p-10 !max-w-full bg-background")}>
        <div className='flex flex-col w-full items-start'>

          <section className='mt-8 md:mt-0 w-full bg-background'>

            {/* Event Registration Section */}
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {props.t('account.payment.transaction.description_event', {
                    event: fetch?.data?.event_id?.city?.name
                  })}
                </h1>
                <p className="text-gray-600">Complete your registration below</p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white p-6 rounded-xl mb-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700">{props.t('auth.signup.payment.voucher.event_registration')}:</span>
                  <span className="font-semibold text-gray-900">€{fetch.data?.amount || '0.00'}</span>
                </div>
                
                {couponData && (
                  <div className="flex justify-between items-center mb-3 text-green-600">
                    <span className="flex items-center">
                      <span className="text-green-500 mr-2">🎫</span>
                      {props.t('auth.signup.payment.voucher.discount_label')}:
                    </span>
                    <span className="font-semibold">-€{(couponData.amount_off / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>{props.t('auth.signup.payment.voucher.total')}:</span>
                    <span className={`${couponData && fetch.data?.amount && (fetch.data.amount * 100 - couponData.amount_off) <= 0 ? 'text-green-600' : 'text-pink-500'}`}>
                      €{(() => {
                        if (!fetch.data?.amount) return '0.00';
                        const originalAmount = fetch.data.amount;
                        const finalAmount = couponData ? 
                          Math.max(0, (originalAmount * 100 - couponData.amount_off) / 100) : 
                          originalAmount;
                        return finalAmount.toFixed(2);
                      })()}
                    </span>
                  </div>
                  
                  {couponData && fetch.data?.amount && (fetch.data.amount * 100 - couponData.amount_off) <= 0 && (
                    <div className="text-center mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                      <div className="text-green-800 font-semibold flex items-center justify-center">
                        <span className="text-2xl mr-2">🎉</span>
                        {props.t('auth.signup.payment.voucher.free_event_message')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Voucher Code Section */}
              <div className="bg-white p-6 rounded-xl mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">{props.t('auth.signup.payment.coupon.title')}</h3>
                <p className="text-sm text-gray-500 mb-4">{props.t('auth.signup.payment.coupon.description')}</p>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 px-4 py-3 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={props.t('auth.signup.payment.coupon.placeholder')}
                    onChange={(e) => (setCoupon(e.target.value), setCouponData(null), setRedeemed(false))}
                    disabled={redeemed}
                    readOnly={redeemed}
                  />
                  <button 
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors" 
                    onClick={(e) => {
                      e.preventDefault();
                      !loading && (redeemed ? setRedeemed(false) : buttonClick())
                    }}
                    disabled={loading}
                  >
                    {loading ? '...' : (redeemed ? props.t('auth.signup.payment.coupon.change_code') : props.t('auth.signup.payment.coupon.redeem'))}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method Section - Only show if payment required */}
            {(!couponData || !fetch.data?.amount || (fetch.data.amount * 100 - couponData.amount_off) > 0) && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  
                  {/* Payment Method Tabs */}
                  <div className="flex mb-6 space-x-2 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
                    <button 
                      className={`px-4 py-2 text-sm font-semibold ${!directDebit && 'bg-white shadow'} rounded-md transition-all`} 
                      onClick={() => setDirectDebit(false)}
                    >
                      {props.t('auth.signup.payment.payment.method.credit_card')}
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-semibold ${directDebit && 'bg-white shadow'} rounded-md transition-all`} 
                      onClick={() => setDirectDebit(true)}
                    >
                      {props.t('auth.signup.payment.payment.method.sepa')}
                    </button>
                  </div>

                  {/* Payment Form */}
                  <PaymentForm
                    inputs={{
                      ...!directDebit && { 
                        credit_card_name: {
                          label: props.t('account.billing.card.form.name_on_card'),
                          type: 'text',
                          required: true,
                          labelClassname: 'font-normal',
                        },
                        token: {
                          label: props.t('auth.signup.payment.form.token.label'),
                          type: 'creditcard',
                          required: true,
                        },
                      },
                      ...directDebit && { 
                        account_holder_name: {
                          label: props.t('auth.signup.payment.form.account_holder_name.label'),
                          type: 'text',
                          required: true,
                        },
                        iban: {
                          label: props.t('auth.signup.payment.form.iban.label'),
                          type: 'iban',
                          required: true,
                        },
                      },
                      coupon: {
                        type: 'hidden',
                        label: 'Coupon',
                        required: false,
                        value: coupon
                      },
                    }}
                    sepaForm={directDebit}
                    isEmail={context?.user?.accounts?.[0]?.email}
                    url={`/api/event/payment/${id}`}
                    method='POST'
                    customDisabled={() => setClicked(false)}
                    callback={ res => {
                      navigate('/dashboard');
                    }}
                    customBtnTrigger={customBtnClick}
                  />
                </div>
              </div>
            )}

            {/* Action Button Section */}
            <div className="max-w-2xl mx-auto mt-8 mb-12">
              {(() => {
                const shouldShowFreeButton = couponData && fetch.data?.amount && (fetch.data.amount * 100 - couponData.amount_off) <= 0;
                return shouldShowFreeButton;
              })() ? (
                // Free registration button when total is €0
                <div className="text-center">
                  <Button
                    onClick={async (e) => {

                      e.preventDefault();
                      if(!clicked){
                        setClicked(true);
                        try {
                          const res = await Axios({
                            method: 'POST',
                            url: `/api/event/payment/${id}`,
                            data: {
                              account: true,
                              coupon: coupon
                            }
                          });
                          navigate('/dashboard');
                        } catch (err) {
                          console.error('❌ Free registration failed');
                          viewContext.handleError(err);
                          setClicked(false);
                        }
                      }
                    }}
                    disabled={clicked}
                    className="w-full max-w-md bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{props.t('auth.signup.payment.voucher.free_registration.button')}</span> 
                    <span className="text-xl">🎉</span>
                  </Button>
                </div>
              ) : (
                // Normal pay button when payment is required (always show)
                <div className="text-center">
                  <Button 
                    className="w-full max-w-md bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={(e) => {
                      e.preventDefault();
                      if(!clicked){
                        setCustomBtnClick(prev => prev + 1);
                        setClicked(true);
                      }
                    }}
                    disabled={clicked}
                  >
                    <span>{(() => {
                      if (fetch.data?.amount != null) {
                        const original = fetch.data.amount;
                        const discounted = couponData ? Math.max(0, (original * 100 - couponData.amount_off) / 100) : original;
                        return `Pay €${discounted.toFixed(2)}`;
                      }
                      return props.t('auth.signup.payment.checkout.pay_now');
                    })()}</span> <span>→</span>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
        {
          isModalOpen &&
          <FloatingModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={modal.title}
            description={modal.subtitle}
            info={modal.info}
          />
        }
      </Card>
    </Animate>
  );
}
