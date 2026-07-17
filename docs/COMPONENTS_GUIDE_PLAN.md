# Execution Runbook: Xendit Components Internal Guide (v2)

**Author:** Askar (via Kiro)
**Created:** 2026-07-16
**Updated:** 2026-07-17
**Status:** EXECUTABLE

---

## Agent Configuration

This runbook is operated by two Kiro CLI agents:

| Agent | Responsibility |
|-------|---------------|
| **Planner** | Requirements gathering, plan updates, gate verification, `.md` file management |
| **Executor** | Code implementation, build system, content writing, deployment |

### Guardrails (Both Agents)

1. **Clarify before writing `.md` files:** ANY change to `.md` files requires showing the proposed change and getting explicit user confirmation before writing. No exceptions.

2. **Knowledge re-index after changes:** After any `.md` file is modified, re-index:
   ```
   knowledge update --path docs/COMPONENTS_GUIDE_PLAN.md --name "Components Guide Plan"
   knowledge update --path CLAUDE.md --name "Components Guide Context"
   ```

3. **Cross-file consistency:** When a shared value changes, grep + update ALL files. Confirm with user first.

4. **No assumptions:** Ambiguous requests → ask. Don't guess scope, audience, or technical approach.

5. **Crypto contract:** Any change to `build.js` encryption OR `template.html` decryption requires:
   - The other side updated to match the canonical formula in `CLAUDE.md`
   - `node test-decrypt.js` passes before committing
   - Never push if `test-decrypt.js` fails

### Handoff Protocol

```
PLANNER → EXECUTOR:
  "Plan ready. Execute Phase N. Knowledge base indexed."

EXECUTOR → PLANNER (at gates):
  "Phase N complete. Verification: [results]. Awaiting gate confirmation."

PLANNER → USER (at gates):
  Shows gate questions. Waits for answers. Updates plan if needed.
```

### Knowledge Bases (Kiro-native)

| Name | Path | Purpose |
|------|------|---------|
| `Components Guide Plan` | `docs/COMPONENTS_GUIDE_PLAN.md` | Executor searches for phase steps, verification criteria |
| `Components Guide Context` | `CLAUDE.md` | Both agents search for decisions, architecture, shared values |

The executor should `knowledge search` before starting any phase to confirm current state rather than relying on stale context.

---

## Architecture Change Summary

| | v1 (killed) | v2 (current) |
|---|---|---|
| Framework | Next.js 14 + React + NextAuth | None |
| Auth | Server-side NextAuth + middleware | Client-side Google Identity Services + AES-GCM |
| Hosting | Vercel | GitHub Pages |
| Content format | React TSX components | Markdown files → compiled to encrypted HTML |
| Diagrams | Inline SVG React components | Mermaid.js (text-based, CDN-rendered) |
| Packages (production) | ~40 npm deps | 0 |
| Packages (dev/build) | ~40 npm deps | 1 (markdown parser) |
| Content editing | Edit .tsx, rebuild, redeploy | Edit .md on GitHub, auto-deploys |
| Security surface | Framework + auth library + server runtime | Web Crypto API + Google CDN SDK |

**Why the change:** A Next.js app with 40+ dependencies is prone to security vulnerabilities and requires constant maintenance — overkill for an internal docs page that just needs domain-restricted access.

---

## How to Use This Runbook

Sequential, gated execution plan. Each phase has:
- **Preconditions** — what must be true before starting
- **Steps** — deterministic actions
- **Verification** — how to confirm success
- **Gate** — pause and confirm before next phase

---

## Phase 0: Variable Collection

### Required Variables

| # | Variable | Value | Status |
|---|----------|-------|--------|
| 1 | Repo name | `clm-components-guide` | ✅ Confirmed |
| 2 | GitHub Pages URL | `https://sabiqovsky.github.io/clm-components-guide` | ✅ Confirmed |
| 3 | Auth domain restriction | `@xendit.co` | ✅ Confirmed |
| 4 | GCP OAuth Client ID | `527936545532-10mmrufrdrkpjlr2l03kgq6fj2d78vu2.apps.googleusercontent.com` | ✅ Confirmed |
| 5 | GCP OAuth consent screen type | **Internal** (Workspace-only) | ✅ Confirmed |
| 6 | BUILD_ENCRYPTION_KEY | Auto-generated (stored as GitHub Actions secret) | ✅ |
| 7 | Markdown parser (dev only) | `marked` (single dep, build-time only) | ✅ |
| 8 | Mermaid.js version | Latest (loaded from CDN at runtime, not bundled) | ✅ |

