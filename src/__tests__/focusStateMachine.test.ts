import { describe, it, expect } from 'vitest';
import {
  transitionFocusState,
  canTransition,
  StateTransitionError
} from '../services/focusStateMachine';
import { SessionStatus } from '../types';

describe('ONE — Focus State Machine Formal Verification', () => {
  it('should transition through standard focus lifecycle correctly', () => {
    let state: SessionStatus = 'idle';

    // Start
    state = transitionFocusState(state, { type: 'START_SESSION' });
    expect(state).toBe('focusing');

    // Pause
    state = transitionFocusState(state, { type: 'PAUSE' });
    expect(state).toBe('paused');

    // Resume
    state = transitionFocusState(state, { type: 'RESUME' });
    expect(state).toBe('focusing');

    // Interruption
    state = transitionFocusState(state, { type: 'TRIGGER_INTERRUPT' });
    expect(state).toBe('interrupted');

    // Recovery
    state = transitionFocusState(state, { type: 'RESOLVE_RECOVERY' });
    expect(state).toBe('recovered');

    // Return to focus
    state = transitionFocusState(state, { type: 'RESUME' });
    expect(state).toBe('focusing');

    // Prompt completion
    state = transitionFocusState(state, { type: 'PROMPT_COMPLETION' });
    expect(state).toBe('completing');

    // Submit outcome
    state = transitionFocusState(state, { type: 'COMPLETE' });
    expect(state).toBe('completed');
  });

  it('should handle Intentional Exception lifecycle', () => {
    let state: SessionStatus = 'focusing';

    state = transitionFocusState(state, { type: 'TRIGGER_INTERRUPT' });
    expect(state).toBe('interrupted');

    state = transitionFocusState(state, { type: 'GRANT_EXCEPTION' });
    expect(state).toBe('exception');

    state = transitionFocusState(state, { type: 'EXPIRE_EXCEPTION' });
    expect(state).toBe('focusing');
  });

  it('should reject invalid transitions and throw StateTransitionError', () => {
    // Cannot pause from idle
    expect(() => {
      transitionFocusState('idle', { type: 'PAUSE' });
    }).toThrow(StateTransitionError);

    // Cannot grant exception directly from focusing without an interruption
    expect(() => {
      transitionFocusState('focusing', { type: 'GRANT_EXCEPTION' });
    }).toThrow(StateTransitionError);

    // Cannot resume when already focusing
    expect(() => {
      transitionFocusState('focusing', { type: 'RESUME' });
    }).toThrow(StateTransitionError);
  });

  it('should correctly query canTransition without throwing', () => {
    expect(canTransition('idle', 'START_SESSION')).toBe(true);
    expect(canTransition('idle', 'PAUSE')).toBe(false);
    expect(canTransition('focusing', 'TRIGGER_INTERRUPT')).toBe(true);
    expect(canTransition('interrupted', 'GRANT_EXCEPTION')).toBe(true);
  });
});
