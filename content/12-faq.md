# Merchant FAQs

## General

**Q: What's the difference between Components and Payment Link?**
Components keeps the customer on the merchant's page — no redirect. Payment Link redirects to a Xendit-hosted page. Components also supports Save and Subscription flows; Payment Link only supports Pay.

**Q: Does Components work on mobile?**
Yes. The SDK renders a responsive iframe that works on all modern mobile browsers.

**Q: What card types are supported?**
Visa, Mastercard, and JCB — depending on the currency and country configuration.

**Q: Can we use Components alongside Payment Link in the same store?**
Yes. They're independent integration modes — you can offer both based on context.

**Q: Is there a sandbox/test environment?**
Yes. Use `xnd_development_...` API keys and test card numbers from the Xendit docs.

---

## Integration & Setup

**Q: Where does the session creation API call happen?**
Always server-side. The Xendit secret API key must never be in the browser.

**Q: What is `origins` and why is it required?**
`origins` is a list of allowed domains that can use the SDK key. If it's missing or wrong, the SDK will fail to initialize. Always include your exact domain (including `localhost` for dev).

**Q: Can we create a session without an amount (for Save flow)?**
Yes. For `session_type: SAVE`, omit the `amount` field entirely.

**Q: How long is a `components_sdk_key` valid?**
It's short-lived and single-use — tied to one session. Don't cache or reuse it.

**Q: Do we need to store the `session_id`?**
Yes. Store it with your order so you can match it when the webhook arrives.

---

## Styling & Customisation

**Q: Can we remove Xendit's branding from the iframe?**
No. The secure iframe content is controlled by Xendit. You can style the container around it and the fields' colors/fonts via appearance config.

**Q: Can we use a custom font inside the card fields?**
Yes — pass `fontFamily` in `iframeFieldAppearance.variables`. The font must be loaded on your page too.

**Q: Can we change the "Pay" button label?**
Yes — the pay button is your own HTML element. You control it completely.

---

## Security

**Q: Is Components PCI-DSS compliant?**
Yes. Card data never touches the merchant's server or JavaScript. Xendit holds the PCI scope.

**Q: Can our JavaScript read the card number from the iframe?**
No. The iframe is on Xendit's domain. Browser cross-origin policy prevents any access — this is enforced at the browser level, not just by policy.

**Q: What happens if someone steals the `components_sdk_key`?**
Not much. It can only render a payment form for one specific session. It can't charge cards directly. And it only works from the domains listed in `origins`.

**Q: Do we need to handle 3DS ourselves?**
No. The SDK handles 3DS challenges via the action container. Mount it and listen for `action-begin`/`action-end` — that's all you need.

**Q: Is our customer's card data stored anywhere on our servers?**
No. The card data goes directly from the Xendit iframe to Xendit's servers. Your server only ever sees the session ID and payment status.

---

## Migration

**Q: How long does migrating from Invoice to Components take?**
Typically 1–2 sprints for a team with a dedicated frontend developer. The server-side change is small; most effort is on the frontend SDK integration.

**Q: Can we run Invoice and Components in parallel during migration?**
Yes. Use a feature flag on the checkout to route between the two. Verify Components end-to-end before switching traffic.

**Q: Do our existing saved payment methods migrate automatically?**
No. Payment methods tokenized via Invoice are different from Components. Check with your Xendit integration team for migration options.

---

## Troubleshooting

**Q: The SDK initializes but the form doesn't render.**
Check browser console for CORS errors. Verify that `origins` in your session creation request matches your exact domain (including protocol and port).

**Q: `submission-ready` never fires.**
The customer hasn't filled all required fields yet. Make sure the channel picker is mounted and a payment method is selected before the card form renders.

**Q: We're getting 401 errors from Xendit.**
The wrong API key is being used for the currency. Check your multi-currency key mapping in server config.

**Q: The webhook is firing but we're getting duplicate order updates.**
Your webhook handler isn't idempotent. Check the order status before processing — skip if already `PAID`.
