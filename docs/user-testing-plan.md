# ONE — Beta Usability Testing Protocol & Real-World Validation

## 1. Objectives & Testing Philosophy
> **"One thing. Right now."**
> **Core Principle:** The participant must be able to use ONE autonomously without being coached through interactions. The facilitator observes natural behavior, friction points, and behavioral alignment.

---

## 2. Participant Cohort (5–10 Users)
* **Cohort Composition:**
  * 3 Software Engineers / Technical Builders
  * 3 Students / Exam Candidates
  * 2 Knowledge Workers / Researchers / Writers
* **Recruitment Criteria:** Individuals experiencing digital attention fragmentation who regularly lose focus to reflexive habit loops (opening social media, news, or video feeds during work).

---

## 3. Privacy Notice to Participants
> **100% On-Device Privacy Guarantee:**
> During this study, ONE will store your session goals, durations, and distraction notes purely inside your browser's local storage (IndexedDB). No analytics, telemetry, or personal browsing history is transmitted to any cloud server or third-party service. You retain 100% data ownership and may export or wipe all stored data at any time via the Attention Dashboard.

---

## 4. Participant Task Instructions (Self-Guided)

### Phase 1: Onboarding & Intention Creation
1. Open the ONE web application (`http://localhost:5173`).
2. Read the introductory onboarding slides and begin.
3. Formulate a genuine work, study, or creative goal you want to accomplish right now (25–45 minutes).
4. Optionally use the **Sharpen** button to turn vague goals into concrete actions.
5. Select an appropriate Protection Level (Levels 1 to 5) and enter **ONE THING Mode**.

### Phase 2: Protecting Focus & Offloading Stray Thoughts
6. Begin working on your chosen task.
7. If an unrelated thought, chore, or idea pops into your head during your session, use the **Save for Later** button (or press `S`) to capture it in your Distraction Inbox without leaving your focus zone.
8. If you need a mindful pause, activate a **5m Break**.

### Phase 3: Experiencing the Intent Firewall & Recovery
9. During your work, attempt to visit a known habit website (e.g. `youtube.com`, `reddit.com`, or any non-work site under Level 4).
10. Observe the Intent Firewall prompt.
11. Test the two primary pathways:
    * **Pathway A (Autopilot drift):** Click *"I got distracted — Return to Focus"*.
    * **Pathway B (Legitimate reference need):** Request a 2-minute Intentional Exception pass. Observe the countdown banner and return once the pass expires.

### Phase 4: Session Completion & Output Capture
12. When your focus period concludes, click **Finish**.
13. In the completion modal, record what you actually accomplished (User-Reported Deliverable) and rate your focus depth (`Deep`, `Moderate`, or `Distracted`).
14. Open the **Attention Insights Dashboard** and inspect your daily intentional minutes, recovery speed, and completed deliverables.

---

## 5. Facilitator Observation Checklist

| Checkpoint | What to Observe | Target Behavior | Red Flags (Friction) |
| :--- | :--- | :--- | :--- |
| **Onboarding** | Time spent on slides, confusion | Understands "Intent over restriction" in < 45s | Asks "What does this app do?" |
| **Intention Input** | Clarity of goal prompt | Enters goal and clicks Start immediately | Hesitates on Protection Level picker |
| **ONE THING Mode** | Visual orientation | Understands timer and central goal immediately | Clicks around looking for navigation |
| **Distraction Inbox** | Ease of cognitive offload | Offloads thought in < 10 seconds | Tab confusion or accidental exit |
| **Firewall Intercept** | Emotional reaction to prompt | Feels supported/reminded ("Oh, right") | Feels scolded, annoyed, or trapped |
| **Exception Pass** | Clarity of 2m timebox | Uses pass for quick lookup and returns | Gets trapped down a rabbit hole |
| **Completion Flow** | Deliverable input clarity | Enters completed outcome effortlessly | Confuses deliverable with original goal |

---

## 6. Post-Session Interview Questions

1. **Perception of Control:** *"Did ONE feel like an ally helping you protect your chosen time, or like an annoying restrictive blocker?"*
2. **Emotional Tone & Guilt:** *"When the Intent Firewall appeared, did you feel judged or shamed? How did the language feel compared to traditional blocking apps?"*
3. **Friction Assessment:** *"Was there any point where you felt stuck, confused, or frustrated by the controls?"*
4. **Value of Outcome Capture:** *"How did it feel to record what you actually finished instead of just seeing a screen-time chart?"*
5. **Protection Levels:** *"Did the difference between Level 3 (distraction block) and Level 4 (allow-list deep focus) make sense to you?"*
6. **Voluntary Adoption:** *"Would you use ONE tomorrow morning before starting your most important task?"*

---

## 7. Success Criteria & Critical Failure Criteria

### Success Criteria:
* $\ge 80\%$ of participants complete a focus session and record an accomplished outcome without facilitator intervention.
* $\ge 90\%$ of participants describe the Intent Firewall language as supportive or neutral rather than punitive.
* Average recovery latency from drift prompt to resume is $< 25$ seconds.
* Distraction Inbox offload takes $< 10$ seconds per thought.

### Critical Failure Criteria:
* Participant asks facilitator what they are supposed to do next after entering ONE THING mode.
* Participant reports feeling shamed, frustrated, or patronized by recovery messaging.
* Accidental blocking of work reference tools without a clear bypass or allow-list mechanism.
* Participant abandons session because controls felt unresponsive or confusing.

---

## 8. Participant Feedback & Bug Report Template

```markdown
### Participant ID: [e.g. P-01]
* **Cohort:** [Engineer / Student / Writer / Other]
* **Operating System & Browser:** [e.g. Windows 11 / Chrome 124]
* **Protection Level Tested:** [Level 1 / 2 / 3 / 4 / 5]
* **Session Duration:** [e.g. 25 min]

#### Ratings (1 to 5):
* Clarity of Purpose: [ ]
* Ease of Starting: [ ]
* Supportive Tone (No shame): [ ]
* Likelihood to Reuse: [ ]

#### Observations & Quotes:
* "..."

#### Friction Points Encountered:
1. ...

#### Feature Requests / Suggestions:
1. ...
```
