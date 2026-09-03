import type { StudentIntent } from '@ai-tutor/shared';

export class IntentRouter {
  /**
   * Fast, zero-LLM intent classification heuristics to instantly route turns.
   */
  classifyIntent(message: string, isAssessing: boolean = false): StudentIntent {
    const raw = (message || '').trim().toLowerCase();
    if (!raw) return 'UNKNOWN';

    // 1. Session controls / Barge-in cues
    if (/^(stop|pause|wait a sec|hold on|wait wait|hold up|cancel)$/i.test(raw)) {
      return 'PAUSE';
    }
    if (/^(resume|continue|keep going|carry on|let's continue)$/i.test(raw)) {
      return 'RESUME';
    }
    if (/^(end session|finish class|goodbye|bye tutor|exit)$/i.test(raw)) {
      return 'END_SESSION';
    }

    // 2. Active Assessment Context
    if (isAssessing) {
      if (/^(give up|show solution|idk|i don't know|dont know|skip|pass)$/i.test(raw)) {
        return 'SKIP';
      }
      return 'ANSWER';
    }

    // 3. Requesting Formal Assessment
    if (
      /(quiz me|test me|give me (a |an )?(question|problem|mcq)|test my understanding|can you test me|ready for a question)/i.test(
        raw
      )
    ) {
      return 'ASSESSMENT';
    }

    // 4. Replay vs Re-explain
    // Replay: wants the exact previous explanation/formula/diagram replayed
    const isReplay =
      /(explain (that|it|this|the .*) again|show (me )?(that|the) (previous|earlier)?\s*(diagram|formula|slide|visual)?\s*again|repeat (what you said|that|this)|go over that (once more|again)|say that again)/i.test(
        raw
      ) && !/differently|another way|different way/i.test(raw);

    if (isReplay) {
      return 'REPLAY';
    }

    // Re-explain: wants a new explanation/perspective
    if (
      /differently|another way|different way|explain (it |that )?again differently|still don't understand/i.test(
        raw
      )
    ) {
      return 'RE_EXPLAIN';
    }

    // 5. Session Memory Queries
    if (
      /what did we learn|summarize what we covered|what concepts did we (do|study|cover)|recap the session/i.test(
        raw
      )
    ) {
      return 'FOLLOW_UP'; // Handled via SessionMemory route in orchestrator
    }

    // 6. Clarifications & Follow-up questions (e.g., "what is the focal length?", "why is u negative?")
    if (/^(what's|what is the|why is|why does|how come|can you show|show me|give me an example|what does)/i.test(raw)) {
      return 'FOLLOW_UP';
    }

    if (/^(i don't understand|confused|what does that mean|meaning of)/i.test(raw)) {
      return 'CLARIFICATION';
    }

    // 7. Direct Teaching Requests
    if (
      /(teach me|explain|start with|what is|let's learn|bhai .* samjha|can you teach)/i.test(
        raw
      ) &&
      !raw.startsWith('why') &&
      !raw.startsWith('how')
    ) {
      return 'TEACH';
    }

    return 'QUESTION';
  }
}

export const defaultIntentRouter = new IntentRouter();
