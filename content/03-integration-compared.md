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

```mermaid
%%{init: {"theme": "default", "themeVariables": {"background": "#ffffff", "primaryColor": "#eff6ff", "primaryBorderColor": "#1d4ed8", "primaryTextColor": "#1e3a5f", "lineColor": "#1d4ed8", "edgeLabelBackground": "#ffffff", "fontSize": "16px"}}}%%
flowchart TD
    subgraph PL["Payment Link — Redirect flow"]
        direction LR
        A1["Customer"] -->|"clicks pay"| B1["Merchant page"]
        B1 -->|"redirect"| C1["Xendit-hosted page"]
        C1 -->|"complete"| D1["Back to merchant"]
    end

    subgraph CO["Components — Embedded flow"]
        direction LR
        A2["Customer"] -->|"clicks pay"| B2["Merchant page"]
        B2 -->|"iframe renders inline"| C2["Xendit secure iframe"]
        C2 -->|"complete"| B2
    end

    style PL fill:#fefce8,stroke:#ca8a04,color:#713f12
    style CO fill:#f0fdf4,stroke:#16a34a,color:#14532d
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
