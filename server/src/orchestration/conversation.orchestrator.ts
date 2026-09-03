import type {
  ClassroomState,
  StudentIntent,
  TeachingState,
  TutorAction,
  VisualPlan,
  ClientAssessmentQuestion,
} from '@ai-tutor/shared';
import type { ConversationContext, OrchestratedTurnResult, TurnIdentity } from './conversation.types.js';
import { defaultIntentRouter, IntentRouter } from './intent.router.js';
import { defaultTurnManager, ClassroomTurnManager } from './turn.manager.js';
import { defaultContextBuilder, ContextBuilder } from './context.builder.js';
import { defaultEventEmitter, ClassroomEventEmitter } from './classroom.events.js';
import { defaultReplayService, ReplayService } from '../memory/replay.service.js';
import { defaultSessionMemoryService, SessionMemoryService } from '../memory/session-memory.service.js';

export interface ProcessTurnInput {
  sessionId: string;
  userId: string;
  message: string;
  targetLanguage?: 'english' | 'hindi' | 'hinglish';
}

export class ConversationOrchestrator {
  constructor(
    private intentRouter: IntentRouter = defaultIntentRouter,
    private turnManager: ClassroomTurnManager = defaultTurnManager,
    private contextBuilder: ContextBuilder = defaultContextBuilder,
    private eventEmitter: ClassroomEventEmitter = defaultEventEmitter,
    private replayService: ReplayService = defaultReplayService,
    private sessionMemoryService: SessionMemoryService = defaultSessionMemoryService
  ) {}

  /**
   * Fast intent pre-check before starting expensive LLM/orchestration calls.
   */
  classifyIntent(message: string, isAssessing: boolean = false): StudentIntent {
    return this.intentRouter.classifyIntent(message, isAssessing);
  }

  /**
   * Initializes a fresh turn with authoritative turnId & generation.
   * Cancels prior turns for the session.
   */
  startTurn(sessionId: string): TurnIdentity {
    const turn = this.turnManager.startNewTurn(sessionId);
    this.eventEmitter.emitTutorEvent('STUDENT_INPUT_FINALIZED', sessionId, turn.turnId);
    return turn;
  }

  /**
   * Checks if an asynchronous task belongs to the currently active turn.
   */
  isTurnValid(sessionId: string, turnId: string): boolean {
    return this.turnManager.isTurnValid(sessionId, turnId);
  }

  /**
   * Atomic barge-in / interruption: immediately halts ongoing turn.
   */
  handleInterruption(sessionId: string): void {
    const prev = this.turnManager.interruptSession(sessionId);
    if (prev) {
      this.eventEmitter.emitTutorEvent('TUTOR_INTERRUPTED', sessionId, prev.turnId);
    }
  }

  /**
   * Builds compact conversation context for teaching turn.
   */
  async getContext(sessionId: string): Promise<ConversationContext | null> {
    return this.contextBuilder.buildContext(sessionId);
  }

  /**
   * Handles deterministic replay requests directly without calling the LLM.
   */
  async handleReplayRequest(sessionId: string, turnId: string): Promise<OrchestratedTurnResult | null> {
    this.turnManager.setSessionState(sessionId, 'REPLAYING');
    this.eventEmitter.emitTutorEvent('REPLAY_STARTED', sessionId, turnId);

    const lastSeg = await this.sessionMemoryService.getLastExplainedConcept(sessionId);
    if (!lastSeg) return null;

    const replay = await this.replayService.replaySegment(lastSeg.segmentId);
    if (!replay) return null;

    this.turnManager.setSessionState(sessionId, 'SPEAKING');

    return {
      turnId,
      intent: 'REPLAY',
      route: 'REPLAY',
      state: 'SPEAKING',
      tutorAction: { type: 'REPLAY_EXPLANATION', reason: 'student_requested_replay' },
      speechText: replay.speechText,
      displayText: replay.displayText,
      captionText: replay.captionText,
      visual: replay.visualBeats?.[0] ? { type: replay.visualBeats[0].type, data: replay.visualBeats[0].data } : undefined,
      visualBeats: replay.visualBeats,
      teachingState: {
        currentConcept: replay.concept,
        understanding: 'developing',
        confidence: 0.8,
        misconceptions: [],
        conceptsMastered: [],
        conceptsNeedingWork: [],
        lastStudentAction: 'request_explanation',
        recommendedNextAction: 'advance',
      },
      isDeterministicReplay: true,
      message: `Replaying explanation for ${replay.concept}`,
    };
  }

  /**
   * Handles "What did we learn?" queries using structured SessionMemory without LLM hallucination.
   */
  async handleSessionMemoryQuery(sessionId: string, turnId: string): Promise<OrchestratedTurnResult> {
    const memory = await this.sessionMemoryService.getSessionMemory(sessionId);
    const concepts = memory.conceptsCovered.length > 0 ? memory.conceptsCovered.join(', ') : memory.topic;

    const speech = `So far today, we have covered: ${concepts}. Let me know if you would like to revisit any of them or continue forward!`;
    const display = `Session Summary: Concepts covered so far include: ${concepts}.`;

    return {
      turnId,
      intent: 'FOLLOW_UP',
      route: 'SESSION_MEMORY',
      state: 'SPEAKING',
      tutorAction: { type: 'CONTINUE_TEACHING' },
      speechText: speech,
      displayText: display,
      visual: {
        type: 'RECAP',
        data: {
          title: 'Session Concepts',
          bullets: memory.conceptsCovered.map((c) => `• ${c}`),
        },
      },
      teachingState: {
        currentConcept: memory.conceptsCovered[memory.conceptsCovered.length - 1] || memory.topic,
        understanding: 'developing',
        confidence: 0.8,
        misconceptions: [],
        conceptsMastered: memory.conceptsCovered,
        conceptsNeedingWork: [],
        lastStudentAction: 'question',
        recommendedNextAction: 'advance',
      },
    };
  }
}

export const defaultConversationOrchestrator = new ConversationOrchestrator();
