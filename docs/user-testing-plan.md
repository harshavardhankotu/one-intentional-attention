# ONE — User Testing & Behavioral Validation Plan

## 1. Primary Hypothesis & North Star
> **Primary Hypothesis:** "If a person consciously defines what matters right now, a context-aware intervention can help them return to that intention when they drift."

* **North Star Metric:** % of session time spent on chosen intention.
* **Secondary Metrics:** Recovery latency speed (seconds to return), intentional exception compliance, subjective annoyance score (1–10).

---

## 2. Participant Cohort (10–20 Users)
* **Cohort Profile:**
  * 5 Software Engineers / Founders
  * 5 University / Exam Preparation Students
  * 5 Knowledge Workers / Writers / Researchers
* **Inclusion Criteria:** Self-reported difficulty with automatic habit loops (e.g. reflexively opening YouTube, Instagram, Reddit while working).

---

## 3. Test Scenarios

### Scenario A: High-Stakes Focus Session
* **Task:** Define a specific 45-minute technical goal (*"Implement authentication middleware"*).
* **Intervention Test:** Intentionally attempt to open a habitual distraction. Observe the Intent Firewall prompt (*"WAIT. You said: [Goal]"*). Choose *"I got distracted"*.
* **Measure:** Did the prompt feel judgmental? How quickly did the user refocus?

### Scenario B: Legitimate Research Need (Intentional Exception)
* **Task:** During a session, user needs to search API documentation on an otherwise distracting site (e.g. YouTube tutorial or StackOverflow).
* **Intervention Test:** Select *"I have a specific reason"* and activate a 2-minute timed pass.
* **Measure:** Did the countdown banner provide sufficient clarity without causing anxiety? Did the user return when the pass expired?

### Scenario C: Intrusive Thought Offloading (Distraction Inbox)
* **Task:** When an unrelated idea strikes (*"Need to buy airline tickets"*), press `S` or `Cmd+K` and save to the Distraction Inbox.
* **Measure:** Did this relieve mental pressure (Zeigarnik effect) without derailing the session?

### Scenario D: Mid-Day Fatigue (Focus Rescue)
* **Task:** User has procrastinated for 3 hours and feels their day is lost. Click *"Rescue Me"*.
* **Measure:** Did the empathetic reset message (*"You haven't lost the day"*) restore motivation?

---

## 4. Qualitative Interview Script
1. **Perception of Control:** *"Did ONE feel like a supportive ally or a restrictive jailer?"*
2. **Annoyance vs. Value:** *"On a scale of 1–10, how intrusive was the Intent Firewall when you drifted?"*
3. **Compassion Assessment:** *"How did it feel when you drifted? Did you experience guilt, or did you feel encouraged to restart?"*
4. **Outcome Value:** *"Did answering 'What did you accomplish?' feel more meaningful than seeing total screen time?"*
5. **Voluntary Re-use:** *"Would you voluntarily open ONE tomorrow morning before starting work?"*

---

## 5. Quantitative Analytics (Processed 100% On-Device)
* Session Start Rate (% of app opens that initiate a session).
* Session Completion Rate (% of sessions completed without abandonment).
* Distraction Attempt Count per hour.
* Distraction Return Rate (% of drifts that return to goal).
* Average Recovery Latency (seconds from drift prompt to resume).
