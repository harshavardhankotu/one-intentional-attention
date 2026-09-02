# ONE — Architectural Decision Log (ADR)

## ADR-001: Selection of React 19 + TypeScript + Vite + Tailwind CSS
* **Context:** Need ultra-responsive, lightweight, maintainable frontend architecture with sub-second launch times.
* **Decision:** Use React 19 with Vite, TypeScript for type safety, and Tailwind CSS for custom calm design tokens.
* **Consequences:** Near-instant hot reload, tiny production bundle (< 150KB gzip), easy compilation to PWA/desktop.

## ADR-002: Local-First Storage with IndexedDB (Dexie.js)
* **Context:** Principle 6 mandates "Privacy by Design" and zero cloud surveillance of user thoughts.
* **Decision:** Store all sessions, intentions, drift records, and distraction notes on-device using IndexedDB with Dexie.js wrapper and memory fallback.
* **Consequences:** Completely offline capable; zero data leaks; users have 100% data sovereignty.

## ADR-003: Synthesized Audio via Web Audio API
* **Context:** Need calming harmonic chimes and ambient focus sounds without large MP3 assets or external network calls.
* **Decision:** Synthesize sine/bell frequencies (528 Hz, 660 Hz) programmatically in Web Audio API.
* **Consequences:** Instant audio playback with zero network latency or bandwidth cost.

## ADR-004: Intentional Exception Model Over Strict Blocking
* **Context:** Traditional blockers force users into workarounds or resentment when legitimate needs arise.
* **Decision:** Build the Intent Firewall around contextual dialogues ("WAIT. You said: [Goal]") and time-boxed 2m/5m exception passes.
* **Consequences:** Reduces psychological reactance; empowers intentionality.
