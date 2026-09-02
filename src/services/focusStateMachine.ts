import { SessionStatus } from '../types';

export type FocusEvent =
  | { type: 'START_SESSION' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TRIGGER_INTERRUPT' }
  | { type: 'RESOLVE_RECOVERY' }
  | { type: 'GRANT_EXCEPTION' }
  | { type: 'EXPIRE_EXCEPTION' }
  | { type: 'START_BREAK' }
  | { type: 'END_BREAK' }
  | { type: 'PROMPT_COMPLETION' }
  | { type: 'COMPLETE' }
  | { type: 'CANCEL' }
  | { type: 'RESCUE' }
  | { type: 'RESTORE'; status: SessionStatus };

export class StateTransitionError extends Error {
  constructor(public from: SessionStatus, public event: string) {
    super(`Invalid focus state transition: cannot process '${event}' from state '${from}'`);
    this.name = 'StateTransitionError';
  }
}

/**
 * Transition Table defining valid next states
 */
const TRANSITION_TABLE: Record<SessionStatus, Partial<Record<FocusEvent['type'], SessionStatus>>> = {
  idle: {
    START_SESSION: 'focusing',
    RESCUE: 'focusing',
    RESTORE: 'focusing', // overridden dynamically by payload
  },
  focusing: {
    PAUSE: 'paused',
    TRIGGER_INTERRUPT: 'interrupted',
    START_BREAK: 'break',
    PROMPT_COMPLETION: 'completing',
    CANCEL: 'cancelled',
    RESCUE: 'focusing',
  },
  paused: {
    RESUME: 'focusing',
    CANCEL: 'cancelled',
    RESCUE: 'focusing',
  },
  break: {
    END_BREAK: 'focusing',
    TRIGGER_INTERRUPT: 'interrupted',
    CANCEL: 'cancelled',
    RESCUE: 'focusing',
  },
  interrupted: {
    RESOLVE_RECOVERY: 'recovered',
    GRANT_EXCEPTION: 'exception',
    CANCEL: 'cancelled',
    RESCUE: 'focusing',
  },
  recovered: {
    RESUME: 'focusing',
    PAUSE: 'paused',
    START_BREAK: 'break',
    PROMPT_COMPLETION: 'completing',
    CANCEL: 'cancelled',
  },
  exception: {
    EXPIRE_EXCEPTION: 'focusing',
    TRIGGER_INTERRUPT: 'interrupted',
    PROMPT_COMPLETION: 'completing',
    CANCEL: 'cancelled',
    RESCUE: 'focusing',
  },
  completing: {
    COMPLETE: 'completed',
    CANCEL: 'cancelled',
  },
  completed: {
    START_SESSION: 'focusing',
    RESCUE: 'focusing',
  },
  cancelled: {
    START_SESSION: 'focusing',
    RESCUE: 'focusing',
  },
};

/**
 * Pure transition function for the Focus Engine
 */
export function transitionFocusState(current: SessionStatus, event: FocusEvent): SessionStatus {
  if (event.type === 'RESTORE') {
    return event.status;
  }

  const allowedNext = TRANSITION_TABLE[current]?.[event.type];
  if (!allowedNext) {
    throw new StateTransitionError(current, event.type);
  }

  return allowedNext;
}

/**
 * Validation check to test if a transition is legal without throwing
 */
export function canTransition(current: SessionStatus, eventType: FocusEvent['type']): boolean {
  if (eventType === 'RESTORE') return true;
  return Boolean(TRANSITION_TABLE[current]?.[eventType]);
}
