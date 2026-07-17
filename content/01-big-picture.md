# What is the Xendit Demo Store?

The `xendit-demo-store` is a full-stack reference implementation that demonstrates all three of Xendit's payment integration modes in a single, runnable codebase. It's built as a fictional plushie e-commerce store — but its real purpose is to show exactly how each integration works end-to-end.

## Three Integration Modes

| Integration | How it works | Where the customer pays |
|-------------|-------------|------------------------|
| **Payment Link** | Merchant creates a session; Xendit returns a hosted URL | Redirected to Xendit-hosted page |
| **Components** | Merchant creates a session; SDK key returned; iframe renders on merchant's page | Stays on merchant's page |
| **Invoice (Legacy)** | Older API; creates a Xendit-hosted invoice page | Redirected to Xendit-hosted page |

This guide focuses on **Components** — the embedded mode that gives merchants the most brand control while Xendit handles all PCI-DSS scope.

## Four Payment Flows

| Flow | `session_type` | What happens |
|------|----------------|-------------|
| **Pay** | `PAY` | One-time charge at checkout |
| **Save** | `SAVE` | Saves card without charging |
| **Pay + Save** | `PAY` + `allow_save_payment_method` | Charges and optionally saves |
| **Subscription** | `SUBSCRIPTION` | Sets up recurring billing |

## Eight Currencies

IDR, PHP, MYR, THB, VND, SGD, HKD, MXN — each mapped to a separate Xendit API key in the server config.

## Architecture Overview

```mermaid
%%{init: {"theme": "default", "themeVariables": {"background": "#ffffff", "primaryColor": "#eff6ff", "primaryBorderColor": "#1d4ed8", "primaryTextColor": "#1e3a5f", "lineColor": "#1d4ed8", "edgeLabelBackground": "#ffffff", "fontSize": "16px"}}}%%
flowchart TD
    A["Customer Browser"]
    B["Demo Store Frontend"]
    C["Demo Store Server"]
    D["Xendit API"]
    E["Xendit Components\nSecure iframe"]

    A -->|"1. Add to cart"| B
    B -->|"2. Create session"| C
    C -->|"3. POST /payment_session"| D
    D -->|"4. Return SDK key"| C
    C -->|"5. SDK key"| B
    B -->|"6. Init SDK"| E
    E -->|"7. Card data direct"| D
    D -->|"8. Payment result"| B

    style A fill:#eff6ff,stroke:#1d4ed8,color:#1e3a5f
    style B fill:#eff6ff,stroke:#1d4ed8,color:#1e3a5f
    style C fill:#eff6ff,stroke:#1d4ed8,color:#1e3a5f
    style D fill:#dbeafe,stroke:#1d4ed8,color:#1e3a5f
    style E fill:#dcfce7,stroke:#16a34a,color:#14532d
```

The key insight: **card data never touches the merchant's server or JavaScript.**
