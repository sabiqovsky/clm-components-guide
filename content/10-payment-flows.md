# Payment Flows

Components supports four distinct flows, all driven by session parameters.

## Flow Overview

```mermaid
graph LR
    subgraph Pay
        P1[session_type: PAY] --> P2[One-time charge]
    end
    subgraph Save
        S1[session_type: SAVE] --> S2[Tokenize card\nno charge]
    end
    subgraph PaySave["Pay + Save"]
        PS1[session_type: PAY\nallow_save: OPTIONAL] --> PS2[Charge + optionally\nsave card]
    end
    subgraph Sub["Subscription"]
        SB1[session_type: SUBSCRIPTION\n+ schedule config] --> SB2[Recurring billing setup]
    end
```

## Flow Reference

| Flow | `session_type` | `allow_save_payment_method` | Has `amount`? | Use case |
|------|----------------|----------------------------|---------------|---------|
| Pay | `PAY` | Not set | ✅ Required | Standard checkout |
| Save | `SAVE` | Not set | ❌ No charge | Vault card for later |
| Pay + Save | `PAY` | `OPTIONAL` or `REQUIRED` | ✅ Required | Checkout + save card |
| Subscription | `SUBSCRIPTION` | Not set | Depends on schedule | Recurring billing |

## Pay Flow

Standard one-time charge:

```javascript
{
  amount: 150000,
  currency: 'IDR',
  mode: 'COMPONENTS',
  session_type: 'PAY',
}
```

## Save Flow

Tokenize a card without charging — useful for setting up a payment method for later:

```javascript
{
  currency: 'IDR',
  mode: 'COMPONENTS',
  session_type: 'SAVE',
  // no amount field
}
```

## Pay + Save Flow

Charge and give the customer the option to save their card:

```javascript
{
  amount: 150000,
  currency: 'IDR',
  mode: 'COMPONENTS',
  session_type: 'PAY',
  allow_save_payment_method: 'OPTIONAL', // or 'REQUIRED'
}
```

`OPTIONAL` shows a "Save card" checkbox. `REQUIRED` always saves.

## Subscription Flow

Sets up recurring billing. Requires a schedule configuration:

```javascript
{
  currency: 'IDR',
  mode: 'COMPONENTS',
  session_type: 'SUBSCRIPTION',
  subscription_details: {
    interval: 'MONTH',
    interval_count: 1,
    total_recurrence: 12,
  },
}
```
