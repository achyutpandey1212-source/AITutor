import React from 'react';
import { LiveTheaterPage } from '../theater/LiveTheaterPage';

export interface TutorPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
  initialSessionId?: string;
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
}

/**
 * TutorPage — Phase 3A Redesigned Live Theater Experience
 * Delegates to LiveTheaterPage for the serene, single-surface private AI classroom.
 */
export const TutorPage: React.FC<TutorPageProps> = (props) => {
  return <LiveTheaterPage {...props} />;
};

export default TutorPage;
