# Styling & Customisation

## The Two-Layer Model

```mermaid
flowchart TD
    A["🎨 Layer 1 — Container\nFull merchant CSS control\nSize · border · background · shadow"]
    B["🖼 Layer 2 — Iframe Fields\nAppearance config via SDK\nText color · font · placeholder"]
    C["🔒 Card Data — Xendit Only\nCard number · expiry · CVV\nSecure iframe, cannot be read"]

    A --> B --> C

    style A fill:#e8f0fe,stroke:#1762ee,color:#0d2a6b,font-size:15px
    style B fill:#f3e8ff,stroke:#7c3aed,color:#3b0764,font-size:15px
    style C fill:#e8f5e9,stroke:#22c55e,color:#14532d,font-size:15px
```

## Layer 1: Container CSS

The outer container is a plain HTML element — style it freely:

```css
#xendit-components-container {
  width: 100%;
  max-width: 480px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

## Layer 2: Appearance Config

Pass `iframeFieldAppearance` when initializing the SDK:

```javascript
const xenditComponents = XenditComponents.init({
  sdkKey: componentsSDKKey,
  iframeFieldAppearance: {
    variables: {
      colorPrimary: '#1762ee',
      colorBackground: '#ffffff',
      colorText: '#1a1f36',
      colorTextPlaceholder: '#9ba3af',
      colorBorder: '#d1d5db',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '6px',
    },
  },
});
```

## The Pay Button

The pay button is **entirely the merchant's own element**. Full control — font, color, states, loading animation.

```html
<button id="pay-button" class="your-own-styles">
  Pay IDR 150,000
</button>
```

## What Can and Cannot Be Customised

| Element | Customisable? | Method |
|---------|--------------|--------|
| Container size, border, background | ✅ Fully | Merchant CSS |
| Input text color | ✅ | `iframeFieldAppearance` |
| Input font | ✅ | `iframeFieldAppearance` |
| Input background | ✅ | `iframeFieldAppearance` |
| Pay button | ✅ Fully | Merchant CSS |
| Card network logos | ❌ | Xendit-controlled |
| Field labels ("Card Number") | ❌ | Xendit-controlled |
| Error message text | ❌ | Xendit-controlled |
