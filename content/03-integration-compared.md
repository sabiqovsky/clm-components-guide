# Integration Methods Compared

## Comparison Table

| | Payment Link | Components | Invoice (Legacy) |
|--|-------------|------------|-----------------|
| **Where customer pays** | Xendit-hosted page | Merchant's own page | Xendit-hosted page |
| **Brand control** | None | High | None |
| **PCI scope** | Xendit handles | Xendit handles | Xendit handles |
| **Setup effort** | Low | Medium | Low |
| **Supported flows** | Pay | Pay, Save, Pay+Save, Subscription | Pay |
| **Redirect?** | Yes | No | Yes |
| **Best for** | Quick integration | Full control + multiple flows | Legacy only |

## Flow Comparison

**Payment Link — customer is redirected away:**

```mermaid
%%{init: {"theme": "default", "themeVariables": {"background": "#ffffff", "primaryColor": "#eff6ff", "primaryBorderColor": "#1d4ed8", "primaryTextColor": "#1e3a5f", "lineColor": "#1d4ed8", "edgeLabelBackground": "#ffffff", "fontSize": "16px"}}}%%
flowchart LR
    A["Customer"] -->|"clicks pay"| B["Merchant page"]
    B -->|"redirect"| C["Xendit-hosted page"]
    C -->|"payment complete"| D["Back to merchant"]

    style A fill:#fefce8,stroke:#ca8a04,color:#713f12
    style B fill:#fefce8,stroke:#ca8a04,color:#713f12
    style C fill:#eff6ff,stroke:#1d4ed8,color:#1e3a5f
    style D fill:#fefce8,stroke:#ca8a04,color:#713f12
```

**Components — customer stays on the merchant page:**

```mermaid
%%{init: {"theme": "default", "themeVariables": {"background": "#ffffff", "primaryColor": "#eff6ff", "primaryBorderColor": "#1d4ed8", "primaryTextColor": "#1e3a5f", "lineColor": "#1d4ed8", "edgeLabelBackground": "#ffffff", "fontSize": "16px"}}}%%
flowchart LR
    A["Customer"] -->|"clicks pay"| B["Merchant page"]
    B -->|"iframe renders inline"| C["Xendit secure iframe"]
    C -->|"payment complete"| B

    style A fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style B fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style C fill:#eff6ff,stroke:#1d4ed8,color:#1e3a5f
```

## When to Recommend Each

**Recommend Components when:**
- Merchant wants customers to stay on their site
- Merchant needs Save, Pay+Save, or Subscription flows
- Merchant has dev resources and wants brand consistency

**Recommend Payment Link when:**
- Merchant needs to go live fast with minimal dev effort
- Simple one-time pay flow only

**Recommend Invoice when:**
- Never for new integrations — this is legacy
- Only if already on Invoice and migration isn't prioritized
