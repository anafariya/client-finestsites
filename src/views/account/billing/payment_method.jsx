import { Fragment, useContext, useState, useEffect } from "react";
import {
  AuthContext,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  Animate,
  Card,
  Input,
  Label,
  Button,
  useAPI,
//   toast,
} from "components/lib";

/** --------------------------------------------------
 * Payment‑details form (Invoice recipient, address …)
 * three independent save actions
 * --------------------------------------------------*/
export function PaymentMethodForm({ t }) {
  const [saving, setSaving] = useState({ who: "" });
  const [form, setForm] = useState({
    recipient: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /** util to PATCH only the changed slice */
  const saveSection = async (payload, key) => {
    try {
      setSaving({ who: key });
      await fetch("/api/account/billing/address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    //   toast.success(t("global.saved", "Saved"));
    } finally {
      setSaving({ who: "" });
    }
  };

  return (
    <Card className="w-full space-y-8 shadow-md p-6 lg:p-10 !max-w-full">
      <div className="mb-4 lg:mb-10">
        <h3 className="text-lg font-semibold">
          {t("account.billing.payment_method.title", "Payment method")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "account.billing.payment_method.subtitle",
            "Update your billing details and address."
          )}
        </p>
      </div>

      {/* Invoice recipient */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end mb-3 lg:mb-8">
        <div className="space-y-2">
          <Label htmlFor="recipient" required>
            {t("account.billing.form.recipient", "Invoice recipient")}
          </Label>
          <Input
            id="recipient"
            name="recipient"
            required
            value={form.recipient}
            onChange={handleChange}
          />
        </div>
        <Button
          type="button"
          disabled={saving.who === "recipient"}
          onClick={() => saveSection({ recipient: form.recipient }, "recipient")}
        >
          {t("global.save", "Save")}
        </Button>
      </div>

      {/* Email correspondence */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end mb-3 lg:mb-8">
        <div className="space-y-2">
          <Label htmlFor="email" required>
            {t("account.billing.form.email", "Email address")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <Button
          type="button"
          disabled={saving.who === "email"}
          onClick={() => saveSection({ email: form.email }, "email")}
        >
          {t("global.save", "Save")}
        </Button>
      </div>

      {/* Address block */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveSection(
            {
              street: form.street,
              city: form.city,
              state: form.state,
              country: form.country,
            },
            "address"
          );
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="street" required>
            {t("account.billing.form.street", "Street address")}
          </Label>
          <Input
            id="street"
            name="street"
            required
            value={form.street}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" required>
              {t("account.billing.form.city", "City")}
            </Label>
            <Input
              id="city"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" required>
              {t("account.billing.form.state", "State / Province")}
            </Label>
            <Input
              id="state"
              name="state"
              required
              value={form.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" required>
            {t("account.billing.form.country", "Country")}
          </Label>
          <Input
            id="country"
            name="country"
            required
            value={form.country}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" disabled={saving.who === "address"}>
          {t("global.save", "Save address")}
        </Button>
      </form>
    </Card>
  );
}