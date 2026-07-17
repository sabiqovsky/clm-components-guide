# Payment Flows

Components supports four distinct flows, all driven by session parameters.

## Flow Overview

```mermaid
flowchart TD
    subgraph PAY["💳 Pay — One-time charge"]
        direction LR
        P1["session_type: PAY"] --> P2["Customer charged"]
    end
    subgraph SAVE["🔖 Save — Vault card"]
        direction LR
        S1["session_type: SAVE"] --> S2["Card tokenized\nno charge"]
    end
    subgraph PAYSAVE["💳🔖 Pay + Save"]
        direction LR
        PS1["session_type: PAY\nallow_save: OPTIONAL"] --> PS2["Charged + card saved"]
    end
    subgraph SUB["🔄 Subscription — Recurring"]
        direction LR
        SB1["session_type: SUBSCRIPTION\n+ schedule config"] --> SB2["Recurring billing set up"]
    end

    style PAY fill:#e8f0fe,stroke:#1762ee,color:#0d2a6b
    style SAVE fill:#f3e8ff,stroke:#7c3aed,color:#3b0764
    style PAYSAVE fill:#fff8e1,stroke:#f59e0b,color:#78350f
    style SUB fill:#e8f5e9,stroke:#22c55e,color:#14532d
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
