/**
 * ONE — Central Platform Configuration & Feature Flags
 */

export const CONFIG = {
  APP_NAME: 'ONE',
  TAGLINE: 'One thing. Right now.',
  VERSION: '0.1.0',

  DURATIONS: {
    PRESETS_MINUTES: [15, 25, 45, 60, 90] as const,
    DEFAULT_MINUTES: 45,
    MIN_MINUTES: 1,
    MAX_MINUTES: 480,
    BREAK_PRESETS_MINUTES: [5, 10, 15] as const,
    EXCEPTION_PRESETS_MINUTES: [2, 5] as const,
  },

  PROTECTION_LEVELS: {
    1: { title: 'Level 1: Reminder', desc: 'Gentle "Are you sure?" notification.' },
    2: { title: 'Level 2: Friction', desc: '5-second deliberate pause & intentionality prompt.' },
    3: { title: 'Level 3: Protected', desc: 'Standard Intent Firewall modal with timed exception passes.' },
    4: { title: 'Level 4: Deep Focus', desc: 'Strict allow-list mode; only permitted reference sites accessible.' },
    5: { title: 'Level 5: Hard Lock', desc: 'Strict enforcement requiring typed confirmation to exit.' },
  },

  FEATURE_FLAGS: {
    AI_COACH: true,
    BROWSER_EXTENSION_BRIDGE: true,
    OFFLINE_PWA: true,
    FOCUS_TOGETHER: false, // Experimental, peer-to-peer silent co-focus
  },

  STORAGE: {
    DB_NAME: 'OneAttentionDB',
    SCHEMA_VERSION: 1,
    ACTIVE_SESSION_KEY: 'one_active_session_state_v1',
  }
} as const;