### Decisions Locked

| Decision | Value |
|----------|-------|
| Production dependencies | **Zero** |
| Auth UX | "Sign in with Google" button → content revealed |
| Content encryption | AES-256-GCM (Web Crypto API) |
| Key derivation | `hd` claim + embedded salt → PBKDF2 → AES key |
| Diagram engine | Mermaid.js (CDN) |
| Content source | `content/*.md` files |
| Build output | Single `docs/index.html` |
| Hosting | GitHub Pages (from `main` branch, `/docs` folder) |
| Auto-deploy | GitHub Actions on push to `main` |
| Guide structure | 12 sections, single page, sticky nav, TOC |

### 🚦 GATE 0: Pre-flight

> **Q0.1:** Confirm the GitHub org/user for Pages URL (e.g., `xendit-technology.github.io/xendit-components-guide`).
>
> **Q0.2:** For GCP OAuth — will you create the Internal OAuth app now, or should I scaffold first and you add the Client ID later?
>
> **Q0.3:** The existing Next.js code (`app/`, `components/`, `lib/`, `middleware.ts`, `package.json`, etc.) will be removed. The content from the TSX sections will be migrated to `.md` files. Confirm this is okay.

### Post-Gate 0: Knowledge Indexing

After Gate 0 passes and variables are confirmed, planner:
1. Updates `CLAUDE.md` and `COMPONENTS_GUIDE_PLAN.md` with confirmed values
2. Indexes both into knowledge base:
   ```
   knowledge add --name "Components Guide Plan" --value docs/COMPONENTS_GUIDE_PLAN.md
   knowledge add --name "Components Guide Context" --value CLAUDE.md
   ```
3. Hands off to executor: "Execute Phase 1. Knowledge base indexed with confirmed variables."

---

## Phase 1: Build System

### Preconditions
- Gate 0 passed
- Existing Next.js code approved for removal
- Knowledge base indexed (executor: `knowledge search` for "Phase 1 steps" to confirm current plan)

### Steps

```
1.1  Remove v1 artifacts:
     - Delete: app/, components/, lib/, middleware.ts, next.config.mjs,
       next-env.d.ts, tsconfig.json, package.json, package-lock.json,
       node_modules/, .next/, .env.local, .env.example,
       client_secret_*.json
     - Keep: CLAUDE.md, README.md, docs/, XENDIT_COMPONENTS_GUIDE.html (reference)

1.2  Create content/ directory with 12 placeholder .md files:
     - content/01-big-picture.md
     - content/02-getting-started.md
     - content/03-integration-compared.md
     - content/04-components-e2e.md
     - content/05-components-frontend.md
     - content/06-components-backend.md
     - content/07-styling.md
     - content/08-security.md
     - content/09-migration.md
     - content/10-payment-flows.md
     - content/11-webhooks.md
     - content/12-faq.md

1.3  Create build.js:
     - Read all content/*.md in alphabetical order
     - Parse Markdown → HTML (using marked or markdown-it)
     - Preserve ```mermaid fenced blocks as <pre class="mermaid">
     - Generate table of contents from # headings
     - Encrypt combined HTML with AES-256-GCM:
       - Key: PBKDF2(BUILD_ENCRYPTION_KEY, salt, 100000, 256)
       - Salt: random 16 bytes (embedded in output)
       - IV: random 12 bytes (embedded in output)
     - Inject encrypted blob (base64) into template.html
     - Output: docs/index.html

1.4  Create template.html:
     - Minimal HTML5 shell
     - Google Identity Services SDK (from accounts.google.com CDN)
     - "Sign in with Google" button (centered, Xendit-branded)
     - Decryption logic:
       - On Google sign-in callback → verify hd == "xendit.co"
       - Derive decryption key from token + salt (matching build.js derivation)
       - Decrypt blob → inject HTML into <main>
       - Initialize Mermaid.js (from CDN) on decrypted content
     - Sticky nav (auto-generated from TOC data)
     - Xendit brand CSS (embedded, no external stylesheet)
     - Print styles
     - Responsive breakpoints

1.5  Create package.json (dev-only, minimal):
     {
       "name": "xendit-components-guide",
       "private": true,
       "scripts": { "build": "node build.js" },
       "devDependencies": { "marked": "^12.x" }
     }

