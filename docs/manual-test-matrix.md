# ONE — Manual Test Matrix & Verification Protocols

| ID | Feature Area | Scenario | Steps to Execute | Expected Result | Platform |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Onboarding | First-time launch | Clear `localStorage`, launch app. | 3-slide philosophy walkthrough displays; completes and persists `one_onboarding_completed`. | Desktop / Mobile |
| **TC-02** | Intention Setup | Goal creation & duration | Enter goal "Study DSA", select 25m, Level 3, click "Enter ONE THING Mode". | Enters ONE THING MODE; starts timer at 25:00; plays gentle start cue. | Desktop / Mobile |
| **TC-03** | Precision Timer | Background tab throttling | Start 15m session, switch to another browser tab for 2 minutes, switch back. | Timer shows ~13:00 remaining with zero lag; reconciles wall-clock timestamps. | Chrome / Edge / Firefox |
| **TC-04** | Pause / Resume | Mid-session pause | Press Space or click "Pause", wait 30s, click "Resume". | Timer stops counting; resumes without losing time or adding paused time to focus elapsed. | Desktop |
| **TC-05** | Intent Firewall | Distraction recovery | Click "Drift Check" (or navigate to blocked site in extension). Select "I got distracted". | Displays non-judgmental prompt; logs recovery duration; returns to focus. | Desktop / Mobile |
| **TC-06** | Intent Firewall | Timed exception pass | Click "Drift Check" -> "I have a specific reason" -> Select reason -> Start 2m pass. | Displays amber 2m exception banner with countdown; returns to focus at expiry. | Desktop / Mobile |
| **TC-07** | Distraction Inbox | Rapid cognitive offload | Press `S` or `Cmd+K`, type "Buy groceries", press Enter. | Thought is saved to inbox; dialog closes immediately; returns to focus in < 2 seconds. | Desktop / Mobile |
| **TC-08** | Focus Rescue | Mid-day procrastination reset | Click "Rescue Me" from setup or toolbar, select 30m, click "Start Clean Reset". | Starts fresh session immediately with zero guilt and no streak loss. | Desktop / Mobile |
| **TC-09** | Session Recovery | Page reload during session | Start session, let it run 20s, refresh browser (F5). | Displays "You had a focus session in progress"; offers Resume / Finish / Discard. | Desktop / Mobile |
| **TC-10** | Session Completion | Tangible outcome capture | Let session finish or click "Finish", enter outcome "Built auth middleware", rate "Deep Focus". | Saves outcome; updates attention dashboard metrics; clears active session. | Desktop / Mobile |
| **TC-11** | Data Sovereignty | Full JSON Export & Import | In Attention Dashboard, click "Export JSON", verify file, click "Wipe Data", import file back. | Restores all intentions, sessions, and outcomes with zero data loss. | Desktop |
| **TC-12** | Browser Extension | Real domain interception | Install extension from `extension/`, visit `youtube.com` while session active. | Injects in-page Intent Firewall overlay; grants 2m exception or redirects back. | Chrome / Edge (MV3) |
