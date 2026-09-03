import type { ClassroomState } from '@ai-tutor/shared';
import type { TurnIdentity } from './conversation.types.js';

export class ClassroomTurnManager {
  private activeTurns: Map<string, TurnIdentity> = new Map();
  private sessionStates: Map<string, ClassroomState> = new Map();
  private generationCounters: Map<string, number> = new Map();

  /**
   * Generates a new authoritative turn ID and increments the generation counter.
   * Automatically invalidates any existing active turn for the session.
   */
  startNewTurn(sessionId: string): TurnIdentity {
    const nextGen = (this.generationCounters.get(sessionId) || 0) + 1;
    this.generationCounters.set(sessionId, nextGen);

    const turnId = `turn_${sessionId}_g${nextGen}_${Date.now().toString(36)}`;
    const identity: TurnIdentity = {
      turnId,
      sessionId,
      generation: nextGen,
      createdAt: Date.now(),
    };

    this.activeTurns.set(sessionId, identity);
    this.sessionStates.set(sessionId, 'THINKING');
    return identity;
  }

  /**
   * Checks whether a given turn is still authoritative for its session.
   * Returns false if the student interrupted or a newer turn started.
   */
  isTurnValid(sessionId: string, turnId: string): boolean {
    const current = this.activeTurns.get(sessionId);
    return Boolean(current && current.turnId === turnId);
  }

  /**
   * Barge-in handler: instantly invalidates the active turn for the session.
   */
  interruptSession(sessionId: string): TurnIdentity | null {
    const prev = this.activeTurns.get(sessionId) || null;
    this.activeTurns.delete(sessionId);
    this.sessionStates.set(sessionId, 'INTERRUPTED');
    return prev;
  }

  /**
   * Updates the live state machine state for a session.
   */
  setSessionState(sessionId: string, state: ClassroomState): void {
    this.sessionStates.set(sessionId, state);
  }

  /**
   * Gets current state of a session.
   */
  getSessionState(sessionId: string): ClassroomState {
    return this.sessionStates.get(sessionId) || 'IDLE';
  }

  /**
   * Cleans up resources when a session ends.
   */
  clearSession(sessionId: string): void {
    this.activeTurns.delete(sessionId);
    this.sessionStates.delete(sessionId);
    this.generationCounters.delete(sessionId);
  }
}

export const defaultTurnManager = new ClassroomTurnManager();