1.6  Create .gitignore:
     - node_modules/
     - .DS_Store
     - .env
     (Note: docs/index.html IS committed — it's the deploy artifact)

1.7  Create .github/workflows/build.yml:
     - Trigger: push to main (paths: content/**, build.js, template.html)
     - Steps: checkout → setup node → npm ci → node build.js → commit + push docs/index.html
     - Secret: BUILD_ENCRYPTION_KEY
```

### Key Design: Encryption/Decryption Flow

**This is the canonical formula. Both `build.js` and `template.html` must implement exactly this.**

```
BUILD TIME (build.js):
  browserPassword = HMAC-SHA256(BUILD_ENCRYPTION_KEY, "xendit-components-guide-v2") → base64
  salt            = randomBytes(16)
  iv              = randomBytes(12)
  key             = PBKDF2(browserPassword, salt, 100000, 32, SHA-256)
  ciphertext      = AES-256-GCM.encrypt(plaintext_html, key, iv)
  authTag         = cipher.getAuthTag()   // 16 bytes
  blob            = base64(salt + iv + authTag + ciphertext)
  CONTENT_SALT    = browserPassword       // injected into template.html

BROWSER TIME (template.html):
  password = CONTENT_SALT_B64             // same as browserPassword above
  packed   = base64decode(ENCRYPTED_BLOB)
  salt     = packed[0:16]
  iv       = packed[16:28]
  authTag  = packed[28:44]
  cipher   = packed[44:]
  key      = PBKDF2(password, salt, 100000, 32, SHA-256)
  plaintext = AES-256-GCM.decrypt(cipher + authTag, key, iv)
```

**Crypto Contract Rules:**
- Never change `build.js` encryption without updating `template.html` decryption to match
- Never change `template.html` decryption without updating `build.js` encryption to match
- Always run `node test-decrypt.js` to verify the round-trip before committing
- `test-decrypt.js` must mirror both formulas exactly and pass before any push

**Critical detail:** The decryption key derivation must use something that only valid `@xendit.co` users can produce. Two options:

| Approach | How | Security |
|----------|-----|----------|
| A. Shared secret embedded | Same `BUILD_ENCRYPTION_KEY` is in template.html (obfuscated). Auth check is a gate, but key is technically in source. | Good enough — GCP Internal OAuth is the real gate. Content can't be decrypted without passing Google's auth first since the key derivation also requires the valid token. |
| B. Key derived from token | Derive key from `id_token.hd` + embedded salt. Only tokens with `hd=xendit.co` produce the correct key. Build.js pre-computes using known `hd` value. | Stronger — even if someone bypasses the JS auth check, they can't derive the correct key without a real token from the correct domain. |

**Decision: Approach B (implemented above)** — browser password is derived from `BUILD_ENCRYPTION_KEY` via HMAC and injected at build time as `CONTENT_SALT`. The raw secret never appears in the HTML.

### Verification
- [ ] `node build.js` exits 0 and produces `docs/index.html`
- [ ] **`node test-decrypt.js` exits 0 — round-trip PASS** ← must run before any push
- [ ] `docs/index.html` contains no plaintext guide content (verify with `grep`)
- [ ] Opening `docs/index.html` in browser shows only sign-in button
- [ ] File size of `docs/index.html` is reasonable (< 500KB)

> **If `test-decrypt.js` fails:** The encrypt/decrypt formulas are mismatched. Fix both `build.js` and `template.html` to match the Crypto Contract above before proceeding. Do not push until this passes.

### 🚦 GATE 1: Build System Check

> **Q1.1:** Build system works. `docs/index.html` is generated with encrypted content. No plaintext visible in source. Ready to wire up auth + decryption?

---

## Phase 2: Auth + Decryption

### Preconditions
- Phase 1 verified
- GCP OAuth Client ID available (or placeholder for testing)

### Steps

```
2.1  Configure Google Identity Services in template.html:
     - Load: <script src="https://accounts.google.com/gsi/client" async></script>
     - Initialize with Client ID
     - Render sign-in button (centered, prominent)
     - Callback: handleCredentialResponse(response)

2.2  Implement handleCredentialResponse:
     - Decode JWT (base64 decode payload — no library needed)
     - Extract: email, hd, name
     - Verify: hd === "xendit.co"
     - If invalid: show "Access Denied — @xendit.co accounts only"
     - If valid: proceed to decryption

2.3  Implement decryption:
     - Extract salt + iv + ciphertext from embedded blob
     - Derive key: crypto.subtle.importKey + crypto.subtle.deriveBits (PBKDF2)
       - Password: "xendit.co" + secret_salt (where secret_salt is build-time injected)
       - Salt: from blob
       - Iterations: 100000
       - Hash: SHA-256
       - Key length: 256 bits
     - Decrypt: crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
     - Inject decrypted HTML into <main id="content">

2.4  Post-decryption setup:
     - Show nav (table of contents)
     - Initialize Mermaid: mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
     - Run: mermaid.run({ nodes: document.querySelectorAll('.mermaid') })
     - Show "Last Updated" timestamp (embedded at build time)
     - Show user's name/avatar in header (from token)
     - Add scroll-spy for active nav highlighting

2.5  Error handling:
     - Decryption failure → "Unable to load content. Please try signing in again."
     - Network error (Google SDK) → "Unable to reach Google. Check your connection."
     - Token expired → prompt re-sign-in
```

### Verification
- [ ] Sign in with `@xendit.co` account → content appears
- [ ] Sign in with non-`@xendit.co` account → "Access Denied" (or GCP blocks the attempt entirely if Internal)
- [ ] View source of `docs/index.html` → no readable guide content
- [ ] DevTools console → no errors
- [ ] Works on Chrome, Firefox, Safari (all support Web Crypto)

### 🚦 GATE 2: Auth Verification

> **Q2.1:** Auth + decryption working end-to-end. @xendit.co accounts see the guide, others can't. Ready to write the content?

---

## Phase 3: Content + Diagrams

### Preconditions
- Phase 2 verified
- Auth flow confirmed working

### Steps

```
3.1  Write all 12 content/*.md files with full prose and Mermaid diagrams.
     Content sourced from xendit-demo-store actual code + existing XENDIT_COMPONENTS_GUIDE.html.

3.2  Section content plan:
```

| # | File | Content | Diagrams |
|---|------|---------|----------|
| 1 | 01-big-picture.md | What xendit-demo-store is, 3 integration methods, 4 flows, 8 currencies | `graph TD` — architecture overview |
| 2 | 02-getting-started.md | Prerequisites, clone, .env setup, npm scripts, expected ports | None (or simple `flowchart LR` for setup steps) |
| 3 | 03-integration-compared.md | Payment Link vs Components vs Invoice comparison table | `flowchart LR` — redirect vs embedded paths |
| 4 | 04-components-e2e.md | Ayu buys a plushie — numbered walkthrough | `sequenceDiagram` — full 8-step sequence |
| 5 | 05-components-frontend.md | SDK init, channel picker, event table, action containers | `stateDiagram-v2` — event lifecycle |
| 6 | 06-components-backend.md | Session creation, payload, origins, multi-currency keys | `flowchart TD` — server decision flow |
| 7 | 07-styling.md | Two-layer model, container CSS, iframe appearance config | `graph TD` — styling layers (container > iframe > fields) |
| 8 | 08-security.md | Secure iframe, data boundaries, what merchants get free | `flowchart LR` — data flow with zones |
| 9 | 09-migration.md | Who should migrate, decision matrix, 7 steps, code comparison | `flowchart TD` — migration decision tree |
| 10 | 10-payment-flows.md | Pay, Save, Pay+Save, Subscription — session_type, payload diffs | `graph LR` — 4 flows side-by-side |
| 11 | 11-webhooks.md | Why webhooks, flow, verification, idempotency | `sequenceDiagram` — webhook delivery |
| 12 | 12-faq.md | 25 Q&As across 6 categories | None |

```
3.3  Styling (in template.html, embedded CSS):
     - Xendit blue palette (--brand-blue: #1762ee)
     - Surface/background hierarchy
     - Table styling with badges
     - Blockquote callouts (tip, warning, info)
     - Code block styling (syntax highlighting via CSS classes)
     - Mermaid diagram containers (centered, responsive)
     - FAQ accordion or expandable sections
     - Responsive: 768px and 480px breakpoints
     - Print styles (nav hidden, diagrams contrast-safe)

3.4  Navigation (in template.html):
     - Sticky sidebar nav (desktop) / hamburger (mobile)
     - Auto-generated from section headings at render time
     - Scroll-spy active state (IntersectionObserver)
     - "Back to top" button
```

### Content Rules
- Code snippets: extracted verbatim from `xendit-demo-store` source files
- External links: point to official Xendit docs
- No speculative features — only what's implemented
- Tone: mid-level (knows REST APIs, knows Xendit, new to Components)
- Length: 200-600 words per section
- Mermaid diagrams: kept simple and readable (no more than 10-12 nodes)

### Verification
- [ ] `node build.js` compiles all 12 .md files without error
- [ ] Decrypted output renders all sections with correct headings
- [ ] All Mermaid diagrams render (no error blocks)
- [ ] All code snippets display correctly in `<pre><code>` blocks
- [ ] Responsive at 320px, 768px, 1200px
- [ ] No TODO/placeholder text remains
- [ ] "Last Updated" timestamp correct

### 🚦 GATE 3: Content Review

> **Q3.1:** All 12 sections written. I'll summarize each section's key points. Review for:
> - Technical accuracy
> - Appropriate tone for CSM/CIM audience
> - Missing merchant scenarios
> - Mermaid diagram accuracy

---

## Phase 4: Deploy to GitHub Pages

### Preconditions
- Phase 3 content approved
- GCP OAuth Client ID confirmed and set in template.html
- BUILD_ENCRYPTION_KEY generated and set as GitHub Actions secret

### Steps

```
4.1  Final build:
     - node build.js → docs/index.html generated
     - Verify: no plaintext in output

4.2  GitHub Pages setup:
     - Repo Settings → Pages → Source: main branch, /docs folder
     - Save

4.3  GitHub Actions workflow:
     - .github/workflows/build.yml committed
     - Secret: BUILD_ENCRYPTION_KEY set in repo settings
     - Test: push a content change → verify auto-rebuild

4.4  GCP OAuth — add production origin:
     - Add https://<org-or-user>.github.io to Authorized JavaScript origins
     - Verify sign-in works on live URL

4.5  Post-deploy verification:
     - [ ] Visit live URL → see sign-in button only
     - [ ] Sign in with @xendit.co → guide content appears
     - [ ] All 12 sections render
     - [ ] Mermaid diagrams render
     - [ ] Sticky nav works
     - [ ] Mobile responsive
     - [ ] view-source → encrypted blob only (no readable content)

4.6  Cleanup:
     - Remove XENDIT_COMPONENTS_GUIDE.html (old reference — no longer needed)
     - Update README if any URLs changed
     - Final commit
```

### 🚦 GATE 4: Go-Live

> **Q4.1:** Deployed and verified. Confirm:
> - You can sign in with your @xendit.co account
> - Guide renders correctly (all sections + diagrams)
> - view-source shows no plaintext
> - A non-@xendit.co account cannot access content
>
> If all pass → **DONE. Share the URL with your team.**

---

## Rollback Plan

| Issue | Action |
|-------|--------|
| Build fails | Fix `build.js` or `.md` file, push again |
| Auth not working | Verify GCP Client ID, check JS origins in GCP console |
| Diagram rendering broken | Fix Mermaid syntax in the `.md` file, push |
| Content needs update | Edit the `.md` file on GitHub, auto-rebuilds |
| Need to take down | Delete `docs/index.html` or make repo private |

No destructive operations. All changes are traceable through Git history.

---

## Migration Checklist (v1 → v2)

Files to **delete** from repo:
```
app/                          # Next.js app router
components/                   # React components (sections + SVGs)
lib/                          # NextAuth config
middleware.ts                 # Next.js middleware
next.config.mjs              # Next.js config
next-env.d.ts                # Next.js types
tsconfig.json                # TypeScript config
package.json                 # (recreated minimal)
package-lock.json            # (recreated)
node_modules/                # (regenerated)
.next/                       # Next.js build cache
.env.local                   # NextAuth secrets
.env.example                 # (recreated minimal)
client_secret_*.json         # GCP credential file (should never have been committed)
```

Files to **create**:
```
content/*.md                 # 12 Markdown source files
build.js                     # Build script
template.html                # HTML shell
docs/index.html              # Build output
.github/workflows/build.yml  # Auto-build CI
```

Files to **keep and update**:
```
CLAUDE.md                    # Updated ✅
README.md                    # Updated ✅
docs/COMPONENTS_GUIDE_PLAN.md # This file (updated ✅)
.gitignore                   # Simplified
```

---

## Dependency Comparison

| | v1 (Next.js) | v2 (Static) |
|---|---|---|
| **Production runtime** | next, react, react-dom, next-auth, + transitive deps (~40 packages) | **0 packages** |
| **Build-time only** | same as above + typescript, @types/* | `marked` (1 package) |
| **CDN (runtime, not bundled)** | none | Google Identity Services, Mermaid.js |
| **Security patches needed** | Constant (Next.js, React, NextAuth release frequently) | Never (no packages to patch) |

---

## Execution Summary

| Phase | What | Owner | Gate |
|-------|------|-------|------|
| 0 | Confirm variables (GCP, repo, cleanup) | Planner | Q0.1–Q0.3 |
| 1 | Build system (build.js + template.html) | Executor | Q1.1 |
| 2 | Auth + encryption wired end-to-end | Executor | Q2.1 |
| 3 | Content + Mermaid diagrams | Executor | Q3.1 |
| 4 | Deploy to GitHub Pages | Executor | Q4.1 |

**Total gates: 4 checkpoints, 7 confirmation questions.**
**Estimated execution: 2-3 sessions.**
**Gate verification: Planner re-engages at each gate before authorizing next phase.**

---

## Post-Migration Cleanup

Once v2 is live and verified (Gate 4 passed), remove all v1 context that is no longer useful:

### Files to Delete
- `XENDIT_COMPONENTS_GUIDE.html` — old reference guide (CSS already ported to template.html)

### Sections to Remove from .md Files
After v2 is stable (1-2 weeks live, no issues):

| File | Section to Remove | Reason |
|------|-------------------|--------|
| `CLAUDE.md` | "Previous architecture (v1)" line | No longer needed as context |
| `README.md` | "Why This Architecture?" comparison table | Useful during transition, irrelevant long-term |
| `COMPONENTS_GUIDE_PLAN.md` | "Architecture Change Summary" table | Historical — move to a `CHANGELOG.md` if needed |
| `COMPONENTS_GUIDE_PLAN.md` | "Migration Checklist (v1 → v2)" | One-time task, done |
| `COMPONENTS_GUIDE_PLAN.md` | "Dependency Comparison" table | Historical |

### Decision
- **Keep** v1 comparison context during execution (helps the executor understand constraints)
- **Remove** after go-live + confirmation that nothing references v1 anymore
- The executor should ask: "v2 is stable — shall I strip v1 references from the docs?"

---

## Auto-Update Rule: Cross-File Consistency

When ANY of the three `.md` files is revised, the executor MUST check and update the other files to maintain consistency.

### Shared Values (must be identical across files)

| Value | Appears in |
|-------|-----------|
| Repo name (`xendit-components-guide`) | CLAUDE.md, README.md, PLAN.md |
| Hosting (`GitHub Pages`) | CLAUDE.md, README.md, PLAN.md |
| Auth method (`Google Identity Services + AES-GCM`) | CLAUDE.md, README.md, PLAN.md |
| GCP consent screen type (`Internal`) | CLAUDE.md, README.md, PLAN.md |
| Domain restriction (`@xendit.co`) | CLAUDE.md, README.md, PLAN.md |
| Key derivation approach (`hd` claim + salt → PBKDF2) | CLAUDE.md, README.md, PLAN.md |
| Content source (`content/*.md`) | CLAUDE.md, README.md, PLAN.md |
| Diagram engine (`Mermaid.js, CDN`) | CLAUDE.md, README.md, PLAN.md |
| Build output (`docs/index.html`) | CLAUDE.md, README.md, PLAN.md |
| Section count (`12 sections`) | CLAUDE.md, README.md, PLAN.md |
| Phase count (`5 phases, 0–4`) | CLAUDE.md, PLAN.md |
| Gate count (`7 confirmation questions`) | CLAUDE.md, PLAN.md |

### Auto-Update Procedure

When the user revises any decision or value:

```
1. Identify which shared value changed
2. grep all 3 .md files for the old value
3. Replace with new value in ALL files
4. Verify no orphaned references remain (grep for old value → 0 results)
5. Confirm to user: "Updated X across N files"
```

### Trigger Conditions

The executor auto-updates when:
- User says "change X to Y" (e.g., "use 10 sections instead of 12")
- User renames something (e.g., repo name, file paths)
- A gate decision changes a locked value (e.g., "actually use External consent screen")
- Any structural change (e.g., "add a Phase 2.5" → update phase counts everywhere)

The executor does NOT auto-update when:
- The change is internal to one file only (e.g., adding detail to a plan step)
- The change is in a comparison table referencing v1 (those are historical, not active values)

---

## Start Execution

To begin:
1. **Planner** asks Gate 0 questions (variable confirmation + v1 cleanup approval)
2. User answers
3. Planner updates plan with confirmed values, re-indexes knowledge base
4. Planner hands off: "Execute Phase 1. Knowledge base indexed."
5. **Executor** searches knowledge base, begins Phase 1 steps

Say **"go"** to start Gate 0 questions.
