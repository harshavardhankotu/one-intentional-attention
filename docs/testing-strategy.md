# ONE — Testing Strategy & Quality Gates

## 1. Testing Philosophy
Every feature must be verified against:
1. **Behavioral Integrity:** Does the state machine prevent invalid state transitions (e.g. starting a session while already focusing)?
2. **Timing Accuracy:** Does background tab switching degrade timer precision?
3. **Data Durability:** Do sessions and distraction notes persist across page reloads?
4. **Accessibility:** Can the core vertical slice be completed using only a keyboard?

---

## 2. Test Pyramid
* **Unit Tests (Vitest):**
  * Focus Engine state transitions (`idle`, `focusing`, `intercepted`, `exception`, `completed`).
  * Recovery latency calculation accuracy.
  * Storage CRUD, export, and wipe operations.
* **Component / UI Tests:**
  * Timer rendering and progress calculation.
  * Intent Firewall modal user choice flows.
  * Distraction Inbox input and list management.
* **Verification Gates:**
  * `npm test`: Run all unit and integration tests.
  * `npm run build`: Typecheck (`tsc --noEmit`) and Vite production bundle.
