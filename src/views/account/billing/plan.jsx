import { useContext, useState, useEffect } from "react"
import {
  AuthContext,
  Card as UiCard,
  usePlans,
  useTranslation,
  ViewContext,
  cn,
  useNavigate
} from "components/lib"
import { Button } from "components/shadcn/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "components/shadcn/tabs"
import {BillingCard} from "./card"
import {Sepa} from "./sepa"
import Axios from "axios"

/**
 * BillingPlan + Buy‑Coins feature
 * --------------------------------
 * ├─ Current balance box (coins)
 * ├─ “Buy Coins” button opens purchase modal (Stripe / your flow)
 * ├─ Existing payment‑method management kept in Tabs modal
 */

export function BillingPlan(props) {
  // contexts
  const context = useContext(AuthContext)
  const viewContext = useContext(ViewContext)
  const { t } = useTranslation()
  const navigate = useNavigate()

  // state
  const [isOpenPayment, setIsOpenPayment] = useState(false)
  const [isOpenBuy, setIsOpenBuy] = useState(false)
  const [card, setCard] = useState(null)
  const [buying, setBuying] = useState(false)

  /* helpers */
  // const isPaid = context.user.plan !== "free"
  const coins = context.user?.accounts?.[0]?.virtual_currency ?? 0

  useEffect(() => {
    setCard(props.datas)
  }, [props.datas])

  /* BUY COINS handler */
  const handleBuyCoins = async (amount) => {
    try {
      setBuying(true)
      // hit your backend to create a checkout session
      const { data } = await Axios.post("/api/virtual-currency/checkout", { amount })
      navigate(`/account/payment/${data.data.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setBuying(false)
    }
  }

  return (
    <UiCard restrictWidth className={cn(props.className, "p-4 lg:p-10 !max-w-full bg-background")}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* BALANCE + BUY COINS */}
        <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("account.coins.balance")}
          </h2>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{coins}</span>
            <span className="text-muted-foreground">{t("account.coins.title")}</span>
          </div>

          <Button size="sm" onClick={() => setIsOpenBuy(true)} className="mt-2 w-max">
            {t("account.coins.buy_button")}
          </Button>
        </div>

        {/* CURRENT PAYMENT METHOD */}
        {/* <div className="w-full py-6 bg-white rounded-xl shadow-md border border-gray-200 gap-4"> */}
          {/* Card Content */}
          {/* <div className="flex justify-between items-center px-6">
            <div className="flex-[80%]">
            <h2 className="text-lg text-black mb-2 font-semibold" >{ t('account.billing.header') }</h2>
            {/* <p className="text-sm text-[#808080] mb-4 " dangerouslySetInnerHTML={{__html: t('account.billing.change_payment') }}></p> */}
            {/* </div>
          </div> */} 

          {/* <div className="w-full flex px-6 mt-4">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm w-full">
              {
                card &&
                <div className="flex items-center space-x-4">
                  <div className={`w-[100px] flex items-center justify-center bg-white border rounded-md max-h-[50px] overflow-hidden ${!card?.sepa_debit?.prefer_payment_method && 'p-4'}`}>
                    <img src={`/assets/logo/${card?.sepa_debit?.prefer_payment_method ? 'sepa' : (card?.card?.brand === 'Visa' ? 'visa' : 'mastercard')}.svg`} alt="payment" width={100} className='object-cover object-center' />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {card?.sepa_debit?.prefer_payment_method ? 'SEPA' : (card?.card?.brand === 'Visa' ? 'Visa' : 'Master Card')} {t('account.billing.plan.ending_in')} {card?.sepa_debit?.prefer_payment_method ? card?.sepa_debit?.last4 :  card?.card?.last4}
                  </p>
                </div>
              }
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setIsOpenPayment(true)}>
              {t('account.billing.plan.edit')}
              </button>
            </div>
          </div> */}
        {/* </div> */}
      </div>

      {/* MODAL: BUY COINS */}
      {isOpenBuy && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {t("account.coins.buy_title")}
            </h3>
            <div className="space-y-3">
              {[100, 200, 300, 400, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  disabled={buying}
                  className="w-full justify-between"
                  onClick={() => handleBuyCoins(amt)}
                >
                  <span>{amt} {t("account.coins.coins")}</span>
                  <span className="font-medium">€ {(amt / 100) * 7}</span>
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-6 w-full"
              onClick={() => setIsOpenBuy(false)}
            >
              {t("global.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT METHOD EDIT */}
      {isOpenPayment && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {t("account.billing.payment_details")}
              </h3>
              <button onClick={() => setIsOpenPayment(false)} aria-label="close">
                ×
              </button>
            </div>
            <Tabs
              defaultValue={card?.card ? "card" : "sepa"}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                {isPaid && <TabsTrigger value="card">Card</TabsTrigger>}
                {isPaid && <TabsTrigger value="sepa">SEPA</TabsTrigger>}
              </TabsList>
              {isPaid && (
                <TabsContent value="card" className="mt-4">
                  <BillingCard
                    {...props}
                    datas={card?.card}
                    loading={card?.loading}
                    reload={props.reload}
                    close={() => setIsOpenPayment(false)}
                  />
                </TabsContent>
              )}
              {isPaid && (
                <TabsContent value="sepa" className="mt-4">
                  <Sepa
                    {...props}
                    datas={card?.sepa_debit}
                    loading={card?.loading}
                    reload={props.reload}
                    isEmail={card?.email}
                    close={() => setIsOpenPayment(false)}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      )}
    </UiCard>
  )
}
