import { EventEmitter } from 'events';
import type { TutorEvent, TutorEventType } from '@ai-tutor/shared';

export class ClassroomEventEmitter extends EventEmitter {
  emitTutorEvent(
    type: TutorEventType,
    sessionId: string,
    turnId?: string,
    payload?: Record<string, any>
  ): TutorEvent {
    const event: TutorEvent = {
      type,
      sessionId,
      turnId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.emit('classroom_event', event);
    this.emit(`session:${sessionId}`, event);
    return event;
  }
}

export const defaultEventEmitter = new ClassroomEventEmitter();
