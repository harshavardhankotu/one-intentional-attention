# ONE — Security Model

## 1. Security Architecture
As an application handling intimate personal goals and thoughts, ONE employs strict defense-in-depth principles.

---

## 2. Threat Modeling & Mitigation

| Threat | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- |
| **XSS (Cross-Site Scripting)** | High | Strict React JSX auto-escaping, Content Security Policy (CSP) blocking inline scripts and unauthorized network origins, no `dangerouslySetInnerHTML`. |
| **Local Storage Tampering** | Low | IndexedDB with schema validation via Zod / TypeScript runtime checks; optional Web Crypto API AES-GCM password-based encryption at rest. |
| **Data Leakage via Telemetry** | High | Zero telemetry endpoints configured. Network requests are restricted to local loopback and authorized sync relays (if user explicitly activates optional sync). |
| **Dependency Vulnerabilities** | Medium | Automated dependency auditing (`npm audit`), pinning exact semantic versions, avoiding unvetted third-party libraries. |
| **Denial of Service / UI Freeze** | Medium | Heavy calculations (e.g. historical pattern clustering) offloaded to Web Workers; UI thread kept responsive. |

---

## 3. Cryptographic Standards
* When optional local-at-rest encryption is activated:
  * Algorithm: **AES-256-GCM** via Web Crypto API.
  * Key Derivation: **PBKDF2** with 100,000 iterations of SHA-256 and unique 16-byte salt per database instance.
